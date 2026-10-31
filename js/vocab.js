// 영어 단어 카드 + 짝꿍 퀴즈
// - 게임에서 만난 것(잡은 친구, 만든 가구, 거둔 작물, 짝꿍 돌보기, 대화에 나온 낱말)이 단어 카드로 모여요.
// - 짝꿍이 "What's this?" 하고 물어보면 그림을 보고 영어를 고르거나, 소리를 듣고 그림을 골라요.
// - 자주 틀린 낱말, 오래 안 본 낱말이 퀴즈에 먼저 나와요. 세 번 맞히면 ⭐⭐⭐.

import { store } from './store.js';

// cat: animal(동물·곤충) / nature(자연) / food(먹을 것) / home(집) / feel(기분) / do(하는 일)
// [영어, 한국어, 그림, 분류, 예문 영어, 예문 한국어]
const RAW = [
  ['cat', '고양이', '🐱', 'animal', 'The cat is sleeping.', '고양이가 자고 있어.'],
  ['dog', '강아지', '🐶', 'animal', 'My dog likes balls.', '우리 강아지는 공을 좋아해.'],
  ['bird', '새', '🐦', 'animal', 'A bird is singing.', '새가 노래해.'],
  ['duck', '오리', '🦆', 'animal', 'The duck can swim.', '오리는 헤엄칠 수 있어.'],
  ['rabbit', '토끼', '🐰', 'animal', 'The rabbit hops fast.', '토끼가 빨리 깡충 뛰어.'],
  ['hedgehog', '고슴도치', '🦔', 'animal', 'A hedgehog is round.', '고슴도치는 동그래.'],
  ['frog', '개구리', '🐸', 'animal', 'The frog says ribbit.', '개구리가 개굴개굴해.'],
  ['fish', '물고기', '🐟', 'animal', 'Fish live in water.', '물고기는 물에 살아.'],
  ['turtle', '거북', '🐢', 'animal', 'The turtle is slow.', '거북은 느려.'],
  ['squirrel', '다람쥐', '🐿️', 'animal', 'The squirrel has an acorn.', '다람쥐가 도토리를 가졌어.'],
  ['raccoon', '너구리', '🦝', 'animal', 'The raccoon looks like it has a mask.', '너구리는 가면을 쓴 것 같아.'],
  ['ladybug', '무당벌레', '🐞', 'animal', 'The ladybug is red.', '무당벌레는 빨개.'],
  ['butterfly', '나비', '🦋', 'animal', 'Look at the butterfly!', '나비 좀 봐!'],
  ['bug', '벌레', '🐛', 'animal', 'Look! A little bug!', '봐! 작은 벌레야!'],
  ['beetle', '딱정벌레', '🪲', 'animal', 'The beetle is strong.', '딱정벌레는 힘이 세.'],
  ['bee', '벌', '🐝', 'animal', 'The bee loves flowers.', '벌은 꽃을 좋아해.'],
  ['ant', '개미', '🐜', 'animal', 'Ants work hard.', '개미는 열심히 일해.'],
  ['flower', '꽃', '🌸', 'nature', 'This flower smells nice.', '이 꽃 냄새 좋다.'],
  ['tree', '나무', '🌳', 'nature', 'The tree is tall.', '나무가 키가 커.'],
  ['leaf', '나뭇잎', '🍃', 'nature', 'A leaf is falling.', '나뭇잎이 떨어져.'],
  ['rock', '돌', '🪨', 'nature', 'I found a smooth rock.', '매끈한 돌을 찾았어.'],
  ['shell', '조개껍데기', '🐚', 'nature', 'I found a shell.', '조개껍데기를 찾았어.'],
  ['star', '별', '⭐', 'nature', 'I see a star!', '별이 보여!'],
  ['moon', '달', '🌙', 'nature', 'The moon is bright.', '달이 밝아.'],
  ['sun', '해', '☀️', 'nature', 'The sun is hot.', '해가 뜨거워.'],
  ['cloud', '구름', '☁️', 'nature', 'The cloud is fluffy.', '구름이 폭신해.'],
  ['rain', '비', '🌧️', 'nature', "It's raining.", '비가 와.'],
  ['snow', '눈', '❄️', 'nature', "Let's play in the snow!", '눈에서 놀자!'],
  ['water', '물', '💧', 'nature', 'Plants need water.', '식물은 물이 필요해.'],
  ['fire', '불', '🔥', 'nature', 'Fire is hot. Be careful!', '불은 뜨거워. 조심해!'],
  ['mushroom', '버섯', '🍄', 'nature', 'A mushroom grew here.', '여기 버섯이 자랐어.'],
  ['acorn', '도토리', '🌰', 'nature', 'Squirrels love acorns.', '다람쥐는 도토리를 좋아해.'],
  ['ice', '얼음', '🧊', 'nature', 'Ice is cold.', '얼음은 차가워.'],
  ['strawberry', '딸기', '🍓', 'food', 'I love strawberries!', '딸기 정말 좋아!'],
  ['tomato', '토마토', '🍅', 'food', 'The tomato is red.', '토마토는 빨개.'],
  ['lettuce', '상추', '🥬', 'food', 'Lettuce is crunchy.', '상추는 아삭해.'],
  ['pumpkin', '호박', '🎃', 'food', 'What a big pumpkin!', '호박 진짜 크다!'],
  ['sunflower', '해바라기', '🌻', 'nature', 'The sunflower looks at the sun.', '해바라기가 해를 봐.'],
  ['cookie', '쿠키', '🍪', 'food', 'Can I have a cookie?', '쿠키 하나 먹어도 돼?'],
  ['milk', '우유', '🥛', 'food', 'I drink milk every day.', '난 매일 우유를 마셔.'],
  ['bread', '빵', '🍞', 'food', 'I like bread with jam.', '난 잼 바른 빵이 좋아.'],
  ['bed', '침대', '🛏️', 'home', 'Time for bed!', '잘 시간이야!'],
  ['chair', '의자', '🪑', 'home', 'Sit on the chair.', '의자에 앉아.'],
  ['light', '불, 전등', '💡', 'home', 'Turn on the light, please.', '불 좀 켜 줘.'],
  ['book', '책', '📚', 'home', 'Can you read me a book?', '책 읽어 줄래?'],
  ['window', '창문', '🪟', 'home', 'Open the window.', '창문 열어.'],
  ['picture', '그림', '🖼️', 'home', 'I drew a picture.', '그림을 그렸어.'],
  ['bell', '종', '🔔', 'home', 'The bell is ringing.', '종이 울려.'],
  ['ball', '공', '⚽', 'home', 'Throw the ball!', '공 던져!'],
  ['gift', '선물', '🎁', 'home', 'This gift is for you.', '이 선물은 너를 위한 거야.'],
  ['crown', '왕관', '👑', 'home', 'The king has a crown.', '왕은 왕관을 써.'],
  ['happy', '기쁜', '😊', 'feel', "I'm so happy!", '나 정말 기뻐!'],
  ['sleepy', '졸린', '😴', 'feel', "I'm sleepy.", '나 졸려.'],
  ['hungry', '배고픈', '🍽️', 'feel', "I'm hungry!", '배고파!'],
  ['tired', '피곤한', '🥱', 'feel', "I'm a little tired.", '좀 피곤해.'],
  ['eat', '먹다', '😋', 'do', "Let's eat!", '먹자!'],
  ['play', '놀다', '🤸', 'do', "Let's play together!", '같이 놀자!'],
  ['sleep', '자다', '💤', 'do', 'Sleep well!', '잘 자!'],
  ['walk', '걷다', '🚶', 'do', "Let's go for a walk.", '산책 가자.'],
  ['swim', '헤엄치다', '🏊', 'do', 'Fish can swim.', '물고기는 헤엄칠 수 있어.'],
  ['school', '학교', '🏫', 'home', 'I go to school.', '난 학교에 가.'],
  ['friend', '친구', '🧑‍🤝‍🧑', 'feel', "You're my best friend!", '넌 내 제일 친한 친구야!'],
  // ---------- 더 많은 낱말 (퀴즈 '보통·어려움'에서 도전하며 모아요) ----------
  ['lion', '사자', '🦁', 'animal', 'The lion has a big mane.', '사자는 갈기가 커.'],
  ['tiger', '호랑이', '🐯', 'animal', 'The tiger has stripes.', '호랑이는 줄무늬가 있어.'],
  ['elephant', '코끼리', '🐘', 'animal', 'The elephant has a long nose.', '코끼리는 코가 길어.'],
  ['monkey', '원숭이', '🐵', 'animal', 'The monkey likes bananas.', '원숭이는 바나나를 좋아해.'],
  ['pig', '돼지', '🐷', 'animal', 'The pig says oink.', '돼지는 꿀꿀해.'],
  ['cow', '소', '🐮', 'animal', 'The cow gives us milk.', '소는 우유를 줘.'],
  ['horse', '말', '🐴', 'animal', 'The horse runs fast.', '말은 빨리 달려.'],
  ['sheep', '양', '🐑', 'animal', 'The sheep is soft and white.', '양은 부드럽고 하얘.'],
  ['chicken', '닭', '🐔', 'animal', 'The chicken lays eggs.', '닭은 알을 낳아.'],
  ['bear', '곰', '🐻', 'animal', 'The bear sleeps all winter.', '곰은 겨울 내내 자.'],
  ['penguin', '펭귄', '🐧', 'animal', 'The penguin lives on the ice.', '펭귄은 얼음 위에 살아.'],
  ['owl', '부엉이', '🦉', 'animal', 'The owl is awake at night.', '부엉이는 밤에 깨어 있어.'],
  ['whale', '고래', '🐳', 'animal', 'The whale is very big.', '고래는 정말 커.'],
  ['snake', '뱀', '🐍', 'animal', 'The snake has no legs.', '뱀은 다리가 없어.'],
  ['panda', '판다', '🐼', 'animal', 'The panda eats bamboo.', '판다는 대나무를 먹어.'],
  ['mouse', '생쥐', '🐭', 'animal', 'The mouse likes cheese.', '생쥐는 치즈를 좋아해.'],
  ['dolphin', '돌고래', '🐬', 'animal', 'The dolphin can jump high.', '돌고래는 높이 뛸 수 있어.'],
  ['octopus', '문어', '🐙', 'animal', 'The octopus has eight legs.', '문어는 다리가 여덟 개야.'],
  ['shark', '상어', '🦈', 'animal', 'The shark swims in the ocean.', '상어는 바다에서 헤엄쳐.'],
  ['giraffe', '기린', '🦒', 'animal', 'The giraffe has a long neck.', '기린은 목이 길어.'],
  ['zebra', '얼룩말', '🦓', 'animal', 'The zebra is black and white.', '얼룩말은 검정과 하양이야.'],
  ['kangaroo', '캥거루', '🦘', 'animal', 'The kangaroo can jump far.', '캥거루는 멀리 뛸 수 있어.'],
  ['snail', '달팽이', '🐌', 'animal', 'The snail is very slow.', '달팽이는 아주 느려.'],
  ['spider', '거미', '🕷️', 'animal', 'The spider makes a web.', '거미는 거미줄을 만들어.'],
  ['crab', '게', '🦀', 'animal', 'The crab walks sideways.', '게는 옆으로 걸어.'],
  ['apple', '사과', '🍎', 'food', 'An apple a day is good for you.', '하루에 사과 한 개는 몸에 좋아.'],
  ['banana', '바나나', '🍌', 'food', 'The banana is yellow.', '바나나는 노래.'],
  ['grapes', '포도', '🍇', 'food', 'I like purple grapes.', '난 보라색 포도가 좋아.'],
  ['watermelon', '수박', '🍉', 'food', 'Watermelon is sweet in summer.', '여름에 수박은 달아.'],
  ['carrot', '당근', '🥕', 'food', 'Rabbits love carrots.', '토끼는 당근을 좋아해.'],
  ['egg', '달걀', '🥚', 'food', 'I had an egg for breakfast.', '아침으로 달걀을 먹었어.'],
  ['cake', '케이크', '🍰', 'food', 'We eat cake on birthdays.', '생일에는 케이크를 먹어.'],
  ['pizza', '피자', '🍕', 'food', 'Pizza is my favorite food.', '피자는 내가 제일 좋아하는 음식이야.'],
  ['rice', '밥', '🍚', 'food', 'I eat rice every day.', '난 매일 밥을 먹어.'],
  ['cheese', '치즈', '🧀', 'food', 'Mice love cheese.', '생쥐는 치즈를 좋아해.'],
  ['sandwich', '샌드위치', '🥪', 'food', 'I made a sandwich for lunch.', '점심으로 샌드위치를 만들었어.'],
  ['pancake', '팬케이크', '🥞', 'food', 'Can I have a pancake?', '팬케이크 하나 먹어도 돼?'],
  ['juice', '주스', '🧃', 'food', 'I want some orange juice.', '오렌지 주스 마시고 싶어.'],
  ['corn', '옥수수', '🌽', 'food', 'The corn is yellow.', '옥수수는 노래.'],
  ['potato', '감자', '🥔', 'food', 'I like potato chips.', '난 감자칩이 좋아.'],
  ['candy', '사탕', '🍬', 'food', 'Too much candy is bad for teeth.', '사탕을 너무 많이 먹으면 이에 나빠.'],
  ['peach', '복숭아', '🍑', 'food', 'The peach is soft and sweet.', '복숭아는 말랑하고 달아.'],
  ['cherry', '체리', '🍒', 'food', 'The cherry is small and red.', '체리는 작고 빨개.'],
  ['lemon', '레몬', '🍋', 'food', 'The lemon is sour.', '레몬은 셔.'],
  ['donut', '도넛', '🍩', 'food', 'The donut has a hole.', '도넛은 구멍이 있어.'],
  ['cap', '모자(야구모자)', '🧢', 'wear', 'I wear a cap in the sun.', '해가 쨍하면 모자를 써.'],
  ['hat', '모자', '👒', 'wear', 'She has a pretty hat.', '그 애는 예쁜 모자가 있어.'],
  ['shirt', '셔츠', '👕', 'wear', 'This shirt is blue.', '이 셔츠는 파래.'],
  ['pants', '바지', '👖', 'wear', 'Put on your pants.', '바지 입어.'],
  ['shoes', '신발', '👟', 'wear', 'Tie your shoes.', '신발 끈 묶어.'],
  ['socks', '양말', '🧦', 'wear', 'My socks are warm.', '내 양말은 따뜻해.'],
  ['dress', '원피스', '👗', 'wear', 'What a nice dress!', '정말 예쁜 원피스다!'],
  ['glasses', '안경', '👓', 'wear', 'Grandpa wears glasses.', '할아버지는 안경을 쓰셔.'],
  ['umbrella', '우산', '☂️', 'wear', 'Take your umbrella.', '우산 챙겨.'],
  ['backpack', '책가방', '🎒', 'wear', 'My backpack is heavy.', '내 책가방은 무거워.'],
  ['gloves', '장갑', '🧤', 'wear', 'Wear gloves in the snow.', '눈 올 땐 장갑을 껴.'],
  ['scarf', '목도리', '🧣', 'wear', 'This scarf keeps me warm.', '이 목도리는 따뜻해.'],
  ['pencil', '연필', '✏️', 'school', 'Can I borrow your pencil?', '연필 빌려도 돼?'],
  ['crayon', '크레용', '🖍️', 'school', 'I need a red crayon.', '빨간 크레용이 필요해.'],
  ['scissors', '가위', '✂️', 'school', 'Be careful with scissors.', '가위는 조심해서 써.'],
  ['ruler', '자', '📏', 'school', 'Draw a line with a ruler.', '자로 선을 그어.'],
  ['teacher', '선생님', '🧑‍🏫', 'school', 'My teacher is very kind.', '우리 선생님은 정말 친절하셔.'],
  ['clock', '시계', '⏰', 'school', 'Look at the clock.', '시계를 봐.'],
  ['computer', '컴퓨터', '💻', 'school', 'We use a computer in class.', '수업 시간에 컴퓨터를 써.'],
  ['bus', '버스', '🚌', 'place', 'I take the bus to school.', '난 버스 타고 학교에 가.'],
  ['notebook', '공책', '📓', 'school', 'Write it in your notebook.', '공책에 써.'],
  ['paint', '물감', '🎨', 'school', 'Let\'s paint a picture.', '그림 그리자(물감으로).'],
  ['mom', '엄마', '👩', 'people', 'I love my mom.', '난 엄마를 사랑해.'],
  ['dad', '아빠', '👨', 'people', 'My dad cooks dinner.', '우리 아빠는 저녁을 만드셔.'],
  ['baby', '아기', '👶', 'people', 'The baby is sleeping.', '아기가 자고 있어.'],
  ['grandma', '할머니', '👵', 'people', 'Grandma reads me a story.', '할머니가 이야기를 읽어 주셔.'],
  ['grandpa', '할아버지', '👴', 'people', 'Grandpa likes to walk.', '할아버지는 산책을 좋아하셔.'],
  ['family', '가족', '👪', 'people', 'I love my family.', '난 우리 가족을 사랑해.'],
  ['eye', '눈(얼굴)', '👁️', 'people', 'Close your eyes.', '눈 감아.'],
  ['ear', '귀', '👂', 'people', 'I hear with my ears.', '난 귀로 들어.'],
  ['nose', '코', '👃', 'people', 'I smell with my nose.', '난 코로 냄새를 맡아.'],
  ['mouth', '입', '👄', 'people', 'Open your mouth.', '입 벌려.'],
  ['hand', '손', '✋', 'people', 'Wash your hands.', '손 씻어.'],
  ['foot', '발', '🦶', 'people', 'My foot is cold.', '내 발이 차가워.'],
  ['tooth', '이', '🦷', 'people', 'I lost a tooth!', '이가 빠졌어!'],
  ['house', '집', '🏠', 'place', 'This is my house.', '여기가 우리 집이야.'],
  ['park', '공원', '🏞️', 'place', 'Let\'s go to the park.', '공원에 가자.'],
  ['hospital', '병원', '🏥', 'place', 'The doctor works at the hospital.', '의사 선생님은 병원에서 일하셔.'],
  ['store', '가게', '🏪', 'place', 'We buy milk at the store.', '가게에서 우유를 사.'],
  ['beach', '바닷가', '🏖️', 'place', 'We built a sandcastle at the beach.', '바닷가에서 모래성을 쌓았어.'],
  ['mountain', '산', '⛰️', 'place', 'The mountain is very high.', '산이 아주 높아.'],
  ['car', '자동차', '🚗', 'place', 'Dad drives a car.', '아빠는 차를 운전하셔.'],
  ['bike', '자전거', '🚲', 'place', 'I can ride a bike.', '난 자전거를 탈 수 있어.'],
  ['train', '기차', '🚂', 'place', 'The train is long.', '기차는 길어.'],
  ['airplane', '비행기', '✈️', 'place', 'The airplane flies in the sky.', '비행기가 하늘을 날아.'],
  ['boat', '배', '⛵', 'place', 'The boat is on the lake.', '배가 호수 위에 있어.'],
  ['rainbow', '무지개', '🌈', 'nature', 'Look at the rainbow!', '무지개 좀 봐!'],
  ['wind', '바람', '🌬️', 'nature', 'The wind is strong today.', '오늘 바람이 세.'],
  ['ocean', '바다', '🌊', 'nature', 'Fish live in the ocean.', '물고기는 바다에 살아.'],
  ['earth', '지구', '🌍', 'nature', 'We live on Earth.', '우리는 지구에 살아.'],
  ['red', '빨간색', '🔴', 'color', 'An apple is red.', '사과는 빨개.'],
  ['blue', '파란색', '🔵', 'color', 'The sky is blue.', '하늘은 파래.'],
  ['yellow', '노란색', '🟡', 'color', 'A banana is yellow.', '바나나는 노래.'],
  ['green', '초록색', '🟢', 'color', 'The grass is green.', '풀은 초록색이야.'],
  ['purple', '보라색', '🟣', 'color', 'Grapes are purple.', '포도는 보라색이야.'],
  ['orange', '주황색', '🟠', 'color', 'A carrot is orange.', '당근은 주황색이야.'],
  ['white', '하얀색', '⚪', 'color', 'Snow is white.', '눈은 하얘.'],
  ['black', '검은색', '⚫', 'color', 'The night sky is black.', '밤하늘은 까매.'],
  ['brown', '갈색', '🟤', 'color', 'The bear is brown.', '곰은 갈색이야.'],
  ['one', '하나(1)', '1️⃣', 'color', 'I have one nose.', '나는 코가 하나야.'],
  ['two', '둘(2)', '2️⃣', 'color', 'I have two hands.', '나는 손이 두 개야.'],
  ['three', '셋(3)', '3️⃣', 'color', 'Three little pigs.', '아기 돼지 세 마리.'],
  ['four', '넷(4)', '4️⃣', 'color', 'A dog has four legs.', '강아지는 다리가 네 개야.'],
  ['five', '다섯(5)', '5️⃣', 'color', 'I have five fingers.', '손가락이 다섯 개야.'],
  ['six', '여섯(6)', '6️⃣', 'color', 'An ant has six legs.', '개미는 다리가 여섯 개야.'],
  ['seven', '일곱(7)', '7️⃣', 'color', 'A week has seven days.', '일주일은 칠 일이야.'],
  ['eight', '여덟(8)', '8️⃣', 'color', 'A spider has eight legs.', '거미는 다리가 여덟 개야.'],
  ['nine', '아홉(9)', '9️⃣', 'color', 'I go to bed at nine.', '난 아홉 시에 자.'],
  ['ten', '열(10)', '🔟', 'color', 'Count to ten!', '열까지 세어 봐!'],
  ['sad', '슬픈', '😢', 'feel', 'I feel sad today.', '오늘 슬퍼.'],
  ['angry', '화난', '😠', 'feel', 'Don\'t be angry.', '화내지 마.'],
  ['scared', '무서운', '😨', 'feel', 'I\'m scared of the dark.', '어두운 게 무서워.'],
  ['surprised', '놀란', '😮', 'feel', 'Wow, I\'m so surprised!', '우와, 정말 놀랐어!'],
  ['sick', '아픈', '🤒', 'feel', 'I feel sick.', '나 아파.'],
  ['hot', '더운', '🥵', 'feel', 'It\'s so hot today.', '오늘 정말 더워.'],
  ['cold', '추운', '🥶', 'feel', 'It\'s cold outside.', '밖은 추워.'],
  ['run', '달리다', '🏃', 'do', 'I can run fast.', '난 빨리 달릴 수 있어.'],
  ['draw', '그리다', '🖌️', 'do', 'Let\'s draw a cat.', '고양이를 그리자.'],
  ['sing', '노래하다', '🎤', 'do', 'Let\'s sing a song.', '노래 부르자.'],
  ['dance', '춤추다', '💃', 'do', 'I like to dance.', '난 춤추는 게 좋아.'],
  ['cook', '요리하다', '🍳', 'do', 'Mom and I cook together.', '엄마랑 같이 요리해.'],
  ['write', '쓰다', '✍️', 'do', 'Write your name here.', '여기에 이름을 써.'],
  ['read', '읽다', '📖', 'do', 'I read a book every night.', '난 매일 밤 책을 읽어.'],
  ['cry', '울다', '😭', 'do', 'Don\'t cry. It\'s okay.', '울지 마. 괜찮아.'],
  ['laugh', '웃다', '😂', 'do', 'That joke made me laugh.', '그 농담 때문에 웃었어.'],
  ['clap', '박수 치다', '👏', 'do', 'Clap your hands!', '손뼉을 쳐!'],
  ['wash', '씻다', '🧼', 'do', 'Wash your hands before you eat.', '먹기 전에 손을 씻어.'],
  ['brush', '닦다(양치)', '🪥', 'do', 'Brush your teeth.', '이 닦아.'],
];
export const WORDS = RAW.map(([en, ko, pic, cat, exEn, exKo]) => ({ en, ko, pic, cat, ex: [exEn, exKo] }));
export const wordByEn = Object.fromEntries(WORDS.map(w => [w.en, w]));
export const CATS = { animal: '🐾 동물·곤충', nature: '🌿 자연', food: '🍓 먹을 것', home: '🏠 집·물건', wear: '👕 입는 것·물건', school: '✏️ 학교', people: '👪 가족·몸', place: '🚗 장소·탈것', color: '🎨 색깔·숫자', feel: '😊 기분', do: '🏃 하는 일' };

