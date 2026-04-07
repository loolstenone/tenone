import type { LikertQuestion } from './personality-questions';

/**
 * HIT D — 고년차 이직자 검사 (10년+)
 * 원본 140문항 · 7점 리커트
 * 모듈1: 전문성 자산 (40문항) — domain_depth, tacit_knowledge, redeployment, personal_brand
 * 모듈2: 리더십 유형 (32문항) — exec_leadership, strategic_leadership, coaching_leadership, independent_leadership
 * 모듈3: 경력 정체성 유연성 (28문항) — identity_strength, new_role, identity_recon
 * 모듈4: 네트워크 자본 (20문항) — strong_ties, weak_ties
 * 모듈5: 고년차 이직 준비도 (20문항) — positioning, compensation, reference, senior_psych
 */

// ── 모듈1: 전문성 자산 (40문항) ──
export const expertiseQuestions: LikertQuestion[] = [
  // domain_depth (10문항)
  { id: 'hit_d_001', text: '내 분야에서 10년 이상 쌓아온 독자적 관점이나 철학이 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_002', text: '후배나 팀원에게 체계적으로 지식을 전수할 수 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_003', text: '내 전문 분야에서 업계가 인정하는 수준의 전문성이 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_004', text: '경험으로 체득한 암묵지(暗默知)가 나의 핵심 자산이다.', subscale: 'domain_depth' },
  { id: 'hit_d_005', text: '해당 분야의 역사와 변천을 설명할 수 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_006', text: '내 전문성이 최신 기술/트렌드 변화에도 유효하다고 판단한다.', subscale: 'domain_depth' },
  { id: 'hit_d_007', text: '복잡한 문제 상황에서 경험에 기반한 직관적 판단이 정확한 편이다.', subscale: 'domain_depth' },
  { id: 'hit_d_008', text: '내 분야에서 강의, 멘토링, 기고 등을 해본 경험이 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_009', text: '타 분야 전문가와 협업할 때 내 전문성의 가치를 명확히 전달할 수 있다.', subscale: 'domain_depth' },
  { id: 'hit_d_010', text: '내 분야가 AI나 자동화로 대체될 가능성을 현실적으로 평가해보았다.', subscale: 'domain_depth' },

  // tacit_knowledge (10문항)
  { id: 'hit_d_011', text: '매뉴얼에 없지만 내가 아는 업무 노하우가 많다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_012', text: '위기 상황에서 경험 기반의 판단이 매뉴얼보다 효과적이었던 적이 있다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_013', text: '내 경험을 콘텐츠(글, 강의, 코칭)로 전환할 수 있다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_014', text: '후임자가 나의 역할을 완전히 대체하기 어려울 것이다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_015', text: '내가 쌓은 노하우를 시스템이나 프로세스로 문서화할 수 있다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_016', text: '고객, 파트너와의 관계에서 나만 아는 맥락이 중요한 역할을 한다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_017', text: '비슷한 직급의 다른 사람과 비교했을 때 내 경험의 폭이 넓다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_018', text: '내 전문성을 기반으로 컨설팅이나 자문 역할을 할 수 있다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_019', text: '실무 감각을 유지하면서도 전략적 시야를 갖추고 있다.', subscale: 'tacit_knowledge' },
  { id: 'hit_d_020', text: '내 경험이 조직을 떠나면 대부분 사라질 것이라 느낀다.', subscale: 'tacit_knowledge', reverse: true },

  // redeployment (10문항)
  { id: 'hit_d_021', text: '현재 전문성을 다른 산업에 적용할 수 있는 방법을 생각해본 적이 있다.', subscale: 'redeployment' },
  { id: 'hit_d_022', text: '전문성의 핵심 원리는 산업이 바뀌어도 유효하다.', subscale: 'redeployment' },
  { id: 'hit_d_023', text: '내 경험이 스타트업/중소기업에서 특히 가치 있을 수 있다.', subscale: 'redeployment' },
  { id: 'hit_d_024', text: '교육·컨설팅·코칭 분야로의 전환을 구체적으로 고려해본 적이 있다.', subscale: 'redeployment' },
  { id: 'hit_d_025', text: '내 전문성으로 독립(프리랜서, 1인 기업)할 수 있다고 생각한다.', subscale: 'redeployment' },
  { id: 'hit_d_026', text: '다른 기능(마케팅→경영기획, 개발→CTO 등)으로 역할 전환이 가능하다.', subscale: 'redeployment' },
  { id: 'hit_d_027', text: '해외에서도 내 전문성이 통할 수 있다.', subscale: 'redeployment' },
  { id: 'hit_d_028', text: '현재 전문 분야와 인접한 새로운 영역에 관심이 있다.', subscale: 'redeployment' },
  { id: 'hit_d_029', text: '10년 후에도 유효한 전문성을 갖추기 위해 지금 준비할 것이 있다.', subscale: 'redeployment' },
  { id: 'hit_d_030', text: '내 전문성을 디지털 환경에 맞게 업데이트할 필요를 느낀다.', subscale: 'redeployment' },

  // personal_brand (10문항)
  { id: 'hit_d_031', text: '업계에서 나를 떠올리면 연상되는 전문 이미지가 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_032', text: '나의 전문성을 한 문장으로 설명할 수 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_033', text: '소셜미디어나 업계 채널에서 전문적 콘텐츠를 공유한다.', subscale: 'personal_brand' },
  { id: 'hit_d_034', text: '외부 강연, 기고, 인터뷰 등의 경험이 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_035', text: '나의 경력 스토리를 설득력 있게 전달할 수 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_036', text: '채용 시장에서 내 이름이 알려져 있다고 생각한다.', subscale: 'personal_brand' },
  { id: 'hit_d_037', text: '내가 만든 결과물이나 프로젝트가 업계에서 레퍼런스가 된 적이 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_038', text: '이직 시 브랜드 프리미엄이 있을 것이라 생각한다.', subscale: 'personal_brand' },
  { id: 'hit_d_039', text: '전문가 커뮤니티에서 인정받고 있다.', subscale: 'personal_brand' },
  { id: 'hit_d_040', text: '내 전문성에 대한 외부 평판과 자기 인식 사이에 괴리가 있다.', subscale: 'personal_brand', reverse: true },
];

