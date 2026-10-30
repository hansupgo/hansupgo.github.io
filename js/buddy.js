// 짝꿍 키우기
// 잡은 친구 하나를 짝꿍으로 정해 돌보고, 함께 걸으면서 키웁니다.
// - 배부름·기분·기운은 실제 시간에 따라 천천히 줄어요 (0까지 떨어져도 벌칙은 없고 시무룩해질 뿐).
// - 함께 걸은 거리와 돌봄으로 성장 점수가 쌓이고, 아기 → 어린이 → 어른으로 자라요.

import { speciesById, josa } from './monsters.js';
import { store } from './store.js';
import { cozy, hasBed, room } from './room.js';
import { FOODS, CROPS } from './garden.js';
import { track } from './quests.js';
import { weather, timeOfDay } from './weather.js';

export const STAGES = [
  { name: '아기', need: 0, scale: 0.72 },
  { name: '어린이', need: 300, scale: 0.88 },
  { name: '어른', need: 1000, scale: 1.0 },
];

// 한 시간에 변하는 양
const DECAY = { hunger: 6, mood: 4, energy: 5 };
const SLEEP_RECOVER = 25;
const FLOOR = 10; // 아무리 오래 안 들어와도 이 밑으로는 안 떨어짐

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const today = () => new Date().toLocaleDateString('ko-KR');

export function hasBuddy() { return Boolean(store.state.buddy); }
export function buddy() { return store.state.buddy; }
export function buddySpecies() { return hasBuddy() ? speciesById[buddy().speciesId] : null; }
export function displayName() { const b = buddy(); return b ? (b.nick || speciesById[b.speciesId].name) : ''; }

export function stageIndex(growth = buddy()?.growth || 0) {
  let i = 0;
  STAGES.forEach((s, k) => { if (growth >= s.need) i = k; });
  return i;
}

export function stageProgress() {
  const g = buddy().growth;
  const i = stageIndex(g);
  if (i === STAGES.length - 1) return { i, pct: 100, next: null };
  const a = STAGES[i].need;
  const b = STAGES[i + 1].need;
  return { i, pct: Math.round(((g - a) / (b - a)) * 100), next: b - g };
}

/** 짝꿍 정하기 (이미 있으면 바꾸기). 성장 기록은 짝꿍마다 따로 보관 */
export function adopt(speciesId) {
  const s = store.state;
  s.buddyBook = s.buddyBook || {};
  if (s.buddy) s.buddyBook[s.buddy.speciesId] = s.buddy;
  s.buddy = s.buddyBook[speciesId] || {
    speciesId, nick: '', growth: 0, hunger: 70, mood: 80, energy: 90,
    sleeping: false, walkedM: 0, day: today(), todayM: 0, since: Date.now(), last: Date.now(),
  };
  s.buddy.last = Date.now();
  store.save();
  return s.buddy;
}

/** 지난 접속 이후 흐른 시간만큼 상태를 갱신 */
export function tick(now = Date.now()) {
  const b = buddy();
  if (!b) return;
  const h = Math.max(0, (now - (b.last || now)) / 3600000);
  if (h < 1 / 120) return; // 30초 미만은 무시
  b.hunger = Math.max(Math.min(b.hunger, FLOOR), b.hunger - DECAY.hunger * h);
  // 방이 아늑할수록 기분이 덜 떨어짐 (최대 절반)
  const calm = 1 - Math.min(0.5, cozy() / 60);
  b.mood = Math.max(Math.min(b.mood, FLOOR), b.mood - DECAY.mood * h * calm * (b.hunger < 30 ? 1.5 : 1));
  if (b.sleeping) {
    b.energy = clamp(b.energy + SLEEP_RECOVER * h * (hasBed() ? 1.6 : 1));
    if (b.energy >= 100) b.sleeping = false; // 푹 자면 스스로 일어남
  } else {
    b.energy = Math.max(Math.min(b.energy, FLOOR), b.energy - DECAY.energy * h);
  }
  b.last = now;
  if (b.day !== today()) { b.day = today(); b.todayM = 0; }
  store.save();
}

function grow(points) {
  const b = buddy();
  const before = stageIndex(b.growth);
  b.growth += points;
  const after = stageIndex(b.growth);
  return after > before ? after : null; // 진화하면 새 단계 번호
}

// ---------- 돌보기 ----------
// 결과: { ok, line, evolved }