// 잡은 친구 → 낱말
const SPECIES_WORDS = {
  sumbbong: ['leaf'], mulbangkong: ['water'], gureumsom: ['cloud'], dotoriram: ['squirrel', 'acorn'], bulssikkomi: ['fire'],
  agoknoguri: ['raccoon'], banjjakbandi: ['light', 'bug'], dalbittokki: ['moon', 'rabbit'], chaekbeolmung: ['book'], jongsorinyang: ['bell', 'cat'],
  kkotbyeori: ['flower'], hansupwang: ['crown'], beoseokkongi: ['mushroom'], byeolttongi: ['star'], ppulppuri: ['rock'], eoreumbangul: ['ice'],
  mudangbyeori: ['ladybug'], noranapuri: ['butterfly'], gochujamdori: ['bug'], janggubbul: ['beetle'], jipgewang: ['beetle'],
  ggulbeori: ['bee', 'flower'], maemmaemi: ['tree'], gaemidaejang: ['ant'],
  chijeunyang: ['cat'], sanchaekmeong: ['dog', 'ball'], jjaekchamsae: ['bird', 'bread'], kkachikkak: ['bird'], kkwakkwagi: ['duck', 'swim'],
  kkangchongtokki: ['rabbit'], goseumbbung: ['hedgehog'], gaeguldori: ['frog', 'swim'],
  mulbitbungeo: ['fish', 'swim'], bidaningeo: ['fish'], eonggeumgeobuk: ['turtle'], hwanggeumingeo: ['fish'],
};
// 만든 가구 · 거둔 작물 · 재료 → 낱말
const THING_WORDS = {
  cushion: ['leaf'], stool: ['chair', 'tree'], table: ['chair'], plant: ['flower'], lamp: ['light'], shelf: ['book'], tank: ['fish', 'water'],
  bed: ['bed', 'mushroom'], rug: ['flower'], frame: ['picture'], window: ['window'], garland: ['star', 'light'], mobile: ['shell'],
  sunpot: ['sunflower'], lotuslamp: ['flower', 'light'], pumpkinlamp: ['pumpkin', 'light'], snowman: ['snow'], chime: ['rain', 'bell'],
  friendframe: ['friend', 'picture'], blossomtree: ['tree', 'flower'], firejar: ['light', 'bug'], acornlamp: ['acorn', 'light'],
  mapleframe: ['leaf', 'picture'], snowglobe: ['snow', 'ice'],
  lettuce: ['lettuce'], tomato: ['tomato'], strawberry: ['strawberry'], sunflower: ['sunflower'], lotus: ['flower', 'water'], pumpkin: ['pumpkin'],
  leaf: ['leaf'], twig: ['tree'], pebble: ['rock'], petal: ['flower'], shell: ['shell'], star: ['star'], raindrop: ['rain'], snowflake: ['snow'],
};
// 짝꿍 돌보기 · 걷기 → 낱말
const ACTION_WORDS = {
  feed: ['eat', 'hungry', 'cookie'], play: ['play', 'ball', 'happy'], pet: ['happy'], walk: ['walk'], water: ['water'],
  sleep: ['sleep', 'sleepy'], gift: ['gift', 'friend'], friendWater: ['water', 'friend'], stop: ['gift'],
};

