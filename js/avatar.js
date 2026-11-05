// 🧑‍🎨 나의 픽셀 아바타
// - 역할 22가지(모험·반짝반짝·꿈의 직업)마다 옷과 소품이 달라요.
// - 피부색·머리색·머리 모양(짧은·긴·양갈래·포니테일·똥머리)·머리 장식을 고를 수 있어요.
// - 26×33 칸에 한 칸씩 색을 칠한 뒤, 바깥 테두리를 자동으로 그려 픽셀 게임 느낌을 내요. (SVG로 그려 어디서나 선명)

export const ROLES = [
  { id: 'wizard', name: '마법사', en: 'Wizard', desc: '별이 빛나는 지팡이로 마법을 부려요.' },
  { id: 'explorer', name: '탐험가', en: 'Explorer', desc: '돋보기를 들고 숲속 비밀을 찾아요.' },
  { id: 'healer', name: '힐러', en: 'Healer', desc: '반짝이 물약으로 친구들을 돌봐요.' },
  { id: 'warrior', name: '전사', en: 'Warrior', desc: '방패와 칼, 망토를 두른 용감한 전사!' },
  { id: 'soldier', name: '군인', en: 'Soldier', desc: '깃발을 들고 동네를 든든하게 지켜요.' },
  { id: 'princess', name: '공주', en: 'Princess', desc: '왕관과 별 요술봉을 가진 공주님.' },
  { id: 'prince', name: '왕자', en: 'Prince', desc: '빨간 망토와 왕홀을 든 왕자님.' },
  { id: 'robot', name: '로봇', en: 'Robot', desc: '삐빅! 안테나와 스패너를 가진 로봇.' },
  { id: 'ninja', name: '닌자', en: 'Ninja', desc: '빨간 머리띠를 맨 조용한 닌자.' },
  { id: 'chef', name: '요리사', en: 'Chef', desc: '높은 모자를 쓰고 맛있는 요리를 해요.' },
  { id: 'astronaut', name: '우주비행사', en: 'Astronaut', desc: '헬멧을 쓰고 우주로 출발!' },
  { id: 'pirate', name: '해적', en: 'Pirate', desc: '망원경으로 보물섬을 찾는 해적.' },
  { id: 'fairy', name: '요정', en: 'Fairy', desc: '반짝이 날개와 꽃 화관, 별 지팡이를 가진 숲의 요정.' },
  { id: 'ballerina', name: '발레리나', en: 'Ballerina', desc: '하늘하늘 튀튀를 입고 리본을 휘날려요.' },
  { id: 'idol', name: '아이돌', en: 'Idol', desc: '반짝이 무대 옷에 마이크! 노래하고 춤춰요.' },
  { id: 'mermaid', name: '인어공주', en: 'Mermaid', desc: '반짝이는 꼬리로 바다를 헤엄쳐요.' },
  { id: 'magical', name: '마법소녀', en: 'Magical Girl', desc: '하트 요술봉으로 세상을 지켜요!' },
  { id: 'skater', name: '피겨 선수', en: 'Figure Skater', desc: '하얀 스케이트로 얼음 위를 빙글빙글.' },
  { id: 'gardener', name: '꽃 정원사', en: 'Gardener', desc: '밀짚모자를 쓰고 물뿌리개로 꽃을 키워요.' },
  { id: 'baker', name: '파티시에', en: 'Baker', desc: '달콤한 컵케이크를 만드는 제빵사.' },
  { id: 'vet', name: '수의사', en: 'Vet', desc: '청진기를 걸고 아픈 강아지를 돌봐요.' },
  { id: 'artist', name: '화가', en: 'Artist', desc: '베레모를 쓰고 팔레트로 그림을 그려요.' },
];
// 역할 묶음 (만들기 화면 탭)
export const ROLE_CATS = [
  { id: 'all', name: '전체' },
  { id: 'adv', name: '🗡️ 모험', roles: ['wizard', 'explorer', 'warrior', 'soldier', 'ninja', 'pirate', 'robot', 'astronaut'] },
  { id: 'sparkle', name: '👑 반짝반짝', roles: ['princess', 'prince', 'fairy', 'ballerina', 'idol', 'mermaid', 'magical', 'skater'] },
  { id: 'job', name: '💼 꿈의 직업', roles: ['healer', 'chef', 'gardener', 'baker', 'vet', 'artist'] },
];
export const roleById = Object.fromEntries(ROLES.map(r => [r.id, r]));

