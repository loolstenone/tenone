import type { LikertQuestion } from './personality-questions';

/**
 * HIT E — 인생 2막 검사 (은퇴·퇴직 전후)
 * 원본 140문항 · 7점 리커트
 *
 * 모듈1: 인생 만족도 & 잔여 열정 (32문항)
 *   - life_satisfaction (인생 만족도) — 12문항
 *   - residual_passion (잔여 열정) — 12문항
 *   - psych_transition (심리적 전환) — 8문항
 *
 * 모듈2: 2막 방향 탐색 (28문항)
 *   - re_employment (재취업) — 6문항
 *   - entrepreneurship (창업/사업) — 6문항
 *   - social_contribution (사회 공헌) — 5문항
 *   - mentoring (멘토링/교육) — 6문항
 *   - leisure (여가/취미) — 5문항
 *
 * 모듈3: 역량 재활용 진단 (32문항)
 *   - transferable_legacy (이전 가능 역량) — 10문항
 *   - knowledge_transfer (지식 전수) — 10문항
 *   - new_capability (신규 역량 개발) — 12문항
 *
 * 모듈4: 사회적 연결 필요도 (20문항)
 *   - belonging (소속감) — 10문항
 *   - role_necessity (역할 필요도) — 10문항
 *
 * 모듈5: 인생 2막 준비도 (28문항)
 *   - time_readiness (시간 준비도) — 7문항
 *   - energy_readiness (에너지 준비도) — 7문항
 *   - financial_readiness (재정 준비도) — 7문항
 *   - relationship_readiness (관계 준비도) — 7문항
 */

// ── 모듈1: 인생 만족도 & 잔여 열정 (32문항) ────────────────────────

// === life_satisfaction (인생 만족도) — 12문항 ===
export const lifeReviewQuestions: LikertQuestion[] = [
  { id: 'hit_e_001', text: '지금까지의 삶을 전체적으로 돌아보면 만족스럽다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_002', text: '직업 생활에서 의미 있는 성취를 이루었다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_003', text: '인간관계에서 깊은 유대를 경험했다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_004', text: '내가 선택한 길이 대체로 옳았다고 생각한다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_005', text: '과거의 실패와 실수를 수용하고 있다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_006', text: '나는 가치 있는 삶을 살아왔다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_007', text: '후회되는 선택이 있지만 그것도 나를 만든 일부다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_008', text: '가정생활과 직업생활의 균형에 만족한다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_009', text: '내 삶이 다른 사람에게 긍정적 영향을 주었다고 생각한다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_010', text: '지금 시점에서 인생을 다시 산다면 비슷한 선택을 할 것이다.', subscale: 'life_satisfaction' },
  { id: 'hit_e_011', text: '아직 하지 못한 것에 대한 미련이 크다.', subscale: 'life_satisfaction', reverse: true },
  { id: 'hit_e_012', text: '내 인생의 전반전 점수를 매긴다면 합격점이다.', subscale: 'life_satisfaction' },

  // === residual_passion (잔여 열정) — 12문항 ===
  { id: 'hit_e_013', text: '아직 이루고 싶은 것이 분명하게 있다.', subscale: 'residual_passion' },
  { id: 'hit_e_014', text: '새로운 것을 배우고 싶은 욕구가 강하다.', subscale: 'residual_passion' },
  { id: 'hit_e_015', text: '은퇴 후에도 일(넓은 의미에서)을 하고 싶다.', subscale: 'residual_passion' },
  { id: 'hit_e_016', text: '특정 분야에 대한 열정이 나이와 무관하게 살아있다.', subscale: 'residual_passion' },
  { id: 'hit_e_017', text: '아침에 일어나면 하고 싶은 일이 있다.', subscale: 'residual_passion' },
  { id: 'hit_e_018', text: '체력이 허락한다면 도전하고 싶은 일이 있다.', subscale: 'residual_passion' },
  { id: 'hit_e_019', text: '취미나 관심사에 몰입하면 시간 가는 줄 모른다.', subscale: 'residual_passion' },
  { id: 'hit_e_020', text: '사회에 기여하고 싶은 구체적인 방법이 있다.', subscale: 'residual_passion' },
  { id: 'hit_e_021', text: '젊었을 때 못했던 일을 지금이라도 하고 싶다.', subscale: 'residual_passion' },
  { id: 'hit_e_022', text: '일하지 않으면 무기력해질 것 같다.', subscale: 'residual_passion' },
  { id: 'hit_e_023', text: '돈과 무관하게 하고 싶은 활동이 있다.', subscale: 'residual_passion' },
  { id: 'hit_e_024', text: '내 열정의 방향이 직업 생활과는 다를 수 있다.', subscale: 'residual_passion' },

  // === psych_transition (심리적 전환) — 8문항 ===
  { id: 'hit_e_025', text: '직함이 없어져도 나의 가치는 변하지 않는다고 느낀다.', subscale: 'psych_transition' },
  { id: 'hit_e_026', text: '은퇴/퇴직을 끝이 아닌 새로운 시작으로 보고 있다.', subscale: 'psych_transition' },
  { id: 'hit_e_027', text: '직업적 정체성 없이도 자신을 설명할 수 있다.', subscale: 'psych_transition' },
  { id: 'hit_e_028', text: '일상의 구조가 바뀌는 것에 대한 불안이 있다.', subscale: 'psych_transition', reverse: true },
  { id: 'hit_e_029', text: '사회적 지위의 변화를 담담하게 수용할 수 있다.', subscale: 'psych_transition' },
  { id: 'hit_e_030', text: '새로운 루틴을 만들어갈 자신이 있다.', subscale: 'psych_transition' },
  { id: 'hit_e_031', text: '나이가 들수록 물질보다 의미가 중요해진다.', subscale: 'psych_transition' },
  { id: 'hit_e_032', text: '은퇴 후의 나를 긍정적으로 상상할 수 있다.', subscale: 'psych_transition' },
];

