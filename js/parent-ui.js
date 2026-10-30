// 보호자 화면: 쉬는 시간 안내, 걸을 때 앞 보기 알림, 보호자 설정, 이번 주 리포트

import { store } from './store.js';
import { speciesById, monsterSVG } from './monsters.js';
import { STAGES, buddy, buddySpecies, displayName, stageIndex } from './buddy.js';
import {
  settings, setSetting, restReason, allowMore, tickPlay, hasPin, setPin, checkPin,
  zones, addZone, removeZone, onMove, isStill, snoozeLookUp, week, today,
} from './parent.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let cb = { toast: () => {}, center: () => null, me: () => null, onZones: () => {}, onboarded: () => true };
let unlocked = false;

const LIMITS = [[0, '제한 없음'], [30, '30분'], [60, '1시간'], [90, '1시간 30분'], [120, '2시간']];
const BEDS = [[0, '끄기'], [20, '밤 8시'], [21, '밤 9시'], [22, '밤 10시']];

function fmtMin(m) {
  m = Math.round(m);
  return m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`;
}
const fmtDist = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`);

// ---------- 쉬는 시간 ----------

function checkRest() {
  if (!cb.onboarded()) return;
  const r = restReason();
  const box = $('rest');
  if (!r) { box.hidden = true; return; }
  if (!box.hidden && box.dataset.reason === r) return;
  box.dataset.reason = r;
  const sp = buddySpecies();
  const name = sp ? displayName() : '';
  $('rest-art').innerHTML = sp ? monsterSVG(sp, { size: 120 }) : '🌙';
  $('rest-title').textContent = r === 'bed' ? '잘 시간이야! 🌙' : '오늘은 여기까지! ⏰';
  $('rest-text').textContent = r === 'bed'
    ? `${name ? `${name}도 ` : ''}졸려… 푹 자고 내일 아침에 또 만나자!`
    : `오늘 ${fmtMin(settings().limit)} 신나게 놀았어! ${name ? `${name}랑 ` : ''}내일 또 놀자.`;
  $('rest-pin').hidden = true;
  $('rest-pin-input').value = '';
  box.hidden = false;
}

function bindRest() {
  $('rest-parent').addEventListener('click', () => { $('rest-pin').hidden = false; $('rest-pin-input').focus(); });
  $('rest-pin').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkPin($('rest-pin-input').value)) { cb.toast('비밀번호가 달라요.'); $('rest-pin-input').value = ''; return; }
    allowMore();
    $('rest').hidden = true;
    checkRest(); // 놀이 시간과 잠잘 시간이 겹치면 하나 더 남아 있을 수 있음
    if ($('rest').hidden) cb.toast('보호자가 허락했어요. 조금만 더 놀아요!');
  });
}

// ---------- 걸을 때 앞 보기 ----------

/** app.js의 걸음 계산에서 부름 */
export function walkedStep() {
  if (onMove()) $('lookup').hidden = false;
}

function bindLookUp() {
  $('lookup-ok').addEventListener('click', () => { snoozeLookUp(); $('lookup').hidden = true; });
  setInterval(() => { if (!$('lookup').hidden && isStill()) $('lookup').hidden = true; }, 3000);
}

// ---------- 보호자 설정 ----------

