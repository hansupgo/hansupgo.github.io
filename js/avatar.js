// 🧑‍🎨 나의 픽셀 아바타
// - 역할(마법사·탐험가·힐러·전사·군인·공주·왕자·로봇·닌자·요리사·우주비행사·해적)마다 옷과 소품이 달라요.
// - 피부색·머리색·머리 모양을 고를 수 있어요.
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
];
export const roleById = Object.fromEntries(ROLES.map(r => [r.id, r]));

export const SKINS = ['#ffdcbd', '#f3c48f', '#d09060', '#8d5a36'];
export const HAIRS = ['#2e2a33', '#6b3e1f', '#f2c94c', '#c8452c', '#3b6fd6', '#f27fb2'];
export const HAIR_NAMES = ['검정', '갈색', '금발', '빨강', '파랑', '분홍'];
export const STYLES = [{ id: 'short', name: '짧은 머리' }, { id: 'long', name: '긴 머리' }];

export const DEFAULT_AVATAR = { role: 'explorer', skin: 0, hair: 1, style: 'short' };

/** 저장된 값·친구에게 받은 값을 믿지 않고 아는 값만 남김 */
export function cleanAvatar(a) {
  if (!a || typeof a !== 'object' || !roleById[a.role]) return null;
  const n = (v, max) => (Number.isInteger(v) && v >= 0 && v < max ? v : 0);
  return { role: a.role, skin: n(a.skin, SKINS.length), hair: n(a.hair, HAIRS.length), style: a.style === 'long' ? 'long' : 'short' };
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
  const long = av.style === 'long';
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
  }[role];
  const [top, sleeve, pants, shoes] = O;

  // ---- 뒤쪽 (망토·긴 머리) ----
  if (role === 'warrior' || role === 'prince') rect(5, 14, 10, 11, role === 'warrior' ? '#d94a4a' : '#c92a2a');
  if (long && role !== 'robot' && role !== 'ninja' && role !== 'astronaut') { rect(5, 6, 1, 9, hair); rect(14, 6, 1, 9, hair); }
  if (role === 'astronaut') rect(4, 14, 1, 6, '#ced4da'); // 산소통

  // ---- 다리·신발 ----
  rect(7, 21, 2, 5, pants); rect(11, 21, 2, 5, pants);
  if (role === 'explorer') { rect(7, 23, 2, 2, skin); rect(11, 23, 2, 2, skin); }
  rect(6, 26, 3, 2, shoes); rect(11, 26, 3, 2, shoes);

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
  if (role !== 'robot' && role !== 'ninja') {
    rect(6, 4, 8, 2, hair); px(5, 5, hair); px(14, 5, hair);
    px(6, 6, hair); px(7, 6, hair); px(12, 6, hair); px(13, 6, hair);
    px(5, 6, hair); px(14, 6, hair); px(5, 7, hair); px(14, 7, hair);
    if (long) { rect(5, 8, 1, 7, hair); rect(14, 8, 1, 7, hair); }
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
  const key = `${av.role}|${av.skin}|${av.hair}|${av.style}`;
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
