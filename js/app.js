// 한숲GO 메인: 지도, 위치 추적, 도감, 친구 탭

import { CONFIG, firebaseEnabled } from './config.js';
import { SPECIES, RARITY, KINDS, speciesById, monsterSVG, josa, habitatText } from './monsters.js';
import { spawnsAround, distanceM, specialEncounter, isNight } from './spawn.js';
import { store, remote, levelFromXp, xpForLevel } from './store.js';
import { startEncounter, initEncounterUI, encounterActive } from './catch.js';
import { loadThree, createViewer } from './stage3d.js';
import { hasBuddy, buddy, buddySpecies, STAGES } from './buddy.js';
import { initBuddyUI, renderBuddy, leaveBuddy, buddyWalked, setBuddyFromDex } from './buddy-ui.js';
import { MATERIALS, materialsAround, gather, stopMaterials, catchGift, gainText } from './room.js';
import { weather, weatherInfo, refreshWeather, onWeather, timeOfDay } from './weather.js';
import { GFX_LEVELS, gfxLevel, setGfxLevel } from './charfx.js';
import { initFriends, inboxHtml, bindInbox, walkCardHtml, walkBanner, onWalk, friendActionsHtml, bindFriendActions } from './friends.js';

const $ = (id) => document.getElementById(id);
const COLORS = ['#3f8fd2', '#e8532b', '#4f9a3a', '#a45ee5', '#e8a317', '#e86f9b'];

let map;
let me = null;               // { lat, lng, acc }
let meMarker = null;
let buddyMarker = null;       // 나를 따라오는 짝꿍
let buddyMarkerFor = '';
let walkPrev = null;          // 짝꿍 산책 거리 계산용
let accCircle = null;
let catchCircle = null;
let gpsWatch = null;
let gpsOk = false;
const spawnMarkers = new Map();
const stopMarkers = new Map();
const matMarkers = new Map();
let followMe = true;

// ---------- 공통 ----------
function toast(text, ms = 2600) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, ms);
}

// 친구 서버에서 온 숫자·색은 믿지 않고 정리해서 씀
const num = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v) * 10) / 10) : 0);
const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c)) ? c : '#888');

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------- 상단 정보 ----------
function renderHud() {
  const s = store.state;
  const lv = levelFromXp(s.xp);
  const base = xpForLevel(lv);
  const next = xpForLevel(lv + 1);
  $('hud-name').textContent = s.name || '트레이너';
  $('hud-avatar').style.background = s.color;
  $('hud-avatar').textContent = (s.name || '?').slice(0, 1);
  $('hud-level').textContent = `Lv.${lv}`;
  $('hud-xpbar').style.width = `${Math.round(((s.xp - base) / (next - base)) * 100)}%`;
  $('hud-balls').textContent = s.balls;
  $('hud-dex').textContent = `${store.speciesCount()}/${SPECIES.length}`;
  $('hud-snacks').textContent = s.snacks;
  const w = weather();
  const info = weatherInfo();
  $('hud-time').textContent = `${isNight() ? info.night : info.icon}${w.temp != null ? ` ${w.temp}°` : ''}`;
  $('hud-time').title = `${isNight() ? '밤' : '낮'} · ${info.name}`;
  $('hud-time').className = 'chip ' + (isNight() ? 'night' : 'day');
  applyMapMood();
  walkBanner();
}

// ---------- 지도 ----------
function playerIcon() {
  return L.divIcon({
    className: 'me-icon',
    html: `<div class="me-dot" style="--c:${store.state.color}"><span></span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function spawnIcon(spawn, near, fresh = false) {
  const sp = speciesById[spawn.speciesId];
  // 몬스터마다 움직이는 박자를 다르게 (같은 자리면 항상 같은 박자)
  const delay = -((spawn.id.length * 37 + spawn.id.charCodeAt(spawn.id.length - 1) * 13) % 24) / 10;
  return L.divIcon({
    className: 'spawn-icon',
    html: `<div class="spawn ${near ? 'near' : ''} ${fresh ? 'fresh' : ''} r-${sp.rarity}" style="--d:${delay}s">${fresh ? '<span class="rustle"><i>🍃</i><i>🌿</i><i>🍃</i></span>' : ''}${monsterSVG(sp, { size: 52 })}</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 46],
  });
}

// 지도 색(아침·낮·노을·밤)과 비·눈 효과
function applyMapMood() {
  const panel = $('panel-map');
  const tod = timeOfDay();
  const kind = weather().kind;
  for (const t of ['dawn', 'day', 'dusk', 'night']) panel.classList.toggle(`tod-${t}`, t === tod);
  panel.classList.toggle('wx-gloomy', ['rain', 'storm', 'snow', 'cloudy', 'fog'].includes(kind));
  $('wx-layer').className = `wx-layer ${kind}`;
}

