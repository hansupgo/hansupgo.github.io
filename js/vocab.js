// 영어 단어 카드 + 짝꿍 퀴즈
// - 게임에서 만난 것(잡은 친구, 만든 가구, 거둔 작물, 짝꿍 돌보기, 대화에 나온 낱말)이 단어 카드로 모여요.
// - 짝꿍이 "What's this?" 하고 물어보면 그림을 보고 영어를 고르거나, 소리를 듣고 그림을 골라요.
// - 자주 틀린 낱말, 오래 안 본 낱말이 퀴즈에 먼저 나와요. 세 번 맞히면 ⭐⭐⭐.

import { store } from './store.js';

// cat: animal(동물·곤충) / nature(자연) / food(먹을 것) / home(집) / feel(기분) / do(하는 일)
// [영어, 한국어, 그림, 분류, 예문 영어, 예문 한국어]
const RAW = [
  ['cat', '고양이', '🐱', 'animal', 'The cat is sleeping.', '고양이가 자고 있어.'],
  ['dog', '강아지', '🐶', 'animal', 'My dog likes balls.', '우리 강아지는 공을 좋아해.'],
  ['bird', '새', '🐦', 'animal', 'A bird is singing.', '새가 노래해.'],
  ['duck', '오리', '🦆', 'animal', 'The duck can swim.', '오리는 헤엄칠 수 있어.'],
  ['rabbit', '토끼', '🐰', 'animal', 'The rabbit hops fast.', '토끼가 빨리 깡충 뛰어.'],
  ['hedgehog', '고슴도치', '🦔', 'animal', 'A hedgehog is round.', '고슴도치는 동그래.'],
  ['frog', '개구리', '🐸', 'animal', 'The frog says ribbit.', '개구리가 개굴개굴해.'],
  ['fish', '물고기', '🐟', 'animal', 'Fish live in water.', '물고기는 물에 살아.'],
  ['turtle', '거북', '🐢', 'animal', 'The turtle is slow.', '거북은 느려.'],
  ['squirrel', '다람쥐', '🐿️', 'animal', 'The squirrel has an acorn.', '다람쥐가 도토리를 가졌어.'],
  ['raccoon', '너구리', '🦝', 'animal', 'The raccoon has a mask.', '너구리는 가면을 썼어.'],
  ['ladybug', '무당벌레', '🐞', 'animal', 'The ladybug is red.', '무당벌레는 빨개.'],
  ['butterfly', '나비', '🦋', 'animal', 'Look at the butterfly!', '나비 좀 봐!'],
  ['bug', '벌레', '🐛', 'animal', 'Look! A little bug!', '봐! 작은 벌레야!'],
  ['beetle', '딱정벌레', '🪲', 'animal', 'The beetle is strong.', '딱정벌레는 힘이 세.'],
  ['bee', '벌', '🐝', 'animal', 'The bee loves flowers.', '벌은 꽃을 좋아해.'],
  ['ant', '개미', '🐜', 'animal', 'Ants work hard.', '개미는 열심히 일해.'],
  ['flower', '꽃', '🌸', 'nature', 'This flower smells nice.', '이 꽃 냄새 좋다.'],
  ['tree', '나무', '🌳', 'nature', 'The tree is tall.', '나무가 키가 커.'],
  ['leaf', '나뭇잎', '🍃', 'nature', 'A leaf is falling.', '나뭇잎이 떨어져.'],
  ['rock', '돌', '🪨', 'nature', 'I found a smooth rock.', '매끈한 돌을 찾았어.'],
  ['shell', '조개껍데기', '🐚', 'nature', 'I found a shell.', '조개껍데기를 찾았어.'],
  ['star', '별', '⭐', 'nature', 'I see a star!', '별이 보여!'],
  ['moon', '달', '🌙', 'nature', 'The moon is bright.', '달이 밝아.'],
  ['sun', '해', '☀️', 'nature', 'The sun is hot.', '해가 뜨거워.'],
  ['cloud', '구름', '☁️', 'nature', 'The cloud is fluffy.', '구름이 폭신해.'],
  ['rain', '비', '🌧️', 'nature', "It's raining.", '비가 와.'],
  ['snow', '눈', '❄️', 'nature', "Let's play in the snow!", '눈에서 놀자!'],
  ['water', '물', '💧', 'nature', 'Plants need water.', '식물은 물이 필요해.'],
  ['fire', '불', '🔥', 'nature', 'Fire is hot. Be careful!', '불은 뜨거워. 조심해!'],
  ['mushroom', '버섯', '🍄', 'nature', 'A mushroom grew here.', '여기 버섯이 자랐어.'],
  ['acorn', '도토리', '🌰', 'nature', 'Squirrels love acorns.', '다람쥐는 도토리를 좋아해.'],
  ['ice', '얼음', '🧊', 'nature', 'Ice is cold.', '얼음은 차가워.'],
  ['strawberry', '딸기', '🍓', 'food', 'I love strawberries!', '딸기 정말 좋아!'],
  ['tomato', '토마토', '🍅', 'food', 'The tomato is red.', '토마토는 빨개.'],
  ['lettuce', '상추', '🥬', 'food', 'Lettuce is crunchy.', '상추는 아삭해.'],
  ['pumpkin', '호박', '🎃', 'food', 'What a big pumpkin!', '호박 진짜 크다!'],
  ['sunflower', '해바라기', '🌻', 'nature', 'The sunflower looks at the sun.', '해바라기가 해를 봐.'],
  ['cookie', '쿠키', '🍪', 'food', 'Can I have a cookie?', '쿠키 하나 먹어도 돼?'],
  ['milk', '우유', '🥛', 'food', 'I drink milk every day.', '난 매일 우유를 마셔.'],
  ['bread', '빵', '🍞', 'food', 'Birds like bread crumbs.', '새들은 빵 부스러기를 좋아해.'],
  ['bed', '침대', '🛏️', 'home', 'Time for bed!', '잘 시간이야!'],
  ['chair', '의자', '🪑', 'home', 'Sit on the chair.', '의자에 앉아.'],
  ['light', '불빛', '💡', 'home', 'Turn on the light.', '불 켜.'],
  ['book', '책', '📚', 'home', 'Can you read me a book?', '책 읽어 줄래?'],
  ['window', '창문', '🪟', 'home', 'Open the window.', '창문 열어.'],
  ['picture', '그림', '🖼️', 'home', 'I drew a picture.', '그림을 그렸어.'],
  ['bell', '종', '🔔', 'home', 'The bell is ringing.', '종이 울려.'],
  ['ball', '공', '⚽', 'home', 'Throw the ball!', '공 던져!'],
  ['gift', '선물', '🎁', 'home', 'This gift is for you.', '이 선물은 너를 위한 거야.'],
  ['crown', '왕관', '👑', 'home', 'The king has a crown.', '왕은 왕관을 써.'],
  ['happy', '기쁜', '😊', 'feel', "I'm so happy!", '나 정말 기뻐!'],
  ['sleepy', '졸린', '😴', 'feel', "I'm sleepy.", '나 졸려.'],
  ['hungry', '배고픈', '😋', 'feel', "I'm hungry!", '배고파!'],
  ['tired', '피곤한', '🥱', 'feel', "I'm a little tired.", '좀 피곤해.'],
  ['eat', '먹다', '🍽️', 'do', "Let's eat!", '먹자!'],
  ['play', '놀다', '🤸', 'do', "Let's play together!", '같이 놀자!'],
  ['sleep', '자다', '💤', 'do', 'Sleep well!', '잘 자!'],
  ['walk', '걷다', '🚶', 'do', "Let's go for a walk.", '산책 가자.'],
  ['swim', '헤엄치다', '🏊', 'do', 'Fish can swim.', '물고기는 헤엄칠 수 있어.'],
  ['school', '학교', '🏫', 'home', 'I go to school.', '난 학교에 가.'],
  ['friend', '친구', '🧑‍🤝‍🧑', 'feel', "You're my best friend!", '넌 내 제일 친한 친구야!'],
];
export const WORDS = RAW.map(([en, ko, pic, cat, exEn, exKo]) => ({ en, ko, pic, cat, ex: [exEn, exKo] }));
export const wordByEn = Object.fromEntries(WORDS.map(w => [w.en, w]));
export const CATS = { animal: '🐾 동물·곤충', nature: '🌿 자연', food: '🍓 먹을 것', home: '🏠 집·물건', feel: '😊 기분', do: '🏃 하는 일' };

