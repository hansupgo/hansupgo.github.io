// 짝꿍 탭 화면: 고르기, 돌보기, 성장, 진화 축하

import { SPECIES, speciesById, monsterSVG, josa } from './monsters.js';
import { store } from './store.js';
import { createBuddyView } from './stage3d.js';
import { weather, weatherInfo, timeOfDay } from './weather.js';
import {
  CROPS, CROP_IDS, PLOT_IDS, STAGE_NAMES, FOODS, seeds, crops, plot, tickGarden, stageOf, isReady, isThirsty,
  timeLeft, fmtLeft, plant, water, harvest, gardenView, hasFood,
} from './garden.js';
import {
  STAGES, hasBuddy, buddy, buddySpecies, displayName, stageIndex, stageProgress,
  adopt, tick, feed, feedCrop, play, pet, toggleSleep, rename, addWalk, talk, evolveLine, dailyRoomBonus, englishReward,
} from './buddy.js';
import { openTalk, initTalkUI } from './english.js';
import {
  MATERIALS, MATERIAL_IDS, BASIC_IDS, FURNITURE, furnitureById, THEMES, SLOTS, slotById, whereName,
  room, matCount, canAfford, craft, unlockTheme, hasTheme, owned, spare, place, clearSlot,
  cozy, cozyLevel,
} from './room.js';

const $ = (id) => document.getElementById(id);
const STARTERS = ['sumbbong', 'mulbangkong', 'bulssikkomi'];

let view = null;         // 3D 짝꿍 화면
let viewFor = '';        // 어떤 짝꿍으로 만든 화면인지
let talkTimer = 0;
let toastFn = () => {};
let onChangeFn = () => {};
let choosing = false;    // 짝꿍 바꾸기 중
let editing = false;     // 방 꾸미기 중
let viewToken = 0;       // 3D 화면을 여러 번 동시에 만들지 않도록
let pendingGreeting = '';
let placeNow = 'room';   // 'room' | 'garden'

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

/** 도감에서 짝꿍으로 정하기 (화면은 짝꿍 탭을 열 때 그림) */
export function setBuddyFromDex(id) {
  const again = Boolean(store.state.buddyBook?.[id]);
  adopt(id);
  choosing = false;
  onChangeFn();
  pendingGreeting = again ? `다시 만나서 반가워! 나 ${displayName()}!` : `안녕! 나는 ${displayName()}! 앞으로 잘 부탁해!`;
}

// ---------- 돌보기 화면 ----------

async function ensureView() {
  const sp = buddySpecies();
  const key = sp.id;
  if (viewFor === key) return; // 이미 있거나 만드는 중
  closeView();
  viewFor = key;
  const token = ++viewToken;
  const box = $('buddy-3d');
  const v = await createBuddyView(box, sp, {
    stage: stageIndex(), onPet, onSlot: openSlot, onPlot: openPlot, room: room(), slots: SLOTS, zzzEl: $('buddy-zzz'),
    garden: gardenView(), place: placeNow, weatherKind: weather().kind, tod: timeOfDay(),
  });
  if (token !== viewToken || document.body.dataset.tab !== 'buddy') { v?.dispose(); return; }
  view = v;
  $('buddy-svg').hidden = Boolean(view);
  if (!view) $('buddy-svg').innerHTML = monsterSVG(sp, { size: 180 });
  view?.setSleeping(buddy().sleeping);
  view?.setEditing(editing);
}

function closeView() {
  viewToken++;
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
  $('act-feed-label').textContent = hasFood() ? '밥 주기' : `밥 주기 (${store.state.snacks})`;
  if (placeNow === 'garden') renderGardenInfo(); else renderRoomInfo();
}

export async function renderBuddy(greeting) {
  clearInterval(talkTimer);
  if (!hasBuddy() || choosing) { closeView(); renderAdopt(); return; }
  $('buddy-adopt').hidden = true;
  $('buddy-home').hidden = false;
  renderStats();
  const bonus = dailyRoomBonus();
  if (!greeting && pendingGreeting) greeting = pendingGreeting;
  pendingGreeting = '';
  if (bonus) { renderStats(); greeting = `아늑한 방에서 푹 쉬었더니 힘이 나! (성장 +${bonus.pts})`; }
  await ensureView();
  say(greeting || talk({ todayM: buddy().todayM }));
  if (bonus?.evolved != null) showEvolve(bonus.evolved);
  talkTimer = setInterval(() => {
    if (document.body.dataset.tab !== 'buddy') return;
    tickGarden();
    renderStats();
    view?.setWeather(weather().kind, timeOfDay());
    view?.setGarden(gardenView());
    if (!editing) say(Math.random() < 0.3 && englishLine() || talk({ todayM: buddy().todayM }));
  }, 14000);
}

