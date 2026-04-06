import type { LikertQuestion } from './personality-questions';

/**
 * HIT E — "인생 2막?" (Post-Retirement / Second Act)
 * 4개 모듈, 60문항
 *
 * 모듈 1: 삶의 만족도 & 열정 (satisfaction) — 15문항
 *   - life_satisfaction (현재 삶 만족도) — 8문항
 *   - remaining_passion (남은 열정) — 7문항
 *
 * 모듈 2: 방향 탐색 (direction) — 20문항
 *   - social_contribution (사회 공헌) — 5문항
 *   - entrepreneurship (창업/사업) — 5문항
 *   - education (교육/멘토링) — 5문항
 *   - leisure (여가/취미) — 5문항
 *
 * 모듈 3: 레거시 스킬 (legacy) — 15문항
 *   - transferable_skills (이전 가능 스킬) — 8문항
 *   - domain_expertise (도메인 전문성) — 7문항
 *
 * 모듈 4: 사회적 연결 & 준비도 (social_readiness) — 10문항
 *   - social_need (사회적 필요) — 5문항
 *   - second_act_readiness (2막 준비도) — 5문항
 */

// ── 모듈 1: 삶의 만족도 & 열정 (15문항) ──────────────────────────

export const satisfactionQuestions: LikertQuestion[] = [
  // === life_satisfaction (현재 삶 만족도) ===
  { id: 'e_sat_001', text: '전반적으로 지금의 삶에 만족한다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_002', text: '매일 아침 일어나는 것이 즐겁다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_003', text: '하루가 무의미하게 느껴질 때가 많다.', reverse: true, subscale: 'life_satisfaction' },
  { id: 'e_sat_004', text: '나에게 중요한 관계(가족, 친구)가 잘 유지되고 있다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_005', text: '건강 상태에 대해 크게 걱정하지 않는다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_006', text: '경제적으로 안정감을 느낀다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_007', text: '지금까지의 커리어를 돌아보면 만족스럽다.', subscale: 'life_satisfaction' },
  { id: 'e_sat_008', text: '사회에서 여전히 가치 있는 존재라고 느낀다.', subscale: 'life_satisfaction' },

  // === remaining_passion (남은 열정) ===
  { id: 'e_sat_009', text: '새로운 것을 배우고 도전하는 것이 여전히 설렌다.', subscale: 'remaining_passion' },
  { id: 'e_sat_010', text: '앞으로 10년간 꼭 이루고 싶은 목표가 있다.', subscale: 'remaining_passion' },
  { id: 'e_sat_011', text: '일상에서 에너지를 느끼는 활동이 있다.', subscale: 'remaining_passion' },
  { id: 'e_sat_012', text: '시간이 나면 자발적으로 하고 싶은 일이 떠오른다.', subscale: 'remaining_passion' },
  { id: 'e_sat_013', text: '나이가 들어도 세상에 기여할 수 있다고 믿는다.', subscale: 'remaining_passion' },
  { id: 'e_sat_014', text: '지금 가장 하고 싶은 일이 무엇인지 명확하다.', subscale: 'remaining_passion' },
  { id: 'e_sat_015', text: '퇴직 후의 삶이 두렵기보다 기대된다.', subscale: 'remaining_passion' },
];

// ── 모듈 2: 방향 탐색 (20문항) ──────────────────────────────────