export const SKINS = ['#ffdcbd', '#f3c48f', '#d09060', '#8d5a36'];
export const HAIRS = ['#2e2a33', '#6b3e1f', '#f2c94c', '#c8452c', '#3b6fd6', '#f27fb2'];
export const HAIR_NAMES = ['검정', '갈색', '금발', '빨강', '파랑', '분홍'];
export const STYLES = [
  { id: 'short', name: '짧은 머리' }, { id: 'long', name: '긴 머리' }, { id: 'pigtails', name: '양갈래' },
  { id: 'ponytail', name: '포니테일' }, { id: 'bun', name: '똥머리' },
];
export const ACCS = [
  { id: 'none', name: '없음' }, { id: 'ribbon', name: '🎀 리본' }, { id: 'flower', name: '🌸 꽃핀' },
  { id: 'headband', name: '머리띠' }, { id: 'star', name: '⭐ 별핀' },
];
const STYLE_IDS = STYLES.map(x => x.id);
const ACC_IDS = ACCS.map(x => x.id);

export const DEFAULT_AVATAR = { role: 'explorer', skin: 0, hair: 1, style: 'short', acc: 'none' };

/** 저장된 값·친구에게 받은 값을 믿지 않고 아는 값만 남김 */
export function cleanAvatar(a) {
  if (!a || typeof a !== 'object' || !roleById[a.role]) return null;
  const n = (v, max) => (Number.isInteger(v) && v >= 0 && v < max ? v : 0);
  return {
    role: a.role, skin: n(a.skin, SKINS.length), hair: n(a.hair, HAIRS.length),
    style: STYLE_IDS.includes(a.style) ? a.style : 'short', acc: ACC_IDS.includes(a.acc) ? a.acc : 'none',
  };
}

const W = 26;
const H = 33;
const OX = 2; // 그림 좌표 → 칸 좌표 (테두리 자리)
const OY = 2;
const OUT = '#2b2233';

const C = {
  eye: '#2b2233', blush: '#ff9aa8', mouth: '#c0505a', gold: '#f2c94c', goldDark: '#c99a1e', white: '#ffffff',
  wood: '#8b5a2b', woodDark: '#5e3b1b', steel: '#cfd8e3', steelDark: '#8a96a3', red: '#e5484d', redDark: '#b12f34',
};

