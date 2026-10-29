// 잡기 화면 3D 배경: 장소(공원·연못·아파트 단지·학교)와 시간·날씨에 따라 바뀌는 작은 무대
// 카메라는 원점, 캐릭터는 (0, -0.95, -3.4)에 서 있습니다. 바닥 높이는 y = -0.95.

import { buildWeather, skyColor } from './garden3d.js';

const GROUND_Y = -0.95;

function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function kitOf(THREE, g) {
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r ?? 0.85, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 0,
    transparent: (o.op ?? 1) < 1, opacity: o.op ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide, map: o.map || null,
  });
  const add = (geo, c, pos, o, parent = g) => { const m = new THREE.Mesh(geo, c?.isMaterial ? c : mat(c, o)); m.position.set(...pos); parent.add(m); return m; };
  return {
    mat, add,
    box: (w, h, d, c, pos, o, p) => add(new THREE.BoxGeometry(w, h, d), c, pos, o, p),
    cyl: (r1, r2, h, c, pos, o, p, seg = 12) => add(new THREE.CylinderGeometry(r1, r2, h, seg), c, pos, o, p),
    sph: (r, c, pos, sc = [1, 1, 1], o, p) => { const m = add(new THREE.SphereGeometry(r, 16, 12), c, pos, o, p); m.scale.set(...sc); return m; },
    cone: (r, h, c, pos, o, p) => add(new THREE.ConeGeometry(r, h, 12), c, pos, o, p),
  };
}

function canvasTex(THREE, w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  return t;
}

/** 하늘: 위쪽 색 → 지평선 색으로 이어지는 큰 공 */
function skyDome(THREE, top, horizon) {
  const geo = new THREE.SphereGeometry(40, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) } },
    vertexShader: 'varying float vy; void main(){ vy = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying float vy; void main(){ float k = smoothstep(-0.05, 0.55, vy); gl_FragColor = vec4(mix(hor, top, k), 1.0); }',
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = -10;
  return m;
}

function tree(THREE, k, x, z, s, colors) {
  const g = new THREE.Group();
  g.position.set(x, GROUND_Y, z);
  k.cyl(0.08 * s, 0.11 * s, 0.7 * s, 0x8f5a32, [0, 0.35 * s, 0], {}, g);
  k.sph(0.5 * s, colors[0], [0, 0.95 * s, 0], [1, 1.05, 1], {}, g);
  k.sph(0.36 * s, colors[1], [0.22 * s, 1.25 * s, 0.1 * s], [1, 1, 1], {}, g);
  k.sph(0.3 * s, colors[1], [-0.25 * s, 1.15 * s, -0.1 * s], [1, 1, 1], {}, g);
  return g;
}

function windowTex(THREE, lit) {
  return canvasTex(THREE, 64, 128, (x, w, h) => {
    x.fillStyle = '#f2ece2'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) {
      x.fillStyle = lit && ((r * 7 + c * 3) % 5 < 2) ? '#ffd98a' : '#9cc3dd';
      x.fillRect(4 + c * 15, 6 + r * 15, 10, 9);
    }
  });
}

/**
 * kind: 'park' | 'pond' | 'town' | 'school'
 * opts: { tod: 'dawn'|'day'|'dusk'|'night', weather: 'clear'|... }
 */