// 잡은 친구 → 낱말
const SPECIES_WORDS = {
  sumbbong: ['leaf'], mulbangkong: ['water'], gureumsom: ['cloud'], dotoriram: ['squirrel', 'acorn'], bulssikkomi: ['fire'],
  agoknoguri: ['raccoon'], banjjakbandi: ['light', 'bug'], dalbittokki: ['moon', 'rabbit'], chaekbeolmung: ['book'], jongsorinyang: ['bell', 'cat'],
  kkotbyeori: ['flower'], hansupwang: ['crown'], beoseokkongi: ['mushroom'], byeolttongi: ['star'], ppulppuri: ['rock'], eoreumbangul: ['ice'],
  mudangbyeori: ['ladybug'], noranapuri: ['butterfly'], gochujamdori: ['bug'], janggubbul: ['beetle'], jipgewang: ['beetle'],
  ggulbeori: ['bee', 'flower'], maemmaemi: ['tree'], gaemidaejang: ['ant'],
  chijeunyang: ['cat'], sanchaekmeong: ['dog', 'ball'], jjaekchamsae: ['bird', 'bread'], kkachikkak: ['bird'], kkwakkwagi: ['duck', 'swim'],
  kkangchongtokki: ['rabbit'], goseumbbung: ['hedgehog'], gaeguldori: ['frog', 'swim'],
  mulbitbungeo: ['fish', 'swim'], bidaningeo: ['fish'], eonggeumgeobuk: ['turtle'], hwanggeumingeo: ['fish'],
};
// 만든 가구 · 거둔 작물 · 재료 → 낱말
const THING_WORDS = {
  cushion: ['leaf'], stool: ['chair', 'tree'], table: ['chair'], plant: ['flower'], lamp: ['light'], shelf: ['book'], tank: ['fish', 'water'],
  bed: ['bed', 'mushroom'], rug: ['flower'], frame: ['picture'], window: ['window'], garland: ['star', 'light'], mobile: ['shell'],
  sunpot: ['sunflower'], lotuslamp: ['flower', 'light'], pumpkinlamp: ['pumpkin', 'light'], snowman: ['snow'], chime: ['rain', 'bell'],
  friendframe: ['friend', 'picture'], blossomtree: ['tree', 'flower'], firejar: ['light', 'bug'], acornlamp: ['acorn', 'light'],
  mapleframe: ['leaf', 'picture'], snowglobe: ['snow', 'ice'],
  lettuce: ['lettuce'], tomato: ['tomato'], strawberry: ['strawberry'], sunflower: ['sunflower'], lotus: ['flower', 'water'], pumpkin: ['pumpkin'],
  leaf: ['leaf'], twig: ['tree'], pebble: ['rock'], petal: ['flower'], shell: ['shell'], star: ['star'], raindrop: ['rain'], snowflake: ['snow'],
};
// 짝꿍 돌보기 · 걷기 → 낱말
const ACTION_WORDS = {
  feed: ['eat', 'hungry', 'cookie'], play: ['play', 'ball', 'happy'], pet: ['happy'], walk: ['walk'], water: ['water'],
  sleep: ['sleep', 'sleepy'], gift: ['gift', 'friend'], friendWater: ['water', 'friend'], stop: ['gift'],
};