export const directionQuestions: LikertQuestion[] = [
  // === social_contribution (사회 공헌) ===
  { id: 'e_dir_001', text: '내 경험으로 사회 문제를 해결하는 데 기여하고 싶다.', subscale: 'social_contribution' },
  { id: 'e_dir_002', text: '봉사활동이나 비영리 단체 활동에 관심이 있다.', subscale: 'social_contribution' },
  { id: 'e_dir_003', text: '다음 세대를 위해 더 나은 사회를 만드는 일에 보람을 느낀다.', subscale: 'social_contribution' },
  { id: 'e_dir_004', text: '지역사회에서 리더 역할을 해보고 싶다.', subscale: 'social_contribution' },
  { id: 'e_dir_005', text: '환경, 교육, 복지 등 특정 사회 이슈에 대한 소명이 있다.', subscale: 'social_contribution' },

  // === entrepreneurship (창업/사업) ===
  { id: 'e_dir_006', text: '은퇴 후 작은 사업이라도 운영해보고 싶다.', subscale: 'entrepreneurship' },
  { id: 'e_dir_007', text: '나만의 브랜드나 제품/서비스를 만들어보고 싶다.', subscale: 'entrepreneurship' },
  { id: 'e_dir_008', text: '사업 아이디어를 구체적으로 구상해본 적이 있다.', subscale: 'entrepreneurship' },
  { id: 'e_dir_009', text: '리스크를 감수하더라도 새로운 도전을 해볼 용기가 있다.', subscale: 'entrepreneurship' },
  { id: 'e_dir_010', text: '비즈니스 감각이나 경영 능력에 자신이 있다.', subscale: 'entrepreneurship' },

  // === education (교육/멘토링) ===
  { id: 'e_dir_011', text: '후배나 젊은 세대에게 내 경험을 전수하고 싶다.', subscale: 'education' },
  { id: 'e_dir_012', text: '강의, 강연, 또는 코칭 활동에 관심이 있다.', subscale: 'education' },
  { id: 'e_dir_013', text: '글을 쓰거나 콘텐츠를 만들어 지식을 공유하고 싶다.', subscale: 'education' },
  { id: 'e_dir_014', text: '특정 분야에서 전문가로서 멘토 역할을 할 자신이 있다.', subscale: 'education' },
  { id: 'e_dir_015', text: '교육이나 멘토링을 통해 사람이 성장하는 것을 볼 때 보람을 느낀다.', subscale: 'education' },

  // === leisure (여가/취미) ===
  { id: 'e_dir_016', text: '여행, 스포츠, 예술 등 취미 활동에 더 많은 시간을 쏟고 싶다.', subscale: 'leisure' },
  { id: 'e_dir_017', text: '그동안 못했던 개인적인 꿈을 이루고 싶다.', subscale: 'leisure' },
  { id: 'e_dir_018', text: '일보다 자유로운 시간이 더 중요하다고 생각한다.', subscale: 'leisure' },
  { id: 'e_dir_019', text: '새로운 취미나 기술(악기, 그림, 요리 등)을 배우고 싶다.', subscale: 'leisure' },
  { id: 'e_dir_020', text: '여유롭게 살면서 삶을 즐기는 것이 가장 큰 목표다.', subscale: 'leisure' },
];

// ── 모듈 3: 레거시 스킬 (15문항) ────────────────────────────────

