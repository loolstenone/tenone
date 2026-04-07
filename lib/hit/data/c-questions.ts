import type { LikertQuestion } from './personality-questions';

/**
 * HIT C — 경력직 이직자 검사 (3–10년차)
 * 원본 120문항 · 7점 리커트
 * 모듈1: 경력 자본 (40문항) — domain_expertise, achievement, relational, transferable
 * 모듈2: 이직 동기 (24문항) — push, pull
 * 모듈3: 전직 가능성 (36문항) — skill_transfer, market_fit, adaptation
 * 모듈4: 이직 준비도 (20문항) — doc_readiness, interview_readiness, timing, psych_readiness
 */

// ── 모듈1: 경력 자본 (40문항) ──
export const careerCapitalQuestions: LikertQuestion[] = [
  // domain_expertise (10문항)
  { id: 'hit_c_001', text: '현재 직무에서 동료들이 나에게 자문을 구하는 영역이 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_002', text: '내 전문 분야에서 최신 트렌드를 꾸준히 파악하고 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_003', text: '업무에서 남들이 쉽게 따라하기 어려운 나만의 노하우가 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_004', text: '내 직무 분야에서 3년 전보다 확실히 성장했다고 느낀다.', subscale: 'domain_expertise' },
  { id: 'hit_c_005', text: '현재 역할에서 더 배울 것이 없다고 느낄 때가 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_006', text: '내 전문성이 현재 회사 밖에서도 통할 것이라고 자신한다.', subscale: 'domain_expertise' },
  { id: 'hit_c_007', text: '업무 관련 자격증, 교육, 인증을 지속적으로 취득하고 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_008', text: '내 업무 경험을 체계적으로 정리(포트폴리오, 이력서 등)할 수 있다.', subscale: 'domain_expertise' },
  { id: 'hit_c_009', text: '같은 직무의 타사 담당자와 비교했을 때 경쟁력이 있다고 생각한다.', subscale: 'domain_expertise' },
  { id: 'hit_c_010', text: '내 전문 분야가 향후 5년간 시장에서 수요가 있을 것이라 본다.', subscale: 'domain_expertise' },

  // achievement (10문항)
  { id: 'hit_c_011', text: '재직 중 명확한 수치로 증명할 수 있는 성과가 있다.', subscale: 'achievement' },
  { id: 'hit_c_012', text: '내가 주도한 프로젝트가 조직에 실질적 변화를 가져온 경험이 있다.', subscale: 'achievement' },
  { id: 'hit_c_013', text: '상사나 동료로부터 업무 성과에 대해 긍정적 피드백을 자주 받는다.', subscale: 'achievement' },
  { id: 'hit_c_014', text: '기대 이상의 결과를 낸 경험이 이직 시 강력한 어필 포인트가 될 수 있다.', subscale: 'achievement' },
  { id: 'hit_c_015', text: '내 성과를 객관적으로 설명하는 것이 어렵다.', subscale: 'achievement', reverse: true },
  { id: 'hit_c_016', text: '실패한 프로젝트에서도 배운 점을 명확하게 말할 수 있다.', subscale: 'achievement' },
  { id: 'hit_c_017', text: '업무에서 새로운 방법을 제안하고 실행해본 적이 있다.', subscale: 'achievement' },
  { id: 'hit_c_018', text: '조직 내에서 승진이나 보상으로 성과를 인정받은 경험이 있다.', subscale: 'achievement' },
  { id: 'hit_c_019', text: '나의 성과가 팀 전체의 성과에 기여한 정도를 설명할 수 있다.', subscale: 'achievement' },
  { id: 'hit_c_020', text: '현재 직무에서의 성과가 다른 산업에서도 의미 있을 것이라 생각한다.', subscale: 'achievement' },

  // relational (10문항)
  { id: 'hit_c_021', text: '직장 밖에서도 유지되는 업무 관련 인맥이 있다.', subscale: 'relational' },
  { id: 'hit_c_022', text: '필요할 때 조언을 구할 수 있는 업계 선배나 멘토가 있다.', subscale: 'relational' },
  { id: 'hit_c_023', text: '이직 시 나를 추천해줄 수 있는 사람이 2명 이상 있다.', subscale: 'relational' },
  { id: 'hit_c_024', text: '타 부서/타사 사람들과의 협업 경험이 풍부하다.', subscale: 'relational' },
  { id: 'hit_c_025', text: '업무 네트워크를 의식적으로 관리하는 편이다.', subscale: 'relational' },
  { id: 'hit_c_026', text: '같은 업계 종사자들과 정기적으로 교류한다.', subscale: 'relational' },
  { id: 'hit_c_027', text: '새로운 사람과 업무적 관계를 맺는 것에 거부감이 없다.', subscale: 'relational' },
  { id: 'hit_c_028', text: '현재 직장의 인맥이 이직 후에도 도움이 될 것이라 생각한다.', subscale: 'relational' },
  { id: 'hit_c_029', text: '업계 커뮤니티, 세미나, 컨퍼런스 등에 참여한 경험이 있다.', subscale: 'relational' },
  { id: 'hit_c_030', text: '내 평판이 업계에서 긍정적이라고 생각한다.', subscale: 'relational' },

  // transferable (10문항)
  { id: 'hit_c_031', text: '업무 외 영역(기획, 프레젠테이션, 데이터 분석 등)에서도 강점이 있다.', subscale: 'transferable' },
  { id: 'hit_c_032', text: '다양한 부서의 사람들과 효과적으로 소통할 수 있다.', subscale: 'transferable' },
  { id: 'hit_c_033', text: '새로운 도구나 시스템을 배우는 데 거부감이 없다.', subscale: 'transferable' },
  { id: 'hit_c_034', text: '영어 또는 다른 외국어로 업무를 수행할 수 있다.', subscale: 'transferable' },
  { id: 'hit_c_035', text: '복잡한 문제를 구조화하여 해결하는 능력이 있다.', subscale: 'transferable' },
  { id: 'hit_c_036', text: '직무가 바뀌어도 활용할 수 있는 핵심 역량이 무엇인지 안다.', subscale: 'transferable' },
  { id: 'hit_c_037', text: '프로젝트 관리(일정, 자원, 리스크)를 독립적으로 할 수 있다.', subscale: 'transferable' },
  { id: 'hit_c_038', text: '데이터를 기반으로 의사결정하는 습관이 있다.', subscale: 'transferable' },
  { id: 'hit_c_039', text: '글이든 말이든, 내 생각을 논리적으로 전달하는 데 자신이 있다.', subscale: 'transferable' },
  { id: 'hit_c_040', text: '현재 직무와 다른 분야에서도 일할 수 있다는 자신감이 있다.', subscale: 'transferable' },
];

