// 짝꿍 방 꾸미기
// - 동네를 걸으며 재료(나뭇잎, 조약돌...)를 줍고
// - 재료로 가구를 만들어 짝꿍 방에 놓습니다.
// - 방이 아늑할수록 짝꿍 기분이 덜 떨어지고, 하루에 한 번 성장 보너스를 받아요.

import { CONFIG } from './config.js';
import { store } from './store.js';
import { hashString, mulberry32, distanceM, currentSlot, slotEndsAt, zoneAt, isNight, spawnsAround } from './spawn.js';
import { weather } from './weather.js';
import { CROPS } from './garden.js';

export const MATERIALS = {
  leaf: { name: '나뭇잎', icon: '🍃' },
  twig: { name: '나뭇가지', icon: '🪵' },
  pebble: { name: '조약돌', icon: '🪨' },
  petal: { name: '꽃잎', icon: '🌸' },
  shell: { name: '조개껍데기', icon: '🐚' },
  star: { name: '별가루', icon: '✨' },
  raindrop: { name: '빗방울', icon: '💧', limited: '비 오는 날에만' },
  snowflake: { name: '눈송이', icon: '❄️', limited: '눈 오는 날에만' },
};
// 씨앗(seed_딸기...)과 거둔 작물도 재료 주머니에 함께 담음
for (const [id, c] of Object.entries(CROPS)) {
  MATERIALS[`seed_${id}`] = { name: `${c.name} 씨앗`, icon: c.icon, seed: true, limited: c.from };
  MATERIALS[id] = { name: c.name, icon: c.icon, crop: true };
}
export const BASIC_IDS = ['leaf', 'twig', 'pebble', 'petal', 'shell', 'star'];
export const MATERIAL_IDS = Object.keys(MATERIALS);

// where: floor(바닥) / rug(가운데 깔개) / wall(벽)
export const FURNITURE = [
  { id: 'cushion', name: '나뭇잎 방석', icon: '🍃', where: 'floor', cozy: 2, cost: { leaf: 4 } },
  { id: 'stool', name: '통나무 의자', icon: '🪵', where: 'floor', cozy: 2, cost: { twig: 4 } },
  { id: 'table', name: '동글 탁자', icon: '🍵', where: 'floor', cozy: 3, cost: { twig: 4, pebble: 2 } },
  { id: 'plant', name: '꽃 화분', icon: '🌷', where: 'floor', cozy: 3, cost: { petal: 3, pebble: 2 } },
  { id: 'lamp', name: '조약돌 램프', icon: '💡', where: 'floor', cozy: 4, cost: { pebble: 4, star: 1 } },
  { id: 'shelf', name: '나무 책장', icon: '📚', where: 'floor', cozy: 4, cost: { twig: 6, leaf: 2 } },
  { id: 'tank', name: '작은 어항', icon: '🐟', where: 'floor', cozy: 5, cost: { shell: 2, pebble: 3 } },
  { id: 'bed', name: '버섯 침대', icon: '🍄', where: 'floor', cozy: 6, cost: { leaf: 6, twig: 4, petal: 2 } },
  { id: 'rug', name: '동그란 러그', icon: '🟠', where: 'rug', cozy: 3, cost: { leaf: 3, petal: 3 } },
  { id: 'frame', name: '그림 액자', icon: '🖼️', where: 'wall', cozy: 2, cost: { twig: 2, petal: 1 } },
  { id: 'window', name: '동그란 창문', icon: '🪟', where: 'wall', cozy: 3, cost: { twig: 3, pebble: 1 } },
  { id: 'garland', name: '별빛 꼬마전구', icon: '🌟', where: 'wall', cozy: 4, cost: { star: 2, leaf: 2 } },
  { id: 'mobile', name: '조개 모빌', icon: '🐚', where: 'wall', cozy: 4, cost: { shell: 3, twig: 1 } },
  // 텃밭 작물·날씨 한정 재료로 만드는 특별 가구
  { id: 'sunpot', name: '해바라기 화분', icon: '🌻', where: 'floor', cozy: 4, cost: { sunflower: 2, pebble: 2 }, special: true },
  { id: 'lotuslamp', name: '연꽃 등불', icon: '🪷', where: 'floor', cozy: 5, cost: { lotus: 2, star: 1 }, special: true },
  { id: 'pumpkinlamp', name: '호박 랜턴', icon: '🎃', where: 'floor', cozy: 5, cost: { pumpkin: 1, twig: 2 }, special: true },
  { id: 'snowman', name: '눈사람 인형', icon: '⛄', where: 'floor', cozy: 4, cost: { snowflake: 4, twig: 1 }, special: true },
  { id: 'chime', name: '빗방울 풍경', icon: '💧', where: 'wall', cozy: 4, cost: { raindrop: 3, shell: 1 }, special: true },
];
export const furnitureById = Object.fromEntries(FURNITURE.map(f => [f.id, f]));

