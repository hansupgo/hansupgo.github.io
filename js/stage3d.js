// 3D 무대: 잡기 화면과 도감 상세에서 캐릭터를 입체로 보여 줍니다.
// - 기본: 카메라 화면 위에 3D 캐릭터를 띄우고, 휴대폰 자이로로 그 자리에 고정 (간이 AR)
// - 진짜 AR: WebXR(ARCore)을 지원하면 실제 바닥을 인식해 그 위에 세움
// three.js를 불러오지 못하면 null을 돌려주고, 게임은 2D 그림으로 동작합니다.

import { buildModel as buildRaw } from './model3d.js';
import { soften, applyFace, flashExpression, setBaseExpression, pixelRatioFor, gfxLevel } from './charfx.js';
import { createParticles, ambientFor, ambientPos, makeFood, makeToyBall, makeGlow, makeEvolveFx, flashWhite, trickFor, trickPose } from './fx3d.js';

// 캐릭터 = 마을풍 기본 모델 (부드러운 무광 재질, 외곽선 없음)
function buildModel(T, sp) { return buildRaw(T, sp); }

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
let THREE = null;
let loading = null;

export function loadThree() {
  if (THREE) return Promise.resolve(THREE);
  if (!loading) {
    loading = import(THREE_URL)
      .then(m => { THREE = m; return m; })
      .catch(e => { console.warn('3D를 불러오지 못했어요', e); loading = null; return null; });
  }
  return loading;
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function makeRenderer(canvasParent) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(pixelRatioFor());
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.className = 'stage3d-canvas';
  canvasParent.appendChild(renderer.domElement);
  renderer.quality = autoQuality(renderer);
  return renderer;
}

/** 폰이 버거워하면(평균 30fps 미만) 화질을 한 단계 낮춰 부드럽게 */
function autoQuality(renderer) {
  let n = 0;
  let sum = 0;
  let done = false;
  return (dt) => {
    if (done || dt <= 0) return;
    if (gfxLevel() !== 'auto') { done = true; return; } // 직접 고른 화질은 그대로
    n++;
    if (n < 8) return; // 처음 몇 프레임은 불러오느라 느림
    sum += dt;
    if (n < 70 && sum < 2) return; // 70프레임 또는 2초 지켜본 뒤 판단
    done = true;
    if (sum / (n - 8) > 1 / 30 && renderer.getPixelRatio() > 1) {
      renderer.setPixelRatio(1);
      console.info('3D 화질을 낮춰 부드럽게 했어요');
    }
  };
}

function addLights(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x7a9a6a, 1.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-1.5, 3, 2.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 0.6);
  rim.position.set(2, 1.5, -2);
  scene.add(rim);
  return { hemi, key, rim };
}

function blobShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, 'rgba(0,0,0,0.45)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.002;
  return m;
}

function disposeTree(obj) {
  obj.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map?.dispose(); m.dispose(); });
  });
}

// ---------- 공통 애니메이션 ----------

function animateIdle(model, t, extra = {}) {
  const u = model.userData;
  const body = model.children[0];
  const br = Math.sin(t * 2.4);
  body.scale.set(1 - 0.015 * br, 1 + 0.03 * br, 1 - 0.015 * br);
  // 눈 깜빡임 (3.6초마다)
  const blink = (t % 3.6) < 0.12 ? 0.12 : 1;
  for (const e of u.eyes) e.scale.y = blink;
  for (const w of u.wings) w.obj.rotation[w.axis] = (w.base ?? (w.base = w.obj.rotation[w.axis])) + w.amp * Math.sin(t * w.speed);
  const pep = extra.energy ?? 1; // 신나면 꼬리·날개가 더 크게
  for (const tl of u.tails) tl.obj.rotation[tl.axis] = (tl.base ?? (tl.base = tl.obj.rotation[tl.axis])) + tl.amp * pep * Math.sin(t * tl.speed * (0.7 + 0.3 * pep));
  if (!extra.noLook) model.rotation.y = 0.35 * Math.sin(t * 0.55) + 0.12 * Math.sin(t * 1.3);
  applyFace(model, t);
}

/** 통통 점프: 웅크렸다 → 늘어나며 뜀 → 착지하며 찌그러짐. { y, sy } (sy: 세로 배율) */
function hopCurve(st, height = 0.28) {
  if (st < 0.1) return { y: 0, sy: 1 - 0.18 * (st / 0.1) };
  if (st < 0.5) { const p = (st - 0.1) / 0.4; return { y: Math.sin(p * Math.PI) * height, sy: 1 + 0.14 * Math.cos(p * Math.PI) }; }
  if (st < 0.64) return { y: 0, sy: 1 - 0.16 * Math.sin(((st - 0.5) / 0.14) * Math.PI) };
  return { y: 0, sy: 1, done: true };
}

/** 부피를 지키며 세로로 늘이고 줄이기 */
function squash(obj, s, sy) {
  const sx = s * (1 + (1 - sy) * 0.5);
  obj.scale.set(sx, s * sy, sx);
}

// ---------- 잡기 화면 무대 ----------

