// 앱 안 브라우저(카카오톡·네이버·인스타그램 등) 알아보기와 '크롬/사파리로 열기'
// 앱 안 브라우저는 영어 소리(음성 합성)·마이크·위치가 잘 안 되는 경우가 많아요.

const UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';

export const isIOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/i.test(UA) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
export const isAndroid = /Android/i.test(UA);

const APPS = [
  [/KAKAOTALK/i, '카카오톡'], [/NAVER\(inapp/i, '네이버'], [/Instagram/i, '인스타그램'], [/FBAN|FBAV/i, '페이스북'],
  [/Line\//i, '라인'], [/DaumApps/i, '다음'], [/everytimeApp/i, '에브리타임'], [/; wv\)/i, '앱'],
];

/** 앱 안 브라우저면 그 앱 이름, 아니면 '' */
export function inAppName() {
  const hit = APPS.find(([re]) => re.test(UA));
  return hit ? hit[1] : '';
}

/** 크롬(안드로이드)·사파리(아이폰)로 다시 열기. 열 수 없으면 false */
export function openExternal(url = location.href) {
  if (/KAKAOTALK/i.test(UA)) {
    location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }
  if (isAndroid) {
    const u = new URL(url);
    location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;end`;
    return true;
  }
  return false; // 아이폰의 다른 앱: 메뉴(⋯)에서 'Safari로 열기'를 눌러야 함
}

/** 안내 문구: 어떻게 바깥 브라우저로 여는지 */
export function externalHint() {
  if (/KAKAOTALK/i.test(UA)) return isIOS ? '오른쪽 아래 ⋯ 또는 공유 버튼 → "Safari로 열기"' : '오른쪽 위 ⋮ → "다른 브라우저로 열기"';
  return isIOS ? '메뉴(⋯)에서 "Safari로 열기"' : '메뉴(⋮)에서 "Chrome으로 열기"';
}
