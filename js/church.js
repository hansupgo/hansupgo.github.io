// ⛪ 교회: 지도에서 교회에 가까이 가면 들어갈 수 있어요.
// - 오늘의 말씀: 날마다 성경 말씀 한 구절 (모두에게 같은 말씀) + 어린이를 위한 쉬운 풀이, 소리로 듣기
// - 복음 이야기: 하나님의 사랑 → 죄 → 예수님 → 다시 사심 → 믿음과 새 생명, 다섯 장면
// - 말씀 카드: 교회에 올 때마다 그날 말씀이 카드로 모여요
// - 출석 도장: 하루 한 번, 처음 오면 도장 + 작은 선물
// 성경 본문은 저작권이 끝난 「개역한글」(대한성서공회, 1961)을 썼습니다.

import { store } from './store.js';
import { monsterSVG } from './monsters.js';

// [책 장:절, 본문(개역한글), 쉬운 풀이]
const RAW = [
  ['창세기 1:1', '태초에 하나님이 천지를 창조하시니라', '하나님이 하늘과 땅, 해와 달, 나무와 동물, 그리고 우리를 만드셨어요.'],
  ['시편 23:1', '여호와는 나의 목자시니 내가 부족함이 없으리로다', '목자가 양을 돌보듯 하나님이 나를 돌봐 주셔서 걱정 없어요.'],
  ['시편 46:1', '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라', '힘들고 무서울 때 하나님께 숨으면 지켜 주시고 힘을 주세요.'],
  ['시편 119:105', '주의 말씀은 내 발에 등이요 내 길에 빛이니이다', '하나님 말씀은 어두운 길을 비춰 주는 손전등 같아요.'],
  ['잠언 3:5', '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라', '내 생각보다 하나님을 더 믿고 맡겨요.'],
  ['여호수아 1:9', '내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 나 여호와가 너와 함께 하느니라 하시니라', '어디를 가든 하나님이 함께 계시니까 용기를 내요!'],
  ['이사야 41:10', '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라', '무서워하지 마! 하나님이 손을 꼭 잡아 주실 거예요.'],
  ['마태복음 5:9', '화평케 하는 자는 복이 있나니 저희가 하나님의 아들이라 일컬음을 받을 것임이요', '친구끼리 다투지 않게 화해를 돕는 사람은 복을 받아요.'],
  ['마태복음 11:28', '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라', '지치고 힘들 때 예수님께 오면 마음이 편히 쉴 수 있어요.'],
  ['마태복음 19:14', '예수께서 가라사대 어린 아이들을 용납하고 내게 오는 것을 금하지 말라 천국이 이런 자의 것이니라 하시고', '예수님은 어린이를 정말 사랑하시고 언제나 반겨 주세요.'],
  ['마태복음 28:6', '그가 여기 계시지 않고 그의 말씀하시던 대로 살아나셨느니라 와서 그의 누우셨던 곳을 보라', '예수님은 말씀하신 대로 죽음을 이기고 다시 살아나셨어요!'],
  ['누가복음 2:11', '오늘날 다윗의 동네에 너희를 위하여 구주가 나셨으니 곧 그리스도 주시니라', '우리를 구해 주실 아기 예수님이 태어나셨어요. 바로 성탄절이에요!'],
  ['요한복음 1:12', '영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니', '예수님을 마음에 모시면 하나님의 아이가 돼요.'],
  ['요한복음 3:16', '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라', '하나님은 우리를 너무너무 사랑하셔서 하나뿐인 아들 예수님을 보내 주셨어요.'],
  ['요한복음 14:6', '예수께서 가라사대 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라', '예수님은 하나님께 가는 길을 알려 주시는 분이에요.'],
  ['요한복음 15:12', '내 계명은 곧 내가 너희를 사랑한 것같이 너희도 서로 사랑하라 하는 이것이니라', '예수님이 우리를 사랑하신 것처럼 우리도 서로 사랑해요.'],
  ['로마서 3:23', '모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니', '누구나 잘못을 해요. 그래서 우리에게는 하나님의 도움이 필요해요.'],
  ['로마서 5:8', '우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에게 대한 자기의 사랑을 확증하셨느니라', '우리가 잘못했을 때에도 예수님은 우리를 위해 십자가를 지셨어요. 그게 하나님의 사랑이에요.'],
  ['로마서 6:23', '죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라', '하나님은 예수님 안에서 영원한 생명을 선물로 주세요.'],
  ['로마서 10:9', '네가 만일 네 입으로 예수를 주로 시인하며 또 하나님께서 그를 죽은 자 가운데서 살리신 것을 네 마음에 믿으면 구원을 얻으리니', '예수님이 나의 주님이라고 말하고 마음으로 믿으면 구원을 받아요.'],
  ['고린도전서 13:4', '사랑은 오래 참고 사랑은 온유하며 투기하는 자가 되지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며', '사랑은 기다려 주고, 친절하고, 샘내지 않고, 뽐내지 않아요.'],
  ['고린도후서 5:17', '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새것이 되었도다', '예수님과 함께하면 마음이 새롭게 바뀌어요.'],
  ['에베소서 2:8', '너희가 그 은혜를 인하여 믿음으로 말미암아 구원을 얻었나니 이것이 너희에게서 난 것이 아니요 하나님의 선물이라', '구원은 내가 잘해서 받는 상이 아니라 하나님이 주시는 선물이에요.'],
  ['에베소서 4:32', '서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라', '하나님이 나를 용서해 주신 것처럼 나도 친구를 용서해요.'],
  ['에베소서 6:1', '자녀들아 주 안에서 너희 부모에게 순종하라 이것이 옳으니라', '엄마 아빠 말씀을 잘 듣는 것은 하나님이 기뻐하시는 일이에요.'],
  ['빌립보서 4:6', '아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라', '걱정이 생기면 하나님께 기도로 이야기해요. 감사한 마음으로요.'],
  ['데살로니가전서 5:16-18', '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라', '늘 기뻐하고, 자주 기도하고, 모든 일에 감사해요.'],
  ['요한일서 1:9', '만일 우리가 우리 죄를 자백하면 저는 미쁘시고 의로우사 우리 죄를 사하시며 우리를 모든 불의에서 깨끗케 하실 것이요', '잘못한 것을 솔직하게 하나님께 말씀드리면 용서해 주세요.'],
  ['요한일서 4:19', '우리가 사랑함은 저가 먼저 우리를 사랑하셨음이라', '하나님이 먼저 나를 사랑해 주셔서 나도 사랑할 수 있어요.'],
  ['요한계시록 3:20', '볼찌어다 내가 문 밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그로 더불어 먹고 그는 나로 더불어 먹으리라', '예수님은 내 마음의 문을 똑똑 두드리세요. 문을 열면 함께해 주세요.'],
];
export const VERSES = RAW.map(([ref, text, easy]) => ({ ref, text, easy }));
const byRef = Object.fromEntries(VERSES.map(v => [v.ref, v]));

