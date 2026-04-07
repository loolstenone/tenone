/**
 * CH Deep (인성 심화) 45문항 (44 + 미끼 1) — 7점 리커트
 * module = 'character_deep'
 */

export interface CHDeepQuestion {
  id: string;
  module: 'character_deep';
  subscale: string;
  text: string;
  reverse: boolean;
  darkTag?: 'NR' | 'MK' | 'PP' | 'SP';
}

export const chDeepQuestions: CHDeepQuestion[] = [
  // 완벽주의 (5)
  { id: 'chx_pf01', module: 'character_deep', subscale: 'perfectionism', text: '사소한 오류도 눈에 띄어서 그냥 넘기기 힘들다.', reverse: false },
  { id: 'chx_pf02', module: 'character_deep', subscale: 'perfectionism', text: '80점짜리를 빨리 내는 것보다 100점짜리를 늦게 내는 것이 낫다.', reverse: false },
  { id: 'chx_pf03', module: 'character_deep', subscale: 'perfectionism', text: '남들은 괜찮다고 하지만 내 기준에는 부족하다고 느낄 때가 많다.', reverse: true },
  { id: 'chx_pf04', module: 'character_deep', subscale: 'perfectionism', text: '완벽하지 않으면 시작하지 않는 편이다.', reverse: true },
  { id: 'chx_pf05', module: 'character_deep', subscale: 'perfectionism', text: '작업 결과에 대한 내 기준이 동료들보다 높다고 느낀다.', reverse: false, darkTag: 'NR' },

  // 감수성 (4)
  { id: 'chx_sn01', module: 'character_deep', subscale: 'sensitivity', text: '영화나 책에서 슬픈 장면에 쉽게 감정이입된다.', reverse: false },
  { id: 'chx_sn02', module: 'character_deep', subscale: 'sensitivity', text: '분위기나 감정의 미세한 변화를 잘 포착한다.', reverse: false },
  { id: 'chx_sn03', module: 'character_deep', subscale: 'sensitivity', text: '감정적 상황에서도 별로 동요하지 않는 편이다.', reverse: true, darkTag: 'PP' },
  { id: 'chx_sn04', module: 'character_deep', subscale: 'sensitivity', text: '타인의 고통에 공감하는 것이 자연스럽다.', reverse: false },

  // 긴장감 (4)
  { id: 'chx_tn01', module: 'character_deep', subscale: 'tension', text: '일이 잘 풀리지 않으면 쉽게 초조해진다.', reverse: true },
  { id: 'chx_tn02', module: 'character_deep', subscale: 'tension', text: '중요한 발표 전날 잠을 설치는 편이다.', reverse: true },
  { id: 'chx_tn03', module: 'character_deep', subscale: 'tension', text: '불확실한 상황에서도 비교적 편안하게 지낼 수 있다.', reverse: false, darkTag: 'PP' },
  { id: 'chx_tn04', module: 'character_deep', subscale: 'tension', text: '미래에 대한 걱정이 현재의 즐거움을 방해할 때가 있다.', reverse: true },

  // 온정성 (3)
  { id: 'chx_wm01', module: 'character_deep', subscale: 'warmth', text: '처음 만난 사람에게도 따뜻하게 다가가는 편이다.', reverse: false },
  { id: 'chx_wm02', module: 'character_deep', subscale: 'warmth', text: '사람들이 나를 만나면 편안해한다는 이야기를 듣는다.', reverse: false },
  { id: 'chx_wm03', module: 'character_deep', subscale: 'warmth', text: '업무 관계에서도 인간적 유대가 중요하다고 생각한다.', reverse: false },

  // 사회적 대담성 (3)
  { id: 'chx_sb01', module: 'character_deep', subscale: 'social_boldness', text: '지위가 높은 사람 앞에서도 당당하게 이야기할 수 있다.', reverse: false },
  { id: 'chx_sb02', module: 'character_deep', subscale: 'social_boldness', text: '주목받는 상황이 부담보다 자연스럽다.', reverse: false, darkTag: 'NR' },
  { id: 'chx_sb03', module: 'character_deep', subscale: 'social_boldness', text: '자신의 성과를 적극적으로 어필할 수 있다.', reverse: false, darkTag: 'NR' },

  // 낙관성 (3)
  { id: 'chx_op01', module: 'character_deep', subscale: 'optimism', text: '유머로 분위기를 전환하는 것에 능숙하다.', reverse: false },
  { id: 'chx_op02', module: 'character_deep', subscale: 'optimism', text: '힘든 시기도 결국 지나간다고 믿는다.', reverse: false },
  { id: 'chx_op03', module: 'character_deep', subscale: 'optimism', text: '일이 잘 안 되면 쉽게 의욕을 잃는다.', reverse: true },

  // 자기통제 (3)
  { id: 'chx_ct01', module: 'character_deep', subscale: 'control', text: '감정적으로 격앙되었을 때 먼저 심호흡하는 습관이 있다.', reverse: false },
  { id: 'chx_ct02', module: 'character_deep', subscale: 'control', text: '감정에 휩쓸려 중요한 결정을 잘못 내린 적이 있다.', reverse: true },
  { id: 'chx_ct03', module: 'character_deep', subscale: 'control', text: '압박 상황에서도 침착하게 판단할 수 있다고 자신한다.', reverse: false, darkTag: 'PP' },

  // 자기훈련 (2)
  { id: 'chx_sd01', module: 'character_deep', subscale: 'self_discipline', text: '유혹이 있어도 스스로 정한 기준을 잘 지킨다.', reverse: false },
  { id: 'chx_sd02', module: 'character_deep', subscale: 'self_discipline', text: '운동, 학습 등 자기계발 루틴을 유지하고 있다.', reverse: false },

  // 독립성 (3)
  { id: 'chx_in01', module: 'character_deep', subscale: 'independence', text: '유행이나 트렌드에 크게 영향받지 않는다.', reverse: false },
  { id: 'chx_in02', module: 'character_deep', subscale: 'independence', text: '다른 사람의 평가가 내 결정에 큰 영향을 미친다.', reverse: true },
  { id: 'chx_in03', module: 'character_deep', subscale: 'independence', text: '혼자서도 결정을 내리고 책임질 수 있다.', reverse: false },

  // 경계심 (3)
  { id: 'chx_su01', module: 'character_deep', subscale: 'suspicion', text: '협력 제안을 받으면 상대방의 이익을 먼저 따져본다.', reverse: true, darkTag: 'MK' },
  { id: 'chx_su02', module: 'character_deep', subscale: 'suspicion', text: '뒤에서 나에 대해 이야기한다고 느낄 때가 있다.', reverse: true },
  { id: 'chx_su03', module: 'character_deep', subscale: 'suspicion', text: '새로운 사람도 일단 신뢰하고 보는 편이다.', reverse: false },

  // 개방성 (4)
  { id: 'chx_op2_01', module: 'character_deep', subscale: 'openness', text: '익숙하지 않은 문화나 관습에 대해 호기심이 크다.', reverse: false },
  { id: 'chx_op2_02', module: 'character_deep', subscale: 'openness', text: '다양한 배경의 사람과 일하는 것이 즐겁다.', reverse: false },
  { id: 'chx_op2_03', module: 'character_deep', subscale: 'openness', text: '변화가 많은 환경이 지루한 환경보다 낫다.', reverse: false },
  { id: 'chx_op2_04', module: 'character_deep', subscale: 'openness', text: '자기 생각과 다른 정보는 무시하는 경향이 있다.', reverse: true },

  // 모험성 (3)
  { id: 'chx_ad01', module: 'character_deep', subscale: 'adventure', text: '해본 적 없는 일에 지원하는 것이 두렵지 않다.', reverse: false },
  { id: 'chx_ad02', module: 'character_deep', subscale: 'adventure', text: '안정적인 직장보다 도전적인 환경에 끌린다.', reverse: false },
  { id: 'chx_ad03', module: 'character_deep', subscale: 'adventure', text: '위험 부담이 큰 결정도 과감하게 내릴 수 있다.', reverse: false, darkTag: 'SP' },

  // 지적호기심 (3)
  { id: 'chx_iq01', module: 'character_deep', subscale: 'intellect', text: '복잡한 문제를 파고드는 것이 스트레스가 아니라 즐거움이다.', reverse: false },
  { id: 'chx_iq02', module: 'character_deep', subscale: 'intellect', text: '단순 반복 업무를 오래 하면 지적으로 갈증을 느낀다.', reverse: false },
  { id: 'chx_iq03', module: 'character_deep', subscale: 'intellect', text: '배움에 대한 욕구가 나이와 무관하게 강하다.', reverse: false },

  // 양심성 (1)
  { id: 'chx_con01', module: 'character_deep', subscale: 'conscience', text: '양심에 어긋나는 일을 하면 오래 마음이 불편하다.', reverse: false },

  // 미끼 (1)
  { id: 'chx_val01', module: 'character_deep', subscale: 'DECOY', text: '나는 다른 사람을 한 번도 판단해본 적이 없다.', reverse: false },
];