// 영어 대화에서 배운 표현을 가끔 혼잣말로
function englishLine() {
  const ps = Object.entries(store.state.english?.phrases || {});
  if (!ps.length) return '';
  const [en, v] = ps[Math.floor(Math.random() * ps.length)];
  return `${en} (${v.ko})`;
}

function startTalk() {
  if (!hasBuddy()) return;
  viewFor = ''; // 돌아오면 같은 장소로 다시 그림
  setEditing(false);
  clearInterval(talkTimer);
  closeView(); // 대화하는 동안 3D 방은 쉼
  openTalk({
    sp: buddySpecies(),
    name: store.state.name,
    stage: stageIndex(),
    toast: toastFn,
    onDone: (n) => { const r = englishReward(n); onChangeFn(); return r; },
    onEvolve: showEvolve,
    onClose: () => { if (document.body.dataset.tab === 'buddy') renderBuddy(pick(['Thanks for talking with me! (나랑 이야기해 줘서 고마워!)', 'That was fun! (재밌었다!)'])); },
  });
}

export function leaveBuddy() {
  clearInterval(talkTimer);
  setEditing(false);
  closeView();
}

// ---------- 방 꾸미기 ----------

function defaultChips() {
  // 기본 재료 + 날씨 재료·작물은 가진 것만
  return [...BASIC_IDS, ...MATERIAL_IDS.filter(k => !BASIC_IDS.includes(k) && !MATERIALS[k].seed && matCount(k) > 0)];
}

function matChips(ids = defaultChips()) {
  return ids.map(k => `<span class="mat ${matCount(k) ? '' : 'zero'}" title="${MATERIALS[k].name}">${MATERIALS[k].icon} ${matCount(k)}</span>`).join('');
}

// ---------- 텃밭 ----------

function plotLabel(id) { return `밭 ${id.slice(1)}`; }

function renderGardenInfo() {
  tickGarden();
  const w = weather();
  const info = weatherInfo();
  const tod = timeOfDay();
  $('garden-wx').textContent = `${tod === 'night' ? info.night : info.icon} ${info.name}${w.temp != null ? ` ${w.temp}°` : ''}`;
  $('garden-tip').textContent = ['rain', 'storm'].includes(w.kind)
    ? '비가 와서 밭이 저절로 물을 먹고 있어!'
    : w.kind === 'clear' && tod === 'day' ? '맑은 낮이라 평소보다 빨리 자라! 💧가 뜬 밭에는 물을 줘.' : '💧가 뜬 밭에 물을 주면 자라. 물 먹은 동안만 자라.';
  $('plot-chips').innerHTML = PLOT_IDS.map(id => {
    const p = plot(id);
    if (!p) return `<button class="plot-chip empty" data-plot="${id}" type="button"><b>＋</b><small>${plotLabel(id)} · 비었어</small></button>`;
    const c = CROPS[p.crop];
    const st = stageOf(p);
    const ready = isReady(p);
    const thirsty = isThirsty(p);
    const sub = ready ? '수확해!' : thirsty ? '💧 물 줘!' : `${STAGE_NAMES[st]} · ${fmtLeft(timeLeft(p))}`;
    return `<button class="plot-chip ${ready ? 'ready' : thirsty ? 'thirsty' : ''}" data-plot="${id}" type="button"><b>${st >= 2 || ready ? c.icon : st === 1 ? '🌱' : '🟤'}</b><small>${c.name}<br>${sub}</small></button>`;
  }).join('');
  for (const b of $('plot-chips').querySelectorAll('[data-plot]')) b.addEventListener('click', () => openPlot(b.dataset.plot));
  const seedIds = CROP_IDS.filter(k => seeds(k) > 0);
  $('seed-strip').innerHTML = seedIds.length
    ? seedIds.map(k => `<span class="mat" title="${CROPS[k].name} 씨앗">${CROPS[k].icon}🌱 ${seeds(k)}</span>`).join('')
    : '<span class="muted small">아직 씨앗이 없어. 공원이나 거점에서 찾아봐!</span>';
  const cropIds = CROP_IDS.filter(k => crops(k) > 0);
  $('crop-strip').innerHTML = cropIds.length
    ? cropIds.map(k => `<span class="mat" title="${CROPS[k].name}">${CROPS[k].icon} ${crops(k)}</span>`).join('')
    : '<span class="muted small">다 자라면 거둘 수 있어.</span>';
}

