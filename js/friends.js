// 친구와 함께: 놀러 가기, 선물하기, 텃밭 물 주기, 같이 걷기
// - 위치는 절대 보내지 않아요. 같은 친구 코드 안에서 우편(mail)으로만 주고받습니다.
// - 선물은 하루 5번, 놀러 가기 보상은 친구마다 하루 1번, 같이 걷기는 1시간 동안.

import { store, remote } from './store.js';
import { speciesById, monsterSVG, josa } from './monsters.js';
import { STAGES, hasBuddy, buddy, buddySpecies, stageIndex, displayName, visitReward, bonusGrow } from './buddy.js';
import { MATERIALS, MATERIAL_IDS, addMaterials, matCount, cozyOf, cozyLevel, SLOTS } from './room.js';
import { CROPS, PLOT_IDS, parseFriendGarden, waterFromFriend } from './garden.js';
import { createBuddyView } from './stage3d.js';
import { showEvolve } from './buddy-ui.js';
import { weather, timeOfDay } from './weather.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toLocaleDateString('ko-KR');
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const GIFTS_PER_DAY = 5;
export const WALK_GOAL = 1000;          // 둘이 합쳐 1km
export const WALK_MINUTES = 60;

// 방명록 스티커 (영어도 같이 익히기)
export const STICKERS = [
  ['놀러 왔다 갔어! 👋', 'I stopped by to say hi!'],
  ['방 진짜 예쁘다! 🏡', 'Your room is so pretty!'],
  ['텃밭 최고야! 🌱', 'Your garden is awesome!'],
  ['또 놀러 올게! 💛', "I'll come again soon!"],
  ['선물 받아 줘! 🎁', 'This is for you!'],
  ['우리 단짝이지? 🤝', "You're my best friend!"],
];

let toastFn = () => {};
let onChangeFn = () => {};
let visitView = null;
let visiting = null; // 지금 놀러 간 친구
let visitPlace = 'room';
const seenMail = new Set();

function f() {
  const s = store.state;
  s.friends = s.friends || { day: '', gifts: 0, visited: {}, watered: {} };
  if (s.friends.day !== today()) { s.friends.day = today(); s.friends.gifts = 0; s.friends.visited = {}; s.friends.watered = {}; }
  return s.friends;
}

export const giftsLeft = () => Math.max(0, GIFTS_PER_DAY - f().gifts);
const friendName = (p) => esc(p?.name || p?.fromName || '친구');
const num = (v, lo = 0, hi = 1e9) => Math.max(lo, Math.min(hi, Math.floor(Number(v)) || 0));

function itemInfo(item) {
  if (item === 'snack') return { name: '간식', icon: '🍪' };
  return MATERIALS[item] || null;
}
const have = (item) => (item === 'snack' ? store.state.snacks : matCount(item));

// ---------- 우편 받기 ----------

export function pendingMail() {
  return (remote.mail || []).filter(m => m.kind !== 'water');
}

/** 새 우편 처리: 물 주기는 바로, 나머지는 알림 */
export function processMail() {
  for (const m of remote.mail || []) {
    if (seenMail.has(m.id)) continue;
    seenMail.add(m.id);
    if (m.kind === 'water') {
      const plot = PLOT_IDS.includes(m.plot) ? m.plot : null;
      if (plot && waterFromFriend(plot)) toastFn(`💧 ${m.fromName || '친구'}님이 내 텃밭에 물을 줬어요!`);
      remote.deleteMail(store.state, m.id);
      continue;
    }
    if (m.kind === 'gift') toastFn(`🎁 ${m.fromName || '친구'}님이 선물을 보냈어요! 친구 탭에서 열어 보세요.`, 3500);
    if (m.kind === 'visit') toastFn(`🏡 ${m.fromName || '친구'}님 짝꿍이 우리 집에 놀러 왔다 갔어요!`, 3500);
    if (m.kind === 'walk') toastFn(`🚶 ${m.fromName || '친구'}님이 같이 걷자고 해요! 친구 탭에서 받아 주세요.`, 3500);
  }
  updateBadge();
}

function updateBadge() {
  const n = pendingMail().length;
  const b = $('mail-badge');
  if (!b) return;
  b.hidden = n === 0;
  b.textContent = n > 9 ? '9+' : String(n);
}

