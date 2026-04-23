/**
 * HIT C — 경력전환검사 (10년 이하 경력자)
 * 120 + 미끼 2 = 122문항 · 7점 리커트
 * HIT_C_Final.md 설계서 기반
 *
 * 모듈1: 경력 자본 진단 (40) — domain_expertise, achievement, relational, transferable
 * 모듈2: 이직 동기 (24) — push, pull
 * 모듈3: 전직 가능성 (36) — skill_transfer, market_fit, adaptation
 * 모듈4: 이직 준비도 (20) — doc, interview, timing, psychological
 * 미끼: 2 — DECOY (validity)
 */

import type { LikertQuestion } from '@/types/hit';

export type CSection = 'capital' | 'motivation' | 'transferability' | 'readiness' | 'decoy';
export type CModuleKey = 'careerCapital' | 'motivation' | 'transferability' | 'readiness';

export interface CQuestion extends LikertQuestion {
  module: 'layer_c';
  section: CSection;
  subscale: string;
  reverse: boolean;
  crossTags: string[]; // A 결과와의 교차 해석용 (채점엔 영향 없음)
}

const Q = (
  id: string,
  section: CSection,
  subscale: string,
  text: string,
  reverse: boolean,
  crossTags: string[],
): CQuestion => ({ id, module: 'layer_c', section, subscale, text, reverse, crossTags });

