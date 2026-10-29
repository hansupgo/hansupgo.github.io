// 짝꿍과 영어로 이야기하기
// - 짝꿍이 영어로 말하고(휴대폰 음성 합성), 영어 자막과 한글 뜻이 함께 나옵니다.
// - 대답은 영어 선택지를 누르거나, 직접 쓰거나, 🎤로 말해서 할 수 있어요.
// - 끝까지 이야기하면 짝꿍이 자라고, 배운 표현이 표현 노트에 모입니다.

import { SCENES, sceneById, LINES } from './english-data.js';
import { store } from './store.js';
import { monsterSVG, josa } from './monsters.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const today = () => new Date().toLocaleDateString('ko-KR');

// ---------- 기록 ----------

function eng() {
  const s = store.state;
  s.english = s.english || { done: {}, phrases: {}, day: '', today: 0, total: 0, settings: { ko: true, slow: false, sound: true } };
  s.english.settings = s.english.settings || { ko: true, slow: false, sound: true };
  if (s.english.day !== today()) { s.english.day = today(); s.english.today = 0; }
  return s.english;
}

export function phraseCount() { return Object.keys(store.state.english?.phrases || {}).length; }

/** 2단계 장면: 짝꿍이 어린이 이상이거나 대화를 5번 끝냈으면 열림 */
function level2Open(stage) { return stage >= 1 || eng().total >= 5; }

// ---------- 소리 ----------

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voice = null;
function pickVoice() {
  const vs = synth?.getVoices() || [];
  const us = vs.filter(v => /en[-_]US/i.test(v.lang));
  voice = us.find(v => /google|samantha|aria|jenny|zira|female/i.test(v.name)) || us[0] || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }

let speakId = 0;
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
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = pitch;
      u.onend = finish;
      u.onerror = finish;
      u.onboundary = (e) => { if (id === speakId && e.name !== 'sentence') onWord?.(e.charIndex); };
      synth.speak(u);
    } catch { finish(); }
    setTimeout(finish, guess + 1500); // onend가 안 오는 기기 대비
  });
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

function pitchFor(stage) { return [1.45, 1.3, 1.15][stage] ?? 1.3; }

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

function meSays(text, ko = '', tip = '') {
  const msg = document.createElement('div');
  msg.className = 'msg me';
  msg.innerHTML = `<div class="msg-bubble"><p class="en" lang="en">${esc(text)}</p>${ko ? `<p class="ko">${esc(ko)}</p>` : ''}
    ${tip ? `<p class="tip">💡 이렇게도 말할 수 있어: <b lang="en">${esc(tip)}</b> <button class="say-btn" type="button" aria-label="듣기">🔊</button></p>` : ''}</div>`;
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
  meSays(typed || said, typed ? '' : fill(option.ko, ctx.name), typed && !close ? said : '');
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
  $('talk-menu').hidden = true;
  $('talk-book').hidden = true;
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
  $('talk-chat').hidden = true;
  $('talk-book').hidden = true;
  $('talk-menu').hidden = false;
  $('talk-title').textContent = '영어로 이야기하기';
  const rec = recommended();
  const l2 = level2Open(ctx.stage);
  $('talk-menu').innerHTML = `
    <div class="talk-hello">${monsterSVG(ctx.sp, { size: 72 })}
      <p><b lang="en">Hi! Let's talk in English!</b><br><span class="muted">영어로 이야기하자! 하루 3번까지 짝꿍이 쑥쑥 자라.</span></p></div>
    <button class="talk-rec" data-id="${rec.id}" type="button"><span class="talk-ico">${rec.icon}</span>
      <span><small>오늘의 대화</small><br><b>${esc(rec.title)}</b> <span class="muted">· ${esc(rec.where)}</span></span><span class="go">시작 ›</span></button>
    <div class="talk-stats"><span>오늘 ${e.today}번 · 모두 ${e.total || 0}번</span>
      <button id="talk-book-btn" class="link-btn" type="button">📘 표현 노트 (${phraseCount()})</button></div>
    <div class="talk-grid">${SCENES.map(s => {
      const lock = s.level === 2 && !l2;
      return `<button class="talk-scene ${lock ? 'locked' : ''}" data-id="${s.id}" type="button" ${lock ? 'disabled' : ''}>
        <span class="talk-ico">${lock ? '🔒' : s.icon}</span><b>${esc(s.title)}</b>
        <small>${lock ? '짝꿍이 어린이가 되거나 5번 이야기하면' : e.done[s.id] ? `✓ ${e.done[s.id]}번` : esc(s.where)}</small></button>`;
    }).join('')}</div>`;
  for (const b of $('talk-menu').querySelectorAll('[data-id]')) b.addEventListener('click', () => startScene(b.dataset.id));
  $('talk-book-btn').addEventListener('click', showBook);
}

function showBook() {
  stopSpeak();
  sceneToken++;
  scene = null;
  const e = eng();
  $('talk-chat').hidden = true;
  $('talk-menu').hidden = true;
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
  eng();
  renderTools();
  $('talk').hidden = false;
  document.body.classList.add('talking');
  if (!voice && synth) pickVoice();
  showMenu();
}

export function closeTalk() {
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
