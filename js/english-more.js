// 짝꿍과 영어로 이야기하기: 더 많은 장면 + 장면마다 바뀌는 가운데 대화
// 형식은 english-data.js와 같아요.
// - MORE_SCENES: 새 장면 (집·학교·밖에서·마음)
// - EXTRA_TURNS: 원래 장면의 가운데 대화 대신 나올 수 있는 다른 대화 (할 때마다 조금씩 달라져요)
//   learn이 있으면 그 대화가 나왔을 때 표현 노트에 더해져요.
// - GROUP: 메뉴에서 장면을 묶는 곳

export const GROUPS = [
  { id: 'home', title: '🏠 집에서' },
  { id: 'school', title: '🏫 학교에서' },
  { id: 'eat', title: '🍽️ 먹을 때' },
  { id: 'out', title: '🌳 밖에서' },
  { id: 'heart', title: '💗 친구·마음' },
];

export const GROUP = {
  morning: 'home', 'school-go': 'school', 'new-friend': 'school', recess: 'school', lunch: 'school', art: 'school',
  nature: 'out', weather: 'home', dinner: 'home', bedtime: 'home', homework: 'home', playdate: 'heart',
  feelings: 'heart', birthday: 'heart', sorry: 'heart', weekend: 'home', library: 'school',
};