function V() {
  const s = store.state;
  s.vocab = s.vocab || { words: {}, quiz: { day: '', rounds: 0, pops: 0 } };
  return s.vocab;
}

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

let newWordFn = () => {};
/** 새 낱말 카드를 얻었을 때 알림 */
export function onNewWord(fn) { newWordFn = fn; }

/** 낱말 카드 얻기. 새로 얻은 낱말 목록을 돌려줌 */
export function learn(list, now = Date.now()) {
  const v = V();
  const fresh = [];
  for (const en of list) {
    if (!wordByEn[en] || v.words[en]) continue;
    v.words[en] = { at: now, right: 0, wrong: 0, last: 0 };
    fresh.push(wordByEn[en]);
  }
  if (fresh.length) { store.save(); newWordFn(fresh); }
  return fresh;
}

/** quests.track에서 함께 불림: 게임 속 일 → 낱말 카드 */
export function learnFrom(on, info = {}) {
  if (on === 'catch' && info.sp) return learn(SPECIES_WORDS[info.sp.id] || []);
  if ((on === 'craft' || on === 'harvest' || on === 'gather') && info.id) return learn(THING_WORDS[info.id] || []);
  if (ACTION_WORDS[on]) return learn(ACTION_WORDS[on]);
  return [];
}

/** 영어 대화에 나온 낱말 (대화를 끝냈을 때) */
export function learnFromText(text) {
  const found = new Set();
  for (const raw of text.toLowerCase().match(/[a-z]+/g) || []) {
    const w = raw.replace(/(ies)$/, 'y').replace(/s$/, '');
    for (const c of [raw, w]) if (wordByEn[c]) found.add(c);
  }
  return learn([...found]);
}

