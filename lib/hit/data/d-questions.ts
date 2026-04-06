import type { LikertQuestion } from './personality-questions';

/**
 * HIT D — "시니어 리더십 전환?" (Senior Leadership Transition)
 * 4개 모듈, 70문항
 *
 * 대상: 경력 10년+ 관리자 또는 15년+ 시니어
 *
 * 모듈 1: 전문성 깊이 & 도메인 (expertise) — 20문항
 *   - expertise_depth (전문 분야 깊이) 10문항
 *   - expertise_breadth (도메인 확장성) 10문항
 *
 * 모듈 2: 리더십 스타일 (leadership) — 20문항
 *   - visionary (비전 제시형) 5문항
 *   - coaching (코칭형) 5문항
 *   - democratic (민주형) 5문항
 *   - commanding (지시형) 5문항
 *
 * 모듈 3: 정체성 유연성 (identity) — 15문항
 *   - role_identity (역할 정체성) 5문항
 *   - change_openness (변화 개방성) 5문항
 *   - self_reinvention (자기 재발명) 5문항
 *
 * 모듈 4: 네트워크 & 시니어 준비도 (network) — 15문항
 *   - network_quality (네트워크 질) 5문항
 *   - network_breadth (네트워크 폭) 5문항
 *   - senior_readiness (시니어 준비도) 5문항
 */

// ── 모듈 1: 전문성 깊이 & 도메인 (20문항) ───────────────────────

export const expertiseQuestions: LikertQuestion[] = [
  // === expertise_depth (전문 분야 깊이) ===
  { id: 'd_exp_001', text: '내 분야에서 10년 이상 깊이 있는 실무와 관리 경험을 보유하고 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_002', text: '업계에서 내 전문성을 인정받아 강연이나 자문 요청을 받은 적이 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_003', text: '내 분야의 기술적 문제를 근본 원인부터 해결할 수 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_004', text: '후배나 팀원에게 내 전문 분야에 대해 체계적으로 교육할 수 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_005', text: '내 분야의 미래 트렌드를 예측하고 선제적으로 대응한 경험이 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_006', text: '동종 업계에서 나를 벤치마킹 대상으로 본다고 느낀다.', subscale: 'expertise_depth' },
  { id: 'd_exp_007', text: '내 전문 영역에서 새로운 방법론이나 프레임워크를 만들어 본 적이 있다.', subscale: 'expertise_depth' },
  { id: 'd_exp_008', text: '내가 떠나면 조직에 큰 지식 공백이 생길 것이라고 생각한다.', subscale: 'expertise_depth' },
  { id: 'd_exp_009', text: '내 분야에서 어려운 의사결정을 내릴 때 동료들이 내 의견을 최종적으로 참고한다.', subscale: 'expertise_depth' },
  { id: 'd_exp_010', text: '전문 분야 관련 저술, 기고, 특허 등 가시적 성과물이 있다.', subscale: 'expertise_depth' },

  // === expertise_breadth (도메인 확장성) ===
  { id: 'd_exp_011', text: '내 전문성을 다른 산업이나 도메인에 적용한 경험이 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_012', text: '두 개 이상의 서로 다른 직무 영역에서 성과를 낸 적이 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_013', text: '기술적 전문성과 비즈니스 감각을 동시에 보유하고 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_014', text: '다른 분야 전문가들과 협업할 때 그들의 언어로 소통할 수 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_015', text: '새로운 영역의 프로젝트를 맡아도 빠르게 핵심을 파악한다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_016', text: '한 분야에만 몰두하다 보니 시야가 좁아진 느낌이 든다.', reverse: true, subscale: 'expertise_breadth' },
  { id: 'd_exp_017', text: '서로 다른 분야의 지식을 융합해 새로운 가치를 만들어낸 경험이 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_018', text: '경영진과 실무진 양쪽의 관점을 모두 이해하고 통역할 수 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_019', text: '내 커리어 전체를 관통하는 핵심 테마나 철학이 있다.', subscale: 'expertise_breadth' },
  { id: 'd_exp_020', text: '전혀 다른 업종으로 전환하더라도 리더 역할은 할 수 있다고 확신한다.', subscale: 'expertise_breadth' },
];

// ── 모듈 2: 리더십 스타일 (20문항) ────────────────────────────────