function renderParent() {
  const body = $('parent-body');
  if (!hasPin()) {
    body.innerHTML = `<p>보호자 비밀번호 4자리를 만들어 주세요. 놀이 시간·잠잘 시간 같은 설정은 이 비밀번호로 잠겨요.</p>
      <form id="pin-new" class="pin-form"><input id="pin-a" inputmode="numeric" maxlength="4" pattern="\\d{4}" placeholder="숫자 4자리" autocomplete="off" />
      <input id="pin-b" inputmode="numeric" maxlength="4" pattern="\\d{4}" placeholder="한 번 더" autocomplete="off" />
      <button class="btn primary" type="submit">만들기</button></form>
      <p class="muted small">아이가 모르는 숫자로 정해 주세요. 잊어버리면 '내 기록 모두 지우기'로만 풀 수 있어요.</p>`;
    $('pin-new').addEventListener('submit', (e) => {
      e.preventDefault();
      const a = $('pin-a').value, b = $('pin-b').value;
      if (!/^\d{4}$/.test(a)) { cb.toast('숫자 4자리로 만들어 주세요.'); return; }
      if (a !== b) { cb.toast('두 번 입력한 숫자가 달라요.'); return; }
      setPin(a);
      unlocked = true;
      cb.toast('보호자 비밀번호를 만들었어요.');
      renderParent();
    });
    return;
  }
  if (!unlocked) {
    body.innerHTML = `<p>🔒 보호자 비밀번호를 넣어 주세요.</p>
      <form id="pin-in" class="pin-form"><input id="pin-c" inputmode="numeric" maxlength="4" placeholder="숫자 4자리" autocomplete="off" />
      <button class="btn primary" type="submit">열기</button></form>`;
    $('pin-in').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!checkPin($('pin-c').value)) { cb.toast('비밀번호가 달라요.'); $('pin-c').value = ''; return; }
      unlocked = true;
      renderParent();
    });
    return;
  }
  const p = settings();
  const opt = (list, v) => list.map(([k, t]) => `<option value="${k}" ${+v === k ? 'selected' : ''}>${t}</option>`).join('');
  body.innerHTML = `
    <div class="par-row"><label for="par-limit">⏰ 하루 놀이 시간</label><select id="par-limit">${opt(LIMITS, p.limit)}</select></div>
    <p class="muted small">오늘 논 시간: ${fmtMin(today().play)} · 다 쓰면 "오늘은 여기까지" 화면이 나와요.</p>
    <div class="par-row"><label for="par-bed">🌙 잠잘 시간</label><select id="par-bed">${opt(BEDS, p.bed)}</select></div>
    <p class="muted small">정한 시각부터 아침 6시까지 쉬어요.</p>
    <label class="toggle"><input id="par-look" type="checkbox" ${p.lookUp ? 'checked' : ''} /> 🚶 걸으면서 화면을 오래 보면 "앞을 봐요!" 알림</label>
    <h4>🚧 캐릭터가 안 나오는 곳</h4>
    <p class="muted small">큰길, 주차장 입구처럼 아이가 멈춰 서면 위험한 곳을 정해 주세요. 반경 60m 안에는 캐릭터와 재료가 나오지 않아요.</p>
    <ul class="zone-list">${zones().map((z, i) => `<li><span>🚧 ${esc(z.name)}</span><button class="link-btn" data-zone="${i}" type="button">지우기</button></li>`).join('') || '<li class="muted">아직 없어요.</li>'}</ul>
    <div class="row zone-add"><input id="zone-name" maxlength="16" placeholder="이름 (예: 정문 앞 큰길)" />
      <button id="zone-center" class="btn ghost" type="button">지도 가운데 추가</button><button id="zone-me" class="btn ghost" type="button">내 위치 추가</button></div>
    <p class="muted small">지도 가운데 추가: 지도 탭에서 피할 곳을 화면 가운데에 맞춘 뒤 여기서 눌러요.</p>
    <button id="pin-change" class="link-btn" type="button">비밀번호 바꾸기</button>`;
  $('par-limit').addEventListener('change', (e) => { setSetting('limit', +e.target.value); cb.toast(`하루 놀이 시간: ${e.target.selectedOptions[0].textContent}`); renderParent(); });
  $('par-bed').addEventListener('change', (e) => { setSetting('bed', +e.target.value); cb.toast(`잠잘 시간: ${e.target.selectedOptions[0].textContent}`); });
  $('par-look').addEventListener('change', (e) => setSetting('lookUp', e.target.checked));
  const add = (pos) => {
    if (!pos) { cb.toast('위치를 아직 몰라요. 잠시 뒤 다시 해 보세요.'); return; }
    addZone(pos, $('zone-name').value.trim());
    cb.onZones();
    cb.toast('🚧 피할 곳을 추가했어요.');
    renderParent();
  };
  $('zone-center').addEventListener('click', () => add(cb.center()));
  $('zone-me').addEventListener('click', () => add(cb.me()));
  for (const b of body.querySelectorAll('[data-zone]')) b.addEventListener('click', () => { removeZone(+b.dataset.zone); cb.onZones(); renderParent(); });
  $('pin-change').addEventListener('click', () => { setSetting('pin', ''); unlocked = false; renderParent(); });
}

// ---------- 이번 주 리포트 ----------

function reportData() {
  const days = week();
  const from = new Date(days[0].date); from.setHours(0, 0, 0, 0);
  const sum = (k) => days.reduce((n, d) => n + d[k], 0);
  const phrases = Object.entries(store.state.english?.phrases || {})
    .filter(([, v]) => v.at >= from.getTime()).sort((a, b) => b[1].at - a[1].at);
  const newSp = Object.entries(store.state.caught || {})
    .filter(([, c]) => c.firstAt >= from.getTime()).map(([id]) => speciesById[id]).filter(Boolean);
  const playedDays = days.filter(d => d.play >= 1 || d.walk > 0 || d.catch > 0).length;
  return { days, from, walk: sum('walk'), play: sum('play'), catch: sum('catch'), talk: sum('talk'), care: sum('care'), quests: sum('quests'), phrases, newSp, playedDays };
}

const md = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
const WD = ['일', '월', '화', '수', '목', '금', '토'];