export function inboxHtml() {
  const list = pendingMail();
  if (!list.length) return '';
  return `<div class="inbox"><h3 class="sub">📬 우편함</h3><ul class="inbox-list">${list.map(m => {
    const who = `<b>${esc(m.fromName || '친구')}</b>`;
    const st = STICKERS[num(m.sticker, 0, STICKERS.length - 1)];
    const note = m.sticker != null && st ? `<span class="note"><span lang="en">${esc(st[1])}</span> · ${esc(st[0])}</span>` : '';
    if (m.kind === 'gift') {
      const it = itemInfo(m.item);
      return `<li><span class="inbox-ico">🎁</span><span>${who}님의 선물: ${it ? `${it.icon} ${esc(it.name)} ${num(m.n, 1, 10)}개` : '알 수 없는 선물'}${note}</span>
        <button class="btn primary" data-open="${esc(m.id)}" type="button">열기</button></li>`;
    }
    if (m.kind === 'visit') {
      return `<li><span class="inbox-ico">🏡</span><span>${who}님 짝꿍이 놀러 왔다 갔어요${note}</span>
        <button class="btn ghost" data-ok="${esc(m.id)}" type="button">확인</button></li>`;
    }
    if (m.kind === 'walk') {
      return `<li><span class="inbox-ico">🚶</span><span>${who}님이 같이 걷자고 해요! (${WALK_MINUTES}분 동안 둘이 합쳐 ${WALK_GOAL / 1000}km)</span>
        <button class="btn primary" data-walk="${esc(m.id)}" type="button">같이 걷기</button></li>`;
    }
    return '';
  }).join('')}</ul></div>`;
}

export function bindInbox(box, rerender) {
  for (const b of box.querySelectorAll('[data-open]')) {
    b.addEventListener('click', () => {
      const m = remote.mail.find(x => x.id === b.dataset.open);
      if (!m) return;
      const it = itemInfo(m.item);
      const n = num(m.n, 1, 10);
      if (it) {
        if (m.item === 'snack') store.state.snacks += n; else addMaterials({ [m.item]: n });
        store.save();
        toastFn(`${it.icon} ${it.name} ${n}개를 받았어요! 고마워, ${m.fromName || '친구'}!`);
      }
      remote.deleteMail(store.state, m.id);
      onChangeFn();
      rerender();
    });
  }
  for (const b of box.querySelectorAll('[data-ok]')) {
    b.addEventListener('click', () => { remote.deleteMail(store.state, b.dataset.ok); rerender(); });
  }
  for (const b of box.querySelectorAll('[data-walk]')) {
    b.addEventListener('click', () => {
      const m = remote.mail.find(x => x.id === b.dataset.walk);
      if (!m) return;
      acceptWalk(m);
      remote.deleteMail(store.state, m.id);
      rerender();
    });
  }
}

// ---------- 선물하기 ----------

function giftables() {
  const list = [];
  if (store.state.snacks > 0) list.push('snack');
  for (const k of MATERIAL_IDS) if (matCount(k) > 0) list.push(k);
  return list;
}