export const THEMES = {
  wall: [
    { id: 'cream', name: '크림 줄무늬', cost: {} },
    { id: 'mint', name: '민트 물방울', cost: { leaf: 5 } },
    { id: 'pink', name: '분홍 꽃무늬', cost: { petal: 5 } },
    { id: 'night', name: '밤하늘', cost: { star: 3 } },
  ],
  floor: [
    { id: 'wood', name: '나무 마루', cost: {} },
    { id: 'grass', name: '폭신 잔디', cost: { leaf: 6 } },
    { id: 'tile', name: '조약돌 타일', cost: { pebble: 6 } },
  ],
};

// 방 안의 자리 (x: 왼쪽-오른쪽, z: 안쪽-앞쪽, 벽 자리는 y가 높이)
export const SLOTS = [
  { id: 'f1', where: 'floor', x: -1.15, z: -0.75 },
  { id: 'f2', where: 'floor', x: -0.42, z: -0.85 },
  { id: 'f3', where: 'floor', x: 0.42, z: -0.85 },
  { id: 'f4', where: 'floor', x: 1.15, z: -0.75 },
  { id: 'f5', where: 'floor', x: -1.2, z: 0.4 },
  { id: 'f6', where: 'floor', x: 1.2, z: 0.4 },
  { id: 'r1', where: 'rug', x: 0, z: 0.2 },
  { id: 'w1', where: 'wall', x: -0.95, y: 1.35 },
  { id: 'w2', where: 'wall', x: 0, y: 1.6 },
  { id: 'w3', where: 'wall', x: 0.95, y: 1.35 },
];
export const slotById = Object.fromEntries(SLOTS.map(s => [s.id, s]));

const WHERE_NAME = { floor: '바닥', rug: '가운데 깔개 자리', wall: '벽' };
export const whereName = (w) => WHERE_NAME[w];

// ---------- 상태 ----------

function st() {
  const s = store.state;
  s.materials = s.materials || {};
  s.furniture = s.furniture || {};
  s.room = s.room || { wall: 'cream', floor: 'wood', slots: {} };
  s.themes = s.themes || { cream: true, wood: true };
  return s;
}

export function room() { return st().room; }
export function materials() { return st().materials; }
export const matCount = (id) => st().materials[id] || 0;

export function costText(cost) {
  return Object.entries(cost).map(([k, n]) => `${MATERIALS[k].icon}${n}`).join(' ') || '무료';
}

export function canAfford(cost) {
  return Object.entries(cost).every(([k, n]) => matCount(k) >= n);
}

function pay(cost) {
  for (const [k, n] of Object.entries(cost)) st().materials[k] = matCount(k) - n;
}

export function addMaterials(gains) {
  const s = st();
  for (const [k, n] of Object.entries(gains)) s.materials[k] = (s.materials[k] || 0) + n;
  store.save();
}

/** 만든 개수 */
export const owned = (id) => st().furniture[id] || 0;

/** 방에 놓은 개수 */
export function placedCount(id) {
  return Object.values(room().slots).filter(v => v === id).length;
}

export const spare = (id) => owned(id) - placedCount(id);

export function craft(id) {
  const f = furnitureById[id];
  if (!f || !canAfford(f.cost)) return false;
  pay(f.cost);
  st().furniture[id] = owned(id) + 1;
  store.save();
  return true;
}

export function unlockTheme(kind, id) {
  const t = THEMES[kind].find(x => x.id === id);
  const s = st();
  if (!t) return false;
  if (!s.themes[id]) {
    if (!canAfford(t.cost)) return false;
    pay(t.cost);
    s.themes[id] = true;
  }
  s.room[kind] = id;
  store.save();
  return true;
}

export const hasTheme = (id) => Boolean(st().themes[id]);

export function place(slotId, id) {
  const slot = slotById[slotId];
  const f = furnitureById[id];
  if (!slot || !f || f.where !== slot.where) return false;
  if (room().slots[slotId] !== id && spare(id) <= 0) return false;
  room().slots[slotId] = id;
  store.save();
  return true;
}

export function clearSlot(slotId) {
  delete room().slots[slotId];
  store.save();
}

export function hasBed() { return Object.values(room().slots).includes('bed'); }

/** 아늑함 점수: 놓은 가구 + 꾸민 벽지·바닥 + 여러 종류 보너스 */
export function cozy() {
  const r = room();
  const ids = Object.values(r.slots);
  let n = ids.reduce((a, id) => a + (furnitureById[id]?.cozy || 0), 0);
  n += new Set(ids).size >= 5 ? 3 : 0;
  if (r.wall !== 'cream') n += 2;
  if (r.floor !== 'wood') n += 2;
  return n;
}

export const COZY_MAX = 40;
export function cozyLevel(n = cozy()) { return Math.min(5, Math.floor(n / 8)); }

// ---------- 동네에서 재료 줍기 ----------
// 몬스터처럼 "시간 + 위치 칸"으로 정해서 친구들과 같은 자리에 보입니다.

