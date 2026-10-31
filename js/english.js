// 짝꿍과 영어로 이야기하기
// - 짝꿍이 영어로 말하고(휴대폰 음성 합성), 영어 자막과 한글 뜻이 함께 나옵니다.
// - 대답은 영어 선택지를 누르거나, 직접 쓰거나, 🎤로 말해서 할 수 있어요.
// - 끝까지 이야기하면 짝꿍이 자라고, 배운 표현이 표현 노트에 모입니다.

import { SCENES, sceneById, LINES } from './english-data.js';
import { store } from './store.js';
import { monsterSVG, josa } from './monsters.js';
import { WORDS, CATS, known, knownCount, stars, canQuiz, makeQuiz, answerQuiz, finishRound, learnFromText, QUIZ_MIN, QUIZ_GROW_ROUNDS, LEVELS, quizLevel, setQuizLevel } from './vocab.js';
import { track } from './quests.js';
import { inAppName, openExternal, externalHint, isIOS } from './browser.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const today = () => new Date().toLocaleDateString('ko-KR');

// ---------- 기록 ----------

function eng() {
  const s = store.state;
  s.english = s.english || { done: {}, phrases: {}, day: '', today: 0, total: 0, settings: { ko: true, slow: false, sound: true } };
  s.english.settings = s.english.settings || { ko: true, slow: false, sound: true };
  if (!s.english.settings.koV2) { s.english.settings.ko = true; s.english.settings.koV2 = true; }
  if (s.english.day !== today()) { s.english.day = today(); s.english.today = 0; }
  return s.english;
}

export function phraseCount() { return Object.keys(store.state.english?.phrases || {}).length; }

/** 2단계 장면: 짝꿍이 어린이 이상이거나 대화를 5번 끝냈으면 열림 */
function level2Open(stage) { return stage >= 1 || eng().total >= 5; }

// ---------- 소리 ----------

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voice = null;
// 깨끗하게 들리는 목소리일수록 점수가 높음 (자연스러운 신경망·고급 목소리 → 구글 → 기기 기본)
function voiceScore(v) {
  let s = /en[-_]US/i.test(v.lang) ? 4 : /^en/i.test(v.lang) ? 2 : -99;
  if (/natural|neural|enhanced|premium|siri/i.test(v.name)) s += 6;
  if (/google/i.test(v.name)) s += 4;
  if (/samantha|aria|jenny|ava|allison|zoe|nicky|karen|serena/i.test(v.name)) s += 2;
  if (/compact|espeak|eloquence|novelty|whisper|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|zarvox|wobble/i.test(v.name)) s -= 8;
  return s;
}
export function englishVoices() {
  return (synth?.getVoices() || []).filter(v => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
}
function pickVoice() {
  const list = englishVoices();
  const want = store.state.english?.settings?.voice;
  voice = (want && list.find(v => v.name === want)) || list[0] || null;
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }

let speakId = 0;
let heardOnce = false;   // 한 번이라도 소리가 실제로 시작됐는지
let warnedNoSound = false;
/** 영어로 말하기. 끝나면 resolve (음성이 없거나 막혀도 글 길이만큼 기다렸다가 넘어감) */
function speak(text, { pitch = 1.3, onWord } = {}) {
  const set = eng().settings;
  const id = ++speakId;
  const rate = set.slow ? 0.62 : 0.88;
  const guess = Math.min(9000, 700 + text.length * (set.slow ? 95 : 65));
  if (!synth || !set.sound) return new Promise(r => setTimeout(r, Math.min(guess, 1600)));
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    try {
      if (synth.speaking || synth.pending) synth.cancel();
      synth.resume?.(); // 멈춰 있는 음성 엔진 깨우기 (안드로이드 크롬)
      const make = (withVoice) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = (withVoice && voice?.lang) || 'en-US';
        if (withVoice && voice) u.voice = voice;
        u.rate = rate;
        // 음 높이를 많이 바꾸면 휴대폰 목소리가 지지직 깨지기 쉬워서 아주 조금만
        u.pitch = Math.min(1.1, Math.max(0.9, pitch));
        u.volume = 1;
        u.onend = finish;
        u.onstart = () => { heardOnce = true; };
        u.onboundary = (e) => { if (id === speakId && e.name !== 'sentence') onWord?.(e.charIndex); };
        return u;
      };
      const u = make(true);
      // 고른 목소리가 이 휴대폰에서 안 나오면 기본 목소리로 한 번 더
      u.onerror = (e) => {
        if (voice && id === speakId && !/interrupted|canceled/.test(e?.error || '')) { const u2 = make(false); u2.onerror = finish; synth.speak(u2); }
        else finish();
      };
      // 휴대폰은 누른 순간에 바로 말해야 소리가 나므로 기다리지 않고 바로 말함
      synth.speak(u);
      // 3초가 지나도 소리가 시작되지 않으면 (이 브라우저에서 음성이 막힘) 안내
      setTimeout(() => { if (!heardOnce && id === speakId) noSound(); }, 3000);
    } catch { finish(); }
    setTimeout(finish, guess + 1500); // onend가 안 오는 기기 대비
  });
}