export async function createStage(container) {
  if (!webglOk() || !(await loadThree())) return null;
  const renderer = makeRenderer(container);
  const scene = new THREE.Scene();
  const lights = addLights(scene);
  let backdrop = null;      // 장소별 3D 배경 (공원·연못·단지·학교)
  let backdropWanted = true;
  let backdropSeq = 0;
  let todLight = 'day';
  // 배경이 보일 땐 시간대 조명, 카메라(AR)일 땐 보통 조명
  function applyLights() {
    const tod = backdropWanted && backdrop ? todLight : 'day';
    lights.hemi.intensity = tod === 'night' ? 0.75 : tod === 'dusk' ? 1.2 : 1.5;
    lights.key.intensity = tod === 'night' ? 0.8 : 1.6;
    lights.key.color.set(tod === 'dusk' || tod === 'dawn' ? 0xffd2a0 : tod === 'night' ? 0xbfcfff : 0xffffff);
  }
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
  const BASE_PITCH = -0.13;
  camera.rotation.set(BASE_PITCH, 0, 0);
  const baseQ = camera.quaternion.clone();

  const anchor = new THREE.Group(); // 캐릭터가 서 있는 자리
  const HOME = [0, -0.95, -3.4]; // 카메라 앞 약 3.4m, 바닥 높이
  anchor.position.set(...HOME);
  scene.add(anchor);
  const shadow = blobShadow();
  anchor.add(shadow);

  let model = null;
  let mode = 'ball';
  let state = { name: 'idle', t0: 0 };
  let fly = null;       // 곤충 비행 오프셋
  let clock = 0;
  let last = performance.now();

  // 크기 맞추기
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    if (renderer.xr.isPresenting) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ---------- 자이로로 자리 고정 (간이 AR) ----------
  const zee = new THREE.Vector3(0, 0, 1);
  const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  const euler = new THREE.Euler();
  const q0 = new THREE.Quaternion();
  let gyro = { on: false, ref: null, target: new THREE.Quaternion() };
  function deviceQuat(e) {
    const d = THREE.MathUtils.DEG2RAD;
    const orient = (screen.orientation?.angle ?? window.orientation ?? 0) * d;
    euler.set(e.beta * d, e.alpha * d, -e.gamma * d, 'YXZ');
    const q = new THREE.Quaternion().setFromEuler(euler);
    q.multiply(q1);
    q.multiply(q0.setFromAxisAngle(zee, -orient));
    return q;
  }
  function onOrient(e) {
    if (e.alpha == null) return;
    const q = deviceQuat(e);
    if (!gyro.ref) gyro.ref = q.clone().invert();
    gyro.target.copy(baseQ).multiply(gyro.ref.clone().multiply(q));
    gyro.on = true;
  }
  async function enableGyro() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') return false;
      }
    } catch { return false; }
    gyro.ref = null;
    window.addEventListener('deviceorientation', onOrient);
    return true;
  }
  function disableGyro() {
    window.removeEventListener('deviceorientation', onOrient);
    gyro = { on: false, ref: null, target: new THREE.Quaternion() };
    camera.quaternion.copy(baseQ);
  }

  // ---------- 진짜 AR (WebXR) ----------
  let xr = null; // { session, hitSource, placed, onEnd }
  async function xrSupported() {
    try { return Boolean(navigator.xr) && await navigator.xr.isSessionSupported('immersive-ar'); } catch { return false; }
  }
  async function startXR(overlayRoot, { onPlaced, onEnd } = {}) {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: overlayRoot },
    });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    await renderer.xr.setSession(session);
    const viewer = await session.requestReferenceSpace('viewer');
    const hitSource = await session.requestHitTestSource({ space: viewer });
    xr = { session, hitSource, placed: false, onPlaced, onEnd };
    anchor.visible = false;
    anchor.scale.setScalar(0.4); // 실제 크기 약 40cm
    session.addEventListener('end', () => {
      const cb = xr?.onEnd;
      xr = null;
      renderer.xr.enabled = false;
      anchor.visible = true;
      anchor.scale.setScalar(1);
      anchor.position.set(...HOME);
      anchor.rotation.set(0, 0, 0);
      resize();
      cb?.();
    });
  }
  function endXR() { xr?.session.end().catch(() => {}); }

  const m4 = new THREE.Matrix4();
  function xrPlace(frame) {
    if (!xr || xr.placed || !frame) return;
    const hits = frame.getHitTestResults(xr.hitSource);
    if (!hits.length) return;
    const pose = hits[0].getPose(renderer.xr.getReferenceSpace());
    if (!pose) return;
    m4.fromArray(pose.transform.matrix);
    anchor.position.setFromMatrixPosition(m4);
    const cam = renderer.xr.getCamera();
    const cp = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);
    anchor.rotation.set(0, Math.atan2(cp.x - anchor.position.x, cp.z - anchor.position.z), 0);
    anchor.visible = true;
    xr.placed = true;
    xr.onPlaced?.();
  }

  // ---------- 상태 애니메이션 ----------
  const encFx = createParticles(THREE, scene, 100);
  let encSp = null;
  let encAmbT = 0;
  function play(name) {
    state = { name, t0: clock };
    if (!model) return;
    if (name === 'appear' || name === 'startle') flashExpression(model, 'surprised', clock);
    if (name === 'hop' || name === 'happy') flashExpression(model, 'happy', clock);
  }

  function update(dt) {
    clock += dt;
    if (!model) return;
    const t = clock;
    const st = clock - state.t0;
    const u = model.userData;
    animateIdle(model, t, { noLook: Boolean(fly) });
    let y = 0;
    let s = 1;
    let x = 0;
    let rotY = null;
    let sy = 1;
    switch (state.name) {
      case 'appear': {
        const p = Math.min(1, st / 0.4) - 1; s = 1 + 2.70158 * p ** 3 + 1.70158 * p ** 2;
        if (st > 0.35) sy = 1 - 0.12 * Math.sin(Math.min(1, (st - 0.35) / 0.2) * Math.PI); // 내려앉으며 말랑
        if (st > 0.6) play('idle');
        break;
      }
      case 'hop': { const h = hopCurve(st, 0.32); y = h.y; sy = h.sy; if (h.done) play('idle'); break; }
      case 'happy': y = Math.abs(Math.sin(st * 6)) * 0.25; sy = 1 - 0.1 * Math.cos(st * 12); rotY = st * 5; break;
      case 'startle': x = Math.sin(st * 40) * 0.05 * Math.max(0, 1 - st / 0.4); if (st > 0.45) play('idle'); break;
      case 'sucked': s = Math.max(0.001, 1 - st / 0.4); rotY = st * 12; y = st * 0.5; break;
      case 'netted': s = Math.max(0.55, 1 - st); break;
      case 'leave': rotY = Math.PI; x = st * 1.8; s = Math.max(0.01, 1 - st * 0.5); break;
      default:
    }
    // 속성별 주변 입자
    const amb = encSp && ambientFor(encSp);
    if (amb && state.name !== 'sucked' && state.name !== 'leave') {
      encAmbT -= dt;
      if (encAmbT <= 0) {
        encAmbT = amb.every * (0.7 + Math.random() * 0.6);
        model.updateMatrixWorld();
        encFx.spawn(amb.kind, ambientPos(THREE, model, amb.from), { vel: amb.vel, size: amb.size * 1.3, life: amb.life, drift: amb.drift, jitter: 0.15 });
      }
    }
    encFx.update(dt);
    if (backdrop) {
      backdrop.visible = backdropWanted && !renderer.xr.isPresenting; // 진짜 AR 중엔 실제 바닥만
      if (backdrop.visible) backdrop.userData.tick(dt, clock);
    }
    if (u.flyer && !fly) y += 0.35 + Math.sin(t * 3) * 0.05;
    if (u.swimmer) { x += -0.4 + Math.sin(t * 0.6) * 0.3; rotY = (rotY ?? 0) + (Math.cos(t * 0.6) > 0 ? 0 : Math.PI); y += 0.35; s *= 0.62; }
    if (fly) { x += fly.x; y += fly.y; rotY = (rotY ?? 0) + fly.dir; }
    model.position.set(x, y, 0);
    squash(model, s, sy);
    if (rotY !== null) model.rotation.y = rotY;
    shadow.scale.setScalar(Math.max(0.2, (1 - Math.min(y, 1) * 0.6) * s));
    shadow.visible = mode !== 'fish';
  }

  const loop = (now, frame) => {
    const tnow = performance.now();
    const dt = Math.min(0.05, (tnow - last) / 1000);
    renderer.quality(dt);
    last = tnow;
    if (xr) xrPlace(frame);
    else if (gyro.on) camera.quaternion.slerp(gyro.target, 0.25);
    update(dt);
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(loop);

  return {
    setCreature(sp, m) {
      if (model) { anchor.remove(model); disposeTree(model); }
      encSp = sp;
      encFx.clear();
      mode = m;
      fly = null;
      resize();
      model = buildModel(THREE, sp);
      anchor.add(model);
      if (model) {
        play('appear');
        last = performance.now();
        renderer.setAnimationLoop(loop);
      } else renderer.setAnimationLoop(null); // 잡기 화면을 이미 닫았으면 그리기 멈춤
    },
    clear() {
      if (model) { anchor.remove(model); disposeTree(model); model = null; }
      encFx.clear();
      if (!renderer.xr.isPresenting) renderer.setAnimationLoop(null); // 안 보일 땐 그리지 않음 (배터리)
    },
    play,
    // 곤충 비행: phase에 따라 좌우·위아래로 날아다님
    fly(phase) {
      const nx = Math.sin(phase * 1.1) * Math.cos(phase * 0.37);
      const ny = Math.sin(phase * 1.7 + 1);
      const vx = Math.cos(phase * 1.1) * Math.cos(phase * 0.37);
      fly = { x: nx * 1.0, y: 0.55 + ny * 0.32, dir: vx > 0 ? 0.6 : -0.6 };
    },
    // 캐릭터 가운데의 화면 좌표(px)와 대략의 반지름
    screenPos() {
      if (!model || !anchor.visible) return null;
      const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
      const c = new THREE.Vector3(0, 0.45, 0);
      const top = new THREE.Vector3(0, 0.95, 0);
      model.localToWorld(c);
      model.localToWorld(top);
      const rect = renderer.domElement.getBoundingClientRect();
      const toPx = (v) => { v.project(cam); return { x: (v.x + 1) / 2 * rect.width, y: (1 - v.y) / 2 * rect.height }; };
      const pc = toPx(c);
      const pt = toPx(top);
      return { x: pc.x, y: pc.y, r: Math.max(30, Math.hypot(pt.x - pc.x, pt.y - pc.y) * 0.95) };
    },
    /** 장소별 배경: kind 'park'|'pond'|'town'|'school', opts { tod, weather } */
    async setBackdrop(kind, opts = {}) {
      const my = ++backdropSeq;
      const mod = kind ? await import('./scene3d.js') : null;
      if (my !== backdropSeq) return; // 불러오는 사이 다른 배경을 요청함
      if (backdrop) { scene.remove(backdrop); backdrop.userData.dispose?.(); disposeTree(backdrop); backdrop = null; }
      todLight = 'day';
      applyLights();
      if (!kind) return;
      backdrop = soften(THREE, mod.buildBackdrop(THREE, kind, opts), { lift: opts.tod === 'night' ? 0.04 : 0.1 }); // 마을풍: 선 없이 부드럽게 (밤엔 덜 밝게)
      backdrop.visible = backdropWanted && !renderer.xr.isPresenting;
      scene.add(backdrop);
      // 밤·노을엔 캐릭터 조명도 맞춤
      todLight = opts.tod || 'day';
      applyLights();
    },
    /** AR 카메라를 켜면 배경을 숨김 */
    showBackdrop(on) {
      backdropWanted = on;
      if (backdrop) backdrop.visible = on && !renderer.xr.isPresenting;
      applyLights();
    },
    /** 순간 효과: 'hit' 맞음, 'catch' 잡음, 'flee' 도망, 'love' 하트, 'splash' 물보라 */
    burst(kind) {
      if (!model) return;
      model.updateMatrixWorld();
      const at = (y) => new THREE.Vector3(0, y, 0.2).applyMatrix4(model.matrixWorld);
      if (kind === 'hit') encFx.spawn('star', at(0.6), { count: 9, vel: { x: 0, y: 0.9, z: 0 }, jitter: 2.2, gravity: 1.5, size: 0.16, life: 0.8 });
      if (kind === 'catch') {
        for (const [k, n] of [['star', 14], ['heart', 8], ['leaf', 8], ['spark', 8]]) {
          encFx.spawn(k, at(0.5), { count: n, vel: { x: 0, y: 2.2, z: 0.3 }, jitter: 3.2, gravity: 3.2, size: 0.17, life: 1.6, drift: 0.4 });
        }
      }
      if (kind === 'flee') encFx.spawn('dust', at(0.05), { count: 12, vel: { x: 0, y: 0.25, z: 0 }, jitter: 1.4, size: 0.2, grow: 1.2, life: 0.9 });
      if (kind === 'love') encFx.spawn('heart', at(0.9), { count: 4, vel: { x: 0, y: 0.7, z: 0 }, jitter: 0.6, size: 0.15, life: 1.1 });
      if (kind === 'splash') encFx.spawn('bubble', at(0.3), { count: 10, vel: { x: 0, y: 1.2, z: 0 }, jitter: 1.6, gravity: 2, size: 0.12, life: 1 });
    },
    enableGyro,
    disableGyro,
    xrSupported,
    startXR,
    endXR,
    get inXR() { return Boolean(xr); },
    get xrPlaced() { return Boolean(xr?.placed); },
  };
}

