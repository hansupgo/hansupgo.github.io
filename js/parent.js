// 보호자 안심 기능 + 성장 리포트
// - 날마다 걸은 거리, 잡은 친구, 영어 대화, 놀이 시간을 기록해 이번 주 리포트로 보여 줘요.
// - 보호자 비밀번호(4자리)로 잠근 설정: 하루 놀이 시간, 잠잘 시간.
// 기록과 설정은 이 휴대폰에만 저장돼요 (친구에게 공유되지 않음).

import { store } from './store.js';
import { hashString } from './spawn.js';

const KEEP_DAYS = 14;
const MORNING = 6; // 잠잘 시간은 아침 6시까지

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function P() {
  const s = store.state;
  s.parent = { pin: '', limit: 0, bed: 0, extra: { day: '', min: 0, bedDay: '' }, ...(s.parent || {}) };
  delete s.parent.zones; // 예전 '캐릭터가 안 나오는 곳'·'앞을 봐요' 설정은 이제 없음 (화면에서 산책)
  delete s.parent.lookUp;
  return s.parent;
}

// ---------- 날마다 기록 ----------

function daily() {
  const s = store.state;
  s.daily = s.daily || {};
  return s.daily;
}

export function today(now = new Date()) {
  const D = daily();
  const k = dayKey(now);
  if (!D[k]) {
    D[k] = { walk: 0, catch: 0, newSp: 0, talk: 0, care: 0, quests: 0, play: 0 };
    // 오래된 기록 정리
    const keys = Object.keys(D).sort((a, b) => new Date(a) - new Date(b));
    const cut = new Date(now); cut.setDate(cut.getDate() - KEEP_DAYS);
    for (const key of keys) if (parseDay(key) < cut) delete D[key];
  }
  return D[k];
}

function parseDay(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }

/** quests.track에서 함께 불림 */
export function record(on, info = {}) {
  const t = today();
  if (on === 'catch') { t.catch++; if (info.isNew) t.newSp++; }
  else if (on === 'walk') t.walk += info.m || 0;
  else if (on === 'talk') t.talk++;
  else if (on === 'feed' || on === 'play' || on === 'pet') t.care++;
  else if (on === 'questDone') t.quests += info.n || 1;
  else if (on === 'quizRight' || on === 'quizWrong') { t.quiz = (t.quiz || 0) + 1; if (on === 'quizRight') t.quizOk = (t.quizOk || 0) + 1; }
  else return;
  if (on !== 'walk') store.save(); // 걸음은 track이 저장
}

/** 최근 7일 (오래된 날 → 오늘) */
export function week(now = new Date()) {
  today(now);
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    out.push({ date: d, ...(daily()[dayKey(d)] || { walk: 0, catch: 0, newSp: 0, talk: 0, care: 0, quests: 0, play: 0 }) });
  }
  return out;
}

// ---------- 놀이 시간 · 잠잘 시간 ----------

export const settings = () => P();

export function setSetting(k, v) { P()[k] = v; store.save(); }

/** 오늘 더 놀게 해 준 시간(분) */
function extraMin(now = new Date()) {
  const e = P().extra;
  return e.day === dayKey(now) ? e.min : 0;
}

/** 쉬어야 하는 까닭: 'limit' | 'bed' | null */
export function restReason(now = new Date()) {
  const p = P();
  const h = now.getHours();
  if (p.bed && (h >= p.bed || h < MORNING) && p.extra.bedDay !== bedNight(now)) return 'bed';
  if (p.limit && today(now).play >= p.limit + extraMin(now)) return 'limit';
  return null;
}

// 밤 9시~다음 날 6시를 한 밤으로 묶는 이름 (자정을 넘겨도 같은 밤)
function bedNight(now) {
  const d = new Date(now);
  if (d.getHours() < MORNING) d.setDate(d.getDate() - 1);
  return dayKey(d);
}

/** 보호자가 더 놀게 해 줌 */
export function allowMore(now = new Date()) {
  const p = P();
  const reason = restReason(now);
  if (reason === 'bed') p.extra.bedDay = bedNight(now);
  else if (reason === 'limit') {
    if (p.extra.day !== dayKey(now)) { p.extra.day = dayKey(now); p.extra.min = 0; }
    p.extra.min = Math.ceil(today(now).play - p.limit) + 15;
  }
  store.save();
}

/** 30초마다 부름: 화면을 보고 있을 때만 놀이 시간으로 셈 */
export function tickPlay(sec = 30) {
  today().play += sec / 60;
  store.save();
}

// ---------- 보호자 비밀번호 ----------

const hashPin = (pin) => String(hashString(`hansupgo-pin:${pin}`));
export const hasPin = () => Boolean(P().pin);
export function setPin(pin) {
  if (!/^\d{4}$/.test(pin)) return false;
  P().pin = hashPin(pin);
  store.save();
  return true;
}
export const checkPin = (pin) => hasPin() && P().pin === hashPin(pin);