// ── 모듈2: 리더십 유형 (32문항) ──
export const leadershipQuestions: LikertQuestion[] = [
  // exec_leadership (8문항)
  { id: 'hit_d_041', text: '목표를 설정하면 실행 계획을 구체적으로 수립하는 편이다.', subscale: 'exec_leadership' },
  { id: 'hit_d_042', text: '팀의 진행 상황을 체계적으로 추적하고 관리한다.', subscale: 'exec_leadership' },
  { id: 'hit_d_043', text: '결과가 나올 때까지 끝까지 밀어붙이는 추진력이 있다.', subscale: 'exec_leadership' },
  { id: 'hit_d_044', text: '업무 프로세스를 개선하여 효율을 높인 경험이 있다.', subscale: 'exec_leadership' },
  { id: 'hit_d_045', text: '위기 상황에서 빠르게 의사결정을 내릴 수 있다.', subscale: 'exec_leadership' },
  { id: 'hit_d_046', text: '팀원에게 명확한 기대치와 마감을 설정한다.', subscale: 'exec_leadership' },
  { id: 'hit_d_047', text: '성과 미달 시 원인을 분석하고 대안을 실행한다.', subscale: 'exec_leadership' },
  { id: 'hit_d_048', text: '리소스가 부족한 상황에서도 결과를 만들어낸 경험이 있다.', subscale: 'exec_leadership' },

  // strategic_leadership (8문항)
  { id: 'hit_d_049', text: '조직의 중장기 방향을 설정하는 데 기여한 경험이 있다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_050', text: '현재의 문제보다 3~5년 후의 변화를 먼저 생각하는 편이다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_051', text: '복잡한 상황을 큰 그림으로 정리하여 팀에 전달할 수 있다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_052', text: '데이터와 직관을 결합하여 전략적 판단을 내린다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_053', text: '사업 기회를 발굴하고 새로운 방향을 제시한 경험이 있다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_054', text: '조직 외부 환경(시장, 경쟁, 기술)의 변화를 예측하려 한다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_055', text: '전략과 실행 사이의 간극을 좁히는 역할을 해왔다.', subscale: 'strategic_leadership' },
  { id: 'hit_d_056', text: '경영진에게 전략적 제안을 한 경험이 있다.', subscale: 'strategic_leadership' },

  // coaching_leadership (8문항)
  { id: 'hit_d_057', text: '팀원의 성장을 위해 시간과 에너지를 투자한다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_058', text: '비판보다 질문을 통해 스스로 답을 찾게 유도한다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_059', text: '팀원의 강점을 파악하고 적절한 역할을 배치한다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_060', text: '실패한 팀원에게 비난보다 학습 기회를 제공한다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_061', text: '내가 키운 사람이 성장하는 것이 가장 큰 보람이다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_062', text: '1:1 면담을 정기적으로 실시한다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_063', text: '팀원의 커리어 방향에 대해 조언한 경험이 있다.', subscale: 'coaching_leadership' },
  { id: 'hit_d_064', text: '다양한 세대(MZ세대 등)와 효과적으로 소통한다.', subscale: 'coaching_leadership' },

  // independent_leadership (8문항)
  { id: 'hit_d_065', text: '팀을 이끄는 것보다 전문가로서 독립적으로 일하는 것이 편하다.', subscale: 'independent_leadership' },
  { id: 'hit_d_066', text: '관리 업무보다 직접 문제를 해결하는 것이 더 즐겁다.', subscale: 'independent_leadership' },
  { id: 'hit_d_067', text: '조직 정치보다 전문적 깊이에 에너지를 쓰고 싶다.', subscale: 'independent_leadership' },
  { id: 'hit_d_068', text: '소규모 팀이나 독자적 프로젝트에서 최고의 성과를 낸다.', subscale: 'independent_leadership' },
  { id: 'hit_d_069', text: '매니저 타이틀보다 전문가 타이틀에 더 끌린다.', subscale: 'independent_leadership' },
  { id: 'hit_d_070', text: '회의와 보고보다 몰입 작업 시간이 더 가치 있다.', subscale: 'independent_leadership' },
  { id: 'hit_d_071', text: '프리랜서/계약직 형태도 만족스러울 수 있다.', subscale: 'independent_leadership' },
  { id: 'hit_d_072', text: '조직 내 역할보다 프로젝트 기반 역할이 나에게 맞다.', subscale: 'independent_leadership' },
];