export const MORE_SCENES = [
  // ---------- 1단계 ----------
  {
    id: 'mart', icon: '🛒', title: '마트에서', where: '마트', time: [10, 20], level: 1, group: 'out',
    learn: [['What do we need?', '뭐가 필요해?'], ['Can we get some?', '좀 사도 돼?'], ["Let's pay.", '계산하자.']],
    turns: [
      {
        say: ["We're at the store! What do we need?", '마트에 왔다! 뭐가 필요해?'],
        options: [
          { en: 'We need milk and eggs.', ko: '우유랑 달걀이 필요해.', accept: ['milk', 'egg', 'eggs'], reply: ['Okay! Milk and eggs. Got it!', '좋아! 우유랑 달걀. 알았어!'] },
          { en: 'Some apples and bananas!', ko: '사과랑 바나나 좀!', accept: ['apple', 'apples', 'banana', 'bananas', 'fruit'], reply: ['Yummy fruit! Let\'s find them.', '맛있는 과일! 찾아보자.'] },
          { en: 'Bread for breakfast.', ko: '아침에 먹을 빵.', accept: ['bread', 'breakfast'], reply: ['The bread smells so good!', '빵 냄새 진짜 좋다!'] },
        ],
      },
      {
        say: ['Ooh, look! Ice cream! Can we get some?', '오, 봐! 아이스크림! 좀 사도 돼?'],
        options: [
          { en: "Just one. Let's get chocolate!", ko: '하나만. 초콜릿 맛 사자!', accept: ['one', 'chocolate', 'just'], reply: ['Yay! Chocolate is the best!', '야호! 초콜릿이 최고야!'] },
          { en: 'Not today. We have some at home.', ko: '오늘은 안 돼. 집에 있어.', accept: ['not', 'no', 'home', 'today'], reply: ['Oh, okay. We can eat it at home!', '아, 알았어. 집에서 먹으면 되지!'] },
        ],
      },
      {
        say: ['Our cart is full! What now?', '카트가 꽉 찼어! 이제 뭐 해?'],
        options: [
          { en: "Let's pay. I'll put things on the counter.", ko: '계산하자. 내가 계산대에 올려놓을게.', accept: ['pay', 'counter', 'put'], reply: ['Beep, beep! What a good helper!', '삑, 삑! 정말 잘 돕는다!'] },
          { en: "Let's bring our own bag.", ko: '우리 장바구니에 담자.', accept: ['bag', 'bring', 'own'], reply: ['Good idea! That helps the Earth.', '좋은 생각! 지구를 돕는 거야.'] },
        ],
      },
    ],
  },
  {
    id: 'pet', icon: '🐶', title: '강아지 돌보기', where: '집', time: [7, 20], level: 1, group: 'home',
    learn: [['Is he hungry?', '배고픈가 봐?'], ["Let's take him for a walk.", '산책시키자.'], ['Good boy!', '착하지!']],
    turns: [
      {
        say: ['Woof! The puppy is barking. Is he hungry?', '멍! 강아지가 짖어. 배고픈가 봐?'],
        options: [
          { en: "Yes! Let's give him some food.", ko: '응! 밥 좀 주자.', accept: ['yes', 'food', 'give', 'feed'], reply: ['Crunch, crunch! He loves it.', '와작와작! 엄청 좋아해.'] },
          { en: 'Maybe he wants water.', ko: '물이 먹고 싶나 봐.', accept: ['water', 'thirsty', 'drink', 'maybe'], reply: ['Slurp, slurp! You were right!', '할짝할짝! 네 말이 맞았어!'] },
        ],
      },
      {
        say: ['He is bringing his leash. What does he want?', '강아지가 목줄을 물고 와. 뭘 원하는 걸까?'],
        options: [
          { en: "He wants to go for a walk!", ko: '산책 가고 싶대!', accept: ['walk', 'go', 'outside'], reply: ["Let's take him for a walk!", '산책시키자!'] },
          { en: 'He wants to play with us.', ko: '우리랑 놀고 싶대.', accept: ['play', 'ball', 'us'], reply: ['Throw the ball! Fetch!', '공 던져! 가져와!'] },
        ],
      },
      {
        say: ['He sat down when I said "Sit!" Wow!', '"앉아!" 했더니 앉았어! 우와!'],
        options: [
          { en: 'Good boy! Here is a treat.', ko: '착하지! 간식 줄게.', accept: ['good', 'treat', 'boy', 'snack'], reply: ['He is wagging his tail!', '꼬리를 흔들어!'] },
          { en: "Let's teach him to shake hands!", ko: '손 주기도 가르쳐 보자!', accept: ['shake', 'hand', 'hands', 'teach'], reply: ['Paw, please! Yay, he did it!', '손! 야호, 했다!'] },
        ],
      },
    ],
  },
  {
    id: 'clean-room', icon: '🧹', title: '방 정리하기', where: '내 방', time: [9, 21], level: 1, group: 'home',
    learn: [['Clean up your room.', '방 정리하자.'], ['Where does this go?', '이거 어디에 둬?'], ['It looks so nice!', '정말 깔끔하다!']],
    turns: [
      {
        say: ['Uh-oh, your room is messy. Let\'s clean up!', '어머, 방이 엉망이야. 정리하자!'],
        options: [
          { en: "Okay! I'll pick up my toys.", ko: '알았어! 장난감 주울게.', accept: ['okay', 'ok', 'toys', 'toy', 'pick'], reply: ['Into the toy box! One, two, three!', '장난감 상자에 쏙! 하나, 둘, 셋!'] },
          { en: 'Can you help me?', ko: '도와줄래?', accept: ['help', 'you'], reply: ['Sure! Teamwork!', '그럼! 같이 하자!'] },
        ],
      },
      {
        say: ['Where does this book go?', '이 책은 어디에 둬?'],
        options: [
          { en: 'On the bookshelf, please.', ko: '책장에 꽂아 줘.', accept: ['shelf', 'bookshelf', 'on'], reply: ['There! All the books are in a line.', '자! 책이 나란히 줄 섰어.'] },
          { en: 'Put it on my desk.', ko: '내 책상 위에 둬.', accept: ['desk', 'put'], reply: ['Okay, on the desk!', '알았어, 책상 위에!'] },
        ],
      },
      {
        say: ['We did it! How does it look?', '다 했다! 어때 보여?'],
        options: [
          { en: 'It looks so nice and clean!', ko: '정말 깔끔하다!', accept: ['nice', 'clean', 'good', 'great'], reply: ['High five! Now we can play.', '하이파이브! 이제 놀자.'] },
          { en: 'I can find everything now!', ko: '이제 다 찾을 수 있어!', accept: ['find', 'everything'], reply: ['That is the magic of cleaning!', '그게 정리의 마법이야!'] },
        ],
      },
    ],
  },
  {
    id: 'bath', icon: '🛁', title: '목욕 시간', where: '욕실', time: [17, 22], level: 1, group: 'home',
    learn: [["It's bath time.", '목욕할 시간이야.'], ['The water is too hot.', '물이 너무 뜨거워.'], ['Dry yourself with a towel.', '수건으로 닦아.']],
    turns: [
      {
        say: ["It's bath time! Is the water okay?", '목욕할 시간이야! 물 괜찮아?'],
        options: [
          { en: "It's just right!", ko: '딱 좋아!', accept: ['right', 'good', 'okay', 'ok', 'fine'], reply: ['Splash, splash! So warm!', '첨벙첨벙! 따뜻하다!'] },
          { en: 'The water is too hot!', ko: '물이 너무 뜨거워!', accept: ['hot', 'too'], reply: ['Let\'s add some cold water. Better?', '찬물을 좀 넣자. 이제 괜찮아?'] },
        ],
      },
      {
        say: ['Look! I made lots of bubbles!', '봐! 거품 엄청 많이 만들었어!'],
        options: [
          { en: 'I can make a bubble beard!', ko: '나는 거품 수염 만들 수 있어!', accept: ['beard', 'bubble', 'bubbles'], reply: ['Haha! You look like Santa!', '하하! 산타 할아버지 같아!'] },
          { en: "Don't get soap in your eyes!", ko: '눈에 비누 들어가지 않게 해!', accept: ['soap', 'eyes', 'eye'], reply: ['Thanks! I will close my eyes.', '고마워! 눈 감을게.'] },
        ],
      },
      {
        say: ["All clean! I'm dripping wet.", '깨끗해졌다! 물이 뚝뚝 떨어져.'],
        options: [
          { en: 'Dry yourself with a towel.', ko: '수건으로 닦아.', accept: ['towel', 'dry'], reply: ['So soft and fluffy!', '정말 보송보송해!'] },
          { en: "Let's put on our pajamas.", ko: '잠옷 입자.', accept: ['pajamas', 'pajama', 'put'], reply: ['Cozy! I smell like flowers.', '포근해! 꽃 냄새 난다.'] },
        ],
      },
    ],
  },
  {
    id: 'music', icon: '🎵', title: '음악 시간', where: '음악실', time: [9, 15], level: 1, group: 'school',
    learn: [['Can you play the piano?', '피아노 칠 수 있어?'], ["Let's sing together.", '같이 노래하자.'], ['That was beautiful!', '정말 멋졌어!']],
    turns: [
      {
        say: ['Look at all the instruments! Can you play the piano?', '악기가 엄청 많다! 피아노 칠 수 있어?'],
        options: [
          { en: 'Yes, a little!', ko: '응, 조금!', accept: ['yes', 'little', 'bit'], reply: ['Wow! Play a song for me!', '우와! 한 곡 쳐 줘!'] },
          { en: 'No, but I can play the drum!', ko: '아니, 하지만 북은 칠 수 있어!', accept: ['drum', 'drums', 'no'], reply: ['Boom, boom, boom! Cool!', '둥, 둥, 둥! 멋지다!'] },
        ],
      },
      {
        say: ["Let's sing a song together! Which one?", '같이 노래하자! 무슨 노래?'],
        options: [
          { en: 'Twinkle, Twinkle, Little Star!', ko: '반짝반짝 작은 별!', accept: ['twinkle', 'star', 'little'], reply: ['Twinkle, twinkle, little star... ♪', '반짝반짝 작은 별... ♪'] },
          { en: 'The Happy Birthday song!', ko: '생일 축하 노래!', accept: ['birthday', 'happy'], reply: ['But it is not my birthday! Haha!', '근데 내 생일 아닌데! 하하!'] },
        ],
      },
      {
        say: ['How was my singing?', '나 노래 어땠어?'],
        options: [
          { en: 'That was beautiful!', ko: '정말 멋졌어!', accept: ['beautiful', 'great', 'good', 'nice'], reply: ['Thank you! You sing well too!', '고마워! 너도 노래 잘해!'] },
          { en: 'A little loud, but fun!', ko: '조금 시끄러웠지만 재밌었어!', accept: ['loud', 'fun'], reply: ['Oops! I will sing softly next time.', '앗! 다음엔 살살 부를게.'] },
        ],
      },
    ],
  },
  {
    id: 'pe', icon: '⚽', title: '체육 시간', where: '운동장', time: [9, 16], level: 1, group: 'school',
    learn: [['Pass me the ball!', '나한테 공 패스해!'], ['Nice shot!', '잘 찼다!'], ["Let's warm up.", '준비운동 하자.']],
    turns: [
      {
        say: ["It's P.E. time! Let's warm up first.", '체육 시간이다! 먼저 준비운동 하자.'],
        options: [
          { en: "Okay! Let's stretch our arms.", ko: '좋아! 팔을 쭉 펴자.', accept: ['stretch', 'arms', 'arm', 'okay', 'ok'], reply: ['Up and down! One, two!', '위로 아래로! 하나, 둘!'] },
          { en: "Let's run around the field!", ko: '운동장 한 바퀴 뛰자!', accept: ['run', 'field', 'around'], reply: ['Ready, set, go!', '준비, 시작!'] },
        ],
      },
      {
        say: ["We're playing soccer! I'm open!", '축구 한다! 나 비었어!'],
        options: [
          { en: 'Here! I will pass you the ball!', ko: '여기! 공 패스할게!', accept: ['pass', 'ball', 'here'], reply: ['Got it! Shoot... GOAL!', '받았다! 슛... 골인!'] },
          { en: 'I will kick it to the goal!', ko: '골대로 찰게!', accept: ['kick', 'goal', 'shoot'], reply: ['Nice shot! You scored!', '잘 찼다! 골 넣었어!'] },
        ],
      },
      {
        say: ['Whew! I am so thirsty.', '휴! 너무 목말라.'],
        options: [
          { en: "Let's drink some water.", ko: '물 좀 마시자.', accept: ['water', 'drink'], reply: ['Ahh, that feels so good!', '아, 시원하다!'] },
          { en: 'Good game! High five!', ko: '좋은 경기였어! 하이파이브!', accept: ['game', 'high five', 'five', 'good'], reply: ['High five! Great teamwork!', '하이파이브! 팀워크 최고!'] },
        ],
      },
    ],
  },
  {
    id: 'rainy', icon: '☔', title: '비 오는 날', where: '현관', time: [6, 20], level: 1, group: 'out',
    learn: [["It's raining outside.", '밖에 비가 와.'], ['Take your umbrella.', '우산 챙겨.'], ['I got wet!', '다 젖었어!']],
    turns: [
      {
        say: ["Oh, it's raining outside. What do we need?", '앗, 밖에 비가 와. 뭐가 필요할까?'],
        options: [
          { en: 'My umbrella and rain boots!', ko: '우산이랑 장화!', accept: ['umbrella', 'boots', 'rain boots'], reply: ['Good! Now we are ready.', '좋아! 이제 준비됐다.'] },
          { en: 'A raincoat!', ko: '비옷!', accept: ['raincoat', 'coat'], reply: ['Yellow raincoat? So cute!', '노란 비옷? 귀엽다!'] },
        ],
      },
      {
        say: ['Listen! Pitter-patter. Do you like the rain?', '들어 봐! 똑똑똑. 비 좋아해?'],
        options: [
          { en: 'Yes! I like jumping in puddles.', ko: '응! 물웅덩이에서 뛰는 거 좋아.', accept: ['yes', 'puddle', 'puddles', 'jump', 'jumping'], reply: ['Splash! Me too!', '첨벙! 나도!'] },
          { en: "Not really. I can't play outside.", ko: '별로. 밖에서 못 놀잖아.', accept: ['no', 'not', 'outside', "can't"], reply: ['We can play inside today!', '오늘은 안에서 놀면 돼!'] },
        ],
      },
      {
        say: ['Oh no, the wind took my hat! I got wet!', '앗, 바람에 모자 날아갔다! 다 젖었어!'],
        options: [
          { en: 'Come under my umbrella!', ko: '내 우산 밑으로 와!', accept: ['under', 'umbrella', 'come'], reply: ['Thank you! We can share.', '고마워! 같이 쓰자.'] },
          { en: "Let's go home and dry off.", ko: '집에 가서 말리자.', accept: ['home', 'dry', 'go'], reply: ['Good idea. Hot cocoa time!', '좋은 생각. 핫초코 마실 시간!'] },
        ],
      },
    ],
  },
  {
    id: 'snowday', icon: '⛄', title: '눈 오는 날', where: '놀이터', time: [7, 19], level: 1, group: 'out',
    learn: [["Let's make a snowman!", '눈사람 만들자!'], ["It's freezing!", '꽁꽁 얼겠다!'], ['Put on your gloves.', '장갑 껴.']],
    turns: [
      {
        say: ['Wow, everything is white! It snowed!', '우와, 온통 하얘! 눈이 왔다!'],
        options: [
          { en: "Let's make a snowman!", ko: '눈사람 만들자!', accept: ['snowman', 'make'], reply: ['Roll, roll, roll! A big snowball!', '데굴데굴! 큰 눈덩이!'] },
          { en: "Let's have a snowball fight!", ko: '눈싸움하자!', accept: ['snowball', 'fight', 'throw'], reply: ['Got you! Hehe!', '맞혔다! 헤헤!'] },
        ],
      },
      {
        say: ["Brrr! It's freezing! My hands are cold.", '으으! 꽁꽁 얼겠다! 손이 차가워.'],
        options: [
          { en: 'Put on your gloves.', ko: '장갑 껴.', accept: ['gloves', 'glove', 'mittens'], reply: ['Ahh, much better. Warm!', '아, 훨씬 낫다. 따뜻해!'] },
          { en: 'Rub your hands together like this.', ko: '이렇게 손을 비벼 봐.', accept: ['rub', 'hands', 'together'], reply: ['Rub, rub! It works!', '싹싹! 효과 있다!'] },
        ],
      },
      {
        say: ['Our snowman needs a face. What should we use?', '눈사람한테 얼굴이 필요해. 뭘로 할까?'],
        options: [
          { en: 'A carrot for the nose!', ko: '코는 당근으로!', accept: ['carrot', 'nose'], reply: ['Perfect! He looks so happy.', '딱이다! 정말 행복해 보여.'] },
          { en: 'Stones for the eyes!', ko: '눈은 돌멩이로!', accept: ['stone', 'stones', 'rock', 'rocks', 'eyes'], reply: ['Now he can see us! Hi, snowman!', '이제 우리가 보이겠다! 안녕, 눈사람!'] },
        ],
      },
    ],
  },
  {
    id: 'zoo', icon: '🦁', title: '동물원 나들이', where: '동물원', time: [9, 18], level: 1, group: 'out',
    learn: [['Which animal do you want to see?', '어떤 동물 보고 싶어?'], ["It's so big!", '엄청 크다!'], ["Don't feed the animals.", '동물한테 먹이 주면 안 돼.']],
    turns: [
      {
        say: ['We are at the zoo! Which animal do you want to see?', '동물원에 왔어! 어떤 동물 보고 싶어?'],
        options: [
          { en: 'The lions!', ko: '사자!', accept: ['lion', 'lions'], reply: ['Roar! The lion is so cool.', '어흥! 사자 정말 멋있다.'] },
          { en: 'I want to see the elephants!', ko: '코끼리 보고 싶어!', accept: ['elephant', 'elephants'], reply: ["Look! It's so big!", '봐! 엄청 크다!'] },
          { en: 'The monkeys!', ko: '원숭이!', accept: ['monkey', 'monkeys'], reply: ['Ooh ooh, ah ah! They are so funny.', '우끼끼! 정말 웃기다.'] },
        ],
      },
      {
        say: ['The giraffe is eating leaves. Can I give it my cookie?', '기린이 나뭇잎 먹어. 내 쿠키 줘도 돼?'],
        options: [
          { en: "No! Don't feed the animals.", ko: '안 돼! 동물한테 먹이 주면 안 돼.', accept: ["don't", 'dont', 'no', 'feed'], reply: ['Oh, right. Cookies are not good for giraffes.', '아, 맞다. 쿠키는 기린한테 안 좋지.'] },
          { en: 'The zookeeper feeds them.', ko: '사육사가 밥을 줘.', accept: ['zookeeper', 'keeper'], reply: ['The zookeeper knows best!', '사육사가 제일 잘 알지!'] },
        ],
      },
      {
        say: ['That was so fun! What was your favorite animal?', '정말 재밌었다! 제일 좋았던 동물은?'],
        options: [
          { en: 'The penguins! They walk so funny.', ko: '펭귄! 걷는 게 너무 웃겨.', accept: ['penguin', 'penguins'], reply: ['Waddle, waddle! Haha!', '뒤뚱뒤뚱! 하하!'] },
          { en: 'I liked all of them!', ko: '다 좋았어!', accept: ['all', 'everything', 'them'], reply: ["Let's come again soon!", '또 오자!'] },
        ],
      },
    ],
  },
  {
    id: 'bakery', icon: '🥐', title: '빵집에서', where: '빵집', time: [8, 20], level: 1, group: 'out',
    learn: [['Can I have this one?', '이거 주세요.'], ['How much is it?', '얼마예요?'], ['Here you are.', '여기 있어요.']],
    turns: [
      {
        say: ['Mmm, it smells so good! What do you want?', '음, 냄새 진짜 좋다! 뭐 먹고 싶어?'],
        options: [
          { en: 'Can I have this donut, please?', ko: '이 도넛 주세요.', accept: ['donut', 'doughnut'], reply: ['Sprinkles on top! Pretty!', '위에 알록달록 뿌린 거! 예쁘다!'] },
          { en: 'A croissant, please.', ko: '크루아상 주세요.', accept: ['croissant'], reply: ['Crispy and buttery! Good pick.', '바삭하고 고소해! 잘 골랐어.'] },
          { en: 'I want a cupcake!', ko: '컵케이크 먹고 싶어!', accept: ['cupcake', 'cake'], reply: ['A strawberry cupcake? Yum!', '딸기 컵케이크? 맛있겠다!'] },
        ],
      },
      {
        say: ['Let\'s ask. How much is it?', '물어보자. 얼마예요?'],
        options: [
          { en: 'Excuse me, how much is it?', ko: '저기요, 얼마예요?', accept: ['how much', 'much', 'excuse'], reply: ['"It\'s two dollars." Okay!', '"2달러예요." 알겠다!'] },
          { en: "It's on the sign. Two dollars!", ko: '안내판에 있어. 2달러!', accept: ['sign', 'two', 'dollars'], reply: ['You read it! Good job!', '읽었구나! 잘했어!'] },
        ],
      },
      {
        say: ['The baker says, "Here you are!" What do we say?', '빵집 아저씨가 "여기 있어요!" 해. 뭐라고 말할까?'],
        options: [
          { en: 'Thank you! Have a nice day!', ko: '고맙습니다! 좋은 하루 보내세요!', accept: ['thank', 'thanks', 'nice', 'day'], reply: ['So polite! The baker is smiling.', '정말 예의 바르다! 아저씨가 웃으셔.'] },
          { en: 'Thank you! It looks delicious.', ko: '고맙습니다! 맛있어 보여요.', accept: ['delicious', 'thank', 'looks'], reply: ["Let's eat it at the park!", '공원에서 먹자!'] },
        ],
      },
    ],
  },
  {
    id: 'bus-ride', icon: '🚌', title: '버스 타기', where: '버스 정류장', time: [7, 19], level: 1, group: 'out',
    learn: [['Here comes the bus!', '버스 온다!'], ['Hold on tight.', '꽉 잡아.'], ['This is our stop.', '여기서 내려.']],
    turns: [
      {
        say: ['We are waiting for the bus. Is it coming?', '버스 기다리는 중이야. 오고 있어?'],
        options: [
          { en: 'Yes! Here comes the bus!', ko: '응! 버스 온다!', accept: ['yes', 'here', 'comes', 'coming'], reply: ['Number 5! That is our bus!', '5번! 우리 버스다!'] },
          { en: 'Not yet. Two more minutes.', ko: '아직. 2분 더.', accept: ['not', 'yet', 'minutes', 'wait'], reply: ['Okay, let\'s wait in line.', '그래, 줄 서서 기다리자.'] },
        ],
      },
      {
        say: ['The bus is moving! Whoa, it is shaking!', '버스 출발한다! 우와, 흔들려!'],
        options: [
          { en: 'Hold on tight!', ko: '꽉 잡아!', accept: ['hold', 'tight', 'on'], reply: ['I\'m holding the handle. Safe!', '손잡이 잡았어. 안전!'] },
          { en: "Let's sit down here.", ko: '여기 앉자.', accept: ['sit', 'seat', 'here'], reply: ['Thanks! We can see the street.', '고마워! 길이 보인다.'] },
        ],
      },
      {
        say: ['Ding! Is this our stop?', '띵! 여기서 내려?'],
        options: [
          { en: "Yes! This is our stop. Let's get off.", ko: '응! 여기서 내려. 내리자.', accept: ['yes', 'stop', 'get off', 'off'], reply: ['Thank you, bus driver!', '기사님, 고맙습니다!'] },
          { en: 'No, the next one!', ko: '아니, 다음 정류장!', accept: ['no', 'next'], reply: ['Okay, I\'ll push the button next time.', '알았어, 다음에 벨 누를게.'] },
        ],
      },
    ],
  },
  // ---------- 2단계 ----------
  {
    id: 'doctor', icon: '🩺', title: '병원에서', where: '소아과', time: [9, 18], level: 2, group: 'out',
    learn: [["What's the matter?", '어디가 아프니?'], ['I have a headache.', '머리가 아파요.'], ['Get some rest.', '푹 쉬렴.']],
    turns: [
      {
        say: ['I am the doctor today! What\'s the matter?', '오늘은 내가 의사 선생님! 어디가 아프니?'],
        options: [
          { en: 'I have a headache.', ko: '머리가 아파요.', accept: ['headache', 'head'], reply: ['Oh no. Let me check.', '저런. 한번 볼게.'] },
          { en: 'I have a cough and a runny nose.', ko: '기침하고 콧물이 나요.', accept: ['cough', 'runny', 'nose', 'cold'], reply: ['Sounds like a cold.', '감기 같구나.'] },
          { en: 'My tummy hurts.', ko: '배가 아파요.', accept: ['tummy', 'stomach', 'hurts'], reply: ['Did you eat too much candy?', '사탕 너무 많이 먹었니?'] },
        ],
      },
      {
        say: ['Say "Ahh!" Open your mouth wide.', '"아~" 해 봐. 입 크게 벌려.'],
        options: [
          { en: 'Ahhh!', ko: '아~!', accept: ['ah', 'ahh', 'ahhh', 'aaa'], reply: ['Good! Your throat is a little red.', '좋아! 목이 조금 빨갛네.'] },
          { en: 'Will it hurt?', ko: '아파요?', accept: ['hurt', 'will', 'scared'], reply: ["Don't worry. It won't hurt at all.", '걱정 마. 하나도 안 아파.'] },
        ],
      },
      {
        say: ['Take this medicine and get some rest.', '이 약 먹고 푹 쉬렴.'],
        options: [
          { en: 'Thank you, doctor!', ko: '고맙습니다, 선생님!', accept: ['thank', 'thanks', 'doctor'], reply: ['Feel better soon!', '빨리 나으렴!'] },
          { en: 'Can I go to school tomorrow?', ko: '내일 학교 가도 돼요?', accept: ['school', 'tomorrow', 'go'], reply: ['If you feel better, yes!', '나아지면 가도 돼!'] },
        ],
      },
    ],
  },
  {
    id: 'directions', icon: '🗺️', title: '길 묻기', where: '동네 길', time: [8, 19], level: 2, group: 'out',
    learn: [['Excuse me, where is the library?', '실례지만, 도서관이 어디예요?'], ['Go straight and turn left.', '쭉 가서 왼쪽으로 돌아.'], ["It's next to the bank.", '은행 옆에 있어.']],
    turns: [
      {
        say: ['Hmm, I think we are lost. Let\'s ask someone.', '음, 길을 잃은 것 같아. 누구한테 물어보자.'],
        options: [
          { en: 'Excuse me, where is the library?', ko: '실례지만, 도서관이 어디예요?', accept: ['excuse', 'where', 'library'], reply: ['"Go straight and turn left."', '"쭉 가서 왼쪽으로 도세요."'] },
          { en: 'Excuse me, how do I get to the park?', ko: '실례지만, 공원에 어떻게 가요?', accept: ['park', 'how', 'get'], reply: ['"It\'s next to the bank."', '"은행 옆에 있어요."'] },
        ],
      },
      {
        say: ['Straight, then left... Which way is left?', '쭉 가서 왼쪽... 왼쪽이 어느 쪽이지?'],
        options: [
          { en: 'This way! The hand that makes an L.', ko: '이쪽! L 모양 되는 손.', accept: ['this', 'way', 'l'], reply: ['Ooh, smart trick!', '오, 똑똑한 방법이다!'] },
          { en: 'Left is where the flower shop is.', ko: '꽃집 있는 쪽이 왼쪽이야.', accept: ['flower', 'shop', 'left'], reply: ['I see it! Let\'s go.', '보인다! 가자.'] },
        ],
      },
      {
        say: ['We found it! What do we say to the nice man?', '찾았다! 친절한 아저씨한테 뭐라고 할까?'],
        options: [
          { en: 'Thank you so much for your help!', ko: '도와주셔서 정말 고맙습니다!', accept: ['thank', 'help', 'thanks'], reply: ['"You\'re welcome!" he said.', '"천만에요!" 하셨어.'] },
          { en: 'We will remember the way next time.', ko: '다음엔 길 기억할게요.', accept: ['remember', 'way', 'next'], reply: ['Me too! Straight and left!', '나도! 쭉 가서 왼쪽!'] },
        ],
      },
    ],
  },
  {
    id: 'shopping', icon: '👕', title: '옷 가게에서', where: '옷 가게', time: [10, 20], level: 2, group: 'out',
    learn: [['Can I try this on?', '이거 입어 봐도 돼요?'], ["It's too small.", '너무 작아요.'], ['How do I look?', '나 어때?']],
    turns: [
      {
        say: ['Look at this blue shirt! Do you like it?', '이 파란 셔츠 봐! 마음에 들어?'],
        options: [
          { en: 'I love it! Can I try this on?', ko: '좋아! 이거 입어 봐도 돼요?', accept: ['try', 'on', 'love'], reply: ['Sure! The fitting room is over there.', '그럼! 탈의실은 저기야.'] },
          { en: 'I like the green one better.', ko: '초록색이 더 좋아.', accept: ['green', 'better', 'one'], reply: ['Green is pretty too!', '초록색도 예쁘다!'] },
        ],
      },
      {
        say: ['Hmm, how is it? Does it fit?', '음, 어때? 잘 맞아?'],
        options: [
          { en: "It's too small. Do you have a bigger one?", ko: '너무 작아요. 더 큰 거 있어요?', accept: ['small', 'bigger', 'big'], reply: ['Here is a bigger one!', '여기 더 큰 거 있어!'] },
          { en: 'It fits well!', ko: '잘 맞아!', accept: ['fits', 'fit', 'well'], reply: ['Perfect!', '딱이다!'] },
        ],
      },
      {
        say: ['Turn around! Let me see.', '한 바퀴 돌아 봐! 보여 줘.'],
        options: [
          { en: 'How do I look?', ko: '나 어때?', accept: ['how', 'look', 'look?'], reply: ['You look great!', '정말 멋져!'] },
          { en: "I'll take it!", ko: '이걸로 할게요!', accept: ['take', 'buy'], reply: ["Let's go pay!", '계산하러 가자!'] },
        ],
      },
    ],
  },
  {
    id: 'video-call', icon: '📞', title: '할머니와 영상통화', where: '거실', time: [16, 21], level: 2, group: 'heart',
    learn: [['I miss you.', '보고 싶어요.'], ['What did you do today?', '오늘 뭐 했어?'], ['Take care!', '건강하세요!']],
    turns: [
      {
        say: ['Grandma is calling! Say hello!', '할머니한테 전화 왔어! 인사해!'],
        options: [
          { en: 'Hi, Grandma! I miss you!', ko: '할머니, 안녕하세요! 보고 싶어요!', accept: ['miss', 'grandma', 'hi', 'hello'], reply: ['"I miss you too, sweetie!"', '"할머니도 보고 싶단다, 우리 강아지!"'] },
          { en: 'Grandma, can you see me?', ko: '할머니, 제가 보여요?', accept: ['see', 'can'], reply: ['"Yes! You look taller!"', '"그럼! 키가 더 컸구나!"'] },
        ],
      },
      {
        say: ['Grandma asks, "What did you do today?"', '할머니가 "오늘 뭐 했니?" 하고 물으셔.'],
        options: [
          { en: 'I caught a new friend in the park!', ko: '공원에서 새 친구를 잡았어요!', accept: ['caught', 'friend', 'park'], reply: ['"Wow! Show me next time!"', '"우와! 다음에 보여 주렴!"'] },
          { en: 'I learned new English words.', ko: '새 영어 단어를 배웠어요.', accept: ['learned', 'english', 'words', 'word'], reply: ['"You are so smart!"', '"정말 똑똑하구나!"'] },
          { en: 'I helped Mom cook dinner.', ko: '엄마가 저녁 하시는 걸 도왔어요.', accept: ['helped', 'cook', 'dinner', 'mom'], reply: ['"What a good helper!"', '"정말 착하구나!"'] },
        ],
      },
      {
        say: ['It\'s time to say goodbye.', '이제 인사할 시간이야.'],
        options: [
          { en: 'Take care, Grandma! I love you!', ko: '할머니, 건강하세요! 사랑해요!', accept: ['take care', 'love', 'care'], reply: ['"I love you more! Bye-bye!"', '"할머니가 더 사랑해! 안녕!"'] },
          { en: 'Can I visit you this weekend?', ko: '이번 주말에 놀러 가도 돼요?', accept: ['visit', 'weekend'], reply: ['"Of course! I\'ll make your favorite food."', '"그럼! 좋아하는 음식 해 놓을게."'] },
        ],
      },
    ],
  },
  {
    id: 'lost-item', icon: '🔍', title: '물건을 잃어버렸어', where: '교실', time: [8, 17], level: 2, group: 'school',
    learn: [["I can't find my eraser.", '지우개를 못 찾겠어.'], ['Did you check your bag?', '가방 확인해 봤어?'], ['Here it is!', '여기 있다!']],
    turns: [
      {
        say: ["Oh no! I can't find my eraser.", '어떡해! 지우개를 못 찾겠어.'],
        options: [
          { en: 'Did you check your bag?', ko: '가방 확인해 봤어?', accept: ['bag', 'check'], reply: ['Hmm, not in my bag.', '음, 가방엔 없어.'] },
          { en: 'You can use mine.', ko: '내 거 써도 돼.', accept: ['mine', 'use', 'my'], reply: ['Thank you! You are so kind.', '고마워! 너 정말 친절하다.'] },
        ],
      },
      {
        say: ['What does it look like? Let\'s look together.', '어떻게 생겼어? 같이 찾아보자.'],
        options: [
          { en: "It's small and pink, like a strawberry.", ko: '작고 분홍색이야, 딸기처럼.', accept: ['pink', 'small', 'strawberry'], reply: ['A strawberry eraser! I\'ll look under the desk.', '딸기 지우개! 책상 밑을 볼게.'] },
          { en: 'It has my name on it.', ko: '내 이름이 써 있어.', accept: ['name'], reply: ['Good idea to write your name!', '이름 쓴 거 좋은 생각이야!'] },
        ],
      },
      {
        say: ['Look! Is this it? It was under the chair!', '봐! 이거야? 의자 밑에 있었어!'],
        options: [
          { en: 'Yes! Here it is! Thank you!', ko: '응! 여기 있다! 고마워!', accept: ['yes', 'thank', 'here', 'it'], reply: ['Yay! We found it together!', '야호! 같이 찾았다!'] },
          { en: 'No, that is not mine. Let\'s give it to the teacher.', ko: '아니, 내 거 아니야. 선생님께 드리자.', accept: ['no', 'not', 'teacher'], reply: ['Good idea. Someone will be happy!', '좋은 생각. 누군가 기뻐하겠다!'] },
        ],
      },
    ],
  },
  {
    id: 'cooking', icon: '🍳', title: '같이 요리하기', where: '부엌', time: [10, 20], level: 2, group: 'home',
    learn: [["Let's make sandwiches.", '샌드위치 만들자.'], ['Be careful with the knife.', '칼 조심해.'], ['It tastes great!', '정말 맛있다!']],
    turns: [
      {
        say: ["Let's make lunch together! What should we make?", '같이 점심 만들자! 뭐 만들까?'],
        options: [
          { en: "Let's make sandwiches.", ko: '샌드위치 만들자.', accept: ['sandwich', 'sandwiches'], reply: ['Bread, cheese, ham, and lettuce!', '빵, 치즈, 햄, 그리고 상추!'] },
          { en: 'How about fried rice?', ko: '볶음밥 어때?', accept: ['fried', 'rice'], reply: ['Yum! With eggs and vegetables!', '맛있겠다! 달걀이랑 채소 넣어서!'] },
        ],
      },
      {
        say: ['Can I cut the tomato with the knife?', '내가 칼로 토마토 잘라도 돼?'],
        options: [
          { en: 'Be careful with the knife! Ask Mom for help.', ko: '칼 조심해! 엄마한테 도와 달라고 해.', accept: ['careful', 'knife', 'mom', 'help'], reply: ['Okay, safety first!', '알았어, 안전이 먼저!'] },
          { en: 'I will wash the vegetables.', ko: '나는 채소를 씻을게.', accept: ['wash', 'vegetables'], reply: ['Great teamwork!', '팀워크 최고!'] },
        ],
      },
      {
        say: ['Done! Take a bite. How is it?', '완성! 한 입 먹어 봐. 어때?'],
        options: [
          { en: 'It tastes great!', ko: '정말 맛있다!', accept: ['great', 'tastes', 'good', 'yummy', 'delicious'], reply: ['We are good cooks!', '우리 요리 잘한다!'] },
          { en: "It's a little salty.", ko: '조금 짜.', accept: ['salty', 'little'], reply: ['Oops! Next time, less salt.', '앗! 다음엔 소금 조금만.'] },
        ],
      },
    ],
  },
  {
    id: 'field-trip', icon: '🦕', title: '박물관 체험학습', where: '자연사 박물관', time: [9, 16], level: 2, group: 'school',
    learn: [['What is that?', '저건 뭐야?'], ['It lived a long time ago.', '아주 오래전에 살았어.'], ["Don't touch, please.", '만지지 마세요.']],
    turns: [
      {
        say: ['Wow! What is that huge skeleton?', '우와! 저 커다란 뼈는 뭐야?'],
        options: [
          { en: "It's a dinosaur! A T-rex!", ko: '공룡이야! 티라노사우루스!', accept: ['dinosaur', 't-rex', 'trex', 'rex'], reply: ['Roar! It has such big teeth!', '크아앙! 이빨이 엄청 커!'] },
          { en: "Let's read the sign.", ko: '안내판을 읽어 보자.', accept: ['read', 'sign'], reply: ['"It lived a long time ago." Cool!', '"아주 오래전에 살았어요." 멋지다!'] },
        ],
      },
      {
        say: ['Can I touch it? It looks so cool!', '만져 봐도 돼? 정말 멋져!'],
        options: [
          { en: "Don't touch, please. Look with your eyes.", ko: '만지면 안 돼. 눈으로만 봐.', accept: ["don't", 'dont', 'touch', 'eyes'], reply: ['Oh, okay! Eyes only.', '아, 알았어! 눈으로만.'] },
          { en: 'We can touch the rocks over there!', ko: '저기 있는 돌은 만져도 돼!', accept: ['rocks', 'rock', 'there'], reply: ['Ooh, this rock is so smooth.', '오, 이 돌 엄청 매끈해.'] },
        ],
      },
      {
        say: ['What was the best part of the trip?', '체험학습에서 뭐가 제일 좋았어?'],
        options: [
          { en: 'The dinosaurs, of course!', ko: '당연히 공룡!', accept: ['dinosaur', 'dinosaurs', 'course'], reply: ['Me too! Let\'s draw one at home.', '나도! 집에서 그려 보자.'] },
          { en: 'Eating lunch with my friends!', ko: '친구들이랑 점심 먹은 거!', accept: ['lunch', 'friends', 'eating'], reply: ['Haha! Lunch is always the best.', '하하! 점심은 언제나 최고지.'] },
        ],
      },
    ],
  },
  {
    id: 'thank-you', icon: '💐', title: '고마운 마음 전하기', where: '교실', time: [8, 20], level: 2, group: 'heart',
    learn: [['Thank you for helping me.', '도와줘서 고마워.'], ['You are the best!', '네가 최고야!'], ["You're welcome.", '천만에.']],
    turns: [
      {
        say: ['Let\'s make a card for someone special. Who is it for?', '특별한 사람한테 카드 만들자. 누구한테 줄까?'],
        options: [
          { en: "It's for my teacher.", ko: '우리 선생님께.', accept: ['teacher'], reply: ['Your teacher will be so happy!', '선생님이 정말 기뻐하시겠다!'] },
          { en: "It's for Mom and Dad.", ko: '엄마 아빠께.', accept: ['mom', 'dad', 'parents'], reply: ['Aww, that is so sweet.', '와, 정말 다정하다.'] },
        ],
      },
      {
        say: ['What should we write?', '뭐라고 쓸까?'],
        options: [
          { en: 'Thank you for helping me.', ko: '도와주셔서 고맙습니다.', accept: ['thank', 'helping', 'help'], reply: ['Simple and kind. I like it!', '간단하고 다정해. 좋다!'] },
          { en: 'You are the best! I love you.', ko: '최고예요! 사랑해요.', accept: ['best', 'love'], reply: ["Let's draw a big heart too!", '큰 하트도 그리자!'] },
        ],
      },
      {
        say: ['We gave the card! They said "Thank you!" What do we say?', '카드 드렸어! "고마워!" 하셨어. 우리는 뭐라고 해?'],
        options: [
          { en: "You're welcome!", ko: '천만에요!', accept: ['welcome', "you're", 'youre'], reply: ['That felt so good!', '기분 정말 좋다!'] },
          { en: 'We made it together!', ko: '우리가 같이 만들었어요!', accept: ['together', 'made'], reply: ['We are a great team!', '우리 정말 좋은 팀이야!'] },
        ],
      },
    ],
  },
];