export const known = () => WORDS.filter(w => V().words[w.en]);
export const knownCount = () => Object.keys(V().words).length;
export const stars = (en) => Math.min(3, Math.max(0, (V().words[en]?.right || 0) - (V().words[en]?.wrong || 0) * 0.5) | 0);

// ---------- 퀴즈 ----------

export const QUIZ_MIN = 4; // 낱말 카드가 4장 넘게 있어야 퀴즈
export const canQuiz = () => knownCount() >= QUIZ_MIN;

function weight(en, now) {
  const r = V().words[en];
  if (!r) return 4; // 아직 못 모은 낱말 (보통·어려움에서 도전)
  const days = (now - (r.last || r.at)) / 86400000;
  // 틀린 것, 덜 맞힌 것, 오래 안 본 것이 먼저
  return 1 + Math.max(0, r.wrong - r.right * 0.5) * 5 + Math.max(0, 3 - r.right) * 1.5 + Math.min(5, days);
}

// 난이도: 1 쉬움(그림) / 2 보통(한글 보고 영어, 듣고 낱말 고르기) / 3 어려움(철자 고르기, 빈칸 채우기)
export const LEVELS = {
  1: { name: '쉬움', icon: '⭐', desc: '그림 보고 영어 고르기 · 듣고 그림 고르기', types: ['pic', 'listen'], grow: 2 },
  2: { name: '보통', icon: '⭐⭐', desc: '한글 뜻 보고 영어 고르기 · 듣고 낱말 고르기 · 새 낱말 도전', types: ['ko', 'listenWord', 'pic'], grow: 3 },
  3: { name: '어려움', icon: '⭐⭐⭐', desc: '바른 철자 고르기 · 문장 빈칸 채우기 · 모든 낱말', types: ['spell', 'blank', 'ko'], grow: 4 },
};
export const quizLevel = () => V().quiz.level || 2;
export function setQuizLevel(l) { V().quiz.level = l; store.save(); }

