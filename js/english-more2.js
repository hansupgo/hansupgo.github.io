// 짝꿍과 영어로 이야기하기: 하루 속 더 많은 순간들 (식당·수업 시작 전·보건실·엘리베이터 ...)
// 형식은 english-data.js와 같아요. group: home / school / out / heart / eat

export const MORE_SCENES_2 = [
  // ---------- 🍽️ 먹을 때 ----------
  {
    id: 'restaurant', icon: '🍽️', title: '식당에서 밥 먹기 전', where: '식당', time: [11, 21], level: 1, group: 'eat',
    learn: [['A table for three, please.', '세 명 자리 주세요.'], ['Can I see the menu?', '메뉴판 볼 수 있어요?'], ["I'd like noodles, please.", '국수 주세요.']],
    turns: [
      {
        say: ['We are at the restaurant! The server asks, "How many people?"', '식당에 왔어! 직원이 "몇 분이세요?" 하고 물어.'],
        options: [
          { en: 'A table for three, please.', ko: '세 명 자리 주세요.', accept: ['three', 'table', '3'], reply: ['"Right this way!" Let\'s sit by the window.', '"이쪽으로 오세요!" 창가에 앉자.'] },
          { en: 'Four people, please.', ko: '네 명이에요.', accept: ['four', 'people', '4'], reply: ['"Here is your table." Thank you!', '"여기 앉으세요." 고맙습니다!'] },
        ],
      },
      {
        say: ['I am so hungry! What should we do first?', '나 너무 배고파! 먼저 뭐 하지?'],
        options: [
          { en: 'Can I see the menu, please?', ko: '메뉴판 볼 수 있어요?', accept: ['menu', 'see'], reply: ['Wow, so many pictures of food!', '우와, 음식 사진이 엄청 많다!'] },
          { en: "Let's wash our hands first.", ko: '먼저 손 씻자.', accept: ['wash', 'hands', 'first'], reply: ['Good idea! Clean hands, happy tummy.', '좋은 생각! 손이 깨끗해야 배도 좋아해.'] },
        ],
      },
      {
        say: ['"Are you ready to order?" What do you want?', '"주문하시겠어요?" 뭐 먹을래?'],
        options: [
          { en: "I'd like noodles, please.", ko: '국수 주세요.', accept: ['noodles', 'noodle'], reply: ['Slurp, slurp! Yummy.', '후루룩! 맛있겠다.'] },
          { en: 'Fried rice and some water, please.', ko: '볶음밥이랑 물 주세요.', accept: ['fried rice', 'rice', 'water'], reply: ['Great choice! I\'ll have the same.', '잘 골랐어! 나도 같은 걸로.'] },
          { en: 'Can I have a kids\' meal?', ko: '어린이 메뉴 주세요.', accept: ['kids', 'meal', 'kid'], reply: ['It comes with a toy! Yay!', '장난감도 같이 나온대! 야호!'] },
        ],
      },
    ],
  },
  {
    id: 'before-meal', icon: '🙏', title: '잘 먹겠습니다', where: '식탁', time: [6, 21], level: 1, group: 'eat',
    learn: [["Let's wait for everyone.", '다 같이 기다리자.'], ['Thank you for the food!', '잘 먹겠습니다!'], ['It smells delicious.', '맛있는 냄새가 나.']],
    turns: [
      {
        say: ['The food is here! Can I eat now?', '음식 나왔다! 지금 먹어도 돼?'],
        options: [
          { en: "Let's wait for everyone.", ko: '다 같이 올 때까지 기다리자.', accept: ['wait', 'everyone'], reply: ['Okay! I can wait. Grandpa is coming!', '알았어! 기다릴게. 할아버지 오신다!'] },
          { en: 'Not yet. It is too hot.', ko: '아직. 너무 뜨거워.', accept: ['hot', 'not yet', 'yet'], reply: ['Hoo, hoo! I will blow on it.', '후, 후! 불어서 식힐게.'] },
        ],
      },
      {
        say: ['Everyone is here. What do we say before we eat?', '다 모였어. 먹기 전에 뭐라고 해?'],
        options: [
          { en: 'Thank you for the food!', ko: '잘 먹겠습니다!', accept: ['thank', 'food', 'thanks'], reply: ['Thank you for the food! Let\'s eat!', '잘 먹겠습니다! 먹자!'] },
          { en: "Let's pray first.", ko: '먼저 기도하자.', accept: ['pray', 'prayer'], reply: ['Thank you, God, for this food. Amen!', '하나님, 음식 주셔서 감사해요. 아멘!'] },
        ],
      },
      {
        say: ['Mmm! How does it smell?', '음! 냄새 어때?'],
        options: [
          { en: 'It smells delicious!', ko: '맛있는 냄새가 나!', accept: ['delicious', 'smells', 'good'], reply: ['My tummy is saying, "Grrr!"', '내 배가 "꼬르륵!" 해.'] },
          { en: 'I can smell the kimchi stew!', ko: '김치찌개 냄새 난다!', accept: ['kimchi', 'stew', 'soup'], reply: ['My favorite! Spicy but yummy.', '내가 제일 좋아하는 거! 맵지만 맛있어.'] },
        ],
      },
    ],
  },
  {
    id: 'icecream', icon: '🍦', title: '아이스크림 가게', where: '아이스크림 가게', time: [12, 21], level: 1, group: 'eat',
    learn: [['What flavor do you want?', '무슨 맛 먹을래?'], ['Cone or cup?', '콘이야, 컵이야?'], ['It is melting!', '녹고 있어!']],
    turns: [
      {
        say: ['So many colors! What flavor do you want?', '색깔이 엄청 많다! 무슨 맛 먹을래?'],
        options: [
          { en: 'Strawberry, please!', ko: '딸기 맛 주세요!', accept: ['strawberry'], reply: ['Pink and sweet!', '분홍색이고 달콤해!'] },
          { en: 'Chocolate and vanilla!', ko: '초콜릿이랑 바닐라!', accept: ['chocolate', 'vanilla'], reply: ['Two scoops! Lucky you!', '두 덩이! 좋겠다!'] },
          { en: 'Can I try the mint one?', ko: '민트 맛 먹어 봐도 돼요?', accept: ['mint', 'try'], reply: ['Here is a little spoon. Cool and fresh!', '작은 숟가락 여기 있어. 시원하다!'] },
        ],
      },
      {
        say: ['"Cone or cup?"', '"콘으로 드릴까요, 컵으로 드릴까요?"'],
        options: [
          { en: 'A cone, please.', ko: '콘으로 주세요.', accept: ['cone'], reply: ['Crunchy cone! Good choice.', '바삭한 콘! 잘 골랐어.'] },
          { en: 'A cup, please.', ko: '컵으로 주세요.', accept: ['cup'], reply: ['No mess! Smart.', '안 흘리겠다! 똑똑해.'] },
        ],
      },
      {
        say: ['Oh no! My ice cream is melting!', '앗! 아이스크림이 녹고 있어!'],
        options: [
          { en: 'Lick it quickly!', ko: '빨리 핥아 먹어!', accept: ['lick', 'quickly', 'quick', 'fast'], reply: ['Lick, lick! Saved it!', '할짝할짝! 살렸다!'] },
          { en: 'Here is a napkin.', ko: '여기 휴지 있어.', accept: ['napkin', 'tissue'], reply: ['Thanks! My hands are sticky.', '고마워! 손이 끈적끈적해.'] },
        ],
      },
    ],
  },
  {
    id: 'picnic', icon: '🧺', title: '소풍 도시락', where: '공원 잔디밭', time: [10, 17], level: 1, group: 'eat',
    learn: [["Let's sit here.", '여기 앉자.'], ['Do you want some?', '좀 먹을래?'], ["Let's clean up our trash.", '쓰레기 치우자.']],
    turns: [
      {
        say: ["It's picnic day! Where should we sit?", '소풍날이다! 어디 앉을까?'],
        options: [
          { en: "Let's sit under the big tree.", ko: '큰 나무 밑에 앉자.', accept: ['tree', 'under', 'shade'], reply: ['Nice and cool in the shade!', '그늘이라 시원하다!'] },
          { en: 'Here! I will spread the mat.', ko: '여기! 내가 돗자리 펼게.', accept: ['mat', 'spread', 'here'], reply: ['Thank you! Shoes off!', '고마워! 신발 벗자!'] },
        ],
      },
      {
        say: ['I have gimbap. Do you want some?', '나 김밥 있어. 좀 먹을래?'],
        options: [
          { en: 'Yes, please! I have fruit. Do you want some?', ko: '응! 나는 과일 있어. 좀 먹을래?', accept: ['yes', 'fruit', 'please'], reply: ["Let's share! Picnic is the best.", '나눠 먹자! 소풍 최고!'] },
          { en: 'Thank you! It looks so good.', ko: '고마워! 정말 맛있어 보여.', accept: ['thank', 'good', 'looks'], reply: ['My mom made it!', '우리 엄마가 싸 주셨어!'] },
        ],
      },
      {
        say: ['We are full! What do we do before we go?', '배부르다! 가기 전에 뭐 해야 하지?'],
        options: [
          { en: "Let's clean up our trash.", ko: '쓰레기 치우자.', accept: ['clean', 'trash', 'garbage'], reply: ['Leave no trash! The park says thank you.', '쓰레기 하나 없이! 공원이 고마워할 거야.'] },
          { en: "Let's fold the mat together.", ko: '같이 돗자리 접자.', accept: ['fold', 'mat', 'together'], reply: ['Fold, fold! All done.', '접고 접고! 다 했다.'] },
        ],
      },
    ],
  },
  {
    id: 'table-manners', icon: '🥢', title: '식사 예절', where: '식탁', time: [11, 21], level: 2, group: 'eat',
    learn: [['Could you pass me the water?', '물 좀 건네줄래요?'], ['Chew with your mouth closed.', '입 다물고 씹어.'], ["Let's put our dishes in the sink.", '그릇은 싱크대에 넣자.']],
    turns: [
      {
        say: ['I want some water, but it is far away.', '물 마시고 싶은데 너무 멀리 있어.'],
        options: [
          { en: 'Could you pass me the water, please?', ko: '물 좀 건네줄래요?', accept: ['pass', 'could', 'water'], reply: ['Here you are! So polite!', '여기 있어! 정말 예의 바르다!'] },
          { en: "Don't reach. Just ask!", ko: '팔 뻗지 말고 부탁해!', accept: ['ask', 'reach'], reply: ['Oh, right! Please pass the water.', '아, 맞다! 물 좀 건네줘.'] },
        ],
      },
      {
        say: ['Munch, munch! I am talking and eating at the same time!', '냠냠! 나 먹으면서 말하고 있어!'],
        options: [
          { en: 'Chew with your mouth closed, please.', ko: '입 다물고 씹어.', accept: ['chew', 'closed', 'mouth'], reply: ['Mm-hmm! Sorry. Now I can talk.', '음음! 미안. 이제 말할게.'] },
          { en: 'Swallow first, then talk.', ko: '먼저 삼키고 말해.', accept: ['swallow', 'first'], reply: ['Gulp! Okay, I swallowed.', '꿀꺽! 됐다, 삼켰어.'] },
        ],
      },
      {
        say: ['I finished eating. Can I go play now?', '다 먹었어. 이제 놀러 가도 돼?'],
        options: [
          { en: 'Say "May I be excused?" first.', ko: '먼저 "일어나도 돼요?" 하고 물어봐.', accept: ['excused', 'may', 'excuse'], reply: ['May I be excused? ... "Yes, you may!"', '일어나도 돼요? ... "그래!"'] },
          { en: "Let's put our dishes in the sink.", ko: '그릇은 싱크대에 넣자.', accept: ['dishes', 'sink', 'dish'], reply: ['Clink, clink! What a good helper.', '달그락! 정말 착하다.'] },
        ],
      },
    ],
  },
  // ---------- 🏫 학교 ----------
  {
    id: 'class-start', icon: '🔔', title: '수업 시작 전', where: '교실', time: [8, 11], level: 1, group: 'school',
    learn: [['Are you ready for class?', '수업 준비 됐어?'], ['Take out your textbook.', '교과서 꺼내.'], ["What's the first class?", '1교시가 뭐야?']],
    turns: [
      {
        say: ['Ding-dong! Class starts soon. Are you ready for class?', '딩동! 곧 수업 시작이야. 수업 준비 됐어?'],
        options: [
          { en: 'Yes! I am sitting at my desk.', ko: '응! 자리에 앉았어.', accept: ['yes', 'sitting', 'desk', 'ready'], reply: ['Me too! Ready, set, learn!', '나도! 준비, 시작, 공부!'] },
          { en: 'Wait! I need to sharpen my pencil.', ko: '잠깐! 연필 깎아야 해.', accept: ['wait', 'sharpen', 'pencil'], reply: ['Hurry, hurry! Grr-grr-grr!', '빨리빨리! 드르륵!'] },
        ],
      },
      {
        say: ["What's the first class today?", '오늘 1교시가 뭐야?'],
        options: [
          { en: "It's math!", ko: '수학이야!', accept: ['math'], reply: ['Numbers! One, two, three!', '숫자다! 하나, 둘, 셋!'] },
          { en: "It's English!", ko: '영어야!', accept: ['english'], reply: ['Yay! I love English class!', '야호! 영어 시간 좋아!'] },
          { en: "It's Korean.", ko: '국어야.', accept: ['korean'], reply: ['We will read a fun story!', '재밌는 이야기 읽겠다!'] },
        ],
      },
      {
        say: ['The teacher says, "Take out your textbook." Where is yours?', '선생님이 "교과서 꺼내세요" 하셔. 네 거 어디 있어?'],
        options: [
          { en: "It's in my desk.", ko: '책상 서랍에 있어.', accept: ['desk', 'in'], reply: ['Page ten! Let\'s open it.', '10쪽! 펴 보자.'] },
          { en: 'Oops! I left it at home.', ko: '앗! 집에 두고 왔어.', accept: ['left', 'home', 'oops', 'forgot'], reply: ["You can share mine. Let's look together.", '내 거 같이 보자.'] },
        ],
      },
    ],
  },
  {
    id: 'attendance', icon: '🙋', title: '아침 출석', where: '교실', time: [8, 10], level: 1, group: 'school',
    learn: [['Here!', '네! (출석)'], ['Is everyone here?', '다 왔니?'], ['He is absent today.', '오늘 결석했어요.']],
    turns: [
      {
        say: ['The teacher is calling names. "{name}?"', '선생님이 이름을 부르셔. "{name}?"'],
        options: [
          { en: 'Here!', ko: '네! (여기 있어요)', accept: ['here', 'present', 'yes'], reply: ['Good morning, {name}!', '좋은 아침, {name}!'] },
          { en: "I'm here, teacher!", ko: '저 여기 있어요, 선생님!', accept: ['teacher', "i'm here", 'im here'], reply: ['Great! You came early today.', '좋아! 오늘 일찍 왔구나.'] },
        ],
      },
      {
        say: ['"Is everyone here?" Hmm, where is Minjun?', '"다 왔니?" 음, 민준이는 어디 있지?'],
        options: [
          { en: 'He is absent today. He has a cold.', ko: '오늘 결석했어요. 감기 걸렸대요.', accept: ['absent', 'cold', 'sick'], reply: ['Oh no. I hope he feels better.', '저런. 빨리 나았으면 좋겠다.'] },
          { en: 'He is in the restroom.', ko: '화장실에 갔어요.', accept: ['restroom', 'bathroom', 'toilet'], reply: ['Okay! He will be right back.', '알았어! 금방 오겠다.'] },
        ],
      },
      {
        say: ['How are you feeling this morning?', '오늘 아침 기분 어때?'],
        options: [
          { en: "I'm great! I had a good breakfast.", ko: '좋아! 아침 잘 먹었어.', accept: ['great', 'good', 'breakfast'], reply: ['Full tummy, happy brain!', '배가 든든하면 머리도 신나!'] },
          { en: "I'm a little sleepy.", ko: '좀 졸려.', accept: ['sleepy', 'tired'], reply: ["Let's stretch! Up, up, up!", '기지개 켜자! 위로, 위로!'] },
        ],
      },
    ],
  },
  {
    id: 'in-class', icon: '✋', title: '수업 중에 손 들기', where: '교실', time: [9, 15], level: 2, group: 'school',
    learn: [['I have a question.', '질문 있어요.'], ['Can you say that again?', '다시 말씀해 주시겠어요?'], ['May I go to the restroom?', '화장실 가도 돼요?']],
    turns: [
      {
        say: ['Hmm, I don\'t understand. What should I do?', '음, 잘 모르겠어. 어떻게 하지?'],
        options: [
          { en: 'Raise your hand and say, "I have a question."', ko: '손 들고 "질문 있어요" 해.', accept: ['raise', 'question', 'hand'], reply: ['"I have a question!" The teacher smiled.', '"질문 있어요!" 선생님이 웃으셨어.'] },
          { en: 'You can ask, "Can you say that again?"', ko: '"다시 말씀해 주세요"라고 물어봐.', accept: ['again', 'say', 'ask'], reply: ['Oh, now I understand. Thanks!', '아, 이제 알겠다. 고마워!'] },
        ],
      },
      {
        say: ['Uh-oh. I need to go to the bathroom!', '어떡해. 화장실 가고 싶어!'],
        options: [
          { en: 'Ask, "May I go to the restroom?"', ko: '"화장실 가도 돼요?" 하고 물어봐.', accept: ['restroom', 'bathroom', 'may'], reply: ['"Yes, you may. Come back quickly!"', '"그래, 다녀와. 빨리 오렴!"'] },
          { en: 'Go quickly and come back!', ko: '빨리 다녀와!', accept: ['go', 'quickly', 'come back'], reply: ['Be right back!', '금방 올게!'] },
        ],
      },
      {
        say: ['The teacher asks, "Who knows the answer?"', '선생님이 "답 아는 사람?" 하고 물으셔.'],
        options: [
          { en: 'Me! I know! The answer is ten.', ko: '저요! 알아요! 답은 10이에요.', accept: ['me', 'know', 'ten', 'answer'], reply: ['"Correct! Great job!"', '"정답! 잘했어요!"'] },
          { en: "I'm not sure, but I'll try.", ko: '잘 모르겠지만 해 볼게요.', accept: ['sure', 'try'], reply: ['Trying is brave! Good for you.', '해 보는 게 용감한 거야! 멋지다.'] },
        ],
      },
    ],
  },
  {
    id: 'class-end', icon: '🏁', title: '수업 끝나고', where: '교실', time: [12, 17], level: 1, group: 'school',
    learn: [['Clean up your desk.', '책상 정리해.'], ['See you tomorrow!', '내일 봐요!'], ['Let me pack my bag.', '가방 쌀게.']],
    turns: [
      {
        say: ['Class is over! Our desks are messy.', '수업 끝! 책상이 엉망이야.'],
        options: [
          { en: "Let's clean up our desks.", ko: '책상 정리하자.', accept: ['clean', 'desk', 'desks'], reply: ['Books in, pencils in. Tidy!', '책 넣고, 연필 넣고. 깔끔!'] },
          { en: "I'll throw away the paper scraps.", ko: '종이 조각은 내가 버릴게.', accept: ['throw', 'paper', 'trash'], reply: ['Into the recycling bin!', '분리수거함에 쏙!'] },
        ],
      },
      {
        say: ['Time to go home. Did you pack your bag?', '집에 갈 시간이야. 가방 쌌어?'],
        options: [
          { en: 'Let me pack my bag. Notebook, pencil case...', ko: '가방 쌀게. 공책, 필통...', accept: ['pack', 'bag', 'notebook'], reply: ["Don't forget your homework!", '숙제 잊지 마!'] },
          { en: 'Yes! I am ready to go.', ko: '응! 갈 준비 됐어.', accept: ['yes', 'ready', 'go'], reply: ['Let\'s go!', '가자!'] },
        ],
      },
      {
        say: ['What do we say to the teacher?', '선생님께 뭐라고 인사할까?'],
        options: [
          { en: 'Goodbye, teacher! See you tomorrow!', ko: '선생님, 안녕히 계세요! 내일 봬요!', accept: ['goodbye', 'bye', 'tomorrow', 'see'], reply: ['"See you tomorrow!" She waved.', '"내일 보자!" 손 흔들어 주셨어.'] },
          { en: 'Thank you for teaching us!', ko: '가르쳐 주셔서 감사합니다!', accept: ['thank', 'teaching'], reply: ['The teacher looks so happy!', '선생님이 정말 기뻐하셔!'] },
        ],
      },
    ],
  },
  {
    id: 'group-work', icon: '🧩', title: '모둠 활동', where: '교실', time: [9, 15], level: 2, group: 'school',
    learn: [["What's your idea?", '네 생각은 뭐야?'], ['I agree with you.', '네 말에 찬성이야.'], ['Teamwork makes it better!', '같이 하니까 더 좋다!']],
    turns: [
      {
        say: ['We have to make a poster together. What\'s your idea?', '같이 포스터 만들어야 해. 네 생각은 뭐야?'],
        options: [
          { en: "Let's draw our town, Hansup City!", ko: '우리 동네 한숲시티를 그리자!', accept: ['town', 'draw', 'city', 'hansup'], reply: ['Great idea! I will draw the park.', '좋은 생각! 나는 공원 그릴게.'] },
          { en: 'How about saving the Earth?', ko: '지구 지키기는 어때?', accept: ['earth', 'saving', 'save'], reply: ['Ooh! Recycling and trees!', '오! 분리수거랑 나무!'] },
        ],
      },
      {
        say: ['I think we should use green and blue. What do you think?', '초록색이랑 파란색을 쓰면 좋겠어. 어떻게 생각해?'],
        options: [
          { en: 'I agree with you!', ko: '네 말에 찬성이야!', accept: ['agree', 'yes'], reply: ['Yay! We think the same.', '야호! 생각이 같다.'] },
          { en: 'Good, but let\'s add some yellow too.', ko: '좋아, 그런데 노란색도 넣자.', accept: ['yellow', 'add', 'but'], reply: ['Like the sun! Even better.', '해처럼! 더 좋다.'] },
        ],
      },
      {
        say: ['Everyone wants to use the markers!', '다들 마커를 쓰고 싶어 해!'],
        options: [
          { en: "Let's take turns.", ko: '돌아가면서 쓰자.', accept: ['turns', 'take', 'turn'], reply: ['You first, then me!', '너 먼저, 그다음 나!'] },
          { en: 'You color, and I will write.', ko: '너는 색칠하고 나는 글씨 쓸게.', accept: ['color', 'write'], reply: ['Teamwork makes it better!', '같이 하니까 더 좋다!'] },
        ],
      },
    ],
  },
  {
    id: 'nurse', icon: '🩹', title: '보건실에서', where: '보건실', time: [9, 16], level: 2, group: 'school',
    learn: [['I fell down.', '넘어졌어요.'], ['My knee hurts.', '무릎이 아파요.'], ['I feel better now.', '이제 괜찮아요.']],
    turns: [
      {
        say: ['The school nurse asks, "What happened?"', '보건 선생님이 "무슨 일이니?" 하고 물으셔.'],
        options: [
          { en: 'I fell down on the playground.', ko: '운동장에서 넘어졌어요.', accept: ['fell', 'down', 'playground'], reply: ['"Let me see. Oh, a little scratch."', '"어디 보자. 아, 조금 긁혔구나."'] },
          { en: 'I have a stomachache.', ko: '배가 아파요.', accept: ['stomachache', 'stomach', 'tummy'], reply: ['"Lie down here for a while."', '"여기 잠깐 누워 있으렴."'] },
        ],
      },
      {
        say: ['"Where does it hurt?"', '"어디가 아프니?"'],
        options: [
          { en: 'My knee hurts.', ko: '무릎이 아파요.', accept: ['knee'], reply: ['"Here is a bandage. It has stars on it!"', '"반창고 붙여 줄게. 별 그림이 있네!"'] },
          { en: 'My elbow hurts a little.', ko: '팔꿈치가 조금 아파요.', accept: ['elbow', 'arm'], reply: ['"Let\'s put some ice on it."', '"얼음찜질 하자."'] },
        ],
      },
      {
        say: ['"How do you feel now?"', '"이제 좀 어때?"'],
        options: [
          { en: 'I feel better now. Thank you!', ko: '이제 괜찮아요. 고맙습니다!', accept: ['better', 'thank', 'thanks'], reply: ['"Be careful when you run!"', '"뛸 때 조심하렴!"'] },
          { en: 'It still hurts a little.', ko: '아직 조금 아파요.', accept: ['still', 'little', 'hurts'], reply: ['"Rest a little more. I will call your teacher."', '"조금 더 쉬렴. 담임 선생님께 말씀드릴게."'] },
        ],
      },
    ],
  },
  {
    id: 'show-tell', icon: '🎤', title: '발표 시간', where: '교실 앞', time: [9, 15], level: 2, group: 'school',
    learn: [['This is my favorite toy.', '이건 내가 제일 좋아하는 장난감이야.'], ['I got it for my birthday.', '생일 선물로 받았어.'], ['Any questions?', '질문 있나요?']],
    turns: [
      {
        say: ["It's your turn for show-and-tell! What did you bring?", '네가 발표할 차례야! 뭐 가져왔어?'],
        options: [
          { en: 'This is my favorite toy. It\'s a robot!', ko: '이건 내가 제일 좋아하는 장난감이야. 로봇이야!', accept: ['toy', 'robot', 'favorite'], reply: ['Beep, boop! So cool!', '삐빅! 멋지다!'] },
          { en: 'This is a picture of my family.', ko: '이건 우리 가족 사진이야.', accept: ['picture', 'family', 'photo'], reply: ['Everyone is smiling!', '모두 웃고 있네!'] },
        ],
      },
      {
        say: ['Where did you get it?', '그거 어디서 났어?'],
        options: [
          { en: 'I got it for my birthday.', ko: '생일 선물로 받았어.', accept: ['birthday', 'got', 'gift'], reply: ['What a great present!', '정말 멋진 선물이다!'] },
          { en: 'My grandma gave it to me.', ko: '할머니가 주셨어.', accept: ['grandma', 'gave'], reply: ['Your grandma is so sweet.', '할머니 정말 다정하시다.'] },
        ],
      },
      {
        say: ['Your talk is almost done. What do you say at the end?', '발표가 거의 끝났어. 마지막에 뭐라고 해?'],
        options: [
          { en: 'Any questions?', ko: '질문 있나요?', accept: ['questions', 'question', 'any'], reply: ['Me! Can it dance? Haha!', '저요! 그거 춤출 수 있어? 하하!'] },
          { en: 'Thank you for listening!', ko: '들어 줘서 고마워요!', accept: ['thank', 'listening'], reply: ['Clap, clap, clap! Great job!', '짝짝짝! 잘했어!'] },
        ],
      },
    ],
  },
  // ---------- 🌳 밖에서 ----------
  {
    id: 'elevator', icon: '🛗', title: '엘리베이터에서 이웃 만나기', where: '아파트 엘리베이터', time: [7, 21], level: 1, group: 'out',
    learn: [['Hello! Nice to see you.', '안녕하세요! 반가워요.'], ['Which floor?', '몇 층 가세요?'], ['Have a nice day!', '좋은 하루 보내세요!']],
    turns: [
      {
        say: ['Ding! The door opened. It\'s our neighbor!', '띵! 문이 열렸어. 이웃 아주머니다!'],
        options: [
          { en: 'Hello! Nice to see you.', ko: '안녕하세요! 반가워요.', accept: ['hello', 'hi', 'nice'], reply: ['"Hello! You are so polite."', '"안녕! 정말 예의 바르구나."'] },
          { en: 'Good morning!', ko: '안녕하세요! (아침 인사)', accept: ['good morning', 'morning'], reply: ['"Good morning to you too!"', '"너도 좋은 아침!"'] },
        ],
      },
      {
        say: ['I will push the buttons! Ask her the floor.', '내가 버튼 누를게! 몇 층인지 여쭤봐.'],
        options: [
          { en: 'Which floor?', ko: '몇 층 가세요?', accept: ['floor', 'which'], reply: ['"Ten, please. Thank you!" Beep!', '"10층이요. 고마워!" 삑!'] },
          { en: 'Are you going down?', ko: '내려가세요?', accept: ['down', 'going'], reply: ['"Yes, to the first floor."', '"응, 1층."'] },
        ],
      },
      {
        say: ['We are here! The door is opening.', '다 왔다! 문이 열려.'],
        options: [
          { en: 'Have a nice day!', ko: '좋은 하루 보내세요!', accept: ['nice', 'day', 'have'], reply: ['"You too! Bye!"', '"너도! 안녕!"'] },
          { en: 'After you!', ko: '먼저 내리세요!', accept: ['after', 'you'], reply: ['"Thank you, sweetie!"', '"고맙다, 얘야!"'] },
        ],
      },
    ],
  },
  {
    id: 'playground', icon: '🛝', title: '놀이터에서 차례 지키기', where: '아파트 놀이터', time: [13, 20], level: 1, group: 'out',
    learn: [['Can I play with you?', '같이 놀아도 돼?'], ["It's my turn.", '내 차례야.'], ['Wait your turn.', '차례를 기다려.']],
    turns: [
      {
        say: ['Look! Kids are playing on the swings. Can we play too?', '봐! 아이들이 그네 타. 우리도 놀 수 있을까?'],
        options: [
          { en: 'Can I play with you?', ko: '같이 놀아도 돼?', accept: ['play', 'with', 'can'], reply: ['"Sure! Come on!"', '"그럼! 이리 와!"'] },
          { en: "Let's wait in line.", ko: '줄 서서 기다리자.', accept: ['wait', 'line'], reply: ['Good! We are next.', '좋아! 우리가 다음이야.'] },
        ],
      },
      {
        say: ['Someone cut in line! What should we say?', '누가 새치기했어! 뭐라고 할까?'],
        options: [
          { en: "Excuse me, it's my turn.", ko: '저기, 내 차례야.', accept: ['turn', 'excuse', 'my'], reply: ['"Oh, sorry!" He went back.', '"아, 미안!" 뒤로 갔어.'] },
          { en: 'Please wait your turn.', ko: '차례를 기다려 줘.', accept: ['wait', 'please'], reply: ['Calm and kind words. Nice!', '차분하고 친절한 말. 멋지다!'] },
        ],
      },
      {
        say: ['Push me on the swing! Higher, higher!', '그네 밀어 줘! 더 높이, 더 높이!'],
        options: [
          { en: 'Hold on tight! Here we go!', ko: '꽉 잡아! 간다!', accept: ['hold', 'tight', 'go'], reply: ['Wheee! I am flying!', '우와! 나 날고 있어!'] },
          { en: 'Not too high. Be careful!', ko: '너무 높이는 안 돼. 조심해!', accept: ['careful', 'high', 'not'], reply: ['Okay, safe and fun!', '알았어, 안전하게 재밌게!'] },
        ],
      },
    ],
  },
  {
    id: 'pool', icon: '🏊', title: '수영장에서', where: '수영장', time: [10, 18], level: 1, group: 'out',
    learn: [['Put on your swim cap.', '수영모 써.'], ["Don't run by the pool.", '수영장 옆에서 뛰면 안 돼.'], ['I can float!', '나 물에 뜰 수 있어!']],
    turns: [
      {
        say: ['We are at the pool! What do we need?', '수영장에 왔다! 뭐가 필요하지?'],
        options: [
          { en: 'Put on your swim cap and goggles.', ko: '수영모랑 물안경 써.', accept: ['cap', 'goggles', 'swim'], reply: ['Ready! I look like a frog.', '준비 끝! 나 개구리 같아.'] },
          { en: "Let's warm up first.", ko: '먼저 준비운동 하자.', accept: ['warm', 'up', 'first'], reply: ['Arms up! Legs out! Ready!', '팔 위로! 다리 쭉! 준비!'] },
        ],
      },
      {
        say: ["I'm so excited! Let's run!", '너무 신나! 뛰어가자!'],
        options: [
          { en: "No! Don't run by the pool.", ko: '안 돼! 수영장 옆에서 뛰면 안 돼.', accept: ["don't", 'dont', 'run', 'no'], reply: ['Oops! It is slippery. Walk slowly.', '앗! 미끄럽지. 천천히 걸을게.'] },
          { en: 'Walk slowly. The floor is wet.', ko: '천천히 걸어. 바닥이 젖었어.', accept: ['walk', 'slowly', 'wet'], reply: ['Thank you for telling me!', '말해 줘서 고마워!'] },
        ],
      },
      {
        say: ['Look at me! What can you do in the water?', '나 좀 봐! 너는 물에서 뭐 할 수 있어?'],
        options: [
          { en: 'I can float!', ko: '나 물에 뜰 수 있어!', accept: ['float'], reply: ['Like a starfish! Wow!', '불가사리처럼! 우와!'] },
          { en: 'I can kick my legs!', ko: '발차기 할 수 있어!', accept: ['kick', 'legs'], reply: ['Splash, splash! So strong!', '첨벙첨벙! 힘세다!'] },
        ],
      },
    ],
  },
  {
    id: 'haircut', icon: '💇', title: '미용실에서', where: '미용실', time: [10, 19], level: 2, group: 'out',
    learn: [['Just a little shorter, please.', '조금만 짧게 해 주세요.'], ["It's tickly!", '간지러워요!'], ['I like my new hair.', '새 머리 마음에 들어요.']],
    turns: [
      {
        say: ['The hairdresser asks, "How do you want your hair?"', '미용사 선생님이 "머리 어떻게 해 줄까?" 하고 물으셔.'],
        options: [
          { en: 'Just a little shorter, please.', ko: '조금만 짧게 해 주세요.', accept: ['shorter', 'little', 'short'], reply: ['"Okay! Sit still, please."', '"그래! 가만히 앉아 있으렴."'] },
          { en: 'I want bangs, please.', ko: '앞머리 잘라 주세요.', accept: ['bangs'], reply: ['"Bangs! You will look so cute."', '"앞머리! 정말 귀엽겠다."'] },
        ],
      },
      {
        say: ['Snip, snip! Hair is falling on your neck.', '싹둑싹둑! 머리카락이 목에 떨어져.'],
        options: [
          { en: "It's tickly! Hehe!", ko: '간지러워요! 헤헤!', accept: ['tickly', 'tickle', 'itchy'], reply: ['"Almost done. Just a minute!"', '"거의 다 됐어. 잠깐만!"'] },
          { en: 'I will close my eyes.', ko: '눈 감을게요.', accept: ['close', 'eyes'], reply: ['"Good idea! Stay still."', '"좋은 생각! 가만히 있자."'] },
        ],
      },
      {
        say: ['All done! Look in the mirror. How is it?', '다 됐다! 거울 봐. 어때?'],
        options: [
          { en: 'I like my new hair! Thank you!', ko: '새 머리 마음에 들어요! 고맙습니다!', accept: ['like', 'new', 'thank'], reply: ['You look awesome!', '정말 멋져!'] },
          { en: 'It feels so light!', ko: '머리가 엄청 가벼워요!', accept: ['light', 'feels'], reply: ['Fresh and cool!', '산뜻하고 시원하다!'] },
        ],
      },
    ],
  },
  {
    id: 'camping', icon: '⛺', title: '캠핑 가는 날', where: '캠핑장', time: [14, 23], level: 2, group: 'out',
    learn: [["Let's set up the tent.", '텐트 치자.'], ['Look at all the stars!', '별 좀 봐!'], ['I can hear the crickets.', '귀뚜라미 소리가 들려.']],
    turns: [
      {
        say: ['We are at the campsite! What should we do first?', '캠핑장에 왔다! 먼저 뭐 할까?'],
        options: [
          { en: "Let's set up the tent.", ko: '텐트 치자.', accept: ['tent', 'set up', 'set'], reply: ['Pull, push, done! Our little house!', '당기고, 꽂고, 끝! 우리 작은 집!'] },
          { en: 'I will collect some sticks.', ko: '나는 나뭇가지 주워 올게.', accept: ['sticks', 'collect', 'wood'], reply: ['Thank you! Stay close, okay?', '고마워! 가까이 있어야 해!'] },
        ],
      },
      {
        say: ["It's dinner time! What are we eating?", '저녁 시간이야! 뭐 먹어?'],
        options: [
          { en: "Let's grill sausages!", ko: '소시지 굽자!', accept: ['grill', 'sausages', 'sausage'], reply: ['Sizzle, sizzle! Smells good!', '지글지글! 냄새 좋다!'] },
          { en: 'Roasted marshmallows!', ko: '구운 마시멜로!', accept: ['marshmallows', 'marshmallow', 'roasted'], reply: ['Gooey and sweet! Yum!', '쫀득쫀득 달콤해! 냠!'] },
        ],
      },
      {
        say: ["It's dark now. Shh! What can you hear?", '이제 깜깜해. 쉿! 무슨 소리 들려?'],
        options: [
          { en: 'I can hear the crickets.', ko: '귀뚜라미 소리가 들려.', accept: ['crickets', 'cricket', 'hear'], reply: ['Chirp, chirp! A night song.', '귀뚤귀뚤! 밤의 노래야.'] },
          { en: 'Look up! Look at all the stars!', ko: '위를 봐! 별 좀 봐!', accept: ['stars', 'star', 'look'], reply: ['So many! I can see the Big Dipper!', '엄청 많다! 북두칠성이 보여!'] },
        ],
      },
    ],
  },
  // ---------- 🏠 집 ----------
  {
    id: 'wake-up', icon: '⏰', title: '늦잠 잤어!', where: '내 방', time: [6, 10], level: 1, group: 'home',
    learn: [['Wake up!', '일어나!'], ["We're late!", '우리 늦었어!'], ['Hurry up!', '서둘러!']],
    turns: [
      {
        say: ['Wake up! Wake up! Look at the clock!', '일어나! 일어나! 시계 봐!'],
        options: [
          { en: "Oh no! We're late!", ko: '어떡해! 우리 늦었어!', accept: ['late', 'oh no'], reply: ['Quick! Get up, get up!', '빨리! 일어나, 일어나!'] },
          { en: 'Five more minutes...', ko: '5분만 더...', accept: ['five', 'minutes', 'more'], reply: ['No more minutes! The bus is coming!', '5분 없어! 버스 온다!'] },
        ],
      },
      {
        say: ['Hurry up! What do we do first?', '서둘러! 먼저 뭐 해?'],
        options: [
          { en: 'Wash my face and brush my teeth!', ko: '세수하고 이 닦아!', accept: ['wash', 'face', 'brush', 'teeth'], reply: ['Splash! Brush! Super fast!', '촤악! 치카치카! 엄청 빨라!'] },
          { en: 'Get dressed!', ko: '옷 입어!', accept: ['dressed', 'clothes'], reply: ['Shirt on backwards! Haha, fix it!', '셔츠 거꾸로 입었다! 하하, 다시!'] },
        ],
      },
      {
        say: ['Phew! We made it. Tonight, what should we do?', '휴! 늦지 않았다. 오늘 밤엔 어떻게 할까?'],
        options: [
          { en: "Let's go to bed early.", ko: '일찍 자자.', accept: ['early', 'bed'], reply: ['Good idea! Early to bed, early to rise!', '좋은 생각! 일찍 자고 일찍 일어나기!'] },
          { en: "Let's set an alarm.", ko: '알람 맞추자.', accept: ['alarm', 'set'], reply: ['Beep-beep at seven o\'clock!', '일곱 시에 삐삐!'] },
        ],
      },
    ],
  },
  {
    id: 'screen-time', icon: '📺', title: 'TV·게임 시간', where: '거실', time: [15, 21], level: 2, group: 'home',
    learn: [['Can I watch TV?', 'TV 봐도 돼요?'], ['Only for thirty minutes.', '30분만이야.'], ['Time is up!', '시간 다 됐어!']],
    turns: [
      {
        say: ['I finished my homework. Can I watch TV?', '숙제 다 했어. TV 봐도 돼?'],
        options: [
          { en: 'Yes, but only for thirty minutes.', ko: '응, 그런데 30분만이야.', accept: ['thirty', 'minutes', 'only', '30'], reply: ['Deal! I\'ll set the timer.', '약속! 타이머 맞출게.'] },
          { en: "Let's play outside first!", ko: '먼저 밖에서 놀자!', accept: ['outside', 'play', 'first'], reply: ['Okay! Fresh air is good.', '좋아! 바깥 공기 좋지.'] },
        ],
      },
      {
        say: ['What should we watch?', '뭐 볼까?'],
        options: [
          { en: 'An animal show!', ko: '동물 프로그램!', accept: ['animal', 'show', 'animals'], reply: ['Look! A baby panda!', '봐! 아기 판다다!'] },
          { en: 'A cartoon in English!', ko: '영어 만화!', accept: ['cartoon', 'english'], reply: ['We can learn English, too!', '영어 공부도 되겠다!'] },
        ],
      },
      {
        say: ['Ring, ring! The timer! What now?', '띠리링! 타이머 울렸다! 이제 어떡해?'],
        options: [
          { en: "Time is up! I'll turn it off.", ko: '시간 다 됐어! 끌게.', accept: ['time', 'up', 'turn off', 'off'], reply: ['You kept your promise! Great job.', '약속 지켰다! 정말 잘했어.'] },
          { en: 'Just one more minute?', ko: '딱 1분만 더?', accept: ['one more', 'minute', 'more'], reply: ['Hmm, a promise is a promise!', '음, 약속은 약속이야!'] },
        ],
      },
    ],
  },
  {
    id: 'sick-day', icon: '🤒', title: '아파서 집에 있는 날', where: '침대', time: [7, 21], level: 1, group: 'home',
    learn: [["I don't feel well.", '몸이 안 좋아.'], ['I have a fever.', '열이 나.'], ['Get well soon!', '빨리 나아!']],
    turns: [
      {
        say: ['You look pale. Are you okay?', '얼굴이 창백해. 괜찮아?'],
        options: [
          { en: "I don't feel well.", ko: '몸이 안 좋아.', accept: ['feel', 'well', "don't"], reply: ['Oh no. Let me get Mom.', '저런. 엄마 불러올게.'] },
          { en: 'I have a fever.', ko: '열이 나.', accept: ['fever', 'hot'], reply: ['Your forehead is hot! Lie down.', '이마가 뜨거워! 누워 있어.'] },
        ],
      },
      {
        say: ['What can I get for you?', '뭐 갖다 줄까?'],
        options: [
          { en: 'Some warm water, please.', ko: '따뜻한 물 좀 줘.', accept: ['water', 'warm'], reply: ['Here you go. Sip slowly.', '여기 있어. 천천히 마셔.'] },
          { en: 'Can you read me a book?', ko: '책 읽어 줄래?', accept: ['read', 'book'], reply: ['Of course. Once upon a time...', '그럼. 옛날 옛적에...'] },
        ],
      },
      {
        say: ['Sleep well and get well soon!', '푹 자고 빨리 나아!'],
        options: [
          { en: 'Thank you for taking care of me.', ko: '돌봐 줘서 고마워.', accept: ['thank', 'care', 'taking'], reply: ["That's what friends are for!", '친구니까 당연하지!'] },
          { en: 'I will feel better tomorrow!', ko: '내일은 나을 거야!', accept: ['better', 'tomorrow'], reply: ['Then we can play together!', '그럼 같이 놀자!'] },
        ],
      },
    ],
  },
  // ---------- 💗 친구·마음 ----------
  {
    id: 'compliment', icon: '🌟', title: '칭찬하기', where: '어디서나', time: [8, 21], level: 1, group: 'heart',
    learn: [['You did a great job!', '정말 잘했어!'], ['I like your drawing.', '네 그림 좋다.'], ['Thank you for saying that.', '그렇게 말해 줘서 고마워.']],
    turns: [
      {
        say: ['I drew a picture of you! What do you think?', '너를 그렸어! 어때?'],
        options: [
          { en: 'I like your drawing! It looks just like me.', ko: '네 그림 좋다! 나랑 똑같아.', accept: ['like', 'drawing', 'looks'], reply: ['Really? Thank you!', '정말? 고마워!'] },
          { en: 'Wow, you are a great artist!', ko: '우와, 너 그림 정말 잘 그린다!', accept: ['artist', 'great', 'wow'], reply: ['Hehe! You make me happy.', '헤헤! 기분 좋다.'] },
        ],
      },
      {
        say: ['I finished the puzzle all by myself!', '나 퍼즐 혼자서 다 맞췄어!'],
        options: [
          { en: 'You did a great job!', ko: '정말 잘했어!', accept: ['great', 'job', 'did'], reply: ['Thank you for saying that!', '그렇게 말해 줘서 고마워!'] },
          { en: "You didn't give up. Awesome!", ko: '포기 안 했구나. 멋지다!', accept: ['give up', 'awesome', 'didn\'t'], reply: ['It was hard, but I kept trying!', '어려웠는데 계속 해 봤어!'] },
        ],
      },
      {
        say: ['Now it\'s my turn! You are so kind. I like you!', '이제 내 차례! 너는 정말 친절해. 네가 좋아!'],
        options: [
          { en: 'Thank you for saying that. I like you too!', ko: '그렇게 말해 줘서 고마워. 나도 네가 좋아!', accept: ['thank', 'like', 'too'], reply: ['Best friends forever!', '영원히 단짝이야!'] },
          { en: 'You make me smile!', ko: '너 덕분에 웃어!', accept: ['smile'], reply: ['Hehe, big smile!', '헤헤, 활짝!'] },
        ],
      },
    ],
  },
  {
    id: 'join-us', icon: '💛', title: '혼자 있는 친구', where: '운동장', time: [9, 17], level: 2, group: 'heart',
    learn: [['Do you want to play with us?', '우리랑 같이 놀래?'], ['You can be on our team.', '우리 팀 해도 돼.'], ["Let's be friends.", '친구 하자.']],
    turns: [
      {
        say: ['Look, that boy is sitting alone. He looks lonely.', '봐, 저 친구 혼자 앉아 있어. 외로워 보여.'],
        options: [
          { en: "Let's go and say hi.", ko: '가서 인사하자.', accept: ['say hi', 'hi', 'go'], reply: ['Good idea. Hi! I\'m {name}\'s buddy!', '좋은 생각. 안녕! 나는 {name}의 짝꿍이야!'] },
          { en: 'Maybe he is shy.', ko: '수줍음이 많은가 봐.', accept: ['shy', 'maybe'], reply: ["Then let's smile and be gentle.", '그럼 웃으면서 다정하게 다가가자.'] },
        ],
      },
      {
        say: ['What should we ask him?', '뭐라고 물어볼까?'],
        options: [
          { en: 'Do you want to play with us?', ko: '우리랑 같이 놀래?', accept: ['play', 'with us', 'want'], reply: ['He smiled! "Yes, please!"', '웃었다! "응, 좋아!"'] },
          { en: 'You can be on our team!', ko: '우리 팀 해도 돼!', accept: ['team'], reply: ['Now we have one more player!', '이제 한 명 더 생겼다!'] },
        ],
      },
      {
        say: ['That was fun! He is happy now.', '재밌었다! 이제 저 친구도 행복해 보여.'],
        options: [
          { en: "Let's be friends!", ko: '친구 하자!', accept: ['friends', 'friend', 'be'], reply: ['A new friend! My heart feels warm.', '새 친구! 마음이 따뜻해.'] },
          { en: 'See you tomorrow at recess!', ko: '내일 쉬는 시간에 보자!', accept: ['tomorrow', 'recess', 'see'], reply: ["Let's play again tomorrow!", '내일 또 놀자!'] },
        ],
      },
    ],
  },
];

// 원래 장면 중 먹는 장면은 '먹을 때' 묶음으로
export const MOVE_TO_EAT = ['lunch', 'dinner', 'bakery', 'cooking'];