// ── 모듈2: 2막 방향 탐색 (28문항) ──────────────────────────────────

export const directionQuestions: LikertQuestion[] = [
  // === re_employment (재취업) — 6문항 ===
  { id: 'hit_e_033', text: '경험을 살려 다른 조직에서 다시 일하고 싶다.', subscale: 're_employment' },
  { id: 'hit_e_034', text: '이전보다 유연한 조건(파트타임, 계약직 등)이라도 일하고 싶다.', subscale: 're_employment' },
  { id: 'hit_e_035', text: '후배 세대와 함께 일하는 것이 즐겁다.', subscale: 're_employment' },
  { id: 'hit_e_036', text: '내 경험이 필요한 곳이 있을 것이라 생각한다.', subscale: 're_employment' },
  { id: 'hit_e_037', text: '조직에 소속되어 있는 것이 심리적 안정감을 준다.', subscale: 're_employment' },
  { id: 'hit_e_038', text: '재취업을 위한 구체적인 활동(이력서, 구직 등)을 하고 있다.', subscale: 're_employment' },

  // === entrepreneurship (창업/사업) — 6문항 ===
  { id: 'hit_e_039', text: '내 사업을 시작하고 싶은 구체적인 아이디어가 있다.', subscale: 'entrepreneurship' },
  { id: 'hit_e_040', text: '소규모라도 독립적으로 운영할 수 있는 자신감이 있다.', subscale: 'entrepreneurship' },
  { id: 'hit_e_041', text: '리스크를 감수하더라도 내 이름으로 일하고 싶다.', subscale: 'entrepreneurship' },
  { id: 'hit_e_042', text: '창업에 필요한 자금이나 자원을 확보할 수 있다.', subscale: 'entrepreneurship' },
  { id: 'hit_e_043', text: '사업 실패의 가능성도 수용할 수 있다.', subscale: 'entrepreneurship' },
  { id: 'hit_e_044', text: '과거 업무 경험에서 사업 아이디어의 씨앗을 발견했다.', subscale: 'entrepreneurship' },

  // === social_contribution (사회 공헌) — 5문항 ===
  { id: 'hit_e_045', text: '보상 없이도 사회를 위해 기여하고 싶다.', subscale: 'social_contribution' },
  { id: 'hit_e_046', text: '비영리단체나 시민사회 활동에 관심이 있다.', subscale: 'social_contribution' },
  { id: 'hit_e_047', text: '내 경험이 소외된 사람들에게 도움이 될 수 있다.', subscale: 'social_contribution' },
  { id: 'hit_e_048', text: '봉사활동을 통해 삶의 의미를 찾을 수 있다고 생각한다.', subscale: 'social_contribution' },
  { id: 'hit_e_049', text: '사회 문제 해결에 직접 참여하고 싶은 분야가 있다.', subscale: 'social_contribution' },

  // === mentoring (멘토링/교육) — 6문항 ===
  { id: 'hit_e_050', text: '후배 세대에게 내 경험을 전수하고 싶다.', subscale: 'mentoring' },
  { id: 'hit_e_051', text: '가르치는 것에서 보람을 느낀다.', subscale: 'mentoring' },
  { id: 'hit_e_052', text: '강의, 코칭, 멘토링을 해본 경험이 있다.', subscale: 'mentoring' },
  { id: 'hit_e_053', text: '내 전문 분야의 교육 콘텐츠를 만들 수 있다.', subscale: 'mentoring' },
  { id: 'hit_e_054', text: '학교나 교육기관에서 일하는 것에 관심이 있다.', subscale: 'mentoring' },
  { id: 'hit_e_055', text: '내 실패 경험까지 포함하여 솔직하게 전달할 수 있다.', subscale: 'mentoring' },

  // === leisure (여가/취미) — 5문항 ===
  { id: 'hit_e_056', text: '일과 무관한 취미나 관심사에 몰두하고 싶다.', subscale: 'leisure' },
  { id: 'hit_e_057', text: '여행, 문화, 예술 등 새로운 경험을 원한다.', subscale: 'leisure' },
  { id: 'hit_e_058', text: '건강 관리와 체력 유지가 최우선 과제다.', subscale: 'leisure' },
  { id: 'hit_e_059', text: '느리게 사는 것도 가치 있는 삶이라고 생각한다.', subscale: 'leisure' },
  { id: 'hit_e_060', text: '특별한 역할 없이도 충분히 행복할 수 있다.', subscale: 'leisure' },
];

