// 짝꿍 텃밭 3D: 잔디 마당, 울타리, 밭 6칸, 자라는 작물, 비·눈, 해·달

export const PLOTS = [
  { id: 'p1', x: -1.05, z: -1.0 }, { id: 'p2', x: 0, z: -1.0 }, { id: 'p3', x: 1.05, z: -1.0 },
  { id: 'p4', x: -1.05, z: -0.4 }, { id: 'p5', x: 0, z: -0.4 }, { id: 'p6', x: 1.05, z: -0.4 },
];
export const BED_TOP = 0.12;

function mk(THREE) {
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.rough ?? 0.8, emissive: o.glow ? c : 0x000000, emissiveIntensity: o.glow || 0,
    transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, side: o.double ? THREE.DoubleSide : THREE.FrontSide,
  });
  const mesh = (parent, geo, c, pos = [0, 0, 0], o = {}) => {
    const m = new THREE.Mesh(geo, c instanceof THREE.Material ? c : mat(c, o));
    m.position.set(...pos);
    parent.add(m);
    return m;
  };
  return {
    mat, mesh,
    box: (p, w, h, d, c, pos, o) => mesh(p, new THREE.BoxGeometry(w, h, d), c, pos, o),
    cyl: (p, r1, r2, h, c, pos, o, seg = 16) => mesh(p, new THREE.CylinderGeometry(r1, r2, h, seg), c, pos, o),
    sph: (p, r, c, pos, s = [1, 1, 1], o) => { const m = mesh(p, new THREE.SphereGeometry(r, 20, 14), c, pos, o); m.scale.set(...s); return m; },
    cone: (p, r, h, c, pos, o) => mesh(p, new THREE.ConeGeometry(r, h, 16), c, pos, o),
  };
}

function grassTex(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#8fcf6a'; x.fillRect(0, 0, 256, 256);
  let s = 11;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 900; i++) { x.fillStyle = r() > 0.5 ? '#7fc35c' : '#a3dc7e'; x.fillRect(r() * 256, r() * 256, 2, 6); }
  for (let i = 0; i < 18; i++) { x.fillStyle = ['#fff', '#ffd23f', '#ff9ac0'][i % 3]; x.beginPath(); x.arc(r() * 256, r() * 256, 2.5, 0, Math.PI * 2); x.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 4);
  return t;
}

export function buildGarden(THREE) {
  const g = new THREE.Group();
  const { mesh, box, cyl, sph, cone } = mk(THREE);
  const tex = grassTex(THREE);
  const ground = mesh(g, new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), [0, 0, -1.5]);
  ground.rotation.x = -Math.PI / 2;
  // 앞쪽 디딤돌 길
  for (let i = 0; i < 6; i++) {
    const st = sph(g, 0.17, 0xd9cdb4, [-1.25 + i * 0.5, 0.005, 0.62 + (i % 2) * 0.08], [1, 0.08, 0.75]);
    st.rotation.y = i;
  }
  // 울타리
  const WOOD = 0xc89a64;
  for (let x = -2.2; x <= 2.21; x += 0.4) {
    box(g, 0.07, 0.55, 0.05, WOOD, [x, 0.27, -1.55]);
    cone(g, 0.05, 0.08, WOOD, [x, 0.58, -1.55]);
  }
  for (const y of [0.18, 0.4]) box(g, 4.5, 0.05, 0.03, 0xb7884f, [0, y, -1.57]);
  // 밭 6칸
  const beds = {};
  for (const p of PLOTS) {
    const bed = new THREE.Group();
    bed.position.set(p.x, 0, p.z);
    box(bed, 0.8, 0.1, 0.5, 0x8f5a32, [0, 0.05, 0]);
    const soil = box(bed, 0.72, 0.03, 0.42, 0x6b4a2f, [0, 0.105, 0]);
    for (let i = -1; i <= 1; i++) box(bed, 0.68, 0.012, 0.03, 0x5a3c25, [0, 0.122, i * 0.12]);
    bed.userData.soil = soil;
    bed.traverse(o => { o.userData.plot = p.id; });
    g.add(bed);
    beds[p.id] = bed;
  }
  // 울타리 뒤 나무와 언덕
  for (const [x, z, s] of [[-2.6, -2.4, 1.2], [-1.4, -2.9, 1.5], [0.6, -3.1, 1.3], [2.1, -2.5, 1.1], [3.2, -3.4, 1.6], [-3.4, -3.3, 1.4]]) {
    cyl(g, 0.07 * s, 0.09 * s, 0.6 * s, 0x8f5a32, [x, 0.3 * s, z]);
    sph(g, 0.42 * s, 0x5fae55, [x, 0.85 * s, z], [1, 1.1, 1]);
    sph(g, 0.3 * s, 0x76c266, [x + 0.15 * s, 1.1 * s, z + 0.1], [1, 1, 1]);
  }
  for (const [x, s] of [[-4, 3], [0.5, 4], [5, 3.2]]) sph(g, s, 0x9fd27c, [x, -s * 0.55, -8], [1.4, 1, 1]);
  // 작은 우체통
  cyl(g, 0.03, 0.03, 0.5, 0x8f5a32, [1.75, 0.25, 0.3]);
  box(g, 0.22, 0.16, 0.3, 0xe8534a, [1.75, 0.55, 0.3]);
  // 해와 달
  const sun = sph(g, 0.45, 0xffd23f, [2.6, 3.0, -7.5], [1, 1, 1], { glow: 1 });
  const moon = sph(g, 0.35, 0xfff2b0, [-2.4, 3.1, -7.5], [1, 1, 1], { glow: 1 });
  g.userData = { beds, sun, moon, dispose: () => tex.dispose() };
  return g;
}