function seedHint() {
  return `<p class="seed-hint">${CROP_IDS.map(k => `${CROPS[k].icon} <b>${CROPS[k].name}</b>: ${CROPS[k].from}`).join('<br>')}</p>`;
}

function openPlot(id) {
  if (!PLOT_IDS.includes(id)) return;
  tickGarden();
  const p = plot(id);
  let html = '';
  if (!p) {
    $('slot-title').textContent = `${plotLabel(id)}: 무엇을 심을까?`;
    const have = CROP_IDS.filter(k => seeds(k) > 0);
    html = have.map(k => `<button class="craft-item" data-plant="${k}" type="button">
        <span class="craft-ico">${CROPS[k].icon}</span>
        <span><span class="craft-name">${CROPS[k].name} 씨앗</span><br><span class="craft-meta">${seeds(k)}개 · 다 자라는 데 ${fmtLeft(CROPS[k].hours * 3600e3)} (물 먹은 시간)</span></span>
        <span class="btn primary">심기</span></button>`).join('')
      + (have.length ? `<details class="seed-more"><summary>다른 씨앗은 어디서 찾아?</summary>${seedHint()}</details>` : '')
      || `<p class="craft-empty">씨앗이 없어. 이런 곳에서 찾을 수 있어:</p>${seedHint()}`;
  } else {
    const c = CROPS[p.crop];
    const st = stageOf(p);
    $('slot-title').textContent = `${plotLabel(id)}: ${c.icon} ${c.name} (${STAGE_NAMES[st]})`;
    if (isReady(p)) {
      html = `<p class="craft-empty">다 자랐어! 거둬 볼까?</p><button id="plot-harvest" class="btn primary" type="button">🧺 거두기</button>`;
    } else {
      const thirsty = isThirsty(p);
      html = `<p class="craft-empty">${thirsty ? '목말라 보여. 물을 주면 다시 자라.' : `촉촉해! 지금 자라는 중이야. 다 자라기까지 약 ${fmtLeft(timeLeft(p))}`}</p>
        <button id="plot-water" class="btn primary" type="button" ${thirsty ? '' : 'disabled'}>💧 물 주기</button>`;
    }
  }
  $('slot-items').innerHTML = html;
  for (const b of $('slot-items').querySelectorAll('[data-plant]')) {
    b.addEventListener('click', () => {
      const k = b.dataset.plant;
      if (plant(id, k)) afterGarden(pick([`${CROPS[k].name} 씨앗 심었다! 무럭무럭 자라라~`, '흙 냄새 좋다!', 'Plant it! (심자!) 잘 자랄 거야!']));
      closeSheet('slot-sheet');
    });
  }
  $('plot-water')?.addEventListener('click', () => {
    if (water(id)) afterGarden(pick(['물 줬다! 쑥쑥 자라라~', '찰랑찰랑! 시원하겠다!', 'Water, water! (물이다, 물!)']));
    closeSheet('slot-sheet');
  });
  $('plot-harvest')?.addEventListener('click', () => {
    const crop = plot(id)?.crop;
    const n = harvest(id);
    if (n) {
      const c = CROPS[crop];
      toastFn(`${c.icon} ${c.name} ${n}개를 거뒀어요!`);
      afterGarden(FOODS[crop] ? `${c.name} ${n}개! 맛있겠다~ 나 하나만 줄래?` : `${c.name} ${n}개! 이걸로 예쁜 가구 만들자!`);
    }
    closeSheet('slot-sheet');
  });
  openSheet('slot-sheet');
}

function afterGarden(line) {
  view?.setGarden(gardenView());
  view?.play('happy');
  renderGardenInfo();
  say(line);
  onChangeFn();
}

async function setPlace(p) {
  if (p === placeNow) return;
  placeNow = p;
  setEditing(false);
  $('place-room').setAttribute('aria-pressed', String(p === 'room'));
  $('place-garden').setAttribute('aria-pressed', String(p === 'garden'));
  $('room-card').hidden = p !== 'room';
  $('garden-card').hidden = p !== 'garden';
  document.querySelector('.buddy-room').classList.toggle('outdoor', p === 'garden');
  tickGarden();
  await view?.setPlace(p, gardenView());
  if (p === 'garden') { renderGardenInfo(); say(pick(['텃밭이다! 뭐가 자랐나 볼까?', '흙 냄새 좋다~', "Let's check the garden! (텃밭 보러 가자!)"])); }
  else { renderRoomInfo(); say(pick(['집이 최고야!', '우리 방 아늑하다~'])); }
}