/** 소리가 안 날 때 도움말 (대화 중 한 번만) */
function soundHelpHtml() {
  const app = inAppName();
  return `<div class="sound-help"><b>🔇 소리가 안 나나요?</b>
    <ul>${app ? `<li><b>${esc(app)} 안에서 열면</b> 영어 소리가 안 나요. 아래 버튼이나 ${esc(externalHint())}로 열어 주세요.</li>` : ''}
      ${!synth ? '<li>이 브라우저는 음성 기능이 없어요. <b>크롬</b>이나 <b>사파리</b>로 열어 주세요.</li>' : ''}
      ${isIOS ? '<li>아이폰 옆 <b>무음 스위치</b>를 켜 두면 소리가 안 나요. 스위치를 올리고 소리를 키워 주세요.</li>' : '<li>휴대폰 <b>무음·진동 모드</b>를 끄고 미디어 소리를 키워 주세요.</li>'}
      <li>위쪽 <b>🔊</b> 버튼이 켜져 있는지, <b>🗣️ 목소리</b>에서 다른 목소리를 골라 보세요.</li></ul>
    ${app || !synth ? '<button class="btn primary sound-open" type="button">🌐 크롬/사파리로 열기</button><small class="muted">기록은 브라우저마다 따로 저장돼요.</small>' : ''}</div>`;
}
function bindSoundHelp(box) {
  box.querySelector('.sound-open')?.addEventListener('click', () => { if (!openExternal()) ctx?.toast?.(`${externalHint()}를 눌러 주세요.`, 4000); });
}
function noSound() {
  if (warnedNoSound || $('talk').hidden) return;
  warnedNoSound = true;
  const box = document.createElement('div');
  box.innerHTML = soundHelpHtml();
  const log = $('talk-chat').hidden ? $('talk-menu') : $('talk-log');
  log.appendChild(box);
  bindSoundHelp(box);
  if (log === $('talk-log')) scrollLog();
}

function stopSpeak() {
  speakId++;
  try { synth?.cancel(); } catch { /* 무시 */ }
}

// ---------- 알아듣기 (직접 쓴 영어) ----------