export const leadershipQuestions: LikertQuestion[] = [
  // === visionary (비전 제시형) ===
  { id: 'd_ldr_001', text: '팀에게 미래 비전을 제시하고 함께 나아갈 방향을 그리는 것이 중요하다.', subscale: 'visionary' },
  { id: 'd_ldr_002', text: '큰 그림을 보여주고 사람들이 스스로 길을 찾게 하는 편이다.', subscale: 'visionary' },
  { id: 'd_ldr_003', text: '조직의 3~5년 후 모습을 구체적으로 설명할 수 있다.', subscale: 'visionary' },
  { id: 'd_ldr_004', text: '사람들이 내 아이디어에 영감을 받고 자발적으로 따라온다고 느낀다.', subscale: 'visionary' },
  { id: 'd_ldr_005', text: '불확실한 상황에서 확신을 가지고 방향을 제시하는 역할을 한다.', subscale: 'visionary' },

  // === coaching (코칭형) ===
  { id: 'd_ldr_006', text: '팀원 각자의 강점을 발견하고 키워주는 것이 리더의 핵심 역할이다.', subscale: 'coaching' },
  { id: 'd_ldr_007', text: '직접 해결하기보다 질문을 통해 팀원 스스로 답을 찾게 유도한다.', subscale: 'coaching' },
  { id: 'd_ldr_008', text: '팀원의 성장 계획을 함께 수립하고 정기적으로 피드백을 제공한다.', subscale: 'coaching' },
  { id: 'd_ldr_009', text: '팀원의 실수를 성장 기회로 만드는 데 능숙하다.', subscale: 'coaching' },
  { id: 'd_ldr_010', text: '나를 거쳐간 사람들이 더 큰 역할로 성장한 사례가 여럿 있다.', subscale: 'coaching' },

  // === democratic (민주형) ===
  { id: 'd_ldr_011', text: '중요한 결정을 내리기 전에 팀원들의 의견을 충분히 수렴한다.', subscale: 'democratic' },
  { id: 'd_ldr_012', text: '다양한 관점이 모일수록 더 좋은 결과가 나온다고 믿는다.', subscale: 'democratic' },
  { id: 'd_ldr_013', text: '의사결정 과정을 투명하게 공유하고 팀의 합의를 중시한다.', subscale: 'democratic' },
  { id: 'd_ldr_014', text: '나보다 뛰어난 전문가의 의견에 기꺼이 따를 수 있다.', subscale: 'democratic' },
  { id: 'd_ldr_015', text: '리더가 모든 것을 알 필요는 없다. 집단 지성이 더 강력하다.', subscale: 'democratic' },

  // === commanding (지시형) ===
  { id: 'd_ldr_016', text: '위기 상황에서는 빠르고 명확한 지시가 최선이라고 생각한다.', subscale: 'commanding' },
  { id: 'd_ldr_017', text: '목표와 기한을 명확히 정하고 팀원의 이행을 관리하는 편이다.', subscale: 'commanding' },
  { id: 'd_ldr_018', text: '성과가 미달할 때 직접적으로 지적하고 개선을 요구한다.', subscale: 'commanding' },
  { id: 'd_ldr_019', text: '효율을 위해 때로는 토론보다 결단이 필요하다고 본다.', subscale: 'commanding' },
  { id: 'd_ldr_020', text: '책임과 권한의 경계가 명확한 조직을 선호한다.', subscale: 'commanding' },
];

// ── 모듈 3: 정체성 유연성 (15문항) ───────────────────────────────

export const identityQuestions: LikertQuestion[] = [
  // === role_identity (역할 정체성) ===
  { id: 'd_idt_001', text: '나는 "무엇을 하는 사람"보다 "어떤 가치를 만드는 사람"으로 정의된다.', subscale: 'role_identity' },
  { id: 'd_idt_002', text: '직함이 바뀌어도 내 정체성은 흔들리지 않는다.', subscale: 'role_identity' },
  { id: 'd_idt_003', text: '현재 직무가 아닌 다른 역할에서도 나답게 일할 수 있다고 확신한다.', subscale: 'role_identity' },
  { id: 'd_idt_004', text: '내 커리어 전체를 관통하는 핵심 역량이 무엇인지 명확히 알고 있다.', subscale: 'role_identity' },
  { id: 'd_idt_005', text: '현재 직함과 역할을 잃으면 나 자신을 잃은 것 같은 느낌이 든다.', reverse: true, subscale: 'role_identity' },

  // === change_openness (변화 개방성) ===
  { id: 'd_idt_006', text: '10년 넘게 쌓은 경험이라도 더 나은 방법이 있으면 기꺼이 바꾼다.', subscale: 'change_openness' },
  { id: 'd_idt_007', text: '완전히 새로운 도전 앞에서 두려움보다 호기심이 앞선다.', subscale: 'change_openness' },
  { id: 'd_idt_008', text: '지금까지의 방식이 맞지 않을 수 있다는 피드백을 수용할 수 있다.', subscale: 'change_openness' },
  { id: 'd_idt_009', text: '과거의 성공 방정식에 집착하는 편이다.', reverse: true, subscale: 'change_openness' },
  { id: 'd_idt_010', text: '5년 뒤 나는 지금과 완전히 다른 일을 하고 있을 수도 있다고 생각한다.', subscale: 'change_openness' },

  // === self_reinvention (자기 재발명) ===
  { id: 'd_idt_011', text: '커리어 중 대변혁(직무 전환, 산업 이동 등)을 성공적으로 겪은 적이 있다.', subscale: 'self_reinvention' },
  { id: 'd_idt_012', text: '기존의 전문성 위에 새로운 스킬을 쌓아 변신한 경험이 있다.', subscale: 'self_reinvention' },
  { id: 'd_idt_013', text: '나를 재정의하는 것이 두렵지 않고 오히려 흥미롭다.', subscale: 'self_reinvention' },
  { id: 'd_idt_014', text: '"이 나이에 새로운 걸 시작해?"라는 말에 동조하는 편이다.', reverse: true, subscale: 'self_reinvention' },
  { id: 'd_idt_015', text: '내 다음 챕터를 위해 의도적으로 준비하고 있는 것이 있다.', subscale: 'self_reinvention' },
];