export const cQuestions: CQuestion[] = [
  // ── 모듈1: 경력 자본 진단 (40) ──
  // 1-1. 직무 전문성 (domain_expertise) — 10
  Q('c_de01', 'capital', 'domain_expertise', '현재 직무에서 동료들이 나에게 자문을 구하는 영역이 있다.', false, ['SP:Strategic', 'BT:C']),
  Q('c_de02', 'capital', 'domain_expertise', '내 전문 분야에서 최신 트렌드를 꾸준히 파악하고 있다.', false, ['PT:N', 'UF:intellect']),
  Q('c_de03', 'capital', 'domain_expertise', '업무에서 남들이 쉽게 따라하기 어려운 나만의 노하우가 있다.', false, ['SP:Guard', 'BT:C']),
  Q('c_de04', 'capital', 'domain_expertise', '현재 직무에서 3년 전보다 확실히 성장했다고 느낀다.', false, ['UF:self', 'CH:growth']),
  Q('c_de05', 'capital', 'domain_expertise', '현재 역할에서 더 배울 것이 없다고 느낄 때가 있다.', true, ['SP:Breakthrough']),
  Q('c_de06', 'capital', 'domain_expertise', '내 전문성이 현재 회사 밖에서도 통할 것이라 자신한다.', false, ['SP:Strategic', 'UF:self']),
  Q('c_de07', 'capital', 'domain_expertise', '업무 관련 자격증, 교육, 인증을 지속적으로 취득하고 있다.', false, ['CH:integrity', 'PT:J']),
  Q('c_de08', 'capital', 'domain_expertise', '내 업무 경험을 체계적으로 정리할 수 있다.', false, ['BT:C', 'PT:J']),
  Q('c_de09', 'capital', 'domain_expertise', '같은 직무의 타사 담당자와 비교했을 때 경쟁력이 있다고 생각한다.', false, ['UF:self', 'BT:D']),
  Q('c_de10', 'capital', 'domain_expertise', '내 전문 분야가 향후 5년간 시장에서 수요가 있을 것이라 본다.', false, ['PT:N', 'SP:Strategic']),

  // 1-2. 성과 자본 (achievement) — 10
  Q('c_ac01', 'capital', 'achievement', '재직 중 수치로 증명할 수 있는 성과가 있다.', false, ['SP:Execution', 'BT:D']),
  Q('c_ac02', 'capital', 'achievement', '내가 주도한 프로젝트가 조직에 실질적 변화를 가져온 적이 있다.', false, ['BT:D', 'SP:Breakthrough']),
  Q('c_ac03', 'capital', 'achievement', '상사나 동료로부터 업무 성과에 대해 긍정적 피드백을 자주 받는다.', false, ['BT:I', 'UF:peer']),
  Q('c_ac04', 'capital', 'achievement', '기대 이상의 결과를 낸 경험이 이직 시 강력한 어필 포인트가 될 수 있다.', false, ['SP:Execution']),
  Q('c_ac05', 'capital', 'achievement', '내 성과를 객관적으로 설명하는 것이 어렵다.', true, ['BT:C_low', 'PT:I']),
  Q('c_ac06', 'capital', 'achievement', '실패한 프로젝트에서도 배운 점을 명확하게 말할 수 있다.', false, ['UF:trauma', 'CH:growth']),
  Q('c_ac07', 'capital', 'achievement', '업무에서 새로운 방법을 제안하고 실행해본 적이 있다.', false, ['PT:N', 'BT:D', 'SP:Creativity']),
  Q('c_ac08', 'capital', 'achievement', '조직 내에서 승진이나 보상으로 성과를 인정받은 경험이 있다.', false, ['BT:D']),
  Q('c_ac09', 'capital', 'achievement', '나의 성과가 팀 전체의 성과에 기여한 정도를 설명할 수 있다.', false, ['BT:I', 'SP:Harmony']),
  Q('c_ac10', 'capital', 'achievement', '현재 직무에서의 성과가 다른 산업에서도 의미 있을 것이라 생각한다.', false, ['SP:Strategic', 'PT:N']),

  // 1-3. 관계 자본 (relational) — 10
  Q('c_re01', 'capital', 'relational', '직장 밖에서도 유지되는 업무 관련 인맥이 있다.', false, ['BT:I', 'PT:E']),
  Q('c_re02', 'capital', 'relational', '필요할 때 조언을 구할 수 있는 업계 선배나 멘토가 있다.', false, ['UF:parent', 'BT:S']),
  Q('c_re03', 'capital', 'relational', '이직 시 나를 추천해줄 수 있는 사람이 2명 이상 있다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('c_re04', 'capital', 'relational', '타 부서/타사 사람들과의 협업 경험이 풍부하다.', false, ['BT:I', 'PT:E']),
  Q('c_re05', 'capital', 'relational', '업무 네트워크를 의식적으로 관리하는 편이다.', false, ['PT:J', 'BT:I']),
  Q('c_re06', 'capital', 'relational', '같은 업계 종사자들과 정기적으로 교류한다.', false, ['BT:I', 'PT:E']),
  Q('c_re07', 'capital', 'relational', '새로운 사람과 업무적 관계를 맺는 것에 거부감이 없다.', false, ['PT:E', 'CH:relational']),
  Q('c_re08', 'capital', 'relational', '현재 직장의 인맥이 이직 후에도 도움이 될 것이라 생각한다.', false, ['SP:Interpersonal']),
  Q('c_re09', 'capital', 'relational', '업계 커뮤니티, 세미나, 컨퍼런스 등에 참여한 경험이 있다.', false, ['PT:E', 'BT:I']),
  Q('c_re10', 'capital', 'relational', '내 평판이 업계에서 긍정적이라고 생각한다.', false, ['UF:self', 'BT:I']),

  // 1-4. 범용 스킬 (transferable) — 10
  Q('c_tr01', 'capital', 'transferable', '업무 외 영역(기획, 프레젠테이션, 데이터 분석 등)에서도 강점이 있다.', false, ['SP:multi', 'PT:N']),
  Q('c_tr02', 'capital', 'transferable', '다양한 부서의 사람들과 효과적으로 소통할 수 있다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('c_tr03', 'capital', 'transferable', '새로운 도구나 시스템을 배우는 데 거부감이 없다.', false, ['CH:growth', 'PT:P']),
  Q('c_tr04', 'capital', 'transferable', '외국어로 업무를 수행할 수 있다.', false, ['SP:Strategic']),
  Q('c_tr05', 'capital', 'transferable', '복잡한 문제를 구조화하여 해결하는 능력이 있다.', false, ['BT:C', 'SP:Analytical', 'PT:T']),
  Q('c_tr06', 'capital', 'transferable', '직무가 바뀌어도 활용할 수 있는 핵심 역량이 무엇인지 안다.', false, ['UF:self', 'SP:Strategic']),
  Q('c_tr07', 'capital', 'transferable', '프로젝트 관리(일정, 자원, 리스크)를 독립적으로 할 수 있다.', false, ['BT:D', 'PT:J', 'SP:Execution']),
  Q('c_tr08', 'capital', 'transferable', '데이터를 기반으로 의사결정하는 습관이 있다.', false, ['BT:C', 'PT:T', 'SP:Analytical']),
  Q('c_tr09', 'capital', 'transferable', '글이든 말이든, 내 생각을 논리적으로 전달하는 데 자신이 있다.', false, ['BT:I', 'BT:C', 'PT:T']),
  Q('c_tr10', 'capital', 'transferable', '현재 직무와 다른 분야에서도 일할 수 있다는 자신감이 있다.', false, ['UF:self', 'SP:Breakthrough']),

  // ── 모듈2: 이직 동기 (24) ──
  // 2-1. Push (12)
  Q('c_pu01', 'motivation', 'push', '현재 직장에서 성장의 한계를 느낀다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('c_pu02', 'motivation', 'push', '내 역할과 능력 사이에 괴리가 있다고 느낀다.', false, ['UF:self', 'SP:multi']),
  Q('c_pu03', 'motivation', 'push', '현재 받는 보상이 내 기여도에 비해 부족하다고 느낀다.', false, ['BT:D']),
  Q('c_pu04', 'motivation', 'push', '직속 상사와의 관계에서 스트레스를 받는다.', false, ['UF:parent', 'CH:emotional']),
  Q('c_pu05', 'motivation', 'push', '조직 문화가 나와 맞지 않는다고 느낀다.', false, ['CH:all', 'PT:all']),
  Q('c_pu06', 'motivation', 'push', '현재 직무가 내 가치관과 점점 멀어지고 있다.', false, ['CH:ethics', 'AP:mismatch']),
  Q('c_pu07', 'motivation', 'push', '일과 삶의 균형이 지속적으로 무너지고 있다.', false, ['CH:emotional']),
  Q('c_pu08', 'motivation', 'push', '회사의 미래 전망이 불안하다.', false, ['PT:N']),
  Q('c_pu09', 'motivation', 'push', '같은 업무의 반복으로 동기가 떨어졌다.', false, ['CH:growth', 'SP:Creativity']),
  Q('c_pu10', 'motivation', 'push', '내 의견이 조직에서 반영되지 않는다고 느낀다.', false, ['BT:D', 'PT:E']),
  Q('c_pu11', 'motivation', 'push', '현재 역할에서 의미와 보람을 찾기 어렵다.', false, ['AP:mismatch']),
  Q('c_pu12', 'motivation', 'push', '건강이나 체력적으로 현재 업무를 지속하기 어렵다고 느낀다.', false, ['CH:emotional']),

  // 2-2. Pull (12)
  Q('c_pl01', 'motivation', 'pull', '새로운 도전을 통해 더 성장하고 싶다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('c_pl02', 'motivation', 'pull', '특정 산업이나 분야로 전환하고 싶은 명확한 목표가 있다.', false, ['AP:direction', 'PT:J']),
  Q('c_pl03', 'motivation', 'pull', '더 높은 보상을 기대하고 있다.', false, ['BT:D']),
  Q('c_pl04', 'motivation', 'pull', '내 가치관과 맞는 조직에서 일하고 싶다.', false, ['CH:ethics']),
  Q('c_pl05', 'motivation', 'pull', '더 큰 규모 또는 더 민첩한 조직에서 일해보고 싶다.', false, ['BT:D', 'BT:S']),
  Q('c_pl06', 'motivation', 'pull', '리더/매니저 역할로 성장하고 싶다.', false, ['BT:D', 'SP:Execution']),
  Q('c_pl07', 'motivation', 'pull', '해외 또는 글로벌 환경에서 일해보고 싶다.', false, ['CH:adventure']),
  Q('c_pl08', 'motivation', 'pull', '내 전문성을 더 깊이 발휘할 수 있는 환경을 원한다.', false, ['SP:Strategic']),
  Q('c_pl09', 'motivation', 'pull', '사회적으로 의미 있는 일을 하고 싶다.', false, ['CH:ethics', 'AP:S']),
  Q('c_pl10', 'motivation', 'pull', '유연한 근무 환경을 원한다.', false, ['PT:P']),
  Q('c_pl11', 'motivation', 'pull', '함께 일하고 싶은 사람들이 있는 곳으로 가고 싶다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('c_pl12', 'motivation', 'pull', '창업이나 독립을 위한 경험을 쌓고 싶다.', false, ['BT:D', 'AP:E', 'SP:Breakthrough']),

  // ── 모듈3: 전직 가능성 (36) ──
  // 3-1. 역량 이전성 (skill_transfer) — 12
  Q('c_st01', 'transferability', 'skill_transfer', '현재 직무의 핵심 역량이 목표 직무에서도 필요하다.', false, ['SP:all']),
  Q('c_st02', 'transferability', 'skill_transfer', '목표 직무의 핵심 업무 내용을 구체적으로 이해하고 있다.', false, ['PT:S', 'BT:C']),
  Q('c_st03', 'transferability', 'skill_transfer', '현재 역량과 목표 직무 사이의 갭이 무엇인지 파악하고 있다.', false, ['SP:Analytical', 'UF:self']),
  Q('c_st04', 'transferability', 'skill_transfer', '그 갭을 메우기 위해 구체적인 학습 계획이 있다.', false, ['PT:J', 'CH:integrity']),
  Q('c_st05', 'transferability', 'skill_transfer', '과거에 직무나 역할이 바뀌었을 때 빠르게 적응한 경험이 있다.', false, ['UF:temperament', 'CH:growth']),
  Q('c_st06', 'transferability', 'skill_transfer', '목표 직무에서 요구하는 도구나 기술을 이미 일부 보유하고 있다.', false, ['BT:C']),
  Q('c_st07', 'transferability', 'skill_transfer', '목표 산업의 비즈니스 구조와 트렌드를 이해하고 있다.', false, ['PT:N', 'SP:Strategic']),
  Q('c_st08', 'transferability', 'skill_transfer', '현재 직무 경험이 목표 직무에서 차별화 요소가 될 수 있다.', false, ['SP:Strategic']),
  Q('c_st09', 'transferability', 'skill_transfer', '목표 직무를 수행하는 사람과 대화하거나 정보를 수집한 적이 있다.', false, ['BT:I', 'PT:E']),
  Q('c_st10', 'transferability', 'skill_transfer', '경력 전환에 필요한 자격증이나 교육을 확인해보았다.', false, ['PT:J', 'BT:C']),
  Q('c_st11', 'transferability', 'skill_transfer', '전혀 다른 분야로의 전환도 고려 중이다.', false, ['SP:Breakthrough', 'CH:adventure']),
  Q('c_st12', 'transferability', 'skill_transfer', '역량 갭을 메우는 데 필요한 시간과 비용을 현실적으로 예측할 수 있다.', false, ['PT:S', 'PT:J', 'SP:Analytical']),

  // 3-2. 시장 적합성 (market_fit) — 12
  Q('c_mf01', 'transferability', 'market_fit', '목표 직무의 채용 시장이 활발하다고 판단한다.', false, ['PT:N']),
  Q('c_mf02', 'transferability', 'market_fit', '내 경력 수준에 맞는 포지션이 시장에 존재한다.', false, ['SP:Strategic']),
  Q('c_mf03', 'transferability', 'market_fit', '목표 직무의 평균 보상 수준을 조사해보았다.', false, ['PT:S', 'BT:C']),
  Q('c_mf04', 'transferability', 'market_fit', '나의 경력 경로가 목표 기업에서 매력적으로 보일 것이라 생각한다.', false, ['UF:self', 'BT:D']),
  Q('c_mf05', 'transferability', 'market_fit', '목표 직무에서 내 나이/경력이 유리하게 작용할 수 있다.', false, ['SP:Strategic']),
  Q('c_mf06', 'transferability', 'market_fit', '현재 산업에서 목표 산업으로 이동한 사례를 알고 있다.', false, ['PT:N']),
  Q('c_mf07', 'transferability', 'market_fit', '채용 공고를 분석하여 요구 역량을 파악해본 적이 있다.', false, ['BT:C', 'PT:J']),
  Q('c_mf08', 'transferability', 'market_fit', '내가 목표하는 포지션의 경쟁 강도를 현실적으로 인식하고 있다.', false, ['PT:S', 'UF:self']),
  Q('c_mf09', 'transferability', 'market_fit', '이직 시 보상 수준을 유지하거나 높일 수 있다고 생각한다.', false, ['BT:D']),
  Q('c_mf10', 'transferability', 'market_fit', '헤드헌터나 채용 담당자로부터 연락을 받은 경험이 있다.', false, ['BT:I']),
  Q('c_mf11', 'transferability', 'market_fit', '링크드인이나 직무 커뮤니티에서 내 프로필이 활성화되어 있다.', false, ['BT:I', 'PT:E']),
  Q('c_mf12', 'transferability', 'market_fit', '목표 기업 리스트가 구체적으로 있다.', false, ['PT:J', 'BT:C']),

  // 3-3. 적응 유연성 (adaptation) — 12
  Q('c_ad01', 'transferability', 'adaptation', '새로운 조직 문화에 적응하는 것에 자신이 있다.', false, ['UF:temperament', 'CH:growth']),
  Q('c_ad02', 'transferability', 'adaptation', '낯선 업무 방식도 빠르게 익힐 수 있다.', false, ['CH:growth', 'PT:P']),
  Q('c_ad03', 'transferability', 'adaptation', '직급이 낮아지더라도 원하는 직무라면 수용할 수 있다.', false, ['UF:self', 'BT:S']),
  Q('c_ad04', 'transferability', 'adaptation', '보상이 일시적으로 줄어도 장기적 성장 가능성을 선택할 수 있다.', false, ['PT:N', 'CH:growth']),
  Q('c_ad05', 'transferability', 'adaptation', '현재 직무의 익숙함을 포기하는 것이 두렵다.', true, ['UF:temperament', 'CH:emotional']),
  Q('c_ad06', 'transferability', 'adaptation', '이직 후 초기 적응 기간의 스트레스를 감당할 자신이 있다.', false, ['CH:emotional', 'UF:self']),
  Q('c_ad07', 'transferability', 'adaptation', '새로운 상사의 스타일에 맞추는 것에 유연하다.', false, ['BT:S', 'PT:P']),
  Q('c_ad08', 'transferability', 'adaptation', '기존 방식과 다른 업무 프로세스도 받아들일 수 있다.', false, ['PT:P', 'CH:growth']),
  Q('c_ad09', 'transferability', 'adaptation', '이직으로 인한 인간관계 변화를 감수할 준비가 되어 있다.', false, ['CH:relational', 'BT:I']),
  Q('c_ad10', 'transferability', 'adaptation', '새로운 환경에서 처음부터 신뢰를 쌓아가는 과정을 즐길 수 있다.', false, ['BT:I', 'UF:peer']),
  Q('c_ad11', 'transferability', 'adaptation', '이직 후 기대와 현실의 차이가 있을 수 있음을 인정한다.', false, ['PT:S', 'CH:emotional']),
  Q('c_ad12', 'transferability', 'adaptation', '변화 자체가 나에게 에너지를 주는 편이다.', false, ['CH:adventure', 'SP:Breakthrough']),

  // ── 모듈4: 이직 준비도 (20) ──
  // 4-1. 서류 (doc) — 5
  Q('c_dc01', 'readiness', 'doc', '최신 이력서가 준비되어 있다.', false, ['PT:J', 'BT:C']),
  Q('c_dc02', 'readiness', 'doc', '이직 사유를 긍정적이고 설득력 있게 설명할 수 있다.', false, ['BT:I', 'PT:T']),
  Q('c_dc03', 'readiness', 'doc', '포트폴리오나 성과 자료를 체계적으로 정리해두었다.', false, ['BT:C', 'PT:J']),
  Q('c_dc04', 'readiness', 'doc', '자기소개서를 목표 기업에 맞게 커스터마이즈할 수 있다.', false, ['PT:N', 'BT:C']),
  Q('c_dc05', 'readiness', 'doc', '링크드인/직무 플랫폼 프로필이 최신 상태다.', false, ['BT:I']),

  // 4-2. 면접 (interview) — 5
  Q('c_iv01', 'readiness', 'interview', '경력 기반 면접(STAR 기법)에 대비하고 있다.', false, ['BT:C', 'PT:J']),
  Q('c_iv02', 'readiness', 'interview', '"왜 이직하려 하는가"에 대한 명확한 답변이 준비되어 있다.', false, ['BT:D', 'PT:T']),
  Q('c_iv03', 'readiness', 'interview', '연봉 협상 전략이 있다.', false, ['BT:D', 'SP:Strategic']),
  Q('c_iv04', 'readiness', 'interview', '모의 면접이나 피드백을 받아본 경험이 있다.', false, ['CH:growth']),
  Q('c_iv05', 'readiness', 'interview', '면접에서 나의 강점을 구체적 사례와 함께 설명할 수 있다.', false, ['BT:I', 'SP:all']),

  // 4-3. 타이밍·실행 (timing) — 5
  Q('c_tm01', 'readiness', 'timing', '이직 시점을 전략적으로 고려하고 있다.', false, ['SP:Strategic', 'PT:J']),
  Q('c_tm02', 'readiness', 'timing', '이직 활동에 투자할 시간을 확보하고 있다.', false, ['PT:J']),
  Q('c_tm03', 'readiness', 'timing', '현 직장에서의 퇴사 절차를 계획하고 있다.', false, ['PT:J', 'CH:integrity']),
  Q('c_tm04', 'readiness', 'timing', '이직이 지연될 경우를 대비한 플랜 B가 있다.', false, ['SP:Strategic', 'PT:N']),
  Q('c_tm05', 'readiness', 'timing', '이직 기간 동안의 생활비를 감당할 재정적 여유가 있다.', false, ['PT:S']),

  // 4-4. 심리 (psychological) — 5
  Q('c_ps01', 'readiness', 'psychological', '이직 결심이 일시적 감정이 아닌 충분한 고민의 결과다.', false, ['PT:T', 'CH:emotional']),
  Q('c_ps02', 'readiness', 'psychological', '가족이나 가까운 사람이 이직 계획을 지지한다.', false, ['UF:parent', 'UF:family']),
  Q('c_ps03', 'readiness', 'psychological', '이직 과정에서 거절당해도 계속 도전할 의지가 있다.', false, ['UF:self', 'SP:Breakthrough']),
  Q('c_ps04', 'readiness', 'psychological', '이직 후 후회할 가능성에 대해 충분히 생각해보았다.', false, ['PT:T', 'PT:S']),
  Q('c_ps05', 'readiness', 'psychological', '지금이 이직할 적절한 시점이라고 확신한다.', false, ['BT:D', 'UF:self']),

  // ── 미끼 (decoy) — 2 ──
  Q('c_val01', 'decoy', 'DECOY', '나는 직장에서 단 한 번도 불만을 느낀 적이 없다.', false, []),
  Q('c_val02', 'decoy', 'DECOY', '내가 내린 결정은 항상 최선의 결과를 낳았다.', false, []),
];

// ── 섹션별 뷰 (하위 호환) ──
export const careerCapitalQuestions: CQuestion[] = cQuestions.filter(q => q.section === 'capital');
export const motivationQuestions: CQuestion[] = cQuestions.filter(q => q.section === 'motivation');
export const transferabilityQuestions: CQuestion[] = cQuestions.filter(q => q.section === 'transferability');
export const readinessQuestions: CQuestion[] = cQuestions.filter(q => q.section === 'readiness');
export const cDecoyQuestions: CQuestion[] = cQuestions.filter(q => q.section === 'decoy');

// ── 모듈 메타 (페이지 표시용) ──
// 미끼 문항은 사용자에게 별도 모듈로 노출하면 안 되므로 기존 4개 모듈에 분산 삽입.
// (채점은 question_id 기반이라 module 키와 무관)
const careerCapitalWithDecoy: CQuestion[] = [...careerCapitalQuestions, cDecoyQuestions[0]];
const readinessWithDecoy: CQuestion[] = [...readinessQuestions, cDecoyQuestions[1]];

export const hitCModules = [
  { key: 'careerCapital', label: '경력 자본', questions: careerCapitalWithDecoy, count: careerCapitalWithDecoy.length, time: 8 },
  { key: 'motivation', label: '이직 동기', questions: motivationQuestions, count: motivationQuestions.length, time: 5 },
  { key: 'transferability', label: '전직 가능성', questions: transferabilityQuestions, count: transferabilityQuestions.length, time: 7 },
  { key: 'readiness', label: '이직 준비도', questions: readinessWithDecoy, count: readinessWithDecoy.length, time: 4 },
] as const;

export const allHitCQuestions: CQuestion[] = cQuestions;
// 기존 참조 호환성 유지
export const allCQuestions = allHitCQuestions;
