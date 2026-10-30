// 오늘의 할 일 + 계절 행사
// - 날마다 할 일 3가지(잡기 / 짝꿍·영어 / 산책·텃밭·친구)가 바뀝니다. 다 하면 보너스!
// - 계절마다 행사가 열려요: 행사 재료를 모아 기간 한정 가구를 만들고, 행사 친구가 더 자주 나와요.
// 게임 곳곳에서 track(종류, 정보)를 부르면 진행도가 올라갑니다.

import { store } from './store.js';
import { hashString, mulberry32 } from './spawn.js';

// ---------- 계절 행사 ----------

export const EVENTS = [
  { id: 'spring', months: [3, 4, 5], name: '벚꽃 축제', icon: '🌸', token: 'blossom', tokenName: '벚꽃잎', tokenIcon: '💮',
    boost: ['kkotbyeori', 'noranapuri', 'ggulbeori'], desc: '꽃이 활짝! 꽃별이·노랑나풀이·꿀벌이가 자주 나와요.' },
  { id: 'summer', months: [6, 7, 8], name: '반딧불 여름밤', icon: '🌙', token: 'glowbug', tokenName: '반딧불빛', tokenIcon: '💫',
    boost: ['banjjakbandi', 'maemmaemi', 'gochujamdori'], desc: '여름밤엔 반짝반디가, 낮엔 맴맴이·고추잠돌이가 자주 나와요.' },
  { id: 'autumn', months: [9, 10, 11], name: '도토리 줍기', icon: '🍂', token: 'acorn', tokenName: '도토리', tokenIcon: '🌰',
    boost: ['dotoriram', 'goseumbbung', 'beoseokkongi'], desc: '가을 숲 친구들! 도토리람·고슴뭉·버섯콩이가 자주 나와요.' },
  { id: 'winter', months: [12, 1, 2], name: '눈사람 만들기', icon: '⛄', token: 'snowball', tokenName: '눈뭉치', tokenIcon: '⚪',
    boost: ['eoreumbangul', 'dalbittokki', 'gureumsom'], desc: '겨울 친구들! 얼음방울·달빛토끼·구름솜이 자주 나와요.' },
];
export const eventById = Object.fromEntries(EVENTS.map(e => [e.id, e]));

/** 지금 열린 행사 (계절마다 하나는 꼭 열려 있음) */
export function currentEvent(date = new Date()) {
  const m = date.getMonth() + 1;
  return EVENTS.find(e => e.months.includes(m));
}

/** 행사 친구는 3배 자주 나옴 (spawn.js) */
export function eventBoost(speciesId, date = new Date()) {
  return currentEvent(date).boost.includes(speciesId) ? 3 : 1;
}

/** 행사가 끝나는 날 (다음 계절 첫날 0시) */
export function eventEndsAt(date = new Date()) {
  const ev = currentEvent(date);
  const last = ev.months[ev.months.length - 1];
  const year = date.getFullYear() + (last < date.getMonth() + 1 ? 1 : 0);
  return new Date(year, last, 1).getTime(); // last는 1부터라 그대로 다음 달
}

// ---------- 오늘의 할 일 ----------

// cat: 잡기(catch) / 짝꿍·영어(care) / 산책·텃밭·친구(go)
// need: 이 할 일이 나오려면 필요한 것 (buddy: 짝꿍, friends: 친구 그룹)
const POOL = [
  { id: 'catch3', cat: 'catch', text: '아무 친구나 3번 잡기', icon: '🎯', goal: 3, on: 'catch' },
  { id: 'catchMonster', cat: 'catch', text: '몬스터 2마리 잡기', icon: '👾', goal: 2, on: 'catch', kind: 'monster' },
  { id: 'catchInsect', cat: 'catch', text: '곤충 1마리 잡기', icon: '🐞', goal: 1, on: 'catch', kind: 'insect' },
  { id: 'catchAnimal', cat: 'catch', text: '동물 친구 1마리 만나기', icon: '🐱', goal: 1, on: 'catch', kind: 'animal' },
  { id: 'catchPark', cat: 'catch', text: '공원에서 친구 1마리 잡기', icon: '🌳', goal: 1, on: 'catch', place: 'park' },
  { id: 'dex', cat: 'care', text: '도감에서 만난 친구 2번 살펴보기', icon: '📖', goal: 2, on: 'dex' },
  { id: 'talk', cat: 'care', text: '짝꿍이랑 영어로 1번 이야기하기', icon: '💬', goal: 1, on: 'talk', need: 'buddy' },
  { id: 'feed', cat: 'care', text: '짝꿍에게 밥 2번 주기', icon: '🍪', goal: 2, on: 'feed', need: 'buddy' },
  { id: 'play', cat: 'care', text: '짝꿍이랑 2번 놀아 주기', icon: '🎾', goal: 2, on: 'play', need: 'buddy' },
  { id: 'pet', cat: 'care', text: '짝꿍 5번 쓰다듬기', icon: '🤚', goal: 5, on: 'pet', need: 'buddy' },
  { id: 'walk', cat: 'go', text: '300m 걷기', icon: '👟', goal: 300, on: 'walk', unit: 'm' },
  { id: 'stop', cat: 'go', text: '거점 2곳 들르기', icon: '📍', goal: 2, on: 'stop' },
  { id: 'gather', cat: 'go', text: '재료 3개 줍기', icon: '🍃', goal: 3, on: 'gather' },
  { id: 'water', cat: 'go', text: '텃밭에 물 1번 주기', icon: '💧', goal: 1, on: 'water', need: 'buddy' },
  { id: 'friendWater', cat: 'go', text: '친구 밭에 물 주기', icon: '🚿', goal: 1, on: 'friendWater', need: 'friends' },
  { id: 'gift', cat: 'go', text: '친구에게 선물 보내기', icon: '🎁', goal: 1, on: 'gift', need: 'friends' },
];
const poolById = Object.fromEntries(POOL.map(q => [q.id, q]));