function renderReport() {
  const r = reportData();
  const maxW = Math.max(100, ...r.days.map(d => d.walk));
  const maxP = Math.max(10, ...r.days.map(d => d.play));
  const b = buddy();
  const bars = (key, max, fmt, cls) => `<div class="rp-bars ${cls}">${r.days.map(d => `
      <div class="rp-bar"><span class="rp-val">${d[key] ? fmt(d[key]) : ''}</span><span class="rp-fill" style="height:${Math.round((d[key] / max) * 100)}%"></span>
      <small>${WD[d.date.getDay()]}</small></div>`).join('')}</div>`;
  $('report-body').innerHTML = `
    <p class="rp-range">${esc(store.state.name || '')} · ${md(r.from)} ~ ${md(r.days[6].date)} · ${r.playedDays}일 놀았어요</p>
    <div class="rp-tiles">
      <div><b>${fmtDist(r.walk)}</b><small>👟 걸은 거리</small></div>
      <div><b>${fmtMin(r.play)}</b><small>⏰ 놀이 시간</small></div>
      <div><b>${r.catch}번</b><small>🎯 잡은 친구 (새 친구 ${r.newSp.length})</small></div>
      <div><b>${r.talk}번</b><small>💬 영어 대화</small></div>
      <div><b>${r.phrases.length}개</b><small>📘 새로 배운 표현</small></div>
      <div><b>${r.quests}개</b><small>📋 끝낸 할 일</small></div>
    </div>
    <h4>👟 날마다 걸은 거리</h4>${bars('walk', maxW, fmtDist, 'walk')}
    <h4>⏰ 날마다 놀이 시간</h4>${bars('play', maxP, (m) => `${Math.round(m)}분`, 'play')}
    ${b ? `<h4>💛 짝꿍</h4><p class="rp-buddy">${monsterSVG(buddySpecies(), { size: 44 })}<span><b>${esc(displayName())}</b> · ${STAGES[stageIndex()].name} · 돌봐 준 횟수 ${r.care}번</span></p>` : ''}
    <h4>📘 이번 주 새로 배운 영어 표현</h4>
    ${r.phrases.length ? `<ul class="rp-phr">${r.phrases.slice(0, 12).map(([en, v]) => `<li><b lang="en">${esc(en)}</b> ${esc(v.ko)}</li>`).join('')}</ul>${r.phrases.length > 12 ? `<p class="muted small">외 ${r.phrases.length - 12}개</p>` : ''}` : '<p class="muted">이번 주는 아직 없어요. 짝꿍이랑 영어로 이야기해 봐요!</p>'}
    <h4>🆕 이번 주 새로 만난 친구</h4>
    <p>${r.newSp.length ? r.newSp.map(sp => esc(sp.name)).join(' · ') : '<span class="muted">아직 없어요.</span>'}</p>
    <button id="report-copy" class="btn primary" type="button">📋 리포트 복사해서 보내기</button>`;
  $('report-copy').addEventListener('click', async () => {
    const text = [`[한숲GO 이번 주 리포트] ${store.state.name || ''} (${md(r.from)}~${md(r.days[6].date)})`,
      `👟 걸은 거리 ${fmtDist(r.walk)} · ⏰ 놀이 시간 ${fmtMin(r.play)} · ${r.playedDays}일`,
      `🎯 잡은 친구 ${r.catch}번 (새 친구 ${r.newSp.length}) · 📋 끝낸 할 일 ${r.quests}개`,
      `💬 영어 대화 ${r.talk}번 · 📘 새 표현 ${r.phrases.length}개${r.phrases.length ? `: ${r.phrases.slice(0, 5).map(([en]) => en).join(' / ')}` : ''}`,
      b ? `💛 짝꿍 ${displayName()} (${STAGES[stageIndex()].name})` : ''].filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(text); cb.toast('리포트를 복사했어요. 메신저에 붙여 넣어 보내 보세요.'); }
    catch { cb.toast('복사하지 못했어요.'); }
  });
}

export function openReport() { renderReport(); $('report-sheet').hidden = false; }
export function openParent() { unlocked = false; renderParent(); $('parent-sheet').hidden = false; }

export function initParentUI(callbacks) {
  cb = { ...cb, ...callbacks };
  bindRest();
  bindLookUp();
  $('btn-report').addEventListener('click', openReport);
  $('btn-parent').addEventListener('click', openParent);
  for (const id of ['report-sheet', 'parent-sheet']) {
    $(id).addEventListener('click', (e) => {
      if (e.target.id === id || e.target.closest('.sheet-close')) { $(id).hidden = true; if (id === 'parent-sheet') { unlocked = false; checkRest(); } }
    });
  }
  // 화면을 보고 있는 동안만 놀이 시간으로 셈
  setInterval(() => {
    if (document.visibilityState === 'visible' && cb.onboarded() && $('rest').hidden) tickPlay(30);
    checkRest();
  }, 30000);
  document.addEventListener('visibilitychange', checkRest);
  checkRest();
}

