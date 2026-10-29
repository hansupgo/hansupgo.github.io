// 3D 효과: 작은 입자(하트, 반짝이, 물방울, 나뭇잎, 불씨...), 날아오는 밥, 장난감 공, 빛 번짐, 진화 연출
// 모두 가벼운 스프라이트·기본 도형으로 만들어 폰에서도 부드럽게 돌아가게 했습니다.

// ---------- 입자 그림 (캔버스로 한 번만 그림) ----------

const SHAPES = {
  heart: (x, s) => { x.fillStyle = '#ff6b8b'; x.beginPath(); x.moveTo(s / 2, s * 0.85); x.bezierCurveTo(s * 0.05, s * 0.5, s * 0.12, s * 0.12, s / 2, s * 0.32); x.bezierCurveTo(s * 0.88, s * 0.12, s * 0.95, s * 0.5, s / 2, s * 0.85); x.fill(); },
  spark: (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,240,170,1)'); g.addColorStop(0.3, 'rgba(255,205,70,.85)'); g.addColorStop(1, 'rgba(255,190,40,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); x.fillStyle = '#ffd23f'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const r = i % 2 ? s * 0.12 : s * 0.45; x.lineTo(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r); } x.fill(); },
  star: (x, s) => { x.fillStyle = '#ffd23f'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2; const r = i % 2 ? s * 0.2 : s * 0.46; x.lineTo(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r); } x.fill(); },
  bubble: (x, s) => { x.strokeStyle = 'rgba(160,215,255,.95)'; x.lineWidth = s * 0.08; x.beginPath(); x.arc(s / 2, s / 2, s * 0.38, 0, Math.PI * 2); x.stroke(); x.fillStyle = 'rgba(200,235,255,.35)'; x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(s * 0.38, s * 0.36, s * 0.08, 0, Math.PI * 2); x.fill(); },
  leaf: (x, s) => { x.fillStyle = '#7cc46a'; x.beginPath(); x.ellipse(s / 2, s / 2, s * 0.42, s * 0.2, -0.6, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#4f9a3a'; x.lineWidth = s * 0.05; x.beginPath(); x.moveTo(s * 0.2, s * 0.75); x.lineTo(s * 0.8, s * 0.25); x.stroke(); },
  ember: (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,230,120,1)'); g.addColorStop(0.3, 'rgba(255,130,40,1)'); g.addColorStop(0.6, 'rgba(240,80,30,.7)'); g.addColorStop(1, 'rgba(230,60,20,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); },
  snow: (x, s) => { x.strokeStyle = '#e8f6ff'; x.lineWidth = s * 0.08; x.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; x.beginPath(); x.moveTo(s / 2 + Math.cos(a) * s * 0.4, s / 2 + Math.sin(a) * s * 0.4); x.lineTo(s / 2 - Math.cos(a) * s * 0.4, s / 2 - Math.sin(a) * s * 0.4); x.stroke(); } },
  crumb: (x, s) => { x.fillStyle = '#c98a4b'; x.beginPath(); x.arc(s / 2, s / 2, s * 0.3, 0, Math.PI * 2); x.fill(); },
  note: (x, s) => { x.fillStyle = '#7b6cf6'; x.beginPath(); x.ellipse(s * 0.38, s * 0.72, s * 0.17, s * 0.13, -0.4, 0, Math.PI * 2); x.fill(); x.fillRect(s * 0.5, s * 0.15, s * 0.07, s * 0.58); x.fillRect(s * 0.5, s * 0.15, s * 0.28, s * 0.08); },
  dust: (x, s) => { x.fillStyle = 'rgba(210,195,170,.8)'; x.beginPath(); x.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); x.fill(); },
  glow: (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); },
};

const texCache = new WeakMap();
function tex(THREE, kind) {
  let m = texCache.get(THREE);
  if (!m) { m = new Map(); texCache.set(THREE, m); }
  if (!m.has(kind)) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    SHAPES[kind](c.getContext('2d'), 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    m.set(kind, t);
  }
  return m.get(kind);
}

const GLOWY = new Set(['glow']); // 나머지는 밝은 배경에서도 색이 보이게 보통 섞기

// ---------- 입자 ----------