function V() {
  const s = store.state;
  s.vocab = s.vocab || { words: {}, quiz: { day: '', rounds: 0, pops: 0 } };
  return s.vocab;
}

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

let newWordFn = () => {};
/** 새 낱말 카드를 얻었을 때 알림 */
export function onNewWord(fn) { newWordFn = fn; }

/** 낱말 카드 얻기. 새로 얻은 낱말 목록을 돌려줌 */
export function learn(list, now = Date.now()) {
  const v = V();
  const fresh = [];
  for (const en of list) {
    if (!wordByEn[en] || v.words[en]) continue;
    v.words[en] = { at: now, right: 0, wrong: 0, last: 0 };
    fresh.push(wordByEn[en]);
  }
  if (fresh.length) { store.save(); newWordFn(fresh); }
  return fresh;
}

/** quests.track에서 함께 불림: 게임 속 일 → 낱말 카드 */
export function learnFrom(on, info = {}) {
  if (on === 'catch' && info.sp) return learn(SPECIES_WORDS[info.sp.id] || []);
  if ((on === 'craft' || on === 'harvest' || on === 'gather') && info.id) return learn(THING_WORDS[info.id] || []);
  if (ACTION_WORDS[on]) return learn(ACTION_WORDS[on]);
  return [];
}

/** 영어 대화에 나온 낱말 (대화를 끝냈을 때) */
export function learnFromText(text) {
  const found = new Set();
  for (const raw of text.toLowerCase().match(/[a-z]+/g) || []) {
    const w = raw.replace(/(ies)$/, 'y').replace(/s$/, '');
    for (const c of [raw, w]) if (wordByEn[c]) found.add(c);
  }
  return learn([...found]);
}

