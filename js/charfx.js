// 캐릭터 그림체와 표정
// - 툰 셰이딩: 빛을 2~3단으로 끊어 칠해 그림책·애니메이션 같은 느낌
// - 외곽선: 같은 모양을 조금 크게, 뒷면만 진한 색으로 그려 테두리처럼 보이게 (inverted hull)
// - 표정: 기쁨(^^), 졸림, 놀람(o), 시무룩 — 짝꿍 상태와 동작에 따라 바뀜
// - 화질 단계: 자동 / 낮음 / 보통 / 높음 (설정에서 고름)

const KEY = 'hansupgo.gfx';
export const GFX_LEVELS = { auto: '자동', low: '낮음 (부드럽게)', mid: '보통', high: '높음 (선명하게)' };

export function gfxLevel() {
  try { const v = localStorage.getItem(KEY); return GFX_LEVELS[v] ? v : 'auto'; } catch { return 'auto'; }
}
export function setGfxLevel(v) {
  try { localStorage.setItem(KEY, v); } catch { /* 무시 */ }
}
export function pixelRatioFor(level = gfxLevel()) {
  const dpr = window.devicePixelRatio || 1;
  if (level === 'low') return 1;
  if (level === 'mid') return Math.min(dpr, 1.5);
  return Math.min(dpr, 2);
}
export const outlinesOn = (level = gfxLevel()) => level !== 'low';

// ---------- 툰 셰이딩 + 외곽선 ----------

const kits = new WeakMap();
function kit(THREE) {
  let k = kits.get(THREE);
  if (k) return k;
  // 4단 명암 (어두운 쪽도 너무 검지 않게)
  const data = new Uint8Array([120, 120, 120, 255, 178, 178, 178, 255, 225, 225, 225, 255, 255, 255, 255, 255]);
  const grad = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  const outlineMats = new Map();
  k = {
    grad,
    outline(color) {
      const c = new THREE.Color(color);
      const hsl = {};
      c.getHSL(hsl);
      // 몸 색을 진하고 살짝 짙게 → 검은 선보다 부드러운 테두리
      c.setHSL(hsl.h, Math.min(1, hsl.s * 1.1 + 0.05), Math.max(0.08, hsl.l * 0.35));
      const key = c.getHex();
      if (!outlineMats.has(key)) outlineMats.set(key, new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide }));
      return outlineMats.get(key);
    },
  };
  kits.set(THREE, k);
  return k;
}

function toToon(THREE, m, grad) {
  if (!m || m.isMeshToonMaterial || m.isMeshBasicMaterial || m.isPointsMaterial || m.isShaderMaterial) return m;
  const t = new THREE.MeshToonMaterial({
    color: m.color ? m.color.clone() : 0xffffff, map: m.map || null, gradientMap: grad,
    emissive: m.emissive ? m.emissive.clone() : 0x000000, emissiveIntensity: m.emissiveIntensity ?? 0, emissiveMap: m.emissiveMap || null,
    transparent: m.transparent, opacity: m.opacity, side: m.side, depthWrite: m.depthWrite,
  });
  t.userData = m.userData;
  return t;
}

/**
 * 모델을 툰 그림체로 바꾸고 (원하면) 외곽선을 붙인다.
 * width: 외곽선 두께 (모델 단위, 키 1 기준)
 */