export function createParticles(THREE, parent, max = 90) {
  const pool = [];
  const live = [];
  const mats = new Map();
  const matFor = (kind) => {
    if (!mats.has(kind)) {
      mats.set(kind, new THREE.SpriteMaterial({
        map: tex(THREE, kind), transparent: true, depthWrite: false,
        blending: GLOWY.has(kind) ? THREE.AdditiveBlending : THREE.NormalBlending,
      }));
    }
    return mats.get(kind);
  };
  /**
   * kind: 그림, pos: 시작 위치, o: { vel, spread, gravity, life, size, grow, spin, count, drift }
   */
  function spawn(kind, pos, o = {}) {
    const n = o.count ?? 1;
    for (let i = 0; i < n; i++) {
      if (live.length >= max) return;
      const sp = pool.pop() || new THREE.Sprite(matFor(kind));
      sp.material = matFor(kind);
      const spr = o.spread ?? 0.1;
      sp.position.set(pos.x + (Math.random() - 0.5) * spr, pos.y + (Math.random() - 0.5) * spr * 0.6, pos.z + (Math.random() - 0.5) * spr);
      const v = o.vel || { x: 0, y: 0.4, z: 0 };
      const jit = o.jitter ?? 0.25;
      sp.userData = {
        vx: v.x + (Math.random() - 0.5) * jit, vy: v.y + Math.random() * jit * 0.6, vz: v.z + (Math.random() - 0.5) * jit,
        g: o.gravity ?? 0, life: (o.life ?? 1.2) * (0.8 + Math.random() * 0.4), age: 0,
        size: (o.size ?? 0.12) * (0.75 + Math.random() * 0.5), grow: o.grow ?? 0, spin: (o.spin ?? 0) * (Math.random() - 0.5),
        drift: o.drift ?? 0, seed: Math.random() * 10,
      };
      sp.material.rotation = 0;
      sp.scale.setScalar(sp.userData.size);
      sp.renderOrder = 10;
      parent.add(sp);
      live.push(sp);
    }
  }
  function update(dt) {
    for (let i = live.length - 1; i >= 0; i--) {
      const sp = live[i];
      const u = sp.userData;
      u.age += dt;
      if (u.age >= u.life) { parent.remove(sp); live.splice(i, 1); pool.push(sp); continue; }
      u.vy -= u.g * dt;
      sp.position.x += (u.vx + Math.sin(u.age * 3 + u.seed) * u.drift) * dt;
      sp.position.y += u.vy * dt;
      sp.position.z += u.vz * dt;
      const k = u.age / u.life;
      const fade = k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1;
      sp.scale.setScalar(Math.max(0.001, u.size * (1 + u.grow * k) * (0.6 + 0.4 * fade)));
      sp.material.opacity = 1; // 공유 재질이라 투명도는 크기로 대신
    }
  }
  function clear() { for (const sp of live) parent.remove(sp); pool.push(...live); live.length = 0; }
  function dispose() { clear(); for (const m of mats.values()) m.dispose(); }
  return { spawn, update, clear, dispose, get count() { return live.length; } };
}

// ---------- 속성별 주변 효과 ----------
// 짝꿍·몬스터 둘레에 가끔 피어오르는 작은 입자

export function ambientFor(sp) {
  const t = sp.type;
  if (t === '불') return { kind: 'ember', every: 0.18, vel: { x: 0, y: 0.55, z: 0 }, size: 0.09, life: 1.1, from: 'top', drift: 0.15 };
  if (t === '물') return { kind: 'bubble', every: 0.7, vel: { x: 0, y: 0.35, z: 0 }, size: 0.09, life: 1.6, from: 'body', drift: 0.2 };
  if (t === '풀' || t === '땅') return { kind: 'leaf', every: 1.4, vel: { x: 0, y: -0.15, z: 0 }, size: 0.11, life: 2.2, from: 'above', drift: 0.35, spin: 4 };
  if (t === '빛' || t === '요정' || t === '에스퍼' || t === '전설') return { kind: 'spark', every: 0.45, vel: { x: 0, y: 0.2, z: 0 }, size: 0.1, life: 1.2, from: 'around', drift: 0.1 };
  if (t === '얼음') return { kind: 'snow', every: 0.55, vel: { x: 0, y: -0.2, z: 0 }, size: 0.08, life: 2, from: 'above', drift: 0.25 };
  if (t === '바람') return { kind: 'dust', every: 0.6, vel: { x: 0.4, y: 0.05, z: 0 }, size: 0.06, life: 1.4, from: 'around', drift: 0.1 };
  if (t === '매미' || t === '노말') return { kind: 'note', every: 2.2, vel: { x: 0.1, y: 0.35, z: 0 }, size: 0.12, life: 1.6, from: 'top', drift: 0.2 };
  return null;
}

