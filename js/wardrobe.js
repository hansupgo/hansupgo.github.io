// 👕 짝꿍 옷장: 재료로 모자·목걸이 같은 꾸미기를 만들어 짝꿍에게 입혀요.
// - 머리 하나, 목 하나를 입을 수 있어요. 만든 건 계속 가지고 있어요.
// - 2D 그림(monsters.js wearSVG)과 3D 모델(stage3d.js addAccessories) 모두에 보여요.
// - 친구 화면에도 보이도록 입은 것만 짧게 공유해요 (store.js).

import { store } from './store.js';
import { canAfford, MATERIALS } from './room.js';
import { track } from './quests.js';

export const WEAR_SLOTS = { head: '머리', neck: '목' };

// color: 2D·3D 공통 색, xmas: 12월에만 만들 수 있음
export const WEARS = [
  { id: 'leafhat', slot: 'head', name: '나뭇잎 모자', icon: '🍃', cost: { leaf: 6, twig: 2 }, color: '#5fae55' },
  { id: 'flower', slot: 'head', name: '꽃 머리핀', icon: '🌸', cost: { petal: 4 }, color: '#ff8fb8' },
  { id: 'strawhat', slot: 'head', name: '밀짚모자', icon: '👒', cost: { twig: 6, leaf: 3, petal: 1 }, color: '#f2c86b' },
  { id: 'starclip', slot: 'head', name: '별 머리핀', icon: '⭐', cost: { star: 3, pebble: 2 }, color: '#ffd23f' },
  { id: 'beanie', slot: 'head', name: '털모자', icon: '🧶', cost: { snowball: 4, petal: 2 }, color: '#5b8def' },
  { id: 'santa', slot: 'head', name: '산타 모자', icon: '🎅', cost: { snowball: 6, star: 1 }, color: '#e8343a', xmas: true },
  { id: 'scarf', slot: 'neck', name: '빨간 목도리', icon: '🧣', cost: { petal: 4, leaf: 2 }, color: '#e8534a' },
  { id: 'bowtie', slot: 'neck', name: '나비넥타이', icon: '🎀', cost: { petal: 3, twig: 1 }, color: '#7a6ff0' },
  { id: 'shellneck', slot: 'neck', name: '조개 목걸이', icon: '🐚', cost: { shell: 3, twig: 1 }, color: '#ffe3d1' },
  { id: 'bell', slot: 'neck', name: '방울 목걸이', icon: '🔔', cost: { pebble: 3, star: 1 }, color: '#ffc93c' },
];
export const wearById = Object.fromEntries(WEARS.map(w => [w.id, w]));

function W() {
  const s = store.state;
  s.wardrobe = s.wardrobe || { owned: {}, wear: { head: null, neck: null } };
  s.wardrobe.owned = s.wardrobe.owned || {};
  s.wardrobe.wear = s.wardrobe.wear || { head: null, neck: null };
  return s.wardrobe;
}

export const ownsWear = (id) => Boolean(W().owned[id]);
/** 지금 입은 것 { head, neck } (없으면 null) */
export const currentWear = () => ({ ...W().wear });
export const canMakeWear = (w, now = new Date()) => !w.xmas || now.getMonth() === 11;

export function makeWear(id, now = new Date()) {
  const w = wearById[id];
  if (!w || ownsWear(id) || !canMakeWear(w, now) || !canAfford(w.cost)) return false;
  const m = store.state.materials;
  for (const [k, n] of Object.entries(w.cost)) m[k] -= n;
  W().owned[id] = Date.now();
  W().wear[w.slot] = id; // 만들면 바로 입혀 줌
  store.save();
  track('craft', { id });
  return true;
}

/** 입기 (같은 걸 다시 고르면 벗기) */
export function toggleWear(id) {
  const w = wearById[id];
  if (!w || !ownsWear(id)) return false;
  const wear = W().wear;
  wear[w.slot] = wear[w.slot] === id ? null : id;
  store.save();
  return true;
}

export const costLabel = (cost) => Object.entries(cost).map(([k, n]) => `${MATERIALS[k].icon}${n}`).join(' ');

/** 친구에게서 받은 값은 믿지 않고 아는 것만 남김 */
export function cleanWear(w) {
  const out = { head: null, neck: null };
  if (w && wearById[w.head]?.slot === 'head') out.head = w.head;
  if (w && wearById[w.neck]?.slot === 'neck') out.neck = w.neck;
  return out;
}