export function stylize(THREE, root, { outline = outlinesOn(), width = 0.014, toon = true } = {}) {
  const { grad, outline: outlineMat } = kit(THREE);
  const converted = new Map();
  const meshes = [];
  root.traverse(o => { if (o.isMesh && !o.userData.isOutline) meshes.push(o); });
  root.updateMatrixWorld(true);
  const ws = new THREE.Vector3();
  for (const m of meshes) {
    if (toon && !Array.isArray(m.material)) {
      if (!converted.has(m.material)) converted.set(m.material, toToon(THREE, m.material, grad));
      m.material = converted.get(m.material);
    }
    if (!outline) continue;
    const mat = m.material;
    if (Array.isArray(mat) || mat.isShaderMaterial || mat.transparent || (mat.emissiveIntensity || 0) > 0.6) continue; // 반투명·빛나는 것은 빼기
    if (m.geometry.type === 'TubeGeometry' || m.geometry.type === 'PlaneGeometry' || m.geometry.type === 'CircleGeometry' || m.geometry.type === 'RingGeometry') continue;
    let p = m.parent;
    let skip = false;
    while (p && p !== root) { if (p.userData?.noOutline) { skip = true; break; } p = p.parent; }
    if (skip || m.userData.noOutline) continue;
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    const bs = m.geometry.boundingSphere;
    if (bs.center.length() > bs.radius * 0.35) continue; // 가운데가 원점이 아닌 모양은 크게 하면 어긋남
    m.getWorldScale(ws);
    const size = bs.radius * (ws.x + ws.y + ws.z) / 3;
    if (size < 0.035) continue; // 아주 작은 부품(무늬, 발톱 등)은 선 없이
    const o = new THREE.Mesh(m.geometry, outlineMat(mat.color || 0x333333));
    o.userData.isOutline = true;
    o.renderOrder = -1;
    // 축마다 같은 두께가 되도록: (원래 크기 + 두께/반지름)
    const k = width / bs.radius;
    o.scale.set(1 + k / Math.max(0.001, m.scale.x), 1 + k / Math.max(0.001, m.scale.y), 1 + k / Math.max(0.001, m.scale.z));
    o.raycast = () => {};
    m.add(o);
  }
  // 가구가 들고 있던 재질 참조(빛나는 전구, 창문 하늘 등)도 새 재질로 바꿔 줌
  const swap = (v) => (converted.has(v) ? converted.get(v) : v);
  for (const [key, v] of Object.entries(root.userData || {})) {
    if (Array.isArray(v)) root.userData[key] = v.map(swap);
    else if (v && v.isMaterial) root.userData[key] = swap(v);
  }
  return root;
}

/**
 * 마을풍: 외곽선·단계 명암 없이 부드러운 무광 재질 + 은은한 자체 밝기.
 * 이미 빛나는 재질(전등, 창밖 하늘 등)은 그대로 둔다.
 */
export function soften(THREE, root, { lift = 0.12 } = {}) {
  const seen = new Set();
  root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const m = o.material;
    if (!m.isMeshStandardMaterial || seen.has(m)) return;
    seen.add(m);
    if (m.metalness < 0.3) m.roughness = Math.max(m.roughness, 0.85);
    if (!m.emissiveIntensity) {
      m.emissive.copy(m.color);
      if (m.map) m.emissiveMap = m.map;
      m.emissiveIntensity = lift;
      m.needsUpdate = true;
    }
  });
  return root;
}

// ---------- 표정 ----------
// model.userData.face = { arcs, blush, mouths, oh } (model3d.js에서 만듦)

const EXPR_TIME = { happy: 1.6, surprised: 0.9 };

/** 잠깐 짓는 표정 (기쁨·놀람) */
export function flashExpression(model, expr, t) {
  model.userData.exprFlash = { expr, until: t + (EXPR_TIME[expr] || 1.2) };
}

/** 계속 유지하는 기본 표정 (보통·졸림·시무룩) */
export function setBaseExpression(model, expr) {
  model.userData.exprBase = expr;
}

/** animateIdle 다음에 부름: 눈·입·볼을 표정에 맞게 */
export function applyFace(model, t) {
  const u = model.userData;
  const f = u.face;
  const flash = u.exprFlash && t < u.exprFlash.until ? u.exprFlash.expr : null;
  const expr = flash || u.exprBase || 'normal';
  if (u.exprNow !== expr) {
    u.exprNow = expr;
    if (f) {
      const happy = expr === 'happy' && f.arcs.length > 0; // ^^ 눈이 없는 모델은 원래 눈 그대로
      for (const a of f.arcs) a.visible = happy;
      for (const e of u.eyes) e.visible = !happy;
      if (f.oh) f.oh.visible = expr === 'surprised';
      for (const m of f.mouths) {
        m.visible = expr !== 'surprised';
        if (m.userData.baseQ) m.quaternion.copy(m.userData.baseQ);
        if (expr === 'sad') m.rotateZ(Math.PI); // 웃는 입을 뒤집어 시무룩
      }
    }
  }
  // 눈 크기: 놀람은 크게, 졸림은 가늘게, 시무룩은 살짝 처지게
  for (const e of u.eyes) {
    if (expr === 'surprised') { e.scale.setScalar(1.28); }
    else if (expr === 'sleepy') { e.scale.set(1, 0.12, 1); }
    else if (expr === 'sad') { e.scale.set(1, Math.min(e.scale.y, 0.72), 1); }
    else e.scale.x = e.scale.z = 1;
  }
  if (f) {
    const blush = expr === 'happy' ? 0.85 : expr === 'sad' ? 0.25 : 0.6;
    for (const b of f.blush) b.material.opacity += (blush - b.material.opacity) * 0.15;
  }
}