// ── 모듈3: 역량 재활용 진단 (32문항) ───────────────────────────────

export const legacyQuestions: LikertQuestion[] = [
  // === transferable_legacy (이전 가능 역량) — 10문항 ===
  { id: 'hit_e_061', text: '수십 년간 쌓은 판단력과 통찰력이 여전히 날카롭다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_062', text: '위기 관리 경험이 어떤 환경에서든 유용할 것이다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_063', text: '사람을 다루고 조율하는 능력이 핵심 자산이다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_064', text: '업무 외 영역에서도 활용할 수 있는 기획·분석 능력이 있다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_065', text: '글쓰기, 발표, 소통 능력이 다른 맥락에서도 쓸모 있다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_066', text: '네트워크(인맥)가 2막에서도 자산이 될 것이다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_067', text: '문제를 정의하고 해결하는 사고 프레임이 체화되어 있다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_068', text: '협상과 설득 능력을 직업 외 상황에서도 발휘할 수 있다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_069', text: '재무·경영 감각이 개인 사업이나 투자에 도움이 된다.', subscale: 'transferable_legacy' },
  { id: 'hit_e_070', text: '내 역량 중 어떤 것이 2막에서 가장 가치 있을지 알고 있다.', subscale: 'transferable_legacy' },

  // === knowledge_transfer (지식 전수) — 10문항 ===
  { id: 'hit_e_071', text: '내가 알고 있는 것을 책이나 글로 남기고 싶다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_072', text: '후배들이 내 실수를 반복하지 않게 도와주고 싶다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_073', text: '내 분야의 살아있는 역사로서 기록을 남기고 싶다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_074', text: '내 노하우를 시스템이나 매뉴얼로 정리할 수 있다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_075', text: '나만 아는 것이 사라지는 것이 아까운 느낌이 든다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_076', text: '유튜브, 블로그, 팟캐스트 등으로 지식을 공유하고 싶다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_077', text: '대학이나 교육기관에서 실무 경험을 가르치고 싶다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_078', text: '내 경험을 콘텐츠로 만들면 사람들이 관심을 가질 것이다.', subscale: 'knowledge_transfer' },
  { id: 'hit_e_079', text: '지식 전수보다 내 시간을 즐기는 것이 더 중요하다.', subscale: 'knowledge_transfer', reverse: true },
  { id: 'hit_e_080', text: '멘티가 성장하는 것을 보면 가장 큰 보람을 느낀다.', subscale: 'knowledge_transfer' },

  // === new_capability (신규 역량 개발) — 12문항 ===
  { id: 'hit_e_081', text: '이 나이에 새로운 기술을 배우는 것이 두렵지 않다.', subscale: 'new_capability' },
  { id: 'hit_e_082', text: '디지털 도구(스마트폰, 앱, 컴퓨터)를 능숙하게 다룬다.', subscale: 'new_capability' },
  { id: 'hit_e_083', text: '온라인 강좌나 교육 프로그램을 수강한 경험이 있다.', subscale: 'new_capability' },
  { id: 'hit_e_084', text: '젊은 세대의 트렌드와 문화를 이해하려고 노력한다.', subscale: 'new_capability' },
  { id: 'hit_e_085', text: '새로운 분야를 공부하면 두뇌가 활성화되는 느낌이다.', subscale: 'new_capability' },
  { id: 'hit_e_086', text: 'AI, 디지털 전환 등 기술 변화에 관심을 갖고 있다.', subscale: 'new_capability' },
  { id: 'hit_e_087', text: '체력 유지를 위한 규칙적인 활동을 하고 있다.', subscale: 'new_capability' },
  { id: 'hit_e_088', text: '새로운 언어(외국어 포함)를 배우는 것에 관심이 있다.', subscale: 'new_capability' },
  { id: 'hit_e_089', text: '나이를 핑계로 새로운 시도를 포기하고 싶지 않다.', subscale: 'new_capability' },
  { id: 'hit_e_090', text: '2막을 위해 지금부터 준비해야 할 역량이 무엇인지 안다.', subscale: 'new_capability' },
  { id: 'hit_e_091', text: '실패해도 배울 수 있다면 시도할 가치가 있다.', subscale: 'new_capability' },
  { id: 'hit_e_092', text: '전문 분야 외의 교양(인문학, 예술, 철학)에 관심이 있다.', subscale: 'new_capability' },
];