// 헷갈리는 철자 만들기 (글자 바꾸기·빼기·겹치기·모음 바꾸기)
const VOWEL = { a: 'e', e: 'a', i: 'e', o: 'u', u: 'o' };
function misspell(word, rnd) {
  const w = word.toLowerCase();
  const out = new Set();
  const tries = [
    () => { const i = 1 + Math.floor(rnd() * (w.length - 2)); return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); },
    () => { const i = 1 + Math.floor(rnd() * (w.length - 1)); return w.slice(0, i) + w.slice(i + 1); },
    () => { const i = Math.floor(rnd() * w.length); return w.slice(0, i + 1) + w[i] + w.slice(i + 1); },
    () => { const idx = [...w].map((c, i) => (VOWEL[c] ? i : -1)).filter(i => i >= 0); if (!idx.length) return w; const i = idx[Math.floor(rnd() * idx.length)]; return w.slice(0, i) + VOWEL[w[i]] + w.slice(i + 1); },
    () => { const i = w.search(/(.)\1/); return i >= 0 ? w.slice(0, i) + w.slice(i + 1) : w + 'e'; },
  ];
  for (let k = 0; out.size < 3 && k < 40; k++) {
    const m = tries[k % tries.length]();
    if (m && m !== w && m.length >= 2 && !wordByEn[m]) out.add(m);
  }
  return [...out];
}