// 밥: 텃밭에서 거둔 게 있으면 고르기
function openFood() {
  if (!hasFood()) { afterAction(feed(), 'eat'); return; }
  $('slot-title').textContent = '뭐 줄까?';
  const items = [{ k: 'snack', icon: '🍪', name: '간식', n: store.state.snacks, meta: '배부름 +35' },
    ...Object.keys(FOODS).filter(k => crops(k) > 0).map(k => ({ k, icon: CROPS[k].icon, name: CROPS[k].name, n: crops(k), meta: `배부름 +${FOODS[k].h} · 기분 +${FOODS[k].m} · 성장 +8` }))];
  $('slot-items').innerHTML = items.map(i => `<button class="craft-item" data-food="${i.k}" type="button" ${i.n ? '' : 'disabled'}>
      <span class="craft-ico">${i.icon}</span><span><span class="craft-name">${i.name}</span> <small class="craft-meta">${i.n}개</small><br><span class="craft-meta">${i.meta}</span></span>
      <span class="btn primary">주기</span></button>`).join('');
  for (const b of $('slot-items').querySelectorAll('[data-food]')) {
    b.addEventListener('click', () => {
      closeSheet('slot-sheet');
      afterAction(b.dataset.food === 'snack' ? feed() : feedCrop(b.dataset.food), 'eat');
    });
  }
  openSheet('slot-sheet');
}

function renderRoomInfo() {
  const c = cozy();
  const lv = cozyLevel(c);
  $('cozy-hearts').textContent = '💛'.repeat(lv) + '🤍'.repeat(5 - lv);
  $('cozy-num').textContent = `아늑함 ${c}`;
  $('mat-strip').innerHTML = matChips();
  if (editing) renderSlotChips();
}

function renderSlotChips() {
  const r = room();
  $('slot-chips').innerHTML = SLOTS.map((sl) => {
    const f = furnitureById[r.slots[sl.id]];
    const label = sl.where === 'wall' ? `벽 ${sl.id.slice(1)}` : sl.where === 'rug' ? '가운데' : `바닥 ${sl.id.slice(1)}`;
    return `<button class="slot-chip ${f ? 'full' : ''}" data-slot="${sl.id}" type="button"><b>${f ? f.icon : '+'}</b>${label}</button>`;
  }).join('');
  for (const b of $('slot-chips').querySelectorAll('.slot-chip')) b.addEventListener('click', () => openSlot(b.dataset.slot));
}

function setEditing(v) {
  editing = v;
  $('edit-bar').hidden = !v;
  $('slot-chips').hidden = !v;
  document.querySelector('.buddy-room')?.classList.toggle('editing', v);
  view?.setEditing(v);
  if (v) renderSlotChips();
}

function openSheet(id) { $(id).hidden = false; }
function closeSheet(id) { $(id).hidden = true; }

function openSlot(slotId) {
  const sl = slotById[slotId];
  if (!sl) return;
  const cur = room().slots[slotId];
  const fits = FURNITURE.filter(f => f.where === sl.where && (spare(f.id) > 0 || f.id === cur));
  $('slot-title').textContent = `${whereName(sl.where)} 자리에 놓기`;
  let html = fits.map(f => `<button class="craft-item" data-put="${f.id}" type="button">
      <span class="craft-ico">${f.icon}</span>
      <span><span class="craft-name">${f.name}</span><br><span class="craft-meta">아늑함 +${f.cozy} · 남은 것 ${spare(f.id)}개</span></span>
      <span class="btn ${f.id === cur ? 'ghost' : 'primary'}">${f.id === cur ? '놓여 있음' : '놓기'}</span>
    </button>`).join('');
  if (!fits.length) {
    html = `<p class="craft-empty">여기에 놓을 ${whereName(sl.where)} 가구가 없어. 먼저 만들어 볼까?</p>
      <button id="slot-to-craft" class="btn primary" type="button">🔨 가구 만들기</button>`;
  }
  if (cur) html += `<button id="slot-clear" class="btn ghost" type="button">${furnitureById[cur].name} 치우기</button>`;
  $('slot-items').innerHTML = html;
  for (const b of $('slot-items').querySelectorAll('[data-put]')) {
    b.addEventListener('click', () => {
      const id = b.dataset.put;
      if (id !== cur && place(slotId, id)) {
        afterRoomChange(pick([`우와, ${furnitureById[id].name}! 마음에 들어!`, '여기 딱이다!', '방이 점점 예뻐진다!']));
      }
      closeSheet('slot-sheet');
    });
  }
  $('slot-clear')?.addEventListener('click', () => {
    clearSlot(slotId);
    afterRoomChange('알았어, 치워 둘게!');
    closeSheet('slot-sheet');
  });
  $('slot-to-craft')?.addEventListener('click', () => { closeSheet('slot-sheet'); openCraft(); });
  openSheet('slot-sheet');
}

