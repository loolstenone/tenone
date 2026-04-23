/**
 * HIT D — 시니어 리더십검사 (10년 이상 경력자·관리자)
 * 140 + 미끼 2 = 142문항 · 7점 리커트
 * HIT_D_Final.md 설계서 기반
 *
 * 모듈1: 전문성 자산 (40) — domain_depth, tacit_knowledge, redeployment, personal_brand
 * 모듈2: 리더십 유형 (32) — exec_leadership, strategic_leadership, coaching_leadership, independent_leadership
 * 모듈3: 정체성 유연성 (28) — identity_strength, new_role, identity_recon
 * 모듈4: 네트워크 자본 (20) — strong_ties, weak_ties
 * 모듈5: 고년차 준비도 (20) — positioning, compensation, reference, senior_psych
 * 미끼: 2 — DECOY (validity)
 */

import type { LikertQuestion } from '@/types/hit';

export type DSection = 'expertise' | 'leadership' | 'identity' | 'network' | 'readiness' | 'decoy';

export interface DQuestion extends LikertQuestion {
  module: 'layer_d';
  section: DSection;
  subscale: string;
  reverse: boolean;
  crossTags: string[];
}

const Q = (
  id: string,
  section: DSection,
  subscale: string,
  text: string,
  reverse: boolean,
  crossTags: string[],
): DQuestion => ({ id, module: 'layer_d', section, subscale, text, reverse, crossTags });