// ---------- 작물 ----------

export function buildPlant(THREE, crop, stage) {
  const g = new THREE.Group();
  const { box, cyl, sph, cone, mesh } = mk(THREE);
  const LEAF = 0x5fb34a;
  const leaf = (x, y, z, s = 1, rz = 0) => { const l = sph(g, 0.05 * s, LEAF, [x, y, z], [1, 0.3, 0.55]); l.rotation.z = rz; return l; };
  if (stage <= 0) {
    sph(g, 0.06, 0x7a5434, [0, 0.01, 0], [1, 0.4, 1]);
    cyl(g, 0.006, 0.006, 0.05, LEAF, [0, 0.04, 0]);
    sph(g, 0.012, LEAF, [0, 0.07, 0]);
    return g;
  }
  if (stage === 1) {
    cyl(g, 0.008, 0.008, 0.1, LEAF, [0, 0.05, 0]);
    leaf(-0.04, 0.1, 0, 1, 0.5);
    leaf(0.04, 0.1, 0, 1, -0.5);
    return g;
  }
  if (stage === 2) {
    const h = crop === 'sunflower' ? 0.42 : crop === 'tomato' ? 0.3 : 0.2;
    cyl(g, 0.012, 0.014, h, LEAF, [0, h / 2, 0]);
    for (let i = 0; i < 4; i++) leaf((i % 2 ? 1 : -1) * 0.06, 0.06 + i * h / 5, 0, 1.4, (i % 2 ? -1 : 1) * 0.5);
    if (crop === 'pumpkin' || crop === 'strawberry' || crop === 'lettuce') sph(g, 0.1, LEAF, [0, 0.06, 0], [1.2, 0.5, 1]);
    if (crop === 'lotus') { mesh(g, new THREE.CircleGeometry(0.12, 24), 0x4f9a3a, [0, 0.02, 0], { double: true }).rotation.x = -Math.PI / 2; }
    return g;
  }
  switch (crop) {
    case 'lettuce':
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const l = sph(g, 0.09, i % 2 ? 0x8fd16a : 0x6fbf4f, [Math.cos(a) * 0.07, 0.07, Math.sin(a) * 0.07], [1, 0.8, 0.6]);
        l.rotation.y = -a;
      }
      sph(g, 0.08, 0xb6e68c, [0, 0.1, 0]);
      break;
    case 'tomato':
      cyl(g, 0.01, 0.01, 0.5, 0xc89a64, [0.06, 0.25, 0]); // 지지대
      cyl(g, 0.012, 0.014, 0.42, LEAF, [0, 0.21, 0]);
      for (let i = 0; i < 4; i++) leaf((i % 2 ? 1 : -1) * 0.07, 0.1 + i * 0.08, 0, 1.4, (i % 2 ? -1 : 1) * 0.4);
      for (const [x, y, z] of [[-0.06, 0.22, 0.04], [0.05, 0.3, 0.05], [-0.03, 0.36, -0.04], [0.06, 0.16, -0.03]]) {
        sph(g, 0.045, 0xe8402e, [x, y, z], [1, 0.9, 1], { rough: 0.35 });
        sph(g, 0.012, LEAF, [x, y + 0.04, z]);
      }
      break;
    case 'strawberry':
      sph(g, 0.14, LEAF, [0, 0.06, 0], [1.3, 0.5, 1.1]);
      for (const [x, z] of [[-0.1, 0.06], [0.08, 0.08], [0.12, -0.04], [-0.06, -0.08], [0.0, 0.11]]) {
        const b = cone(g, 0.035, 0.07, 0xe8334a, [x, 0.06, z], { rough: 0.35 });
        b.rotation.x = Math.PI;
        sph(g, 0.02, LEAF, [x, 0.1, z], [1.4, 0.4, 1.4]);
      }
      break;
    case 'sunflower': {
      cyl(g, 0.016, 0.02, 0.62, LEAF, [0, 0.31, 0]);
      for (let i = 0; i < 4; i++) leaf((i % 2 ? 1 : -1) * 0.08, 0.15 + i * 0.1, 0, 1.8, (i % 2 ? -1 : 1) * 0.4);
      const head = new THREE.Group();
      head.position.set(0, 0.66, 0.03);
      head.rotation.x = -0.25;
      g.add(head);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const p = sph(head, 0.05, 0xffc93c, [Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0], [0.5, 1, 0.2]);
        p.rotation.z = a - Math.PI / 2;
      }
      sph(head, 0.075, 0x7a4a24, [0, 0, 0.01], [1, 1, 0.35]);
      g.userData.sway = head;
      break;
    }
    case 'lotus': {
      cyl(g, 0.17, 0.15, 0.08, 0x6aa9d8, [0, 0.04, 0], { opacity: 0.85 }); // 작은 물그릇
      const pad = mesh(g, new THREE.CircleGeometry(0.14, 24), 0x4f9a3a, [0.03, 0.085, 0.02], { double: true });
      pad.rotation.x = -Math.PI / 2;
      const flower = new THREE.Group();
      flower.position.set(-0.02, 0.1, -0.02);
      g.add(flower);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const p = sph(flower, 0.05, i % 2 ? 0xff9ac0 : 0xffb8d2, [Math.cos(a) * 0.04, 0.04, Math.sin(a) * 0.04], [0.45, 1, 0.25]);
        p.rotation.set(Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5);
      }
      sph(flower, 0.025, 0xffe066, [0, 0.05, 0]);
      break;
    }
    case 'pumpkin':
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        sph(g, 0.1, 0xf28a2e, [Math.cos(a) * 0.06, 0.1, Math.sin(a) * 0.06], [0.7, 0.95, 0.7], { rough: 0.5 });
      }
      cyl(g, 0.015, 0.02, 0.07, 0x5a7a2a, [0, 0.21, 0]);
      leaf(0.14, 0.04, 0.05, 2.2, 0);
      leaf(-0.15, 0.04, -0.04, 2, 0);
      break;
    default:
      box(g, 0.1, 0.1, 0.1, 0xcccccc, [0, 0.05, 0]);
  }
  return g;
}