// ── 모듈3: 경력 정체성 유연성 (28문항) ──
export const identityQuestions: LikertQuestion[] = [
  // identity_strength (10문항)
  { id: 'hit_d_073', text: '"나는 OO 전문가다"라는 정체성이 매우 강하다.', subscale: 'identity_strength' },
  { id: 'hit_d_074', text: '현재 직함이 나를 설명하는 가장 중요한 요소다.', subscale: 'identity_strength' },
  { id: 'hit_d_075', text: '내 직업을 빼면 나를 설명하기 어렵다.', subscale: 'identity_strength', reverse: true },
  { id: 'hit_d_076', text: '직무가 바뀌면 정체성의 혼란을 겪을 것 같다.', subscale: 'identity_strength', reverse: true },
  { id: 'hit_d_077', text: '주변 사람들도 나를 현재 직무와 강하게 연결 짓는다.', subscale: 'identity_strength' },
  { id: 'hit_d_078', text: '내 분야를 떠나는 것은 나를 포기하는 것 같은 느낌이 든다.', subscale: 'identity_strength', reverse: true },
  { id: 'hit_d_079', text: '10년간 쌓아온 경력을 보존하는 것이 중요하다.', subscale: 'identity_strength' },
  { id: 'hit_d_080', text: '현재 직무에서의 성취가 자존감의 큰 부분을 차지한다.', subscale: 'identity_strength' },
  { id: 'hit_d_081', text: '동종 업계 사람들과의 소속감이 강하다.', subscale: 'identity_strength' },
  { id: 'hit_d_082', text: '새로운 명함을 받으면 적응하는 데 오래 걸릴 것 같다.', subscale: 'identity_strength', reverse: true },

  // new_role (10문항)
  { id: 'hit_d_083', text: '완전히 다른 역할을 맡아도 흥미롭게 해낼 수 있다.', subscale: 'new_role' },
  { id: 'hit_d_084', text: '타이틀이 아닌 역할의 내용이 더 중요하다.', subscale: 'new_role' },
  { id: 'hit_d_085', text: '후배에게 보고하는 상황도 수용할 수 있다.', subscale: 'new_role' },
  { id: 'hit_d_086', text: '기존 경력과 무관한 일도 배울 의지가 있다.', subscale: 'new_role' },
  { id: 'hit_d_087', text: '"내 나이에 이런 일을?"이라는 생각이 드는 편이다.', subscale: 'new_role', reverse: true },
  { id: 'hit_d_088', text: '경력 전환자의 롤모델이 있다.', subscale: 'new_role' },
  { id: 'hit_d_089', text: '스타트업이나 소규모 조직에서의 멀티 플레이어 역할도 가능하다.', subscale: 'new_role' },
  { id: 'hit_d_090', text: '새로운 분야에서 초보가 되는 것을 두려워하지 않는다.', subscale: 'new_role' },
  { id: 'hit_d_091', text: '다양한 가능한 자아(Possible Selves)를 상상해본 적이 있다.', subscale: 'new_role' },
  { id: 'hit_d_092', text: '과거의 역할에 집착하기보다 미래의 역할에 열려 있다.', subscale: 'new_role' },

  // identity_recon (8문항)
  { id: 'hit_d_093', text: '내가 누구인지를 직업이 아닌 다른 기준으로 설명할 수 있다.', subscale: 'identity_recon' },
  { id: 'hit_d_094', text: '삶의 다음 챕터를 적극적으로 설계하고 싶다.', subscale: 'identity_recon' },
  { id: 'hit_d_095', text: '경력 전환을 손실이 아닌 진화로 본다.', subscale: 'identity_recon' },
  { id: 'hit_d_096', text: '나는 직업 외에도 다양한 역할(부모, 멘토, 학습자 등)로 정의된다.', subscale: 'identity_recon' },
  { id: 'hit_d_097', text: '새 역할에서 기존 경험이 독특한 강점이 될 수 있다.', subscale: 'identity_recon' },
  { id: 'hit_d_098', text: '현재의 나와 미래의 나 사이의 연결고리를 찾을 수 있다.', subscale: 'identity_recon' },
  { id: 'hit_d_099', text: '변화 속에서도 흔들리지 않는 나만의 핵심 가치가 있다.', subscale: 'identity_recon' },
  { id: 'hit_d_100', text: '경력 전환이 나를 더 풍요롭게 만들 수 있다고 믿는다.', subscale: 'identity_recon' },
];