// 그 장소에서만 나는 씨앗
const ZONE_SEEDS = { sannae: 'seed_strawberry', haetbit: 'seed_sunflower', pond: 'seed_lotus' };

function zoneIdAt(pos) {
  return (CONFIG.zones || []).find(z => distanceM(pos, z) <= z.radius)?.id || null;
}

function matWeights(zone, night, wx, zoneId) {
  const wet = wx === 'rain' || wx === 'storm';
  const list = [
    ['leaf', zone === 'park' ? 4 : 3],
    ['twig', zone === 'park' ? 3 : 2.5],
    ['pebble', zone === 'water' ? 3 : 2.5],
    ['petal', night || wx === 'snow' ? 0.3 : zone === 'park' ? 3 : 1],
    ['shell', zone === 'water' ? 4 : 0],
    ['star', night ? 1.5 : 0.15],
    ['raindrop', wet ? 3.5 : 0],
    ['snowflake', wx === 'snow' ? 3.5 : 0],
  ];
  if (ZONE_SEEDS[zoneId]) list.push([ZONE_SEEDS[zoneId], 2.2]);
  return list;
}

function pickW(list, r) {
  const total = list.reduce((a, [, w]) => a + w, 0);
  let x = r * total;
  for (const [k, w] of list) { x -= w; if (x < 0) return k; }
  return list[0][0];
}

export function materialForCell(cx, cy, slot, date) {
  const rnd = mulberry32(hashString(`mat:${cx}:${cy}:${slot}`));
  if (rnd() > CONFIG.materialChance) return null;
  const lat = (cy + 0.15 + rnd() * 0.7) * CONFIG.cellLat;
  const lng = (cx + 0.15 + rnd() * 0.7) * CONFIG.cellLng;
  const zone = zoneAt({ lat, lng });
  const kind = pickW(matWeights(zone, isNight(date), weather().kind, zoneIdAt({ lat, lng })), rnd());
  const amount = kind === 'star' || MATERIALS[kind].seed ? 1 : 1 + Math.floor(rnd() * 3);
  return { id: `m${slot}:${cx}:${cy}`, kind, amount, lat, lng, expiresAt: slotEndsAt(slot) };
}

export function materialsAround(pos, radius = CONFIG.visibleRadius, now = Date.now()) {
  const slot = currentSlot(now);
  const date = new Date(now);
  const dLat = radius / 111320;
  const dLng = radius / (111320 * Math.cos((pos.lat * Math.PI) / 180));
  const out = [];
  const mons = spawnsAround(pos, radius + 40, now); // 몬스터와 겹치면 누르기 어려우니 비켜 둠
  for (let cx = Math.floor((pos.lng - dLng) / CONFIG.cellLng); cx <= Math.floor((pos.lng + dLng) / CONFIG.cellLng); cx++) {
    for (let cy = Math.floor((pos.lat - dLat) / CONFIG.cellLat); cy <= Math.floor((pos.lat + dLat) / CONFIG.cellLat); cy++) {
      const m = materialForCell(cx, cy, slot, date);
      if (m && !st().gathered?.[m.id] && distanceM(pos, m) <= radius &&
        !CONFIG.stops.some(s => distanceM(s, m) < 40) && !mons.some(s => distanceM(s, m) < 40)) out.push(m);
    }
  }
  return out;
}

export function gather(spot) {
  const s = st();
  s.gathered = s.gathered || {};
  if (s.gathered[spot.id]) return false;
  s.gathered[spot.id] = Date.now();
  addMaterials({ [spot.kind]: spot.amount });
  return true;
}

/** 거점에서 받는 재료 (특별 거점은 별가루 하나 더) */
export function stopMaterials(special) {
  const rnd = Math.random;
  const pool = ['leaf', 'twig', 'pebble', 'petal'];
  const gains = {};
  for (let i = 0; i < 2; i++) {
    const k = pool[Math.floor(rnd() * pool.length)];
    gains[k] = (gains[k] || 0) + 1;
  }
  if (special) {
    gains.star = (gains.star || 0) + 1;
    gains.seed_lettuce = 2; // 남곡초 학교 텃밭 상추
  } else {
    if (rnd() < 0.5) gains.seed_tomato = 1;
    if (isNight() && rnd() < 0.35) gains.seed_pumpkin = 1; // 밤에만
  }
  addMaterials(gains);
  return gains;
}

/** 잡은 친구가 가끔 주는 선물 */
const GIFT_BY_KIND = { monster: 'leaf', insect: 'petal', animal: 'twig', fish: 'shell' };
export function catchGift(kind) {
  if (Math.random() > 0.5) return null;
  const k = GIFT_BY_KIND[kind] || 'leaf';
  addMaterials({ [k]: 1 });
  return k;
}

export function gainText(gains) {
  return Object.entries(gains).map(([k, n]) => `${MATERIALS[k].icon} ${MATERIALS[k].name} ${n}개`).join(', ');
}
