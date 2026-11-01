// 🎄 대림절 달력 화면 (지도 가운데 큰 트리, 또는 📋 할 일 창에서 열어요)

import { adventDay, daysToXmas, door, isOpened, openedCount, openDoor, isXmas } from './christmas.js';
import { gainText, furnitureById } from './room.js';
import { learn } from './vocab.js';
import { sayEnglish } from './english.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let cb = { toast: () => {}, onChange: () => {}, buddyName: () => '' };

export function giftText(g) {
  const parts = [];
  if (g.balls) parts.push(`숲볼 ${g.balls}개`);
  if (g.snacks) parts.push(`간식 ${g.snacks}개`);
  if (g.mats) parts.push(gainText(g.mats));
  if (g.furniture) parts.push(`${furnitureById[g.furniture].icon} ${furnitureById[g.furniture].name}`);
  return parts.join(', ');
}

function render(justOpened = 0) {
  const today = adventDay();
  const left = daysToXmas();
  const doors = Array.from({ length: 25 }, (_, i) => i + 1).map(d => {
    const opened = isOpened(d);
    const can = d <= today && !opened;
    const cls = opened ? 'open' : can ? (d === today ? 'today' : 'ready') : 'locked';
    const inside = opened ? (d === 25 ? '🎁' : '✨') : d;
    return `<button class="adv-door ${cls} ${d === 25 ? 'big' : ''} ${d === justOpened ? 'pop' : ''}" type="button" data-door="${d}" ${can ? '' : 'disabled'} aria-label="${d}일 문${opened ? ' (열었음)' : ''}">${inside}</button>`;
  }).join('');
  const last = justOpened ? door(justOpened) : null;
  $('advent-body').innerHTML = `<p class="adv-lead">${left ? `성탄절까지 <b>${left}일</b>! 날마다 문을 하나씩 열어요. 놓친 날 문도 열 수 있어요.` : '🎄 메리 크리스마스! 예수님이 태어나신 날이에요.'}</p>
    <div class="adv-grid">${doors}</div>
    <p class="muted small">연 문 ${openedCount()}/25 · 25일 문에는 특별한 선물이 있어요. 🎄 크리스마스 트리·🧦 성탄 양말은 12월에 '가구 만들기'에서 ⚪눈뭉치로 만들어요.</p>
    ${last ? `<div class="adv-got"><p><b>${last.day}일 선물:</b> ${esc(giftText(last.gift))}</p>
      <p class="en" lang="en">${esc(cb.buddyName() ? `${cb.buddyName()}: ` : '')}"${esc(last.en)}"</p><p class="ko">${esc(last.ko)}</p>
      <button id="adv-say" class="btn ghost" type="button">🔊 영어로 듣기</button></div>` : ''}`;
  for (const b of $('advent-body').querySelectorAll('[data-door]:not([disabled])')) b.addEventListener('click', () => open(+b.dataset.door));
  $('adv-say')?.addEventListener('click', () => sayEnglish(last.en));
}

function open(day) {
  const d = openDoor(day);
  if (!d) return;
  learn([d.word]);
  render(day);
  sayEnglish(d.en); // 누른 순간이라 소리가 남
  cb.toast(`🎄 ${day}일 문을 열었어요! ${giftText(d.gift)}`, 3500);
  cb.onChange();
}

export function openAdvent() {
  if (!isXmas()) { cb.toast('🎄 대림절 달력은 12월 1일부터 열려요!'); return; }
  render();
  $('advent-sheet').hidden = false;
}

export function initAdventUI(callbacks) {
  cb = { ...cb, ...callbacks };
  $('advent-sheet').addEventListener('click', (e) => {
    if (e.target.id === 'advent-sheet' || e.target.closest('.sheet-close')) $('advent-sheet').hidden = true;
  });
}