function showWeatherTip() {
  const w = weather();
  const info = weatherInfo();
  const tod = { dawn: '이른 아침', day: '낮', dusk: '노을 지는 저녁', night: '밤' }[timeOfDay()];
  toast(`${info.icon} 지금 한숲시티: ${info.name}${w.temp != null ? ` ${w.temp}°C` : ''} · ${tod}\n${info.tip}${isNight() ? ' 밤에는 밤에만 나오는 친구들과 ✨별가루가 있어요.' : ''}`, 5200);
}

function matIcon(spot, near) {
  return L.divIcon({
    className: 'mat-icon',
    html: `<div class="mat-spot ${near ? 'near' : ''} ${MATERIALS[spot.kind].seed ? 'seed' : MATERIALS[spot.kind].limited ? 'limited' : ''}" title="${MATERIALS[spot.kind].name}">${MATERIALS[spot.kind].icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function stopIcon(stop, ready) {
  return L.divIcon({
    className: 'stop-icon',
    html: `<div class="stop ${stop.special ? 'special' : ''} ${ready ? 'ready' : 'used'}">
             <div class="stop-cube">${stop.special ? '★' : ''}</div>
             <div class="stop-label">${esc(stop.name)}</div></div>`,
    iconSize: [120, 64],
    iconAnchor: [60, 30],
  });
}

function initMap() {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    minZoom: 13,
    maxZoom: 19,
  }).setView([CONFIG.home.lat, CONFIG.home.lng], CONFIG.home.zoom);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 기여자',
  }).addTo(map);

  map.on('dragstart', () => { followMe = false; $('btn-center').hidden = false; });
  map.on('click', (e) => {
    if (store.state.demo) walkTo(e.latlng.lat, e.latlng.lng);
  });
  map.on('contextmenu', (e) => {
    const txt = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    showCoord(txt);
  });

  for (const z of CONFIG.zones || []) {
    L.circle([z.lat, z.lng], { radius: z.radius, className: `zone-${z.type}`, interactive: false }).addTo(map);
    L.marker([z.lat, z.lng], {
      interactive: false,
      zIndexOffset: -200,
      icon: L.divIcon({
        className: 'zone-icon',
        html: `<div class="zone-label ${z.type}">${z.type === 'water' ? '🎣 낚시터' : '🦋 곤충 많은 곳'}</div>`,
        iconSize: [110, 24],
        iconAnchor: [55, -18],
      }),
    }).addTo(map);
  }

  for (const stop of CONFIG.stops) {
    const m = L.marker([stop.lat, stop.lng], { icon: stopIcon(stop, stopReady(stop)), zIndexOffset: 500 })
      .addTo(map)
      .on('click', () => useStop(stop));
    stopMarkers.set(stop.id, m);
  }
}

function showCoord(txt) {
  $('coord-text').textContent = txt;
  $('coord-sheet').hidden = false;
}

function updateMe(lat, lng, acc = 10) {
  me = { lat, lng, acc };
  if (!meMarker) {
    meMarker = L.marker([lat, lng], { icon: playerIcon(), zIndexOffset: 1000, interactive: false }).addTo(map);
    accCircle = L.circle([lat, lng], { radius: acc, className: 'acc-circle', interactive: false }).addTo(map);
    catchCircle = L.circle([lat, lng], { radius: CONFIG.catchRadius, className: 'catch-circle', interactive: false }).addTo(map);
  } else {
    meMarker.setLatLng([lat, lng]);
    accCircle.setLatLng([lat, lng]).setRadius(Math.min(acc, 200));
    catchCircle.setLatLng([lat, lng]);
  }
  if (followMe) map.panTo([lat, lng], { animate: true });
  countWalk(lat, lng, acc);
  updateBuddyMarker();
  refreshWorld();
}

// 걸은 거리: 작은 흔들림은 모아서 세고, 80m 넘게 튄 위치는 버림
function countWalk(lat, lng, acc) {
  if (acc > 60) return;
  if (!walkPrev) { walkPrev = { lat, lng }; return; }
  const d = distanceM(walkPrev, { lat, lng });
  // 가만히 있어도 GPS는 몇 m씩 흔들리니, 정확도의 절반(최소 8m) 넘게 움직였을 때만 셈
  if (d < Math.max(8, acc / 2)) return;
  walkPrev = { lat, lng };
  if (d > 80) return;
  if (store.state.demo) {
    if (!countWalk.told && hasBuddy()) { countWalk.told = true; toast('연습 모드에서는 짝꿍 산책 거리가 쌓이지 않아요. 진짜로 걸어야 자라요!', 3500); }
    return;
  }
  buddyWalked(d);
  onWalk(d); // 친구와 같이 걷는 중이면 보너스
}

function updateBuddyMarker() {
  if (!me || !hasBuddy()) {
    if (buddyMarker) { buddyMarker.remove(); buddyMarker = null; buddyMarkerFor = ''; }
    return;
  }
  const sp = buddySpecies();
  const pos = [me.lat, me.lng];
  if (!buddyMarker) {
    buddyMarker = L.marker(pos, { zIndexOffset: 900, interactive: false }).addTo(map);
  } else {
    buddyMarker.setLatLng(pos);
  }
  if (buddyMarkerFor !== sp.id) {
    buddyMarkerFor = sp.id;
    buddyMarker.setIcon(L.divIcon({
      className: 'me-buddy',
      html: monsterSVG(sp, { size: 34 }),
      iconSize: [34, 34],
      iconAnchor: [-4, 30], // 내 위치 점의 오른쪽 옆
    }));
  }
}

function refreshWorld() {
  if (!me || encounterActive()) return;
  const now = Date.now();
  const list = spawnsAround(me, CONFIG.visibleRadius, now)
    .filter(s => !store.state.caughtSpawns[s.id]);
  const keep = new Set();
  for (const s of list) {
    keep.add(s.id);
    const near = distanceM(me, s) <= CONFIG.catchRadius;
    const existing = spawnMarkers.get(s.id);
    if (existing) {
      if (existing._near !== near) { existing.setIcon(spawnIcon(s, near)); existing._near = near; }
      continue;
    }
    const m = L.marker([s.lat, s.lng], { icon: spawnIcon(s, near, seenFirstSpawns) }).addTo(map)
      .on('click', () => tapSpawn(s));
    m._near = near;
    spawnMarkers.set(s.id, m);
  }
  for (const [id, m] of spawnMarkers) {
    if (!keep.has(id)) { map.removeLayer(m); spawnMarkers.delete(id); }
  }
  if (list.length) seenFirstSpawns = true;
  for (const stop of CONFIG.stops) {
    const m = stopMarkers.get(stop.id);
    const ready = stopReady(stop);
    if (m._ready !== ready) { m.setIcon(stopIcon(stop, ready)); m._ready = ready; }
  }
  refreshMaterials();
  renderNearby(list);
}

// 동네에 떨어진 재료
function refreshMaterials() {
  const keep = new Set();
  for (const m of materialsAround(me)) {
    keep.add(m.id);
    const near = distanceM(me, m) <= CONFIG.catchRadius;
    const existing = matMarkers.get(m.id);
    if (existing) {
      if (existing._near !== near) { existing.setIcon(matIcon(m, near)); existing._near = near; }
      continue;
    }
    const mk = L.marker([m.lat, m.lng], { icon: matIcon(m, near), zIndexOffset: 300 }).addTo(map)
      .on('click', () => tapMaterial(m));
    mk._near = near;
    matMarkers.set(m.id, mk);
  }
  for (const [id, mk] of matMarkers) {
    if (!keep.has(id)) { map.removeLayer(mk); matMarkers.delete(id); }
  }
}

function tapMaterial(m) {
  if (!me) return;
  const d = distanceM(me, m);
  const info = MATERIALS[m.kind];
  if (d > CONFIG.catchRadius) {
    toast(`${info.icon} ${info.name}까지 ${fmtDist(d)} 남았어요.`);
    return;
  }
  if (!gather(m)) return;
  toast(`${gainText({ [m.kind]: m.amount })}를 주웠어요!`);
  const mk = matMarkers.get(m.id);
  if (mk) { map.removeLayer(mk); matMarkers.delete(m.id); }
}

let seenFirstSpawns = false; // 처음 지도 열 때는 한꺼번에 튀어나오지 않게

function renderNearby(list) {
  const sorted = list.map(s => ({ s, d: distanceM(me, s) })).sort((a, b) => a.d - b.d).slice(0, 8);
  $('nearby').innerHTML = sorted.length
    ? sorted.map(({ s, d }) => {
      const sp = speciesById[s.speciesId];
      const known = store.state.caught[sp.id];
      return `<button class="near-item ${d <= CONFIG.catchRadius ? 'in' : ''}" data-id="${s.id}" type="button">
        ${monsterSVG(sp, { size: 40, silhouette: !known })}<span>${fmtDist(d)}</span></button>`;
    }).join('')
    : '<p class="near-empty">근처에 아무도 없어요. 조금 걸어 보세요!</p>';
  for (const btn of $('nearby').querySelectorAll('.near-item')) {
    btn.addEventListener('click', () => {
      const s = list.find(x => x.id === btn.dataset.id);
      if (s) { map.panTo([s.lat, s.lng]); followMe = false; $('btn-center').hidden = false; tapSpawn(s); }
    });
  }
}

function tapSpawn(spawn) {
  if (!me) return;
  const d = distanceM(me, spawn);
  const sp = speciesById[spawn.speciesId];
  if (d > CONFIG.catchRadius) {
    toast(`${store.state.caught[sp.id] ? sp.name : '???'}까지 ${fmtDist(d)} 남았어요. 더 가까이 가 보세요!`);
    return;
  }
  openEncounter(spawn);
}

function openEncounter(spawn) {
  startEncounter(spawn, (result, sp) => {
    if (result.caught) {
      const s = speciesById[sp.speciesId];
      const gift = catchGift(s.kind);
      const giftText = gift ? ` · 선물로 ${MATERIALS[gift].icon} ${MATERIALS[gift].name}!` : '';
      toast((result.isNew ? `새로운 ${KINDS[s.kind].label} ${s.name} 도감 등록!` : `${s.name} +${result.gained} XP`) + giftText, 3200);
      const m = spawnMarkers.get(sp.id);
      if (m) { map.removeLayer(m); spawnMarkers.delete(sp.id); }
    } else if (result.fled) {
      const m = spawnMarkers.get(sp.id);
      if (m) { map.removeLayer(m); spawnMarkers.delete(sp.id); }
    }
    renderHud();
    refreshWorld();
  });
}

// ---------- 거점 ----------
function stopReady(stop) {
  const t = store.state.stopCooldowns[stop.id] || 0;
  return Date.now() - t > CONFIG.stopCooldownMinutes * 60000;
}

function useStop(stop) {
  if (!me) return;
  const d = distanceM(me, stop);
  if (d > CONFIG.stopRadius) {
    toast(`${stop.name}까지 ${fmtDist(d)} 남았어요.`);
    return;
  }
  if (!stopReady(stop)) {
    const left = CONFIG.stopCooldownMinutes * 60000 - (Date.now() - store.state.stopCooldowns[stop.id]);
    toast(`${stop.name}: ${Math.ceil(left / 60000)}분 뒤에 다시 받을 수 있어요.`);
    return;
  }
  const n = stop.special ? CONFIG.specialStopBalls : CONFIG.stopBalls;
  const k = stop.special ? CONFIG.specialStopSnacks : CONFIG.stopSnacks;
  store.state.balls += n;
  store.state.snacks += k;
  store.state.stopCooldowns[stop.id] = Date.now();
  store.state.xp += 50;
  const mats = stopMaterials(stop.special);
  store.save();
  renderHud();
  refreshWorld();
  if (stop.special && store.state.specialDay !== todayKey()) {
    store.state.specialDay = todayKey();
    store.save();
    toast(`★ ${stop.name} 특별 거점! 숲볼 ${n}개, 간식 ${k}개, ${gainText(mats)} + 특별한 몬스터가 나타났어요!`, 4000);
    // 안내를 읽을 시간을 준 뒤 특별 몬스터 등장 (안내가 몬스터를 가리지 않게)
    setTimeout(() => { $('toast').hidden = true; if (!encounterActive()) openEncounter(specialEncounter(store.state.id, todayKey())); }, 2600);
  } else {
    toast(`${stop.name}에서 숲볼 ${n}개, 간식 ${k}개, ${gainText(mats)}를 받았어요!`, 3200);
  }
}

// ---------- 위치 ----------
function startGps() {
  if (store.state.demo) return;
  if (!('geolocation' in navigator)) {
    gpsFailed('이 브라우저는 위치 기능을 지원하지 않아요.');
    return;
  }
  $('gps-status').textContent = '위치 찾는 중...';
  gpsWatch = navigator.geolocation.watchPosition(
    (p) => {
      gpsOk = true;
      $('gps-status').textContent = '';
      updateMe(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
    },
    (err) => {
      if (!gpsOk) {
        gpsFailed(err.code === 1
          ? '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치를 허용하거나 산책 연습 모드를 켜 주세요.'
          : '위치를 찾지 못했어요. 밖으로 나가거나 산책 연습 모드를 켜 주세요.');
      }
    },
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
  );
}

function stopGps() {
  if (gpsWatch !== null) navigator.geolocation.clearWatch(gpsWatch);
  gpsWatch = null;
}

function gpsFailed(msg) {
  $('gps-status').textContent = msg;
  $('gps-status').classList.add('warn');
}

// 연습 모드: 지도를 누르면 그 방향으로 걸어감
let walkTimer = null;
function walkTo(lat, lng) {
  clearInterval(walkTimer);
  if (!me) { updateMe(lat, lng); return; }
  const speed = 6; // m/틱 (빠르게 걷기)
  walkTimer = setInterval(() => {
    const d = distanceM(me, { lat, lng });
    if (d <= speed) { clearInterval(walkTimer); updateMe(lat, lng); return; }
    const f = speed / d;
    updateMe(me.lat + (lat - me.lat) * f, me.lng + (lng - me.lng) * f);
  }, 120);
}

function setDemo(on) {
  store.state.demo = on;
  store.save();
  document.body.classList.toggle('demo', on);
  $('set-demo').checked = on;
  if (on) {
    stopGps();
    $('gps-status').textContent = '';
    $('gps-status').classList.remove('warn');
    followMe = true;
    if (!me) updateMe(CONFIG.home.lat, CONFIG.home.lng);
    toast('산책 연습 모드: 지도를 누르면 그쪽으로 걸어가요.');
  } else {
    clearInterval(walkTimer);
    startGps();
  }
}

// ---------- 탭 ----------
function showTab(name) {
  for (const b of document.querySelectorAll('.tab-btn')) {
    b.classList.toggle('active', b.dataset.tab === name);
    b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false');
  }
  for (const p of document.querySelectorAll('.panel')) p.hidden = p.id !== `panel-${name}`;
  if (document.body.dataset.tab === 'buddy' && name !== 'buddy') leaveBuddy();
  document.body.dataset.tab = name;
  if (name === 'map') setTimeout(() => map.invalidateSize(), 50);
  if (name === 'dex') renderDex();
  if (name === 'buddy') renderBuddy();
  if (name === 'family') renderFamily();
  if (name === 'settings') renderSettings();
}

// ---------- 도감 ----------
let dexFilter = 'all';

function dexGrid(caughtMap, onClick, filter = 'all') {
  return SPECIES.filter(sp => filter === 'all' || sp.kind === filter).map(sp => {
    const c = caughtMap[sp.id];
    const count = num(typeof c === 'number' ? c : c?.count);
    return `<button class="dex-card ${count ? 'got' : ''}" data-id="${sp.id}" type="button" ${onClick ? '' : 'tabindex="-1"'}>
      <span class="dex-no">No.${String(sp.no).padStart(3, '0')}</span>
      ${monsterSVG(sp, { size: 84, silhouette: !count })}
      <span class="dex-name">${count ? sp.name : '???'}</span>
      ${count ? `<span class="dex-count">×${count}</span>` : ''}
      <span class="dex-rar" style="--rarity:${RARITY[sp.rarity].color}">${RARITY[sp.rarity].label}</span>
    </button>`;
  }).join('');
}

function kindCount(kind) {
  const all = SPECIES.filter(sp => kind === 'all' || sp.kind === kind);
  return { got: all.filter(sp => store.state.caught[sp.id]).length, total: all.length };
}

function renderDex() {
  const s = store.state;
  $('dex-summary').textContent = `${store.speciesCount()}/${SPECIES.length}종 발견 · 총 ${store.totalCaught()}마리`;
  $('dex-progress').style.width = `${(store.speciesCount() / SPECIES.length) * 100}%`;
  const tabs = [['all', '전체'], ...Object.entries(KINDS).map(([k, v]) => [k, v.label])];
  $('dex-tabs').innerHTML = tabs.map(([k, label]) => {
    const c = kindCount(k);
    return `<button type="button" role="tab" class="dex-tab ${dexFilter === k ? 'on' : ''}" data-k="${k}" aria-selected="${dexFilter === k}">
      ${label} <small>${c.got}/${c.total}</small></button>`;
  }).join('');
  for (const t of $('dex-tabs').querySelectorAll('.dex-tab')) {
    t.addEventListener('click', () => { dexFilter = t.dataset.k; renderDex(); });
  }
  $('dex-grid').innerHTML = dexGrid(s.caught, true, dexFilter);
  for (const btn of $('dex-grid').querySelectorAll('.dex-card')) {
    btn.addEventListener('click', () => showSpecies(btn.dataset.id));
  }
}

let viewer = null;
function closeViewer() {
  viewer?.dispose();
  viewer = null;
}

function showSpecies(id) {
  closeViewer();
  const sp = speciesById[id];
  const c = store.state.caught[id];
  const kind = KINDS[sp.kind];
  const rar = `<span style="--rarity:${RARITY[sp.rarity].color}" class="dex-rar">${RARITY[sp.rarity].label}</span>`;
  $('sp-body').innerHTML = c
    ? `<div id="sp-3d" class="sp-3d">${monsterSVG(sp, { size: 160 })}</div>
       <p id="sp-3d-hint" class="sp-3d-hint" hidden>손가락으로 돌려 보세요</p>
       <h3>No.${String(sp.no).padStart(3, '0')} ${sp.name}</h3>
       <p class="sp-tags">${rar} ${kind.label} · ${sp.type}</p>
       <p>${sp.desc}</p>
       <dl class="sp-facts"><div><dt>${sp.kind === 'animal' ? '만난 횟수' : '잡은 수'}</dt><dd>${c.count}번</dd></div>
       <div><dt>가장 큰 크기</dt><dd>${c.bestSize}cm</dd></div>
       <div><dt>사는 곳</dt><dd>${habitatText(sp)}</dd></div>
       <div><dt>잡는 방법</dt><dd>${kind.how}</dd></div>
       <div><dt>처음 만난 날</dt><dd>${new Date(c.firstAt).toLocaleDateString('ko-KR')}</dd></div></dl>
       ${buddy()?.speciesId === id
    ? '<p class="muted">💛 지금 내 짝꿍이에요</p>'
    : '<button id="sp-buddy" class="btn primary" type="button">💛 짝꿍으로 정하기</button>'}`
    : `${monsterSVG(sp, { size: 160, silhouette: true })}
       <h3>No.${String(sp.no).padStart(3, '0')} ???</h3>
       <p class="sp-tags">${rar} ${kind.label}</p>
       <p>아직 만나지 못했어요.</p>
       <p class="hint">힌트: ${habitatText(sp)}</p>
       <p class="muted">잡는 방법: ${kind.how}</p>`;
  $('sp-sheet').hidden = false;
  $('sp-buddy')?.addEventListener('click', () => {
    $('sp-sheet').hidden = true;
    closeViewer();
    setBuddyFromDex(id);
    showTab('buddy');
  });
  const box = $('sp-3d');
  if (box) {
    createViewer(box, sp).then(v => {
      if (!v) return;
      if ($('sp-sheet').hidden || $('sp-3d') !== box) { v.dispose(); return; }
      box.querySelector('svg')?.remove();
      $('sp-3d-hint').hidden = false;
      viewer = v;
    });
  }
}

// ---------- 친구 ----------
function renderFamily() {
  const s = store.state;
  const box = $('family-body');
  if (!firebaseEnabled()) {
    box.innerHTML = `<div class="notice">
      <h3>친구 공유가 아직 꺼져 있어요</h3>
      <p>친구들과 도감을 함께 보려면 무료 Firebase 프로젝트를 한 번만 연결하면 됩니다.
      설정 방법은 저장소의 <b>README.md</b>에 있어요. 연결 전에는 내 기록만 이 휴대폰에 저장됩니다.</p></div>
      ${familyList([{ uid: 'me', name: s.name || '나', color: s.color, level: levelFromXp(s.xp), species: store.speciesCount(), total: store.totalCaught(),
        caught: Object.fromEntries(Object.entries(s.caught).map(([k, v]) => [k, v.count])) }], 'me')}`;
    bindFamily([{ uid: 'me', name: s.name || '나', caught: Object.fromEntries(Object.entries(s.caught).map(([k, v]) => [k, v.count])) }]);
    return;
  }
  if (!s.group) {
    box.innerHTML = `<div class="notice"><h3>친구 코드를 정해 주세요</h3>
      <p>설정 탭에서 친구 코드를 입력하면 같은 코드를 쓰는 사람끼리 도감과 순위를 함께 볼 수 있어요.</p></div>`;
    return;
  }
  if (remote.error) {
    box.innerHTML = `<div class="notice warn"><p>${esc(remote.error)}</p></div>`;
    return;
  }
  const players = [...remote.players].sort((a, b) => (num(b.species) - num(a.species)) || (num(b.xp) - num(a.xp)));
  const feed = remote.feed.map(f => {
    const sp = speciesById[f.speciesId];
    if (!sp) return '';
    const when = new Date(f.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `<li><span class="mini-av" style="background:${safeColor(f.color)}">${esc((f.name || '?').slice(0, 1))}</span>
      <span>${f.kind === 'visit'
    ? `<b>${esc(f.name)}</b>님 짝꿍이 <b>${esc(f.toName || '친구')}</b>네 집에 놀러 갔어요 🏡`
    : f.kind === 'walk'
      ? `<b>${esc(f.name)}</b>님이 <b>${esc(f.withName || '친구')}</b>님과 같이 1km를 걸었어요 🎀`
      : `<b>${esc(f.name)}</b>님이 ${sp.kind === 'animal' ? josa(sp.name, '과', '와') : josa(sp.name, '을', '를')} ${KINDS[sp.kind].feed}${f.isNew ? ' <em>NEW</em>' : ''}`}</span><time>${when}</time></li>`;
  }).join('');
  box.innerHTML = `${walkCardHtml()}${inboxHtml()}
    <p class="group-code">친구 코드 <b>${esc(s.group)}</b> · ${players.length}명 참여 중</p>
    ${players.length ? familyList(players, remote.uid) : '<p class="muted">아직 기록이 없어요. 도감 친구를 만나면 여기에 나타나요.</p>'}
    <h3 class="sub">최근 소식</h3>
    <ul class="feed">${feed || '<li class="muted">아직 소식이 없어요.</li>'}</ul>`;
  bindInbox(box, renderFamily);
  bindFamily(players);
}

function buddyBadge(b) {
  const sp = b && speciesById[b.speciesId];
  if (!sp) return '';
  const stage = STAGES[b.stage]?.name || STAGES[0].name;
  const km = num(b.walkedKm);
  return `<br><span class="rank-buddy">${monsterSVG(sp, { size: 26 })}${esc(b.nick || sp.name)} · ${stage}${km ? ` · ${km}km` : ''}</span>`;
}

function familyList(players, myUid) {
  return `<ol class="rank">${players.map((p, i) => `
    <li><button class="rank-row" data-uid="${esc(p.uid)}" type="button">
      <span class="rank-no">${i + 1}</span>
      <span class="mini-av" style="background:${safeColor(p.color)}">${esc((p.name || '?').slice(0, 1))}</span>
      <span class="rank-name">${esc(p.name || '이름 없음')}${p.uid === myUid ? ' <small>(나)</small>' : ''}${buddyBadge(p.buddy)}</span>
      <span class="rank-stat"><b>${num(p.species)}</b>/${SPECIES.length}종 · Lv.${num(p.level) || 1}${num(p.eng) ? ` · 📘${num(p.eng)}` : ''}</span>
    </button></li>`).join('')}</ol>`;
}

function bindFamily(players) {
  for (const btn of $('family-body').querySelectorAll('.rank-row')) {
    btn.addEventListener('click', () => {
      const p = players.find(x => x.uid === btn.dataset.uid);
      if (!p) return;
      closeViewer();
      const bsp = p.buddy && speciesById[p.buddy.speciesId];
      const buddyHtml = bsp ? `<div class="friend-buddy">${monsterSVG(bsp, { size: 72 })}
          <div><b>${esc(p.buddy.nick || bsp.name)}</b><br><span class="muted">${STAGES[p.buddy.stage]?.name || STAGES[0].name} ${bsp.name}${num(p.buddy.walkedKm) ? ` · 함께 ${num(p.buddy.walkedKm)}km 걸음` : ''}</span></div></div>` : '';
      $('sp-body').innerHTML = `<h3>${esc(p.name || '이름 없음')}의 도감</h3>
        ${buddyHtml}
        ${friendActionsHtml(p)}
        <p class="muted">${Object.keys(p.caught || {}).length}/${SPECIES.length}종 발견</p>
        <div class="dex-grid small">${dexGrid(p.caught || {}, false)}</div>`;
      bindFriendActions($('sp-body'), p);
      $('sp-sheet').hidden = false;
    });
  }
}

// ---------- 설정 ----------
function renderSettings() {
  const s = store.state;
  $('set-name').value = s.name;
  $('set-group').value = s.group;
  $('set-demo').checked = s.demo;
  $('set-gfx').innerHTML = Object.entries(GFX_LEVELS).map(([k, v]) => `<option value="${k}" ${gfxLevel() === k ? 'selected' : ''}>${v}</option>`).join('');
  $('set-share').textContent = firebaseEnabled()
    ? (remote.ready ? '친구 공유 연결됨' : '친구 공유 연결 중...')
    : '친구 공유 꺼짐 (README 참고)';
  renderColors('set-colors');
}

function renderColors(id) {
  $(id).innerHTML = COLORS.map(c =>
    `<button type="button" class="color-dot ${store.state.color === c ? 'on' : ''}" style="background:${c}" data-c="${c}" aria-label="색 ${c}"></button>`).join('');
  for (const b of $(id).querySelectorAll('.color-dot')) {
    b.addEventListener('click', () => {
      store.state.color = b.dataset.c;
      store.save();
      renderColors(id);
      if (meMarker) meMarker.setIcon(playerIcon());
      renderHud();
    });
  }
}

function normalizeGroup(v) {
  return v.trim().toUpperCase().replace(/[^A-Z0-9가-힣-]/g, '').slice(0, 20);
}

function bindSettings() {
  $('set-gfx').addEventListener('change', (e) => { setGfxLevel(e.target.value); toast(`3D 화질: ${GFX_LEVELS[e.target.value]}`); });
  $('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('set-name').value.trim().slice(0, 12);
    const group = normalizeGroup($('set-group').value);
    if (!name) { toast('닉네임을 입력해 주세요.'); return; }
    const groupChanged = group !== store.state.group;
    store.state.name = name;
    store.state.group = group;
    store.save();
    if (groupChanged) remote.watchGroup(group);
    renderHud();
    renderSettings();
    toast('저장했어요.');
  });
  $('set-demo').addEventListener('change', (e) => setDemo(e.target.checked));
  $('set-reset').addEventListener('click', () => { $('reset-confirm').hidden = false; });
  $('reset-no').addEventListener('click', () => { $('reset-confirm').hidden = true; });
  $('reset-yes').addEventListener('click', () => {
    try { localStorage.removeItem('hansupgo.v1'); } catch { /* 무시 */ }
    location.reload();
  });
}

// ---------- 처음 시작 ----------
function bindOnboarding() {
  document.querySelector('.ob-hero').innerHTML =
    ['dotoriram', 'sumbbong', 'jongsorinyang'].map((id, i) => monsterSVG(id, { size: i === 1 ? 110 : 84 })).join('');
  renderColors('ob-colors');
  $('onboard-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('ob-name').value.trim().slice(0, 12);
    if (!name) { $('ob-name').focus(); return; }
    store.state.name = name;
    store.state.group = normalizeGroup($('ob-group').value);
    store.save();
    $('onboard').hidden = true;
    remote.watchGroup(store.state.group);
    renderHud();
    begin();
  });
  $('ob-demo').addEventListener('click', () => {
    const name = $('ob-name').value.trim().slice(0, 12) || '연습생';
    store.state.name = name;
    store.state.group = normalizeGroup($('ob-group').value);
    store.save();
    $('onboard').hidden = true;
    remote.watchGroup(store.state.group);
    renderHud();
    setDemo(true);
  });
}

function begin() {
  if (store.state.demo) setDemo(true);
  else startGps();
}

// ---------- 시작 ----------
async function main() {
  store.load();
  document.body.classList.toggle('demo', store.state.demo);
  initMap();
  initEncounterUI();
  initBuddyUI({ toast, onChange: () => { updateBuddyMarker(); renderHud(); } });
  initFriends({ toast, onChange: () => { renderHud(); if (document.body.dataset.tab === 'family') renderFamily(); } });
  bindSettings();
  bindOnboarding();
  renderHud();

  for (const b of document.querySelectorAll('.tab-btn')) b.addEventListener('click', () => showTab(b.dataset.tab));
  $('btn-center').addEventListener('click', () => {
    followMe = true;
    $('btn-center').hidden = true;
    if (me) map.setView([me.lat, me.lng], Math.max(map.getZoom(), 17));
  });
  $('btn-home').addEventListener('click', () => {
    followMe = false;
    $('btn-center').hidden = false;
    map.setView([CONFIG.home.lat, CONFIG.home.lng], CONFIG.home.zoom);
  });
  for (const id of ['sp-sheet', 'coord-sheet']) {
    $(id).addEventListener('click', (e) => {
      if (e.target.id === id || e.target.closest('.sheet-close')) {
        $(id).hidden = true;
        if (id === 'sp-sheet') closeViewer();
      }
    });
  }
  $('coord-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('coord-text').textContent); toast('좌표를 복사했어요.'); }
    catch { toast('복사하지 못했어요. 좌표를 길게 눌러 복사해 주세요.'); }
  });

  store.onChange(renderHud);
  remote.onChange(() => { if (document.body.dataset.tab === 'family') renderFamily(); });
  setInterval(() => { renderHud(); refreshWorld(); }, 15000);
  $('hud-time').addEventListener('click', showWeatherTip);
  // 날씨가 바뀌면 나오는 친구와 재료도 바뀜
  let lastKind = weather().kind;
  onWeather((w) => {
    renderHud();
    if (w.kind !== lastKind) {
      lastKind = w.kind;
      for (const m of spawnMarkers.values()) map.removeLayer(m);
      spawnMarkers.clear();
      for (const m of matMarkers.values()) map.removeLayer(m);
      matMarkers.clear();
      refreshWorld();
    }
  });
  refreshWeather();
  setInterval(() => refreshWeather(), 20 * 60000);

  showTab('map');
  // 3D 엔진은 미리 받아 둠 (잡기 화면을 빨리 열기 위해)
  setTimeout(() => { loadThree(); }, 1500);
  if (!store.state.name) {
    $('onboard').hidden = false;
  } else {
    begin();
  }
  if (await remote.init()) {
    remote.watchGroup(store.state.group);
    remote.schedulePush(store.state);
    if (document.body.dataset.tab === 'settings') renderSettings();
  }
}

main();