/** 입자가 나올 자리 (모델 좌표계 기준 높이 1) */
export function ambientPos(THREE, model, from) {
  const p = new THREE.Vector3();
  const s = model.scale.y || 1;
  if (from === 'top') p.set((Math.random() - 0.5) * 0.12, 0.95 * s, 0);
  else if (from === 'above') p.set((Math.random() - 0.5) * 0.9, 1.25 * s, (Math.random() - 0.5) * 0.4);
  else if (from === 'around') { const a = Math.random() * Math.PI * 2; p.set(Math.cos(a) * 0.5 * s, (0.2 + Math.random() * 0.7) * s, Math.sin(a) * 0.35 * s); }
  else p.set((Math.random() - 0.5) * 0.5 * s, (0.3 + Math.random() * 0.4) * s, 0.3 * s);
  return model.parent ? p.applyMatrix4(model.matrixWorld) : p;
}

// ---------- 날아오는 밥, 장난감 공 ----------

export function makeFood(THREE, kind) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.6, emissive: o.e || 0, emissiveIntensity: o.ei || 0 });
  const add = (geo, c, pos = [0, 0, 0], sc = [1, 1, 1], o) => { const m = new THREE.Mesh(geo, M(c, o)); m.position.set(...pos); m.scale.set(...sc); g.add(m); return m; };
  const SPH = new THREE.SphereGeometry(1, 18, 12);
  switch (kind) {
    case 'tomato': add(SPH, 0xe8402e, [0, 0, 0], [0.09, 0.08, 0.09], { r: 0.3 }); add(SPH, 0x4f9a3a, [0, 0.075, 0], [0.04, 0.012, 0.04]); break;
    case 'strawberry': { const c = add(new THREE.ConeGeometry(0.07, 0.12, 14), 0xe8334a, [0, 0, 0], [1, 1, 1], { r: 0.3 }); c.rotation.x = Math.PI; add(SPH, 0x4f9a3a, [0, 0.06, 0], [0.05, 0.015, 0.05]); break; }
    case 'lettuce': for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(SPH, i % 2 ? 0x8fd16a : 0x6fbf4f, [Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04], [0.06, 0.05, 0.04]); } break;
    case 'pumpkin': for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(SPH, 0xf28a2e, [Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04], [0.06, 0.08, 0.06]); } add(new THREE.CylinderGeometry(0.01, 0.014, 0.04, 8), 0x5a7a2a, [0, 0.09, 0]); break;
    default: { // 쿠키
      add(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 24), 0xd9a066, [0, 0, 0]);
      for (const [x, z] of [[0.03, 0.02], [-0.04, -0.01], [0.0, -0.05], [-0.02, 0.05], [0.05, -0.04]]) add(SPH, 0x5a3420, [x, 0.017, z], [0.014, 0.008, 0.014]);
      g.rotation.x = 0.9;
    }
  }
  return g;
}

export function makeToyBall(THREE) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const x = c.getContext('2d');
  const cols = ['#ff6b6b', '#ffd23f', '#4fb3ff', '#7cc46a'];
  cols.forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 16, 0, 16, 32); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }));
  m.userData.dispose = () => t.dispose();
  return m;
}

/** 빛 번짐 (램프·전구 둘레) */
export function makeGlow(THREE, color = 0xffd59a, size = 0.6) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(THREE, 'glow'), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
  sp.scale.setScalar(size);
  sp.renderOrder = 9;
  sp.raycast = () => {};
  return sp;
}

// ---------- 진화 연출 ----------