// ── 모듈2: 이직 동기 (24문항) ──
export const motivationQuestions: LikertQuestion[] = [
  // push (12문항)
  { id: 'hit_c_041', text: '현재 직장에서 성장의 한계를 느낀다.', subscale: 'push' },
  { id: 'hit_c_042', text: '내 역할과 능력 사이에 괴리가 있다고 느낀다.', subscale: 'push' },
  { id: 'hit_c_043', text: '현재 받는 보상(급여, 복지)이 내 기여도에 비해 부족하다고 느낀다.', subscale: 'push' },
  { id: 'hit_c_044', text: '직속 상사와의 관계에서 스트레스를 받는다.', subscale: 'push' },
  { id: 'hit_c_045', text: '조직 문화가 나와 맞지 않는다고 느낀다.', subscale: 'push' },
  { id: 'hit_c_046', text: '현재 직무가 내 가치관과 점점 멀어지고 있다.', subscale: 'push' },
  { id: 'hit_c_047', text: '워라밸(일과 삶의 균형)이 지속적으로 무너지고 있다.', subscale: 'push' },
  { id: 'hit_c_048', text: '회사의 미래 전망이 불안하다.', subscale: 'push' },
  { id: 'hit_c_049', text: '같은 업무의 반복으로 동기가 떨어졌다.', subscale: 'push' },
  { id: 'hit_c_050', text: '내 의견이 조직에서 반영되지 않는다고 느낀다.', subscale: 'push' },
  { id: 'hit_c_051', text: '현재 역할에서 의미와 보람을 찾기 어렵다.', subscale: 'push' },
  { id: 'hit_c_052', text: '건강이나 체력적으로 현재 업무를 지속하기 어렵다고 느낀다.', subscale: 'push' },

  // pull (12문항)
  { id: 'hit_c_053', text: '새로운 도전을 통해 더 성장하고 싶다.', subscale: 'pull' },
  { id: 'hit_c_054', text: '특정 산업이나 분야로 전환하고 싶은 명확한 목표가 있다.', subscale: 'pull' },
  { id: 'hit_c_055', text: '더 높은 보상(급여, 스톡옵션 등)을 기대하고 있다.', subscale: 'pull' },
  { id: 'hit_c_056', text: '내 가치관과 맞는 조직에서 일하고 싶다.', subscale: 'pull' },
  { id: 'hit_c_057', text: '더 큰 규모(또는 더 민첩한 조직)에서 일해보고 싶다.', subscale: 'pull' },
  { id: 'hit_c_058', text: '리더/매니저 역할로 성장하고 싶다.', subscale: 'pull' },
  { id: 'hit_c_059', text: '해외 또는 글로벌 환경에서 일해보고 싶다.', subscale: 'pull' },
  { id: 'hit_c_060', text: '내 전문성을 더 깊이 발휘할 수 있는 환경을 원한다.', subscale: 'pull' },
  { id: 'hit_c_061', text: '사회적으로 의미 있는 일을 하고 싶다.', subscale: 'pull' },
  { id: 'hit_c_062', text: '유연한 근무 환경(재택, 자율 출퇴근 등)을 원한다.', subscale: 'pull' },
  { id: 'hit_c_063', text: '함께 일하고 싶은 사람들이 있는 곳으로 가고 싶다.', subscale: 'pull' },
  { id: 'hit_c_064', text: '창업이나 독립을 위한 경험을 쌓고 싶다.', subscale: 'pull' },
];

