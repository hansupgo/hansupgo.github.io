// 짝꿍 방 3D: 방(벽·바닥)과 가구 모델 (three.js 기본 도형 조합)
// 가구는 바닥 가운데가 원점, 앞쪽이 +z. 벽 가구는 뒷면이 z=0.
// 움직이는 부품은 userData.tick(t)로 애니메이션합니다.

import { roundedBox } from './charfx.js';

export function buildFurniture(THREE, id) {
  const g = new THREE.Group();
  const ticks = [];
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.rough ?? 0.7, metalness: 0,
    emissive: o.glow ? c : 0x000000, emissiveIntensity: o.glow || 0,
    transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, depthWrite: (o.opacity ?? 1) >= 1,
    side: o.double ? THREE.DoubleSide : THREE.FrontSide,
  });
  const mesh = (geo, c, pos = [0, 0, 0], o = {}, parent = g) => {
    const m = new THREE.Mesh(geo, c instanceof THREE.Material ? c : mat(c, o));
    m.position.set(...pos);
    parent.add(m);
    return m;
  };
  const box = (w, h, d, c, pos, o, p) => mesh(roundedBox(THREE, w, h, d), c, pos, o, p);
  const cyl = (r1, r2, h, c, pos, o, p, seg = 24) => mesh(new THREE.CylinderGeometry(r1, r2, h, seg), c, pos, o, p);
  const sph = (r, c, pos, scale = [1, 1, 1], o, p) => { const m = mesh(new THREE.SphereGeometry(r, 24, 16), c, pos, o, p); m.scale.set(...scale); return m; };
  const WOOD = 0xc58a52, WOOD_D = 0x8f5a32;

  switch (id) {
    case 'cushion': {
      sph(0.3, 0x86c56a, [0, 0.08, 0], [1, 0.3, 1]);
      sph(0.2, 0xa8dc84, [0, 0.13, 0], [1, 0.22, 1]);
      const vein = box(0.36, 0.012, 0.025, 0x5f9a48, [0, 0.175, 0]);
      vein.rotation.y = 0.6;
      cyl(0.02, 0.02, 0.14, 0x5f9a48, [0.27, 0.09, 0.2]).rotation.set(0, 0, 1.2);
      break;
    }
    case 'stool': {
      cyl(0.18, 0.2, 0.34, WOOD_D, [0, 0.17, 0]);
      cyl(0.18, 0.18, 0.012, 0xe5bf8a, [0, 0.346, 0]);
      for (const r of [0.06, 0.11, 0.155]) {
        const ring = mesh(new THREE.TorusGeometry(r, 0.006, 6, 40), 0xb98a57, [0, 0.353, 0]);
        ring.rotation.x = Math.PI / 2;
      }
      break;
    }
    case 'table': {
      cyl(0.34, 0.34, 0.05, WOOD, [0, 0.42, 0]);
      cyl(0.05, 0.06, 0.4, WOOD_D, [0, 0.21, 0]);
      sph(0.14, 0xa7a9a3, [0, 0.04, 0], [1, 0.35, 1]);
      // 찻잔
      cyl(0.05, 0.04, 0.07, 0xffffff, [0.12, 0.48, 0.05], { rough: 0.3 });
      cyl(0.044, 0.044, 0.005, 0x9bd27a, [0.12, 0.513, 0.05]);
      break;
    }
    case 'plant': {
      cyl(0.13, 0.1, 0.22, 0xd9774a, [0, 0.11, 0]);
      cyl(0.14, 0.14, 0.035, 0xe8875a, [0, 0.22, 0]);
      cyl(0.12, 0.12, 0.01, 0x6b4a2f, [0, 0.23, 0]);
      const flowers = [[-0.06, 0.48, 0.02, 0xff8fb0], [0.07, 0.55, -0.02, 0xffd23f], [0.0, 0.42, 0.07, 0xff6f6f]];
      for (const [x, y, z, c] of flowers) {
        cyl(0.008, 0.008, y - 0.22, 0x4f9a3a, [x * 0.6, (y + 0.22) / 2, z * 0.6]);
        const head = new THREE.Group();
        head.position.set(x, y, z);
        g.add(head);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          sph(0.035, c, [Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04], [1, 0.45, 1], {}, head);
        }
        sph(0.025, 0xfff2a8, [0, 0.01, 0], [1, 0.6, 1], {}, head);
        ticks.push((t) => { head.rotation.z = Math.sin(t * 1.3 + x * 20) * 0.08; });
      }
      for (const s of [-1, 1]) {
        const leaf = sph(0.07, 0x6cbf4f, [s * 0.07, 0.3, 0], [1, 0.25, 0.5]);
        leaf.rotation.z = s * 0.5;
      }
      break;
    }
    case 'lamp': {
      sph(0.16, 0xa7a9a3, [0, 0.06, 0], [1, 0.45, 1]);
      sph(0.11, 0xbfc1bb, [0.01, 0.15, 0], [1, 0.5, 1]);
      sph(0.07, 0x96988f, [-0.01, 0.22, 0], [1, 0.55, 1]);
      cyl(0.015, 0.015, 0.34, WOOD_D, [0, 0.42, 0]);
      const shade = mesh(new THREE.CylinderGeometry(0.09, 0.2, 0.2, 24, 1, true), 0xffe6a0, [0, 0.66, 0], { glow: 0.55, opacity: 0.95, double: true });
      const bulb = sph(0.06, 0xfff4c9, [0, 0.62, 0], [1, 1, 1], { glow: 1.2 });
      const light = new THREE.PointLight(0xffd59a, 0.9, 2.2, 1.5);
      light.position.set(0, 0.62, 0.05);
      g.add(light);
      g.userData.light = light;
      g.userData.glow = [bulb.material, shade.material];
      break;
    }
    case 'shelf': {
      const W = 0.62, H = 0.92, D = 0.26;
      box(W, 0.03, D, WOOD_D, [0, H, 0]);
      for (const x of [-W / 2, W / 2]) box(0.03, H, D, WOOD_D, [x, H / 2, 0]);
      box(W, H, 0.02, WOOD, [0, H / 2, -D / 2]);
      const colors = [0xe8532b, 0x3f8fd2, 0xffd23f, 0x4f9a3a, 0xa45ee5, 0xff8fb0, 0xf2a65a];
      [0.02, 0.32, 0.62].forEach((y, row) => {
        box(W, 0.025, D, WOOD_D, [0, y, 0]);
        let x = -W / 2 + 0.05;
        for (let i = 0; i < 6 && x < W / 2 - 0.08; i++) {
          const h = 0.17 + ((i * 7 + row * 3) % 5) * 0.02;
          const w = 0.04 + ((i + row) % 3) * 0.012;
          if (row === 2 && i === 3) { sph(0.06, 0x86c56a, [x + 0.04, y + 0.07, 0], [1, 1, 1]); x += 0.12; continue; }
          const b = box(w, h, 0.18, colors[(i + row * 2) % colors.length], [x + w / 2, y + h / 2 + 0.012, 0.01]);
          if (i === 4) b.rotation.z = -0.25;
          x += w + 0.008;
        }
      });
      break;
    }
    case 'tank': {
      box(0.5, 0.08, 0.3, WOOD_D, [0, 0.04, 0]);
      box(0.46, 0.3, 0.26, 0xbfe9ff, [0, 0.23, 0], { opacity: 0.28, rough: 0.1 });
      box(0.44, 0.24, 0.24, 0x5ec8e8, [0, 0.2, 0], { opacity: 0.35, rough: 0.1 });
      for (let i = 0; i < 6; i++) sph(0.03, [0xf2e2c0, 0xd8c7a4, 0xe8d6b8][i % 3], [-0.18 + i * 0.07, 0.1, (i % 2) * 0.06 - 0.03], [1, 0.5, 1]);
      for (const x of [-0.14, 0.15]) {
        const weed = cyl(0.012, 0.02, 0.16, 0x4f9a3a, [x, 0.18, -0.06]);
        ticks.push((t) => { weed.rotation.z = Math.sin(t * 1.6 + x * 10) * 0.2; });
      }
      const fish = new THREE.Group();
      sph(0.035, 0xff8a3d, [0, 0, 0], [1.3, 0.9, 0.7], {}, fish);
      const tail = mesh(new THREE.ConeGeometry(0.03, 0.05, 12), 0xffb066, [-0.06, 0, 0], {}, fish);
      tail.rotation.z = Math.PI / 2;
      sph(0.007, 0x222222, [0.032, 0.01, 0.02], [1, 1, 1], {}, fish);
      g.add(fish);
      ticks.push((t) => {
        const a = t * 0.9;
        fish.position.set(Math.sin(a) * 0.15, 0.24 + Math.sin(t * 2.1) * 0.03, Math.cos(a) * 0.05);
        fish.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI;
        tail.rotation.y = Math.sin(t * 12) * 0.5;
      });
      break;
    }
    case 'bed': {
      box(0.62, 0.16, 0.9, WOOD, [0, 0.08, 0.05]);
      box(0.58, 0.08, 0.84, 0xfff8ee, [0, 0.2, 0.05]);
      const blanket = box(0.6, 0.05, 0.55, 0xe8534a, [0, 0.25, 0.18]);
      for (const [x, z] of [[-0.15, 0.05], [0.12, 0.28], [0.18, 0.02], [-0.1, 0.36]]) {
        cyl(0.04, 0.04, 0.01, 0xffffff, [x, 0.28, z + 0.04]);
      }
      sph(0.13, 0xffffff, [0, 0.27, -0.25], [1.5, 0.45, 0.9]);
      // 머리맡 버섯 갓
      cyl(0.09, 0.11, 0.5, 0xf6ead5, [0, 0.25, -0.38]);
      const cap = mesh(new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0xe8534a, [0, 0.48, -0.38]);
      cap.scale.set(1, 0.6, 0.55);
      for (const [x, y] of [[-0.22, 0.6], [0.05, 0.68], [0.25, 0.57], [-0.05, 0.56]]) {
        sph(0.045, 0xffffff, [x, y, -0.38 + 0.2], [1, 1, 0.4]);
      }
      g.userData.sleepAt = { y: 0.27, z: 0.05 };
      break;
    }
    case 'rug': {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const x = c.getContext('2d');
      const rings = ['#f2a65a', '#ffd98a', '#e8875a', '#fff2cf', '#f2a65a', '#ffd98a'];
      rings.forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(128, 128, 128 - i * 20, 0, Math.PI * 2); x.fill(); });
      x.fillStyle = '#ff8fb0';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.arc(128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98, 7, 0, Math.PI * 2); x.fill(); }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const rug = mesh(new THREE.CircleGeometry(0.72, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), [0, 0.006, 0]);
      rug.rotation.x = -Math.PI / 2;
      break;
    }
    case 'frame': {
      box(0.5, 0.4, 0.04, WOOD_D, [0, 0, 0.02]);
      const c = document.createElement('canvas');
      c.width = 128; c.height = 100;
      const x = c.getContext('2d');
      x.fillStyle = '#bfe6ff'; x.fillRect(0, 0, 128, 100);
      x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(96, 28, 14, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#7cc46a'; x.beginPath(); x.ellipse(40, 100, 70, 42, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#4f9a3a'; x.beginPath(); x.ellipse(110, 104, 60, 34, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#ff8fb0'; for (const [a, b] of [[30, 76], [50, 70], [70, 80]]) { x.beginPath(); x.arc(a, b, 4, 0, Math.PI * 2); x.fill(); }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), [0, 0, 0.042]);
      break;
    }
    case 'window': {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d');
      const grd = x.createLinearGradient(0, 0, 0, 128);
      grd.addColorStop(0, '#8fd0ff'); grd.addColorStop(1, '#e8f7ff');
      x.fillStyle = grd; x.fillRect(0, 0, 128, 128);
      x.fillStyle = '#fff';
      for (const [a, b, r] of [[34, 40, 14], [50, 36, 18], [66, 42, 12], [92, 80, 10], [104, 76, 13]]) { x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = '#7cc46a'; x.beginPath(); x.ellipse(64, 140, 90, 40, 0, 0, Math.PI * 2); x.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sky = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.35 });
      mesh(new THREE.CircleGeometry(0.26, 40), sky, [0, 0, 0.01]);
      mesh(new THREE.TorusGeometry(0.27, 0.035, 12, 48), WOOD, [0, 0, 0.03]);
      box(0.52, 0.025, 0.02, WOOD, [0, 0, 0.03]);
      box(0.025, 0.52, 0.02, WOOD, [0, 0, 0.03]);
      box(0.6, 0.04, 0.09, WOOD_D, [0, -0.29, 0.045]);
      g.userData.sky = sky;
      break;
    }
    case 'garland': {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector3(-0.42 + u * 0.84, -Math.sin(u * Math.PI) * 0.16 + 0.05, 0.03)); }
      const curve = new THREE.CatmullRomCurve3(pts);
      mesh(new THREE.TubeGeometry(curve, 40, 0.006, 6, false), 0x4f6f45);
      const cols = [0xffd23f, 0xff8fb0, 0x8fd0ff, 0xa8e07a, 0xffb066];
      const bulbs = [];
      for (let i = 1; i < 12; i++) {
        const p = curve.getPoint(i / 12);
        const b = sph(0.028, cols[i % cols.length], [p.x, p.y - 0.03, p.z + 0.01], [1, 1.2, 1], { glow: 0.9 });
        bulbs.push(b);
      }
      g.userData.glow = bulbs.map(b => b.material);
      ticks.push((t) => bulbs.forEach((b, i) => { b.material.emissiveIntensity = (g.userData.glowBase ?? 0.9) * (0.6 + 0.4 * Math.sin(t * 2.5 + i * 1.7)); }));
      break;
    }
    case 'mobile': {
      cyl(0.012, 0.012, 0.5, WOOD_D, [0, 0.12, 0.18]).rotation.z = Math.PI / 2;
      cyl(0.004, 0.004, 0.12, 0xdddddd, [0, 0.19, 0.18]);
      const shells = [];
      const cols = [0xffd5c2, 0xfff0d9, 0xd9ecff, 0xffe0ef];
      [-0.22, -0.08, 0.07, 0.21].forEach((x, i) => {
        const hang = new THREE.Group();
        hang.position.set(x, 0.12, 0.18);
        g.add(hang);
        const len = 0.12 + (i % 2) * 0.08;
        cyl(0.003, 0.003, len, 0xdddddd, [0, -len / 2, 0], {}, hang);
        const s = mesh(new THREE.ConeGeometry(0.045, 0.06, 10, 1), cols[i], [0, -len - 0.03, 0], {}, hang);
        s.scale.set(1, 1, 0.45);
        s.rotation.x = Math.PI;
        shells.push(hang);
      });
      ticks.push((t) => shells.forEach((h, i) => { h.rotation.z = Math.sin(t * 1.4 + i) * 0.12; h.rotation.y = t * 0.6 + i; }));
      break;
    }
    case 'sunpot': {
      cyl(0.15, 0.11, 0.24, 0xd9774a, [0, 0.12, 0]);
      cyl(0.16, 0.16, 0.035, 0xe8875a, [0, 0.24, 0]);
      cyl(0.014, 0.018, 0.7, 0x5fb34a, [0, 0.6, 0]);
      for (const sx of [-1, 1]) { const l = sph(0.07, 0x5fb34a, [sx * 0.08, 0.5, 0], [1, 0.3, 0.55]); l.rotation.z = -sx * 0.4; }
      const head = new THREE.Group();
      head.position.set(0, 0.97, 0.04);
      head.rotation.x = -0.2;
      g.add(head);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const p = sph(0.06, 0xffc93c, [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0], [0.5, 1, 0.2], {}, head);
        p.rotation.z = a - Math.PI / 2;
      }
      sph(0.09, 0x7a4a24, [0, 0, 0.01], [1, 1, 0.35], {}, head);
      ticks.push((t) => { head.rotation.z = Math.sin(t * 0.9) * 0.08; });
      break;
    }
    case 'lotuslamp': {
      cyl(0.2, 0.22, 0.06, 0x6aa9d8, [0, 0.03, 0], { opacity: 0.9 });
      const petals = [];
      for (let ring = 0; ring < 2; ring++) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + ring * 0.4;
          const r = ring ? 0.07 : 0.12;
          const p = sph(0.08 - ring * 0.02, ring ? 0xffc2d8 : 0xff9ac0, [Math.cos(a) * r, 0.13 + ring * 0.05, Math.sin(a) * r], [0.45, 1, 0.25], { glow: 0.25 });
          p.rotation.set(Math.sin(a) * 0.6, -a, Math.cos(a) * 0.6);
          petals.push(p.material);
        }
      }
      const core = sph(0.05, 0xfff0a0, [0, 0.2, 0], [1, 1, 1], { glow: 1.1 });
      const light = new THREE.PointLight(0xffc0d8, 0.8, 2, 1.5);
      light.position.set(0, 0.3, 0.05);
      g.add(light);
      g.userData.light = light;
      g.userData.glow = [core.material];
      break;
    }
    case 'pumpkinlamp': {
      const glowM = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const m = sph(0.13, 0xf28a2e, [Math.cos(a) * 0.08, 0.15, Math.sin(a) * 0.08], [0.7, 0.95, 0.7], { rough: 0.5 });
        glowM.push(m.material);
      }
      cyl(0.02, 0.025, 0.09, 0x5a7a2a, [0, 0.31, 0]);
      // 웃는 얼굴 (빛나는 눈과 입)
      for (const x of [-0.06, 0.06]) { const e = mesh(new THREE.ConeGeometry(0.03, 0.05, 3), 0xffe066, [x, 0.2, 0.2], { glow: 1.4 }); e.rotation.x = Math.PI / 2; }
      const mouth = box(0.13, 0.025, 0.02, 0xffe066, [0, 0.12, 0.205], { glow: 1.4 });
      const light = new THREE.PointLight(0xffa64a, 0.8, 2, 1.5);
      light.position.set(0, 0.18, 0.3);
      g.add(light);
      g.userData.light = light;
      g.userData.glow = [mouth.material];
      break;
    }
    case 'chime': {
      cyl(0.012, 0.012, 0.42, WOOD_D, [0, 0.14, 0.12]).rotation.z = Math.PI / 2;
      const drops = [];
      [-0.15, -0.05, 0.05, 0.15].forEach((x, i) => {
        const hang = new THREE.Group();
        hang.position.set(x, 0.14, 0.12);
        g.add(hang);
        const len = 0.1 + (i % 2) * 0.07;
        cyl(0.003, 0.003, len, 0xdddddd, [0, -len / 2, 0], {}, hang);
        const d = sph(0.035, 0x8fd0ff, [0, -len - 0.03, 0], [1, 1.3, 1], { opacity: 0.85, glow: 0.3, rough: 0.1 }, hang);
        mesh(new THREE.ConeGeometry(0.03, 0.05, 12), 0x8fd0ff, [0, -len + 0.01, 0], { opacity: 0.85, rough: 0.1 }, hang);
        drops.push(hang);
        void d;
      });
      ticks.push((t) => drops.forEach((h, i) => { h.rotation.z = Math.sin(t * 2.2 + i * 1.3) * 0.15; }));
      break;
    }
    case 'friendframe': {
      box(0.56, 0.44, 0.04, 0xff9ac0, [0, 0, 0.02]);
      box(0.5, 0.38, 0.02, 0xfff6e8, [0, 0, 0.04]);
      // 두 짝꿍 사진 (동글동글 두 얼굴)
      for (const [x, c] of [[-0.1, 0x8fd16a], [0.1, 0x7cc8ff]]) {
        sph(0.08, c, [x, -0.03, 0.06], [1, 1, 0.4]);
        for (const ex of [-0.025, 0.025]) sph(0.01, 0x222222, [x + ex, -0.02, 0.09]);
      }
      const heart = new THREE.Group();
      heart.position.set(0, 0.11, 0.07);
      for (const sx of [-1, 1]) sph(0.03, 0xff5c8a, [sx * 0.022, 0, 0], [1, 1, 0.5], { glow: 0.4 }, heart);
      const tip = mesh(new THREE.ConeGeometry(0.04, 0.05, 4), 0xff5c8a, [0, -0.03, 0], { glow: 0.4 }, heart);
      tip.rotation.z = Math.PI;
      g.add(heart);
      ticks.push((t) => { const k = 1 + Math.sin(t * 3) * 0.08; heart.scale.setScalar(k); });
      break;
    }
    case 'snowman': {
      sph(0.17, 0xffffff, [0, 0.16, 0], [1, 0.95, 1], { rough: 0.9 });
      sph(0.12, 0xffffff, [0, 0.4, 0], [1, 1, 1], { rough: 0.9 });
      for (const x of [-0.04, 0.04]) sph(0.014, 0x222222, [x, 0.43, 0.11]);
      const nose = mesh(new THREE.ConeGeometry(0.018, 0.08, 10), 0xff8a3d, [0, 0.4, 0.15]);
      nose.rotation.x = Math.PI / 2;
      mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 24), 0xe8534a, [0, 0.31, 0]).rotation.x = Math.PI / 2;
      cyl(0.09, 0.09, 0.015, 0x333344, [0, 0.51, 0]);
      cyl(0.06, 0.06, 0.1, 0x333344, [0, 0.57, 0]);
      for (const sx of [-1, 1]) { const arm = cyl(0.008, 0.008, 0.18, WOOD_D, [sx * 0.2, 0.42, 0]); arm.rotation.z = sx * 1.0; }
      break;
    }
    default:
      box(0.3, 0.3, 0.3, 0xcccccc, [0, 0.15, 0]);
  }
  g.userData.tick = (t) => ticks.forEach(f => f(t));
  return g;
}