// ── 모듈4: 사회적 연결 필요도 (20문항) ─────────────────────────────

export const socialQuestions: LikertQuestion[] = [
  // === belonging (소속감) — 10문항 ===
  { id: 'hit_e_093', text: '어딘가에 소속되어 있는 것이 심리적으로 중요하다.', subscale: 'belonging' },
  { id: 'hit_e_094', text: '정기적으로 만나는 그룹이나 모임이 있다.', subscale: 'belonging' },
  { id: 'hit_e_095', text: '혼자 있는 시간이 길어지면 불안해진다.', subscale: 'belonging' },
  { id: 'hit_e_096', text: '가족 외에 나를 필요로 하는 사람이 있었으면 좋겠다.', subscale: 'belonging' },
  { id: 'hit_e_097', text: '직장을 떠나면 사회적 고립이 걱정된다.', subscale: 'belonging', reverse: true },
  { id: 'hit_e_098', text: '새로운 커뮤니티를 찾아 참여할 의지가 있다.', subscale: 'belonging' },
  { id: 'hit_e_099', text: '은퇴 후에도 사회적 역할이 필요하다고 느낀다.', subscale: 'belonging' },
  { id: 'hit_e_100', text: '온라인 커뮤니티도 의미 있는 소속 경험이 될 수 있다.', subscale: 'belonging' },
  { id: 'hit_e_101', text: '세대가 다른 사람들과도 편하게 어울릴 수 있다.', subscale: 'belonging' },
  { id: 'hit_e_102', text: '고독을 즐기는 편이라 혼자만의 시간도 충분히 가치 있다.', subscale: 'belonging' },

  // === role_necessity (역할 필요도) — 10문항 ===
  { id: 'hit_e_103', text: '누군가에게 쓸모 있는 사람이고 싶다.', subscale: 'role_necessity' },
  { id: 'hit_e_104', text: '아무 역할도 없으면 존재 가치를 느끼기 어렵다.', subscale: 'role_necessity', reverse: true },
  { id: 'hit_e_105', text: '가정 내에서 새로운 역할(가사, 육아 지원 등)을 수용할 수 있다.', subscale: 'role_necessity' },
  { id: 'hit_e_106', text: '지역사회에서 리더 역할을 맡고 싶다.', subscale: 'role_necessity' },
  { id: 'hit_e_107', text: '은퇴 후에도 명함이 필요하다고 느낀다.', subscale: 'role_necessity' },
  { id: 'hit_e_108', text: '타인에게 인정받는 것이 여전히 중요하다.', subscale: 'role_necessity' },
  { id: 'hit_e_109', text: '역할이 없어도 내면의 평화를 유지할 수 있다.', subscale: 'role_necessity' },
  { id: 'hit_e_110', text: '작은 역할이라도 꾸준히 하는 것이 건강에 좋다고 생각한다.', subscale: 'role_necessity' },
  { id: 'hit_e_111', text: '배우자/가족이 나의 2막 역할에 대해 기대하는 바가 있다.', subscale: 'role_necessity' },
  { id: 'hit_e_112', text: '강제로 쉬게 되면 우울해질 것 같다.', subscale: 'role_necessity', reverse: true },
];

// ── 모듈5: 인생 2막 준비도 (28문항) ────────────────────────────────

