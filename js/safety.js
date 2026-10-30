// 고운 말 지킴이: 닉네임·짝꿍 이름·친구 코드에 욕설이나 나쁜 말을 못 쓰게 하고,
// 친구에게서 받은 이름에 나쁜 말이 섞여 있으면 가려서 보여 줘요.
// "시 발", "s.h.i.t", "ㅅ1ㅂ"처럼 띄어 쓰거나 숫자·기호를 섞어도 찾아요.

// 이 낱말이 들어 있으면 막음 (붙여 쓴 글자 기준)
const KO = [
  '시발', '씨발', '씨바', '씨빨', '시빨', '십발', '씹', 'ㅅㅂ', 'ㅆㅂ', 'ㅅㅂㄹㅁ', '병신', '븅신', '빙신', 'ㅂㅅ', '좆', '존나', '졸라', 'ㅈㄴ',
  '개새', '새끼', '쌔끼', 'ㅅㄲ', '미친놈', '미친년', '미친새', 'ㅁㅊ', '지랄', 'ㅈㄹ', '닥쳐', '꺼져', '등신', '찐따', '엠창', '엄창',
  '느금', '니애미', '니미', '애미', '애비', '창녀', '걸레', '섹스', '야동', '자지', '보지', '젖꼭', '변태', '죽어라', '죽여', '자살',
  '멍청이', '바보새', '똘추', '또라이', '돌아이', '꼴통', '한남', '김치녀', '틀딱', '급식충', '맘충', '장애새',
];
const EN = [
  'fuck', 'fuk', 'fck', 'fvck', 'phuck', 'shit', 'bitch', 'bastard', 'asshole', 'cunt', 'nigger', 'nigga', 'faggot', 'slut', 'whore',
  'retard', 'porn', 'penis', 'vagina', 'boob', 'motherf', 'wtf', 'stfu', 'killyourself', 'damn', 'idiot', 'stupid',
];
// 짧아서 다른 낱말 속에 들어갈 수 있는 것은 낱말 전체가 같을 때만 (class, grass 등은 괜찮게)
const EN_WORD = ['ass', 'dick', 'sex', 'cum', 'tit', 'tits', 'dumb', 'loser', 'hell', 'piss', 'dumbass', 'kys'];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', '$': 's', '!': 'i' };

/** 비교용으로 바꿈: 소문자, 숫자·기호를 글자로, 띄어쓰기·기호 빼기 */
function squash(text) {
  return String(text || '').toLowerCase()
    .replace(/[0134578@$!]/g, c => LEET[c])
    .replace(/[^a-z가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
}
// 한글 사이에 숫자를 섞은 경우("시1발")는 숫자를 그냥 지운 모양도 봄
const squashKo = (text) => String(text || '').replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');

/** 나쁜 말이 들어 있으면 true */
export function isBad(text) {
  const s = squash(text);
  const k = squashKo(text);
  if (KO.some(w => s.includes(w) || k.includes(w))) return true;
  if (EN.some(w => s.includes(w))) return true;
  const words = String(text || '').toLowerCase().replace(/[0134578@$!]/g, c => LEET[c]).split(/[^a-z]+/).filter(Boolean);
  return words.some(w => EN_WORD.includes(w)) || EN_WORD.includes(s);
}

/** 친구에게서 받은 이름: 나쁜 말이 있으면 대신할 말로 */
export const cleanName = (text, fallback = '친구') => (isBad(text) ? fallback : text);

export const BAD_NAME_MSG = '그 이름은 쓸 수 없어요. 친구들이 기분 좋은 고운 말로 지어 주세요 🙂';
