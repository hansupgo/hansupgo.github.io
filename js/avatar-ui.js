// 🧑‍🎨 아바타 만들기 화면 (처음 시작할 때, 설정에서 바꿀 때)

import { store } from './store.js';
import { ROLES, ROLE_CATS, roleById, SKINS, HAIRS, HAIR_NAMES, STYLES, ACCS, DEFAULT_AVATAR, cleanAvatar, avatarSVG } from './avatar.js';

const $ = (id) => document.getElementById(id);
let draft = { ...DEFAULT_AVATAR };
let doneFn = null;
let cat = 'all';

/** 지금 내 아바타 (없으면 null) */
export const myAvatar = () => cleanAvatar(store.state.avatar);

function render() {
  const r = roleById[draft.role];
  $('av-preview').innerHTML = avatarSVG(draft, { size: 168, cls: 'av-big' });
  $('av-role-name').innerHTML = `${r.name} <small lang="en">${r.en}</small>`;
  $('av-role-desc').textContent = r.desc;
  $('av-cats').innerHTML = ROLE_CATS.map(c => `<button type="button" class="av-cat ${c.id === cat ? 'on' : ''}" data-cat="${c.id}">${c.name}</button>`).join('');
  const shown = cat === 'all' ? ROLES : ROLES.filter(x => ROLE_CATS.find(c => c.id === cat).roles.includes(x.id));
  $('av-roles').innerHTML = shown.map(x => `<button type="button" class="av-role ${x.id === draft.role ? 'on' : ''}" data-role="${x.id}" aria-pressed="${x.id === draft.role}">
      ${avatarSVG({ ...draft, role: x.id }, { size: 58 })}<span>${x.name}</span></button>`).join('');
  $('av-skins').innerHTML = SKINS.map((c, i) => `<button type="button" class="color-dot ${i === draft.skin ? 'on' : ''}" style="background:${c}" data-skin="${i}" aria-label="피부색 ${i + 1}"></button>`).join('');
  $('av-hairs').innerHTML = HAIRS.map((c, i) => `<button type="button" class="color-dot ${i === draft.hair ? 'on' : ''}" style="background:${c}" data-hair="${i}" aria-label="머리색 ${HAIR_NAMES[i]}"></button>`).join('');
  $('av-styles').innerHTML = STYLES.map(s => `<button type="button" class="av-style ${s.id === draft.style ? 'on' : ''}" data-style="${s.id}">${s.name}</button>`).join('');
  // 머리카락이 안 보이는 역할은 알려 주기
  const hidden = { robot: '🤖 로봇은 머리카락이 없어요!', ninja: '🥷 닌자는 두건으로 머리를 가려요.' }[draft.role] || '';
  $('av-hair-note').textContent = hidden;
  $('av-hair-note').hidden = !hidden;
  $('av-accs').innerHTML = ACCS.map(a => `<button type="button" class="av-style ${a.id === draft.acc ? 'on' : ''}" data-acc="${a.id}">${a.name}</button>`).join('');
}

function pick(e) {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.cat) { cat = b.dataset.cat; render(); return; }
  if (b.dataset.role) draft.role = b.dataset.role;
  else if (b.dataset.skin) draft.skin = +b.dataset.skin;
  else if (b.dataset.hair) draft.hair = +b.dataset.hair;
  else if (b.dataset.style) draft.style = b.dataset.style;
  else if (b.dataset.acc) draft.acc = b.dataset.acc;
  else return;
  render();
  const big = $('av-preview').firstElementChild;
  big?.classList.add('pop');
}

/**
 * 아바타 만들기 열기
 * @param {{ first?: boolean, onDone?: (av) => void }} opts first: 처음 만들 때 (닫기 버튼 없음)
 */
export function openAvatarMaker(opts = {}) {
  draft = { ...(myAvatar() || DEFAULT_AVATAR) };
  cat = 'all';
  doneFn = opts.onDone || null;
  $('av-title').textContent = opts.first ? '🧑‍🎨 나의 아바타 만들기' : '🧑‍🎨 아바타 바꾸기';
  $('av-lead').textContent = opts.first
    ? '게임 속 나의 모습을 골라 주세요! 역할마다 옷과 소품이 달라요. 나중에 설정에서 바꿀 수 있어요.'
    : '역할과 모습을 바꿔 보세요.';
  $('av-close').hidden = Boolean(opts.first);
  $('av-done').textContent = opts.first ? '이 모습으로 할래요! ›' : '저장하기';
  render();
  $('avatar-sheet').hidden = false;
}

export function initAvatarUI() {
  for (const id of ['av-cats', 'av-roles', 'av-skins', 'av-hairs', 'av-styles', 'av-accs']) $(id).addEventListener('click', pick);
  $('av-random').addEventListener('click', () => {
    draft = {
      role: ROLES[Math.floor(Math.random() * ROLES.length)].id,
      skin: Math.floor(Math.random() * SKINS.length),
      hair: Math.floor(Math.random() * HAIRS.length),
      style: STYLES[Math.floor(Math.random() * STYLES.length)].id,
      acc: ACCS[Math.floor(Math.random() * ACCS.length)].id,
    };
    cat = 'all';
    render();
  });
  $('av-close').addEventListener('click', () => { $('avatar-sheet').hidden = true; });
  $('av-done').addEventListener('click', () => {
    store.state.avatar = { ...draft };
    store.save();
    $('avatar-sheet').hidden = true;
    doneFn?.(store.state.avatar);
  });
}