// 원래 장면의 가운데 대화를 가끔 바꿔 주는 다른 대화
export const EXTRA_TURNS = {
  morning: [{
    say: ['What do you want to wear today?', '오늘 뭐 입을래?'],
    learn: [['What do you want to wear?', '뭐 입을래?']],
    options: [
      { en: 'My yellow T-shirt!', ko: '노란 티셔츠!', accept: ['yellow', 'shirt', 't-shirt'], reply: ['Bright like the sun!', '해처럼 밝다!'] },
      { en: "It's cold. I'll wear a sweater.", ko: '추워. 스웨터 입을래.', accept: ['cold', 'sweater', 'jacket'], reply: ['Good idea! Stay warm.', '좋은 생각! 따뜻하게 입어.'] },
    ],
  }],
  'school-go': [{
    say: ['Look both ways before we cross the street!', '길 건너기 전에 양쪽을 봐!'],
    learn: [['Look both ways.', '양쪽을 살펴.']],
    options: [
      { en: 'Left, right, left. All clear!', ko: '왼쪽, 오른쪽, 왼쪽. 괜찮아!', accept: ['left', 'right', 'clear'], reply: ['Great! Now we can cross.', '좋아! 이제 건너자.'] },
      { en: 'The light is green. Let\'s go!', ko: '초록불이야. 가자!', accept: ['green', 'light', 'go'], reply: ['Raise your hand and walk!', '손 들고 건너자!'] },
    ],
  }],
  'new-friend': [{
    say: ['What is your favorite color?', '제일 좋아하는 색이 뭐야?'],
    learn: [["What's your favorite color?", '제일 좋아하는 색은?']],
    options: [
      { en: 'My favorite color is blue.', ko: '내가 제일 좋아하는 색은 파란색이야.', accept: ['blue', 'favorite'], reply: ['Like the sky! I like blue too.', '하늘처럼! 나도 파란색 좋아.'] },
      { en: 'I like pink and purple!', ko: '분홍색이랑 보라색!', accept: ['pink', 'purple'], reply: ['Pretty! Like flowers.', '예쁘다! 꽃 같아.'] },
    ],
  }],
  recess: [{
    say: ['Do you want to play hide-and-seek?', '숨바꼭질 할래?'],
    learn: [['Ready or not, here I come!', '찾는다, 간다!']],
    options: [
      { en: "Yes! You're it! Count to ten!", ko: '응! 네가 술래야! 열까지 세!', accept: ['yes', 'count', 'ten', "you're it"], reply: ['One, two, three... Ready or not, here I come!', '하나, 둘, 셋... 찾는다, 간다!'] },
      { en: "Let's jump rope instead.", ko: '대신 줄넘기 하자.', accept: ['jump', 'rope'], reply: ['Jump, jump! I can do ten!', '폴짝폴짝! 열 번 할 수 있어!'] },
    ],
  }],
  lunch: [{
    say: ['Do you eat vegetables?', '너 채소 먹어?'],
    learn: [['I don\'t like carrots.', '나 당근 안 좋아해.']],
    options: [
      { en: 'Yes! Broccoli makes me strong.', ko: '응! 브로콜리 먹으면 튼튼해져.', accept: ['yes', 'broccoli', 'strong'], reply: ['Like a superhero!', '슈퍼히어로처럼!'] },
      { en: "I don't like carrots, but I try.", ko: '당근 안 좋아하는데, 먹어 보긴 해.', accept: ["don't", 'carrots', 'try'], reply: ['Good for you! One bite is great.', '잘한다! 한 입이면 충분해.'] },
    ],
  }],
  art: [{
    say: ['Oops! I got paint on my hands!', '앗! 손에 물감 묻었다!'],
    learn: [['Let\'s wash it off.', '씻어 내자.']],
    options: [
      { en: "Let's wash it off with soap.", ko: '비누로 씻어 내자.', accept: ['wash', 'soap'], reply: ['Rub, rub! All clean.', '싹싹! 다 깨끗해졌다.'] },
      { en: 'Make a handprint on the paper!', ko: '종이에 손도장 찍자!', accept: ['handprint', 'paper', 'hand'], reply: ['Ooh, it looks like a tree!', '오, 나무 같아!'] },
    ],
  }],
  nature: [{
    say: ['Listen! What sound is that?', '들어 봐! 무슨 소리지?'],
    learn: [['What sound is that?', '무슨 소리야?']],
    options: [
      { en: "It's a bird singing.", ko: '새가 노래하는 거야.', accept: ['bird', 'singing', 'sing'], reply: ['Tweet, tweet! So pretty.', '짹짹! 예쁘다.'] },
      { en: 'Maybe it is a cicada.', ko: '매미인가 봐.', accept: ['cicada', 'bug', 'maybe'], reply: ['Maem-maem! So loud!', '맴맴! 엄청 시끄럽다!'] },
    ],
  }],
  weather: [{
    say: ['Is it hot or cold outside?', '밖이 더워, 추워?'],
    learn: [["It's warm and sunny.", '따뜻하고 맑아.']],
    options: [
      { en: "It's warm and sunny.", ko: '따뜻하고 맑아.', accept: ['warm', 'sunny'], reply: ['Perfect weather for a walk!', '산책하기 딱 좋은 날씨!'] },
      { en: "It's chilly. Wear a jacket.", ko: '쌀쌀해. 겉옷 입어.', accept: ['chilly', 'cold', 'jacket'], reply: ['Okay! Zip, zip!', '알았어! 지퍼 쭉!'] },
    ],
  }],
  dinner: [{
    say: ['Can I have some more rice, please?', '밥 좀 더 먹어도 돼?'],
    learn: [['Can I have some more?', '좀 더 먹어도 돼?']],
    options: [
      { en: 'Sure! Here you go.', ko: '그럼! 여기 있어.', accept: ['sure', 'here', 'go'], reply: ['Thank you! It is so good.', '고마워! 정말 맛있어.'] },
      { en: "I'm full. You can have mine.", ko: '나 배불러. 내 거 먹어.', accept: ['full', 'mine'], reply: ['Really? Thanks!', '정말? 고마워!'] },
    ],
  }],
  bedtime: [{
    say: ['Can you turn off the light?', '불 좀 꺼 줄래?'],
    learn: [['Turn off the light.', '불 꺼.']],
    options: [
      { en: 'Okay. Click! Good night.', ko: '알았어. 딸깍! 잘 자.', accept: ['okay', 'ok', 'click', 'night'], reply: ['It is dark... but you are here!', '깜깜하다... 그래도 네가 있어!'] },
      { en: "Let's keep the night light on.", ko: '수면등은 켜 두자.', accept: ['keep', 'lamp', 'night light'], reply: ['Thanks. It looks like a little moon.', '고마워. 작은 달 같아.'] },
    ],
  }],
  homework: [{
    say: ['How do you spell "apple"?', '"apple" 철자가 뭐야?'],
    learn: [['How do you spell it?', '철자가 뭐야?']],
    options: [
      { en: 'A, P, P, L, E!', ko: 'A, P, P, L, E!', accept: ['a p p l e', 'apple', 'p'], reply: ['Two Ps! I almost forgot.', 'P가 두 개! 깜빡할 뻔했다.'] },
      { en: "Let's look in the dictionary.", ko: '사전에서 찾아보자.', accept: ['dictionary', 'look'], reply: ['Found it! A-P-P-L-E.', '찾았다! A-P-P-L-E.'] },
    ],
  }],
  playdate: [{
    say: ['What snack do you like?', '무슨 간식 좋아해?'],
    learn: [['What snack do you like?', '무슨 간식 좋아해?']],
    options: [
      { en: 'Popcorn! We can watch a movie.', ko: '팝콘! 영화 보면서 먹자.', accept: ['popcorn', 'movie'], reply: ['Movie night! So fun.', '영화의 밤! 신난다.'] },
      { en: 'Fruit and yogurt.', ko: '과일이랑 요거트.', accept: ['fruit', 'yogurt'], reply: ['Healthy and yummy!', '건강하고 맛있어!'] },
    ],
  }],
  feelings: [{
    say: ['What makes you happy?', '너는 뭐 할 때 행복해?'],
    learn: [['What makes you happy?', '뭐 할 때 행복해?']],
    options: [
      { en: 'Playing with you makes me happy!', ko: '너랑 놀 때 행복해!', accept: ['playing', 'play', 'you'], reply: ['Aww! Me too!', '와! 나도!'] },
      { en: 'Hugs from my family.', ko: '가족이 안아 줄 때.', accept: ['hug', 'hugs', 'family'], reply: ['Big hug! Squeeze!', '꼭 안아 줄게! 꾹!'] },
    ],
  }],
  birthday: [{
    say: ['Let\'s play a party game! Musical chairs?', '파티 게임 하자! 의자 뺏기?'],
    learn: [["Let's play a game!", '게임 하자!']],
    options: [
      { en: 'Yes! When the music stops, sit down!', ko: '좋아! 음악이 멈추면 앉아!', accept: ['music', 'stops', 'sit', 'yes'], reply: ['Quick! I got a chair!', '빨리! 의자 잡았다!'] },
      { en: "Let's hit the piñata!", ko: '피냐타 터뜨리자!', accept: ['pinata', 'piñata', 'hit'], reply: ['Candy everywhere! Yay!', '사탕이 와르르! 야호!'] },
    ],
  }],
  sorry: [{
    say: ["You didn't share the blocks with me.", '너 블록 나눠 주지 않았잖아.'],
    learn: [["Let's take turns.", '돌아가면서 하자.']],
    options: [
      { en: "You're right. Let's take turns.", ko: '네 말이 맞아. 돌아가면서 하자.', accept: ['turns', 'take', 'right'], reply: ['Thanks! You go first.', '고마워! 너 먼저 해.'] },
      { en: "I'm sorry. Here, you can have half.", ko: '미안해. 자, 반 가져.', accept: ['sorry', 'half', 'have'], reply: ["Let's build a castle together!", '같이 성 만들자!'] },
    ],
  }],
  weekend: [{
    say: ['Who are you going with?', '누구랑 가?'],
    learn: [['Who are you going with?', '누구랑 가?']],
    options: [
      { en: 'With my whole family!', ko: '우리 가족 다 같이!', accept: ['family', 'whole'], reply: ['Family trip! How fun.', '가족 여행! 재밌겠다.'] },
      { en: 'With my best friend.', ko: '제일 친한 친구랑.', accept: ['friend', 'best'], reply: ['Take lots of pictures!', '사진 많이 찍어!'] },
    ],
  }],
  library: [{
    say: ['How many books can we borrow?', '책 몇 권 빌릴 수 있어?'],
    learn: [['Can I borrow this book?', '이 책 빌릴 수 있어요?']],
    options: [
      { en: 'We can borrow three books.', ko: '세 권 빌릴 수 있어.', accept: ['three', 'borrow', '3'], reply: ['Then I will pick three!', '그럼 세 권 고를래!'] },
      { en: "Let's ask the librarian.", ko: '사서 선생님께 여쭤보자.', accept: ['ask', 'librarian'], reply: ['"Two weeks, please bring them back."', '"2주 뒤에 돌려주세요."'] },
    ],
  }],
};