export function feed() {
  tick();
  const b = buddy();
  if (b.sleeping) return { ok: false, line: '쿨쿨… (자는 중이야)' };
  if (b.hunger >= 92) return { ok: false, line: '배불러~ 이따가 줘!' };
  if (store.state.snacks <= 0) return { ok: false, line: '간식이 없네… 거점에 가서 받아 오자!' };
  store.state.snacks -= 1;
  b.hunger = clamp(b.hunger + 35);
  b.mood = clamp(b.mood + 5);
  const evolved = grow(5);
  store.save();
  track('feed');
  return { ok: true, line: pick(['냠냠! 맛있다!', '우와, 내가 좋아하는 거야!', '배부르다~ 고마워!']), evolved };
}

/** 텃밭에서 거둔 것 먹이기: 간식보다 든든하고 성장 +8 */
export function feedCrop(crop) {
  tick();
  const b = buddy();
  const f = FOODS[crop];
  const have = store.state.materials?.[crop] || 0;
  if (!f || have <= 0) return { ok: false, line: CROPS[crop] ? `${josa(CROPS[crop].name, '이', '가')} 없네…` : '그게 없네…' };
  if (b.sleeping) return { ok: false, line: '쿨쿨… (자는 중이야)' };
  if (b.hunger >= 95) return { ok: false, line: '배불러~ 이따가 줘!' };
  store.state.materials[crop] = have - 1;
  b.hunger = clamp(b.hunger + f.h);
  b.mood = clamp(b.mood + f.m);
  const evolved = grow(8);
  store.save();
  track('feed');
  return { ok: true, line: pick(f.line), evolved };
}

export function play() {
  tick();
  const b = buddy();
  if (b.sleeping) return { ok: false, line: '쿨쿨… (자는 중이야)' };
  if (b.energy < 15) return { ok: false, line: '졸려서 못 놀겠어… 재워 줄래?' };
  if (b.hunger < 15) return { ok: false, line: '배고파서 힘이 안 나… 밥 먼저!' };
  b.mood = clamp(b.mood + 25);
  b.energy = clamp(b.energy - 10);
  b.hunger = clamp(b.hunger - 4);
  const evolved = grow(5);
  store.save();
  track('play');
  return { ok: true, line: pick(['히히, 재밌다!', '한 번 더! 한 번 더!', '너랑 노는 게 제일 좋아!']), evolved };
}

let lastPet = 0;
export function pet() {
  const b = buddy();
  if (b.sleeping) return { ok: false, line: '음냐… (자면서 웃어)' };
  const now = Date.now();
  if (now - lastPet < 1500) return { ok: false };
  lastPet = now;
  b.mood = clamp(b.mood + 3);
  store.save();
  track('pet');
  return { ok: true, line: pick(['헤헤, 간지러워!', '쓰담쓰담 좋아~', '기분 좋다!']) };
}

export function toggleSleep() {
  tick();
  const b = buddy();
  b.sleeping = !b.sleeping;
  b.last = Date.now();
  store.save();
  return { ok: true, line: b.sleeping ? '잘 자… 쿨쿨' : pick(['잘 잤다! 좋은 아침!', '으아~ 개운해!']) };
}

/** 친구 집에 놀러 갔을 때 (친구마다 하루 한 번) */
export function visitReward() {
  const b = buddy();
  if (!b) return null;
  tick();
  b.mood = clamp(b.mood + 15);
  const evolved = grow(5);
  store.save();
  return { evolved };
}

/** 같이 걷기 같은 보너스 성장 */
export function bonusGrow(pts) {
  if (!buddy() || !(pts > 0)) return null;
  const evolved = grow(pts);
  store.save();
  return evolved;
}

/** 영어 대화를 끝냈을 때: 하루 3번까지 성장 +10, 그 뒤로는 기분만 */
export function englishReward(todayCount) {
  const b = buddy();
  if (!b) return {};
  tick();
  track('talk');
  if (todayCount <= 3) {
    b.mood = clamp(b.mood + 15);
    const evolved = grow(10);
    store.state.xp += 30;
    store.save();
    return { pts: 10, mood: 15, evolved };
  }
  b.mood = clamp(b.mood + 5);
  store.save();
  return { mood: 5 };
}

/** 아늑한 방에서 하루 한 번 받는 성장 보너스 */
export function dailyRoomBonus() {
  const b = buddy();
  const c = cozy();
  if (!b || c <= 0 || b.roomDay === today()) return null;
  b.roomDay = today();
  const pts = Math.min(30, c);
  const evolved = grow(pts);
  store.save();
  return { pts, evolved };
}

export function rename(nick) {
  buddy().nick = nick.trim().slice(0, 8);
  store.save();
}