// ── 모듈 4: 네트워크 & 시니어 준비도 (15문항) ────────────────────

export const networkQuestions: LikertQuestion[] = [
  // === network_quality (네트워크 질) ===
  { id: 'd_net_001', text: '나에게 솔직한 피드백을 줄 수 있는 시니어 멘토가 3명 이상 있다.', subscale: 'network_quality' },
  { id: 'd_net_002', text: '중요한 커리어 결정 시 조언을 구할 수 있는 신뢰할 만한 네트워크가 있다.', subscale: 'network_quality' },
  { id: 'd_net_003', text: '내 네트워크에는 C-level이나 이사급 이상의 사람이 포함되어 있다.', subscale: 'network_quality' },
  { id: 'd_net_004', text: '나를 헤드헌터나 좋은 기회에 연결해줄 수 있는 사람이 있다.', subscale: 'network_quality' },
  { id: 'd_net_005', text: '내 네트워크의 사람들과 상호 가치를 교환하는 관계를 유지하고 있다.', subscale: 'network_quality' },

  // === network_breadth (네트워크 폭) ===
  { id: 'd_net_006', text: '내 네트워크는 동종 업계를 넘어 다양한 산업의 리더들을 포함한다.', subscale: 'network_breadth' },
  { id: 'd_net_007', text: '세대를 초월한 네트워크(후배 리더 ~ 선배 경영인)를 유지하고 있다.', subscale: 'network_breadth' },
  { id: 'd_net_008', text: '국내뿐 아니라 해외 전문가와도 교류하는 편이다.', subscale: 'network_breadth' },
  { id: 'd_net_009', text: '학계, 정부, 민간 등 다양한 섹터의 사람들을 알고 있다.', subscale: 'network_breadth' },
  { id: 'd_net_010', text: '같은 분야 사람들과만 어울리는 경향이 있다.', reverse: true, subscale: 'network_breadth' },

  // === senior_readiness (시니어 준비도) ===
  { id: 'd_net_011', text: '이사회, 자문위원회 등 거버넌스 역할에 대한 이해가 있다.', subscale: 'senior_readiness' },
  { id: 'd_net_012', text: '재무제표를 읽고 사업의 건전성을 판단할 수 있다.', subscale: 'senior_readiness' },
  { id: 'd_net_013', text: '조직 전체의 전략적 방향을 설계하고 실행한 경험이 있다.', subscale: 'senior_readiness' },
  { id: 'd_net_014', text: '위기 상황에서 조직의 최종 의사결정자 역할을 수행한 적이 있다.', subscale: 'senior_readiness' },
  { id: 'd_net_015', text: '은퇴 이후 또는 시니어 단계에서의 커리어 비전이 명확하다.', subscale: 'senior_readiness' },
];

// ── 모듈 메타 정보 ──────────────────────────────────────────────

export const hitDModules = [
  { key: 'expertise', label: '전문성 깊이 & 도메인', icon: '🔬', questions: expertiseQuestions, count: 20, time: 4 },
  { key: 'leadership', label: '리더십 스타일', icon: '👑', questions: leadershipQuestions, count: 20, time: 4 },
  { key: 'identity', label: '정체성 유연성', icon: '🔄', questions: identityQuestions, count: 15, time: 3 },
  { key: 'network', label: '네트워크 & 시니어 준비도', icon: '🌐', questions: networkQuestions, count: 15, time: 3 },
] as const;

export const allDQuestions: LikertQuestion[] = [
  ...expertiseQuestions,
  ...leadershipQuestions,
  ...identityQuestions,
  ...networkQuestions,
];