// ── 모듈4: 네트워크 자본 (20문항) ──
export const networkQuestions: LikertQuestion[] = [
  // strong_ties (10문항)
  { id: 'hit_d_101', text: '진심으로 커리어 조언을 구할 수 있는 사람이 3명 이상 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_102', text: '업계 핵심 인사와 신뢰 관계를 유지하고 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_103', text: '이직 시 적극적으로 도와줄 사람이 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_104', text: '전 직장 동료들과도 관계를 유지하고 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_105', text: '업계 밖의 다른 분야 전문가 인맥이 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_106', text: '이직 경험이 있는 선배로부터 조언을 받을 수 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_107', text: '나를 위해 레퍼런스 체크에 응해줄 사람이 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_108', text: '기업 의사결정자(CEO, 임원급)와 직접 소통할 수 있는 관계가 있다.', subscale: 'strong_ties' },
  { id: 'hit_d_109', text: '내 네트워크가 내 경력 전환에 실질적 도움이 될 것이라 확신한다.', subscale: 'strong_ties' },
  { id: 'hit_d_110', text: '관계 유지를 위해 의식적으로 시간을 투자한다.', subscale: 'strong_ties' },

  // weak_ties (10문항)
  { id: 'hit_d_111', text: '업계 행사나 컨퍼런스에서 새로운 사람을 만나는 것을 즐긴다.', subscale: 'weak_ties' },
  { id: 'hit_d_112', text: '링크드인 등 전문 네트워크에서 활발하게 활동한다.', subscale: 'weak_ties' },
  { id: 'hit_d_113', text: '다른 산업의 사람들과도 자연스럽게 대화할 수 있다.', subscale: 'weak_ties' },
  { id: 'hit_d_114', text: '예상치 못한 곳에서 기회가 온 경험이 있다.', subscale: 'weak_ties' },
  { id: 'hit_d_115', text: '내 전문성을 외부에 알리는 활동(기고, SNS, 강연)을 한다.', subscale: 'weak_ties' },
  { id: 'hit_d_116', text: '헤드헌터와 관계를 유지하고 있다.', subscale: 'weak_ties' },
  { id: 'hit_d_117', text: '동문회, 직무 커뮤니티 등에 소속되어 있다.', subscale: 'weak_ties' },
  { id: 'hit_d_118', text: '나의 존재를 모르는 사람에게도 가치를 전달할 수 있는 채널이 있다.', subscale: 'weak_ties' },
  { id: 'hit_d_119', text: '우연한 만남에서도 기회를 포착하는 편이다.', subscale: 'weak_ties' },
  { id: 'hit_d_120', text: '넓은 네트워크보다 깊은 네트워크가 중요하다고 생각한다.', subscale: 'weak_ties' },
];

