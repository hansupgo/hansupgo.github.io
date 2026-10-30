// 짝꿍과 영어로 이야기하기: 대화 장면
// 미국 초등학생이 집·학교·친구와 실제로 쓰는 쉬운 말을 바탕으로 했습니다.
// say: [영어, 한국어]  options: 고를 수 있는 대답
//   en/ko: 대답 문장, accept: 직접 쓸 때 알아듣는 낱말, reply: 짝꿍의 반응 [영어, 한국어]
// learn: 이 장면에서 배우는 표현 [영어, 한국어]
// time: 이 시간대에 "오늘의 대화"로 추천 (시작~끝 시각)
// level: 1(쉬움) / 2(조금 길게) — 짝꿍이 어린이로 자라면 2단계 장면이 열립니다

export const SCENES = [
  {
    id: 'morning', icon: '🌅', title: '좋은 아침', where: '집', time: [5, 10], level: 1,
    learn: [['Did you sleep well?', '잘 잤어?'], ["I'm still sleepy.", '아직 졸려.'], ["What's for breakfast?", '아침 뭐 먹어?']],
    turns: [
      {
        say: ['Good morning! Did you sleep well?', '좋은 아침! 잘 잤어?'],
        options: [
          { en: 'Yes, I slept really well!', ko: '응, 정말 잘 잤어!', accept: ['yes', 'yeah', 'yep', 'well', 'good', 'great'], reply: ['Yay! Me too!', '야호! 나도!'] },
          { en: "Not really. I'm still sleepy.", ko: '별로. 아직 졸려.', accept: ['no', 'not', 'sleepy', 'tired'], reply: ["Aww. Let's stretch together! Up, up, up!", '에구. 같이 기지개 켜자! 위로, 위로!'] },
        ],
      },
      {
        say: ["I'm so hungry. What's for breakfast?", '나 너무 배고파. 아침 뭐 먹어?'],
        options: [
          { en: 'Cereal and milk!', ko: '시리얼이랑 우유!', accept: ['cereal', 'milk'], reply: ['Crunch, crunch! I love cereal.', '와작와작! 나 시리얼 좋아해.'] },
          { en: "Let's have pancakes!", ko: '팬케이크 먹자!', accept: ['pancake', 'pancakes', 'waffle', 'waffles'], reply: ['Pancakes? Yummy! With syrup, please!', '팬케이크? 맛있겠다! 시럽 뿌려 줘!'] },
          { en: 'Toast with jam.', ko: '잼 바른 토스트.', accept: ['toast', 'jam', 'bread', 'egg', 'eggs'], reply: ['Ooh, strawberry jam is my favorite!', '오, 딸기잼 제일 좋아!'] },
        ],
      },
      {
        say: ["Don't forget to brush your teeth!", '이 닦는 거 잊지 마!'],
        options: [
          { en: 'Okay, I will!', ko: '응, 닦을게!', accept: ['ok', 'okay', 'will', 'sure', 'yes'], reply: ['Brush, brush, brush! Sparkly teeth!', '치카치카! 반짝반짝 이!'] },
          { en: 'I already did!', ko: '벌써 닦았어!', accept: ['already', 'did', 'done'], reply: ['Wow, good job! Show me your smile!', '우와, 잘했어! 웃어 봐!'] },
        ],
      },
    ],
  },
  {
    id: 'school-go', icon: '🎒', title: '학교 가는 길', where: '집 앞', time: [7, 9], level: 1,
    learn: [['Do you have everything?', '다 챙겼어?'], ["Let's go!", '가자!'], ['Have a good day!', '좋은 하루 보내!']],
    turns: [
      {
        say: ['Time for school! Do you have everything?', '학교 갈 시간이야! 다 챙겼어?'],
        options: [
          { en: 'Yep! I have my backpack.', ko: '응! 가방 챙겼어.', accept: ['yes', 'yep', 'backpack', 'bag', 'have'], reply: ['Great! Your lunch box too?', '좋아! 도시락도?'] },
          { en: 'Oops! I forgot my water bottle.', ko: '앗! 물병 깜빡했다.', accept: ['forgot', 'oops', 'water', 'bottle', 'no'], reply: ["Hurry! I'll wait for you.", '빨리 가져와! 기다릴게.'] },
        ],
      },
      {
        say: ['Look! The school bus is coming!', '봐! 스쿨버스 온다!'],
        options: [
          { en: "Let's go! Hurry up!", ko: '가자! 서둘러!', accept: ['go', 'hurry', 'run', 'quick'], reply: ['Walk, don\'t run! Safety first!', '뛰지 말고 걸어! 안전이 먼저야!'] },
          { en: 'Can I sit by the window?', ko: '창가에 앉아도 돼?', accept: ['window', 'sit', 'seat'], reply: ['Sure! I like the window seat too.', '그럼! 나도 창가 자리 좋아.'] },
        ],
      },
      {
        say: ['Have a good day at school!', '학교에서 좋은 하루 보내!'],
        options: [
          { en: 'Thanks! See you later!', ko: '고마워! 이따 봐!', accept: ['thanks', 'thank', 'see', 'later', 'bye'], reply: ['Bye! I\'ll miss you!', '안녕! 보고 싶을 거야!'] },
          { en: 'You too!', ko: '너도!', accept: ['you', 'too'], reply: ['Hehe, thank you!', '헤헤, 고마워!'] },
        ],
      },
    ],
  },
  {
    id: 'new-friend', icon: '🙋', title: '새 친구 사귀기', where: '교실', time: [9, 12], level: 1,
    learn: [["What's your name?", '이름이 뭐야?'], ['Can I sit next to you?', '네 옆에 앉아도 돼?'], ['Nice to meet you!', '만나서 반가워!']],
    turns: [
      {
        say: ["Hi! I'm new here. What's your name?", '안녕! 나 여기 처음 왔어. 이름이 뭐야?'],
        options: [
          { en: "Hi! My name is {name}.", ko: '안녕! 내 이름은 {name}이야.', accept: ['name', 'my', "i'm", 'im', 'i am'], reply: ['Nice to meet you, {name}!', '만나서 반가워, {name}!'] },
          { en: 'Hi! Welcome to our class!', ko: '안녕! 우리 반에 온 걸 환영해!', accept: ['welcome', 'hello', 'hi'], reply: ['Thank you! You are so nice.', '고마워! 너 정말 친절하다.'] },
        ],
      },
      {
        say: ['Can I sit next to you?', '네 옆에 앉아도 돼?'],
        options: [
          { en: 'Sure! Sit here.', ko: '그럼! 여기 앉아.', accept: ['sure', 'yes', 'okay', 'ok', 'here', 'of course'], reply: ['Yay! Thanks!', '야호! 고마워!'] },
          { en: "Someone's sitting here, but let's eat lunch together!", ko: '여긴 자리가 있는데, 점심 같이 먹자!', accept: ['someone', 'lunch', 'together'], reply: ["Yay! I'd love that!", '야호! 너무 좋아!'] },
        ],
      },
      {
        say: ['What do you like to do?', '너는 뭐 하는 거 좋아해?'],
        options: [
          { en: 'I like drawing.', ko: '그림 그리는 거 좋아해.', accept: ['draw', 'drawing', 'art', 'paint'], reply: ['Me too! Let\'s draw together!', '나도! 같이 그리자!'] },
          { en: 'I like playing soccer.', ko: '축구하는 거 좋아해.', accept: ['soccer', 'ball', 'sports', 'basketball', 'play'], reply: ['Cool! Let\'s play at recess!', '멋지다! 쉬는 시간에 같이 하자!'] },
          { en: 'I like reading books.', ko: '책 읽는 거 좋아해.', accept: ['read', 'reading', 'book', 'books'], reply: ['Books are awesome! What\'s your favorite?', '책 최고지! 제일 좋아하는 책은 뭐야?'] },
        ],
      },
    ],
  },
  {
    id: 'recess', icon: '🛝', title: '쉬는 시간', where: '운동장', time: [10, 13], level: 1,
    learn: [['Do you want to play tag?', '술래잡기 할래?'], ["You're it!", '네가 술래야!'], ['My turn!', '내 차례!']],
    turns: [
      {
        say: ["It's recess! Do you want to play tag?", '쉬는 시간이다! 술래잡기 할래?'],
        options: [
          { en: "Yeah! Let's play!", ko: '좋아! 하자!', accept: ['yes', 'yeah', 'play', 'sure', 'ok', 'okay'], reply: ["Okay! You're it! Ha ha!", '좋아! 네가 술래야! 하하!'] },
          { en: "Let's go on the swings instead.", ko: '대신 그네 타자.', accept: ['swing', 'swings', 'slide', 'instead'], reply: ['Good idea! Push me, please!', '좋은 생각! 밀어 줘!'] },
        ],
      },
      {
        say: ['Whew! I\'m tired. Can I have a turn on the slide?', '휴! 힘들다. 나 미끄럼틀 타도 돼?'],
        options: [
          { en: "Sure, it's your turn!", ko: '그럼, 네 차례야!', accept: ['sure', 'turn', 'yes', 'go'], reply: ['Wheee! That was fun!', '우와아! 재밌다!'] },
          { en: "Wait, it's my turn first!", ko: '잠깐, 내가 먼저야!', accept: ['wait', 'my turn', 'first', 'me'], reply: ['Oh, sorry! You go first.', '아, 미안! 너 먼저 해.'] },
        ],
      },
      {
        say: ['The bell is ringing! We have to line up.', '종 울린다! 줄 서야 해.'],
        options: [
          { en: "Aww, already? Okay, let's go.", ko: '에이, 벌써? 알았어, 가자.', accept: ['already', 'okay', 'ok', 'go', 'aww'], reply: ["Let's play again tomorrow!", '내일 또 놀자!'] },
          { en: 'Race you to the line!', ko: '줄까지 시합하자!', accept: ['race', 'run', 'line'], reply: ['No running, remember? Ha ha!', '뛰면 안 되는 거 기억하지? 하하!'] },
        ],
      },
    ],
  },
  {
    id: 'lunch', icon: '🥪', title: '점심시간', where: '급식실', time: [11, 14], level: 1,
    learn: [['What did you bring for lunch?', '점심 뭐 싸 왔어?'], ['Do you want to share?', '나눠 먹을래?'], ["I'm full.", '배불러.']],
    turns: [
      {
        say: ['What did you bring for lunch?', '점심 뭐 싸 왔어?'],
        options: [
          { en: 'A peanut butter and jelly sandwich!', ko: '땅콩버터 잼 샌드위치!', accept: ['sandwich', 'peanut', 'jelly', 'pb'], reply: ['Classic! I love PB and J.', '역시! 나 땅콩잼 샌드위치 좋아해.'] },
          { en: 'Mac and cheese.', ko: '마카로니 앤 치즈.', accept: ['mac', 'cheese', 'pasta'], reply: ['Cheesy! Yum!', '치즈 듬뿍! 맛있겠다!'] },
          { en: 'Gimbap!', ko: '김밥!', accept: ['gimbap', 'kimbap', 'rice'], reply: ['Gimbap? Wow, it looks so pretty!', '김밥? 우와, 진짜 예쁘다!'] },
        ],
      },
      {
        say: ['I have apple slices. Do you want to share?', '나 사과 조각 있어. 나눠 먹을래?'],
        options: [
          { en: 'Yes, please! Thank you!', ko: '응, 줘! 고마워!', accept: ['yes', 'please', 'thank', 'thanks', 'sure'], reply: ["Here you go! Sharing is caring.", '여기! 나누면 좋잖아.'] },
          { en: "No, thanks. I'm full.", ko: '괜찮아. 배불러.', accept: ['no', 'full', "thanks"], reply: ['Okay! Maybe later.', '알았어! 이따 먹어.'] },
        ],
      },
      {
        say: ['Oops! I spilled my milk!', '앗! 우유 쏟았다!'],
        options: [
          { en: "It's okay. I'll get a napkin.", ko: '괜찮아. 냅킨 가져올게.', accept: ['okay', 'ok', 'napkin', 'help', 'get'], reply: ['Thanks! You\'re a good friend.', '고마워! 너 좋은 친구야.'] },
          { en: 'Are you okay?', ko: '괜찮아?', accept: ['are you', 'okay', 'alright'], reply: ["I'm fine! Just a little wet. Ha ha.", '괜찮아! 조금 젖었을 뿐이야. 하하.'] },
        ],
      },
    ],
  },
  {
    id: 'art', icon: '🖍️', title: '미술 시간', where: '교실', time: [9, 15], level: 1,
    learn: [['Can I borrow your crayon?', '크레용 빌려도 돼?'], ['Here you go.', '여기 있어.'], ['That looks awesome!', '그거 멋지다!']],
    turns: [
      {
        say: ['Can I borrow your red crayon?', '빨간 크레용 빌려도 돼?'],
        options: [
          { en: 'Sure! Here you go.', ko: '그럼! 여기 있어.', accept: ['sure', 'here', 'yes', 'okay', 'ok'], reply: ['Thanks! I\'ll give it back.', '고마워! 돌려줄게.'] },
          { en: "I'm using it right now. Can you wait?", ko: '지금 쓰고 있어. 기다려 줄래?', accept: ['using', 'wait', 'now'], reply: ['Okay, I can wait!', '응, 기다릴 수 있어!'] },
        ],
      },
      {
        say: ['Look at my picture! It\'s a rainbow cat.', '내 그림 봐! 무지개 고양이야.'],
        options: [
          { en: 'Wow, that looks awesome!', ko: '우와, 진짜 멋지다!', accept: ['wow', 'awesome', 'cool', 'nice', 'pretty', 'good', 'great'], reply: ['Thank you! What are you drawing?', '고마워! 너는 뭐 그려?'] },
          { en: 'Can you teach me how?', ko: '어떻게 그리는지 알려 줄래?', accept: ['teach', 'how', 'show'], reply: ['Sure! First, draw a big circle.', '그럼! 먼저 큰 동그라미를 그려.'] },
        ],
      },
      {
        say: ['What are you drawing?', '너는 뭐 그려?'],
        options: [
          { en: 'I\'m drawing my family.', ko: '우리 가족 그리고 있어.', accept: ['family', 'mom', 'dad'], reply: ['Aww, that\'s so sweet!', '와, 정말 따뜻하다!'] },
          { en: "I'm drawing you!", ko: '너를 그리고 있어!', accept: ['you'], reply: ['Me? Make me look cute, okay?', '나? 귀엽게 그려 줘, 알았지?'] },
        ],
      },
    ],
  },
  {
    id: 'nature', icon: '🐞', title: '산책하다 발견!', where: '공원', time: [6, 19], level: 1,
    learn: [['Look over there!', '저기 봐!'], ["Don't step on it.", '밟지 마.'], ["It's so cute!", '진짜 귀엽다!']],
    turns: [
      {
        say: ['Look over there! Is that a ladybug?', '저기 봐! 저거 무당벌레야?'],
        options: [
          { en: "Yes! It's so cute!", ko: '응! 진짜 귀엽다!', accept: ['yes', 'cute', 'yeah'], reply: ['It has seven spots! Let\'s count them.', '점이 일곱 개야! 같이 세 보자.'] },
          { en: "Let's take a closer look.", ko: '가까이 가서 보자.', accept: ['look', 'closer', 'see'], reply: ['Shh! Be gentle. Don\'t scare it.', '쉿! 살살. 놀라게 하지 마.'] },
        ],
      },
      {
        say: ['Oh no, a big puddle! What should we do?', '앗, 큰 물웅덩이다! 어떡하지?'],
        options: [
          { en: "Let's jump in it!", ko: '뛰어들자!', accept: ['jump', 'splash'], reply: ['Splash! Ha ha! My feet are wet!', '첨벙! 하하! 발 다 젖었다!'] },
          { en: "Let's walk around it.", ko: '돌아서 가자.', accept: ['around', 'walk', 'avoid'], reply: ['Good idea. Our shoes will stay dry.', '좋은 생각. 신발 안 젖겠다.'] },
        ],
      },
      {
        say: ['Careful! There\'s an ant. Don\'t step on it!', '조심! 개미 있어. 밟지 마!'],
        options: [
          { en: 'Oops! Thanks for telling me.', ko: '앗! 알려 줘서 고마워.', accept: ['oops', 'thanks', 'thank'], reply: ['The ant says thank you too!', '개미도 고맙대!'] },
          { en: 'Where is it going?', ko: '어디 가는 걸까?', accept: ['where', 'going'], reply: ['Maybe it\'s going home to its family.', '가족이 있는 집에 가나 봐.'] },
        ],
      },
    ],
  },
  {
    id: 'weather', icon: '🌦️', title: '오늘 날씨', where: '창가', time: [6, 20], level: 1,
    learn: [["How's the weather?", '날씨 어때?'], ["It's sunny.", '해가 쨍쨍해.'], ['Bring an umbrella.', '우산 챙겨.']],
    turns: [
      {
        say: ["How's the weather today?", '오늘 날씨 어때?'],
        options: [
          { en: "It's sunny and warm!", ko: '해가 나고 따뜻해!', accept: ['sunny', 'warm', 'hot', 'nice'], reply: ['Perfect day for a walk!', '산책하기 딱 좋은 날이다!'] },
          { en: "It's cloudy. It might rain.", ko: '흐려. 비 올 것 같아.', accept: ['cloudy', 'rain', 'rainy'], reply: ['Then let\'s bring an umbrella!', '그럼 우산 챙기자!'] },
          { en: "It's cold and windy.", ko: '춥고 바람 불어.', accept: ['cold', 'windy', 'wind', 'snow'], reply: ['Brr! Wear your jacket!', '으으! 점퍼 입어!'] },
        ],
      },
      {
        say: ['What do you like better, rain or snow?', '비랑 눈 중에 뭐가 더 좋아?'],
        options: [
          { en: 'I like snow better!', ko: '눈이 더 좋아!', accept: ['snow', 'snowman'], reply: ['Let\'s build a snowman someday!', '언젠가 눈사람 만들자!'] },
          { en: 'I like rain. It sounds nice.', ko: '비가 좋아. 소리가 좋아.', accept: ['rain'], reply: ['Pitter-patter! I like it too.', '톡톡톡! 나도 좋아.'] },
        ],
      },
    ],
  },
  {
    id: 'dinner', icon: '🍝', title: '저녁 식사', where: '식탁', time: [17, 21], level: 1,
    learn: [["Dinner's ready!", '저녁 다 됐어!'], ['Can you pass the salt?', '소금 좀 건네줄래?'], ['May I be excused?', '먼저 일어나도 돼요?']],
    turns: [
      {
        say: ["Dinner's ready! Wash your hands, please.", '저녁 다 됐어! 손 씻고 와.'],
        options: [
          { en: 'Okay! Coming!', ko: '네! 가요!', accept: ['okay', 'ok', 'coming', 'yes'], reply: ['It smells so good!', '냄새 진짜 좋다!'] },
          { en: 'What are we having?', ko: '뭐 먹어요?', accept: ['what', 'having', 'eat'], reply: ['Spaghetti and meatballs!', '미트볼 스파게티!'] },
        ],
      },
      {
        say: ['Can you pass the salt, please?', '소금 좀 건네줄래?'],
        options: [
          { en: 'Here you go!', ko: '여기 있어!', accept: ['here', 'sure', 'okay'], reply: ['Thank you so much!', '정말 고마워!'] },
          { en: 'Sure! Anything else?', ko: '응! 또 필요한 거 있어?', accept: ['sure', 'anything', 'else'], reply: ['Maybe some water too, please.', '물도 좀 줄래?'] },
        ],
      },
      {
        say: ['How was your day today?', '오늘 하루 어땠어?'],
        options: [
          { en: 'It was great! I had fun.', ko: '좋았어! 재밌었어.', accept: ['great', 'good', 'fun', 'awesome'], reply: ['I\'m so happy to hear that!', '그 말 들으니까 너무 좋다!'] },
          { en: 'It was okay. A little tiring.', ko: '그냥 그랬어. 좀 피곤했어.', accept: ['okay', 'ok', 'tired', 'tiring', 'so so'], reply: ['Let\'s rest after dinner.', '저녁 먹고 쉬자.'] },
        ],
      },
    ],
  },
  {
    id: 'bedtime', icon: '🌙', title: '잘 시간', where: '침실', time: [20, 24], level: 1,
    learn: [["It's time for bed.", '잘 시간이야.'], ['Can you read me a story?', '이야기 읽어 줄래?'], ['Sweet dreams!', '좋은 꿈 꿔!']],
    turns: [
      {
        say: ["It's time for bed. Did you put on your pajamas?", '잘 시간이야. 잠옷 입었어?'],
        options: [
          { en: 'Yes, I did!', ko: '응, 입었어!', accept: ['yes', 'did', 'yeah'], reply: ['Your pajamas are so cute!', '잠옷 진짜 귀엽다!'] },
          { en: 'Five more minutes, please!', ko: '5분만 더!', accept: ['five', 'minutes', 'more', 'please'], reply: ['Okay, just five minutes!', '알았어, 딱 5분만!'] },
        ],
      },
      {
        say: ['Can you read me a story?', '이야기 읽어 줄래?'],
        options: [
          { en: 'Sure! Once upon a time...', ko: '그럼! 옛날 옛적에...', accept: ['sure', 'once', 'yes', 'okay'], reply: ['Yawn... I love your stories.', '하암... 네 이야기 좋아.'] },
          { en: "I'm too sleepy. Tomorrow?", ko: '너무 졸려. 내일?', accept: ['sleepy', 'tomorrow', 'tired'], reply: ['Okay. Tomorrow, promise!', '알았어. 내일 약속!'] },
        ],
      },
      {
        say: ['Good night! Sweet dreams!', '잘 자! 좋은 꿈 꿔!'],
        options: [
          { en: 'Good night! See you tomorrow!', ko: '잘 자! 내일 봐!', accept: ['good night', 'night', 'tomorrow', 'see'], reply: ['Zzz...', '쿨쿨...'] },
          { en: 'Sweet dreams! Love you!', ko: '좋은 꿈 꿔! 사랑해!', accept: ['sweet', 'dreams', 'love'], reply: ['Love you too! Zzz...', '나도 사랑해! 쿨쿨...'] },
        ],
      },
    ],
  },
  {
    id: 'homework', icon: '📚', title: '숙제 시간', where: '책상', time: [14, 19], level: 2,
    learn: [['Do you have any homework?', '숙제 있어?'], ['Can you help me with this?', '이거 도와줄래?'], ['I finished!', '다 했다!']],
    turns: [
      {
        say: ['Do you have any homework today?', '오늘 숙제 있어?'],
        options: [
          { en: 'Yeah, I have a math worksheet.', ko: '응, 수학 학습지 있어.', accept: ['math', 'worksheet', 'yes', 'yeah'], reply: ['Math? I can count to one hundred!', '수학? 나 백까지 셀 수 있어!'] },
          { en: 'I have to read a book for twenty minutes.', ko: '책을 20분 읽어야 해.', accept: ['read', 'book', 'reading', 'minutes'], reply: ['Can I listen while you read?', '읽을 때 나도 들어도 돼?'] },
          { en: 'Nope! No homework today!', ko: '아니! 오늘은 숙제 없어!', accept: ['no', 'nope'], reply: ['Lucky! Then let\'s play!', '좋겠다! 그럼 놀자!'] },
        ],
      },
      {
        say: ['Hmm, what is seven plus five?', '음, 7 더하기 5는 뭐야?'],
        options: [
          { en: "It's twelve!", ko: '12야!', accept: ['twelve', '12'], reply: ['Wow, you\'re so smart!', '우와, 너 진짜 똑똑하다!'] },
          { en: "Let's count with our fingers.", ko: '손가락으로 세 보자.', accept: ['count', 'fingers', 'finger'], reply: ['Seven... eight, nine, ten, eleven, twelve! Twelve!', '일곱... 여덟, 아홉, 열, 열하나, 열둘! 12!'] },
        ],
      },
      {
        say: ['Are you done yet?', '다 했어?'],
        options: [
          { en: 'I finished! Yay!', ko: '다 했다! 야호!', accept: ['finished', 'done', 'yes', 'yay'], reply: ['High five! You worked hard!', '하이파이브! 열심히 했다!'] },
          { en: 'Almost. Can you help me with this?', ko: '거의. 이거 도와줄래?', accept: ['almost', 'help', 'not yet'], reply: ['Of course! Let\'s do it together.', '당연하지! 같이 하자.'] },
        ],
      },
    ],
  },
  {
    id: 'playdate', icon: '🏠', title: '친구 초대하기', where: '전화', time: [13, 19], level: 2,
    learn: [['Do you want to come over?', '우리 집에 놀러 올래?'], ['I have to ask my mom.', '엄마한테 물어봐야 해.'], ['That sounds fun!', '재밌겠다!']],
    turns: [
      {
        say: ['Do you want to come over to my house after school?', '학교 끝나고 우리 집에 놀러 올래?'],
        options: [
          { en: 'That sounds fun! I have to ask my mom first.', ko: '재밌겠다! 먼저 엄마한테 물어봐야 해.', accept: ['ask', 'mom', 'dad', 'parents', 'fun'], reply: ['Okay! Let me know.', '알았어! 알려 줘.'] },
          { en: "I can't today. How about tomorrow?", ko: '오늘은 안 돼. 내일은 어때?', accept: ["can't", 'cant', 'tomorrow', 'busy'], reply: ['Tomorrow works! Yay!', '내일 좋아! 야호!'] },
        ],
      },
      {
        say: ['What should we do at my house?', '우리 집에서 뭐 할까?'],
        options: [
          { en: "Let's build a fort with blankets!", ko: '이불로 아지트 만들자!', accept: ['fort', 'blanket', 'blankets', 'build'], reply: ['Yes! A secret fort!', '좋아! 비밀 아지트!'] },
          { en: 'We can play board games.', ko: '보드게임 하면 돼.', accept: ['board', 'game', 'games'], reply: ['I\'m good at board games!', '나 보드게임 잘해!'] },
          { en: "Let's bake cookies!", ko: '쿠키 굽자!', accept: ['bake', 'cookie', 'cookies', 'cook'], reply: ['Chocolate chip cookies? Yum!', '초코칩 쿠키? 맛있겠다!'] },
        ],
      },
      {
        say: ['That was so much fun! Can you come again?', '진짜 재밌었다! 또 올 수 있어?'],
        options: [
          { en: 'Sure! Thanks for having me!', ko: '그럼! 초대해 줘서 고마워!', accept: ['sure', 'thanks', 'thank', 'having'], reply: ['Anytime! You\'re my best friend.', '언제든지! 넌 내 단짝이야.'] },
          { en: 'Next time, come to my house!', ko: '다음엔 우리 집에 와!', accept: ['next', 'my house', 'come'], reply: ['Deal! Pinky promise!', '좋아! 새끼손가락 약속!'] },
        ],
      },
    ],
  },
  {
    id: 'feelings', icon: '💗', title: '기분 이야기', where: '어디서나', time: [6, 22], level: 2,
    learn: [["What's wrong?", '무슨 일 있어?'], ['I feel sad.', '나 슬퍼.'], ['It\'s going to be okay.', '괜찮아질 거야.']],
    turns: [
      {
        say: ['You look a little sad. What\'s wrong?', '너 좀 슬퍼 보여. 무슨 일 있어?'],
        options: [
          { en: 'I lost my favorite pencil.', ko: '제일 좋아하는 연필을 잃어버렸어.', accept: ['lost', 'pencil', 'lose'], reply: ['Oh no! Let\'s look for it together.', '저런! 같이 찾아보자.'] },
          { en: 'My friend was mean to me.', ko: '친구가 나한테 못되게 굴었어.', accept: ['mean', 'friend', 'fight'], reply: ['That\'s not nice. I\'m here for you. Let\'s tell a teacher, okay?', '그건 나빠. 내가 네 곁에 있을게. 선생님께도 말씀드리자, 알았지?'] },
          { en: "I'm okay. I'm just tired.", ko: '괜찮아. 그냥 피곤해.', accept: ['okay', 'ok', 'tired', 'fine'], reply: ['Want a big hug?', '꼭 안아 줄까?'] },
        ],
      },
      {
        say: ['Do you want to talk about it?', '그거 얘기하고 싶어?'],
        options: [
          { en: 'Yes. Thanks for listening.', ko: '응. 들어 줘서 고마워.', accept: ['yes', 'thanks', 'listening'], reply: ['Of course. That\'s what friends are for.', '당연하지. 친구니까.'] },
          { en: "Not now. Maybe later.", ko: '지금은 말고. 나중에.', accept: ['not', 'later', 'no'], reply: ['Okay. I\'ll be right here.', '알았어. 여기 있을게.'] },
        ],
      },
      {
        say: ['It\'s going to be okay. Do you feel better now?', '괜찮아질 거야. 이제 기분 좀 나아?'],
        options: [
          { en: 'Yes, I feel much better!', ko: '응, 훨씬 나아졌어!', accept: ['better', 'yes', 'good', 'happy'], reply: ['Yay! Your smile is back!', '야호! 웃음이 돌아왔다!'] },
          { en: 'A little bit.', ko: '조금.', accept: ['little', 'bit', 'kind of'], reply: ['That\'s a good start!', '그거면 충분히 좋은 시작이야!'] },
        ],
      },
    ],
  },
  {
    id: 'birthday', icon: '🎂', title: '생일 파티', where: '친구 집', time: [11, 20], level: 2,
    learn: [['Happy birthday!', '생일 축하해!'], ['This is for you.', '이거 너 주는 거야.'], ['Make a wish!', '소원 빌어!']],
    turns: [
      {
        say: ['Today is my birthday! I\'m eight years old!', '오늘 내 생일이야! 나 여덟 살 됐어!'],
        options: [
          { en: 'Happy birthday! This is for you.', ko: '생일 축하해! 이거 너 주는 거야.', accept: ['happy', 'birthday', 'for you', 'present', 'gift'], reply: ['A present? For me? Thank you!', '선물? 나한테? 고마워!'] },
          { en: 'Wow! Happy birthday! Are you having a party?', ko: '우와! 생일 축하해! 파티 해?', accept: ['party', 'happy', 'birthday'], reply: ['Yes! Come to my party!', '응! 내 파티에 와!'] },
        ],
      },
      {
        say: ['Time to blow out the candles!', '촛불 끌 시간이야!'],
        options: [
          { en: 'Make a wish first!', ko: '먼저 소원 빌어!', accept: ['wish'], reply: ['Okay... I wish... it\'s a secret! Whoosh!', '응... 내 소원은... 비밀이야! 후!'] },
          { en: "Let's sing the birthday song!", ko: '생일 노래 부르자!', accept: ['sing', 'song'], reply: ['Happy birthday to me! La la la!', '나한테 생일 축하해! 랄랄라!'] },
        ],
      },
      {
        say: ['Do you want a piece of cake?', '케이크 한 조각 먹을래?'],
        options: [
          { en: 'Yes, please! A big piece!', ko: '응, 줘! 큰 걸로!', accept: ['yes', 'please', 'big'], reply: ['Here you go! It\'s chocolate!', '여기! 초코 케이크야!'] },
          { en: 'Just a small piece, please.', ko: '작은 조각만 줘.', accept: ['small', 'little', 'just'], reply: ['Okay! There\'s ice cream too!', '알았어! 아이스크림도 있어!'] },
        ],
      },
    ],
  },
  {
    id: 'sorry', icon: '🤝', title: '미안해, 괜찮아', where: '교실', time: [8, 16], level: 2,
    learn: [["I'm sorry.", '미안해.'], ["It's okay.", '괜찮아.'], ['It was an accident.', '일부러 그런 거 아니야.']],
    turns: [
      {
        say: ['Ouch! You bumped into me!', '아야! 너 나랑 부딪혔어!'],
        options: [
          { en: "I'm so sorry! It was an accident.", ko: '정말 미안해! 일부러 그런 거 아니야.', accept: ['sorry', 'accident'], reply: ['That\'s okay. I know you didn\'t mean it.', '괜찮아. 일부러 그런 거 아닌 거 알아.'] },
          { en: 'Oh no! Are you hurt?', ko: '어떡해! 다쳤어?', accept: ['hurt', 'okay', 'are you'], reply: ['Just a little. I\'m okay now.', '조금. 이제 괜찮아.'] },
        ],
      },
      {
        say: ['I broke your pencil by mistake. I\'m sorry.', '실수로 네 연필 부러뜨렸어. 미안해.'],
        options: [
          { en: "It's okay. I have another one.", ko: '괜찮아. 하나 더 있어.', accept: ['okay', 'ok', 'another', 'fine'], reply: ['Phew! Thank you for being nice.', '휴! 착하게 대해 줘서 고마워.'] },
          { en: 'Thanks for telling me.', ko: '말해 줘서 고마워.', accept: ['thanks', 'thank', 'telling'], reply: ['I\'ll be more careful next time.', '다음엔 더 조심할게.'] },
        ],
      },
      {
        say: ['Are we still friends?', '우리 아직 친구지?'],
        options: [
          { en: 'Of course! Best friends!', ko: '당연하지! 단짝이야!', accept: ['of course', 'yes', 'friends', 'best'], reply: ['Yay! Friends forever!', '야호! 영원히 친구!'] },
          { en: "Yes! Let's shake hands.", ko: '응! 악수하자.', accept: ['shake', 'hands', 'yes'], reply: ['Shake, shake! Hehe.', '악수, 악수! 헤헤.'] },
        ],
      },
    ],
  },
  {
    id: 'weekend', icon: '🎡', title: '주말 계획', where: '집', time: [15, 22], level: 2,
    learn: [['What are you doing this weekend?', '이번 주말에 뭐 해?'], ["I'm going to the park.", '공원에 갈 거야.'], ["Can't wait!", '너무 기대돼!']],
    turns: [
      {
        say: ['What are you doing this weekend?', '이번 주말에 뭐 해?'],
        options: [
          { en: "I'm going to the park with my family.", ko: '가족이랑 공원 갈 거야.', accept: ['park', 'family'], reply: ['Fun! Can I come too?', '재밌겠다! 나도 가도 돼?'] },
          { en: "I'm visiting my grandma.", ko: '할머니 댁에 가.', accept: ['grandma', 'grandpa', 'visit', 'visiting'], reply: ['Aww, say hi to your grandma!', '와, 할머니께 안부 전해 줘!'] },
          { en: "Nothing much. Just relaxing.", ko: '별거 없어. 그냥 쉬어.', accept: ['nothing', 'relax', 'relaxing', 'rest', 'home'], reply: ['Relaxing is nice too!', '쉬는 것도 좋지!'] },
        ],
      },
      {
        say: ['What do you want to do there?', '거기서 뭐 하고 싶어?'],
        options: [
          { en: 'I want to ride my bike!', ko: '자전거 타고 싶어!', accept: ['bike', 'ride', 'scooter'], reply: ['Don\'t forget your helmet!', '헬멧 잊지 마!'] },
          { en: 'I want to have a picnic.', ko: '소풍 가고 싶어.', accept: ['picnic', 'eat', 'snack'], reply: ['Let\'s pack sandwiches!', '샌드위치 싸 가자!'] },
        ],
      },
      {
        say: ['I can\'t wait for the weekend!', '주말 너무 기대된다!'],
        options: [
          { en: "Me too! It's going to be awesome!", ko: '나도! 진짜 신날 거야!', accept: ['me', 'too', 'neither', 'awesome', 'fun'], reply: ['Woohoo!', '우후!'] },
          { en: 'Only two more days!', ko: '이틀만 더!', accept: ['two', 'days', 'more'], reply: ['Let\'s count down together!', '같이 세어 보자!'] },
        ],
      },
    ],
  },
  {
    id: 'library', icon: '📖', title: '도서관에서', where: '학교 도서관', time: [9, 16], level: 2,
    learn: [['Can I check out this book?', '이 책 빌려도 돼요?'], ['Use your inside voice.', '조용히 말해.'], ["What's it about?", '무슨 내용이야?']],
    turns: [
      {
        say: ['Shh! This is the library. Use your inside voice.', '쉿! 여긴 도서관이야. 조용히 말해.'],
        options: [
          { en: 'Oops, sorry! I\'ll be quiet.', ko: '앗, 미안! 조용히 할게.', accept: ['sorry', 'quiet', 'oops'], reply: ['Thanks! Let\'s find a good book.', '고마워! 좋은 책 찾아보자.'] },
          { en: 'Okay. Where are the animal books?', ko: '알았어. 동물 책은 어디 있어?', accept: ['animal', 'where', 'books'], reply: ['They\'re over there, on the blue shelf.', '저기 파란 책장에 있어.'] },
        ],
      },
      {
        say: ['Which book do you want?', '어떤 책 볼래?'],
        options: [
          { en: 'This one about dinosaurs!', ko: '공룡 나오는 이거!', accept: ['dinosaur', 'dinosaurs', 'dino'], reply: ['Roar! Dinosaurs are so cool!', '어흥! 공룡 진짜 멋져!'] },
          { en: 'A funny comic book.', ko: '웃긴 만화책.', accept: ['comic', 'funny'], reply: ['Ha ha! Read me the funny parts!', '하하! 웃긴 부분 읽어 줘!'] },
        ],
      },
      {
        say: ["What's it about?", '무슨 내용이야?'],
        options: [
          { en: "It's about a dog who goes to space.", ko: '우주에 가는 강아지 이야기야.', accept: ['dog', 'space'], reply: ['A space dog? I want to read it too!', '우주 강아지? 나도 읽고 싶어!'] },
          { en: "I don't know yet. Let's read it together!", ko: '아직 몰라. 같이 읽자!', accept: ["don't know", 'together', 'read'], reply: ['Okay! Page one...', '좋아! 첫 페이지...'] },
        ],
      },
    ],
  },
];

export const sceneById = Object.fromEntries(SCENES.map(s => [s.id, s]));

// 못 알아들었을 때 / 칭찬 / 마무리
export const LINES = {
  again: [["Hmm, can you say that again?", '음, 다시 말해 줄래?'], ["Sorry, I didn't get that.", '미안, 잘 못 알아들었어.']],
  good: [['Good job!', '잘했어!'], ['Great English!', '영어 잘한다!'], ['Wow, you said it!', '우와, 말했다!']],
  bye: [['That was fun! Talk to you later!', '재밌었어! 또 이야기하자!'], ["Great talking with you! See you!", '이야기해서 좋았어! 또 봐!']],
};
