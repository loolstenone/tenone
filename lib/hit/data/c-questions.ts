import type { LikertQuestion } from './personality-questions';

/**
 * HIT C — "어디로 이직?" (경력전환 분석)
 * 4개 모듈, 60문항
 *
 * 모듈 1: 경력 자본 (capital) — 20문항
 *   - expertise (전문성 깊이)
 *   - network (인적 네트워크)
 *   - org_understanding (조직 이해력)
 *   - competencies (핵심 역량)
 *
 * 모듈 2: 이직 동기 (motivation) — 15문항
 *   - push (밀어내는 요인)
 *   - pull (끌어당기는 요인)
 *
 * 모듈 3: 전환 가능성 (transferability) — 15문항
 *   - skill_portability (스킬 이동성)
 *   - industry_adaptability (산업 적응력)
 *   - learning_agility (학습 민첩성)
 *
 * 모듈 4: 준비도 & 갭 (readiness) — 10문항
 *   - preparation (준비 정도)
 *   - gap_awareness (갭 인식)
 */

// ── 모듈 1: 경력 자본 (20문항) ──────────────────────────────────

export const capitalQuestions: LikertQuestion[] = [
  // === expertise (전문성 깊이) ===
  { id: 'c_cap_001', text: '내 분야에서 3년 이상의 깊은 실무 경험이 있다.', subscale: 'expertise' },
  { id: 'c_cap_002', text: '동료들이 내 전문 분야에 대해 조언을 구한다.', subscale: 'expertise' },
  { id: 'c_cap_003', text: '업계 최신 트렌드와 기술 변화를 꾸준히 파악하고 있다.', subscale: 'expertise' },
  { id: 'c_cap_004', text: '내가 맡은 업무에서 독자적으로 의사결정을 내릴 수 있다.', subscale: 'expertise' },
  { id: 'c_cap_005', text: '내 전문성을 다른 산업에서도 활용할 수 있다고 생각한다.', subscale: 'expertise' },

  // === network (인적 네트워크) ===
  { id: 'c_cap_006', text: '다른 회사의 같은 직군 사람들과 정기적으로 교류한다.', subscale: 'network' },
  { id: 'c_cap_007', text: '이직 관련 정보를 얻을 수 있는 인맥이 있다.', subscale: 'network' },
  { id: 'c_cap_008', text: '업계 행사나 커뮤니티에 적극적으로 참여한다.', subscale: 'network' },
  { id: 'c_cap_009', text: '나를 추천해줄 수 있는 전문가가 있다.', subscale: 'network' },
  { id: 'c_cap_010', text: '온라인(LinkedIn 등)에서 내 전문성을 보여주고 있다.', subscale: 'network' },

  // === org_understanding (조직 이해력) ===
  { id: 'c_cap_011', text: '다양한 부서와 협업한 경험이 풍부하다.', subscale: 'org_understanding' },
  { id: 'c_cap_012', text: '조직의 의사결정 구조를 잘 이해하고 활용할 수 있다.', subscale: 'org_understanding' },
  { id: 'c_cap_013', text: '새로운 조직 문화에 빠르게 적응할 수 있다.', subscale: 'org_understanding' },
  { id: 'c_cap_014', text: '상사와 경영진의 기대를 파악하고 맞추는 데 능숙하다.', subscale: 'org_understanding' },
  { id: 'c_cap_015', text: '조직 정치에 휘둘리지 않고 중립을 유지할 수 있다.', subscale: 'org_understanding' },

  // === competencies (핵심 역량) ===
  { id: 'c_cap_016', text: '문제 해결 시 체계적인 접근 방법을 사용한다.', subscale: 'competencies' },
  { id: 'c_cap_017', text: '복잡한 내용을 간결하게 전달하는 커뮤니케이션 능력이 있다.', subscale: 'competencies' },
  { id: 'c_cap_018', text: '프로젝트를 기획부터 완료까지 독립적으로 수행할 수 있다.', subscale: 'competencies' },
  { id: 'c_cap_019', text: '데이터를 분석하여 인사이트를 도출하는 능력이 있다.', subscale: 'competencies' },
  { id: 'c_cap_020', text: '팀원들의 성장을 돕고 코칭하는 역할을 한 적이 있다.', subscale: 'competencies' },
];

