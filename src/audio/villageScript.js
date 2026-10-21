// 숲속·바다·극지·공룡·농장 마을 게임이 하는 말. (사바나와 공통 문장은 script.js)
// 문장을 바꾸면 음성 목록도 같이 바뀐다 (npm run voice:list 로 목록 다시 만들기).
import { ADJ } from '../games/logic.js';
import { nativeAdj, sinoWord } from '../games/numbers.js';
import { withObject } from '../app/korean.js';

/** "모두 열한 개야! 숫자를 골라 봐." (10 이하는 과일 세기 힌트와 같은 문장) */
export const countHintEnd = (n) => `모두 ${nativeAdj(n)} 개야! 숫자를 골라 봐.`;

// 숲속: 풍선 터뜨리기
export const balloonPrompt = (n) => `숫자 ${sinoWord(n)} 풍선을 터뜨려 줘!`;
export const BALLOON_HINT = '반짝이는 풍선을 잘 봐!';
export const balloonHintEnd = (n) => `이게 숫자 ${sinoWord(n)} 풍선이야! 눌러 봐.`;

// 숲속·농장: 많다/적다 (하나씩 짝 짓기)
export const TREES_MORE = '도토리가 더 많은 나무를 눌러 줘!';
export const TREES_FEWER = '도토리가 더 적은 나무를 눌러 줘!';
export const FARM_MORE = '병아리랑 돼지 중에 누가 더 많을까? 더 많은 쪽을 눌러 줘!';
export const FARM_FEWER = '병아리랑 돼지 중에 누가 더 적을까? 더 적은 쪽을 눌러 줘!';
export const PAIR_HINT = '하나씩 짝을 지어 보자!';
export const PAIR_HINT_MORE = '짝이 없이 남은 쪽이 더 많아!';
export const PAIR_HINT_FEWER = '남는 게 없는 쪽이 더 적어!';

// 숲속: 도토리 세기 (11~20)
export const ACORNS_PROMPT = '상자에 도토리가 열 개 있어. 열 다음부터 세어 봐! 모두 몇 개일까?';
export const ACORNS_HINT = '상자는 열! 그다음부터 같이 세어 보자.';

// 바다·극지: 무늬 잇기
export const PATTERN_PROMPT = '다음에 올 친구는 누구일까? 골라 봐!';
export const PATTERN_HINT = '똑같은 무늬가 되풀이돼! 반짝이는 부분을 잘 봐.';
export const PATTERN_HINT_END = '물음표 자리에 올 친구를 골라 봐!';

// 바다·극지: 물고기 묶기 (11~39)
export const FISH_PROMPT = '그물 하나에 물고기가 열 마리야. 모두 몇 마리일까? 눌러서 세어 봐!';
export const FISH_HINT = '그물은 열씩, 물고기는 하나씩 같이 세어 보자!';
export const fishHintEnd = (n) => `모두 ${nativeAdj(n)} 마리야! 숫자를 골라 봐.`;

// 바다·극지: 열씩 세기 (10~100)
export const SHELLS_PROMPT = '상자 하나에 조개가 열 개씩 있어. 모두 몇 개일까? 상자를 눌러서 세어 봐!';
export const SHELLS_HINT = '상자를 십, 이십, 하고 같이 세어 보자!';
export const shellsHintEnd = (n) => `모두 ${sinoWord(n)} 개야! 숫자를 골라 봐.`;

// 공룡: 숫자판 찾기 (1~100)
export const boardPrompt = (n) => `${withObject(sinoWord(n))} 찾아서 눌러 줘!`;
export const BOARD_HINT = '반짝이는 줄에서 찾아봐!';

// 공룡: 발자국 빈칸
export const STEPS_PROMPT = '발자국에 빠진 숫자는 뭘까?';
export const STEPS_HINT_END = '빈칸에 들어갈 숫자를 골라 봐!';

// 공룡·농장: 더하기·빼기
export const EGGS_ADD = '둥지에 알이 있어. 알이 더 왔어! 이제 알은 몇 개일까?';
export const EGGS_SUB = '둥지에 알이 있었는데 아기 공룡이 몇 개 가져갔어! 남은 알은 몇 개일까?';
export const BASKET_ADD = '바구니에 달걀이 있어. 암탉이 달걀을 더 낳았어! 이제 달걀은 몇 개일까?';
export const BASKET_SUB = '바구니에 달걀이 있었는데 강아지가 몇 개 가져갔어! 남은 달걀은 몇 개일까?';

// 농장: 반짝 몇 개? (1~10)
export const FEED_PROMPT = '옥수수가 몇 개였을까? 다시 보고 싶으면 보자기를 눌러!';
export const FEED_HINT = '옥수수를 같이 세어 보자!';
export const feedHintEnd = (n) => `옥수수는 ${ADJ[n]} 개! 숫자를 골라 봐.`;