function norm(s) {
  return String(s).toLowerCase().replace(/[‘’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

// raining, rainy -> rain / pancakes -> pancake 처럼 낱말 끝을 떼고 비교
const stem = (w) => w.replace(/'s$/, '').replace(/(ing|ed|es|s|y)$/, '') || w;

/** 가장 잘 맞는 선택지 { option, score } (못 알아들으면 null) */
export function understand(text, options, name = '') {
  const t = norm(text);
  if (!t) return null;
  let best = null;
  for (const o of options) {
    const sim = similarity(t, norm(fill(o.en, name)));
    const padded = ` ${t} `;
    const stems = new Set(t.split(' ').map(stem));
    const hits = (o.accept || []).filter(k => {
      const nk = norm(k);
      return padded.includes(` ${nk} `) || (!nk.includes(' ') && stems.has(stem(nk)));
    }).length;
    const score = Math.max(sim, hits ? 0.5 + 0.1 * hits : 0);
    if (!best || score > best.score) best = { option: o, score };
  }
  return best && best.score >= 0.5 ? best : null;
}

function fill(s, name) {
  return s.replace('{name}이야', josa(name || '나', '이야', '야')).replaceAll('{name}', name || 'friend');
}

// ---------- 화면 ----------

let ctx = null; // { sp, name, stage, onDone, onClose }
let scene = null;
let sceneToken = 0; // 장면이 바뀌면 늘어남 (기다리던 옛 대화가 새 장면을 건드리지 않게)
let turnIdx = 0;
let busy = false;
let tries = 0;
let learnedNow = [];

function pitchFor(stage) { return [1.1, 1.05, 1.0][stage] ?? 1.05; } // 아기일수록 살짝 높게 (너무 높이면 소리가 깨짐)

function wordsHtml(text) {
  // 낱말마다 span (말할 때 낱말 불 켜기)
  let i = 0;
  return text.split(/(\s+)/).map(part => {
    const start = i;
    i += part.length;
    return /\s+/.test(part) ? part : `<span data-i="${start}">${esc(part)}</span>`;
  }).join('');
}

function lightWord(p, charIndex) {
  let on = null;
  for (const s of p.querySelectorAll('span[data-i]')) { if (+s.dataset.i <= charIndex) on = s; }
  p.querySelectorAll('.lit').forEach(s => s.classList.remove('lit'));
  on?.classList.add('lit');
}

function scrollLog() {
  const log = $('talk-log');
  log.scrollTop = log.scrollHeight;
}

async function buddySays([en, ko], extraClass = '') {
  const text = fill(en, ctx.name);
  const msg = document.createElement('div');
  msg.className = `msg buddy ${extraClass}`;
  msg.innerHTML = `<div class="msg-av" aria-hidden="true">${monsterSVG(ctx.sp, { size: 40 })}</div>
    <div class="msg-bubble"><p class="en" lang="en">${wordsHtml(text)}</p><p class="ko">${esc(fill(ko, ctx.name))}</p>
    <button class="say-btn" type="button" aria-label="다시 듣기">🔊</button></div>`;
  $('talk-log').appendChild(msg);
  const p = msg.querySelector('.en');
  msg.querySelector('.say-btn').addEventListener('click', () => speak(text, { pitch: pitchFor(ctx.stage), onWord: (c) => lightWord(p, c) }).then(() => lightWord(p, -1)));
  scrollLog();
  await speak(text, { pitch: pitchFor(ctx.stage), onWord: (c) => lightWord(p, c) });
  lightWord(p, -1);
}

function meSays(text, ko = '', tip = '', tipKo = '') {
  const msg = document.createElement('div');
  msg.className = 'msg me';
  msg.innerHTML = `<div class="msg-bubble"><p class="en" lang="en">${esc(text)}</p>${ko ? `<p class="ko">${esc(ko)}</p>` : ''}
    ${tip ? `<p class="tip">💡 이렇게도 말할 수 있어: <b lang="en">${esc(tip)}</b> <button class="say-btn" type="button" aria-label="듣기">🔊</button>${tipKo ? `<span class="ko">${esc(tipKo)}</span>` : ''}</p>` : ''}</div>`;
  $('talk-log').appendChild(msg);
  msg.querySelector('.say-btn')?.addEventListener('click', () => speak(tip, { pitch: 1.0 }));
  scrollLog();
}

function setAnswering(on) {
  busy = !on;
  $('talk-answer').classList.toggle('waiting', !on);
  for (const b of $('talk-options').querySelectorAll('button')) b.disabled = !on;
  $('talk-input').disabled = !on;
}

function renderOptions(turn) {
  const opts = [...turn.options].sort(() => Math.random() - 0.5);
  $('talk-options').innerHTML = opts.map(o => `<button class="talk-opt" type="button" data-i="${turn.options.indexOf(o)}">
      <span class="en" lang="en">${esc(fill(o.en, ctx.name))}</span><span class="ko">${esc(fill(o.ko, ctx.name))}</span></button>`).join('');
  for (const b of $('talk-options').querySelectorAll('.talk-opt')) {
    b.addEventListener('click', () => { if (!busy) answer(turn.options[+b.dataset.i]); });
  }
}

async function showTurn() {
  const my = sceneToken;
  const turn = scene.turns[turnIdx];
  tries = 0;
  setAnswering(false);
  $('talk-options').innerHTML = '';
  await buddySays(turn.say);
  if (my !== sceneToken) return;
  renderOptions(turn);
  setAnswering(true);
  $('talk-step').textContent = `${turnIdx + 1} / ${scene.turns.length}`;
}

async function answer(option, typed = '') {
  const my = sceneToken;
  setAnswering(false);
  const said = fill(option.en, ctx.name);
  const close = typed && similarity(norm(typed), norm(said)) >= 0.8;
  const ko = fill(option.ko, ctx.name);
  // 직접 쓴 대답에도 알아들은 뜻을 한글로 (영어를 몰라도 무슨 말인지 알 수 있게)
  meSays(typed || said, typed && !close ? '' : ko, typed && !close ? said : '', ko);
  await speak(typed && close ? typed : said, { pitch: 1.0 });
  if (my !== sceneToken) return;
  if (typed) await buddySays(pick(LINES.good), 'small');
  if (my !== sceneToken) return;
  await buddySays(option.reply);
  if (my !== sceneToken) return;
  turnIdx++;
  if (turnIdx < scene.turns.length) showTurn();
  else finish();
}

async function typedAnswer(text) {
  const my = sceneToken;
  const turn = scene?.turns[turnIdx];
  if (!turn || busy) return;
  if (/[ㄱ-ㆎ가-힣]/.test(text)) {
    meSays(text);
    setAnswering(false);
    await buddySays(['Try saying it in English! You can do it!', '영어로 말해 볼래? 할 수 있어!']);
    if (my !== sceneToken) return;
    setAnswering(true);
    return;
  }
  const hit = understand(text, turn.options, ctx.name);
  if (hit) { answer(hit.option, text.trim()); return; }
  tries++;
  meSays(text);
  setAnswering(false);
  await buddySays(pick(LINES.again));
  if (my !== sceneToken) return;
  if (tries >= 2) await buddySays(['You can pick one of these!', '아래에서 골라도 돼!']);
  if (my !== sceneToken) return;
  setAnswering(true);
  $('talk-options').classList.add('nudge');
  setTimeout(() => $('talk-options').classList.remove('nudge'), 700);
}

async function finish() {
  const e = eng();
  e.done[scene.id] = (e.done[scene.id] || 0) + 1;
  e.total = (e.total || 0) + 1;
  e.today++;
  learnedNow = scene.learn.filter(([en]) => !e.phrases[en]);
  for (const [en, ko] of scene.learn) e.phrases[en] = { ko, scene: scene.id, at: e.phrases[en]?.at || Date.now() };
  store.save();
  // 대화에 나온 낱말도 단어 카드로
  learnFromText(scene.turns.map(t => [t.say[0], ...t.options.map(o => o.en)].join(' ')).join(' '));
  // 보상은 인사를 기다리기 전에 줌 (인사 중에 나가도 받도록)
  const reward = ctx.onDone?.(e.today) || {};
  const my = sceneToken;
  await buddySays(pick(LINES.bye));
  if (my !== sceneToken) { if (reward.evolved != null) ctx.onEvolve?.(reward.evolved); return; }
  const box = document.createElement('div');
  box.className = 'talk-done';
  box.innerHTML = `<h3>🎉 대화 완료!</h3>
    <p>${reward.pts ? `짝꿍 성장 +${reward.pts} · 기분 +${reward.mood}` : `기분 +${reward.mood || 5} (오늘 성장 보너스는 다 받았어)`}</p>
    ${learnedNow.length ? `<p>새로 배운 표현 ${learnedNow.length}개</p><ul>${learnedNow.map(([en, ko]) => `<li><b lang="en">${esc(en)}</b> ${esc(ko)}</li>`).join('')}</ul>` : '<p>복습 완료! 표현이 더 익숙해졌어.</p>'}
    <div class="talk-done-btns"><button id="talk-again" class="btn primary" type="button">다른 대화하기</button>
    <button id="talk-tobook" class="btn ghost" type="button">📘 표현 노트</button></div>`;
  $('talk-log').appendChild(box);
  $('talk-options').innerHTML = '';
  $('talk-answer').hidden = true;
  scrollLog();
  $('talk-again').addEventListener('click', showMenu);
  $('talk-tobook').addEventListener('click', showBook);
  if (reward.evolved != null) ctx.onEvolve?.(reward.evolved);
}

function startScene(id) {
  sceneToken++;
  scene = sceneById[id];
  turnIdx = 0;
  hideViews();
  $('talk-chat').hidden = false;
  $('talk-answer').hidden = false;
  $('talk-log').innerHTML = `<p class="talk-where">${scene.icon} ${esc(scene.title)} · ${esc(scene.where)}</p>`;
  $('talk-title').textContent = scene.title;
  showTurn();
}

function recommended() {
  const h = new Date().getHours();
  const e = eng();
  const open = SCENES.filter(s => s.level === 1 || level2Open(ctx.stage));
  const now = open.filter(s => h >= s.time[0] && h < s.time[1]);
  const pool = (now.length ? now : open);
  const fresh = pool.filter(s => !e.done[s.id]);
  return (fresh.length ? fresh : pool).sort((a, b) => (e.done[a.id] || 0) - (e.done[b.id] || 0))[0];
}

function showMenu() {
  stopSpeak();
  sceneToken++;
  scene = null;
  const e = eng();
  hideViews();
  $('talk-menu').hidden = false;
  $('talk-title').textContent = '영어로 이야기하기';
  const rec = recommended();
  const l2 = level2Open(ctx.stage);
  const soundTrouble = inAppName() || !synth;
  $('talk-menu').innerHTML = `${soundTrouble ? soundHelpHtml() : ''}
    <div class="talk-hello">${monsterSVG(ctx.sp, { size: 72 })}
      <p><b lang="en">Hi! Let's talk in English!</b><br><span class="muted">영어로 이야기하자! 하루 3번까지 짝꿍이 쑥쑥 자라.</span></p></div>
    <button class="talk-rec" data-id="${rec.id}" type="button"><span class="talk-ico">${rec.icon}</span>
      <span><small>오늘의 대화</small><br><b>${esc(rec.title)}</b> <span class="muted">· ${esc(rec.where)}</span></span><span class="go">시작 ›</span></button>
    <div class="talk-stats"><span>오늘 ${e.today}번 · 모두 ${e.total || 0}번</span>
      <span><button id="talk-voice-btn" class="link-btn" type="button">🗣️ 목소리</button> · <button id="talk-book-btn" class="link-btn" type="button">📘 표현 노트 (${phraseCount()})</button></span></div>
    <div class="talk-learn">
      <button id="talk-words-btn" class="talk-learn-btn" type="button"><span class="talk-ico">🔤</span><b>단어 카드</b><small>${knownCount()}/${WORDS.length}장 모음</small></button>
      <button id="talk-quiz-btn" class="talk-learn-btn" type="button" ${canQuiz() ? '' : 'disabled'}><span class="talk-ico">🧩</span><b>짝꿍 퀴즈</b><small>${canQuiz() ? 'What\'s this? 맞혀 봐!' : `카드 ${QUIZ_MIN}장부터`}</small></button>
    </div>
    <div class="talk-grid">${SCENES.map(s => {
      const lock = s.level === 2 && !l2;
      return `<button class="talk-scene ${lock ? 'locked' : ''}" data-id="${s.id}" type="button" ${lock ? 'disabled' : ''}>
        <span class="talk-ico">${lock ? '🔒' : s.icon}</span><b>${esc(s.title)}</b>
        <small>${lock ? '짝꿍이 어린이가 되거나 5번 이야기하면' : e.done[s.id] ? `✓ ${e.done[s.id]}번` : esc(s.where)}</small></button>`;
    }).join('')}</div>`;
  for (const b of $('talk-menu').querySelectorAll('[data-id]')) b.addEventListener('click', () => startScene(b.dataset.id));
  $('talk-book-btn').addEventListener('click', showBook);
  $('talk-words-btn').addEventListener('click', showWords);
  $('talk-voice-btn').addEventListener('click', showVoices);
  if (soundTrouble) bindSoundHelp($('talk-menu'));
  $('talk-quiz-btn').addEventListener('click', showQuizLevels);
}

function showBook() {
  stopSpeak();
  sceneToken++;
  scene = null;
  const e = eng();
  hideViews();
  $('talk-book').hidden = false;
  $('talk-title').textContent = '📘 표현 노트';
  const groups = SCENES.map(s => ({ s, items: s.learn.filter(([en]) => e.phrases[en]) })).filter(g => g.items.length);
  $('talk-book').innerHTML = `<button id="book-back" class="link-btn" type="button">‹ 대화 고르기</button>
    ${groups.length ? groups.map(g => `<h4>${g.s.icon} ${esc(g.s.title)}</h4><ul class="book-list">${g.items.map(([en, ko]) => `
      <li><button class="say-btn" type="button" data-say="${esc(en)}" aria-label="듣기">🔊</button><span><b lang="en">${esc(en)}</b><br><small>${esc(ko)}</small></span></li>`).join('')}</ul>`).join('')
    : '<p class="muted">아직 모은 표현이 없어. 짝꿍이랑 이야기하면 여기에 쌓여!</p>'}`;
  $('book-back').addEventListener('click', showMenu);
  for (const b of $('talk-book').querySelectorAll('[data-say]')) b.addEventListener('click', () => speak(b.dataset.say, { pitch: 1.0 }));
}

// ---------- 🗣️ 목소리 고르기 ----------

function showVoices() {
  stopSpeak();
  sceneToken++;
  scene = null;
  hideViews();
  $('talk-book').hidden = false;
  $('talk-title').textContent = '🗣️ 목소리 고르기';
  if (!voice && synth) pickVoice();
  const list = englishVoices().slice(0, 10);
  const cur = voice?.name;
  $('talk-book').innerHTML = `<button id="book-back" class="link-btn" type="button">‹ 대화 고르기</button>
    <button id="sound-test" class="btn primary" type="button">🔊 소리 시험하기</button> <span id="sound-result" class="muted"></span>
    <p class="w-lead">소리가 지지직거리거나 딱딱하면 다른 목소리를 골라 보세요. 이름에 <b>Natural · Enhanced · Premium · Google</b>이 들어간 목소리가 보통 가장 깨끗해요.</p>
    ${list.length ? `<ul class="voice-list">${list.map((v, i) => `<li class="${v.name === cur ? 'on' : ''}">
      <span><b>${esc(v.name)}</b><br><small>${esc(v.lang)}${v.localService ? ' · 휴대폰 안' : ' · 인터넷'}${i === 0 ? ' · 추천' : ''}</small></span>
      <button class="btn ghost" type="button" data-try="${i}">▶ 듣기</button>
      <button class="btn ${v.name === cur ? 'ghost' : 'primary'}" type="button" data-use="${i}" ${v.name === cur ? 'disabled' : ''}>${v.name === cur ? '쓰는 중' : '고르기'}</button></li>`).join('')}</ul>`
      : '<p class="muted">이 휴대폰에서는 영어 목소리를 찾지 못했어요. 휴대폰 설정에서 영어 음성을 내려받아 주세요.</p>'}
    <div class="tip-box"><b>더 깨끗한 소리를 원하면</b><br>
      · <b>아이폰</b>: 설정 → 손쉬운 사용 → 읽기 및 말하기 → 음성 → 영어 → <b>"향상됨" 또는 "고음질"</b> 목소리를 내려받아요.<br>
      · <b>갤럭시</b>: 설정 → 일반 → 텍스트 음성 변환 → <b>Google 음성 인식 및 합성</b>을 고르고, 영어(미국) 고음질 음성을 내려받아요.<br>
      · 휴대폰 소리를 너무 크게 하면 스피커에서 지지직거릴 수 있어요. 이어폰으로 들으면 훨씬 깨끗해요.</div>`;
  $('book-back').addEventListener('click', showMenu);
  $('sound-test').addEventListener('click', () => {
    const before = heardOnce;
    heardOnce = false;
    $('sound-result').textContent = '들리나요?';
    speak('Hello! Can you hear me?', { pitch: 1.0 });
    setTimeout(() => {
      if (heardOnce) { $('sound-result').textContent = '✅ 소리를 냈어요. 안 들리면 무음 모드와 소리 크기를 확인해 주세요.'; return; }
      heardOnce = before;
      $('sound-result').textContent = '';
      const box = document.createElement('div');
      box.innerHTML = soundHelpHtml();
      $('sound-test').after(box);
      bindSoundHelp(box);
    }, 2500);
  });
  for (const b of $('talk-book').querySelectorAll('[data-try]')) b.addEventListener('click', () => { const keep = voice; voice = list[+b.dataset.try]; speak('Hi! Let\'s talk in English. Good job!', { pitch: 1.0 }).then(() => { voice = keep; }); });
  for (const b of $('talk-book').querySelectorAll('[data-use]')) b.addEventListener('click', () => {
    const v = list[+b.dataset.use];
    eng().settings.voice = v.name;
    store.save();
    voice = v;
    showVoices();
    speak('This is my new voice!', { pitch: 1.0 });
  });
}

function hideViews() {
  for (const id of ['talk-menu', 'talk-book', 'talk-chat', 'talk-words', 'talk-quiz']) $(id).hidden = true;
}

// ---------- 🔤 단어 카드 ----------

const starHtml = (n) => `<span class="w-stars" aria-label="별 ${n}개">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</span>`;

function showWords() {
  stopSpeak();
  sceneToken++;
  scene = null;
  hideViews();
  $('talk-words').hidden = false;
  $('talk-title').textContent = '🔤 단어 카드';
  const have = new Set(known().map(w => w.en));
  $('talk-words').innerHTML = `<button id="words-back" class="link-btn" type="button">‹ 대화 고르기</button>
    <p class="w-lead"><b>${have.size}</b> / ${WORDS.length}장 모음 · 카드를 누르면 소리로 들려줘요. 친구를 잡고, 가구를 만들고, 짝꿍이랑 이야기하면 새 카드가 생겨요!</p>
    ${Object.entries(CATS).map(([cat, title]) => {
      const list = WORDS.filter(w => w.cat === cat);
      return `<h4>${title} <small class="muted">${list.filter(w => have.has(w.en)).length}/${list.length}</small></h4>
      <div class="w-grid">${list.map(w => have.has(w.en)
        ? `<button class="w-card" type="button" data-word="${w.en}"><span class="w-pic">${w.pic}</span><b lang="en">${esc(w.en)}</b><small>${esc(w.ko)}</small>${starHtml(stars(w.en))}</button>`
        : '<div class="w-card locked" aria-label="아직 못 모은 카드"><span class="w-pic">❔</span><b>???</b><small>&nbsp;</small></div>').join('')}</div>`;
    }).join('')}
    <div id="w-detail" class="w-detail" hidden></div>
    ${canQuiz() ? '<button id="words-quiz" class="btn primary w-quiz-btn" type="button">🧩 짝꿍 퀴즈 풀기</button>' : ''}`;
  $('words-back').addEventListener('click', showMenu);
  $('words-quiz')?.addEventListener('click', showQuizLevels);
  for (const b of $('talk-words').querySelectorAll('[data-word]')) {
    b.addEventListener('click', async () => {
      const w = WORDS.find(x => x.en === b.dataset.word);
      const d = $('w-detail');
      d.hidden = false;
      d.innerHTML = `<span class="w-pic big">${w.pic}</span><div><b lang="en">${esc(w.en)}</b> · ${esc(w.ko)}<br>
        <span lang="en">${esc(w.ex[0])}</span> <button class="say-btn" type="button" data-ex aria-label="예문 듣기">🔊</button><br><small>${esc(w.ex[1])}</small></div>`;
      b.after(d);
      d.querySelector('[data-ex]').addEventListener('click', () => speak(w.ex[0], { pitch: 1.0 }));
      await speak(w.en, { pitch: 1.0 });
    });
  }
}

// ---------- 🧩 짝꿍 퀴즈 ----------

let quiz = [];
let qi = 0;
let qRight = 0;
let quizToken = 0;

// 난이도 고르기
function showQuizLevels() {
  stopSpeak();
  sceneToken++;
  scene = null;
  hideViews();
  $('talk-quiz').hidden = false;
  $('talk-title').textContent = '🧩 짝꿍 퀴즈';
  const cur = quizLevel();
  $('talk-quiz').innerHTML = `<button id="ql-back" class="link-btn" type="button">‹ 대화 고르기</button>
    <p class="w-lead">어떤 난이도로 해 볼까? 보통·어려움에서는 아직 못 모은 낱말도 나와요. 맞히면 그 카드를 얻어요!</p>
    <div class="ql-list">${Object.entries(LEVELS).map(([k, L]) => `<button class="ql ${+k === cur ? 'on' : ''}" type="button" data-level="${k}">
      <span class="ql-stars">${L.icon}</span><b>${L.name}</b><small>${L.desc}</small><small class="ql-grow">맞힐 때마다 짝꿍 성장 +${L.grow}</small></button>`).join('')}</div>`;
  $('ql-back').addEventListener('click', showMenu);
  for (const b of $('talk-quiz').querySelectorAll('[data-level]')) b.addEventListener('click', () => { setQuizLevel(+b.dataset.level); startQuiz(5); });
}

function startQuiz(n) {
  stopSpeak();
  sceneToken++;
  scene = null;
  quiz = makeQuiz(n);
  if (!quiz.length) { showWords(); return; }
  qi = 0;
  qRight = 0;
  hideViews();
  $('talk-quiz').hidden = false;
  $('talk-title').textContent = `🧩 짝꿍 퀴즈 · ${LEVELS[quizLevel()].name}`;
  showQuestion();
}

const Cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

// 문제 종류마다: 짝꿍이 묻는 말 [영어, 한글], 소리로 읽을 말, 가운데 그림/글, 보기 모양
function questionParts(q) {
  const w = q.word;
  switch (q.type) {
    case 'listen': return { ask: ['Where is the …?', '잘 듣고 그림을 골라 봐!'], say: `Where is the ${w.en}?`, mid: '<div class="quiz-pic listen">👂</div>', pics: true };
    case 'ko': return { ask: ['How do you say this in English?', '이 말을 영어로 하면?'], say: 'How do you say this in English?', mid: `<div class="quiz-ko">${esc(w.ko)}</div>` };
    case 'listenWord': return { ask: ['Listen! Which word is it?', '잘 듣고 낱말을 골라 봐!'], say: w.en, mid: '<div class="quiz-pic listen">👂</div>' };
    case 'spell': return { ask: ['Which spelling is right?', '바른 철자를 골라 봐!'], say: 'Which spelling is right?', mid: `<div class="quiz-pic small">${w.pic}</div><div class="quiz-ko small">${esc(w.ko)}</div>`, spell: true };
    case 'blank': return { ask: ['Fill in the blank!', '빈칸에 알맞은 낱말은?'], say: 'Fill in the blank!', mid: `<div class="quiz-blank" lang="en">${esc(q.blank)}</div><div class="quiz-ko small">${esc(w.ex[1])}</div>` };
    default: return { ask: ["What's this?", '이건 뭘까?'], say: "What's this?", mid: `<div class="quiz-pic">${w.pic}</div>` };
  }
}

async function showQuestion() {
  const my = ++quizToken;
  const q = quiz[qi];
  const P = questionParts(q);
  $('talk-quiz').innerHTML = `<div class="q-top"><span>${qi + 1} / ${quiz.length}${q.isNew ? ' · <b class="q-new">🆕 새 낱말 도전!</b>' : ''}</span><span>맞힌 수 ${qRight}</span></div>
    <div class="quiz-ask">${monsterSVG(ctx.sp, { size: 64 })}
      <div class="quiz-bubble"><p class="en" lang="en">${esc(P.ask[0])}</p><p class="ko">${esc(P.ask[1])}</p>
      <button class="say-btn" type="button" id="quiz-say" aria-label="다시 듣기">🔊</button></div></div>
    ${P.mid}
    <div class="quiz-choices ${P.pics ? 'pics' : 'words'}">${q.choices.map(c => `<button class="quiz-opt" type="button" data-qc="${esc(c.en)}">${P.pics ? `<span class="w-pic">${c.pic}</span>` : `<span lang="en">${esc(c.en)}</span>`}</button>`).join('')}</div>
    <div id="quiz-feedback" class="quiz-feedback" hidden></div>`;
  const sayIt = () => speak(P.say, { pitch: pitchFor(ctx.stage) });
  $('quiz-say').addEventListener('click', sayIt);
  for (const b of $('talk-quiz').querySelectorAll("[data-qc]")) b.addEventListener('click', () => pickAnswer(b.dataset.qc));
  await sayIt();
  if (my !== quizToken) return;
}

async function pickAnswer(en) {
  const my = quizToken;
  const q = quiz[qi];
  const ok = en === q.word.en;
  for (const b of $('talk-quiz').querySelectorAll("[data-qc]")) {
    b.disabled = true;
    if (b.dataset.qc === q.word.en) b.classList.add('right');
    else if (b.dataset.qc === en) b.classList.add('wrong');
  }
  const gotCard = answerQuiz(q.word.en, ok);
  track(ok ? 'quizRight' : 'quizWrong', { en: q.word.en });
  if (ok) qRight++;
  const fb = $('quiz-feedback');
  const line = ok ? [`${pick(['Yes!', 'Great job!', 'You got it!'])} ${Cap(q.word.en)}!`, `맞았어! ${q.word.en} = ${q.word.ko}!`] : [`Oops! The answer is ${q.word.en}.`, `아쉬워! 정답은 ${q.word.en} (${q.word.ko})야.`];
  fb.hidden = false;
  fb.className = `quiz-feedback ${ok ? 'good' : 'bad'}`;
  fb.innerHTML = `<p><span class="w-pic">${q.word.pic}</span> <b lang="en">${esc(line[0])}</b><br><small>${esc(line[1])}</small></p>
    ${gotCard ? '<p class="q-got-card">🔤 새 단어 카드를 얻었어!</p>' : ''}
    <p class="quiz-ex"><span lang="en">${esc(q.word.ex[0])}</span><br><small>${esc(q.word.ex[1])}</small></p>
    <button id="quiz-next" class="btn primary" type="button">${qi + 1 < quiz.length ? '다음 ›' : '결과 보기'}</button>`;
  $('quiz-next').addEventListener('click', () => { if (qi + 1 < quiz.length) { qi++; showQuestion(); } else quizDone(); });
  await speak(line[0], { pitch: pitchFor(ctx.stage) });
  if (my !== quizToken) return;
}

function quizDone() {
  quizToken++;
  const round = finishRound();
  const reward = ctx.onQuiz?.(qRight, round <= QUIZ_GROW_ROUNDS, LEVELS[quizLevel()].grow) || {};
  const all = qRight === quiz.length;
  $('talk-quiz').innerHTML = `<div class="talk-done">
    <h3>${all ? '🏆 다 맞혔어!' : '🎉 퀴즈 끝!'}</h3>
    <p>${quiz.length}문제 중 <b>${qRight}개</b> 맞혔어!</p>
    <p>${reward.pts ? `짝꿍 성장 +${reward.pts} · 경험치 +${reward.xp}` : `경험치 +${reward.xp || 0} (오늘 짝꿍 성장 보너스는 다 받았어)`}</p>
    <div class="talk-done-btns"><button id="quiz-again" class="btn primary" type="button">한 판 더</button>
    <button id="quiz-words" class="btn ghost" type="button">🔤 단어 카드</button></div>
    <button id="quiz-level" class="link-btn" type="button">난이도 바꾸기 (지금: ${LEVELS[quizLevel()].icon} ${LEVELS[quizLevel()].name})</button>
    <button id="quiz-menu" class="link-btn" type="button">‹ 대화 고르기</button></div>`;
  $('quiz-again').addEventListener('click', () => startQuiz(5));
  $('quiz-words').addEventListener('click', showWords);
  $('quiz-level').addEventListener('click', showQuizLevels);
  $('quiz-menu').addEventListener('click', showMenu);
  speak(all ? 'Perfect! You are amazing!' : 'Good job! Let\'s play again!', { pitch: pitchFor(ctx.stage) });
  if (reward.evolved != null) ctx.onEvolve?.(reward.evolved);
}

function renderTools() {
  const s = eng().settings;
  $('talk-ko').setAttribute('aria-pressed', String(s.ko));
  $('talk-slow').setAttribute('aria-pressed', String(s.slow));
  $('talk-sound').setAttribute('aria-pressed', String(s.sound));
  $('talk-sound').textContent = s.sound ? '🔊' : '🔇';
  $('talk').classList.toggle('hide-ko', !s.ko);
}

/** 대화 창 열기 */
export function openTalk(options) {
  ctx = options;
  warnedNoSound = false;
  eng();
  renderTools();
  $('talk').hidden = false;
  document.body.classList.add('talking');
  if (!voice && synth) pickVoice();
  if (options.start === 'quiz' && canQuiz()) startQuiz(options.quizN || 5);
  else if (options.start === 'words') showWords();
  else showMenu();
}

export function closeTalk() {
  quizToken++;
  stopSpeak();
  stopMic();
  sceneToken++;
  scene = null;
  $('talk').hidden = true;
  document.body.classList.remove('talking');
  ctx?.onClose?.();
}

// ---------- 🎤 말로 대답 ----------

const Rec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
let rec = null;
function stopMic() { try { rec?.abort(); } catch { /* 무시 */ } rec = null; $('talk-mic')?.classList.remove('on'); }

function startMic() {
  if (!Rec || busy) return;
  if (rec) { stopMic(); return; }
  stopSpeak();
  rec = new Rec();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  $('talk-mic').classList.add('on');
  rec.onresult = (e) => {
    const alts = [...e.results[0]].map(a => a.transcript);
    const turn = scene?.turns[turnIdx];
    // 여러 후보 중 선택지와 가장 잘 맞는 것
    const best = turn ? alts.map(a => ({ a, h: understand(a, turn.options, ctx.name) })).sort((x, y) => (y.h?.score || 0) - (x.h?.score || 0))[0].a : alts[0];
    $('talk-input').value = best;
    stopMic();
    typedAnswer(best);
    $('talk-input').value = '';
  };
  rec.onerror = (e) => { stopMic(); if (e.error === 'not-allowed') ctx?.toast?.('마이크를 쓰려면 브라우저에서 마이크 권한을 허용해 주세요.'); };
  rec.onend = () => { $('talk-mic')?.classList.remove('on'); rec = null; };
  try { rec.start(); } catch { stopMic(); }
}

export function initTalkUI() {
  $('talk-close').addEventListener('click', closeTalk);
  $('talk-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('talk-input').value.trim();
    if (!v) return;
    $('talk-input').value = '';
    typedAnswer(v);
  });
  $('talk-mic').hidden = !Rec;
  $('talk-mic').addEventListener('click', startMic);
  const toggle = (k) => { const s = eng().settings; s[k] = !s[k]; store.save(); renderTools(); if (k === 'sound' && !s.sound) stopSpeak(); };
  $('talk-ko').addEventListener('click', () => toggle('ko'));
  $('talk-slow').addEventListener('click', () => toggle('slow'));
  $('talk-sound').addEventListener('click', () => toggle('sound'));
  if (!synth) $('talk-sound').hidden = true;
}