export function openGift(p) {
  const left = giftsLeft();
  const items = giftables();
  $('slot-title').textContent = `${p.name || '친구'}에게 선물하기`;
  if (!left) {
    $('slot-items').innerHTML = '<p class="craft-empty">오늘 선물은 다 보냈어요. 내일 또 보내요! (하루 5번)</p>';
  } else if (!items.length) {
    $('slot-items').innerHTML = '<p class="craft-empty">보낼 수 있는 게 없어요. 재료를 줍거나 텃밭에서 거둬 보세요.</p>';
  } else {
    $('slot-items').innerHTML = `<p class="muted small">오늘 ${left}번 더 보낼 수 있어요. 무엇을 보낼까요?</p>
      <div class="gift-grid">${items.map(k => { const it = itemInfo(k); return `<button class="gift-item" data-item="${k}" type="button"><b>${it.icon}</b><small>${esc(it.name)}<br>${have(k)}개</small></button>`; }).join('')}</div>
      <div id="gift-step" hidden>
        <p class="small">몇 개 보낼까요?</p><div id="gift-n" class="gift-n"></div>
        <p class="small">쪽지도 붙일까요? (영어로도 읽어 봐요)</p><div id="gift-sticker" class="sticker-list"></div>
        <button id="gift-send" class="btn primary" type="button">🎁 보내기</button>
      </div>`;
    let item = null;
    let n = 1;
    let sticker = 4;
    const renderStep = () => {
      const max = Math.min(10, have(item));
      $('gift-n').innerHTML = [1, 3, 5, 10].filter(v => v <= max).map(v => `<button type="button" data-n="${v}" aria-pressed="${v === n}">${v}개</button>`).join('');
      for (const b of $('gift-n').querySelectorAll('[data-n]')) b.addEventListener('click', () => { n = +b.dataset.n; renderStep(); });
      $('gift-sticker').innerHTML = STICKERS.map((s, i) => `<button type="button" data-st="${i}" aria-pressed="${i === sticker}"><span lang="en">${esc(s[1])}</span><small>${esc(s[0])}</small></button>`).join('');
      for (const b of $('gift-sticker').querySelectorAll('[data-st]')) b.addEventListener('click', () => { sticker = +b.dataset.st; renderStep(); });
    };
    for (const b of $('slot-items').querySelectorAll('[data-item]')) {
      b.addEventListener('click', () => {
        item = b.dataset.item;
        n = 1;
        for (const x of $('slot-items').querySelectorAll('[data-item]')) x.classList.toggle('on', x === b);
        $('gift-step').hidden = false;
        renderStep();
      });
    }
    $('gift-send').addEventListener('click', async () => {
      if (!item || have(item) < n || !giftsLeft()) return;
      // 먼저 빼고, 못 보내면 돌려줌
      if (item === 'snack') store.state.snacks -= n; else store.state.materials[item] = matCount(item) - n;
      f().gifts++;
      store.save();
      $('slot-sheet').hidden = true;
      const ok = await remote.sendMail(store.state, p.uid, { kind: 'gift', item, n, sticker });
      if (!ok) {
        if (item === 'snack') store.state.snacks += n; else addMaterials({ [item]: n });
        f().gifts--;
        store.save();
        toastFn('선물을 보내지 못했어요. 인터넷 연결을 확인해 주세요.');
        return;
      }
      const it = itemInfo(item);
      toastFn(`🎁 ${p.name}에게 ${it.icon} ${it.name} ${n}개를 보냈어요!`);
      onChangeFn();
    });
  }
  $('slot-sheet').hidden = false;
}

// ---------- 같이 걷기 ----------

function wt() { return store.state.walkTogether || null; }
const myWalked = () => buddy()?.walkedM || 0;

export function inviteWalk(p) {
  const w = walkStatus();
  if (w && !w.done) { toastFn(`이미 ${w.withName}님과 같이 걷기 중이에요.`); return; }
  if (!hasBuddy()) { toastFn('짝꿍이 있어야 같이 걸을 수 있어요. 짝꿍 탭에서 골라 주세요!'); return; }
  const id = `${remote.uid}-${Date.now().toString(36)}`;
  store.state.walkTogether = { id, with: p.uid, withName: String(p.name || '친구').slice(0, 12), since: Date.now(), startM: myWalked(), accepted: true, rewarded: false, bonusAcc: 0 };
  store.save();
  remote.sendMail(store.state, p.uid, { kind: 'walk', walkId: id }).then(ok => {
    toastFn(ok ? `🚶 ${p.name}님에게 같이 걷자고 했어요! 친구가 받으면 시작돼요.` : '초대를 보내지 못했어요.');
    if (!ok) { store.state.walkTogether = null; store.save(); }
  });
  onChangeFn();
}

function acceptWalk(m) {
  if (!hasBuddy()) { toastFn('짝꿍이 있어야 같이 걸을 수 있어요. 짝꿍 탭에서 골라 주세요!'); return; }
  store.state.walkTogether = { id: String(m.walkId || ''), with: m.from, withName: String(m.fromName || '친구').slice(0, 12), since: Date.now(), startM: myWalked(), accepted: true, rewarded: false, bonusAcc: 0 };
  store.save();
  toastFn(`🚶 ${m.fromName}님과 같이 걷기 시작! ${WALK_MINUTES}분 안에 둘이 합쳐 ${WALK_GOAL / 1000}km를 걸어 봐요.`, 3500);
  onChangeFn();
}

