export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export const personalityQuestions: LikertQuestion[] = [
  // === 통제성 (control) ===
  { id: 'personality_001', text: '나는 주변 상황을 내가 통제하고 있다고 느낀다.', subscale: 'control' },
  { id: 'personality_002', text: '예상치 못한 일이 생기면 쉽게 당황한다.', reverse: true, subscale: 'control' },
  { id: 'personality_003', text: '어려운 상황에서도 침착하게 대처할 수 있다.', subscale: 'control' },
  { id: 'personality_004', text: '일의 결과는 내 노력에 달려 있다고 생각한다.', subscale: 'control' },
  { id: 'personality_005', text: '감정에 휩쓸리지 않고 이성적으로 판단하려 한다.', subscale: 'control' },

  // === 낙천성 (optimism) ===
  { id: 'personality_006', text: '미래에 좋은 일이 생길 것이라고 기대한다.', subscale: 'optimism' },
  { id: 'personality_007', text: '실패해도 다시 일어설 수 있다는 자신감이 있다.', subscale: 'optimism' },
  { id: 'personality_008', text: '세상은 대체로 살기 좋은 곳이라고 생각한다.', subscale: 'optimism' },
  { id: 'personality_009', text: '일이 잘 안 풀리면 쉽게 좌절한다.', reverse: true, subscale: 'optimism' },
  { id: 'personality_010', text: '어떤 상황에서도 긍정적인 면을 찾으려 노력한다.', subscale: 'optimism' },
  { id: 'personality_011', text: '나는 대체로 행복한 사람이라고 생각한다.', subscale: 'optimism' },

  // === 의심성 (suspicion) ===
  { id: 'personality_012', text: '다른 사람의 말에 숨은 의도가 있을 수 있다고 생각한다.', subscale: 'suspicion' },
  { id: 'personality_013', text: '처음 만나는 사람을 쉽게 신뢰한다.', reverse: true, subscale: 'suspicion' },
  { id: 'personality_014', text: '사람들이 나에 대해 뒷담화를 할 수 있다고 느낀다.', subscale: 'suspicion' },
  { id: 'personality_015', text: '약속을 지키지 않는 사람이 많다고 느낀다.', subscale: 'suspicion' },
  { id: 'personality_016', text: '남의 호의에도 경계심을 갖는 편이다.', subscale: 'suspicion' },

  // === 지적성향 (intellect) ===
  { id: 'personality_017', text: '추상적인 개념이나 이론에 대해 생각하는 것을 즐긴다.', subscale: 'intellect' },
  { id: 'personality_018', text: '복잡한 문제를 분석하고 해결하는 데 흥미를 느낀다.', subscale: 'intellect' },
  { id: 'personality_019', text: '새로운 지식을 배우는 것이 삶의 큰 즐거움이다.', subscale: 'intellect' },
  { id: 'personality_020', text: '철학적이거나 심오한 대화를 선호한다.', subscale: 'intellect' },
  { id: 'personality_021', text: '이론적인 내용보다 실용적인 것이 더 중요하다.', reverse: true, subscale: 'intellect' },

  // === 긴장도 (tension) ===
  { id: 'personality_022', text: '사소한 일에도 긴장하는 경향이 있다.', subscale: 'tension' },
  { id: 'personality_023', text: '편안하게 이완된 상태를 유지하기 어렵다.', subscale: 'tension' },
  { id: 'personality_024', text: '마감이 다가오면 극심한 스트레스를 받는다.', subscale: 'tension' },
  { id: 'personality_025', text: '대부분의 상황에서 여유롭게 행동할 수 있다.', reverse: true, subscale: 'tension' },
  { id: 'personality_026', text: '걱정이 많아 잠을 설치는 경우가 있다.', subscale: 'tension' },

  // === 모험성 (adventure) ===
  { id: 'personality_027', text: '나는 새로운 경험을 적극적으로 찾아다닌다.', subscale: 'adventure' },
  { id: 'personality_028', text: '익숙한 것보다 낯선 것에 끌린다.', subscale: 'adventure' },
  { id: 'personality_029', text: '위험을 감수하더라도 도전하는 편이다.', subscale: 'adventure' },
  { id: 'personality_030', text: '안정적이고 예측 가능한 생활을 선호한다.', reverse: true, subscale: 'adventure' },
  { id: 'personality_031', text: '해본 적 없는 활동에 먼저 참여하려 한다.', subscale: 'adventure' },

  // === 감수성 (sensitivity) ===
  { id: 'personality_032', text: '나는 다른 사람의 감정에 쉽게 공감한다.', subscale: 'sensitivity' },
  { id: 'personality_033', text: '예술 작품이나 음악을 감상하며 깊이 감동받는 편이다.', subscale: 'sensitivity' },
  { id: 'personality_034', text: '주변의 분위기나 감정 변화를 민감하게 알아차린다.', subscale: 'sensitivity' },
  { id: 'personality_035', text: '슬픈 영화나 이야기에 쉽게 눈물이 난다.', subscale: 'sensitivity' },
  { id: 'personality_036', text: '감정적인 것보다는 논리적인 것이 더 편하다.', reverse: true, subscale: 'sensitivity' },

  // === 양심성 (conscience) ===
  { id: 'personality_037', text: '규칙과 원칙을 지키는 것이 중요하다고 생각한다.', subscale: 'conscience' },
  { id: 'personality_038', text: '약속을 어기면 큰 죄책감을 느낀다.', subscale: 'conscience' },
  { id: 'personality_039', text: '다른 사람에게 피해를 주는 행동은 절대 하지 않으려 한다.', subscale: 'conscience' },
  { id: 'personality_040', text: '도덕적 기준이 상황에 따라 유연할 수 있다고 본다.', reverse: true, subscale: 'conscience' },
  { id: 'personality_041', text: '공정하지 않은 일을 보면 참기 어렵다.', subscale: 'conscience' },

  // === 온정성 (warmth) ===
  { id: 'personality_042', text: '사람들과 함께 시간을 보내는 것이 즐겁다.', subscale: 'warmth' },
  { id: 'personality_043', text: '어려운 처지에 있는 사람을 보면 돕고 싶다.', subscale: 'warmth' },
  { id: 'personality_044', text: '나는 주변 사람들에게 따뜻한 사람이라는 평을 듣는다.', subscale: 'warmth' },
  { id: 'personality_045', text: '타인과 깊은 관계를 맺는 것이 부담스럽다.', reverse: true, subscale: 'warmth' },
  { id: 'personality_046', text: '다른 사람의 이야기를 경청하는 편이다.', subscale: 'warmth' },

  // === 지배성 (dominance) ===
  { id: 'personality_047', text: '그룹에서 자연스럽게 리더 역할을 맡는 편이다.', subscale: 'dominance' },
  { id: 'personality_048', text: '의견 대립이 있을 때 내 주장을 관철하려 한다.', subscale: 'dominance' },
  { id: 'personality_049', text: '다른 사람의 의견에 쉽게 따르는 편이다.', reverse: true, subscale: 'dominance' },
  { id: 'personality_050', text: '결정을 내릴 때 주도적으로 나서는 편이다.', subscale: 'dominance' },
  { id: 'personality_051', text: '내 방식대로 일이 진행되기를 원한다.', subscale: 'dominance' },

  // === 사회적 대담성 (social_boldness) ===
  { id: 'personality_052', text: '낯선 사람에게도 먼저 말을 거는 편이다.', subscale: 'social_boldness' },
  { id: 'personality_053', text: '많은 사람 앞에서 발표하는 것이 두렵지 않다.', subscale: 'social_boldness' },
  { id: 'personality_054', text: '사회적 상황에서 눈에 띄는 것이 불편하다.', reverse: true, subscale: 'social_boldness' },
  { id: 'personality_055', text: '모임에서 분위기를 주도하는 편이다.', subscale: 'social_boldness' },
  { id: 'personality_056', text: '처음 가는 모임이나 행사에서도 편안하다.', subscale: 'social_boldness' },

  // === 독립성 (independence) ===
  { id: 'personality_057', text: '혼자서 결정하고 실행하는 것을 선호한다.', subscale: 'independence' },
  { id: 'personality_058', text: '다른 사람의 조언 없이도 판단에 확신이 있다.', subscale: 'independence' },
  { id: 'personality_059', text: '주변의 기대보다 나만의 기준으로 행동한다.', subscale: 'independence' },
  { id: 'personality_060', text: '중요한 결정을 할 때 주변의 의견을 많이 구한다.', reverse: true, subscale: 'independence' },
  { id: 'personality_061', text: '남들과 다른 길을 가는 것이 불안하지 않다.', subscale: 'independence' },

  // === 완벽주의 (perfectionism) ===
  { id: 'personality_062', text: '작은 실수도 용납하기 어렵다.', subscale: 'perfectionism' },
  { id: 'personality_063', text: '결과물의 완성도에 대한 기준이 높은 편이다.', subscale: 'perfectionism' },
  { id: 'personality_064', text: '대충 끝내기보다 시간이 걸려도 완벽하게 하려 한다.', subscale: 'perfectionism' },
  { id: 'personality_065', text: '어느 정도 수준이면 만족하고 넘어가는 편이다.', reverse: true, subscale: 'perfectionism' },
  { id: 'personality_066', text: '계획대로 되지 않으면 처음부터 다시 하고 싶다.', subscale: 'perfectionism' },

  // === 개방성 (openness) ===
  { id: 'personality_067', text: '다양한 문화와 가치관을 존중한다.', subscale: 'openness' },
  { id: 'personality_068', text: '기존 방식에 의문을 갖고 새로운 방법을 시도한다.', subscale: 'openness' },
  { id: 'personality_069', text: '나와 다른 의견도 열린 마음으로 받아들인다.', subscale: 'openness' },
  { id: 'personality_070', text: '전통적인 방식이 가장 안전하다고 생각한다.', reverse: true, subscale: 'openness' },

  // === 자기규율 (self_discipline) ===
  { id: 'personality_071', text: '해야 할 일을 미루지 않고 바로 시작한다.', subscale: 'self_discipline' },
  { id: 'personality_072', text: '목표를 세우면 끝까지 달성하려 노력한다.', subscale: 'self_discipline' },
  { id: 'personality_073', text: '유혹에 흔들리지 않고 계획을 지키는 편이다.', subscale: 'self_discipline' },
  { id: 'personality_074', text: '자기관리가 부족하다는 평을 듣는 편이다.', reverse: true, subscale: 'self_discipline' },

  // === Dark Triad: 나르시시즘 (narcissism_dark) ===
  { id: 'personality_075', text: '나는 대부분의 사람보다 특별한 존재라고 느낀다.', subscale: 'narcissism_dark' },
  { id: 'personality_076', text: '다른 사람들이 나를 동경하는 것은 당연하다고 생각한다.', subscale: 'narcissism_dark' },
  { id: 'personality_077', text: '내가 원하면 어떤 사람이든 내 편으로 만들 수 있다.', subscale: 'narcissism_dark' },

  // === Dark Triad: 마키아벨리즘 (machiavellianism_dark) ===
  { id: 'personality_078', text: '목적을 위해 수단이 정당화될 수 있다고 생각한다.', subscale: 'machiavellianism_dark' },
  { id: 'personality_079', text: '사람들의 약점을 파악해두면 유용할 때가 있다.', subscale: 'machiavellianism_dark' },
  { id: 'personality_080', text: '전략적으로 정보를 숨기는 것은 현명한 처세이다.', subscale: 'machiavellianism_dark' },

  // === Dark Triad: 사이코패시 (psychopathy_dark) ===
  { id: 'personality_081', text: '다른 사람의 고통에 크게 동요되지 않는다.', subscale: 'psychopathy_dark' },
  { id: 'personality_082', text: '규칙을 어기는 스릴이 즐거울 때가 있다.', subscale: 'psychopathy_dark' },
  { id: 'personality_083', text: '후회라는 감정을 잘 느끼지 못한다.', subscale: 'psychopathy_dark' },
  { id: 'personality_084', text: '내 이익을 위해 다른 사람을 이용하는 것은 자연스러운 일이다.', subscale: 'psychopathy_dark' },
];