/** 물 필요 표시 (파란 물방울) */
export function buildDrop(THREE) {
  const g = new THREE.Group();
  const { sph, cone } = mk(THREE);
  sph(g, 0.05, 0x4fb3ff, [0, 0, 0], [1, 1, 1], { glow: 0.3, rough: 0.2 });
  cone(g, 0.045, 0.08, 0x4fb3ff, [0, 0.06, 0], { glow: 0.3, rough: 0.2 });
  return g;
}

/** 다 자람 표시 (반짝이) */
export function buildSparkle(THREE) {
  const g = new THREE.Group();
  const { mesh } = mk(THREE);
  for (let i = 0; i < 3; i++) {
    const s = mesh(g, new THREE.OctahedronGeometry(0.035), 0xfff2a8, [Math.cos(i * 2.1) * 0.15, 0.1 * i, Math.sin(i * 2.1) * 0.15], { glow: 1 });
    s.userData.a = i * 2.1;
  }
  return g;
}

// ---------- 비·눈 ----------

export function buildWeather(THREE, kind) {
  if (!['rain', 'storm', 'snow'].includes(kind)) return null;
  const snow = kind === 'snow';
  const N = snow ? 260 : 420;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 1] = Math.random() * 3.5;
    pos[i * 3 + 2] = -2 + Math.random() * 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: snow ? 0xffffff : 0x9cc8ff, size: snow ? 0.06 : 0.035, transparent: true, opacity: snow ? 0.95 : 0.75, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  const speed = snow ? 0.5 : 4.2;
  pts.userData.tick = (dt, t) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      a[i * 3 + 1] -= speed * dt;
      if (snow) a[i * 3] += Math.sin(t * 1.3 + i) * dt * 0.15;
      if (a[i * 3 + 1] < 0) a[i * 3 + 1] += 3.5;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

// 하늘 색: 시간대 x 날씨
export function skyColor(tod, kind) {
  const base = { dawn: 0xffc9a8, day: 0x9fd6ff, dusk: 0xffa86b, night: 0x1e2a55 }[tod] ?? 0x9fd6ff;
  if (['rain', 'storm'].includes(kind)) return tod === 'night' ? 0x1a2238 : 0x8e9bab;
  if (kind === 'snow') return tod === 'night' ? 0x2a3456 : 0xd8e2ee;
  if (kind === 'cloudy' || kind === 'fog') return tod === 'night' ? 0x232c4a : tod === 'day' ? 0xbfd3e3 : base;
  return base;
}