export function makeEvolveFx(THREE) {
  const g = new THREE.Group();
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.6, 3.2, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  pillar.position.y = 1.6;
  g.add(pillar);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.42, 48),
    new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  g.add(ring);
  g.visible = false;
  let t0 = -1;
  return {
    obj: g,
    start(t) { t0 = t; g.visible = true; },
    /** 진행 0~1, 끝나면 false */
    update(t) {
      if (t0 < 0) return false;
      const k = (t - t0) / 2.2;
      if (k >= 1) { g.visible = false; t0 = -1; return false; }
      pillar.material.opacity = Math.sin(Math.min(1, k * 1.3) * Math.PI) * 0.55;
      pillar.rotation.y = t * 2;
      ring.material.opacity = Math.max(0, 1 - k) * 0.9;
      ring.scale.setScalar(1 + k * 5);
      return true;
    },
  };
}

/** 모델을 잠깐 하얗게 빛나게 (진화 실루엣) */
export function flashWhite(model, amount) {
  model.traverse(o => {
    if (!o.isMesh || !o.material || o.userData.isOutline) return;
    const m = o.material;
    if (!m.emissive) return;
    if (m.userData.baseEmissive == null) { m.userData.baseEmissive = m.emissive.getHex(); m.userData.baseEI = m.emissiveIntensity; }
    if (amount <= 0.001) { m.emissive.setHex(m.userData.baseEmissive); m.emissiveIntensity = m.userData.baseEI; return; }
    m.emissive.setHex(0xffffff);
    m.emissiveIntensity = Math.max(m.userData.baseEI, amount);
  });
}

// ---------- 종류별 특기 동작 ----------
// 몇 초마다 한 번씩 하는 짧은 재롱. { name, dur }

export function trickFor(sp) {
  const k = sp.kind;
  const list = k === 'insect' ? ['flutter', 'spin']
    : k === 'animal' ? ['wag', 'roll', 'hop2']
      : k === 'fish' ? ['splash', 'flip']
        : sp.type === '불' ? ['puff', 'spin'] : sp.type === '물' ? ['jiggle', 'hop2'] : ['jiggle', 'spin', 'hop2'];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 재롱 동작: 진행시간 st로 { y, rotY, rotZ, rotX, sx, sy, done } 을 돌려줌
 */
export function trickPose(name, st) {
  const out = { y: 0, rotY: null, rotZ: 0, rotX: 0, sy: 1, done: false };
  switch (name) {
    case 'spin': { const p = Math.min(1, st / 0.8); out.rotY = p * Math.PI * 2; out.y = Math.sin(p * Math.PI) * 0.12; out.done = st > 0.85; break; }
    case 'jiggle': out.sy = 1 + Math.sin(st * 22) * 0.1 * Math.max(0, 1 - st / 0.9); out.done = st > 0.9; break;
    case 'hop2': { const a = st % 0.45; out.y = Math.sin((a / 0.45) * Math.PI) * 0.16; out.sy = a < 0.06 || a > 0.4 ? 0.9 : 1.06; out.done = st > 0.9; break; }
    case 'wag': out.rotZ = Math.sin(st * 16) * 0.12; out.done = st > 1.1; break;
    case 'roll': { const p = Math.min(1, st / 1.0); out.rotZ = p * Math.PI * 2; out.y = Math.sin(p * Math.PI) * 0.18; out.done = st > 1.05; break; }
    case 'flutter': out.y = Math.sin(st * 6) * 0.12 + 0.1; out.rotZ = Math.sin(st * 9) * 0.15; out.done = st > 1.2; break;
    case 'splash': out.y = Math.max(0, Math.sin(Math.min(1, st / 0.6) * Math.PI)) * 0.3; out.rotX = -Math.sin(Math.min(1, st / 0.6) * Math.PI) * 0.6; out.done = st > 0.65; break;
    case 'flip': { const p = Math.min(1, st / 0.7); out.rotX = p * Math.PI * 2; out.y = Math.sin(p * Math.PI) * 0.25; out.done = st > 0.75; break; }
    case 'puff': out.sy = 1 + Math.sin(Math.min(1, st / 0.5) * Math.PI) * 0.18; out.done = st > 0.55; break;
    default: out.done = true;
  }
  return out;
}
