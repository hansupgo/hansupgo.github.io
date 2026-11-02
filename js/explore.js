// 🗺️ 탐험 지도 · 💎 오늘의 보물찾기 · 💬 장소 이야기
// - 지도를 눌러 걸어간 곳(25m 칸)을 기록해 동네 탐험 %를 셈해요.
// - 단지(거점)마다 둘레 150m를 80% 넘게 돌면 '다 돌았어요!' 보상.
// - 날마다 동네 어딘가에 보물 상자가 숨어요. 짝꿍이 영어로 힌트를 줘요.

import { CONFIG } from './config.js';
import { store } from './store.js';
import { distanceM, hashString, mulberry32 } from './spawn.js';
import { addMaterials, MATERIALS } from './room.js';

export const CELL = 25;        // 탐험 칸 크기 (m)
export const REVEAL = 40;      // 걸으면 이 거리 안이 밝아짐
export const AREA_R = 150;     // 단지 탐험 범위
export const AREA_DONE = 0.8;  // 80% 넘게 돌면 다 돈 것
export const TREASURE_SEE = 80; // 이만큼 가까워지면 보물 상자가 보임

const M_LAT = 111320;

// 동네 경계 (거점·교회·공원을 다 담는 네모 + 여유). app.js의 이동 경계와 같음
const PTS = [...CONFIG.stops, ...(CONFIG.churches || []), ...(CONFIG.zones || []), CONFIG.home];
const raw = { s: Math.min(...PTS.map(p => p.lat)), n: Math.max(...PTS.map(p => p.lat)), w: Math.min(...PTS.map(p => p.lng)), e: Math.max(...PTS.map(p => p.lng)) };
const padLat = (raw.n - raw.s) * 0.35, padLng = (raw.e - raw.w) * 0.35;
export const TOWN = { s: raw.s - padLat, n: raw.n + padLat, w: raw.w - padLng, e: raw.e + padLng };

const M_LNG = M_LAT * Math.cos(((TOWN.s + TOWN.n) / 2) * Math.PI / 180);
const dLat = CELL / M_LAT, dLng = CELL / M_LNG;
export const ROWS = Math.ceil((TOWN.n - TOWN.s) / dLat);
export const COLS = Math.ceil((TOWN.e - TOWN.w) / dLng);
export const metersPerLng = M_LNG;

export const cellOf = (pos) => [Math.floor((pos.lat - TOWN.s) / dLat), Math.floor((pos.lng - TOWN.w) / dLng)];
export const cellCenter = (i, j) => ({ lat: TOWN.s + (i + 0.5) * dLat, lng: TOWN.w + (j + 0.5) * dLng });
const inTown = (i, j) => i >= 0 && j >= 0 && i < ROWS && j < COLS;

function E() {
  const s = store.state;
  s.explore = s.explore || { cells: {}, done: {} };
  s.explore.cells = s.explore.cells || {};
  s.explore.done = s.explore.done || {};
  return s.explore;
}

export const visitedCells = () => Object.keys(E().cells);
export const townProgress = () => Object.keys(E().cells).length / (ROWS * COLS);

// ---------- 단지 탐험 ----------

/** 탐험 구역: 거점(단지·학교)마다 둘레 150m */
export const AREAS = CONFIG.stops.map(st => {
  const cells = [];
  const [ci, cj] = cellOf(st);
  const ri = Math.ceil(AREA_R / CELL) + 1;
  for (let i = ci - ri; i <= ci + ri; i++) {
    for (let j = cj - ri; j <= cj + ri; j++) {
      if (inTown(i, j) && distanceM(cellCenter(i, j), st) <= AREA_R) cells.push(`${i}_${j}`);
    }
  }
  return { id: st.id, name: st.name, lat: st.lat, lng: st.lng, cells };
});
const AREA_REWARD = { balls: 5, mats: { star: 1, petal: 2, leaf: 2 } };
export const areaReward = AREA_REWARD;

export const areaProgress = (a) => a.cells.filter(k => E().cells[k]).length / a.cells.length;
export const areaDone = (id) => Boolean(E().done[id]);
export const doneCount = () => AREAS.filter(a => areaDone(a.id)).length;

/**
 * 지금 자리에서 둘레를 밝힘. { fresh: 새로 밝힌 칸 수, completed: 새로 다 돈 구역들 }
 * 저장은 칸이 새로 밝혀졌을 때만 함 (걸을 때마다 저장하지 않게)
 */
export function reveal(pos) {
  const ex = E();
  const [ci, cj] = cellOf(pos);
  const r = Math.ceil(REVEAL / CELL);
  let fresh = 0;
  for (let i = ci - r; i <= ci + r; i++) {
    for (let j = cj - r; j <= cj + r; j++) {
      const k = `${i}_${j}`;
      if (!inTown(i, j) || ex.cells[k] || distanceM(cellCenter(i, j), pos) > REVEAL) continue;
      ex.cells[k] = 1;
      fresh++;
    }
  }
  const completed = [];
  if (fresh) {
    for (const a of AREAS) {
      if (ex.done[a.id] || distanceM(a, pos) > AREA_R + REVEAL) continue;
      if (areaProgress(a) >= AREA_DONE) {
        ex.done[a.id] = Date.now();
        store.state.balls += AREA_REWARD.balls;
        addMaterials(AREA_REWARD.mats);
        completed.push(a);
      }
    }
    store.save();
  }
  return { fresh, completed, allDone: completed.length > 0 && doneCount() === AREAS.length };
}

