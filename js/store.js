// 플레이어 기록 저장
// - 내 기록은 항상 이 휴대폰(localStorage)에 저장됩니다.
// - Firebase가 설정되어 있으면 친구 코드 그룹으로 기록을 공유합니다.
//   공유되는 정보: 닉네임, 레벨, 잡은 몬스터 수 (위치 정보는 공유하지 않습니다)

import { CONFIG, firebaseEnabled } from './config.js';
import { RARITY, speciesById } from './monsters.js';
import { cleanName } from './safety.js';

// 친구 기록 속 이름에 나쁜 말이 있으면 가려서 보여 줌
function cleanPlayer(p) {
  const out = { ...p, name: cleanName(p.name) };
  if (p.buddy && typeof p.buddy === 'object') out.buddy = { ...p.buddy, nick: cleanName(p.buddy.nick, '') };
  return out;
}

const KEY = 'hansupgo.v1';
const FB = 'https://www.gstatic.com/firebasejs/10.12.2';

function uid() {
  return 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function defaultState() {
  return {
    id: uid(),
    name: '',
    color: '#3f8fd2',
    group: '',
    balls: CONFIG.startBalls,
    snacks: CONFIG.startSnacks,
    xp: 0,
    caught: {},        // speciesId -> { count, firstAt, bestSize }
    caughtSpawns: {},  // spawnId -> timestamp (같은 몬스터를 두 번 잡지 않도록)
    stopCooldowns: {}, // stopId -> timestamp
    specialDay: '',
    log: [],           // 최근 잡은 기록
    demo: false,
    buddy: null,       // 지금 짝꿍 (buddy.js)
    buddyBook: {},     // 예전 짝꿍들의 성장 기록
    materials: { leaf: 5, twig: 4, pebble: 2 }, // 방 꾸미기 재료 (처음 선물)
    furniture: {},     // 만든 가구 개수
    room: { wall: 'cream', floor: 'wood', slots: {} }, // 짝꿍 방 (room.js)
    themes: { cream: true, wood: true },
    gathered: {},      // 주운 재료 자리 -> timestamp
  };
}

export const store = {
  state: defaultState(),
  listeners: new Set(),

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.state = { ...defaultState(), ...JSON.parse(raw) };
    } catch { /* 저장소를 못 쓰는 환경이면 새로 시작 */ }
    this.prune();
    return this.state;
  },

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch { /* 무시 */ }
    this.listeners.forEach(fn => fn(this.state));
    remote.schedulePush(this.state);
  },

  onChange(fn) { this.listeners.add(fn); },

  prune() {
    const dayAgo = Date.now() - 24 * 3600 * 1000;
    for (const [k, t] of Object.entries(this.state.caughtSpawns)) {
      if (t < dayAgo) delete this.state.caughtSpawns[k];
    }
    for (const [k, t] of Object.entries(this.state.gathered || {})) {
      if (t < dayAgo) delete this.state.gathered[k];
    }
  },

  level() { return levelFromXp(this.state.xp); },

  speciesCount() { return Object.keys(this.state.caught).length; },

  totalCaught() {
    return Object.values(this.state.caught).reduce((n, c) => n + c.count, 0);
  },

  /** 잡기 성공 기록. 획득한 경험치를 돌려준다. */
  recordCatch(spawn) {
    const sp = speciesById[spawn.speciesId];
    const prev = this.state.caught[sp.id];
    const isNew = !prev;
    const gained = RARITY[sp.rarity].xp + (isNew ? 500 : 0);
    this.state.caught[sp.id] = {
      count: (prev?.count || 0) + 1,
      firstAt: prev?.firstAt || Date.now(),
      bestSize: Math.max(prev?.bestSize || 0, spawn.sizeCm),
    };
    this.state.caughtSpawns[spawn.id] = Date.now();
    this.state.xp += gained;
    this.state.log = [{ speciesId: sp.id, at: Date.now(), sizeCm: spawn.sizeCm }, ...this.state.log].slice(0, 30);
    this.save();
    remote.postFeed(this.state, sp.id, isNew);
    return { gained, isNew };
  },

  markFled(spawn) {
    this.state.caughtSpawns[spawn.id] = Date.now();
    this.save();
  },
};

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 400)) + 1;
}

export function xpForLevel(level) {
  return (level - 1) ** 2 * 400;
}

// ---------- 친구 공유 (Firebase Firestore) ----------

