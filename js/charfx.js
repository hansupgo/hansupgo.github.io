// 그림체와 표정
// - 마을풍 재질: 외곽선 없이 부드러운 무광 + 은은한 자체 밝기, 둥근 모서리 상자
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
// ---------- 마을풍 재질 ----------

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

/** 모서리가 둥근 상자 (마을풍). 아주 얇은 판은 그냥 상자. maxR: 가장 큰 둥글기 */
export function roundedBox(THREE, w, h, d, maxR = 0.035) {
  const r = Math.min(maxR, Math.min(w, h, d) * 0.22);
  if (r < 0.006) return new THREE.BoxGeometry(w, h, d);
  const x = w / 2 - r, y = h / 2 - r;
  const shape = new THREE.Shape();
  shape.moveTo(-x, -h / 2);
  shape.lineTo(x, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -y);
  shape.lineTo(w / 2, y); shape.quadraticCurveTo(w / 2, h / 2, x, h / 2);
  shape.lineTo(-x, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, y);
  shape.lineTo(-w / 2, -y); shape.quadraticCurveTo(-w / 2, -h / 2, -x, -h / 2);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.999, bevelOffset: -r, bevelSegments: 3, curveSegments: 4 });
  geo.translate(0, 0, -(d - 2 * r) / 2);
  geo.computeVertexNormals();
  return geo;
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