// ---------- 오늘의 보물찾기 ----------

// 보물이 숨는 곳 근처의 이정표 (힌트에 씀)
const LANDMARKS = [
  ...CONFIG.stops.map(s => ({ ...s, kind: s.special ? 'school' : 'apt' })),
  ...(CONFIG.zones || []).map(z => ({ ...z, kind: z.type === 'water' ? 'pond' : 'park' })),
  ...(CONFIG.churches || []).map(c => ({ ...c, kind: 'church' })),
];

function hintFor(lm) {
  const n = String(lm.id).match(/\d+/)?.[0];
  switch (lm.kind) {
    case 'pond': return ["It's near the pond!", `연못(${lm.name}) 근처에 있어!`];
    case 'park': return ["It's in a park with lots of trees!", `나무가 많은 공원(${lm.name}) 근처에 있어!`];
    case 'school': return ['Look near the school!', '학교(남곡초) 근처를 찾아봐!'];
    case 'church': return ["It's close to the church!", '교회 가까이에 있어!'];
    default: return [`Look near Apartment ${n}!`, `${n}단지 근처를 찾아봐!`];
  }
}

const today = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** 오늘의 보물 자리 (사람마다·날마다 다름, 하루 동안은 같음) */
export function treasure(now = new Date()) {
  const day = today(now);
  const r = mulberry32(hashString(`${store.state.id}:${day}:treasure`));
  const lm = LANDMARKS[Math.floor(r() * LANDMARKS.length)];
  const ang = r() * Math.PI * 2;
  const dist = 40 + r() * 70;
  let lat = lm.lat + (Math.sin(ang) * dist) / M_LAT;
  let lng = lm.lng + (Math.cos(ang) * dist) / M_LNG;
  lat = Math.min(TOWN.n, Math.max(TOWN.s, lat));
  lng = Math.min(TOWN.e, Math.max(TOWN.w, lng));
  const t = store.state.treasure;
  return { id: `treasure-${day}`, day, lat, lng, landmark: lm, hint: hintFor(lm), found: t?.day === day && t.found };
}

/** 얼마나 가까운지: 0 멀어 / 1 가까워지는 중 / 2 아주 가까워 / 3 보여! */
export function warmth(pos, t = treasure()) {
  const d = distanceM(pos, t);
  return d <= TREASURE_SEE ? 3 : d <= 140 ? 2 : d <= 280 ? 1 : 0;
}
export const WARMTH_TEXT = [
  ["It's far away. Keep walking!", '아직 멀어. 계속 걸어 봐!'],
  ["You're getting closer!", '가까워지고 있어!'],
  ['Very close! Look around!', '아주 가까워! 둘레를 잘 봐!'],
  ['I see it! There it is!', '저기 보여! 보물 상자야!'],
];

const TREASURE_REWARD = { balls: 3, snacks: 2 };
const BONUS_MATS = ['leaf', 'petal', 'shell', 'pebble'];

/** 보물 찾기 (가까이 있을 때). 받은 것 { balls, snacks, mats } 또는 null */
export function findTreasure(pos, now = new Date()) {
  const t = treasure(now);
  if (t.found || distanceM(pos, t) > CONFIG.catchRadius) return null;
  const r = mulberry32(hashString(`${store.state.id}:${t.day}:treasure-gift`));
  const mats = { star: 1, [BONUS_MATS[Math.floor(r() * BONUS_MATS.length)]]: 2 };
  store.state.balls += TREASURE_REWARD.balls;
  store.state.snacks += TREASURE_REWARD.snacks;
  store.state.treasure = { day: t.day, found: true, days: (store.state.treasure?.days || 0) + 1 };
  addMaterials(mats); // 저장도 함
  return { ...TREASURE_REWARD, mats };
}
export const treasureDays = () => store.state.treasure?.days || 0;
export const matText = (mats) => Object.entries(mats).map(([k, n]) => `${MATERIALS[k].icon} ${MATERIALS[k].name} ${n}개`).join(', ');

// ---------- 장소 이야기 (짝꿍이 그곳에 맞는 영어 한마디) ----------

const PLACE_LINES = {
  pond: [["Look! Fish in the pond!", '봐! 연못에 물고기가 있어!'], ['The water is so clear!', '물이 정말 맑다!'], ['Can you hear the frogs?', '개구리 소리 들려?']],
  park: [['I love this park!', '난 이 공원이 좋아!'], ['So many trees here!', '여기 나무가 정말 많다!'], ["Let's look for bugs!", '벌레 찾아보자!']],
  school: [['This is our school!', '여기가 우리 학교야!'], ['I want to learn here too!', '나도 여기서 배우고 싶어!']],
  church: [['This is the church. Hello!', '여기는 교회야. 안녕!'], ["Let's go in and listen!", '들어가서 말씀 들어 보자!']],
};

/** 이 장소에서 짝꿍이 할 말 [영어, 한글] (날마다 바뀜) */
export function placeLine(kind, id, now = new Date()) {
  const list = PLACE_LINES[kind];
  if (!list) return null;
  return list[hashString(`${id}:${today(now)}`) % list.length];
}

/** 이야기가 나오는 곳 (공원·연못은 app.js의 구역 알림과 함께) */
export const STORY_SPOTS = [
  ...CONFIG.stops.filter(s => s.special).map(s => ({ ...s, kind: 'school', r: 60 })),
  ...(CONFIG.churches || []).map(c => ({ ...c, kind: 'church', r: 60 })),
];