export const remote = {
  ready: false,
  error: '',
  uid: null,
  fs: null,
  db: null,
  pushTimer: null,
  lastSent: '',
  unsubs: [],
  players: [],
  feed: [],
  mail: [],      // 나에게 온 선물·방문 쪽지·같이 걷기 초대
  listeners: new Set(),

  async init() {
    if (!firebaseEnabled()) return false;
    try {
      const [{ initializeApp }, fs, auth] = await Promise.all([
        import(`${FB}/firebase-app.js`),
        import(`${FB}/firebase-firestore.js`),
        import(`${FB}/firebase-auth.js`),
      ]);
      const app = initializeApp(CONFIG.firebase);
      const a = auth.getAuth(app);
      const cred = await auth.signInAnonymously(a);
      this.uid = cred.user.uid;
      this.fs = fs;
      this.db = fs.getFirestore(app);
      this.ready = true;
      return true;
    } catch (e) {
      console.warn('친구 공유 연결 실패', e);
      this.error = '친구 공유 서버에 연결하지 못했습니다. 인터넷 연결과 Firebase 설정을 확인해 주세요.';
      return false;
    }
  },

  onChange(fn) { this.listeners.add(fn); },
  emit() { this.listeners.forEach(fn => fn(this)); },

  watchGroup(group) {
    this.unsubs.forEach(u => u());
    this.unsubs = [];
    this.players = [];
    this.feed = [];
    this.mail = [];
    if (!this.ready || !group) { this.emit(); return; }
    this.error = '';
    const { collection, onSnapshot, query, orderBy, limit } = this.fs;
    const base = ['groups', group];
    this.unsubs.push(onSnapshot(collection(this.db, ...base, 'players'), (snap) => {
      this.players = snap.docs.map(d => cleanPlayer({ uid: d.id, ...d.data() }));
      this.error = '';
      this.emit();
    }, (e) => { this.error = '친구 기록을 불러오지 못했습니다.'; console.warn(e); this.emit(); }));
    this.unsubs.push(onSnapshot(
      query(collection(this.db, ...base, 'feed'), orderBy('at', 'desc'), limit(25)),
      (snap) => { this.feed = snap.docs.map(d => { const f = d.data(); return { ...f, name: cleanName(f.name) }; }); this.emit(); },
      (e) => console.warn(e)));
    const { where } = this.fs;
    this.unsubs.push(onSnapshot(
      query(collection(this.db, ...base, 'mail'), where('to', '==', this.uid)),
      (snap) => { this.mail = snap.docs.map(d => { const m = { id: d.id, ...d.data() }; return { ...m, fromName: cleanName(m.fromName) }; }).sort((a, b) => (a.at || 0) - (b.at || 0)); this.emit(); },
      (e) => console.warn('우편함', e)));
  },

  /** 친구에게 우편 보내기 (선물, 텃밭 물 주기, 방문 쪽지, 같이 걷기 초대) */
  async sendMail(state, to, data) {
    if (!this.ready || !state.group || !to || to === this.uid) return false;
    const { collection, addDoc } = this.fs;
    try {
      await addDoc(collection(this.db, 'groups', state.group, 'mail'), {
        ...data, to, from: this.uid, fromName: state.name.slice(0, 12), at: Date.now(),
      });
      return true;
    } catch (e) { console.warn('우편 보내기 실패', e); return false; }
  },

  async deleteMail(state, id) {
    if (!this.ready || !state.group) return;
    const { doc, deleteDoc } = this.fs;
    this.mail = this.mail.filter(m => m.id !== id);
    try { await deleteDoc(doc(this.db, 'groups', state.group, 'mail', id)); } catch (e) { console.warn(e); }
    this.emit();
  },

  // 친구 화면에 보이는 내용만 뽑는다 (숲볼·간식 개수는 공유하지 않음)
  shared(state) {
    const caught = Object.fromEntries(Object.entries(state.caught).map(([k, v]) => [k, v.count]));
    return {
      name: state.name.slice(0, 12),
      color: state.color,
      xp: state.xp,
      level: levelFromXp(state.xp),
      species: Object.keys(caught).length,
      total: Object.values(caught).reduce((a, b) => a + b, 0),
      caught,
      eng: Object.keys(state.english?.phrases || {}).length, // 배운 영어 표현 수
      buddy: state.buddy ? {
        speciesId: state.buddy.speciesId,
        nick: (state.buddy.nick || '').slice(0, 8),
        // 업로드 횟수를 줄이려고 단계와 0.5km 단위 거리만 공유
        stage: state.buddy.growth >= 1000 ? 2 : state.buddy.growth >= 300 ? 1 : 0,
        walkedKm: Math.floor(state.buddy.walkedM / 500) / 2,
      } : null,
      // 친구가 놀러 올 때 보이는 방과 텃밭
      home: state.room ? { wall: state.room.wall, floor: state.room.floor, slots: state.room.slots || {} } : null,
      garden: state.garden?.view || null,
      // 같이 걷기: 위치는 보내지 않고 함께 걸은 거리(50m 단위)만
      walk: state.walkTogether?.accepted ? {
        id: state.walkTogether.id,
        m: Math.floor(Math.max(0, (state.buddy?.walkedM || 0) - state.walkTogether.startM) / 50) * 50,
      } : null,
    };
  },

  // 친구 화면에 보이는 내용이 바뀌었을 때만 서버에 올린다 (무료 사용량 절약)
  schedulePush(state) {
    if (!this.ready || !state.group || !state.name) return;
    const key = state.group + '|' + JSON.stringify(this.shared(state));
    if (key === this.lastSent) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.push(state), 800);
  },

  async push(state) {
    const { doc, setDoc, serverTimestamp } = this.fs;
    const data = this.shared(state);
    const key = state.group + '|' + JSON.stringify(data);
    if (key === this.lastSent) return;
    try {
      await setDoc(doc(this.db, 'groups', state.group, 'players', this.uid), { ...data, updatedAt: serverTimestamp() });
      this.lastSent = key;
    } catch (e) { console.warn('기록 공유 실패', e); }
  },

  async postFeed(state, speciesId, isNew, extra = {}) {
    if (!this.ready || !state.group || !state.name) return;
    const { collection, addDoc } = this.fs;
    try {
      await addDoc(collection(this.db, 'groups', state.group, 'feed'), {
        uid: this.uid, name: state.name.slice(0, 12), color: state.color,
        speciesId, isNew, at: Date.now(), ...extra,
      });
    } catch (e) { console.warn(e); }
  },
};
