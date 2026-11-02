// 🏆 도감 완성 보상
// - 모은 종류 수가 5·10·20·30이 되면 선물
// - 몬스터·곤충·동물·물고기를 한 갈래 다 모으면 그 갈래 트로피 (짝꿍 방에 놓는 가구)
// - 36종을 모두 모으면 황금 왕관 트로피 + '한숲 도감 박사'
// 새 친구를 도감에 올릴 때마다(그리고 처음 열 때) checkDexRewards()로 확인해요.

import { store } from './store.js';
import { SPECIES, KINDS } from './monsters.js';
import { addMaterials } from './room.js';

export const MILESTONES = [
  { id: 'm5', n: 5, gift: { balls: 5, snacks: 2 } },
  { id: 'm10', n: 10, gift: { balls: 8, mats: { star: 2 } } },
  { id: 'm20', n: 20, gift: { balls: 12, snacks: 5, mats: { star: 3, shell: 2 } } },
  { id: 'm30', n: 30, gift: { balls: 15, snacks: 8, mats: { star: 5 } } },
];
export const KIND_TROPHY = { monster: 'trophy_monster', insect: 'trophy_insect', animal: 'trophy_animal', fish: 'trophy_fish' };
export const MASTER = { id: 'all', furniture: 'trophy_gold', gift: { balls: 30, snacks: 10 }, title: '한숲 도감 박사' };

const R = () => { store.state.dexRewards = store.state.dexRewards || {}; return store.state.dexRewards; };
export const hasReward = (id) => Boolean(R()[id]);
export const isMaster = () => hasReward(MASTER.id);

export function kindProgress(kind) {
  const all = SPECIES.filter(sp => sp.kind === kind);
  return { got: all.filter(sp => store.state.caught[sp.id]).length, total: all.length };
}

function give(gift = {}, furniture) {
  const s = store.state;
  if (gift.balls) s.balls += gift.balls;
  if (gift.snacks) s.snacks += gift.snacks;
  if (furniture) s.furniture[furniture] = (s.furniture[furniture] || 0) + 1;
  if (gift.mats) addMaterials(gift.mats);
}

/** 새로 받을 보상을 모두 주고 목록을 돌려줌 [{ id, text, gift, furniture }] */
export function checkDexRewards() {
  const got = Object.keys(store.state.caught).length;
  const out = [];
  for (const m of MILESTONES) {
    if (got >= m.n && !hasReward(m.id)) {
      R()[m.id] = Date.now();
      give(m.gift);
      out.push({ id: m.id, text: `도감 ${m.n}종 달성!`, gift: m.gift });
    }
  }
  for (const [kind, furniture] of Object.entries(KIND_TROPHY)) {
    const p = kindProgress(kind);
    const id = `kind_${kind}`;
    if (p.got >= p.total && !hasReward(id)) {
      R()[id] = Date.now();
      give({}, furniture);
      out.push({ id, text: `${KINDS[kind].label} ${p.total}종 모두 모음!`, furniture });
    }
  }
  if (got >= SPECIES.length && !isMaster()) {
    R()[MASTER.id] = Date.now();
    give(MASTER.gift, MASTER.furniture);
    out.push({ id: MASTER.id, text: `도감 ${SPECIES.length}종 완성! '${MASTER.title}'`, gift: MASTER.gift, furniture: MASTER.furniture });
  }
  if (out.length) store.save();
  return out;
}