// 복음 이야기: 다섯 장면
export const GOSPEL = [
  { icon: '❤️', title: '하나님은 나를 사랑하세요', body: '하나님은 세상과 나를 만드셨어요. 그리고 나를 정말 많이 사랑하세요.', ref: '요한복음 3:16' },
  { icon: '💔', title: '우리는 잘못을 해요', body: '거짓말하고, 다투고, 미워하는 마음… 이런 잘못을 성경은 "죄"라고 해요. 죄는 하나님과 우리 사이를 멀어지게 해요.', ref: '로마서 3:23' },
  { icon: '✝️', title: '예수님이 오셨어요', body: '하나님은 우리를 구하시려고 예수님을 보내 주셨어요. 예수님은 우리 대신 십자가에서 벌을 받으셨어요.', ref: '로마서 5:8' },
  { icon: '🌅', title: '예수님이 다시 살아나셨어요', body: '예수님은 죽음을 이기고 사흘 만에 다시 살아나셨어요. 지금도 살아 계셔서 우리와 함께하세요.', ref: '마태복음 28:6' },
  { icon: '🎁', title: '믿음으로 받는 선물', body: '예수님을 믿고 마음에 모시면 하나님의 자녀가 되고, 영원한 생명을 선물로 받아요.', ref: '요한복음 1:12' },
];

