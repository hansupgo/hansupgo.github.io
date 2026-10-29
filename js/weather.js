// 한숲시티의 실제 날씨와 하루 시간대
// - Open-Meteo(무료, 키 없음)에서 현재 날씨를 받아 20분 동안 기억합니다.
// - 못 받으면 '맑음'으로 놀 수 있어요.
// - 주소 끝에 ?weather=rain 처럼 붙이면 그 날씨로 미리 볼 수 있어요 (clear, cloudy, rain, snow, fog, storm).

import { CONFIG } from './config.js';

const KEY = 'hansupgo.weather';
const TTL = 20 * 60000;

export const WEATHER = {
  clear: { icon: '☀️', night: '🌙', name: '맑음', tip: '맑은 날: 곤충 친구가 더 많이 나오고, 텃밭이 빨리 자라요.' },
  cloudy: { icon: '⛅', night: '☁️', name: '흐림', tip: '흐린 날: 조용하고 포근한 날이에요.' },
  fog: { icon: '🌫️', night: '🌫️', name: '안개', tip: '안개 낀 날: 앞을 잘 보고 천천히 걸어요.' },
  rain: { icon: '🌧️', night: '🌧️', name: '비', tip: '비 오는 날: 연못 친구들이 동네 웅덩이에도 나오고, 💧빗방울을 주울 수 있어요. 텃밭은 저절로 물을 먹어요.' },
  snow: { icon: '❄️', night: '❄️', name: '눈', tip: '눈 오는 날: ❄️눈송이를 주울 수 있어요. 곤충 친구들은 숨어 버려요.' },
  storm: { icon: '⛈️', night: '⛈️', name: '천둥', tip: '천둥 치는 날: 밖에 나가지 말고 집에서 놀아요!' },
};

let current = { kind: 'clear', temp: null, at: 0, real: false };

function fromCode(code) {
  if (code == null) return 'clear';
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  return 'cloudy';
}

function override() {
  try {
    const w = new URLSearchParams(location.search).get('weather');
    return w && WEATHER[w] ? w : null;
  } catch { return null; }
}

/** 지금 날씨 { kind, temp, real } */
export function weather() {
  const o = override();
  return o ? { ...current, kind: o } : current;
}

export function weatherInfo() { return WEATHER[weather().kind]; }

const listeners = new Set();
export function onWeather(fn) { listeners.add(fn); }

export async function refreshWeather(force = false) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && !force && Date.now() - saved.at < TTL) { current = saved; listeners.forEach(f => f(weather())); return weather(); }
  } catch { /* 무시 */ }
  try {
    const { lat, lng } = CONFIG.home;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=Asia%2FSeoul`;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    const j = await res.json();
    current = { kind: fromCode(j.current?.weather_code), temp: Math.round(j.current?.temperature_2m), at: Date.now(), real: true };
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* 무시 */ }
  } catch {
    current = { ...current, at: Date.now() };
  }
  listeners.forEach(f => f(weather()));
  return weather();
}

/** 하루 시간대: dawn(5~7) day(7~17) dusk(17~19) night */
export function timeOfDay(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'dusk';
  return 'night';
}

export const isWet = () => ['rain', 'storm'].includes(weather().kind);