function draw(av) {
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const px = (x, y, c) => { const gx = x + OX, gy = y + OY; if (gx >= 0 && gy >= 0 && gx < W && gy < H) g[gy][gx] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const skin = av.role === 'robot' ? '#c3ccd6' : SKINS[av.skin];
  const hair = HAIRS[av.hair];
  const long = av.style === 'long' || av.style === 'pigtails';
  const role = av.role;

  // 옷 색 (윗옷, 소매, 바지, 신발)
  const O = {
    wizard: ['#6c4bd1', '#6c4bd1', '#6c4bd1', '#3d2a80'],
    explorer: ['#c9a96e', '#c9a96e', '#7a5230', '#4a2f1b'],
    healer: ['#f7f7fb', '#f7f7fb', '#9fd3ef', '#e8e8f0'],
    warrior: ['#b8c2cc', '#8a96a3', '#5a4632', '#3b2a1f'],
    soldier: ['#5b7a3a', '#5b7a3a', '#5b7a3a', '#2b2b2b'],
    princess: ['#ff9ccf', '#ffd1e8', '#ff9ccf', '#d94f93'],
    prince: ['#3b5bdb', '#3b5bdb', '#f1f1f1', '#2b2b33'],
    robot: ['#9aa7b5', '#9aa7b5', '#8796a5', '#5d6b7a'],
    ninja: ['#2c2f4a', '#2c2f4a', '#2c2f4a', '#1b1d2e'],
    chef: ['#ffffff', '#ffffff', '#4a4f5a', '#2b2b33'],
    astronaut: ['#f1f3f5', '#f1f3f5', '#f1f3f5', '#868e96'],
    pirate: ['#ffffff', '#ffffff', '#4a3324', '#1f1a17'],
    fairy: ['#8ce99a', '#b2f2bb', '#ffe3ec', '#51cf66'],
    ballerina: ['#ffc9de', '#ffc9de', '#ffe3ec', '#f783ac'],
    idol: ['#9775fa', '#b197fc', skin, '#ffffff'],
    mermaid: ['#b197fc', '#d0bfff', '#38d9a9', '#20c997'],
    magical: ['#ffffff', '#ffffff', skin, '#f783ac'],
    skater: ['#3bc9db', '#99e9f2', '#ffe3ec', '#ffffff'],
    gardener: ['#ffffff', '#ffffff', '#5c940d', '#8b5a2b'],
    baker: ['#ffffff', '#ffffff', '#f783ac', '#c2255c'],
    vet: ['#74c0fc', '#74c0fc', '#74c0fc', '#ffffff'],
    artist: ['#fff9db', '#fff9db', '#4dabf7', '#495057'],
  }[role];
  const noHair = role === 'robot' || role === 'ninja';
  const hideBack = noHair || role === 'astronaut';
  const style = av.style;
  const [top, sleeve, pants, shoes] = O;

  // ---- 뒤쪽 (망토·긴 머리) ----
  if (role === 'warrior' || role === 'prince') rect(5, 14, 10, 11, role === 'warrior' ? '#d94a4a' : '#c92a2a');
  if (av.style === 'long' && !hideBack) { rect(5, 6, 1, 9, hair); rect(14, 6, 1, 9, hair); }
  if (role === 'fairy') { // 반짝이 날개
    const wg = '#c5f6fa';
    rect(1, 11, 4, 4, wg); rect(2, 15, 3, 3, wg); rect(15, 11, 4, 4, wg); rect(15, 15, 3, 3, wg);
    px(2, 12, '#ffffff'); px(16, 12, '#ffffff'); px(3, 16, '#e3fafc'); px(16, 16, '#e3fafc');
  }
  if (role === 'astronaut') rect(4, 14, 1, 6, '#ced4da'); // 산소통

  // ---- 다리·신발 (인어공주는 꼬리) ----
  if (role !== 'mermaid') {
    rect(7, 21, 2, 5, pants); rect(11, 21, 2, 5, pants);
    if (role === 'explorer') { rect(7, 23, 2, 2, skin); rect(11, 23, 2, 2, skin); }
    rect(6, 26, 3, 2, shoes); rect(11, 26, 3, 2, shoes);
  }

  // ---- 몸통·팔 ----
  rect(6, 14, 8, 7, top);
  rect(4, 14, 2, 6, sleeve); rect(14, 14, 2, 6, sleeve);
  rect(4, 20, 2, 1, role === 'robot' ? '#7b8794' : skin); rect(14, 20, 2, 1, role === 'robot' ? '#7b8794' : skin);
  rect(9, 13, 2, 1, skin); // 목

  // ---- 머리(얼굴) ----
  rect(6, 5, 8, 7, skin);
  rect(7, 12, 6, 1, skin); // 턱
  if (role !== 'robot') {
    rect(8, 8, 1, 2, C.eye); rect(11, 8, 1, 2, C.eye);
    px(8, 8, '#4a3f55');
    px(7, 10, C.blush); px(12, 10, C.blush);
    rect(9, 11, 2, 1, C.mouth);
  }
  // 머리카락 (모자 아래로 앞머리·옆머리)
  if (!noHair) {
    rect(6, 4, 8, 2, hair); px(5, 5, hair); px(14, 5, hair);
    px(6, 6, hair); px(7, 6, hair); px(12, 6, hair); px(13, 6, hair);
    px(5, 6, hair); px(14, 6, hair); px(5, 7, hair); px(14, 7, hair);
    if (style === 'long') { rect(5, 8, 1, 7, hair); rect(14, 8, 1, 7, hair); }
    if (style === 'pigtails') { // 양갈래
      px(4, 7, '#f06595'); px(15, 7, '#f06595');
      rect(3, 8, 2, 4, hair); rect(15, 8, 2, 4, hair); px(3, 12, hair); px(16, 12, hair);
    }
    if (style === 'ponytail') { px(15, 5, '#f06595'); rect(15, 6, 2, 4, hair); rect(15, 10, 1, 3, hair); }
    if (style === 'bun') { rect(8, 2, 4, 2, hair); rect(9, 1, 2, 1, hair); px(9, 2, hair); }
    // 머리 장식 (모자를 쓰면 모자가 덮어요)
    const PK = '#f06595';
    if (av.acc === 'ribbon') { px(5, 2, PK); px(5, 3, PK); px(7, 2, PK); px(7, 3, PK); px(6, 3, '#c2255c'); }
    if (av.acc === 'flower') { px(12, 4, '#ffd43b'); px(11, 4, '#ff8fb8'); px(13, 4, '#ff8fb8'); px(12, 3, '#ff8fb8'); px(12, 5, '#ff8fb8'); }
    if (av.acc === 'headband') rect(6, 4, 8, 1, PK);
    if (av.acc === 'star') { px(12, 3, '#ffd43b'); px(11, 4, '#ffd43b'); px(12, 4, '#fff3bf'); px(13, 4, '#ffd43b'); px(12, 5, '#ffd43b'); }
  }

  // ---- 역할별 옷 무늬·모자·소품 ----
  switch (role) {
    case 'wizard': {
      rect(6, 21, 8, 5, top); rect(6, 25, 8, 1, C.gold); // 긴 로브
      rect(6, 18, 8, 1, C.gold); px(8, 16, '#ffe066'); px(12, 22, '#ffe066'); px(7, 23, '#ffe066');
      rect(4, 4, 12, 1, '#5a3cc0'); rect(6, 3, 8, 1, '#6c4bd1'); rect(7, 2, 6, 1, '#6c4bd1');
      rect(8, 1, 4, 1, '#6c4bd1'); rect(9, 0, 2, 1, '#6c4bd1'); px(10, -1, '#6c4bd1'); px(9, 2, '#ffe066'); px(11, 3, '#ffe066');
      rect(17, 9, 1, 19, C.wood); rect(16, 7, 3, 2, '#5fd3ff'); px(17, 6, '#bff3ff'); px(16, 7, '#a5ecff');
      break;
    }
    case 'explorer': {
      rect(7, 14, 1, 5, '#7a5230'); rect(12, 14, 1, 5, '#7a5230'); rect(9, 16, 2, 2, '#b08c4f');
      rect(6, 20, 8, 1, '#5e3b1b'); px(10, 20, C.gold);
      rect(7, 1, 6, 1, '#e8d6a8'); rect(6, 2, 8, 2, '#e8d6a8'); rect(4, 4, 12, 1, '#d8c38e'); rect(6, 3, 8, 1, '#a07d3d');
      rect(17, 21, 1, 3, C.wood); rect(16, 16, 4, 1, C.steelDark); rect(16, 20, 4, 1, C.steelDark);
      rect(15, 17, 1, 3, C.steelDark); rect(20, 17, 1, 3, C.steelDark); rect(16, 17, 4, 3, '#bfe8ff'); px(17, 17, '#ffffff');
      break;
    }
    case 'healer': {
      rect(9, 15, 2, 4, C.red); rect(8, 16, 4, 2, C.red);
      rect(6, 20, 8, 1, '#9fd3ef');
      rect(7, 3, 6, 2, '#ffffff'); px(9, 3, C.red); px(10, 3, C.red); px(9, 2, C.red); px(10, 2, '#ffffff');
      rect(7, 2, 6, 1, '#ffffff'); px(9, 2, C.red);
      px(17, 14, C.wood); px(17, 15, '#dfe7ef'); rect(16, 16, 3, 4, '#ff7eb6'); px(16, 16, '#ffc2dc'); px(18, 19, '#e0559a');
      break;
    }
    case 'warrior': {
      rect(6, 14, 8, 1, C.steelDark); rect(9, 15, 2, 4, C.steelDark); rect(6, 20, 8, 1, C.wood); px(10, 20, C.gold);
      rect(6, 2, 8, 3, C.steel); rect(5, 4, 1, 5, C.steel); rect(14, 4, 1, 5, C.steel); rect(6, 4, 8, 1, C.steelDark);
      rect(9, 0, 2, 2, C.red);
      rect(17, 6, 1, 13, '#e6edf3'); px(17, 5, '#ffffff'); rect(16, 19, 3, 1, C.gold); rect(17, 20, 1, 2, C.wood);
      rect(1, 15, 4, 6, C.red); rect(2, 16, 2, 4, C.redDark); px(2, 17, C.gold); px(3, 18, C.gold);
      break;
    }
    case 'soldier': {
      for (const [x, y] of [[7, 15], [11, 16], [8, 18], [12, 19], [7, 22], [12, 23], [4, 16], [15, 18]]) px(x, y, '#3f5a26');
      for (const [x, y] of [[10, 15], [6, 17], [13, 15], [9, 20], [11, 22]]) px(x, y, '#8a9a5b');
      rect(6, 20, 8, 1, '#3b2a1f');
      rect(6, 2, 8, 1, '#4f6b30'); rect(5, 3, 10, 2, '#5b7a3a'); px(8, 3, '#3f5a26'); px(12, 4, '#3f5a26');
      rect(17, 8, 1, 14, '#9aa3ad'); rect(18, 8, 5, 4, '#ffffff'); px(20, 9, C.red); px(21, 9, C.red); px(20, 10, '#3b6fd6'); px(21, 10, '#3b6fd6');
      break;
    }
    case 'princess': {
      rect(5, 20, 10, 1, '#ff9ccf'); rect(4, 21, 12, 3, '#ff9ccf'); rect(3, 24, 14, 2, '#ff9ccf');
      rect(3, 25, 14, 1, '#ffd1e8'); px(7, 22, '#ffffff'); px(12, 23, '#ffffff'); px(9, 15, '#ffffff'); px(10, 15, '#ffffff');
      rect(7, 3, 6, 1, C.gold); px(7, 2, C.gold); px(9, 2, C.gold); px(10, 2, C.gold); px(12, 2, C.gold); px(9, 1, C.gold); px(10, 1, C.gold);
      px(9, 3, C.red); px(10, 3, '#5fd3ff');
      rect(17, 14, 1, 7, '#fff3bf'); rect(16, 12, 3, 1, '#ffe066'); rect(17, 11, 1, 3, '#ffe066'); px(17, 12, '#fff');
      break;
    }
    case 'prince': {
      px(9, 15, C.gold); px(9, 17, C.gold); px(9, 19, C.gold); rect(6, 14, 1, 6, C.gold); rect(13, 14, 1, 6, C.gold);
      rect(6, 20, 8, 1, C.gold);
      rect(7, 3, 6, 1, C.gold); px(7, 2, C.gold); px(10, 2, C.gold); px(12, 2, C.gold); px(9, 3, C.red);
      rect(17, 12, 1, 10, C.gold); rect(16, 10, 3, 2, C.red); px(16, 10, '#ff8787');
      break;
    }
    case 'robot': {
      rect(8, 15, 4, 4, '#5d6b7a'); px(9, 16, C.red); px(10, 16, '#51cf66'); px(9, 17, '#ffd43b'); px(10, 17, '#5fd3ff');
      rect(6, 20, 8, 1, '#5d6b7a');
      rect(7, 8, 6, 2, '#2f3b4a'); px(8, 8, '#66f0ff'); px(11, 8, '#66f0ff'); rect(8, 11, 4, 1, '#5d6b7a');
      px(5, 8, '#7b8794'); px(14, 8, '#7b8794'); px(5, 9, '#7b8794'); px(14, 9, '#7b8794');
      rect(6, 4, 8, 1, '#aab6c3'); rect(10, 1, 1, 3, '#7b8794'); px(10, 0, C.red);
      rect(17, 13, 1, 9, '#adb5bd'); px(16, 11, '#adb5bd'); px(18, 11, '#adb5bd'); px(16, 12, '#adb5bd'); px(17, 12, '#adb5bd'); px(18, 12, '#adb5bd');
      break;
    }
    case 'ninja': {
      rect(6, 4, 8, 4, '#2c2f4a'); rect(6, 10, 8, 2, '#2c2f4a'); rect(7, 12, 6, 1, '#2c2f4a'); px(6, 8, '#2c2f4a'); px(6, 9, '#2c2f4a'); px(13, 8, '#2c2f4a'); px(13, 9, '#2c2f4a');
      rect(6, 6, 8, 1, C.red); px(14, 6, C.red); px(15, 7, C.red); px(15, 6, C.red);
      rect(6, 19, 8, 1, C.red); rect(6, 15, 1, 1, '#4a4f72'); rect(13, 15, 1, 1, '#4a4f72');
      rect(16, 16, 3, 4, '#fff1d6'); rect(16, 16, 3, 1, C.redDark); rect(16, 19, 3, 1, C.redDark);
      break;
    }
    case 'chef': {
      px(8, 15, '#adb5bd'); px(11, 15, '#adb5bd'); px(8, 17, '#adb5bd'); px(11, 17, '#adb5bd'); px(8, 19, '#adb5bd'); px(11, 19, '#adb5bd');
      rect(8, 13, 4, 1, C.red); px(9, 14, C.red); px(10, 14, C.red);
      rect(7, 3, 6, 2, '#ffffff'); rect(6, 0, 8, 3, '#ffffff'); rect(7, -1, 6, 1, '#ffffff'); px(9, 1, '#e9ecef'); px(11, 0, '#e9ecef');
      rect(7, 4, 6, 1, '#e9ecef');
      rect(17, 14, 1, 8, C.wood); rect(16, 10, 3, 4, '#ced4da'); px(16, 10, '#f1f3f5');
      break;
    }
    case 'astronaut': {
      rect(8, 15, 4, 3, '#dee2e6'); px(9, 16, C.red); px(10, 16, '#4dabf7'); px(9, 15, '#ffd43b');
      rect(4, 16, 2, 1, '#4dabf7'); rect(14, 16, 2, 1, '#4dabf7'); rect(7, 23, 2, 1, '#4dabf7'); rect(11, 23, 2, 1, '#4dabf7');
      rect(6, 20, 8, 1, '#adb5bd');
      rect(7, 2, 6, 1, '#e9ecef'); rect(5, 3, 10, 1, '#e9ecef'); rect(4, 4, 1, 9, '#e9ecef'); rect(15, 4, 1, 9, '#e9ecef'); rect(5, 13, 10, 1, '#e9ecef');
      px(5, 4, '#e9ecef'); px(14, 4, '#e9ecef'); px(6, 4, '#a5d8ff'); px(13, 4, '#a5d8ff'); px(5, 12, '#e9ecef'); px(14, 12, '#e9ecef');
      rect(17, 9, 1, 13, '#9aa3ad'); rect(18, 9, 4, 3, '#4dabf7'); px(19, 10, '#ffe066');
      break;
    }
    case 'pirate': {
      for (const y of [15, 17, 19]) rect(6, y, 8, 1, C.red);
      px(4, 15, C.red); px(5, 15, C.red); px(14, 15, C.red); px(15, 15, C.red); px(4, 17, C.red); px(5, 17, C.red); px(14, 17, C.red); px(15, 17, C.red);
      rect(6, 20, 8, 1, '#3b2a1f'); px(10, 20, C.gold);
      rect(6, 3, 8, 3, C.red); px(8, 4, '#ffffff'); px(11, 3, '#ffffff'); px(14, 5, C.red); px(15, 6, C.red); px(15, 5, C.redDark);
      rect(11, 8, 2, 2, '#1b1b1b'); px(12, 7, '#1b1b1b'); px(13, 6, '#1b1b1b');
      rect(16, 16, 5, 2, C.gold); rect(16, 16, 1, 2, C.goldDark); rect(19, 16, 1, 2, C.wood); px(20, 16, '#bfe8ff');
      break;
    }
  }

  switch (role) {
    case 'fairy': {
      rect(5, 20, 10, 1, '#8ce99a'); rect(4, 21, 12, 1, '#69db7c'); for (const x of [4, 7, 10, 13, 15]) px(x, 22, '#69db7c');
      for (const [x, c] of [[6, '#ff8787'], [8, '#ffd43b'], [10, '#ff8787'], [12, '#ffd43b']]) px(x, 3, c);
      px(9, 16, '#ffffff'); px(10, 17, '#ffffff');
      rect(17, 14, 1, 7, '#e9ecef'); rect(16, 12, 3, 1, '#74c0fc'); rect(17, 11, 1, 3, '#74c0fc'); px(17, 12, '#ffffff');
      break;
    }
    case 'ballerina': {
      rect(3, 20, 14, 2, '#ffdeeb'); px(2, 21, '#ffdeeb'); px(17, 21, '#ffdeeb'); rect(4, 22, 12, 1, '#fcc2d7');
      px(9, 15, '#f783ac'); px(10, 15, '#f783ac'); px(7, 25, '#f783ac'); px(12, 25, '#f783ac');
      rect(8, 3, 4, 1, '#e9ecef'); px(9, 2, '#a5d8ff'); px(10, 2, '#e9ecef');
      rect(17, 15, 1, 6, '#adb5bd');
      for (const [x, y] of [[17, 14], [18, 13], [19, 12], [19, 11], [18, 10], [17, 9], [16, 9], [16, 8], [17, 7]]) px(x, y, '#f783ac');
      break;
    }
    case 'idol': {
      px(8, 16, '#fff3bf'); px(11, 18, '#fff3bf'); px(12, 15, '#ffffff'); px(7, 19, '#ffffff');
      rect(5, 20, 10, 3, '#f783ac'); for (const x of [7, 9, 11, 13]) px(x, 21, '#e64980');
      rect(7, 24, 2, 2, '#ffffff'); rect(11, 24, 2, 2, '#ffffff');
      rect(17, 16, 1, 5, '#343a40'); rect(16, 14, 2, 2, '#adb5bd'); px(16, 14, '#dee2e6');
      for (const [x, y] of [[21, 9], [21, 10], [21, 11], [20, 11], [22, 9]]) px(x, y, '#9775fa');
      break;
    }
    case 'mermaid': {
      const T = '#38d9a9';
      rect(6, 20, 8, 3, T); rect(7, 23, 6, 2, T); rect(8, 25, 4, 1, T);
      rect(5, 26, 4, 2, '#20c997'); rect(11, 26, 4, 2, '#20c997'); px(9, 26, '#20c997'); px(10, 26, '#20c997');
      for (const [x, y] of [[8, 21], [11, 21], [10, 22], [9, 23], [11, 24], [7, 22]]) px(x, y, '#96f2d7');
      px(8, 15, '#ffc9de'); px(11, 15, '#ffc9de'); px(6, 19, '#d0bfff');
      rect(16, 17, 3, 3, '#ffc9de'); px(17, 16, '#ffc9de'); px(17, 18, '#f783ac'); px(16, 19, '#f783ac'); px(18, 19, '#f783ac');
      break;
    }
    case 'magical': {
      rect(6, 14, 8, 1, '#4dabf7'); px(5, 14, '#4dabf7'); px(14, 14, '#4dabf7');
      px(8, 15, '#f06595'); px(11, 15, '#f06595'); px(8, 16, '#f06595'); px(11, 16, '#f06595'); px(9, 15, '#c2255c'); px(10, 15, '#c2255c');
      rect(5, 20, 10, 2, '#4dabf7'); for (const x of [7, 10, 12]) px(x, 21, '#339af0');
      rect(6, 24, 3, 2, '#f783ac'); rect(11, 24, 3, 2, '#f783ac');
      rect(8, 3, 4, 1, C.gold); px(9, 2, C.gold); px(10, 2, '#f06595');
      rect(17, 14, 1, 7, '#ffd43b');
      for (const [x, y] of [[16, 11], [18, 11], [16, 12], [17, 12], [18, 12], [17, 13]]) px(x, y, '#f06595');
      px(16, 11, '#ffa8c5');
      break;
    }
    case 'skater': {
      rect(5, 20, 10, 2, '#3bc9db'); px(4, 21, '#3bc9db'); px(15, 21, '#3bc9db');
      px(7, 16, '#ffffff'); px(11, 18, '#ffffff'); px(9, 20, '#ffffff'); px(12, 15, '#e3fafc');
      rect(6, 28, 3, 1, '#adb5bd'); rect(11, 28, 3, 1, '#adb5bd');
      for (const [x, y] of [[18, 9], [17, 10], [18, 10], [19, 10], [18, 11]]) px(x, y, '#a5d8ff');
      px(1, 12, '#a5d8ff'); px(18, 15, '#a5d8ff'); px(2, 17, '#d0ebff');
      break;
    }
    case 'gardener': {
      rect(7, 16, 6, 5, '#5c940d'); rect(7, 14, 1, 2, '#5c940d'); rect(12, 14, 1, 2, '#5c940d'); px(9, 17, '#82c91e'); px(10, 17, '#82c91e');
      rect(4, 4, 12, 1, '#f2c86b'); rect(6, 2, 8, 2, '#f2c86b'); rect(6, 3, 8, 1, '#e8590c'); px(12, 2, '#ff8787'); px(13, 2, '#ffd43b');
      rect(16, 16, 3, 3, '#74c0fc'); px(19, 16, '#74c0fc'); px(20, 15, '#74c0fc'); px(21, 14, '#4dabf7');
      px(16, 15, '#4dabf7'); px(17, 14, '#4dabf7'); px(18, 15, '#4dabf7'); px(22, 15, '#a5d8ff'); px(22, 17, '#a5d8ff'); px(21, 16, '#a5d8ff');
      break;
    }
    case 'baker': {
      rect(7, 16, 6, 6, '#f783ac'); rect(6, 16, 1, 1, '#f783ac'); rect(13, 16, 1, 1, '#f783ac'); px(9, 18, '#fcc2d7'); px(10, 18, '#fcc2d7');
      rect(6, 3, 8, 2, '#f783ac'); px(5, 4, '#f783ac'); px(10, 2, '#c2255c');
      rect(16, 18, 3, 2, '#c08457'); px(16, 19, '#a0673a'); rect(16, 16, 3, 2, '#ffc9de'); px(17, 15, '#e03131'); px(16, 16, '#74c0fc'); px(18, 17, '#ffd43b');
      break;
    }
    case 'vet': {
      for (const [x, y] of [[8, 14], [8, 15], [9, 16], [10, 16], [11, 15], [11, 14]]) px(x, y, '#495057');
      px(10, 17, '#adb5bd'); rect(6, 20, 8, 1, '#4dabf7');
      rect(16, 18, 4, 2, '#c08457'); rect(19, 16, 2, 2, '#c08457'); px(20, 15, '#8b5a2b'); px(20, 16, '#2b2233');
      px(16, 17, '#c08457'); px(16, 20, '#8b5a2b'); px(19, 20, '#8b5a2b'); px(21, 17, '#2b2233');
      break;
    }
    case 'artist': {
      px(8, 16, '#ff6b6b'); px(11, 17, '#4dabf7'); px(9, 19, '#ffd43b'); px(12, 19, '#51cf66');
      rect(6, 3, 8, 2, '#e03131'); px(5, 4, '#e03131'); px(10, 2, '#c92a2a');
      rect(16, 16, 4, 3, '#d9a066'); px(16, 16, '#ff6b6b'); px(18, 16, '#4dabf7'); px(17, 18, '#ffd43b'); px(19, 17, '#51cf66');
      rect(20, 12, 1, 4, '#8b5a2b'); px(20, 11, '#ff6b6b');
      break;
    }
  }

  // ---- 바깥 테두리 ----
  const out = g.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== '#00000000');
    if (near) out[y][x] = OUT;
  }
  return out;
}

const cache = new Map();

/**
 * 아바타 SVG. opts.size: 높이(px), opts.head: 얼굴만(동그란 칸에 넣을 때), opts.cls: 클래스
 */
export function avatarSVG(a, opts = {}) {
  const av = cleanAvatar(a) || DEFAULT_AVATAR;
  const key = `${av.role}|${av.skin}|${av.hair}|${av.style}|${av.acc}`;
  let body = cache.get(key);
  if (!body) {
    const g = draw(av);
    const parts = [];
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const c = g[y][x];
        if (!c || c === '#00000000') { x++; continue; }
        let w = 1;
        while (x + w < W && g[y][x + w] === c) w++;
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`);
        x += w;
      }
    }
    body = parts.join('');
    cache.set(key, body);
  }
  const r = roleById[av.role];
  const vb = opts.head ? `${OX + 1} ${OY - 1} 18 18` : `0 0 ${W} ${H}`;
  const h = opts.size || 96;
  const w = opts.head ? h : Math.round((h * W) / H);
  return `<svg class="px-avatar ${opts.cls || ''}" viewBox="${vb}" width="${w}" height="${h}" shape-rendering="crispEdges" role="img" aria-label="${r.name} 아바타">${body}</svg>`;
}