function afterRoomChange(line) {
  view?.setRoom(room());
  view?.play('happy');
  renderRoomInfo();
  say(line);
  onChangeFn();
}

function costHtml(cost) {
  return Object.entries(cost).map(([k, n]) => {
    const short = matCount(k) < n;
    return `<span class="${short ? 'short' : ''}">${MATERIALS[k].icon}${matCount(k)}/${n}</span>`;
  }).join(' ') || '무료';
}

function openCraft() {
  $('craft-mats').innerHTML = matChips();
  $('craft-list').innerHTML = FURNITURE.map(f => `<div class="craft-item ${f.special ? 'special' : ''}">
      <span class="craft-ico">${f.icon}</span>
      <span><span class="craft-name">${f.name}</span>${f.special ? '<span class="craft-tag">특별</span>' : ''}${owned(f.id) ? ` <small class="craft-meta">(${owned(f.id)}개 있음)</small>` : ''}<br>
        <span class="craft-meta">${whereName(f.where)} · 아늑함 +${f.cozy} · ${costHtml(f.cost)}</span></span>
      <button class="btn primary" data-craft="${f.id}" type="button" ${canAfford(f.cost) ? '' : 'disabled'}>만들기</button>
    </div>`).join('');
  const r = room();
  $('theme-list').innerHTML = ['wall', 'floor'].flatMap(kind => THEMES[kind].map(t => {
    const using = r[kind] === t.id;
    const have = hasTheme(t.id);
    return `<div class="craft-item">
      <span class="craft-ico">${kind === 'wall' ? '🧱' : '🟫'}</span>
      <span><span class="craft-name">${t.name}</span><br><span class="craft-meta">${kind === 'wall' ? '벽지' : '바닥'}${have ? '' : ` · ${costHtml(t.cost)}`}</span></span>
      <button class="btn ${using ? 'ghost' : 'primary'}" data-theme="${kind}:${t.id}" type="button" ${using || (!have && !canAfford(t.cost)) ? 'disabled' : ''}>${using ? '쓰는 중' : have ? '바꾸기' : '열기'}</button>
    </div>`;
  })).join('');
  for (const b of $('craft-list').querySelectorAll('[data-craft]')) {
    b.addEventListener('click', () => {
      const f = furnitureById[b.dataset.craft];
      if (!craft(f.id)) return;
      toastFn(`${f.icon} ${f.name} 완성! '방 꾸미기'에서 놓아 봐.`);
      say(pick([`${f.name} 만들었어? 대단해!`, '우와, 솜씨 좋다!', '얼른 방에 놓아 보자!']));
      renderRoomInfo();
      onChangeFn();
      openCraft();
    });
  }
  for (const b of $('theme-list').querySelectorAll('[data-theme]')) {
    b.addEventListener('click', () => {
      const [kind, id] = b.dataset.theme.split(':');
      if (!unlockTheme(kind, id)) return;
      afterRoomChange(kind === 'wall' ? '벽지 바꾸니까 새 방 같아!' : '바닥 느낌 좋다!');
      openCraft();
    });
  }
  openSheet('craft-sheet');
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
  $('act-feed').addEventListener('click', openFood);
  $('place-room').addEventListener('click', () => setPlace('room'));
  $('place-garden').addEventListener('click', () => setPlace('garden'));
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
  $('btn-decorate').addEventListener('click', () => {
    if (placeNow !== 'room') setPlace('room');
    setEditing(!editing);
    if (editing) {
      say('어디에 뭘 놓을까? 두근두근!');
      document.querySelector('.buddy-room').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  $('room-done').addEventListener('click', () => { setEditing(false); say(pick(['방 예쁘다! 고마워!', '여기서 살고 싶어… 아, 여기 살지!'])); });
  $('btn-craft').addEventListener('click', openCraft);
  $('btn-craft2').addEventListener('click', openCraft);
  $('btn-talk').addEventListener('click', startTalk);
  $('room-talk').addEventListener('click', startTalk);
  initTalkUI();
  for (const id of ['craft-sheet', 'slot-sheet']) {
    $(id).addEventListener('click', (e) => {
      if (e.target.id === id || e.target.closest('.sheet-close')) closeSheet(id);
    });
  }
  $('evolve-ok').addEventListener('click', () => { $('evolve').hidden = true; renderStats(); onChangeFn(); });
}