// ── 모듈3: 전직 가능성 (36문항) ──
export const transferabilityQuestions: LikertQuestion[] = [
  // skill_transfer (12문항)
  { id: 'hit_c_065', text: '현재 직무에서 쌓은 핵심 역량이 목표 직무에서도 필요하다.', subscale: 'skill_transfer' },
  { id: 'hit_c_066', text: '목표 직무의 핵심 업무 내용을 구체적으로 이해하고 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_067', text: '현재 역량과 목표 직무 사이의 갭이 무엇인지 파악하고 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_068', text: '그 갭을 메우기 위해 구체적인 학습 계획이 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_069', text: '과거에 직무나 역할이 바뀌었을 때 빠르게 적응한 경험이 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_070', text: '목표 직무에서 요구하는 도구나 기술을 이미 일부 보유하고 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_071', text: '목표 산업의 비즈니스 구조와 트렌드를 이해하고 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_072', text: '현재 직무 경험이 목표 직무에서 차별화 요소가 될 수 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_073', text: '목표 직무를 수행하는 사람과 대화하거나 정보를 수집한 적이 있다.', subscale: 'skill_transfer' },
  { id: 'hit_c_074', text: '경력 전환에 필요한 자격증이나 교육을 확인해보았다.', subscale: 'skill_transfer' },
  { id: 'hit_c_075', text: '전혀 다른 분야로의 전환도 고려 중이다.', subscale: 'skill_transfer' },
  { id: 'hit_c_076', text: '역량 갭을 메우는 데 필요한 시간과 비용을 현실적으로 예측할 수 있다.', subscale: 'skill_transfer' },

  // market_fit (12문항)
  { id: 'hit_c_077', text: '목표 직무의 채용 시장이 활발하다고 판단한다.', subscale: 'market_fit' },
  { id: 'hit_c_078', text: '내 경력 수준(연차, 직급)에 맞는 포지션이 시장에 존재한다.', subscale: 'market_fit' },
  { id: 'hit_c_079', text: '목표 직무의 평균 보상 수준을 조사해보았다.', subscale: 'market_fit' },
  { id: 'hit_c_080', text: '나의 경력 경로가 목표 기업에서 매력적으로 보일 것이라 생각한다.', subscale: 'market_fit' },
  { id: 'hit_c_081', text: '목표 직무에서 내 나이/경력이 유리하게 작용할 수 있다.', subscale: 'market_fit' },
  { id: 'hit_c_082', text: '현재 산업에서 목표 산업으로 이동한 사례를 알고 있다.', subscale: 'market_fit' },
  { id: 'hit_c_083', text: '채용 공고를 분석하여 요구 역량을 파악해본 적이 있다.', subscale: 'market_fit' },
  { id: 'hit_c_084', text: '내가 목표하는 포지션의 경쟁 강도를 현실적으로 인식하고 있다.', subscale: 'market_fit' },
  { id: 'hit_c_085', text: '이직 시 보상(급여) 수준을 유지하거나 높일 수 있다고 생각한다.', subscale: 'market_fit' },
  { id: 'hit_c_086', text: '헤드헌터나 채용 담당자로부터 연락을 받은 경험이 있다.', subscale: 'market_fit' },
  { id: 'hit_c_087', text: '링크드인이나 직무 커뮤니티에서 내 프로필이 활성화되어 있다.', subscale: 'market_fit' },
  { id: 'hit_c_088', text: '목표 기업 리스트가 구체적으로 있다.', subscale: 'market_fit' },

  // adaptation (12문항)
  { id: 'hit_c_089', text: '새로운 조직 문화에 적응하는 것에 자신이 있다.', subscale: 'adaptation' },
  { id: 'hit_c_090', text: '낯선 업무 방식도 빠르게 익힐 수 있다.', subscale: 'adaptation' },
  { id: 'hit_c_091', text: '직급이 낮아지더라도 원하는 직무라면 수용할 수 있다.', subscale: 'adaptation' },
  { id: 'hit_c_092', text: '보상이 일시적으로 줄어도 장기적 성장 가능성을 선택할 수 있다.', subscale: 'adaptation' },
  { id: 'hit_c_093', text: '현재 직무의 익숙함을 포기하는 것이 두렵다.', subscale: 'adaptation', reverse: true },
  { id: 'hit_c_094', text: '이직 후 초기 적응 기간의 스트레스를 감당할 자신이 있다.', subscale: 'adaptation' },
  { id: 'hit_c_095', text: '새로운 상사의 스타일에 맞추는 것에 유연하다.', subscale: 'adaptation' },
  { id: 'hit_c_096', text: '기존 방식과 다른 업무 프로세스도 받아들일 수 있다.', subscale: 'adaptation' },
  { id: 'hit_c_097', text: '이직으로 인한 인간관계 변화를 감수할 준비가 되어 있다.', subscale: 'adaptation' },
  { id: 'hit_c_098', text: '새로운 환경에서 처음부터 신뢰를 쌓아가는 과정을 즐길 수 있다.', subscale: 'adaptation' },
  { id: 'hit_c_099', text: '이직 후 기대와 현실의 차이가 있을 수 있음을 인정한다.', subscale: 'adaptation' },
  { id: 'hit_c_100', text: '변화 자체가 나에게 에너지를 주는 편이다.', subscale: 'adaptation' },
];