// ---------- 도감 상세: 손가락으로 돌려 보는 3D ----------

export async function createViewer(el, sp) {
  if (!webglOk() || !(await loadThree())) return null;
  const renderer = makeRenderer(el);
  const scene = new THREE.Scene();
  addLights(scene);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 20);
  camera.position.set(0, 0.75, 3.1);
  camera.lookAt(0, 0.5, 0);
  const model = buildModel(THREE, sp);
  scene.add(model);
  const shadow = blobShadow();
  scene.add(shadow);
  const w = el.clientWidth || 200;
  const h = el.clientHeight || 200;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  let spin = 0;
  let vel = 0.6;
  let drag = null;
  const down = (e) => { drag = { x: e.clientX, t: performance.now() }; el.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    spin += dx * 0.012;
    vel = dx * 0.6;
    drag.x = e.clientX;
  };
  const up = () => { drag = null; };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  let last = performance.now();
  let t = 0;
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    renderer.quality(dt);
    last = now;
    t += dt;
    if (!drag) { vel += (0.6 - vel) * dt * 2; spin += vel * dt; }
    animateIdle(model, t, { noLook: true });
    model.rotation.y = spin;
    if (model.userData.flyer) model.position.y = 0.15 + Math.sin(t * 3) * 0.04;
    renderer.render(scene, camera);
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      disposeTree(scene);
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    },
  };
}