// ---------- 방 ----------

const WALLS = {
  cream: { base: '#f6e3c8', draw(x, w, h) { x.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < w; i += 46) x.fillRect(i, 0, 14, h); } },
  mint: { base: '#cdeedd', draw(x, w, h) { x.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < w; i += 40) for (let j = 0; j < h; j += 40) { x.beginPath(); x.arc(i + ((j / 40) % 2) * 20 + 10, j + 10, 6, 0, Math.PI * 2); x.fill(); } } },
  pink: {
    base: '#ffdfe6', draw(x, w, h) {
      for (let i = 0; i < w; i += 64) for (let j = 0; j < h; j += 64) {
        const cx = i + ((j / 64) % 2) * 32 + 20, cy = j + 22;
        x.fillStyle = 'rgba(255,143,176,.45)';
        for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 5, 0, Math.PI * 2); x.fill(); }
        x.fillStyle = 'rgba(255,210,63,.7)'; x.beginPath(); x.arc(cx, cy, 4, 0, Math.PI * 2); x.fill();
      }
    },
  },
  night: {
    base: '#2b3a6b', draw(x, w, h) {
      let s = 7;
      const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,244,200,${0.4 + r() * 0.6})`; x.beginPath(); x.arc(r() * w, r() * h, 0.8 + r() * 2.2, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(w * 0.8, h * 0.22, 22, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#2b3a6b'; x.beginPath(); x.arc(w * 0.8 + 10, h * 0.22 - 6, 20, 0, Math.PI * 2); x.fill();
    },
  },
};

const FLOORS = {
  wood: { draw(x, w, h) { x.fillStyle = '#c99a6b'; x.fillRect(0, 0, w, h); for (let j = 0; j < h; j += 32) { x.fillStyle = (j / 32) % 2 ? '#c08f60' : '#d1a476'; x.fillRect(0, j, w, 30); x.fillStyle = 'rgba(120,80,40,.35)'; x.fillRect(((j * 37) % w), j, 3, 30); x.fillRect(((j * 37 + w / 2) % w), j, 3, 30); } } },
  grass: { draw(x, w, h) { x.fillStyle = '#9fd47a'; x.fillRect(0, 0, w, h); let s = 3; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 500; i++) { x.fillStyle = r() > 0.5 ? '#8cc66a' : '#b2e08e'; x.fillRect(r() * w, r() * h, 3, 7); } for (let i = 0; i < 14; i++) { x.fillStyle = r() > 0.5 ? '#fff' : '#ffd23f'; x.beginPath(); x.arc(r() * w, r() * h, 3, 0, Math.PI * 2); x.fill(); } } },
  tile: { draw(x, w, h) { x.fillStyle = '#d8d4c8'; x.fillRect(0, 0, w, h); let s = 5; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let j = 0; j < h; j += 32) for (let i = 0; i < w; i += 32) { const c = 200 + Math.floor(r() * 40); x.fillStyle = `rgb(${c},${c - 6},${c - 18})`; x.beginPath(); x.ellipse(i + 16, j + 16, 13, 12, r(), 0, Math.PI * 2); x.fill(); } } },
};

function canvasTex(THREE, w, h, fn, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}

export const ROOM = { w: 3.4, d: 2.6, h: 2.2 };

/** 벽 3면 + 바닥으로 된 열린 상자 방 */
export function buildRoom(THREE, { wall = 'cream', floor = 'wood' } = {}) {
  const g = new THREE.Group();
  const { w, d, h } = ROOM;
  const W = WALLS[wall] || WALLS.cream;
  const F = FLOORS[floor] || FLOORS.wood;
  const wallTex = canvasTex(THREE, 256, 256, (x, cw, ch) => { x.fillStyle = W.base; x.fillRect(0, 0, cw, ch); W.draw(x, cw, ch); }, [2, 1.3]);
  const sideTex = wallTex.clone();
  sideTex.repeat.set(1.5, 1.3);
  sideTex.needsUpdate = true;
  const floorTex = canvasTex(THREE, 256, 256, F.draw, [2, 1.5]);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
  const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });

  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  fl.rotation.x = -Math.PI / 2;
  g.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  back.position.set(0, h / 2, -d / 2);
  g.add(back);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), sideMat);
    side.position.set(s * w / 2, h / 2, 0);
    side.rotation.y = -s * Math.PI / 2;
    g.add(side);
  }
  // 걸레받이와 바닥 테두리
  const trim = new THREE.MeshStandardMaterial({ color: wall === 'night' ? 0x1d2850 : 0xa8784d, roughness: 0.8 });
  const bb = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.03), trim);
  bb.position.set(0, 0.05, -d / 2 + 0.015);
  g.add(bb);
  for (const s of [-1, 1]) {
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, d), trim);
    sb.position.set(s * (w / 2 - 0.015), 0.05, 0);
    g.add(sb);
  }
  const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x8f5a32, roughness: 0.8 }));
  edge.position.set(0, -0.06, d / 2 - 0.04);
  g.add(edge);
  g.userData.dispose = () => { wallTex.dispose(); sideTex.dispose(); floorTex.dispose(); };
  return g;
}