export const known = () => WORDS.filter(w => V().words[w.en]);
export const knownCount = () => Object.keys(V().words).length;
export const stars = (en) => Math.min(3, Math.max(0, (V().words[en]?.right || 0) - (V().words[en]?.wrong || 0) * 0.5) | 0);

// ---------- 퀴즈 ----------

export const QUIZ_MIN = 4; // 낱말 카드가 4장 넘게 있어야 퀴즈
export const canQuiz = () => knownCount() >= QUIZ_MIN;

function weight(en, now) {
  const r = V().words[en];
  const days = (now - (r.last || r.at)) / 86400000;
  // 틀린 것, 덜 맞힌 것, 오래 안 본 것이 먼저
  return 1 + Math.max(0, r.wrong - r.right * 0.5) * 5 + Math.max(0, 3 - r.right) * 1.5 + Math.min(5, days);
}

/**
 * 퀴즈 문제 만들기: { word, type: 'pic'(그림 보고 영어 고르기) | 'listen'(듣고 그림 고르기), choices: [낱말...] }
 * rnd: 테스트용 난수
 */
export function makeQuiz(n = 5, rnd = Math.random, now = Date.now()) {
  const pool = known();
  if (pool.length < QUIZ_MIN) return [];
  const out = [];
  const used = new Set();
  for (let i = 0; i < n; i++) {
    const cand = pool.filter(w => !used.has(w.en));
    if (!cand.length) break;
    const total = cand.reduce((s, w) => s + weight(w.en, now), 0);
    let x = rnd() * total;
    let word = cand[cand.length - 1];
    for (const w of cand) { x -= weight(w.en, now); if (x < 0) { word = w; break; } }
    used.add(word.en);
    // 오답: 아는 낱말 중에서, 같은 분류를 먼저 (그림이 겹치지 않게)
    const others = WORDS.filter(w => w.en !== word.en && w.pic !== word.pic);
    const sameCat = others.filter(w => w.cat === word.cat && V().words[w.en]);
    const rest = others.filter(w => !sameCat.includes(w));
    const wrong = [];
    for (const list of [sameCat, rest]) {
      const l = [...list];
      while (wrong.length < 3 && l.length) wrong.push(l.splice(Math.floor(rnd() * l.length), 1)[0]);
    }
    const choices = [word, ...wrong];
    for (let k = choices.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [choices[k], choices[j]] = [choices[j], choices[k]]; }
    out.push({ word, type: rnd() < 0.5 ? 'pic' : 'listen', choices });
  }
  return out;
}

/** 답 기록 */
export function answerQuiz(en, ok, now = Date.now()) {
  const r = V().words[en];
  if (!r) return;
  if (ok) r.right++; else r.wrong++;
  r.last = now;
  store.save();
}

export const QUIZ_GROW_ROUNDS = 3; // 하루 3판까지 짝꿍 성장

/** 한 판을 끝냈을 때. 오늘 몇 번째 판인지 돌려줌 */
export function finishRound(now = new Date()) {
  const q = V().quiz;
  if (q.day !== dayKey(now)) { q.day = dayKey(now); q.rounds = 0; q.pops = 0; }
  q.rounds++;
  store.save();
  return q.rounds;
}

/** 짝꿍 방에서 가끔 내는 깜짝 퀴즈 (하루 3번까지) */
export function popQuizReady(rnd = Math.random, now = new Date()) {
  const q = V().quiz;
  if (q.day !== dayKey(now)) { q.day = dayKey(now); q.rounds = 0; q.pops = 0; }
  return canQuiz() && q.pops < 3 && rnd() < 0.4;
}
export function usePopQuiz() { V().quiz.pops++; store.save(); }

/** 이번 주(리포트용): 새 낱말, 퀴즈 정답률 */
export function weekWords(fromMs) {
  return Object.entries(V().words).filter(([, r]) => r.at >= fromMs).map(([en]) => wordByEn[en]).filter(Boolean);
}
export function accuracy() {
  const rs = Object.values(V().words);
  const right = rs.reduce((s, r) => s + r.right, 0);
  const wrong = rs.reduce((s, r) => s + r.wrong, 0);
  return right + wrong ? Math.round((right / (right + wrong)) * 100) : null;
}