// 예문에서 그 낱말 자리를 빈칸으로 (strawberries 같은 꼴도)
function blankOut(word) {
  const stem = word.en.length > 3 && /[ye]$/.test(word.en) ? word.en.slice(0, -1) : word.en;
  const re = new RegExp(`\\b${stem}[a-z']*`, 'i');
  return re.test(word.ex[0]) ? word.ex[0].replace(re, '_____') : null;
}

/**
 * 퀴즈 문제 만들기. 문제마다 { word, type, choices }
 * type: pic(그림→영어) listen(듣고 그림) ko(한글→영어) listenWord(듣고 낱말) spell(바른 철자) blank(빈칸)
 * 쉬움은 모은 카드만, 보통은 모은 카드 + 새 낱말 조금, 어려움은 모든 낱말에서 나와요.
 */
export function makeQuiz(n = 5, rnd = Math.random, now = Date.now(), level = quizLevel()) {
  const mine = known();
  if (mine.length < QUIZ_MIN) return [];
  const L = LEVELS[level] || LEVELS[2];
  const fresh = WORDS.filter(w => !V().words[w.en]);
  const out = [];
  const used = new Set();
  for (let i = 0; i < n; i++) {
    // 보통: 다섯 문제 중 두 문제 정도는 새 낱말, 어려움: 절반은 새 낱말
    const wantNew = fresh.length && (level === 3 ? rnd() < 0.5 : level === 2 ? rnd() < 0.4 : false);
    let cand = (wantNew ? fresh : mine).filter(w => !used.has(w.en));
    if (!cand.length) cand = mine.filter(w => !used.has(w.en));
    if (!cand.length) break;
    const total = cand.reduce((t, w) => t + weight(w.en, now), 0);
    let x = rnd() * total;
    let word = cand[cand.length - 1];
    for (const w of cand) { x -= weight(w.en, now); if (x < 0) { word = w; break; } }
    used.add(word.en);
    let type = L.types[Math.floor(rnd() * L.types.length)];
    const blank = type === 'blank' ? blankOut(word) : null;
    const wrongSpell = type === 'spell' ? misspell(word.en, rnd) : [];
    if (type === 'blank' && !blank) type = 'ko';
    if (type === 'spell' && wrongSpell.length < 3) type = 'ko';
    let choices;
    if (type === 'spell') {
      choices = [{ en: word.en, spell: word.en }, ...wrongSpell.map(m => ({ en: m, spell: m }))];
    } else {
      // 오답: 같은 분류 먼저 (쉬움은 아는 낱말 중에서, 보통·어려움은 모든 낱말에서)
      const others = WORDS.filter(w => w.en !== word.en && w.pic !== word.pic && w.ko !== word.ko);
      const sameCat = others.filter(w => w.cat === word.cat && (level > 1 || V().words[w.en]));
      const rest = others.filter(w => !sameCat.includes(w));
      const wrong = [];
      for (const list of [sameCat, rest]) {
        const l = [...list];
        while (wrong.length < 3 && l.length) wrong.push(l.splice(Math.floor(rnd() * l.length), 1)[0]);
      }
      choices = [word, ...wrong];
    }
    for (let k = choices.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [choices[k], choices[j]] = [choices[j], choices[k]]; }
    out.push({ word, type, choices, blank: type === 'blank' ? blank : null, isNew: !V().words[word.en] });
  }
  return out;
}