export const PRAYER = '하나님, 오늘도 저를 사랑해 주셔서 감사해요. 예수님을 보내 주셔서 고맙습니다. 오늘 하루도 친구들을 사랑하고 용서하는 마음을 주세요. 예수님 이름으로 기도합니다. 아멘.';

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** 오늘의 말씀: 날짜로 정해서 모두에게 같은 말씀 */
export function todayVerse(d = new Date()) {
  const n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
  return VERSES[((n % VERSES.length) + VERSES.length) % VERSES.length];
}

function C() {
  const s = store.state;
  s.church = s.church || { days: {}, cards: {} };
  return s.church;
}

export const VISIT_GIFT = { balls: 3 };

/** 교회에 들어옴. 오늘 처음이면 { first: true, gift } */
export function visit(now = new Date()) {
  const c = C();
  const k = dayKey(now);
  const v = todayVerse(now);
  const first = !c.days[k];
  c.days[k] = true;
  if (!c.cards[v.ref]) c.cards[v.ref] = now.getTime();
  if (first) store.state.balls += VISIT_GIFT.balls;
  store.save();
  return { first, verse: v, gift: first ? VISIT_GIFT : null };
}

export const stampCount = () => Object.keys(C().days).length;
export const cardCount = () => Object.keys(C().cards).length;
export const hasCard = (ref) => Boolean(C().cards[ref]);

// ---------- 소리로 듣기 (한국어) ----------

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let koVoice = null;
// 깨끗한 한국어 목소리 먼저 (자연스러운·고급·구글 목소리)
function pickVoice() {
  const score = (v) => (/natural|neural|enhanced|premium|siri/i.test(v.name) ? 6 : 0) + (/google/i.test(v.name) ? 4 : 0) + (/yuna|sunhi|injoon|heami/i.test(v.name) ? 2 : 0);
  koVoice = (synth?.getVoices() || []).filter(v => /^ko/i.test(v.lang)).sort((x, y) => score(y) - score(x))[0] || null;
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }
function speakKo(text) {
  if (!synth) return;
  try {
    if (synth.speaking || synth.pending) synth.cancel();
    synth.resume?.();
    if (!koVoice) pickVoice();
    const make = (withVoice) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      if (withVoice && koVoice) u.voice = koVoice;
      u.rate = 0.9;
      u.pitch = 1;
      return u;
    };
    const u = make(true);
    u.onerror = (e) => { if (koVoice && !/interrupted|canceled/.test(e?.error || '')) synth.speak(make(false)); };
    synth.speak(u); // 누른 순간에 바로 (휴대폰은 기다렸다 말하면 소리가 안 남)
  } catch { /* 소리를 못 내는 환경 */ }
}
const stopSpeak = () => { try { synth?.cancel(); } catch { /* 무시 */ } };

// ---------- 화면 ----------

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let cb = { toast: () => {}, buddySp: () => null, buddyName: () => '', onChange: () => {} };
let tab = 'today';

function verseCard(v, big = false) {
  return `<div class="ch-verse ${big ? 'big' : ''}">
    <p class="ch-text">${esc(v.text)}</p>
    <p class="ch-ref">— ${esc(v.ref)}</p>
    <p class="ch-easy">🌱 ${esc(v.easy)}</p>
    <button class="btn ghost ch-listen" type="button" data-say="${esc(v.text)} ${esc(v.ref)}">🔊 말씀 듣기</button>
  </div>`;
}