// 보상: 잡기 → 숲볼, 짝꿍·영어 → 간식, 산책 → 재료
const REWARD = {
  catch: { balls: 3 },
  care: { snacks: 2 },
  go: { mats: { star: 1, petal: 2 } },
  event: { balls: 2 },
};
const BONUS = { balls: 5, snacks: 3, mats: { star: 1 }, token: 3 };
const EVENT_QUEST_GOAL = 3; // 행사 재료 3개 모으기

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function needOk(need) {
  if (need === 'buddy') return Boolean(store.state.buddy);
  if (need === 'friends') return Boolean(store.state.group);
  return true;
}

function pickFor(day) {
  const r = mulberry32(hashString(`${store.state.id}:${day}:quests`));
  return ['catch', 'care', 'go'].map(cat => {
    const list = POOL.filter(q => q.cat === cat && needOk(q.need));
    return list[Math.floor(r() * list.length)].id; // 분류마다 조건 없는 할 일이 하나 이상 있음
  });
}

/** 오늘의 할 일 상태 (날이 바뀌면 새로 뽑음) */
export function quests(now = new Date()) {
  const s = store.state;
  const day = todayKey(now);
  if (!s.quests || s.quests.day !== day) {
    s.quests = {
      day,
      list: pickFor(day).map(id => ({ id, prog: 0, claimed: false })),
      event: { prog: 0, claimed: false },
      bonus: false,
    };
    store.save();
  }
  return s.quests;
}

export const questInfo = (id) => poolById[id];
export const questDone = (q) => q.prog >= poolById[q.id].goal;
export const eventQuestGoal = EVENT_QUEST_GOAL;

/** 받을 수 있는 보상 개수 (지도 버튼 배지) */
export function claimable() {
  const Q = quests();
  let n = Q.list.filter(q => questDone(q) && !q.claimed).length;
  if (Q.event.prog >= EVENT_QUEST_GOAL && !Q.event.claimed) n += 1;
  if (allClaimed(Q) && !Q.bonus) n += 1;
  return n;
}

const allClaimed = (Q) => Q.list.every(q => q.claimed);

let progressFn = () => {};
/** 할 일을 하나 끝냈을 때 알림 받기 */
export function onQuestDone(fn) { progressFn = fn; }

/**
 * 게임 곳곳에서 부름: track('catch', { sp, place }), track('walk', { m: 12 }) ...
 * 새로 끝낸 할 일 목록을 돌려줌
 */
export function track(on, info = {}) {
  const Q = quests();
  const finished = [];
  for (const q of Q.list) {
    const def = poolById[q.id];
    if (def.on !== on || questDone(q)) continue;
    if (def.kind && info.sp?.kind !== def.kind) continue;
    if (def.place && info.place !== def.place) continue;
    q.prog = Math.min(def.goal, q.prog + (on === 'walk' ? info.m || 0 : 1));
    if (questDone(q)) finished.push(def);
  }
  if (finished.length || on === 'walk') store.save();
  for (const def of finished) progressFn(def);
  return finished;
}

/** 행사 재료 얻기 (잡을 때마다 1개, 행사 친구면 2개) */
export function eventCatchGain(sp, now = new Date()) {
  const ev = currentEvent(now);
  const n = ev.boost.includes(sp.id) ? 2 : 1;
  addEventTokens(n, now);
  return { icon: ev.tokenIcon, name: ev.tokenName, n };
}

function addEventTokens(n, now = new Date()) {
  const ev = currentEvent(now);
  const s = store.state;
  s.materials = s.materials || {};
  s.materials[ev.token] = (s.materials[ev.token] || 0) + n;
  const Q = quests(now);
  const was = Q.event.prog;
  Q.event.prog = Math.min(EVENT_QUEST_GOAL, Q.event.prog + n);
  store.save();
  if (was < EVENT_QUEST_GOAL && Q.event.prog >= EVENT_QUEST_GOAL) {
    progressFn({ text: `${ev.tokenName} ${EVENT_QUEST_GOAL}개 모으기`, icon: ev.tokenIcon });
  }
}

function give(r) {
  const s = store.state;
  if (r.balls) s.balls += r.balls;
  if (r.snacks) s.snacks += r.snacks;
  if (r.mats) {
    s.materials = s.materials || {};
    for (const [k, n] of Object.entries(r.mats)) s.materials[k] = (s.materials[k] || 0) + n;
  }
}

/** 보상 받기. which: 할 일 id | 'event' | 'bonus'. 받은 보상을 돌려줌 (못 받으면 null) */
export function claim(which) {
  const Q = quests();
  let r = null;
  if (which === 'event') {
    if (Q.event.prog < EVENT_QUEST_GOAL || Q.event.claimed) return null;
    Q.event.claimed = true;
    r = REWARD.event;
  } else if (which === 'bonus') {
    if (!allClaimed(Q) || Q.bonus) return null;
    Q.bonus = true;
    r = BONUS;
  } else {
    const q = Q.list.find(x => x.id === which);
    if (!q || !questDone(q) || q.claimed) return null;
    q.claimed = true;
    r = REWARD[poolById[q.id].cat];
  }
  give(r);
  store.save();
  if (r.token) addEventTokens(r.token);
  return r;
}

export function rewardOf(which) {
  if (which === 'event') return REWARD.event;
  if (which === 'bonus') return BONUS;
  return REWARD[poolById[which].cat];
}