/** 걸은 거리 반영 (m). 10m마다 성장 1점 */
export function addWalk(m) {
  const b = buddy();
  if (!b || !(m > 0)) return null;
  if (b.day !== today()) { b.day = today(); b.todayM = 0; }
  const before = Math.floor(b.walkedM / 10);
  b.walkedM += m;
  b.todayM += m;
  const pts = Math.floor(b.walkedM / 10) - before;
  const evolved = pts > 0 ? grow(pts) : null;
  if (!b.sleeping) b.mood = clamp(b.mood + m * 0.02);
  store.save();
  return { evolved, milestone: Math.floor((b.todayM - m) / 200) < Math.floor(b.todayM / 200) };
}

// ---------- 말하기 (반말) ----------

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

export function talk(ctx = {}) {
  const b = buddy();
  if (!b) return '';
  if (b.sleeping) return pick(['쿨쿨…', '음냐음냐… 도토리…', 'zzZ']);
  const h = new Date().getHours();
  const lines = [];
  if (b.hunger < 30) lines.push('배고파… 간식 줄래?', '꼬르륵… 들었어?');
  if (b.energy < 25) lines.push('하암… 졸려.', '나 좀 재워 줄래?');
  if (b.mood < 30) lines.push('심심해… 놀아 줘!', '오늘은 같이 산책 안 가?');
  if (lines.length) return pick(lines);
  // 날씨·시간 이야기
  const wx = weather().kind;
  const tod = timeOfDay();
  if (Math.random() < 0.35) {
    const w = [];
    if (wx === 'rain' || wx === 'storm') w.push('비 온다! 텃밭에 물 안 줘도 되겠다.', "It's raining! (비가 와!)", '빗방울 주우러 갈래? 우산 꼭 챙겨!');
    if (wx === 'snow') w.push('눈이다!! 눈사람 만들고 싶어!', "It's snowing! (눈이 와!)");
    if (wx === 'clear' && tod === 'day') w.push('햇볕이 따뜻해~ 텃밭이 쑥쑥 자라겠다!', "It's sunny today! (오늘 해가 쨍쨍해!)");
    if (tod === 'dusk') w.push('하늘이 노을로 물들었어. 예쁘다…', 'Look at the sunset! (노을 좀 봐!)');
    if (tod === 'dawn') w.push('일찍 일어났네! 상쾌하다!');
    if (weather().temp != null && weather().temp >= 28) w.push('으, 더워! 시원한 물 마시자.');
    if (weather().temp != null && weather().temp <= 0) w.push('추워… 따뜻하게 입고 나가!');
    if (w.length) return pick(w);
  }
  const placed = Object.values(room().slots);
  if (!placed.length) {
    if (Math.random() < 0.5) return pick(['방이 좀 휑하다… 같이 꾸밀래?', '나뭇잎 모아서 방석 만들어 줘!']);
  } else if (Math.random() < 0.4) {
    const say = [];
    if (placed.includes('bed')) say.push('버섯 침대 폭신폭신해!');
    if (placed.includes('tank')) say.push('어항 속 물고기 봤어? 귀엽지!');
    if (placed.includes('lamp')) say.push('램프 불빛 따뜻하다~');
    if (placed.includes('plant')) say.push('꽃 화분에 물 줬어!');
    if (cozy() >= 24) say.push('우리 방 진짜 아늑해! 최고야!');
    else say.push('가구 더 만들어 볼까? 재료는 산책하면서 주울 수 있어!');
    return pick(say);
  }
  const pool = [
    '오늘 햇빛공원 가 보고 싶어!',
    '물빛공원 연못에 물고기 보러 가자!',
    '남곡초 앞에 가면 특별한 친구가 있대!',
    '너랑 같이 걸으면 쑥쑥 클 것 같아!',
    '나 오늘 기분 최고야!',
    '어제 산책 진짜 재밌었어.',
    '너 오늘 몇 걸음 걸었어?',
  ];
  if (h >= 6 && h < 11) pool.push('좋은 아침! 오늘도 같이 걷자!');
  if (h >= 19 || h < 6) pool.push('밤에는 반짝반디가 나온대!', '밤하늘 별이 예쁘다…');
  if (ctx.todayM > 500) pool.push(`오늘 벌써 ${(ctx.todayM / 1000).toFixed(1)}km나 걸었어! 대단해!`);
  return pick(pool);
}

export function evolveLine(stage) {
  return stage === 1 ? '나 좀 컸지? 이제 어린이야!' : '짠! 나 이제 어른이야! 고마워!';
}
