// 짝꿍 탭 화면: 고르기, 돌보기, 성장, 진화 축하

import { SPECIES, speciesById, monsterSVG, josa } from './monsters.js';
import { store } from './store.js';
import { createBuddyView } from './stage3d.js';
import {
  STAGES, hasBuddy, buddy, buddySpecies, displayName, stageIndex, stageProgress,
  adopt, tick, feed, play, pet, toggleSleep, rename, addWalk, talk, evolveLine,
} from './buddy.js';

const $ = (id) => document.getElementById(id);
const STARTERS = ['sumbbong', 'mulbangkong', 'bulssikkomi'];

let view = null;         // 3D 짝꿍 화면
let viewFor = '';        // 어떤 짝꿍으로 만든 화면인지
let talkTimer = 0;
let toastFn = () => {};
let onChangeFn = () => {};
let choosing = false;    // 짝꿍 바꾸기 중

function fmtKm(m) { return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`; }

function say(text) {
  const el = $('buddy-say');
  if (!text) return;
  el.textContent = text;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// ---------- 고르기 ----------

function renderAdopt() {
  $('buddy-home').hidden = true;
  $('buddy-adopt').hidden = false;
  const caught = SPECIES.filter(sp => store.state.caught[sp.id]);
  const list = caught.length ? caught : STARTERS.map(id => speciesById[id]);
  $('adopt-lead').textContent = caught.length
    ? '같이 지낼 짝꿍을 골라 줘! 함께 걷고 돌보면 쑥쑥 자라. (나중에 바꿀 수 있어)'
    : '첫 짝꿍을 골라 줘! 고른 친구는 도감에도 등록돼. 함께 걷고 돌보면 쑥쑥 자라.';
  $('adopt-grid').innerHTML = list.map(sp => {
    const cur = buddy()?.speciesId === sp.id;
    const book = store.state.buddyBook?.[sp.id];
    const g = cur ? buddy().growth : book?.growth;
    const stage = g != null ? STAGES[stageIndex(g)].name : '';
    return `<button class="dex-card got adopt-card" data-id="${sp.id}" type="button">
      <span class="dex-no">${cur ? '지금 짝꿍' : stage ? `${stage} 단계` : '&nbsp;'}</span>
      ${monsterSVG(sp, { size: 84 })}
      <span class="dex-name">${sp.name}</span>
    </button>`;
  }).join('') + (choosing ? '<button id="adopt-cancel" class="btn ghost" type="button">취소</button>' : '');
  for (const b of $('adopt-grid').querySelectorAll('.adopt-card')) {
    b.addEventListener('click', () => choose(b.dataset.id));
  }
  $('adopt-cancel')?.addEventListener('click', () => { choosing = false; renderBuddy(); });
}

function choose(id) {
  if (!store.state.caught[id]) {
    // 첫 짝꿍 선물: 도감에도 등록
    store.recordCatch({ id: `starter:${id}`, speciesId: id, sizeCm: speciesById[id].size[0] });
  }
  adopt(id);
  choosing = false;
  onChangeFn();
  renderBuddy(`안녕! 나는 ${displayName()}! 앞으로 잘 부탁해!`);
}

// ---------- 돌보기 화면 ----------

async function ensureView() {
  const sp = buddySpecies();
  const key = sp.id;
  if (view && viewFor === key) return;
  closeView();
  viewFor = key;
  const box = $('buddy-3d');
  const v = await createBuddyView(box, sp, { stage: stageIndex(), onPet: onPet });
  if (viewFor !== key || document.body.dataset.tab !== 'buddy') { v?.dispose(); return; }
  view = v;
  $('buddy-svg').hidden = Boolean(view);
  if (!view) $('buddy-svg').innerHTML = monsterSVG(sp, { size: 180 });
  view?.setSleeping(buddy().sleeping);
}

function closeView() {
  view?.dispose();
  view = null;
  viewFor = '';
}

function renderStats() {
  if (!hasBuddy()) return;
  tick();
  const b = buddy();
  const sp = buddySpecies();
  const st = stageProgress();
  $('buddy-name').textContent = displayName();
  $('buddy-stage').textContent = `${STAGES[st.i].name} ${sp.name} · 성장 ${Math.floor(b.growth)}점`;
  $('buddy-grow').style.width = `${st.pct}%`;
  $('buddy-next').textContent = st.next == null
    ? '다 자랐어! 앞으로도 같이 걷자.'
    : `${STAGES[st.i + 1].name}까지 ${Math.ceil(st.next)}점 (10m 걸으면 1점, 돌봐 주면 5점)`;
  for (const k of ['hunger', 'mood', 'energy']) {
    const bar = $(`st-${k}`);
    bar.style.width = `${Math.round(b[k])}%`;
    bar.classList.toggle('low', b[k] < 30);
  }
  $('buddy-walk').innerHTML = `오늘 함께 걸은 거리 <b>${fmtKm(b.todayM)}</b> · 지금까지 <b>${fmtKm(b.walkedM)}</b>`;
  $('act-feed-label').textContent = `밥 주기 (${store.state.snacks})`;
  $('act-sleep-label').textContent = b.sleeping ? '깨우기' : '재우기';
  $('act-feed').disabled = b.sleeping;
  $('act-play').disabled = b.sleeping;
  $('buddy-zzz').hidden = !b.sleeping;
  document.querySelector('.buddy-room').classList.toggle('sleeping', b.sleeping);
  view?.setSleeping(b.sleeping);
}

export async function renderBuddy(greeting) {
  clearInterval(talkTimer);
  if (!hasBuddy() || choosing) { closeView(); renderAdopt(); return; }
  $('buddy-adopt').hidden = true;
  $('buddy-home').hidden = false;
  renderStats();
  await ensureView();
  say(greeting || talk({ todayM: buddy().todayM }));
  talkTimer = setInterval(() => {
    if (document.body.dataset.tab !== 'buddy') return;
    renderStats();
    say(talk({ todayM: buddy().todayM }));
  }, 14000);
}

export function leaveBuddy() {
  clearInterval(talkTimer);
  closeView();
}

function afterAction(res, anim) {
  if (!res) return;
  if (res.line) say(res.line);
  if (res.ok && anim) view?.play(anim);
  renderStats();
  onChangeFn();
  if (res.evolved != null) showEvolve(res.evolved);
}

function onPet() { afterAction(pet(), 'hop'); }

// ---------- 진화 축하 ----------

export function showEvolve(stage) {
  const sp = buddySpecies();
  $('evolve-art').innerHTML = monsterSVG(sp, { size: 150 });
  $('evolve-title').textContent = `${josa(displayName(), '이', '가')} ${STAGES[stage].name}${stage === 1 ? '로' : '으로'} 자랐어!`;
  $('evolve-line').textContent = `"${evolveLine(stage)}"`;
  $('evolve').hidden = false;
  view?.setStage(stage);
  view?.play('evolve');
}

// ---------- 산책 ----------

/** 지도에서 걸은 거리(m)를 짝꿍에게 반영 */
export function buddyWalked(m) {
  if (!hasBuddy()) return;
  const r = addWalk(m);
  if (!r) return;
  if (r.evolved != null) { showEvolve(r.evolved); return; }
  if (r.milestone) {
    toastFn(`${displayName()}: "${pick(['같이 걸으니까 좋다!', '우리 벌써 이만큼 왔어!', '조금만 더 걸어 볼까?'])}"`);
  }
  if (document.body.dataset.tab === 'buddy') renderStats();
}

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

export function initBuddyUI({ toast, onChange }) {
  toastFn = toast;
  onChangeFn = onChange || (() => {});
  $('act-feed').addEventListener('click', () => afterAction(feed(), 'eat'));
  $('act-play').addEventListener('click', () => afterAction(play(), 'happy'));
  $('act-sleep').addEventListener('click', () => afterAction(toggleSleep(), null));
  $('buddy-svg').addEventListener('click', onPet);
  $('buddy-change').addEventListener('click', () => { choosing = true; renderBuddy(); });
  $('buddy-rename').addEventListener('click', () => {
    const f = $('rename-form');
    f.hidden = !f.hidden;
    if (!f.hidden) { $('rename-input').value = buddy()?.nick || ''; $('rename-input').focus(); }
  });
  $('rename-form').addEventListener('submit', (e) => {
    e.preventDefault();
    rename($('rename-input').value);
    $('rename-form').hidden = true;
    renderStats();
    onChangeFn();
    say(`좋아! 이제 내 이름은 ${josa(displayName(), '이야', '야')}!`);
  });
  $('evolve-ok').addEventListener('click', () => { $('evolve').hidden = true; renderStats(); onChangeFn(); });
}