export const dQuestions: DQuestion[] = [
  // ── 모듈1: 전문성 자산 (40) ──
  // 1-1. 도메인 깊이 (domain_depth) — 10
  Q('d_dd01', 'expertise', 'domain_depth', '내 분야에서 10년 이상 쌓아온 독자적 관점이나 철학이 있다.', false, ['SP:Strategic', 'UF:self']),
  Q('d_dd02', 'expertise', 'domain_depth', '후배나 팀원에게 체계적으로 지식을 전수할 수 있다.', false, ['BT:S', 'SP:Harmony']),
  Q('d_dd03', 'expertise', 'domain_depth', '내 전문 분야에서 업계가 인정하는 수준의 전문성이 있다.', false, ['SP:Guard', 'BT:C']),
  Q('d_dd04', 'expertise', 'domain_depth', '경험으로 체득한 암묵지가 나의 핵심 자산이다.', false, ['BT:C', 'PT:S']),
  Q('d_dd05', 'expertise', 'domain_depth', '해당 분야의 역사와 변천을 설명할 수 있다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_dd06', 'expertise', 'domain_depth', '내 전문성이 최신 기술/트렌드 변화에도 유효하다고 판단한다.', false, ['PT:N', 'CH:growth']),
  Q('d_dd07', 'expertise', 'domain_depth', '복잡한 문제 상황에서 경험에 기반한 직관적 판단이 정확한 편이다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_dd08', 'expertise', 'domain_depth', '내 분야에서 강의, 멘토링, 기고 등을 해본 경험이 있다.', false, ['BT:I', 'AP:S']),
  Q('d_dd09', 'expertise', 'domain_depth', '타 분야 전문가와 협업할 때 내 전문성의 가치를 명확히 전달할 수 있다.', false, ['BT:I', 'PT:T']),
  Q('d_dd10', 'expertise', 'domain_depth', '내 분야가 AI나 자동화로 대체될 가능성을 현실적으로 평가해보았다.', false, ['PT:N', 'PT:T', 'SP:Strategic']),

  // 1-2. 암묵지 자본화 (tacit_knowledge) — 10
  Q('d_tk01', 'expertise', 'tacit_knowledge', '매뉴얼에 없지만 내가 아는 업무 노하우가 많다.', false, ['SP:Guard', 'BT:C']),
  Q('d_tk02', 'expertise', 'tacit_knowledge', '위기 상황에서 경험 기반의 판단이 매뉴얼보다 효과적이었던 적이 있다.', false, ['SP:Breakthrough', 'BT:D']),
  Q('d_tk03', 'expertise', 'tacit_knowledge', '내 경험을 콘텐츠(글, 강의, 코칭)로 전환할 수 있다.', false, ['BT:I', 'AP:A', 'AP:S']),
  Q('d_tk04', 'expertise', 'tacit_knowledge', '후임자가 나의 역할을 완전히 대체하기 어려울 것이다.', false, ['SP:Guard']),
  Q('d_tk05', 'expertise', 'tacit_knowledge', '내가 쌓은 노하우를 시스템이나 프로세스로 문서화할 수 있다.', false, ['BT:C', 'PT:J']),
  Q('d_tk06', 'expertise', 'tacit_knowledge', '고객, 파트너와의 관계에서 나만 아는 맥락이 중요한 역할을 한다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('d_tk07', 'expertise', 'tacit_knowledge', '비슷한 직급의 다른 사람과 비교했을 때 내 경험의 폭이 넓다.', false, ['UF:self', 'SP:multi']),
  Q('d_tk08', 'expertise', 'tacit_knowledge', '내 전문성을 기반으로 컨설팅이나 자문 역할을 할 수 있다.', false, ['BT:D', 'SP:Strategic']),
  Q('d_tk09', 'expertise', 'tacit_knowledge', '실무 감각을 유지하면서도 전략적 시야를 갖추고 있다.', false, ['SP:Strategic', 'SP:Execution']),
  Q('d_tk10', 'expertise', 'tacit_knowledge', '내 경험이 조직을 떠나면 대부분 사라질 것이라 느낀다.', true, ['UF:self']),

  // 1-3. 재배치 가능성 (redeployment) — 10
  Q('d_rd01', 'expertise', 'redeployment', '현재 전문성을 다른 산업에 적용할 수 있는 방법을 생각해본 적이 있다.', false, ['PT:N', 'SP:Creativity']),
  Q('d_rd02', 'expertise', 'redeployment', '전문성의 핵심 원리는 산업이 바뀌어도 유효하다.', false, ['SP:Strategic']),
  Q('d_rd03', 'expertise', 'redeployment', '내 경험이 스타트업/중소기업에서 특히 가치 있을 수 있다.', false, ['BT:D', 'SP:Execution']),
  Q('d_rd04', 'expertise', 'redeployment', '교육·컨설팅·코칭 분야로의 전환을 구체적으로 고려해본 적이 있다.', false, ['AP:S', 'BT:I']),
  Q('d_rd05', 'expertise', 'redeployment', '내 전문성으로 독립(프리랜서, 1인 기업)할 수 있다고 생각한다.', false, ['BT:D', 'SP:Breakthrough']),
  Q('d_rd06', 'expertise', 'redeployment', '다른 기능(마케팅→경영기획, 개발→CTO 등)으로 역할 전환이 가능하다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_rd07', 'expertise', 'redeployment', '해외에서도 내 전문성이 통할 수 있다.', false, ['CH:adventure']),
  Q('d_rd08', 'expertise', 'redeployment', '현재 전문 분야와 인접한 새로운 영역에 관심이 있다.', false, ['PT:N', 'CH:growth']),
  Q('d_rd09', 'expertise', 'redeployment', '10년 후에도 유효한 전문성을 갖추기 위해 지금 준비할 것이 있다.', false, ['PT:N', 'PT:J', 'SP:Strategic']),
  Q('d_rd10', 'expertise', 'redeployment', '내 전문성을 디지털 환경에 맞게 업데이트할 필요를 느낀다.', false, ['CH:growth']),

  // 1-4. 퍼스널 브랜드 (personal_brand) — 10
  Q('d_pb01', 'expertise', 'personal_brand', '업계에서 나를 떠올리면 연상되는 전문 이미지가 있다.', false, ['BT:I', 'SP:Strategic']),
  Q('d_pb02', 'expertise', 'personal_brand', '나의 전문성을 한 문장으로 설명할 수 있다.', false, ['PT:T', 'BT:C']),
  Q('d_pb03', 'expertise', 'personal_brand', '소셜미디어나 업계 채널에서 전문적 콘텐츠를 공유한다.', false, ['BT:I', 'PT:E']),
  Q('d_pb04', 'expertise', 'personal_brand', '외부 강연, 기고, 인터뷰 등의 경험이 있다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('d_pb05', 'expertise', 'personal_brand', '나의 경력 스토리를 설득력 있게 전달할 수 있다.', false, ['BT:I', 'PT:T']),
  Q('d_pb06', 'expertise', 'personal_brand', '채용 시장에서 내 이름이 알려져 있다고 생각한다.', false, ['UF:self']),
  Q('d_pb07', 'expertise', 'personal_brand', '내가 만든 결과물이나 프로젝트가 업계에서 레퍼런스가 된 적이 있다.', false, ['SP:Execution']),
  Q('d_pb08', 'expertise', 'personal_brand', '이직 시 브랜드 프리미엄이 있을 것이라 생각한다.', false, ['UF:self', 'BT:D']),
  Q('d_pb09', 'expertise', 'personal_brand', '전문가 커뮤니티에서 인정받고 있다.', false, ['BT:I']),
  Q('d_pb10', 'expertise', 'personal_brand', '내 전문성에 대한 외부 평판과 자기 인식 사이에 괴리가 있다.', true, ['UF:self']),

  // ── 모듈2: 리더십 유형 (32) ──
  // 2-1. 실행형 (exec_leadership) — 8
  Q('d_le01', 'leadership', 'exec_leadership', '목표를 설정하면 실행 계획을 구체적으로 수립하는 편이다.', false, ['BT:D', 'PT:J', 'SP:Execution']),
  Q('d_le02', 'leadership', 'exec_leadership', '팀의 진행 상황을 체계적으로 추적하고 관리한다.', false, ['BT:C', 'PT:J']),
  Q('d_le03', 'leadership', 'exec_leadership', '결과가 나올 때까지 끝까지 밀어붙이는 추진력이 있다.', false, ['BT:D', 'SP:Execution']),
  Q('d_le04', 'leadership', 'exec_leadership', '업무 프로세스를 개선하여 효율을 높인 경험이 있다.', false, ['BT:C', 'SP:Execution']),
  Q('d_le05', 'leadership', 'exec_leadership', '위기 상황에서 빠르게 의사결정을 내릴 수 있다.', false, ['BT:D', 'PT:T', 'SP:Breakthrough']),
  Q('d_le06', 'leadership', 'exec_leadership', '팀원에게 명확한 기대치와 마감을 설정한다.', false, ['BT:D', 'PT:J']),
  Q('d_le07', 'leadership', 'exec_leadership', '성과 미달 시 원인을 분석하고 대안을 실행한다.', false, ['BT:C', 'BT:D', 'SP:Analytical']),
  Q('d_le08', 'leadership', 'exec_leadership', '리소스가 부족한 상황에서도 결과를 만들어낸 경험이 있다.', false, ['BT:D', 'SP:Breakthrough']),

  // 2-2. 전략형 (strategic_leadership) — 8
  Q('d_ls01', 'leadership', 'strategic_leadership', '조직의 중장기 방향을 설정하는 데 기여한 경험이 있다.', false, ['SP:Strategic', 'PT:N']),
  Q('d_ls02', 'leadership', 'strategic_leadership', '현재의 문제보다 3~5년 후의 변화를 먼저 생각하는 편이다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_ls03', 'leadership', 'strategic_leadership', '복잡한 상황을 큰 그림으로 정리하여 팀에 전달할 수 있다.', false, ['PT:N', 'BT:I']),
  Q('d_ls04', 'leadership', 'strategic_leadership', '데이터와 직관을 결합하여 전략적 판단을 내린다.', false, ['PT:N', 'PT:S', 'SP:Strategic']),
  Q('d_ls05', 'leadership', 'strategic_leadership', '사업 기회를 발굴하고 새로운 방향을 제시한 경험이 있다.', false, ['BT:D', 'SP:Creativity']),
  Q('d_ls06', 'leadership', 'strategic_leadership', '조직 외부 환경의 변화를 예측하려 한다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_ls07', 'leadership', 'strategic_leadership', '전략과 실행 사이의 간극을 좁히는 역할을 해왔다.', false, ['SP:Strategic', 'SP:Execution']),
  Q('d_ls08', 'leadership', 'strategic_leadership', '경영진에게 전략적 제안을 한 경험이 있다.', false, ['BT:D', 'PT:T']),

  // 2-3. 코치형 (coaching_leadership) — 8
  Q('d_lc01', 'leadership', 'coaching_leadership', '팀원의 성장을 위해 시간과 에너지를 투자한다.', false, ['BT:S', 'SP:Harmony', 'PT:F']),
  Q('d_lc02', 'leadership', 'coaching_leadership', '비판보다 질문을 통해 스스로 답을 찾게 유도한다.', false, ['BT:S', 'PT:F']),
  Q('d_lc03', 'leadership', 'coaching_leadership', '팀원의 강점을 파악하고 적절한 역할을 배치한다.', false, ['SP:Interpersonal', 'BT:S']),
  Q('d_lc04', 'leadership', 'coaching_leadership', '실패한 팀원에게 비난보다 학습 기회를 제공한다.', false, ['PT:F', 'UF:parent']),
  Q('d_lc05', 'leadership', 'coaching_leadership', '내가 키운 사람이 성장하는 것이 가장 큰 보람이다.', false, ['AP:S', 'SP:Harmony']),
  Q('d_lc06', 'leadership', 'coaching_leadership', '1:1 면담을 정기적으로 실시한다.', false, ['BT:S', 'PT:J']),
  Q('d_lc07', 'leadership', 'coaching_leadership', '팀원의 커리어 방향에 대해 조언한 경험이 있다.', false, ['SP:Interpersonal']),
  Q('d_lc08', 'leadership', 'coaching_leadership', '다양한 세대(MZ세대 등)와 효과적으로 소통한다.', false, ['PT:F', 'PT:E', 'UF:cultural']),

  // 2-4. 독립형 (independent_leadership) — 8
  Q('d_li01', 'leadership', 'independent_leadership', '팀을 이끄는 것보다 전문가로서 독립적으로 일하는 것이 편하다.', false, ['PT:I', 'BT:C']),
  Q('d_li02', 'leadership', 'independent_leadership', '관리 업무보다 직접 문제를 해결하는 것이 더 즐겁다.', false, ['BT:C', 'PT:S']),
  Q('d_li03', 'leadership', 'independent_leadership', '조직 정치보다 전문적 깊이에 에너지를 쓰고 싶다.', false, ['PT:I', 'PT:T', 'BT:C']),
  Q('d_li04', 'leadership', 'independent_leadership', '소규모 팀이나 독자적 프로젝트에서 최고의 성과를 낸다.', false, ['PT:I', 'SP:Analytical']),
  Q('d_li05', 'leadership', 'independent_leadership', '매니저 타이틀보다 전문가 타이틀에 더 끌린다.', false, ['BT:C']),
  Q('d_li06', 'leadership', 'independent_leadership', '회의와 보고보다 몰입 작업 시간이 더 가치 있다.', false, ['PT:I', 'BT:C']),
  Q('d_li07', 'leadership', 'independent_leadership', '프리랜서/계약직 형태도 만족스러울 수 있다.', false, ['SP:Breakthrough']),
  Q('d_li08', 'leadership', 'independent_leadership', '조직 내 역할보다 프로젝트 기반 역할이 나에게 맞다.', false, ['PT:P', 'BT:D']),

  // ── 모듈3: 정체성 유연성 (28) ──
  // 3-1. 현재 정체성 강도 (identity_strength) — 10
  Q('d_is01', 'identity', 'identity_strength', '"나는 OO 전문가다"라는 정체성이 매우 강하다.', false, ['UF:self']),
  Q('d_is02', 'identity', 'identity_strength', '현재 직함이 나를 설명하는 가장 중요한 요소다.', false, ['UF:self']),
  Q('d_is03', 'identity', 'identity_strength', '내 직업을 빼면 나를 설명하기 어렵다.', true, ['UF:self']),
  Q('d_is04', 'identity', 'identity_strength', '직무가 바뀌면 정체성의 혼란을 겪을 것 같다.', true, ['UF:self', 'CH:emotional']),
  Q('d_is05', 'identity', 'identity_strength', '주변 사람들도 나를 현재 직무와 강하게 연결 짓는다.', false, ['UF:peer']),
  Q('d_is06', 'identity', 'identity_strength', '내 분야를 떠나는 것은 나를 포기하는 것 같은 느낌이 든다.', true, ['UF:self']),
  Q('d_is07', 'identity', 'identity_strength', '10년간 쌓아온 경력을 보존하는 것이 중요하다.', false, ['SP:Guard']),
  Q('d_is08', 'identity', 'identity_strength', '현재 직무에서의 성취가 자존감의 큰 부분을 차지한다.', false, ['UF:self']),
  Q('d_is09', 'identity', 'identity_strength', '동종 업계 사람들과의 소속감이 강하다.', false, ['UF:peer', 'BT:S']),
  Q('d_is10', 'identity', 'identity_strength', '새로운 명함을 받으면 적응하는 데 오래 걸릴 것 같다.', true, ['UF:temperament']),

  // 3-2. 새 역할 수용 (new_role) — 10
  Q('d_nr01', 'identity', 'new_role', '완전히 다른 역할을 맡아도 흥미롭게 해낼 수 있다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('d_nr02', 'identity', 'new_role', '타이틀이 아닌 역할의 내용이 더 중요하다.', false, ['UF:self']),
  Q('d_nr03', 'identity', 'new_role', '후배에게 보고하는 상황도 수용할 수 있다.', false, ['BT:S', 'CH:emotional']),
  Q('d_nr04', 'identity', 'new_role', '기존 경력과 무관한 일도 배울 의지가 있다.', false, ['CH:growth']),
  Q('d_nr05', 'identity', 'new_role', '"내 나이에 이런 일을?"이라는 생각이 드는 편이다.', true, ['UF:cultural']),
  Q('d_nr06', 'identity', 'new_role', '경력 전환자의 롤모델이 있다.', false, ['PT:N']),
  Q('d_nr07', 'identity', 'new_role', '스타트업이나 소규모 조직에서의 멀티 플레이어 역할도 가능하다.', false, ['BT:D', 'PT:P']),
  Q('d_nr08', 'identity', 'new_role', '새로운 분야에서 초보가 되는 것을 두려워하지 않는다.', false, ['UF:self', 'CH:growth']),
  Q('d_nr09', 'identity', 'new_role', '다양한 가능한 자아를 상상해본 적이 있다.', false, ['PT:N', 'SP:Creativity']),
  Q('d_nr10', 'identity', 'new_role', '과거의 역할에 집착하기보다 미래의 역할에 열려 있다.', false, ['CH:growth', 'SP:Breakthrough']),

  // 3-3. 정체성 재구성 (identity_recon) — 8
  Q('d_ir01', 'identity', 'identity_recon', '내가 누구인지를 직업이 아닌 다른 기준으로 설명할 수 있다.', false, ['UF:self']),
  Q('d_ir02', 'identity', 'identity_recon', '삶의 다음 챕터를 적극적으로 설계하고 싶다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('d_ir03', 'identity', 'identity_recon', '경력 전환을 손실이 아닌 진화로 본다.', false, ['UF:trauma']),
  Q('d_ir04', 'identity', 'identity_recon', '나는 직업 외에도 다양한 역할로 정의된다.', false, ['UF:self']),
  Q('d_ir05', 'identity', 'identity_recon', '새 역할에서 기존 경험이 독특한 강점이 될 수 있다.', false, ['SP:Strategic']),
  Q('d_ir06', 'identity', 'identity_recon', '현재의 나와 미래의 나 사이의 연결고리를 찾을 수 있다.', false, ['PT:N', 'SP:Strategic']),
  Q('d_ir07', 'identity', 'identity_recon', '변화 속에서도 흔들리지 않는 나만의 핵심 가치가 있다.', false, ['CH:ethics', 'UF:self']),
  Q('d_ir08', 'identity', 'identity_recon', '경력 전환이 나를 더 풍요롭게 만들 수 있다고 믿는다.', false, ['CH:growth']),

  // ── 모듈4: 네트워크 자본 (20) ──
  // 4-1. 강한 연결 (strong_ties) — 10
  Q('d_st01', 'network', 'strong_ties', '진심으로 커리어 조언을 구할 수 있는 사람이 3명 이상 있다.', false, ['BT:I', 'UF:peer']),
  Q('d_st02', 'network', 'strong_ties', '업계 핵심 인사와 신뢰 관계를 유지하고 있다.', false, ['SP:Interpersonal']),
  Q('d_st03', 'network', 'strong_ties', '이직 시 적극적으로 도와줄 사람이 있다.', false, ['BT:I']),
  Q('d_st04', 'network', 'strong_ties', '전 직장 동료들과도 관계를 유지하고 있다.', false, ['BT:S', 'SP:Harmony']),
  Q('d_st05', 'network', 'strong_ties', '업계 밖의 다른 분야 전문가 인맥이 있다.', false, ['PT:N', 'BT:I']),
  Q('d_st06', 'network', 'strong_ties', '이직 경험이 있는 선배로부터 조언을 받을 수 있다.', false, ['UF:parent']),
  Q('d_st07', 'network', 'strong_ties', '나를 위해 레퍼런스 체크에 응해줄 사람이 있다.', false, ['SP:Interpersonal']),
  Q('d_st08', 'network', 'strong_ties', '기업 의사결정자(CEO, 임원급)와 직접 소통할 수 있는 관계가 있다.', false, ['BT:D', 'SP:Strategic']),
  Q('d_st09', 'network', 'strong_ties', '내 네트워크가 경력 전환에 실질적 도움이 될 것이라 확신한다.', false, ['UF:self']),
  Q('d_st10', 'network', 'strong_ties', '관계 유지를 위해 의식적으로 시간을 투자한다.', false, ['PT:J', 'BT:I']),

  // 4-2. 약한 연결 (weak_ties) — 10
  Q('d_wt01', 'network', 'weak_ties', '업계 행사나 컨퍼런스에서 새로운 사람을 만나는 것을 즐긴다.', false, ['PT:E', 'BT:I']),
  Q('d_wt02', 'network', 'weak_ties', '링크드인 등 전문 네트워크에서 활발하게 활동한다.', false, ['BT:I', 'PT:E']),
  Q('d_wt03', 'network', 'weak_ties', '다른 산업의 사람들과도 자연스럽게 대화할 수 있다.', false, ['PT:E', 'SP:Interpersonal']),
  Q('d_wt04', 'network', 'weak_ties', '예상치 못한 곳에서 기회가 온 경험이 있다.', false, ['PT:P']),
  Q('d_wt05', 'network', 'weak_ties', '내 전문성을 외부에 알리는 활동(기고, SNS, 강연)을 한다.', false, ['BT:I']),
  Q('d_wt06', 'network', 'weak_ties', '헤드헌터와 관계를 유지하고 있다.', false, ['SP:Strategic']),
  Q('d_wt07', 'network', 'weak_ties', '동문회, 직무 커뮤니티 등에 소속되어 있다.', false, ['BT:S']),
  Q('d_wt08', 'network', 'weak_ties', '나의 존재를 모르는 사람에게도 가치를 전달할 수 있는 채널이 있다.', false, ['BT:I', 'SP:Strategic']),
  Q('d_wt09', 'network', 'weak_ties', '우연한 만남에서도 기회를 포착하는 편이다.', false, ['PT:P', 'BT:D']),
  Q('d_wt10', 'network', 'weak_ties', '넓은 네트워크보다 깊은 네트워크가 중요하다고 생각한다.', false, ['BT:S']),

  // ── 모듈5: 고년차 준비도 (20) ──
  // 5-1. 포지셔닝 (positioning) — 5
  Q('d_po01', 'readiness', 'positioning', '"왜 지금 이직하는가"에 대한 설득력 있는 답변이 있다.', false, ['BT:I', 'PT:T']),
  Q('d_po02', 'readiness', 'positioning', '내 경력 스토리를 3분 안에 매력적으로 전달할 수 있다.', false, ['BT:I']),
  Q('d_po03', 'readiness', 'positioning', '목표 기업이 나를 뽑아야 하는 이유를 명확히 설명할 수 있다.', false, ['SP:Strategic', 'BT:D']),
  Q('d_po04', 'readiness', 'positioning', '과거 이직 경험을 성장 스토리로 설명할 수 있다.', false, ['UF:trauma']),
  Q('d_po05', 'readiness', 'positioning', '고년차로서의 강점(경험, 안정성, 네트워크)을 어필할 수 있다.', false, ['SP:all']),

  // 5-2. 연봉 협상 (compensation) — 5
  Q('d_cm01', 'readiness', 'compensation', '내 시장 가치(연봉 수준)를 객관적으로 파악하고 있다.', false, ['PT:T', 'SP:Analytical']),
  Q('d_cm02', 'readiness', 'compensation', '연봉 외 조건(직급, 권한, 성과급 등)도 전략적으로 협상할 수 있다.', false, ['BT:D', 'SP:Strategic']),
  Q('d_cm03', 'readiness', 'compensation', '보상 수준이 현재보다 낮아지면 이직하지 않겠다.', true, ['BT:S']),
  Q('d_cm04', 'readiness', 'compensation', '이직 시 기대 연봉의 합리적 근거를 제시할 수 있다.', false, ['PT:T', 'BT:C']),
  Q('d_cm05', 'readiness', 'compensation', '단기 보상보다 중장기 경력 가치를 우선시할 수 있다.', false, ['PT:N', 'SP:Strategic']),

  // 5-3. 레퍼런스·실행 (reference) — 5
  Q('d_rf01', 'readiness', 'reference', '레퍼런스 체크에 대비한 준비가 되어 있다.', false, ['PT:J']),
  Q('d_rf02', 'readiness', 'reference', '경쟁사 이직 시 비경쟁 조항 등 법적 이슈를 확인했다.', false, ['BT:C', 'PT:T']),
  Q('d_rf03', 'readiness', 'reference', '이직 기간이 3개월 이상 걸려도 인내할 수 있다.', false, ['CH:emotional', 'UF:self']),
  Q('d_rf04', 'readiness', 'reference', '현 직장에서의 퇴사 프로세스를 전략적으로 계획하고 있다.', false, ['PT:J', 'CH:integrity']),
  Q('d_rf05', 'readiness', 'reference', '이직 과정에서 현 직장에 미칠 영향을 고려하고 있다.', false, ['CH:ethics', 'BT:S']),

  // 5-4. 심리적 준비 (senior_psych) — 5
  Q('d_sp01', 'readiness', 'senior_psych', '10년 이상 쌓은 조직 내 위상을 포기하는 것이 두렵다.', true, ['UF:self', 'CH:emotional']),
  Q('d_sp02', 'readiness', 'senior_psych', '새 조직에서 다시 증명해야 한다는 것을 수용한다.', false, ['CH:growth', 'BT:D']),
  Q('d_sp03', 'readiness', 'senior_psych', '이직이 실패해도 다시 시도할 의지가 있다.', false, ['UF:self', 'SP:Breakthrough']),
  Q('d_sp04', 'readiness', 'senior_psych', '변화가 내 삶의 질을 향상시킬 것이라 기대한다.', false, ['CH:growth']),
  Q('d_sp05', 'readiness', 'senior_psych', '이직은 새로운 성장의 시작이라고 확신한다.', false, ['SP:Breakthrough', 'UF:self']),

  // ── 미끼 (DECOY) — 2 ──
  Q('d_val01', 'decoy', 'DECOY', '나는 부하 직원과 한 번도 갈등을 겪은 적이 없다.', false, []),
  Q('d_val02', 'decoy', 'DECOY', '내가 내린 경영 판단은 항상 옳았다.', false, []),
];

// ── 섹션별 뷰 (scoring 호환) ──
export const expertiseQuestions = dQuestions.filter(q => q.section === 'expertise');
export const leadershipQuestions = dQuestions.filter(q => q.section === 'leadership');
export const identityQuestions = dQuestions.filter(q => q.section === 'identity');
export const networkQuestions = dQuestions.filter(q => q.section === 'network');
export const seniorReadinessQuestions = dQuestions.filter(q => q.section === 'readiness');
export const dDecoyQuestions = dQuestions.filter(q => q.section === 'decoy');

// ── 모듈 메타 정보 (테스트 페이지 호환) ──
// 미끼는 expertise 모듈에 첫 번째, readiness 모듈에 마지막에 삽입
const expertiseWithDecoy = [...expertiseQuestions, dDecoyQuestions[0]].filter(Boolean);
const readinessWithDecoy = [...seniorReadinessQuestions, dDecoyQuestions[1]].filter(Boolean);

export const hitDModules = [
  { key: 'expertise', label: '전문성 자산', questions: expertiseWithDecoy, count: expertiseWithDecoy.length, time: 8 },
  { key: 'leadership', label: '리더십 유형', questions: leadershipQuestions, count: leadershipQuestions.length, time: 6 },
  { key: 'identity', label: '정체성 유연성', questions: identityQuestions, count: identityQuestions.length, time: 5 },
  { key: 'network', label: '네트워크 자본', questions: networkQuestions, count: networkQuestions.length, time: 4 },
  { key: 'seniorReadiness', label: '고년차 준비도', questions: readinessWithDecoy, count: readinessWithDecoy.length, time: 4 },
] as const;

export const allDQuestions: DQuestion[] = dQuestions;
export const allHitDQuestions: DQuestion[] = dQuestions; // 구버전 호환