// ── 모듈5: 고년차 이직 준비도 (20문항) ──
export const seniorReadinessQuestions: LikertQuestion[] = [
  // positioning (5문항)
  { id: 'hit_d_121', text: '"왜 지금 이직하는가"에 대한 설득력 있는 답변이 있다.', subscale: 'positioning' },
  { id: 'hit_d_122', text: '내 경력 스토리를 3분 안에 매력적으로 전달할 수 있다.', subscale: 'positioning' },
  { id: 'hit_d_123', text: '목표 기업이 나를 뽑아야 하는 이유를 명확히 설명할 수 있다.', subscale: 'positioning' },
  { id: 'hit_d_124', text: '과거 이직(또는 조직 변화) 경험을 성장 스토리로 설명할 수 있다.', subscale: 'positioning' },
  { id: 'hit_d_125', text: '고년차로서의 강점(경험, 안정성, 네트워크)을 어필할 수 있다.', subscale: 'positioning' },

  // compensation (5문항)
  { id: 'hit_d_126', text: '내 시장 가치(연봉 수준)를 객관적으로 파악하고 있다.', subscale: 'compensation' },
  { id: 'hit_d_127', text: '연봉 외 조건(직급, 권한, 성과급, RSU 등)도 전략적으로 협상할 수 있다.', subscale: 'compensation' },
  { id: 'hit_d_128', text: '보상 수준이 현재보다 낮아지면 이직하지 않겠다.', subscale: 'compensation', reverse: true },
  { id: 'hit_d_129', text: '이직 시 기대 연봉의 합리적 근거를 제시할 수 있다.', subscale: 'compensation' },
  { id: 'hit_d_130', text: '단기 보상보다 중장기 경력 가치를 우선시할 수 있다.', subscale: 'compensation' },

  // reference (5문항)
  { id: 'hit_d_131', text: '레퍼런스 체크에 대비한 준비가 되어 있다.', subscale: 'reference' },
  { id: 'hit_d_132', text: '경쟁사 이직 시 비경쟁 조항 등 법적 이슈를 확인했다.', subscale: 'reference' },
  { id: 'hit_d_133', text: '이직 기간이 3개월 이상 걸려도 인내할 수 있다.', subscale: 'reference' },
  { id: 'hit_d_134', text: '현 직장에서의 퇴사 프로세스를 전략적으로 계획하고 있다.', subscale: 'reference' },
  { id: 'hit_d_135', text: '이직 과정에서 현 직장에 미칠 영향을 고려하고 있다.', subscale: 'reference' },

  // senior_psych (5문항)
  { id: 'hit_d_136', text: '10년 이상 쌓은 조직 내 위상을 포기하는 것이 두렵다.', subscale: 'senior_psych', reverse: true },
  { id: 'hit_d_137', text: '새 조직에서 다시 증명해야 한다는 것을 수용한다.', subscale: 'senior_psych' },
  { id: 'hit_d_138', text: '이직이 실패해도 다시 시도할 의지가 있다.', subscale: 'senior_psych' },
  { id: 'hit_d_139', text: '변화가 내 삶의 질을 향상시킬 것이라 기대한다.', subscale: 'senior_psych' },
  { id: 'hit_d_140', text: '이직은 새로운 성장의 시작이라고 확신한다.', subscale: 'senior_psych' },
];

// ── 모듈 메타 정보 ──
export const hitDModules = [
  { key: 'expertise', label: '전문성 자산', questions: expertiseQuestions, count: 40, time: 8 },
  { key: 'leadership', label: '리더십 유형', questions: leadershipQuestions, count: 32, time: 6 },
  { key: 'identity', label: '경력 정체성 유연성', questions: identityQuestions, count: 28, time: 5 },
  { key: 'network', label: '네트워크 자본', questions: networkQuestions, count: 20, time: 4 },
  { key: 'seniorReadiness', label: '고년차 이직 준비도', questions: seniorReadinessQuestions, count: 20, time: 4 },
] as const;

export const allHitDQuestions: LikertQuestion[] = [
  ...expertiseQuestions,
  ...leadershipQuestions,
  ...identityQuestions,
  ...networkQuestions,
  ...seniorReadinessQuestions,
];

// 기존 참조 호환성 유지
export const allDQuestions = allHitDQuestions;