// ---------- 짝꿍 방: 쓰다듬고, 밥 먹고, 자고, 자라는 3D ----------

// 자란 단계에 따라 붙는 장식 (어린이: 리본 배지, 어른: 별 왕관 + 반짝이)
function addAccessories(model, stage) {
  const old = model.getObjectByName('acc');
  if (old) { model.remove(old); disposeTree(old); }
  // 진화 단계마다 옷이 바뀜 (동물 친구들)
  const of = model.userData.outfit;
  if (of) {
    const [shirt, trim] = of.looks[Math.min(stage, of.looks.length - 1)];
    for (const [m, c] of [[of.shirt, shirt], [of.trim, trim]]) {
      m.color.set(c);
      m.emissive.set(c);
      if (m.userData.baseEmissive != null) m.userData.baseEmissive = m.color.getHex(); // 진화 반짝임이 끝나도 새 옷 색으로
    }
  }
  if (stage < 1) return;
  const acc = new THREE.Group();
  acc.name = 'acc';
  // 모델 자신의 좌표로 크기를 재기 위해 잠시 기본 자세로 돌려 둠
  const keep = { s: model.scale.clone(), p: model.position.clone(), r: model.rotation.clone() };
  model.scale.setScalar(1); model.position.set(0, 0, 0); model.rotation.set(0, 0, 0);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model.children[0]);
  model.scale.copy(keep.s); model.position.copy(keep.p); model.rotation.copy(keep.r);
  const top = box.max.y;
  const front = box.max.z;
  const mat = (c, glow = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: glow ? 0.4 : 0, emissive: glow ? c : 0x000000, emissiveIntensity: glow });
  // 리본 배지 (가슴 앞)
  const badge = new THREE.Group();
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(0xff6b8b));
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 16), mat(0xff8fa3));
    wing.rotation.z = sx * Math.PI / 2;
    wing.position.x = sx * 0.07;
    badge.add(wing);
  }
  badge.add(knot);
  const chest = model.userData.chest;
  badge.position.set(0, chest ? chest.y : top * 0.3, chest ? chest.z + 0.02 : front - 0.02);
  acc.add(badge);
  if (stage >= 2) {
    const crown = new THREE.Group();
    crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20, 1, true), mat(0xffc93c, 0.3)));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 10), mat(0xffc93c, 0.3));
      tip.position.set(Math.sin(a) * 0.12, 0.07, Math.cos(a) * 0.12);
      crown.add(tip);
    }
    crown.position.set(0.05, top + 0.04, 0);
    crown.rotation.z = -0.15;
    acc.add(crown);
    const sparkles = new THREE.Group();
    sparkles.name = 'sparkles';
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), mat(0xfff2a8, 1));
      s.userData.a = (i / 6) * Math.PI * 2;
      sparkles.add(s);
    }
    acc.add(sparkles);
  }
  model.add(acc);
}

const SCALE_BY_STAGE = [0.72, 0.88, 1.0];

