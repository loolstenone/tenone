/**
 * HIT E — 인생전환검사 (40말~50대+)
 * 140 + 미끼 2 = 142문항 · 7점 리커트
 * HIT_E_Final.md 설계서 기반
 *
 * 모듈1: 인생 만족도 & 잔여 열정 (32) — life_satisfaction, residual_passion, psych_transition
 * 모듈2: 2막 방향 탐색 (28) — re_employment, entrepreneurship, social_contribution, mentoring, leisure
 * 모듈3: 역량 재활용 (32) — transferable_legacy, knowledge_transfer, new_capability
 * 모듈4: 사회적 연결 필요도 (20) — belonging, role_necessity
 * 모듈5: 2막 준비도 (28) — time_readiness, energy_readiness, financial_readiness, relationship_readiness
 * 미끼: 2 — DECOY (validity)
 */

import type { LikertQuestion } from '@/types/hit';

export type ESection = 'satisfaction' | 'direction' | 'legacy' | 'social' | 'readiness' | 'decoy';

export interface EQuestion extends LikertQuestion {
  module: 'layer_e';
  section: ESection;
  subscale: string;
  reverse: boolean;
  crossTags: string[];
}

const Q = (
  id: string,
  section: ESection,
  subscale: string,
  text: string,
  reverse: boolean,
  crossTags: string[],
): EQuestion => ({ id, module: 'layer_e', section, subscale, text, reverse, crossTags });

