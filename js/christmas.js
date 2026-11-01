// 🎄 성탄절 행사 (12월)
// - 대림절 달력: 12월 1일~25일, 날마다 문 하나를 열면 선물과 영어 한마디. 놓친 날 문도 나중에 열 수 있어요.
// - 교회 '성탄 이야기': 예수님 탄생 이야기 다섯 장면 (성경 본문은 개역한글)
// - 동네 가운데 큰 크리스마스 트리, 눈 덮인 지도, 성탄 가구는 app.js·room.js에서

import { store } from './store.js';
import { addMaterials } from './room.js';

/** 12월이면 성탄 행사 중 */
export const isXmas = (d = new Date()) => d.getMonth() === 11;
/** 지금 열 수 있는 마지막 문 번호 (12월 1~25일 → 그날, 26일 뒤 → 25, 그 밖 → 0) */
export const adventDay = (d = new Date()) => (isXmas(d) ? Math.min(25, d.getDate()) : 0);
/** 성탄절까지 남은 날 */
export const daysToXmas = (d = new Date()) => Math.max(0, 25 - d.getDate());

// 문마다 선물 (5일마다 같은 차례, 7·14·21일은 숲볼 듬뿍, 25일은 선물 상자 가구)
const CYCLE = [
  { balls: 3 },
  { snacks: 2 },
  { mats: { snowball: 3 } },
  { mats: { star: 1, petal: 1 } },
  { mats: { leaf: 2, twig: 2 } },
];
// 문마다 영어 한마디와 낱말 카드
const LINES = [
  ['Christmas is coming!', '성탄절이 다가와요!', 'christmas'],
  ['Look at the bright star!', '반짝이는 별을 봐!', 'star'],
  ['It is snowing!', '눈이 와요!', 'snow'],
  ['I can hear the bells.', '종소리가 들려요.', 'bell'],
  ['Let me light a candle.', '촛불을 켤게요.', 'candle'],
  ['The tree has lights!', '트리에 불빛이 반짝여요!', 'tree'],
  ['An angel came with good news.', '천사가 기쁜 소식을 가지고 왔어요.', 'angel'],
  ['I made a gift for you.', '너에게 줄 선물을 만들었어.', 'gift'],
  ["Let's sing together!", '같이 노래하자!', 'sing'],
  ['I love my family.', '나는 우리 가족을 사랑해요.', 'family'],
];
export const XMAS_WORDS = ['christmas', 'candle', 'angel'];

export function door(day) {
  const line = LINES[(day - 1) % LINES.length];
  let gift = CYCLE[(day - 1) % CYCLE.length];
  if (day % 7 === 0) gift = { balls: 6 };
  if (day === 24) gift = { balls: 5, snacks: 3 };
  if (day === 25) gift = { balls: 10, snacks: 5, furniture: 'giftbox' };
  if (day === 25) return { day, gift, en: 'Merry Christmas! Jesus is born!', ko: '메리 크리스마스! 예수님이 태어나셨어요!', word: 'christmas' };
  return { day, gift, en: line[0], ko: line[1], word: line[2] };
}

function A(now = new Date()) {
  const s = store.state;
  if (!s.advent || s.advent.year !== now.getFullYear()) s.advent = { year: now.getFullYear(), opened: {} };
  return s.advent;
}
export const isOpened = (day, now = new Date()) => Boolean(A(now).opened[day]);
export const openedCount = (now = new Date()) => Object.keys(A(now).opened).length;
/** 열 수 있는데 아직 안 연 문 수 (📋 배지) */
export function unopened(now = new Date()) {
  let n = 0;
  for (let d = 1; d <= adventDay(now); d++) if (!A(now).opened[d]) n++;
  return n;
}

/** 문 열기. 받은 선물 정보, 못 열면 null */
export function openDoor(day, now = new Date()) {
  if (!(day >= 1 && day <= adventDay(now)) || isOpened(day, now)) return null;
  const d = door(day);
  const s = store.state;
  A(now).opened[day] = Date.now();
  if (d.gift.balls) s.balls += d.gift.balls;
  if (d.gift.snacks) s.snacks += d.gift.snacks;
  if (d.gift.furniture) s.furniture[d.gift.furniture] = (s.furniture[d.gift.furniture] || 0) + 1;
  if (d.gift.mats) addMaterials(d.gift.mats); // 저장도 함
  else store.save();
  return d;
}

// ---------- 교회: 성탄 이야기 ----------

export const NATIVITY = [
  { icon: '👼', title: '천사가 마리아에게', body: '천사 가브리엘이 마리아에게 찾아와 "하나님의 아들을 낳을 거예요. 이름을 예수라고 하세요"라고 말했어요.',
    ref: '누가복음 1:31', text: '보라 네가 수태하여 아들을 낳으리니 그 이름을 예수라 하라' },
  { icon: '🐑', title: '구유에 누우신 아기 예수님', body: '요셉과 마리아는 베들레헴에 갔지만 묵을 방이 없었어요. 아기 예수님은 마구간에서 태어나 구유에 누우셨어요.',
    ref: '누가복음 2:7', text: '맏아들을 낳아 강보로 싸서 구유에 뉘었으니 이는 사관에 있을 곳이 없음이러라' },
  { icon: '🌟', title: '목자들에게 전한 기쁜 소식', body: '밤에 양을 지키던 목자들에게 천사가 나타나 "무서워하지 마세요. 구주가 태어나셨어요!"라고 알려 주었어요.',
    ref: '누가복음 2:10-11', text: '천사가 이르되 무서워 말라 보라 내가 온 백성에게 미칠 큰 기쁨의 좋은 소식을 너희에게 전하노라 오늘날 다윗의 동네에 너희를 위하여 구주가 나셨으니 곧 그리스도 주시니라' },
  { icon: '🎶', title: '천사들의 노래', body: '하늘의 천사들이 함께 하나님을 찬양했어요. 예수님은 세상에 평화를 주시려고 오셨어요.',
    ref: '누가복음 2:14', text: '지극히 높은 곳에서는 하나님께 영광이요 땅에서는 기뻐하심을 입은 사람들 중에 평화로다' },
  { icon: '🎁', title: '별을 따라온 동방박사', body: '먼 나라의 박사들이 반짝이는 별을 따라와 아기 예수님께 경배하고 귀한 선물을 드렸어요.',
    ref: '마태복음 2:10', text: '저희가 별을 보고 가장 크게 기뻐하고 기뻐하더라' },
];