export async function createBuddyView(el, sp, {
  stage = 0, onPet, onSlot, onPlot, room = null, slots = [], night = false, zzzEl = null,
  garden = null, place: startPlace = 'room', weatherKind = 'clear', tod = night ? 'night' : 'day',
  guest = null, // 놀러 온 짝꿍 { sp, stage }
} = {}) {
  if (!webglOk() || !(await loadThree())) return null;
  const renderer = makeRenderer(el);
  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x8a6a4a, 1.4);
  const key = new THREE.DirectionalLight(0xfff1dc, 1.4);
  key.position.set(-1.2, 3, 2.5);
  // 진짜 그림자 (화질 '낮음'이 아니면)
  const shadows = gfxLevel() !== 'low';
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = true;
    const sz = gfxLevel() === 'high' ? 2048 : 1024;
    key.shadow.mapSize.set(sz, sz);
    Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -2.4, near: 0.5, far: 9 });
    key.shadow.bias = -0.0015;
    key.shadow.radius = 4;
  }
  const castAll = (obj, recv = false) => {
    if (!shadows) return;
    obj.traverse(o => { if (o.isMesh && !o.userData.isOutline && !(o.material?.transparent)) { o.castShadow = true; o.receiveShadow = recv; } });
  };
  const warm = new THREE.PointLight(0xffc98a, 0.6, 6, 1.2);
  warm.position.set(0, 1.8, 0.8);
  scene.add(hemi, key, warm);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 30);

  // 짝꿍: holder(위치·방향) > model(몸짓)
  const holder = new THREE.Group();
  scene.add(holder);
  const shadow = blobShadow();
  holder.add(shadow);
  const HOME = { x: 0, z: 0.25 };
  holder.position.set(HOME.x, 0, HOME.z);

  let model = null;
  let stageNow = stage;
  let sleeping = false;
  let editing = false;
  let isNight = tod === 'night';
  let todNow = tod;
  let wxKind = weatherKind;
  let place = room ? startPlace : 'room';
  const roomRoot = new THREE.Group();
  const gardenRoot = new THREE.Group();
  scene.add(roomRoot, gardenRoot);
  let anim = { name: 'idle', t0: 0 };
  let clock = 0;
  let walk = { target: null, wait: 2 };

  // ---------- 방 ----------
  let roomGroup = null;
  let roomKey = '';
  const furn = new Map(); // slotId -> { id, obj, born }
  const markers = new Map(); // slotId -> mesh
  let slotsDef = [];
  let roomMod = null;

  function slotPos(sl) {
    return sl.where === 'wall'
      ? new THREE.Vector3(sl.x, sl.y, -mod().ROOM.d / 2 + 0.01)
      : new THREE.Vector3(sl.x, 0, sl.z);
  }
  const mod = () => roomMod;

  function buildMarkers() {
    for (const sl of slotsDef) {
      const big = sl.where === 'rug';
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(big ? 0.5 : 0.2, big ? 0.58 : 0.27, 40),
        new THREE.MeshBasicMaterial({ color: 0x2fd18a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }),
      );
      const fill = new THREE.Mesh(
        new THREE.CircleGeometry(big ? 0.5 : 0.2, 40),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
      );
      ring.add(fill);
      const p = slotPos(sl);
      ring.position.copy(p);
      if (sl.where === 'wall') ring.position.z += 0.02;
      else { ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; }
      ring.userData.slot = sl.id;
      fill.userData.slot = sl.id;
      ring.visible = false;
      ring.renderOrder = 5;
      roomRoot.add(ring);
      markers.set(sl.id, ring);
    }
  }

  function setRoom(r) {
    if (!r || !roomMod) return;
    const k = `${r.wall}|${r.floor}`;
    if (k !== roomKey) {
      if (roomGroup) { roomRoot.remove(roomGroup); roomGroup.userData.dispose?.(); disposeTree(roomGroup); }
      roomGroup = soften(THREE, roomMod.buildRoom(THREE, r));
      if (shadows) roomGroup.children[0].receiveShadow = true; // 바닥
      roomRoot.add(roomGroup);
      roomKey = k;
    }
    for (const sl of slotsDef) {
      const want = r.slots[sl.id] || null;
      const have = furn.get(sl.id);
      if (have && have.id === want) continue;
      if (have) { roomRoot.remove(have.obj); disposeTree(have.obj); furn.delete(sl.id); }
      if (!want) continue;
      const obj = soften(THREE, roomMod.buildFurniture(THREE, want));
      obj.position.copy(slotPos(sl));
      if (sl.where === 'floor') obj.rotation.y = Math.atan2(-sl.x, 1.4 - sl.z) * 0.6; // 방 가운데 쪽으로 살짝
      obj.traverse(o => { o.userData.slot = sl.id; });
      castAll(obj, true);
      // 램프·등불 둘레 빛 번짐
      if (obj.userData.light) {
        const glow = makeGlow(THREE, 0xffcf8a, 0.95);
        glow.position.copy(obj.userData.light.position);
        obj.add(glow);
        obj.userData.glowSprite = glow;
      } else if (want === 'garland') {
        const glow = makeGlow(THREE, 0xfff0b0, 1.1);
        glow.scale.set(1.1, 0.45, 1);
        glow.position.set(0, -0.02, 0.05);
        obj.add(glow);
        obj.userData.glowSprite = glow;
      }
      roomRoot.add(obj);
      furn.set(sl.id, { id: want, obj, born: clock });
    }
    if (holder.position.y > 0 && ![...furn.values()].some(f => f.id === 'bed')) {
      holder.position.set(HOME.x, 0, HOME.z);
      walk = { target: null, wait: sleeping ? 1e9 : 1 };
    }
    applyNight();
  }

  function applyNight() {
    isNight = todNow === 'night';
    const gloomy = ['rain', 'storm', 'snow', 'cloudy', 'fog'].includes(wxKind);
    const outdoor = place === 'garden';
    const dayLight = { dawn: 1.1, day: 1.4, dusk: 1.05, night: 0.5 }[todNow] ?? 1.4;
    hemi.intensity = dayLight * (outdoor && gloomy ? 0.8 : 1);
    key.intensity = (isNight ? 0.3 : todNow === 'dusk' ? 1.0 : 1.4) * (outdoor && gloomy ? 0.55 : 1);
    key.color.set(todNow === 'dusk' || todNow === 'dawn' ? 0xffc28a : 0xfff1dc);
    warm.intensity = outdoor ? 0 : isNight ? 1.4 : 0.6;
    if (outdoor && gardenMod) {
      scene.background = new THREE.Color(gardenMod.skyColor(todNow, wxKind));
      const gu = gardenGroup.userData;
      gu.sun.visible = !isNight && !gloomy;
      gu.moon.visible = isNight && !['rain', 'storm', 'snow'].includes(wxKind);
    } else {
      scene.background = null;
    }
    for (const { obj } of furn.values()) {
      const u = obj.userData;
      if (u.light) u.light.intensity = isNight ? 2.2 : 0.6;
      if (u.glowSprite) u.glowSprite.material.opacity = isNight ? 0.85 : 0.22;
      u.glowBase = isNight ? 1.6 : 0.8;
      if (u.glow) u.glow.forEach(m => { m.emissiveIntensity = u.glowBase; });
      const rainy = ['rain', 'storm'].includes(wxKind);
      if (u.sky) {
        u.sky.color.set(isNight ? 0x34407a : rainy ? 0x8e9bab : wxKind === 'snow' ? 0xe6eef7 : todNow === 'dusk' ? 0xffb07a : 0xffffff);
        u.sky.emissiveIntensity = isNight ? 0.08 : rainy ? 0.15 : 0.35;
      }
    }
  }

  // ---------- 텃밭 ----------
  let gardenMod = null;
  let gardenGroup = null;
  let particles = null;
  const plants = new Map(); // plotId -> { key, obj, drop, sparkle, born }

  async function initGarden() {
    if (gardenMod) return;
    gardenMod = await import('./garden3d.js');
    gardenGroup = soften(THREE, gardenMod.buildGarden(THREE));
    castAll(gardenGroup, true);
    if (shadows) gardenGroup.children[0].castShadow = false;
    gardenRoot.add(gardenGroup);
    setWeatherFx();
  }

  function setGarden(view) {
    if (!gardenMod || !view) return;
    for (const p of gardenMod.PLOTS) {
      const v = view[p.id];
      const key = v ? `${v.crop}:${v.stage}` : '';
      let cur = plants.get(p.id);
      if (cur && cur.key !== key) { gardenRoot.remove(cur.obj); disposeTree(cur.obj); plants.delete(p.id); cur = null; }
      if (!cur && v) {
        const obj = new THREE.Group();
        obj.position.set(p.x, gardenMod.BED_TOP, p.z);
        const plant = soften(THREE, gardenMod.buildPlant(THREE, v.crop, v.stage));
        castAll(plant);
        obj.add(plant);
        const drop = gardenMod.buildDrop(THREE);
        drop.position.set(0, 0.45, 0);
        obj.add(drop);
        const sparkle = gardenMod.buildSparkle(THREE);
        sparkle.position.set(0, 0.25, 0);
        obj.add(sparkle);
        obj.traverse(o => { o.userData.plot = p.id; });
        gardenRoot.add(obj);
        cur = { key, obj, plant, drop, sparkle, born: clock };
        plants.set(p.id, cur);
      }
      if (cur) {
        cur.drop.visible = Boolean(v?.thirsty);
        cur.sparkle.visible = v?.stage === 3;
      }
      // 물 먹은 흙은 진하게
      const soil = gardenGroup.userData.beds[p.id].userData.soil;
      soil.material.color.set(v && !v.thirsty ? 0x4a3020 : 0x6b4a2f);
    }
  }

  function setWeatherFx() {
    if (particles) { gardenRoot.remove(particles); disposeTree(particles); particles = null; }
    if (gardenMod) {
      particles = gardenMod.buildWeather(THREE, wxKind);
      if (particles) gardenRoot.add(particles);
    }
    applyNight();
  }

  function setPlace(p) {
    place = p;
    roomRoot.visible = p === 'room';
    gardenRoot.visible = p === 'garden';
    walk = { target: null, wait: 0.3 };
    holder.position.set(p === 'garden' ? 0.55 : guest ? 0.4 : HOME.x, 0, p === 'garden' ? 0.3 : HOME.z);
    resize();
    applyNight();
  }

  try {
    if (room) {
      roomMod = await import('./furniture3d.js');
      slotsDef = slots;
      buildMarkers();
      setRoom(room);
    }
    if (garden) {
      await initGarden();
      setGarden(garden);
    }
  } catch (e) {
    console.warn('방/텃밭 3D를 불러오지 못했어요', e);
    disposeTree(scene);
    renderer.dispose();
    renderer.forceContextLoss?.();
    renderer.domElement.remove();
    return null;
  }
  setPlace(place);

  let curSp = sp;
  let evolveT0 = 0;
  function setCreature(species, st) {
    if (model) { holder.remove(model); disposeTree(model); }
    curSp = species;
    model = buildModel(THREE, species);
    castAll(model);
    holder.add(model);
    setStage(st);
  }

  // ---------- 효과 ----------
  const fx = createParticles(THREE, scene);
  const evolveFx = makeEvolveFx(THREE);
  scene.add(evolveFx.obj);
  const flying = []; // 날아오는 밥·공
  let ambT = 0;
  let trick = null;
  let trickWait = 5 + Math.random() * 4;
  const headPos = () => new THREE.Vector3(0, 0.75 * (SCALE_BY_STAGE[stageNow] ?? 1), 0.1).applyMatrix4(holder.matrixWorld);
  const mouthPos = () => new THREE.Vector3(0, 0.38 * (SCALE_BY_STAGE[stageNow] ?? 1), 0.32).applyMatrix4(holder.matrixWorld);
  function throwIn(obj, from, toFn, dur, arc, onHit) {
    obj.position.copy(from);
    scene.add(obj);
    flying.push({ obj, from: from.clone(), toFn, t0: clock, dur, arc, onHit, phase: 'in' });
  }
  function startFood(food) {
    const obj = makeFood(THREE, food);
    const from = camera.position.clone().add(new THREE.Vector3(0.25, -0.9, -1.2));
    throwIn(obj, from, mouthPos, 0.55, 0.5, (f) => {
      scene.remove(f.obj); disposeTree(f.obj);
      fx.spawn('crumb', mouthPos(), { count: 7, vel: { x: 0, y: 0.5, z: 0.2 }, jitter: 0.9, gravity: 2.2, size: 0.05, life: 0.7 });
      fx.spawn('heart', headPos(), { count: 2, vel: { x: 0, y: 0.5, z: 0 }, size: 0.12, life: 1.1 });
      anim = { name: 'eat', t0: clock };
    });
  }
  function startBall() {
    const ball = makeToyBall(THREE);
    const from = holder.position.clone().add(new THREE.Vector3(1.3, 0.9, 0.6));
    throwIn(ball, from, headPos, 0.6, 0.35, (f) => {
      // 머리로 콩! 하고 튕겨 나감
      fx.spawn('star', headPos(), { count: 4, vel: { x: 0, y: 0.6, z: 0 }, jitter: 0.8, size: 0.1, life: 0.7 });
      f.phase = 'out';
      f.vel = new THREE.Vector3(-1.4, 1.6, 0.4);
      f.t0 = clock;
      anim = { name: 'hop', t0: clock };
    });
  }

  function setStage(st) {
    stageNow = st;
    addAccessories(model, st);
  }
  setCreature(sp, stage);

  // 손님 짝꿍 (친구 집에 놀러 갔을 때 내 짝꿍)
  let guestHolder = null;
  let guestModel = null;
  let guestWalk = { target: null, wait: 1 };
  if (guest?.sp) {
    guestHolder = new THREE.Group();
    guestHolder.add(blobShadow());
    guestModel = buildModel(THREE, guest.sp);
    addAccessories(guestModel, guest.stage || 0);
    guestModel.scale.setScalar(SCALE_BY_STAGE[guest.stage || 0] ?? 1);
    guestHolder.add(guestModel);
    guestHolder.position.set(-0.45, 0, 0.3);
    scene.add(guestHolder);
  }

  function resize() {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (room && place === 'garden') {
      // 텃밭은 조금 더 위에서 내려다봐서 짝꿍 뒤 밭도 보이게
      const tanH = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const z = Math.min(6, Math.max(3.4, 0.4 + 1.55 / tanH));
      camera.position.set(0, 1.5 + z * 0.42, z);
      camera.lookAt(0, 0.2, -0.55);
    } else if (room) {
      // 방 양쪽 가구(x=±1.45)가 보이도록 거리 맞추기
      const tanH = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const z = Math.min(6, Math.max(3.4, 0.45 + 1.5 / tanH));
      camera.position.set(0, 0.9 + z * 0.3, z);
      camera.lookAt(0, 0.62, -0.25);
    } else {
      camera.fov = 32;
      camera.position.set(0, 0.85, 3.2);
      camera.lookAt(0, 0.48, 0);
    }
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();

  // 누르기: 꾸미기 중이면 자리 고르기, 아니면 짝꿍 쓰다듬기
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const onDown = (e) => {
    if (!model) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (editing) {
      const targets = [...markers.values(), ...[...furn.values()].map(f => f.obj)];
      const hit = ray.intersectObjects(targets, true)[0];
      if (hit) { onSlot?.(hit.object.userData.slot); return; }
    }
    if (ray.intersectObject(model, true).length) { onPet?.(); return; }
    if (place === 'garden' && gardenGroup) {
      const hit = ray.intersectObjects([gardenGroup, ...[...plants.values()].map(p => p.obj)], true).find(h => h.object.userData.plot);
      if (hit) onPlot?.(hit.object.userData.plot);
    }
  };
  el.addEventListener('pointerdown', onDown);
  // 손가락(마우스) 쪽을 바라보게
  const look = { x: 0, t: -99 };
  const onLook = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    look.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    look.t = clock;
  };
  el.addEventListener('pointermove', onLook);

  // 짝꿍 돌아다니기 (방 가운데 빈 곳만)
  function nextTarget() {
    if (place === 'garden') {
      if (sleeping) return null;
      // 가끔 밭 앞에 가서 들여다봄
      if (gardenMod && Math.random() < 0.35) {
        const p = gardenMod.PLOTS[3 + Math.floor(Math.random() * 3)];
        return { x: p.x + (Math.random() - 0.5) * 0.3, z: p.z + 0.45, y: 0 };
      }
      if (guestHolder) return { x: 0.25 + Math.random() * 1.0, z: 0.15 + Math.random() * 0.35, y: 0 }; // 손님과 나눠 섬
      return { x: (Math.random() - 0.5) * 2.4, z: 0.15 + Math.random() * 0.35, y: 0 };
    }
    if (sleeping) {
      const bedSlot = [...furn.entries()].find(([, f]) => f.id === 'bed');
      if (bedSlot) {
        const f = bedSlot[1].obj;
        const at = f.userData.sleepAt;
        const v = new THREE.Vector3(0, at.y, at.z).applyEuler(f.rotation).add(f.position);
        return { x: v.x, z: v.z, y: at.y, bed: true };
      }
      return null;
    }
    if (guestHolder) return { x: 0.15 + Math.random() * 0.5, z: -0.2 + Math.random() * 0.8, y: 0 }; // 주인은 오른쪽
    return { x: (Math.random() - 0.5) * 1.0, z: -0.25 + Math.random() * 0.95, y: 0 };
  }

  const SCALE = SCALE_BY_STAGE;
  let last = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    renderer.quality(dt);
    last = now;
    clock += dt;
    if (!model) return;
    const st = clock - anim.t0;
    const busy = anim.name !== 'idle';
    let walking = false;

    if (room && !busy) {
      if (walk.target) {
        const dx = walk.target.x - holder.position.x;
        const dz = walk.target.z - holder.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.03) {
          holder.position.y = walk.target.y || 0;
          walk = { target: null, wait: sleeping ? 1e9 : 2.5 + Math.random() * 4, at: walk.target };
          holder.rotation.y = 0;
        } else {
          const step = Math.min(d, dt * (walk.target.bed ? 0.6 : 0.38));
          holder.position.x += (dx / d) * step;
          holder.position.z += (dz / d) * step;
          holder.rotation.y = Math.atan2(dx, dz);
          holder.position.y = walk.target.bed ? Math.min(walk.target.y, holder.position.y + dt) : 0;
          walking = true;
        }
      } else if ((walk.wait -= dt) <= 0) {
        walk.target = nextTarget();
        if (walk.target && walk.at?.bed) holder.position.y = 0; // 침대에서 내려옴
        if (!walk.target) walk.wait = 3;
      }
    }

    // 재롱: 가만히 있을 때 가끔
    let tp = null;
    if (!walking && !sleeping && !busy && !editing) {
      if (trick) {
        tp = trickPose(trick.name, clock - trick.t0);
        if (tp.done) { trick = null; tp = null; trickWait = 6 + Math.random() * 6; }
      } else if ((trickWait -= dt) <= 0) {
        trick = { name: trickFor(curSp), t0: clock };
        flashExpression(model, 'happy', clock);
      }
    } else if (trick) { trick = null; }
    const looking = !walking && !sleeping && !tp && clock - look.t < 2.5;
    animateIdle(model, clock, { noLook: sleeping || walking || looking, energy: walking ? 1.6 : anim.name !== 'idle' ? 1.8 : 1 });
    let y = model.userData.flyer ? 0.12 + Math.sin(clock * 3) * 0.04 : 0;
    let sy = 1;
    model.rotation.z = 0;
    if (walking) {
      // 뒤뚱뒤뚱 걷기: 좌우로 기우뚱 + 발 디딜 때 살짝 눌림
      y += Math.abs(Math.sin(clock * 9)) * 0.05;
      sy = 1 - 0.05 * Math.cos(clock * 18);
      model.rotation.z = Math.sin(clock * 9) * 0.08;
      model.rotation.y = 0;
    }
    if (looking) model.rotation.y += (look.x * 0.75 - model.rotation.y) * 0.12; // 손가락 쪽 바라보기
    model.rotation.x = 0;
    if (tp) {
      y += tp.y; sy *= tp.sy;
      model.rotation.z += tp.rotZ; model.rotation.x = tp.rotX;
      if (tp.rotY !== null) model.rotation.y = tp.rotY;
    }
    let s = SCALE[stageNow] ?? 1;
    let rotY = sleeping && !walking ? 0.25 : null;
    switch (anim.name) {
      case 'hop': { const h = hopCurve(st, 0.26); y += h.y; sy = h.sy; if (h.done) anim.name = 'idle'; break; }
      case 'eat': s *= 1 + Math.sin(st * 18) * 0.04; sy = 1 - 0.05 * Math.abs(Math.sin(st * 9)); if (st > 1) anim.name = 'idle'; break;
      case 'happy': y += Math.abs(Math.sin(st * 6)) * 0.22; sy = 1 - 0.1 * Math.cos(st * 12); rotY = st * 6; if (st > 1.2) anim.name = 'idle'; break;
      case 'evolve': { const p = Math.min(1, st / 1.6); rotY = p * Math.PI * 4; y += Math.sin(p * Math.PI) * 0.5; sy = 1 + 0.12 * Math.sin(p * Math.PI * 3); if (st > 1.7) anim.name = 'idle'; break; }
      default:
    }
    if (sleeping) {
      for (const e of model.userData.eyes) e.scale.y = 0.1;
      model.children[0].scale.y = 1 + Math.sin(clock * 1.2) * 0.03; // 느린 숨
    }
    model.position.y = y;
    squash(model, s, sy);
    if (rotY !== null) model.rotation.y = rotY;
    const sparkles = model.getObjectByName('sparkles');
    if (sparkles) {
      sparkles.children.forEach((m, i) => {
        const a = m.userData.a + clock * 1.2;
        m.position.set(Math.cos(a) * 0.55, 0.3 + Math.sin(clock * 2 + i) * 0.25, Math.sin(a) * 0.55);
        m.rotation.y = clock * 3;
      });
    }
    shadow.scale.setScalar(s * (1 - Math.min(0.6, y)));
    // 속성별 주변 입자 (불씨, 물방울, 나뭇잎...)
    const amb = ambientFor(curSp);
    if (amb && !sleeping && place) {
      ambT -= dt;
      if (ambT <= 0) {
        ambT = amb.every * (0.7 + Math.random() * 0.6);
        holder.updateMatrixWorld();
        fx.spawn(amb.kind, ambientPos(THREE, model, amb.from), { vel: amb.vel, size: amb.size, life: amb.life, drift: amb.drift, jitter: 0.15 });
      }
    }
    // 날아오는 밥·공
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i];
      const k = (clock - f.t0) / f.dur;
      if (f.phase === 'in') {
        const to = f.toFn();
        const p = Math.min(1, k);
        f.obj.position.lerpVectors(f.from, to, p);
        f.obj.position.y += Math.sin(p * Math.PI) * f.arc;
        f.obj.rotation.x += dt * 8;
        f.obj.rotation.z += dt * 5;
        if (p >= 1) { f.phase = 'hit'; f.onHit(f); }
      } else if (f.phase === 'out') {
        f.vel.y -= 4 * dt;
        f.obj.position.addScaledVector(f.vel, dt);
        f.obj.rotation.x += dt * 10;
        if (clock - f.t0 > 1.2) { scene.remove(f.obj); f.obj.userData.dispose?.(); disposeTree(f.obj); flying.splice(i, 1); }
      } else { flying.splice(i, 1); }
    }
    // 진화 연출: 빛 기둥 + 하얀 실루엣
    if (evolveFx.update(clock)) {
      evolveFx.obj.position.copy(holder.position);
      const k = clock - evolveT0;
      flashWhite(model, k < 1.3 ? Math.sin(Math.min(1, k / 1.3) * Math.PI) * 1.4 : 0);
      if (Math.random() < 0.5) fx.spawn('spark', holder.position.clone().add(new THREE.Vector3(0, 0.4, 0)), { vel: { x: 0, y: 1.1, z: 0 }, jitter: 1.2, spread: 0.6, size: 0.12, life: 1 });
    } else if (evolveT0 > 0) { flashWhite(model, 0); evolveT0 = 0; }
    fx.update(dt);

    if (zzzEl && sleeping) {
      // 쿨쿨 글자가 짝꿍 머리 위를 따라가도록
      const p = new THREE.Vector3(0.15, 0.85 * s, 0).applyMatrix4(holder.matrixWorld).project(camera);
      zzzEl.style.left = `${((p.x + 1) / 2) * 100}%`;
      zzzEl.style.top = `${((1 - p.y) / 2) * 100 - 6}%`;
      zzzEl.style.right = 'auto';
    }

    if (guestHolder) {
      // 손님은 반대쪽에서 천천히 돌아다님
      let gWalking = false;
      if (guestWalk.target) {
        const dx = guestWalk.target.x - guestHolder.position.x;
        const dz = guestWalk.target.z - guestHolder.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.03) guestWalk = { target: null, wait: 2 + Math.random() * 4 };
        else {
          const step = Math.min(d, dt * 0.35);
          guestHolder.position.x += (dx / d) * step;
          guestHolder.position.z += (dz / d) * step;
          guestHolder.rotation.y = Math.atan2(dx, dz);
          gWalking = true;
        }
      } else if ((guestWalk.wait -= dt) <= 0) {
        // 손님은 왼쪽에서 (주인과 겹치지 않게)
        guestWalk.target = place === 'garden'
          ? { x: -1.25 + Math.random() * 1.0, z: 0.15 + Math.random() * 0.35 }
          : { x: -0.65 + Math.random() * 0.5, z: -0.2 + Math.random() * 0.8 };
      }
      animateIdle(guestModel, clock + 1.7, { noLook: gWalking });
      guestModel.position.y = (guestModel.userData.flyer ? 0.12 : 0) + (gWalking ? Math.abs(Math.sin(clock * 9 + 1)) * 0.05 : 0);
      if (gWalking) guestModel.rotation.y = 0;
      else guestHolder.rotation.y *= 0.95; // 서 있을 땐 앞을 봄
    }
    if (place === 'garden') {
      particles?.userData.tick(dt, clock);
      for (const p of plants.values()) {
        const g = Math.min(1, (clock - p.born) / 0.5);
        p.plant.scale.setScalar(0.3 + 0.7 * (1 - (1 - g) ** 3));
        if (p.plant.userData.sway) p.plant.userData.sway.rotation.z = Math.sin(clock * 1.2) * 0.08;
        p.drop.position.y = 0.45 + Math.sin(clock * 3) * 0.04;
        p.sparkle.rotation.y = clock * 1.5;
      }
    }
    for (const f of furn.values()) {
      f.obj.userData.tick?.(clock);
      const p = Math.min(1, (clock - f.born) / 0.45); // 놓을 때 통통
      const k = 1.70158;
      f.obj.scale.setScalar(p >= 1 ? 1 : 1 + (k + 1) * (p - 1) ** 3 + k * (p - 1) ** 2);
    }
    if (editing) {
      const pulse = 1 + Math.sin(clock * 4) * 0.08;
      for (const [id, m] of markers) {
        m.scale.setScalar(pulse);
        m.material.color.set(furn.has(id) ? 0xffc93c : 0x2fd18a);
      }
    }
    renderer.render(scene, camera);
  });

  return {
    setCreature,
    setStage,
    setRoom,
    setSleeping(v) {
      if (v !== sleeping) {
        sleeping = v;
        walk = { target: null, wait: v ? 0.4 : 0.8, at: walk.at };
        if (!v && holder.position.y > 0) { holder.position.y = 0; holder.position.x = HOME.x; holder.position.z = HOME.z; }
      }
    },
    /** 자리의 화면 위치 (0~1) — 시험용 */
    slotScreen(id) {
      const m = markers.get(id);
      if (!m) return null;
      const p = m.getWorldPosition(new THREE.Vector3()).project(camera);
      return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
    },
    setEditing(v) { editing = v; for (const m of markers.values()) m.visible = v; },
    setNight(v) { todNow = v ? 'night' : todNow === 'night' ? 'day' : todNow; applyNight(); },
    setWeather(kind, t) {
      const changed = kind !== wxKind;
      wxKind = kind;
      if (t) todNow = t;
      if (changed) setWeatherFx(); else applyNight();
    },
    async setPlace(p, gardenView) {
      if (p === 'garden') { await initGarden(); setGarden(gardenView); }
      setPlace(p);
    },
    setGarden,
    /** 밭의 화면 위치 (0~1) — 시험용 */
    plotScreen(id) {
      const bed = gardenGroup?.userData.beds[id];
      if (!bed) return null;
      const p = bed.getWorldPosition(new THREE.Vector3()).project(camera);
      return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
    },
    play(name, opts = {}) {
      if (!model) return;
      trick = null;
      if (name === 'eat') { startFood(opts.food || 'cookie'); flashExpression(model, 'happy', clock); return; }
      if (name === 'happy' && opts.ball) { startBall(); flashExpression(model, 'surprised', clock); setTimeout(() => model && flashExpression(model, 'happy', clock), 650); return; }
      anim = { name, t0: clock };
      if (name === 'hop') fx.spawn('heart', headPos(), { count: 3, vel: { x: 0, y: 0.6, z: 0 }, jitter: 0.5, size: 0.12, life: 1.1 });
      if (name === 'evolve') {
        flashExpression(model, 'surprised', clock);
        setTimeout(() => model && flashExpression(model, 'happy', clock), 1300);
        evolveFx.start(clock);
        evolveT0 = clock;
        fx.spawn('star', holder.position.clone().add(new THREE.Vector3(0, 0.5, 0)), { count: 14, vel: { x: 0, y: 1.2, z: 0 }, jitter: 2.2, gravity: 1.2, size: 0.13, life: 1.6 });
      } else flashExpression(model, 'happy', clock);
      if (guestModel && name === 'happy') flashExpression(guestModel, 'happy', clock);
    },
    /** 평소 표정: 'normal' | 'sleepy' | 'sad' */
    setMood(expr) { if (model) setBaseExpression(model, expr); },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onLook);
      fx.dispose();
      roomGroup?.userData.dispose?.();
      gardenGroup?.userData.dispose?.();
      disposeTree(scene);
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    },
  };
}
