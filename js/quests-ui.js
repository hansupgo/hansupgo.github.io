// 오늘의 할 일 · 계절 행사 화면 (지도 왼쪽 위 📋 버튼)

import { gainText } from './room.js';
import { store } from './store.js';
import {
  quests, questInfo, questDone, claim, claimable, rewardOf, onQuestDone,
  currentEvent, eventEndsAt, eventQuestGoal,
} from './quests.js';
import { speciesById } from './monsters.js';

const $ = (id) => document.getElementById(id);
let toastFn = () => {};
let changeFn = () => {};

function rewardText(r) {
  const parts = [];
  if (r.balls) parts.push(`숲볼 ${r.balls}`);
  if (r.snacks) parts.push(`🍪${r.snacks}`);
  if (r.mats) parts.push(gainText(r.mats));
  if (r.token) { const ev = currentEvent(); parts.push(`${ev.tokenIcon}${r.token}`); }
  return parts.join(' · ');
}

function bar(prog, goal) {
  const p = Math.min(100, Math.round((prog / goal) * 100));
  return `<span class="q-bar"><span style="width:${p}%"></span></span>`;
}

function row({ key, icon, text, prog, goal, unit = '', claimed, reward }) {
  const done = prog >= goal;
  const shown = unit === 'm' ? `${Math.floor(prog)}/${goal}m` : `${prog}/${goal}`;
  return `<div class="q-row ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}">
    <span class="q-ico">${icon}</span>
    <span class="q-main"><span class="q-text">${text}</span>${bar(prog, goal)}
      <small class="q-meta">${shown} · 보상 ${rewardText(reward)}</small></span>
    ${claimed ? '<span class="q-got">받음 ✓</span>'
      : `<button class="btn primary q-claim" data-claim="${key}" type="button" ${done ? '' : 'disabled'}>받기</button>`}
  </div>`;
}

function daysLeft(ms) {
  return Math.max(1, Math.ceil((ms - Date.now()) / 86400000));
}

export function renderQuests() {
  const Q = quests();
  const ev = currentEvent();
  const doneN = Q.list.filter(q => q.claimed).length;
  const rows = Q.list.map(q => {
    const d = questInfo(q.id);
    return row({ key: q.id, icon: d.icon, text: d.text, prog: q.prog, goal: d.goal, unit: d.unit, claimed: q.claimed, reward: rewardOf(q.id) });
  }).join('');
  const all = doneN === Q.list.length;
  const bonus = `<div class="q-bonus ${all ? 'ready' : ''} ${Q.bonus ? 'claimed' : ''}">
      <span>🎉 <b>다 하면 보너스</b> <small>${doneN}/${Q.list.length}</small><br><small class="q-meta">${rewardText(rewardOf('bonus'))}</small></span>
      ${Q.bonus ? '<span class="q-got">받음 ✓</span>' : `<button class="btn primary q-claim" data-claim="bonus" type="button" ${all ? '' : 'disabled'}>받기</button>`}
    </div>`;
  const tokens = store.state.materials?.[ev.token] || 0;
  const boosts = ev.boost.map(id => speciesById[id].name).join(' · ');
  $('quest-body').innerHTML = `
    <p class="q-lead">날마다 바뀌어요. 내일 또 새로운 할 일이 기다려요!</p>
    <div class="q-list">${rows}</div>
    ${bonus}
    <div class="ev-card ev-${ev.id}">
      <div class="ev-head"><span class="ev-ico">${ev.icon}</span>
        <span><b>${ev.name}</b> 행사 중<br><small>${daysLeft(eventEndsAt())}일 남음</small></span>
        <span class="ev-tokens" title="${ev.tokenName}">${ev.tokenIcon} ${tokens}</span></div>
      <p class="ev-desc">${ev.desc}</p>
      <ul class="ev-how">
        <li>친구를 잡을 때마다 ${ev.tokenIcon}${ev.tokenName} +1 (행사 친구는 +2)</li>
        <li>모은 ${ev.tokenName}로 <b>짝꿍 → 가구 만들기</b>에서 기간 한정 가구를 만들어요</li>
        <li>행사 친구: ${boosts}</li>
      </ul>
      <div class="q-list">${row({ key: 'event', icon: ev.tokenIcon, text: `오늘 ${ev.tokenName} ${eventQuestGoal}개 모으기`, prog: Q.event.prog, goal: eventQuestGoal, claimed: Q.event.claimed, reward: rewardOf('event') })}</div>
    </div>`;
  for (const b of $('quest-body').querySelectorAll('[data-claim]')) {
    b.addEventListener('click', () => {
      const r = claim(b.dataset.claim);
      if (!r) return;
      toastFn(`🎁 ${rewardText(r)} 받았어요!`);
      changeFn();
      renderQuests();
    });
  }
  renderQuestBadge();
}

export function renderQuestBadge() {
  const n = claimable();
  const badge = $('quest-badge');
  badge.textContent = n;
  badge.hidden = n === 0;
  $('btn-quest').classList.toggle('has', n > 0);
}

export function openQuests() {
  renderQuests();
  $('quest-sheet').hidden = false;
}

export function initQuestUI({ toast, onChange }) {
  toastFn = toast;
  changeFn = onChange;
  $('btn-quest').addEventListener('click', openQuests);
  $('quest-sheet').addEventListener('click', (e) => {
    if (e.target.id === 'quest-sheet' || e.target.closest('.sheet-close')) $('quest-sheet').hidden = true;
  });
  // 할 일을 끝내면 잠깐 뒤에 알려 줌 (잡기 결과 같은 다른 안내와 겹치지 않게)
  onQuestDone((def) => {
    renderQuestBadge();
    setTimeout(() => toastFn(`✅ 할 일 완료: ${def.icon} ${def.text} — 📋에서 보상 받기!`, 3200), 1800);
  });
  store.onChange(renderQuestBadge);
  renderQuestBadge();
}