/** 같이 걷기 상태 (없으면 null) */
export function walkStatus(now = Date.now()) {
  const w = wt();
  if (!w) return null;
  const left = w.since + WALK_MINUTES * 60000 - now;
  if (left <= 0) {
    store.state.walkTogether = null;
    store.save();
    if (!w.rewarded) toastFn('같이 걷기 시간이 끝났어요. 다음에 또 같이 걸어요!');
    return null;
  }
  const partner = (remote.players || []).find(p => p.uid === w.with);
  const on = partner?.walk?.id === w.id;
  const mine = Math.max(0, myWalked() - w.startM);
  const theirs = on ? num(partner.walk.m, 0, 100000) : 0;
  return { ...w, on, mine, theirs, total: mine + theirs, left, done: w.rewarded };
}

/** 지도에서 걸을 때마다: 함께 걷는 중이면 보너스 성장, 목표 채우면 보상 */
export function onWalk(d) {
  const w = walkStatus();
  if (!w || !w.on || w.done) return;
  const st = store.state.walkTogether;
  st.bonusAcc = (st.bonusAcc || 0) + d * 0.05; // 평소의 1.5배 (10m에 1점 → 1.5점)
  const pts = Math.floor(st.bonusAcc);
  if (pts > 0) { st.bonusAcc -= pts; const ev = bonusGrow(pts); if (ev != null) showEvolve(ev); }
  store.save();
  checkWalkGoal();
}

/** 둘이 합쳐 목표를 채웠으면 보상 (내가 걸을 때도, 친구 기록이 바뀔 때도 확인)
 *  성공해도 바로 끝내지 않고 시간이 다 될 때까지 두어, 친구도 같은 합계를 보고 보상을 받게 함 */
function checkWalkGoal() {
  const w = walkStatus();
  if (!w || !w.on || w.done || w.total < WALK_GOAL) return;
  store.state.walkTogether.rewarded = true;
  addMaterials({ ribbon: 1 });
  const ev = bonusGrow(30);
  if (ev != null) showEvolve(ev);
  if (hasBuddy()) remote.postFeed(store.state, buddy().speciesId, false, { kind: 'walk', withName: w.withName });
  toastFn(`🎀 ${w.withName}님과 같이 ${WALK_GOAL / 1000}km 걷기 성공! 우정 리본을 받았어요 (짝꿍 성장 +30)`, 4500);
  store.save();
  onChangeFn();
}

export function walkCardHtml() {
  const w = walkStatus();
  if (!w) return '';
  const pct = Math.min(100, Math.round((w.total / WALK_GOAL) * 100));
  const mins = Math.max(0, Math.ceil(w.left / 60000));
  return `<div class="walk-card">
    <p><b>🚶 ${esc(w.withName)}님과 같이 걷기</b> <small class="muted">${w.done ? '성공!' : `${mins}분 남음`}</small></p>
    ${w.on ? `<div class="grow-bar"><span style="width:${pct}%"></span></div>
      <p class="small">나 ${Math.round(w.mine)}m + ${esc(w.withName)} ${w.theirs}m = <b>${Math.round(w.total)}</b> / ${WALK_GOAL}m · 함께 걷는 동안 짝꿍이 1.5배 빨리 자라요</p>`
    : `<p class="small muted">${esc(w.withName)}님이 초대를 받으면 시작돼요. (위치는 서로 보내지 않고, 걸은 거리만 나눠요)</p>`}
  </div>`;
}

export function walkBanner() {
  const w = walkStatus();
  const el = $('walk-banner');
  if (!el) return;
  el.hidden = !w || !w.on;
  if (w?.on) el.textContent = w.done ? `🎀 ${w.withName}님과 같이 걷기 성공!` : `🚶 ${w.withName}님과 같이 걷기 ${Math.round(w.total)}/${WALK_GOAL}m`;
}

// ---------- 친구 창 단추 ----------

export function friendActionsHtml(p) {
  if (!remote.ready || p.uid === remote.uid) return '';
  return `<div class="friend-actions">
    <button class="act" data-fa="visit" type="button"><span class="act-ico">🏡</span>놀러 가기</button>
    <button class="act" data-fa="gift" type="button"><span class="act-ico">🎁</span>선물하기<small>${giftsLeft()}/${GIFTS_PER_DAY}</small></button>
    <button class="act" data-fa="walk" type="button"><span class="act-ico">🚶</span>같이 걷기</button>
  </div>`;
}