export const secondActReadinessQuestions: LikertQuestion[] = [
  // === time_readiness (시간 준비도) — 7문항 ===
  { id: 'hit_e_113', text: '은퇴 후의 하루 일과를 구체적으로 그려볼 수 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_114', text: '구조화된 일정 없이도 하루를 의미 있게 보낼 수 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_115', text: '자유 시간이 많아지면 할 일의 목록이 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_116', text: '시간 관리를 스스로 하는 것에 자신이 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_117', text: '무료한 시간을 생산적으로 전환할 수 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_118', text: '아침에 일어날 이유가 직장 외에도 충분히 있다.', subscale: 'time_readiness' },
  { id: 'hit_e_119', text: '느린 속도의 삶에 적응할 수 있다.', subscale: 'time_readiness' },

  // === energy_readiness (에너지 준비도) — 7문항 ===
  { id: 'hit_e_120', text: '현재 체력과 건강 상태로 새로운 활동을 시작할 수 있다.', subscale: 'energy_readiness' },
  { id: 'hit_e_121', text: '스트레스를 관리하는 나만의 방법이 있다.', subscale: 'energy_readiness' },
  { id: 'hit_e_122', text: '정신적 에너지(학습, 집중)가 충분하다.', subscale: 'energy_readiness' },
  { id: 'hit_e_123', text: '감정적으로 안정된 상태라고 느낀다.', subscale: 'energy_readiness' },
  { id: 'hit_e_124', text: '건강 검진을 정기적으로 받고 있다.', subscale: 'energy_readiness' },
  { id: 'hit_e_125', text: '2막을 시작할 체력을 만들기 위해 노력하고 있다.', subscale: 'energy_readiness' },
  { id: 'hit_e_126', text: '만성적인 피로나 번아웃 없이 새 출발할 수 있다.', subscale: 'energy_readiness' },

  // === financial_readiness (재정 준비도) — 7문항 ===
  { id: 'hit_e_127', text: '은퇴 후 최소 2년간 소득이 없어도 생활할 수 있다.', subscale: 'financial_readiness' },
  { id: 'hit_e_128', text: '은퇴 후 예상 지출을 계산해보았다.', subscale: 'financial_readiness' },
  { id: 'hit_e_129', text: '연금, 저축, 투자 등 노후 자금 계획이 있다.', subscale: 'financial_readiness' },
  { id: 'hit_e_130', text: '재정적 불안이 2막 선택을 제한하고 있다.', subscale: 'financial_readiness', reverse: true },
  { id: 'hit_e_131', text: '수입이 줄어도 삶의 질을 유지할 수 있는 방법을 알고 있다.', subscale: 'financial_readiness' },
  { id: 'hit_e_132', text: '재정 상담을 받아본 적이 있다(또는 받을 계획이다).', subscale: 'financial_readiness' },
  { id: 'hit_e_133', text: '보상 없이 하고 싶은 일을 할 수 있는 경제적 여유가 있다.', subscale: 'financial_readiness' },

  // === relationship_readiness (관계 준비도) — 7문항 ===
  { id: 'hit_e_134', text: '배우자/가족과 은퇴 후 생활에 대해 충분히 대화했다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_135', text: '직장 동료가 아닌 친구/지인 관계가 충분하다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_136', text: '가족과 더 많은 시간을 보내는 것이 기대된다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_137', text: '은퇴 후 배우자와의 관계 변화에 대해 준비하고 있다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_138', text: '새로운 사람들과 관계를 맺을 의지와 에너지가 있다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_139', text: '자녀 세대와 건강한 거리감을 유지하고 있다.', subscale: 'relationship_readiness' },
  { id: 'hit_e_140', text: '은퇴 후의 삶에 대해 주변 사람들의 지지를 받고 있다.', subscale: 'relationship_readiness' },
];

// ── 전체 통합 export ──────────────────────────────────────────────

export const allHitEQuestions: LikertQuestion[] = [
  ...lifeReviewQuestions,
  ...directionQuestions,
  ...legacyQuestions,
  ...socialQuestions,
  ...secondActReadinessQuestions,
];

/** @deprecated allHitEQuestions 사용 권장 */
export const allEQuestions = allHitEQuestions;

/**
 * 테스트 페이지 호환용 모듈 배열
 * key는 EModuleType ('satisfaction' | 'direction' | 'legacy' | 'social_readiness')에 대응
 */
export const hitEModules = [
  { key: 'satisfaction', questions: lifeReviewQuestions },
  { key: 'direction',    questions: directionQuestions },
  { key: 'legacy',       questions: legacyQuestions },
  { key: 'social_readiness', questions: [...socialQuestions, ...secondActReadinessQuestions] },
] as const;