// ── 모듈 2: 이직 동기 (15문항) ──────────────────────────────────

export const motivationQuestions: LikertQuestion[] = [
  // === push (현직 불만족 — 밀어내는 요인) ===
  { id: 'c_mot_001', text: '현재 직장에서 성장의 한계를 느낀다.', subscale: 'push' },
  { id: 'c_mot_002', text: '나의 기여에 비해 보상이 충분하지 않다고 느낀다.', subscale: 'push' },
  { id: 'c_mot_003', text: '현재 조직의 비전이나 방향에 공감하기 어렵다.', subscale: 'push' },
  { id: 'c_mot_004', text: '상사나 동료와의 관계가 업무 만족도에 부정적 영향을 준다.', subscale: 'push' },
  { id: 'c_mot_005', text: '현재 하는 일이 나의 강점을 충분히 활용하지 못한다.', subscale: 'push' },
  { id: 'c_mot_006', text: '워라밸이 심하게 무너져 있다고 느낀다.', subscale: 'push' },
  { id: 'c_mot_007', text: '현재 직장에서의 미래가 불안하다.', subscale: 'push' },

  // === pull (새로운 기회 — 끌어당기는 요인) ===
  { id: 'c_mot_008', text: '새로운 분야나 산업에 대한 강한 관심이 있다.', subscale: 'pull' },
  { id: 'c_mot_009', text: '더 큰 영향력을 발휘할 수 있는 역할을 원한다.', subscale: 'pull' },
  { id: 'c_mot_010', text: '특정 기업이나 조직에서 일하고 싶다는 목표가 있다.', subscale: 'pull' },
  { id: 'c_mot_011', text: '새로운 도전과 학습 기회가 나를 설레게 한다.', subscale: 'pull' },
  { id: 'c_mot_012', text: '사회적 임팩트가 더 큰 일을 하고 싶다.', subscale: 'pull' },
  { id: 'c_mot_013', text: '더 좋은 보상과 복리후생을 제공하는 곳을 찾고 있다.', subscale: 'pull' },
  { id: 'c_mot_014', text: '내 전문성을 더 인정받을 수 있는 환경을 원한다.', subscale: 'pull' },
  { id: 'c_mot_015', text: '창업이나 프리랜서 등 독립적인 커리어를 고려하고 있다.', subscale: 'pull' },
];

// ── 모듈 3: 전환 가능성 (15문항) ────────────────────────────────