export function bindFriendActions(box, p) {
  box.querySelector('[data-fa=visit]')?.addEventListener('click', () => { $('sp-sheet').hidden = true; openVisit(p); });
  box.querySelector('[data-fa=gift]')?.addEventListener('click', () => { $('sp-sheet').hidden = true; openGift(p); });
  box.querySelector('[data-fa=walk]')?.addEventListener('click', () => { $('sp-sheet').hidden = true; inviteWalk(p); });
}

// ---------- 놀러 가기 ----------

function visitSay(text) {
  const el = $('visit-say');
  el.textContent = text;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

let visitToken = 0;
async function buildVisitView() {
  visitView?.dispose();
  visitView = null;
  const token = ++visitToken;
  const p = visiting;
  const hostSp = speciesById[p.buddy?.speciesId] || buddySpecies() || speciesById.sumbbong;
  const hostStage = num(p.buddy?.stage, 0, 2);
  const mine = hasBuddy() && speciesById[p.buddy?.speciesId] ? { sp: buddySpecies(), stage: stageIndex() } : null;
  const home = p.home && typeof p.home === 'object' ? { wall: String(p.home.wall || 'cream'), floor: String(p.home.floor || 'wood'), slots: p.home.slots || {} } : { wall: 'cream', floor: 'wood', slots: {} };
  let v = null;
  try {
    v = await createBuddyView($('visit-3d'), hostSp, {
      stage: hostStage, room: home, slots: SLOTS, garden: parseFriendGarden(p.garden), place: visitPlace,
      weatherKind: weather().kind, tod: timeOfDay(), guest: mine,
      onPet: () => { visitView?.play('hop'); visitSay(pick(['헤헤, 반가워!', 'Nice to meet you! (만나서 반가워!)', '우리 집 어때?'])); },
      onPlot: waterFriendPlot,
    });
  } catch (e) { console.warn(e); v = null; }
  // 불러오는 사이 닫았거나 다른 친구 집을 열었으면 이 화면은 버림
  if (!visiting || token !== visitToken) { v?.dispose(); return; }
  visitView = v;
  $('visit-svg').hidden = Boolean(visitView);
  if (!visitView) $('visit-svg').innerHTML = monsterSVG(hostSp, { size: 150 }) + (mine ? monsterSVG(mine.sp, { size: 110 }) : '');
}

function renderVisitInfo() {
  const p = visiting;
  const bsp = speciesById[p.buddy?.speciesId];
  const cz = cozyOf(p.home);
  const lv = cozyLevel(cz);
  const garden = parseFriendGarden(p.garden);
  const thirsty = PLOT_IDS.filter(id => garden[id]?.thirsty).length;
  const ready = PLOT_IDS.filter(id => garden[id]?.stage === 3).length;
  $('visit-info').innerHTML = `
    <p class="visit-host">${bsp ? `${esc(p.buddy.nick || bsp.name)} · ${STAGES[num(p.buddy.stage, 0, 2)].name} ${bsp.name}` : '아직 짝꿍이 없는 친구예요'}</p>
    <p class="small">${visitPlace === 'room'
      ? `아늑함 ${'💛'.repeat(lv)}${'🤍'.repeat(5 - lv)} (${cz})`
      : PLOT_IDS.some(id => garden[id])
        ? `텃밭 ${PLOT_IDS.filter(id => garden[id]).length}칸 · ${thirsty ? `💧 목마른 밭 ${thirsty}칸 — 눌러서 물을 줘요!` : '모두 촉촉해요'}${ready ? ` · 다 자란 것 ${ready}칸` : ''}`
        : '아직 심은 게 없는 텃밭이에요. 씨앗을 선물해 볼까요?'}</p>
    <p class="small"><b>방명록 남기기</b> <span class="muted">(친구에게 쪽지로 가요)</span></p>
    <div class="sticker-list">${STICKERS.map((s, i) => `<button type="button" data-vst="${i}"><span lang="en">${esc(s[1])}</span><small>${esc(s[0])}</small></button>`).join('')}</div>
    <button id="visit-gift" class="btn ghost" type="button">🎁 선물도 주기 (${giftsLeft()}/${GIFTS_PER_DAY})</button>`;
  for (const b of $('visit-info').querySelectorAll('[data-vst]')) {
    b.addEventListener('click', async () => {
      const i = +b.dataset.vst;
      const ok = await remote.sendMail(store.state, p.uid, { kind: 'visit', sticker: i });
      toastFn(ok ? `방명록을 남겼어요: "${STICKERS[i][1]}"` : '방명록을 남기지 못했어요.');
      if (ok) { visitView?.play('happy'); visitSay(`${STICKERS[i][1]} (${STICKERS[i][0]})`); }
    });
  }
  $('visit-gift').addEventListener('click', () => openGift(p));
}

async function waterFriendPlot(plotId) {
  const p = visiting;
  if (!p) return;
  const v = parseFriendGarden(p.garden)[plotId];
  if (!v) { visitSay('여긴 아직 아무것도 안 심었네.'); return; }
  const c = CROPS[v.crop];
  if (!v.thirsty) { visitSay(v.stage === 3 ? `${c.name} 다 자랐다! 친구가 거두면 되겠다.` : `${c.name} 촉촉하네! 잘 자라고 있어.`); return; }
  const key = `${p.uid}:${plotId}`;
  if (f().watered[key]) { visitSay('아까 물 줬어! 곧 친구 텃밭에 닿을 거야.'); return; }
  const ok = await remote.sendMail(store.state, p.uid, { kind: 'water', plot: plotId });
  if (!ok) { toastFn('물을 주지 못했어요. 인터넷 연결을 확인해 주세요.'); return; }
  f().watered[key] = true;
  store.save();
  visitView?.play('happy');
  visitSay(pick([`${c.name}에 물 줬다! 친구가 좋아하겠다!`, 'Water for your plants! (네 식물에 물 줬어!)']));
  toastFn(`💧 ${p.name}님 텃밭의 ${c.name}에 물을 줬어요!`);
}

export async function openVisit(p) {
  visiting = p;
  visitPlace = 'room';
  $('visit-title').textContent = `${p.name || '친구'}네 집`;
  $('visit-room').setAttribute('aria-pressed', 'true');
  $('visit-garden').setAttribute('aria-pressed', 'false');
  $('visit').hidden = false;
  document.body.classList.add('talking');
  $('visit-say').textContent = '';
  renderVisitInfo();
  await buildVisitView();
  // 친구마다 하루 한 번 놀러 간 보상
  const fr = f();
  if (!fr.visited[p.uid] && hasBuddy()) {
    fr.visited[p.uid] = true;
    store.save();
    const r = visitReward();
    remote.postFeed(store.state, buddy().speciesId, false, { kind: 'visit', toName: String(p.name || '').slice(0, 12) });
    visitSay(`${josa(displayName(), '이', '가')} 놀러 왔어! 신난다! (기분 +15, 성장 +5)`);
    onChangeFn();
    if (r?.evolved != null) toastFn(`${josa(displayName(), '이', '가')} 자랐어요! 짝꿍 탭에서 확인해 보세요.`);
  } else {
    visitSay(pick([`어서 와! ${p.name || '친구'}네 집이야.`, 'Welcome to my house! (우리 집에 온 걸 환영해!)']));
  }
}

export function closeVisit() {
  visiting = null;
  visitToken++;
  visitView?.dispose();
  visitView = null;
  $('visit').hidden = true;
  document.body.classList.remove('talking');
}

export function initFriends({ toast, onChange }) {
  toastFn = toast;
  onChangeFn = onChange || (() => {});
  $('visit-close').addEventListener('click', closeVisit);
  const setPlace = async (pl) => {
    visitPlace = pl;
    $('visit-room').setAttribute('aria-pressed', String(pl === 'room'));
    $('visit-garden').setAttribute('aria-pressed', String(pl === 'garden'));
    renderVisitInfo();
    if (visitView) await visitView.setPlace(pl, parseFriendGarden(visiting?.garden));
    visitSay(pl === 'garden' ? pick(['우리 텃밭 구경할래?', 'This is my garden! (여기가 내 텃밭이야!)']) : '우리 방 아늑하지?');
  };
  $('visit-room').addEventListener('click', () => setPlace('room'));
  $('visit-garden').addEventListener('click', () => setPlace('garden'));
  remote.onChange(() => {
    processMail();
    checkWalkGoal();
    // 놀러 가 있는 동안 친구 기록이 바뀌면 (예: 물 준 게 반영) 다시 그림
    if (visiting) {
      const fresh = (remote.players || []).find(x => x.uid === visiting.uid);
      if (fresh && JSON.stringify(fresh.garden) !== JSON.stringify(visiting.garden)) {
        visiting = fresh;
        visitView?.setGarden(parseFriendGarden(fresh.garden));
        renderVisitInfo();
      }
    }
  });
}