/** 답 기록. 새 낱말을 맞히면 그 카드를 얻어요. 새 카드를 얻었으면 true */
export function answerQuiz(en, ok, now = Date.now()) {
  let got = false;
  if (!V().words[en]) {
    if (!ok) return false;
    got = learn([en], now).length > 0;
  }
  const r = V().words[en];
  if (!r) return got;
  if (ok) r.right++; else r.wrong++;
  r.last = now;
  store.save();
  return got;
}

export const QUIZ_GROW_ROUNDS = 3; // 하루 3판까지 짝꿍 성장

/** 한 판을 끝냈을 때. 오늘 몇 번째 판인지 돌려줌 */
export function finishRound(now = new Date()) {
  const q = V().quiz;
  if (q.day !== dayKey(now)) { q.day = dayKey(now); q.rounds = 0; q.pops = 0; }
  q.rounds++;
  store.save();
  return q.rounds;
}

/** 짝꿍 방에서 가끔 내는 깜짝 퀴즈 (하루 3번까지) */
export function popQuizReady(rnd = Math.random, now = new Date()) {
  const q = V().quiz;
  if (q.day !== dayKey(now)) { q.day = dayKey(now); q.rounds = 0; q.pops = 0; }
  return canQuiz() && q.pops < 3 && rnd() < 0.4;
}
export function usePopQuiz() { V().quiz.pops++; store.save(); }

/** 이번 주(리포트용): 새 낱말, 퀴즈 정답률 */
export function weekWords(fromMs) {
  return Object.entries(V().words).filter(([, r]) => r.at >= fromMs).map(([en]) => wordByEn[en]).filter(Boolean);
}
export function accuracy() {
  const rs = Object.values(V().words);
  const right = rs.reduce((s, r) => s + r.right, 0);
  const wrong = rs.reduce((s, r) => s + r.wrong, 0);
  return right + wrong ? Math.round((right / (right + wrong)) * 100) : null;
}