export const legacyQuestions: LikertQuestion[] = [
  // === transferable_skills (이전 가능 스킬) ===
  { id: 'e_leg_001', text: '직장에서 쌓은 리더십 경험을 다른 영역에서도 활용할 수 있다.', subscale: 'transferable_skills' },
  { id: 'e_leg_002', text: '사람을 설득하고 소통하는 능력이 뛰어나다.', subscale: 'transferable_skills' },
  { id: 'e_leg_003', text: '문제를 분석하고 해결하는 체계적인 접근법을 갖고 있다.', subscale: 'transferable_skills' },
  { id: 'e_leg_004', text: '프로젝트를 기획하고 관리하는 능력이 있다.', subscale: 'transferable_skills' },
  { id: 'e_leg_005', text: '다양한 사람들과 협업한 경험이 풍부하다.', subscale: 'transferable_skills' },
  { id: 'e_leg_006', text: '위기 상황에서 침착하게 대처하는 편이다.', subscale: 'transferable_skills' },
  { id: 'e_leg_007', text: '새로운 환경에 적응하는 데 자신이 있다.', subscale: 'transferable_skills' },
  { id: 'e_leg_008', text: '디지털 도구(컴퓨터, 스마트폰, 앱 등)를 어려움 없이 사용한다.', subscale: 'transferable_skills' },

  // === domain_expertise (도메인 전문성) ===
  { id: 'e_leg_009', text: '내 전문 분야에서 30년 가까운 경험과 지식이 있다.', subscale: 'domain_expertise' },
  { id: 'e_leg_010', text: '업계에서 나를 전문가로 인정하는 사람들이 있다.', subscale: 'domain_expertise' },
  { id: 'e_leg_011', text: '내 분야의 역사와 흐름을 깊이 있게 이해하고 있다.', subscale: 'domain_expertise' },
  { id: 'e_leg_012', text: '후배들이 내 전문 지식에 대해 조언을 구한다.', subscale: 'domain_expertise' },
  { id: 'e_leg_013', text: '내 경험은 책이나 강의 자료로 만들 수 있을 정도로 체계적이다.', subscale: 'domain_expertise' },
  { id: 'e_leg_014', text: '은퇴 후에도 내 전문 분야에서 활동할 수 있다고 생각한다.', subscale: 'domain_expertise' },
  { id: 'e_leg_015', text: '내 전문성은 시대가 변해도 여전히 가치가 있다.', subscale: 'domain_expertise' },
];

// ── 모듈 4: 사회적 연결 & 준비도 (10문항) ───────────────────────

export const socialReadinessQuestions: LikertQuestion[] = [
  // === social_need (사회적 필요) ===
  { id: 'e_soc_001', text: '사람들과 어울리고 교류하는 것이 삶에 필수적이다.', subscale: 'social_need' },
  { id: 'e_soc_002', text: '직장을 떠나면 외로워질 것 같다.', subscale: 'social_need' },
  { id: 'e_soc_003', text: '직장 외에도 정기적으로 만나는 커뮤니티가 있다.', subscale: 'social_need' },
  { id: 'e_soc_004', text: '사회적 역할(직함, 소속)이 없어도 자아 정체성이 흔들리지 않는다.', reverse: true, subscale: 'social_need' },
  { id: 'e_soc_005', text: '은퇴 후에도 사회적 관계를 유지할 구체적인 계획이 있다.', subscale: 'social_need' },

  // === second_act_readiness (2막 준비도) ===
  { id: 'e_soc_006', text: '은퇴 후 삶에 대한 구체적인 계획을 세워둔 적이 있다.', subscale: 'second_act_readiness' },
  { id: 'e_soc_007', text: '재정적으로 은퇴 후 최소 5년은 안정적이다.', subscale: 'second_act_readiness' },
  { id: 'e_soc_008', text: '가족과 은퇴 후 삶에 대해 충분히 이야기해보았다.', subscale: 'second_act_readiness' },
  { id: 'e_soc_009', text: '은퇴 후에도 건강을 유지하기 위한 노력을 하고 있다.', subscale: 'second_act_readiness' },
  { id: 'e_soc_010', text: '인생 2막을 시작할 준비가 되어 있다고 느낀다.', subscale: 'second_act_readiness' },
];

// ── 모듈 메타 정보 ──────────────────────────────────────────────

export const hitEModules = [
  { key: 'satisfaction', label: '삶의 만족도 & 열정', icon: '🌅', questions: satisfactionQuestions, count: 15, time: 3 },
  { key: 'direction', label: '방향 탐색', icon: '🧭', questions: directionQuestions, count: 20, time: 4 },
  { key: 'legacy', label: '레거시 스킬', icon: '🏛️', questions: legacyQuestions, count: 15, time: 3 },
  { key: 'social_readiness', label: '사회적 연결 & 준비도', icon: '🤝', questions: socialReadinessQuestions, count: 10, time: 2 },
] as const;

export const allEQuestions: LikertQuestion[] = [
  ...satisfactionQuestions,
  ...directionQuestions,
  ...legacyQuestions,
  ...socialReadinessQuestions,
];