export const transferabilityQuestions: LikertQuestion[] = [
  // === skill_portability (스킬 이동성) ===
  { id: 'c_trn_001', text: '나의 핵심 스킬은 산업에 관계없이 활용 가능하다.', subscale: 'skill_portability' },
  { id: 'c_trn_002', text: '이전 직장에서의 경험이 다른 분야에서도 가치가 있다.', subscale: 'skill_portability' },
  { id: 'c_trn_003', text: '기술적 스킬 외에도 범용적인 소프트 스킬이 강하다.', subscale: 'skill_portability' },
  { id: 'c_trn_004', text: '내 포트폴리오나 성과를 구체적으로 보여줄 수 있다.', subscale: 'skill_portability' },
  { id: 'c_trn_005', text: '현재 스킬로는 원하는 직무를 수행하기 어렵다.', reverse: true, subscale: 'skill_portability' },

  // === industry_adaptability (산업 적응력) ===
  { id: 'c_trn_006', text: '다른 산업의 비즈니스 모델을 이해하고 분석할 수 있다.', subscale: 'industry_adaptability' },
  { id: 'c_trn_007', text: '새로운 도메인 지식을 빠르게 습득한 경험이 있다.', subscale: 'industry_adaptability' },
  { id: 'c_trn_008', text: '지금과 전혀 다른 업종에서 일할 수 있다고 자신한다.', subscale: 'industry_adaptability' },
  { id: 'c_trn_009', text: '업계가 바뀌면 처음부터 다시 시작해야 할 것 같다.', reverse: true, subscale: 'industry_adaptability' },
  { id: 'c_trn_010', text: '다양한 산업의 사람들과 소통하는 데 어려움이 없다.', subscale: 'industry_adaptability' },

  // === learning_agility (학습 민첩성) ===
  { id: 'c_trn_011', text: '새로운 도구나 기술을 배우는 것이 즐겁다.', subscale: 'learning_agility' },
  { id: 'c_trn_012', text: '최근 6개월 이내에 새로운 스킬을 배운 적이 있다.', subscale: 'learning_agility' },
  { id: 'c_trn_013', text: '실패에서 교훈을 얻고 빠르게 개선하는 편이다.', subscale: 'learning_agility' },
  { id: 'c_trn_014', text: '피드백을 적극적으로 수용하고 반영한다.', subscale: 'learning_agility' },
  { id: 'c_trn_015', text: '익숙한 방식을 고수하기보다 새로운 방법을 시도한다.', subscale: 'learning_agility' },
];

// ── 모듈 4: 준비도 & 갭 (10문항) ────────────────────────────────

export const readinessQuestions: LikertQuestion[] = [
  // === preparation (준비 정도) ===
  { id: 'c_rdy_001', text: '이력서와 포트폴리오를 최신 상태로 유지하고 있다.', subscale: 'preparation' },
  { id: 'c_rdy_002', text: '목표 직무에 필요한 자격증이나 교육을 준비하고 있다.', subscale: 'preparation' },
  { id: 'c_rdy_003', text: '면접 연습이나 모의 인터뷰를 해본 적이 있다.', subscale: 'preparation' },
  { id: 'c_rdy_004', text: '이직 시 재정적 여유(3~6개월 생활비)가 있다.', subscale: 'preparation' },
  { id: 'c_rdy_005', text: '가족이나 주변 사람들의 지지를 받고 있다.', subscale: 'preparation' },

  // === gap_awareness (갭 인식) ===
  { id: 'c_rdy_006', text: '원하는 직무와 현재 역량 사이의 차이를 명확히 알고 있다.', subscale: 'gap_awareness' },
  { id: 'c_rdy_007', text: '부족한 부분을 채우기 위한 구체적인 계획이 있다.', subscale: 'gap_awareness' },
  { id: 'c_rdy_008', text: '이직 후 적응 기간이 필요하다는 것을 인정한다.', subscale: 'gap_awareness' },
  { id: 'c_rdy_009', text: '연봉이나 직급이 낮아질 수 있다는 것을 수용할 수 있다.', subscale: 'gap_awareness' },
  { id: 'c_rdy_010', text: '이직 실패 시의 대안(Plan B)을 생각해둔 적이 있다.', subscale: 'gap_awareness' },
];

// ── 모듈 메타 정보 ──────────────────────────────────────────────

export const hitCModules = [
  { key: 'capital', label: '경력 자본', icon: '💼', questions: capitalQuestions, count: 20, time: 4 },
  { key: 'motivation', label: '이직 동기', icon: '🎯', questions: motivationQuestions, count: 15, time: 3 },
  { key: 'transferability', label: '전환 가능성', icon: '🔄', questions: transferabilityQuestions, count: 15, time: 3 },
  { key: 'readiness', label: '준비도', icon: '✅', questions: readinessQuestions, count: 10, time: 2 },
] as const;

export const allCQuestions: LikertQuestion[] = [
  ...capitalQuestions,
  ...motivationQuestions,
  ...transferabilityQuestions,
  ...readinessQuestions,
];