function render() {
  const body = $('church-body');
  for (const b of document.querySelectorAll('#church .ch-tab')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  if (tab === 'today') {
    const v = todayVerse();
    const sp = cb.buddySp();
    body.innerHTML = `<h3 class="ch-h">📖 오늘의 말씀</h3>${verseCard(v, true)}
      ${sp ? `<p class="ch-buddy">${monsterSVG(sp, { size: 44 })}<span>${esc(cb.buddyName())}도 같이 들었어요. "말씀 고마워요!"</span></p>` : ''}
      <h3 class="ch-h">🙏 같이 기도해요</h3>
      <div class="ch-verse"><p class="ch-text small">${esc(PRAYER)}</p>
      <button class="btn ghost ch-listen" type="button" data-say="${esc(PRAYER)}">🔊 기도 듣기</button></div>`;
  } else if (tab === 'gospel') {
    body.innerHTML = `<h3 class="ch-h">✝️ 복음 이야기</h3><p class="ch-lead">복음은 "기쁜 소식"이라는 뜻이에요. 다섯 장면으로 들어 봐요.</p>
      ${GOSPEL.map((g, i) => `<div class="ch-step"><span class="ch-step-ico">${g.icon}</span><div>
        <b>${i + 1}. ${esc(g.title)}</b><p>${esc(g.body)}</p>
        <p class="ch-mini">"${esc(byRef[g.ref].text)}" <small>— ${esc(g.ref)}</small></p>
        <button class="link-btn ch-listen" type="button" data-say="${esc(g.title)}. ${esc(g.body)} ${esc(byRef[g.ref].text)}">🔊 듣기</button></div></div>`).join('')}`;
  } else if (tab === 'cards') {
    body.innerHTML = `<h3 class="ch-h">🃏 말씀 카드 <small>${cardCount()}/${VERSES.length}</small></h3>
      <p class="ch-lead">교회에 올 때마다 그날의 말씀 카드를 받아요. 날마다 다른 말씀이 기다려요!</p>
      <div class="ch-cards">${VERSES.map(v => hasCard(v.ref)
        ? `<button class="ch-card" type="button" data-ref="${esc(v.ref)}"><b>${esc(v.ref)}</b><span>${esc(v.easy)}</span></button>`
        : `<div class="ch-card locked"><b>✝️</b><span>아직 못 받은 말씀</span></div>`).join('')}</div>
      <div id="ch-card-open"></div>`;
    for (const b of body.querySelectorAll('[data-ref]')) b.addEventListener('click', () => { $('ch-card-open').innerHTML = verseCard(byRef[b.dataset.ref]); bindListen(); $('ch-card-open').scrollIntoView({ block: 'nearest' }); });
  } else {
    const n = stampCount();
    body.innerHTML = `<h3 class="ch-h">🕊️ 출석 도장 <small>${n}일</small></h3>
      <p class="ch-lead">하루에 한 번, 교회에 오면 도장을 찍어요. 처음 온 날엔 숲볼 ${VISIT_GIFT.balls}개 선물!</p>
      <div class="ch-stamps">${Array.from({ length: Math.max(10, Math.ceil(n / 10) * 10) }, (_, i) => `<span class="${i < n ? 'on' : ''}">${i < n ? '🕊️' : i + 1}</span>`).join('')}</div>`;
  }
  bindListen();
}

function bindListen() {
  for (const b of $('church-body').querySelectorAll('[data-say]')) b.onclick = () => speakKo(b.dataset.say);
}

export function openChurch(place) {
  const r = visit();
  tab = 'today';
  $('church-title').textContent = place?.name || '교회';
  $('church').hidden = false;
  document.body.classList.add('talking');
  const sp = cb.buddySp();
  $('church-buddy').innerHTML = sp ? monsterSVG(sp, { size: 58 }) : '';
  render();
  if (r.first) cb.toast(`🕊️ 출석 도장 쾅! 숲볼 ${r.gift.balls}개 선물 · 🃏 말씀 카드 '${r.verse.ref}'`, 3500);
  cb.onChange();
}

export function closeChurch() {
  stopSpeak();
  $('church').hidden = true;
  document.body.classList.remove('talking');
}

export function initChurchUI(callbacks) {
  cb = { ...cb, ...callbacks };
  $('church-close').addEventListener('click', closeChurch);
  for (const b of document.querySelectorAll('#church .ch-tab')) b.addEventListener('click', () => { stopSpeak(); tab = b.dataset.tab; render(); $('church-body').scrollTop = 0; });
}