export function buildBackdrop(THREE, kind, { tod = 'day', weather = 'clear' } = {}) {
  const g = new THREE.Group();
  const k = kitOf(THREE, g);
  const R = rng(kind.length * 977 + 13);
  const night = tod === 'night';
  const textures = [];
  const ticks = [];

  // 하늘
  const top = skyColor(tod, weather);
  const hor = new THREE.Color(top).lerp(new THREE.Color(night ? 0x34407a : tod === 'dusk' ? 0xffd2a0 : 0xf2fbff), 0.65);
  g.add(skyDome(THREE, top, hor));
  if (night && !['rain', 'storm', 'snow'].includes(weather)) {
    const pos = [];
    for (let i = 0; i < 160; i++) {
      const a = R() * Math.PI * 2;
      const e = 0.12 + R() * 1.2;
      pos.push(Math.cos(a) * Math.cos(e) * 35, Math.sin(e) * 35, Math.sin(a) * Math.cos(e) * 35);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xfff6d0, size: 0.18, sizeAttenuation: true, depthWrite: false })));
    k.sph(1.2, 0xfff2b0, [-9, 12, -28], [1, 1, 1], { e: 0xfff2b0, ei: 1 });
  } else if (!['rain', 'storm', 'snow', 'cloudy', 'fog'].includes(weather) && !night) {
    k.sph(1.6, 0xffe066, [10, 14, -30], [1, 1, 1], { e: 0xffd23f, ei: 1 });
  }
  // 구름 몇 개
  if (!night) {
    for (let i = 0; i < 5; i++) {
      const cg = new THREE.Group();
      cg.position.set(-14 + i * 7 + R() * 3, 6 + R() * 4, -26 - R() * 4);
      const cc = ['rain', 'storm'].includes(weather) ? 0xb8c2cc : 0xffffff;
      for (let j = 0; j < 4; j++) k.sph(0.9 + R() * 0.6, cc, [j * 0.9 - 1.3, R() * 0.4, 0], [1.3, 0.8, 0.8], {}, cg);
      g.add(cg);
      ticks.push((dt) => { cg.position.x += dt * 0.15; if (cg.position.x > 18) cg.position.x = -18; });
    }
  }

  // 땅
  const grassCol = night ? '#4c7a4a' : weather === 'snow' ? '#eef3f6' : '#8fcf6a';
  const grass = canvasTex(THREE, 128, 128, (x, w, h) => {
    x.fillStyle = grassCol; x.fillRect(0, 0, w, h);
    const r2 = rng(7);
    const light = night ? '#5c8a58' : '#a3dc7e';
    const dark = night ? '#3e6a40' : '#7fc35c';
    for (let i = 0; i < 420; i++) { x.fillStyle = weather === 'snow' ? (r2() > 0.5 ? '#dfe8ee' : '#ffffff') : (r2() > 0.5 ? dark : light); x.fillRect(r2() * w, r2() * h, 1.5, 3.5); }
  }, [70, 70]);
  grass.anisotropy = 4;
  textures.push(grass);
  const ground = k.add(new THREE.CircleGeometry(40, 48), k.mat(0xffffff, { map: grass }), [0, GROUND_Y - 0.002, 0]);
  ground.rotation.x = -Math.PI / 2;
  // 먼 언덕
  for (const [x, s, c] of [[-16, 6, 0x9fd27c], [-4, 8, 0x8cc86a], [10, 7, 0x9fd27c], [22, 6, 0x8cc86a]]) {
    k.sph(s, night ? 0x3f6a46 : weather === 'snow' ? 0xe6edf2 : c, [x, GROUND_Y - s * 0.6, -30], [1.6, 1, 1]);
  }
  const treeCols = weather === 'snow' ? [0xe8f0f4, 0xffffff] : night ? [0x2f5f3a, 0x3c7046] : [0x5fae55, 0x76c266];

  if (kind === 'park' || kind === 'school' || kind === 'pond') {
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(tree(THREE, k, side * (2.4 + R() * 5), -5 - R() * 10, 0.9 + R() * 0.9, treeCols));
    }
    // 덤불과 꽃
    for (let i = 0; i < 12; i++) {
      const x = (R() - 0.5) * 9;
      const z = -2.2 - R() * 6;
      if (Math.abs(x) < 1.2 && z > -4.8) continue; // 캐릭터 자리 비우기
      k.sph(0.25 + R() * 0.2, treeCols[1], [x, GROUND_Y + 0.1, z], [1.3, 0.8, 1.1]);
      if (weather !== 'snow') for (let j = 0; j < 3; j++) k.sph(0.04, [0xff8fb0, 0xffd23f, 0xffffff][j], [x + (R() - 0.5) * 0.4, GROUND_Y + 0.28, z + 0.2 + (R() - 0.5) * 0.2]);
    }
  }

  if (kind === 'pond') {
    // 연못: 반짝이는 물 + 퍼지는 물결 + 연잎 + 부들
    const water = k.add(new THREE.CircleGeometry(3.2, 40), k.mat(night ? 0x2c4f7a : 0x5ec8e8, { r: 0.15, op: 0.92 }), [0.6, GROUND_Y + 0.004, -7.4]);
    water.rotation.x = -Math.PI / 2;
    water.scale.set(1.5, 1, 1);
    const ripples = [];
    for (let i = 0; i < 3; i++) {
      const rp = k.add(new THREE.RingGeometry(0.2, 0.24, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }), [0.2 + i * 0.9, GROUND_Y + 0.01, -6.8 - i * 0.6]);
      rp.rotation.x = -Math.PI / 2;
      ripples.push({ rp, off: i * 0.9 });
    }
    ticks.push((dt, t) => ripples.forEach(({ rp, off }) => { const p = ((t + off) % 2.7) / 2.7; rp.scale.setScalar(1 + p * 4); rp.material.opacity = 0.6 * (1 - p); }));
    for (let i = 0; i < 6; i++) {
      const lp = k.add(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 20), 0x4f9a3a, [-2 + R() * 5, GROUND_Y + 0.012, -6.2 - R() * 2.6]);
      if (i % 2 === 0) k.sph(0.07, 0xff9ac0, [lp.position.x, GROUND_Y + 0.08, lp.position.z], [1, 0.8, 1]);
    }
    for (let i = 0; i < 7; i++) {
      const x = -4 + R() * 1.4;
      const z = -4.4 - R() * 3;
      k.cyl(0.015, 0.015, 0.9, 0x6a9a3a, [x, GROUND_Y + 0.45, z]);
      k.cyl(0.04, 0.04, 0.2, 0x7a4a24, [x, GROUND_Y + 0.85, z]);
    }
  }

  if (kind === 'town') {
    // 한숲시티 아파트 단지: 멀리 아파트, 가까이 벤치·가로등·미끄럼틀
    const tex = windowTex(THREE, night || tod === 'dusk');
    textures.push(tex);
    for (let i = 0; i < 7; i++) {
      const hgt = 5 + R() * 4;
      const x = -15 + i * 5 + R();
      const b = k.add(new THREE.BoxGeometry(3.2, hgt, 2), k.mat(0xffffff, { map: tex }), [x, GROUND_Y + hgt / 2, -17 - R() * 4]);
      b.material.map = tex.clone();
      b.material.map.needsUpdate = true;
      b.material.map.repeat.set(2, hgt / 2);
      textures.push(b.material.map);
      k.box(3.3, 0.25, 2.1, 0xd88c6a, [x, GROUND_Y + hgt + 0.12, b.position.z]);
    }
    // 길
    const road = k.add(new THREE.PlaneGeometry(40, 2.2), 0xcfc6b6, [0, GROUND_Y + 0.003, -9]);
    road.rotation.x = -Math.PI / 2;
    for (let i = -6; i <= 6; i++) { const d = k.add(new THREE.PlaneGeometry(0.8, 0.08), 0xffffff, [i * 2, GROUND_Y + 0.006, -9]); d.rotation.x = -Math.PI / 2; }
    // 벤치
    const bench = new THREE.Group();
    bench.position.set(-2.4, GROUND_Y, -5.2);
    bench.rotation.y = 0.5;
    k.box(1.1, 0.06, 0.32, 0xc58a52, [0, 0.42, 0], {}, bench);
    k.box(1.1, 0.25, 0.05, 0xc58a52, [0, 0.62, -0.14], {}, bench);
    for (const sx of [-0.45, 0.45]) k.box(0.06, 0.42, 0.3, 0x555a60, [sx, 0.21, 0], {}, bench);
    g.add(bench);
    // 가로등
    k.cyl(0.04, 0.05, 2.4, 0x555a60, [2.3, GROUND_Y + 1.2, -6]);
    const lamp = k.sph(0.16, 0xfff2c0, [2.3, GROUND_Y + 2.45, -6], [1, 1, 1], { e: 0xffe5a0, ei: night ? 1.4 : 0.3 });
    g.userData.lampPos = lamp.position.clone();
    // 미끄럼틀
    const slide = new THREE.Group();
    slide.position.set(3.4, GROUND_Y, -8.5);
    slide.rotation.y = -0.6;
    for (const sx of [-0.3, 0.3]) k.cyl(0.04, 0.04, 1.2, 0x3f8fd2, [sx, 0.6, -0.5], {}, slide);
    k.box(0.7, 0.06, 0.6, 0xffc93c, [0, 1.2, -0.5], {}, slide);
    const sl = k.box(0.55, 0.05, 1.6, 0xe8534a, [0, 0.62, 0.5], {}, slide);
    sl.rotation.x = 0.75;
    g.add(slide);
    for (let i = 0; i < 6; i++) g.add(tree(THREE, k, (i % 2 ? 1 : -1) * (4.5 + R() * 4), -10 - R() * 4, 0.8 + R() * 0.6, treeCols));
  }

  if (kind === 'school') {
    // 남곡초: 학교 건물, 시계, 국기봉과 깃발
    const tex = windowTex(THREE, night);
    textures.push(tex);
    const sch = k.add(new THREE.BoxGeometry(9, 3.4, 2.2), k.mat(0xffffff, { map: tex }), [0, GROUND_Y + 1.7, -14]);
    sch.material.map.repeat.set(6, 2);
    k.box(9.3, 0.3, 2.4, 0x3f8f6a, [0, GROUND_Y + 3.5, -14]);
    k.box(2, 4.4, 2.3, 0xf6e7c8, [0, GROUND_Y + 2.2, -13.8]);
    k.cyl(0.45, 0.45, 0.06, 0xffffff, [0, GROUND_Y + 3.6, -12.6], {}, g, 24).rotation.x = Math.PI / 2;
    const hand = k.box(0.04, 0.32, 0.02, 0x333333, [0, GROUND_Y + 3.65, -12.55]);
    ticks.push((dt, t) => { hand.rotation.z = -t * 0.3; });
    k.cyl(0.03, 0.03, 3.6, 0xdddddd, [-4.2, GROUND_Y + 1.8, -9]);
    const flag = k.add(new THREE.PlaneGeometry(0.9, 0.6, 8, 1), k.mat(0xffffff, { ds: true }), [-3.75, GROUND_Y + 3.3, -9]);
    const fp = flag.geometry.attributes.position;
    const base = fp.array.slice();
    ticks.push((dt, t) => { for (let i = 0; i < fp.count; i++) { const x = base[i * 3]; fp.array[i * 3 + 2] = Math.sin(t * 4 + x * 5) * 0.06 * (x + 0.45); } fp.needsUpdate = true; });
    k.sph(0.12, 0xe8534a, [-3.75, GROUND_Y + 3.3, -8.98], [1, 1, 0.1]);
    // 울타리
    for (let x = -6; x <= 6; x += 0.5) k.box(0.05, 0.5, 0.05, 0x7fbf8f, [x, GROUND_Y + 0.25, -11]);
    k.box(12.2, 0.04, 0.04, 0x7fbf8f, [0, GROUND_Y + 0.45, -11]);
  }

  // 비·눈
  const wx = buildWeather(THREE, weather);
  if (wx) {
    wx.position.set(0, GROUND_Y, -3);
    wx.scale.set(1.4, 1.2, 1.4);
    g.add(wx);
    ticks.push((dt, t) => wx.userData.tick(dt, t));
  }

  g.userData.tick = (dt, t) => ticks.forEach(f => f(dt, t));
  g.userData.dispose = () => textures.forEach(t => t.dispose());
  g.userData.night = night;
  return g;
}
