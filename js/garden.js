// 짝꿍 텃밭
// - 동네 곳곳에서만 나는 씨앗을 심고, 물을 주며 키워 거둡니다.
// - 물을 먹은 동안만 자라요. 비가 오면 저절로 물을 먹고, 맑은 낮에는 조금 더 빨리 자라요.
// - 거둔 것은 짝꿍 밥이 되거나, 특별한 가구 재료가 됩니다.

import { store } from './store.js';
import { weather, timeOfDay, isWet } from './weather.js';

export const CROPS = {
  lettuce: { name: '상추', icon: '🥬', hours: 1, yield: [2, 3], from: '남곡초 거점 (학교 텃밭)' },
  tomato: { name: '토마토', icon: '🍅', hours: 1.5, yield: [2, 4], from: '한숲시티 단지 거점' },
  strawberry: { name: '딸기', icon: '🍓', hours: 2, yield: [3, 5], from: '한숲산내음공원' },
  sunflower: { name: '해바라기', icon: '🌻', hours: 3, yield: [1, 2], from: '한숲햇빛공원' },
  lotus: { name: '연꽃', icon: '🪷', hours: 4, yield: [1, 2], from: '한숲물빛공원 연못' },
  pumpkin: { name: '호박', icon: '🎃', hours: 6, yield: [1, 1], from: '밤에 단지 거점' },
};
export const CROP_IDS = Object.keys(CROPS);
export const PLOT_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
export const STAGE_NAMES = ['씨앗', '새싹', '자라는 중', '다 자랐어!'];

// 짝꿍이 먹을 수 있는 것 (h: 배부름, m: 기분)
export const FOODS = {
  lettuce: { h: 25, m: 6, line: ['아삭아삭! 신선하다!', 'Crunchy! (아삭해!)'] },
  tomato: { h: 30, m: 8, line: ['새콤달콤 토마토!', 'So juicy! (엄청 촉촉해!)'] },
  strawberry: { h: 30, m: 18, line: ['딸기다!! 내가 제일 좋아하는 거야!', 'Strawberries are my favorite! (딸기 제일 좋아!)'] },
  pumpkin: { h: 50, m: 12, line: ['호박 수프 같아! 배 든든해!', 'Yummy pumpkin! (맛있는 호박!)'] },
};

const totalMs = (crop) => CROPS[crop].hours * 3600e3;
const stageMs = (crop) => totalMs(crop) / 3;

function g() {
  const s = store.state;
  s.garden = s.garden || { plots: {} };
  s.materials = s.materials || {};
  return s.garden;
}

export const seedKey = (crop) => `seed_${crop}`;
export const seeds = (crop) => store.state.materials?.[seedKey(crop)] || 0;
export const crops = (crop) => store.state.materials?.[crop] || 0;
export function plot(id) { return g().plots[id] || null; }

/** 맑은 낮에는 1.25배 빨리 */
export function growSpeed(now = Date.now()) {
  return weather().kind === 'clear' && timeOfDay(new Date(now)) === 'day' ? 1.25 : 1;
}

/** 흐른 시간만큼 자라게 함 (물 먹은 동안만) */
export function tickGarden(now = Date.now()) {
  const plots = g().plots;
  const wet = isWet();
  const speed = growSpeed(now);
  for (const p of Object.values(plots)) {
    const last = p.last || now;
    const moistEnd = Math.min(now, p.moistUntil || 0);
    const wetMs = Math.max(0, moistEnd - last);
    p.grown = Math.min(totalMs(p.crop), (p.grown || 0) + wetMs * speed);
    p.last = now;
    if (wet && p.grown < totalMs(p.crop)) p.moistUntil = Math.max(p.moistUntil || 0, now + stageMs(p.crop)); // 비가 물을 줌
  }
  shareView(now);
  store.save();
}

/** 친구에게 보여 줄 텃밭 모습 (작물:단계[:t=목마름]) — 바뀔 때만 서버에 올라감 */
function shareView(now = Date.now()) {
  const v = {};
  for (const id of PLOT_IDS) {
    const p = plot(id);
    if (p) v[id] = `${p.crop}:${stageOf(p)}${isThirsty(p, now) ? ':t' : ''}`;
  }
  g().view = v;
}

/** 친구가 보낸 물 (우편) */
export function waterFromFriend(id) {
  const p = plot(id);
  if (!p || isReady(p)) return false;
  return water(id);
}

/** 친구 텃밭 모습 → 3D용 */
export function parseFriendGarden(v) {
  const out = {};
  for (const id of PLOT_IDS) {
    const [crop, st, t] = String(v?.[id] || '').split(':');
    out[id] = CROPS[crop] ? { crop, stage: Math.max(0, Math.min(3, Number(st) || 0)), thirsty: t === 't' } : null;
  }
  return out;
}

export function stageOf(p) {
  if (!p) return -1;
  if (p.grown >= totalMs(p.crop)) return 3;
  return Math.min(2, Math.floor(p.grown / stageMs(p.crop)));
}

export const isReady = (p) => stageOf(p) === 3;
export const isThirsty = (p, now = Date.now()) => p && !isReady(p) && (p.moistUntil || 0) <= now;

/** 다 자랄 때까지 남은 시간(ms) — 계속 물을 준다고 할 때 */
export function timeLeft(p, now = Date.now()) {
  if (!p || isReady(p)) return 0;
  return (totalMs(p.crop) - p.grown) / growSpeed(now);
}

export function fmtLeft(ms) {
  const m = Math.ceil(ms / 60000);
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}시간 ${m % 60}분` : `${h}시간`;
}

export function plant(id, crop) {
  if (plot(id) || seeds(crop) <= 0) return false;
  store.state.materials[seedKey(crop)] = seeds(crop) - 1;
  const now = Date.now();
  g().plots[id] = { crop, grown: 0, moistUntil: isWet() ? now + stageMs(crop) : 0, last: now, at: now };
  shareView(now);
  store.save();
  return true;
}

/** 물 주기: 한 단계 자라는 동안 촉촉함 */
export function water(id) {
  tickGarden();
  const p = plot(id);
  if (!p || isReady(p)) return false;
  const now = Date.now();
  if ((p.moistUntil || 0) > now + 60000) return false; // 이미 촉촉해
  p.moistUntil = now + stageMs(p.crop);
  p.last = now;
  shareView(now);
  store.save();
  return true;
}

export function harvest(id) {
  tickGarden();
  const p = plot(id);
  if (!isReady(p)) return 0;
  const [a, b] = CROPS[p.crop].yield;
  const n = a + Math.floor(Math.random() * (b - a + 1));
  store.state.materials[p.crop] = crops(p.crop) + n;
  delete g().plots[id];
  shareView();
  store.save();
  return n;
}

/** 3D 화면에 넘길 텃밭 모습 */
export function gardenView(now = Date.now()) {
  const out = {};
  for (const id of PLOT_IDS) {
    const p = plot(id);
    out[id] = p ? { crop: p.crop, stage: stageOf(p), thirsty: isThirsty(p, now) } : null;
  }
  return out;
}

export function hasFood() { return Object.keys(FOODS).some(k => crops(k) > 0); }