// ── 모듈4: 이직 준비도 (20문항) ──
export const readinessQuestions: LikertQuestion[] = [
  // doc_readiness (5문항)
  { id: 'hit_c_101', text: '최신 이력서가 준비되어 있다.', subscale: 'doc_readiness' },
  { id: 'hit_c_102', text: '이직 사유를 긍정적이고 설득력 있게 설명할 수 있다.', subscale: 'doc_readiness' },
  { id: 'hit_c_103', text: '포트폴리오나 성과 자료를 체계적으로 정리해두었다.', subscale: 'doc_readiness' },
  { id: 'hit_c_104', text: '자기소개서를 목표 기업에 맞게 커스터마이즈할 수 있다.', subscale: 'doc_readiness' },
  { id: 'hit_c_105', text: '링크드인/직무 플랫폼 프로필이 최신 상태다.', subscale: 'doc_readiness' },

  // interview_readiness (5문항)
  { id: 'hit_c_106', text: '경력 기반 면접(경험 면접, STAR 기법)에 대비하고 있다.', subscale: 'interview_readiness' },
  { id: 'hit_c_107', text: '"왜 이직하려 하는가"에 대한 명확한 답변이 준비되어 있다.', subscale: 'interview_readiness' },
  { id: 'hit_c_108', text: '연봉 협상 전략이 있다.', subscale: 'interview_readiness' },
  { id: 'hit_c_109', text: '모의 면접이나 피드백을 받아본 경험이 있다.', subscale: 'interview_readiness' },
  { id: 'hit_c_110', text: '면접에서 나의 강점을 구체적 사례와 함께 설명할 수 있다.', subscale: 'interview_readiness' },

  // timing (5문항)
  { id: 'hit_c_111', text: '이직 시점을 전략적으로 고려하고 있다(성과 마무리, 성수기 등).', subscale: 'timing' },
  { id: 'hit_c_112', text: '이직 활동에 투자할 시간을 확보하고 있다.', subscale: 'timing' },
  { id: 'hit_c_113', text: '현 직장에서의 퇴사 절차(인수인계 등)를 계획하고 있다.', subscale: 'timing' },
  { id: 'hit_c_114', text: '이직이 지연될 경우를 대비한 플랜 B가 있다.', subscale: 'timing' },
  { id: 'hit_c_115', text: '이직 기간 동안의 생활비를 감당할 재정적 여유가 있다.', subscale: 'timing' },

  // psych_readiness (5문항)
  { id: 'hit_c_116', text: '이직 결심이 일시적 감정이 아닌 충분한 고민의 결과다.', subscale: 'psych_readiness' },
  { id: 'hit_c_117', text: '가족이나 가까운 사람이 이직 계획을 지지한다.', subscale: 'psych_readiness' },
  { id: 'hit_c_118', text: '이직 과정에서 거절당해도 계속 도전할 의지가 있다.', subscale: 'psych_readiness' },
  { id: 'hit_c_119', text: '이직 후 후회할 가능성에 대해 충분히 생각해보았다.', subscale: 'psych_readiness' },
  { id: 'hit_c_120', text: '지금이 이직할 적절한 시점이라고 확신한다.', subscale: 'psych_readiness' },
];

// ── 모듈 메타 정보 ──
export const hitCModules = [
  { key: 'careerCapital', label: '경력 자본', questions: careerCapitalQuestions, count: 40, time: 8 },
  { key: 'motivation', label: '이직 동기', questions: motivationQuestions, count: 24, time: 5 },
  { key: 'transferability', label: '전직 가능성', questions: transferabilityQuestions, count: 36, time: 7 },
  { key: 'readiness', label: '이직 준비도', questions: readinessQuestions, count: 20, time: 4 },
] as const;

export const allHitCQuestions: LikertQuestion[] = [
  ...careerCapitalQuestions,
  ...motivationQuestions,
  ...transferabilityQuestions,
  ...readinessQuestions,
];

// 기존 참조 호환성 유지
export const allCQuestions = allHitCQuestions;