export const eQuestions: EQuestion[] = [
  // ── 모듈1: 인생 만족도 & 잔여 열정 (32) ──
  // 1-1. 인생 만족도 (life_satisfaction) — 12
  Q('e_ls01', 'satisfaction', 'life_satisfaction', '지금까지의 삶을 전체적으로 돌아보면 만족스럽다.', false, ['UF:all']),
  Q('e_ls02', 'satisfaction', 'life_satisfaction', '직업 생활에서 의미 있는 성취를 이루었다.', false, ['SP:Execution']),
  Q('e_ls03', 'satisfaction', 'life_satisfaction', '인간관계에서 깊은 유대를 경험했다.', false, ['BT:S', 'BT:I', 'UF:peer']),
  Q('e_ls04', 'satisfaction', 'life_satisfaction', '내가 선택한 길이 대체로 옳았다고 생각한다.', false, ['UF:self']),
  Q('e_ls05', 'satisfaction', 'life_satisfaction', '과거의 실패와 실수를 수용하고 있다.', false, ['UF:trauma']),
  Q('e_ls06', 'satisfaction', 'life_satisfaction', '나는 가치 있는 삶을 살아왔다.', false, ['CH:ethics', 'UF:self']),
  Q('e_ls07', 'satisfaction', 'life_satisfaction', '후회되는 선택이 있지만 그것도 나를 만든 일부다.', false, ['UF:trauma']),
  Q('e_ls08', 'satisfaction', 'life_satisfaction', '가정생활과 직업생활의 균형에 만족한다.', false, ['UF:family']),
  Q('e_ls09', 'satisfaction', 'life_satisfaction', '내 삶이 다른 사람에게 긍정적 영향을 주었다고 생각한다.', false, ['SP:Harmony', 'CH:ethics']),
  Q('e_ls10', 'satisfaction', 'life_satisfaction', '인생을 다시 산다면 비슷한 선택을 할 것이다.', false, ['UF:self']),
  Q('e_ls11', 'satisfaction', 'life_satisfaction', '아직 하지 못한 것에 대한 미련이 크다.', true, ['CH:growth']),
  Q('e_ls12', 'satisfaction', 'life_satisfaction', '내 인생의 전반전 점수를 매긴다면 합격점이다.', false, ['UF:self']),

  // 1-2. 잔여 열정 (residual_passion) — 12
  Q('e_rp01', 'satisfaction', 'residual_passion', '아직 이루고 싶은 것이 분명하게 있다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('e_rp02', 'satisfaction', 'residual_passion', '새로운 것을 배우고 싶은 욕구가 강하다.', false, ['CH:growth']),
  Q('e_rp03', 'satisfaction', 'residual_passion', '은퇴 후에도 일(넓은 의미에서)을 하고 싶다.', false, ['BT:D', 'SP:Execution']),
  Q('e_rp04', 'satisfaction', 'residual_passion', '특정 분야에 대한 열정이 나이와 무관하게 살아있다.', false, ['AP:top', 'CH:growth']),
  Q('e_rp05', 'satisfaction', 'residual_passion', '아침에 일어나면 하고 싶은 일이 있다.', false, ['CH:emotional']),
  Q('e_rp06', 'satisfaction', 'residual_passion', '체력이 허락한다면 도전하고 싶은 일이 있다.', false, ['CH:adventure']),
  Q('e_rp07', 'satisfaction', 'residual_passion', '취미나 관심사에 몰입하면 시간 가는 줄 모른다.', false, ['AP:direction']),
  Q('e_rp08', 'satisfaction', 'residual_passion', '사회에 기여하고 싶은 구체적인 방법이 있다.', false, ['CH:ethics', 'AP:S']),
  Q('e_rp09', 'satisfaction', 'residual_passion', '젊었을 때 못했던 일을 지금이라도 하고 싶다.', false, ['UF:trauma', 'SP:Breakthrough']),
  Q('e_rp10', 'satisfaction', 'residual_passion', '일하지 않으면 무기력해질 것 같다.', true, ['CH:emotional']),
  Q('e_rp11', 'satisfaction', 'residual_passion', '돈과 무관하게 하고 싶은 활동이 있다.', false, ['AP:direction']),
  Q('e_rp12', 'satisfaction', 'residual_passion', '내 열정의 방향이 직업 생활과는 다를 수 있다.', false, ['PT:N', 'AP:change']),

  // 1-3. 심리적 전환 준비 (psych_transition) — 8
  Q('e_pt01', 'satisfaction', 'psych_transition', '직함이 없어져도 나의 가치는 변하지 않는다고 느낀다.', false, ['UF:self']),
  Q('e_pt02', 'satisfaction', 'psych_transition', '은퇴/퇴직을 끝이 아닌 새로운 시작으로 보고 있다.', false, ['CH:growth']),
  Q('e_pt03', 'satisfaction', 'psych_transition', '직업적 정체성 없이도 자신을 설명할 수 있다.', false, ['UF:self']),
  Q('e_pt04', 'satisfaction', 'psych_transition', '일상의 구조가 바뀌는 것에 대한 불안이 있다.', true, ['UF:temperament', 'CH:emotional']),
  Q('e_pt05', 'satisfaction', 'psych_transition', '사회적 지위의 변화를 담담하게 수용할 수 있다.', false, ['UF:self', 'CH:emotional']),
  Q('e_pt06', 'satisfaction', 'psych_transition', '새로운 루틴을 만들어갈 자신이 있다.', false, ['PT:J', 'SP:Execution']),
  Q('e_pt07', 'satisfaction', 'psych_transition', '나이가 들수록 물질보다 의미가 중요해진다.', false, ['CH:ethics']),
  Q('e_pt08', 'satisfaction', 'psych_transition', '은퇴 후의 나를 긍정적으로 상상할 수 있다.', false, ['PT:N', 'CH:emotional']),

  // ── 모듈2: 2막 방향 탐색 (28) ──
  // 2-1. 재취업 에너지 (re_employment) — 6
  Q('e_re01', 'direction', 're_employment', '경험을 살려 다른 조직에서 다시 일하고 싶다.', false, ['BT:S', 'SP:Execution']),
  Q('e_re02', 'direction', 're_employment', '유연한 조건(파트타임, 계약직 등)이라도 일하고 싶다.', false, ['PT:P']),
  Q('e_re03', 'direction', 're_employment', '후배 세대와 함께 일하는 것이 즐겁다.', false, ['BT:I', 'UF:cultural']),
  Q('e_re04', 'direction', 're_employment', '내 경험이 필요한 곳이 있을 것이라 생각한다.', false, ['UF:self', 'SP:all']),
  Q('e_re05', 'direction', 're_employment', '조직에 소속되어 있는 것이 심리적 안정감을 준다.', false, ['BT:S', 'UF:peer']),
  Q('e_re06', 'direction', 're_employment', '재취업을 위한 구체적인 활동을 하고 있다.', false, ['PT:J', 'SP:Execution']),

  // 2-2. 창업·독립 에너지 (entrepreneurship) — 6
  Q('e_en01', 'direction', 'entrepreneurship', '내 사업을 시작하고 싶은 구체적인 아이디어가 있다.', false, ['BT:D', 'AP:E', 'SP:Creativity']),
  Q('e_en02', 'direction', 'entrepreneurship', '소규모라도 독립적으로 운영할 수 있는 자신감이 있다.', false, ['BT:D', 'UF:self']),
  Q('e_en03', 'direction', 'entrepreneurship', '리스크를 감수하더라도 내 이름으로 일하고 싶다.', false, ['BT:D', 'CH:adventure']),
  Q('e_en04', 'direction', 'entrepreneurship', '창업에 필요한 자금이나 자원을 확보할 수 있다.', false, ['PT:S']),
  Q('e_en05', 'direction', 'entrepreneurship', '사업 실패의 가능성도 수용할 수 있다.', false, ['CH:emotional', 'UF:trauma']),
  Q('e_en06', 'direction', 'entrepreneurship', '과거 업무 경험에서 사업 아이디어의 씨앗을 발견했다.', false, ['PT:N', 'SP:Strategic']),

  // 2-3. 봉사·사회공헌 에너지 (social_contribution) — 5
  Q('e_sc01', 'direction', 'social_contribution', '보상 없이도 사회를 위해 기여하고 싶다.', false, ['CH:ethics', 'AP:S']),
  Q('e_sc02', 'direction', 'social_contribution', '비영리단체나 시민사회 활동에 관심이 있다.', false, ['AP:S', 'CH:ethics']),
  Q('e_sc03', 'direction', 'social_contribution', '내 경험이 소외된 사람들에게 도움이 될 수 있다.', false, ['SP:Harmony', 'BT:S']),
  Q('e_sc04', 'direction', 'social_contribution', '봉사활동을 통해 삶의 의미를 찾을 수 있다고 생각한다.', false, ['CH:ethics']),
  Q('e_sc05', 'direction', 'social_contribution', '사회 문제 해결에 직접 참여하고 싶은 분야가 있다.', false, ['AP:S', 'SP:Breakthrough']),

  // 2-4. 멘토링·교육 에너지 (mentoring) — 6
  Q('e_mt01', 'direction', 'mentoring', '후배 세대에게 내 경험을 전수하고 싶다.', false, ['AP:S', 'BT:I']),
  Q('e_mt02', 'direction', 'mentoring', '가르치는 것에서 보람을 느낀다.', false, ['AP:S']),
  Q('e_mt03', 'direction', 'mentoring', '강의, 코칭, 멘토링을 해본 경험이 있다.', false, ['BT:I']),
  Q('e_mt04', 'direction', 'mentoring', '내 전문 분야의 교육 콘텐츠를 만들 수 있다.', false, ['SP:Strategic', 'BT:C']),
  Q('e_mt05', 'direction', 'mentoring', '학교나 교육기관에서 일하는 것에 관심이 있다.', false, ['AP:S']),
  Q('e_mt06', 'direction', 'mentoring', '내 실패 경험까지 포함하여 솔직하게 전달할 수 있다.', false, ['UF:trauma', 'CH:integrity']),

  // 2-5. 여가·자기실현 에너지 (leisure) — 5
  Q('e_sr01', 'direction', 'leisure', '일과 무관한 취미나 관심사에 몰두하고 싶다.', false, ['AP:A', 'PT:P']),
  Q('e_sr02', 'direction', 'leisure', '여행, 문화, 예술 등 새로운 경험을 원한다.', false, ['CH:adventure']),
  Q('e_sr03', 'direction', 'leisure', '건강 관리와 체력 유지가 최우선 과제다.', false, ['PT:S']),
  Q('e_sr04', 'direction', 'leisure', '느리게 사는 것도 가치 있는 삶이라고 생각한다.', false, ['PT:P', 'BT:S']),
  Q('e_sr05', 'direction', 'leisure', '특별한 역할 없이도 충분히 행복할 수 있다.', false, ['UF:self']),

  // ── 모듈3: 역량 재활용 (32) ──
  // 3-1. 이전 가능 역량 (transferable_legacy) — 10
  Q('e_tl01', 'legacy', 'transferable_legacy', '수십 년간 쌓은 판단력과 통찰력이 여전히 날카롭다.', false, ['SP:Strategic']),
  Q('e_tl02', 'legacy', 'transferable_legacy', '위기 관리 경험이 어떤 환경에서든 유용할 것이다.', false, ['SP:Breakthrough', 'UF:trauma']),
  Q('e_tl03', 'legacy', 'transferable_legacy', '사람을 다루고 조율하는 능력이 핵심 자산이다.', false, ['SP:Interpersonal', 'BT:I', 'BT:S']),
  Q('e_tl04', 'legacy', 'transferable_legacy', '업무 외 영역에서도 활용할 수 있는 기획·분석 능력이 있다.', false, ['SP:Analytical', 'SP:Strategic']),
  Q('e_tl05', 'legacy', 'transferable_legacy', '글쓰기, 발표, 소통 능력이 다른 맥락에서도 쓸모 있다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('e_tl06', 'legacy', 'transferable_legacy', '네트워크(인맥)가 2막에서도 자산이 될 것이다.', false, ['BT:I']),
  Q('e_tl07', 'legacy', 'transferable_legacy', '문제를 정의하고 해결하는 사고 프레임이 체화되어 있다.', false, ['SP:Analytical', 'PT:T']),
  Q('e_tl08', 'legacy', 'transferable_legacy', '협상과 설득 능력을 직업 외 상황에서도 발휘할 수 있다.', false, ['BT:D', 'BT:I']),
  Q('e_tl09', 'legacy', 'transferable_legacy', '재무·경영 감각이 개인 사업이나 투자에 도움이 된다.', false, ['SP:Analytical']),
  Q('e_tl10', 'legacy', 'transferable_legacy', '내 역량 중 어떤 것이 2막에서 가장 가치 있을지 알고 있다.', false, ['UF:self', 'SP:Strategic']),

  // 3-2. 지식 전수 욕구 (knowledge_transfer) — 10
  Q('e_kt01', 'legacy', 'knowledge_transfer', '내가 알고 있는 것을 책이나 글로 남기고 싶다.', false, ['AP:A', 'BT:C']),
  Q('e_kt02', 'legacy', 'knowledge_transfer', '후배들이 내 실수를 반복하지 않게 도와주고 싶다.', false, ['BT:S', 'SP:Harmony']),
  Q('e_kt03', 'legacy', 'knowledge_transfer', '내 분야의 살아있는 역사로서 기록을 남기고 싶다.', false, ['SP:Guard']),
  Q('e_kt04', 'legacy', 'knowledge_transfer', '내 노하우를 시스템이나 매뉴얼로 정리할 수 있다.', false, ['BT:C', 'PT:J']),
  Q('e_kt05', 'legacy', 'knowledge_transfer', '나만 아는 것이 사라지는 것이 아까운 느낌이 든다.', false, ['SP:Guard']),
  Q('e_kt06', 'legacy', 'knowledge_transfer', '유튜브, 블로그, 팟캐스트 등으로 지식을 공유하고 싶다.', false, ['BT:I', 'PT:E']),
  Q('e_kt07', 'legacy', 'knowledge_transfer', '대학이나 교육기관에서 실무 경험을 가르치고 싶다.', false, ['AP:S']),
  Q('e_kt08', 'legacy', 'knowledge_transfer', '내 경험을 콘텐츠로 만들면 사람들이 관심을 가질 것이다.', false, ['UF:self']),
  Q('e_kt09', 'legacy', 'knowledge_transfer', '지식 전수보다 내 시간을 즐기는 것이 더 중요하다.', true, ['PT:P']),
  Q('e_kt10', 'legacy', 'knowledge_transfer', '멘티가 성장하는 것을 보면 가장 큰 보람을 느낀다.', false, ['BT:S', 'AP:S']),

  // 3-3. 새 역량 개발 의지 (new_capability) — 12
  Q('e_nc01', 'legacy', 'new_capability', '이 나이에 새로운 기술을 배우는 것이 두렵지 않다.', false, ['CH:growth', 'UF:temperament']),
  Q('e_nc02', 'legacy', 'new_capability', '디지털 도구를 능숙하게 다룬다.', false, ['PT:S']),
  Q('e_nc03', 'legacy', 'new_capability', '온라인 강좌나 교육 프로그램을 수강한 경험이 있다.', false, ['CH:growth']),
  Q('e_nc04', 'legacy', 'new_capability', '젊은 세대의 트렌드와 문화를 이해하려고 노력한다.', false, ['UF:cultural', 'CH:growth']),
  Q('e_nc05', 'legacy', 'new_capability', '새로운 분야를 공부하면 두뇌가 활성화되는 느낌이다.', false, ['CH:growth']),
  Q('e_nc06', 'legacy', 'new_capability', 'AI, 디지털 전환 등 기술 변화에 관심을 갖고 있다.', false, ['PT:N', 'CH:growth']),
  Q('e_nc07', 'legacy', 'new_capability', '체력 유지를 위한 규칙적인 활동을 하고 있다.', false, ['PT:J']),
  Q('e_nc08', 'legacy', 'new_capability', '새로운 언어(외국어 포함)를 배우는 것에 관심이 있다.', false, ['CH:growth']),
  Q('e_nc09', 'legacy', 'new_capability', '나이를 핑계로 새로운 시도를 포기하고 싶지 않다.', false, ['SP:Breakthrough', 'UF:self']),
  Q('e_nc10', 'legacy', 'new_capability', '2막을 위해 지금부터 준비해야 할 역량이 무엇인지 안다.', false, ['SP:Strategic', 'UF:self']),
  Q('e_nc11', 'legacy', 'new_capability', '실패해도 배울 수 있다면 시도할 가치가 있다.', false, ['CH:adventure']),
  Q('e_nc12', 'legacy', 'new_capability', '전문 분야 외의 교양(인문학, 예술, 철학)에 관심이 있다.', false, ['AP:A', 'AP:I', 'CH:growth']),

  // ── 모듈4: 사회적 연결 필요도 (20) ──
  // 4-1. 소속 욕구 (belonging) — 10
  Q('e_bl01', 'social', 'belonging', '어딘가에 소속되어 있는 것이 심리적으로 중요하다.', false, ['BT:S', 'UF:peer']),
  Q('e_bl02', 'social', 'belonging', '정기적으로 만나는 그룹이나 모임이 있다.', false, ['BT:I']),
  Q('e_bl03', 'social', 'belonging', '혼자 있는 시간이 길어지면 불안해진다.', true, ['PT:E', 'CH:emotional']),
  Q('e_bl04', 'social', 'belonging', '가족 외에 나를 필요로 하는 사람이 있었으면 좋겠다.', false, ['UF:peer']),
  Q('e_bl05', 'social', 'belonging', '직장을 떠나면 사회적 고립이 걱정된다.', true, ['CH:emotional']),
  Q('e_bl06', 'social', 'belonging', '새로운 커뮤니티를 찾아 참여할 의지가 있다.', false, ['BT:I', 'CH:growth']),
  Q('e_bl07', 'social', 'belonging', '은퇴 후에도 사회적 역할이 필요하다고 느낀다.', false, ['BT:D']),
  Q('e_bl08', 'social', 'belonging', '온라인 커뮤니티도 의미 있는 소속 경험이 될 수 있다.', false, ['PT:P']),
  Q('e_bl09', 'social', 'belonging', '세대가 다른 사람들과도 편하게 어울릴 수 있다.', false, ['UF:cultural', 'BT:I']),
  Q('e_bl10', 'social', 'belonging', '고독을 즐기는 편이라 혼자만의 시간도 충분히 가치 있다.', false, ['PT:I', 'BT:S']),

  // 4-2. 역할 필요성 (role_necessity) — 10
  Q('e_rn01', 'social', 'role_necessity', '누군가에게 쓸모 있는 사람이고 싶다.', false, ['UF:self', 'BT:S']),
  Q('e_rn02', 'social', 'role_necessity', '아무 역할도 없으면 존재 가치를 느끼기 어렵다.', true, ['UF:self']),
  Q('e_rn03', 'social', 'role_necessity', '가정 내에서 새로운 역할(가사, 육아 지원 등)을 수용할 수 있다.', false, ['BT:S', 'PT:P']),
  Q('e_rn04', 'social', 'role_necessity', '지역사회에서 리더 역할을 맡고 싶다.', false, ['BT:D', 'AP:E']),
  Q('e_rn05', 'social', 'role_necessity', '은퇴 후에도 명함이 필요하다고 느낀다.', false, ['UF:self']),
  Q('e_rn06', 'social', 'role_necessity', '타인에게 인정받는 것이 여전히 중요하다.', false, ['UF:peer']),
  Q('e_rn07', 'social', 'role_necessity', '역할이 없어도 내면의 평화를 유지할 수 있다.', false, ['UF:self']),
  Q('e_rn08', 'social', 'role_necessity', '작은 역할이라도 꾸준히 하는 것이 건강에 좋다고 생각한다.', false, ['PT:J']),
  Q('e_rn09', 'social', 'role_necessity', '배우자/가족이 나의 2막 역할에 대해 기대하는 바가 있다.', false, ['UF:family']),
  Q('e_rn10', 'social', 'role_necessity', '강제로 쉬게 되면 우울해질 것 같다.', true, ['CH:emotional']),

  // ── 모듈5: 2막 준비도 (28) ──
  // 5-1. 시간 준비 (time_readiness) — 7
  Q('e_tr01', 'readiness', 'time_readiness', '은퇴 후의 하루 일과를 구체적으로 그려볼 수 있다.', false, ['PT:N', 'PT:J']),
  Q('e_tr02', 'readiness', 'time_readiness', '구조화된 일정 없이도 하루를 의미 있게 보낼 수 있다.', false, ['PT:P']),
  Q('e_tr03', 'readiness', 'time_readiness', '자유 시간이 많아지면 할 일의 목록이 있다.', false, ['PT:J']),
  Q('e_tr04', 'readiness', 'time_readiness', '시간 관리를 스스로 하는 것에 자신이 있다.', false, ['CH:integrity']),
  Q('e_tr05', 'readiness', 'time_readiness', '무료한 시간을 생산적으로 전환할 수 있다.', false, ['SP:Execution']),
  Q('e_tr06', 'readiness', 'time_readiness', '아침에 일어날 이유가 직장 외에도 충분히 있다.', false, ['UF:self']),
  Q('e_tr07', 'readiness', 'time_readiness', '느린 속도의 삶에 적응할 수 있다.', false, ['BT:S', 'PT:P']),

  // 5-2. 에너지 준비 (energy_readiness) — 7
  Q('e_er01', 'readiness', 'energy_readiness', '현재 체력과 건강 상태로 새로운 활동을 시작할 수 있다.', false, ['UF:temperament']),
  Q('e_er02', 'readiness', 'energy_readiness', '스트레스를 관리하는 나만의 방법이 있다.', false, ['CH:emotional']),
  Q('e_er03', 'readiness', 'energy_readiness', '정신적 에너지(학습, 집중)가 충분하다.', false, ['CH:growth']),
  Q('e_er04', 'readiness', 'energy_readiness', '감정적으로 안정된 상태라고 느낀다.', false, ['CH:emotional']),
  Q('e_er05', 'readiness', 'energy_readiness', '건강 검진을 정기적으로 받고 있다.', false, ['CH:integrity']),
  Q('e_er06', 'readiness', 'energy_readiness', '2막을 시작할 체력을 만들기 위해 노력하고 있다.', false, ['SP:Execution']),
  Q('e_er07', 'readiness', 'energy_readiness', '만성적인 피로나 번아웃 없이 새 출발할 수 있다.', false, ['CH:emotional']),

  // 5-3. 재정 준비 (financial_readiness) — 7
  Q('e_fr01', 'readiness', 'financial_readiness', '은퇴 후 최소 2년간 소득이 없어도 생활할 수 있다.', false, ['PT:S']),
  Q('e_fr02', 'readiness', 'financial_readiness', '은퇴 후 예상 지출을 계산해보았다.', false, ['PT:S', 'BT:C']),
  Q('e_fr03', 'readiness', 'financial_readiness', '연금, 저축, 투자 등 노후 자금 계획이 있다.', false, ['PT:J', 'SP:Strategic']),
  Q('e_fr04', 'readiness', 'financial_readiness', '재정적 불안이 2막 선택을 제한하고 있다.', true, ['CH:emotional']),
  Q('e_fr05', 'readiness', 'financial_readiness', '수입이 줄어도 삶의 질을 유지할 수 있는 방법을 알고 있다.', false, ['SP:Analytical']),
  Q('e_fr06', 'readiness', 'financial_readiness', '재정 상담을 받아본 적이 있다(또는 받을 계획이다).', false, ['PT:J']),
  Q('e_fr07', 'readiness', 'financial_readiness', '보상 없이 하고 싶은 일을 할 수 있는 경제적 여유가 있다.', false, ['UF:economic']),

  // 5-4. 관계 준비 (relationship_readiness) — 7
  Q('e_rr01', 'readiness', 'relationship_readiness', '배우자/가족과 은퇴 후 생활에 대해 충분히 대화했다.', false, ['UF:family']),
  Q('e_rr02', 'readiness', 'relationship_readiness', '직장 동료가 아닌 친구/지인 관계가 충분하다.', false, ['UF:peer', 'BT:I']),
  Q('e_rr03', 'readiness', 'relationship_readiness', '가족과 더 많은 시간을 보내는 것이 기대된다.', false, ['UF:family']),
  Q('e_rr04', 'readiness', 'relationship_readiness', '은퇴 후 배우자와의 관계 변화에 대해 준비하고 있다.', false, ['UF:family']),
  Q('e_rr05', 'readiness', 'relationship_readiness', '새로운 사람들과 관계를 맺을 의지와 에너지가 있다.', false, ['BT:I', 'PT:E']),
  Q('e_rr06', 'readiness', 'relationship_readiness', '자녀 세대와 건강한 거리감을 유지하고 있다.', false, ['UF:family']),
  Q('e_rr07', 'readiness', 'relationship_readiness', '은퇴 후의 삶에 대해 주변 사람들의 지지를 받고 있다.', false, ['UF:peer', 'UF:family']),

  // ── 미끼 (2) ──
  Q('e_val01', 'decoy', 'DECOY', '나는 인생에서 단 한 번도 후회한 적이 없다.', false, []),
  Q('e_val02', 'decoy', 'DECOY', '나이가 들면서 약해진 부분이 전혀 없다.', false, []),
];

// ── 섹션별 뷰 ──
export const satisfactionQuestions = eQuestions.filter(q => q.section === 'satisfaction');
export const directionQuestions = eQuestions.filter(q => q.section === 'direction');
export const legacyQuestions = eQuestions.filter(q => q.section === 'legacy');
export const socialQuestions = eQuestions.filter(q => q.section === 'social');
export const readinessQuestions = eQuestions.filter(q => q.section === 'readiness');
export const eDecoyQuestions = eQuestions.filter(q => q.section === 'decoy');

// 하위 호환
export const lifeReviewQuestions = satisfactionQuestions;
export const secondActReadinessQuestions = readinessQuestions;

// 페이지 호환 — key는 section과 동일
export const hitEModules = [
  { key: 'satisfaction', label: '인생 만족도 & 잔여 열정', questions: satisfactionQuestions },
  { key: 'direction', label: '2막 방향 탐색', questions: directionQuestions },
  { key: 'legacy', label: '역량 재활용', questions: legacyQuestions },
  { key: 'social', label: '사회적 연결 필요도', questions: socialQuestions },
  { key: 'readiness', label: '2막 준비도', questions: readinessQuestions },
] as const;

export const allEQuestions = eQuestions;
export const allHitEQuestions = eQuestions;
