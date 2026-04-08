/**
 * HIT F — 단절·재도전 검사 (경력단절·인생 재도전자)
 * 152 + 미끼 2 = 154문항 · 7점 리커트
 *
 * 모듈1: 공백 역량 발굴 (32) — disruption_context, hidden_competency, gap_activities
 * 모듈2: 경력 유효성 진단 (36) — job_viability, skill_currency, market_reentry
 * 모듈3: 심리적 회복력 (28) — self_narrative, self_esteem, retry_willingness
 * 모듈4: 재도전 방향 결정 (32) — career_restoration, career_pivot, fresh_start
 * 모듈5: 재진입 준비도 (24) — skill_update, network_status, self_presentation, field_language
 * 미끼: 2 — DECOY (validity)
 */

import type { LikertQuestion } from './personality-questions';

export type FSection =
  | 'break_context'
  | 'viability'
  | 'resilience'
  | 'direction'
  | 'readiness'
  | 'decoy';

export interface FQuestion extends LikertQuestion {
  module: 'layer_f';
  section: FSection;
  subscale: string;
  reverse: boolean;
  crossTags: string[];
}

const Q = (
  id: string,
  section: FSection,
  subscale: string,
  text: string,
  reverse: boolean,
  crossTags: string[],
): FQuestion => ({ id, module: 'layer_f', section, subscale, text, reverse, crossTags });

// ── 모듈1: 공백 역량 발굴 (32문항) ──────────────────────────────────

export const breakContextQuestions: FQuestion[] = [
  // === disruption_context (단절 맥락) — 8문항 ===
  Q('f_dc01', 'break_context', 'disruption_context', '경력 공백의 주된 이유를 명확하게 설명할 수 있다.', false, ['UF:clarity']),
  Q('f_dc02', 'break_context', 'disruption_context', '경력 단절은 나의 선택이었다(또는 불가피한 상황이었다).', false, ['UF:autonomy']),
  Q('f_dc03', 'break_context', 'disruption_context', '공백 기간 동안에도 나름의 성장을 했다고 생각한다.', false, ['SP:Growth']),
  Q('f_dc04', 'break_context', 'disruption_context', '단절 기간이 예상보다 길어졌다.', true, ['UF:security']),
  Q('f_dc05', 'break_context', 'disruption_context', '단절의 원인이 해소되었거나 해소될 전망이 있다.', false, ['UF:stability']),
  Q('f_dc06', 'break_context', 'disruption_context', '단절 기간 동안 직업 세계와 완전히 단절되었다.', true, ['UF:belonging']),
  Q('f_dc07', 'break_context', 'disruption_context', '경력 공백에 대해 부끄러움이나 죄책감을 느낀다.', true, ['CH:self_esteem']),
  Q('f_dc08', 'break_context', 'disruption_context', '단절 기간에도 업계 동향을 파악하려고 노력했다.', false, ['SP:Learning']),

  // === hidden_competency (숨겨진 역량) — 12문항 ===
  Q('f_hc01', 'break_context', 'hidden_competency', '육아/간병 경험을 통해 인내심과 위기관리 능력이 강해졌다.', false, ['SP:Resilience', 'BT:S']),
  Q('f_hc02', 'break_context', 'hidden_competency', '한정된 자원(시간, 돈, 에너지)을 효율적으로 관리하는 법을 배웠다.', false, ['SP:Execution', 'BT:C']),
  Q('f_hc03', 'break_context', 'hidden_competency', '여러 일을 동시에 처리하는 멀티태스킹 능력이 향상되었다.', false, ['SP:Execution']),
  Q('f_hc04', 'break_context', 'hidden_competency', '타인의 감정을 읽고 대응하는 능력이 성장했다.', false, ['BT:S', 'BT:I', 'CH:relational']),
  Q('f_hc05', 'break_context', 'hidden_competency', '스트레스 상황에서도 평정을 유지하는 법을 체득했다.', false, ['SP:Resilience', 'CH:emotional']),
  Q('f_hc06', 'break_context', 'hidden_competency', '문제 해결 능력이 직장 밖 경험을 통해 더 강해졌다.', false, ['SP:Thinking']),
  Q('f_hc07', 'break_context', 'hidden_competency', '의사결정을 혼자 내려야 하는 상황이 많아 결단력이 키워졌다.', false, ['BT:D', 'SP:Leadership']),
  Q('f_hc08', 'break_context', 'hidden_competency', '계획대로 되지 않을 때 유연하게 대처하는 법을 배웠다.', false, ['SP:Resilience']),
  Q('f_hc09', 'break_context', 'hidden_competency', '다양한 사람(의사, 교사, 행정기관 등)과 소통하는 경험이 늘었다.', false, ['BT:I', 'CH:relational']),
  Q('f_hc10', 'break_context', 'hidden_competency', '단절 기간 동안 자기 자신에 대해 더 깊이 이해하게 되었다.', false, ['CH:self_awareness', 'UF:clarity']),
  Q('f_hc11', 'break_context', 'hidden_competency', '새로운 분야(IT, 온라인 마켓, 부동산 등)를 독학한 경험이 있다.', false, ['SP:Learning']),
  Q('f_hc12', 'break_context', 'hidden_competency', '직장 밖에서 쌓은 역량을 이력서에 어떻게 쓸지 모르겠다.', true, ['UF:clarity']),

  // === gap_activities (공백 기간 활동) — 12문항 ===
  Q('f_ga01', 'break_context', 'gap_activities', '공백 기간 동안 자격증, 수료증 등을 취득한 적이 있다.', false, ['SP:Learning']),
  Q('f_ga02', 'break_context', 'gap_activities', '봉사활동이나 커뮤니티 활동에 참여한 경험이 있다.', false, ['BT:S', 'UF:belonging']),
  Q('f_ga03', 'break_context', 'gap_activities', '프리랜서, 부업, 아르바이트 등 수입 활동을 한 적이 있다.', false, ['UF:income']),
  Q('f_ga04', 'break_context', 'gap_activities', '온라인 강좌나 교육 프로그램을 수강한 적이 있다.', false, ['SP:Learning']),
  Q('f_ga05', 'break_context', 'gap_activities', '직접 사업을 시도해본 적이 있다(규모 무관).', false, ['BT:D', 'UF:autonomy']),
  Q('f_ga06', 'break_context', 'gap_activities', '블로그, SNS, 유튜브 등 콘텐츠를 만든 경험이 있다.', false, ['SP:Expression']),
  Q('f_ga07', 'break_context', 'gap_activities', '건강 관리(운동, 식단 등)에 집중한 시간이 있었다.', false, ['SP:Resilience']),
  Q('f_ga08', 'break_context', 'gap_activities', '독서, 학습 등 자기계발에 시간을 투자했다.', false, ['SP:Learning', 'SP:Growth']),
  Q('f_ga09', 'break_context', 'gap_activities', '가족이나 주변 사람의 문제를 해결하는 역할을 했다.', false, ['BT:S', 'CH:relational']),
  Q('f_ga10', 'break_context', 'gap_activities', '공백 기간에 아무것도 하지 못했다는 느낌이 있다.', true, ['CH:self_esteem']),
  Q('f_ga11', 'break_context', 'gap_activities', '단절 기간의 경험을 긍정적으로 프레이밍할 수 있다.', false, ['SP:Resilience', 'UF:clarity']),
  Q('f_ga12', 'break_context', 'gap_activities', '공백 기간 활동이 향후 경력에 도움이 될 것이라 생각한다.', false, ['SP:Growth']),
];

// ── 모듈2: 경력 유효성 진단 (36문항) ───────────────────────────────

export const viabilityQuestions: FQuestion[] = [
  // === job_viability (직무 유효성) — 12문항 ===
  Q('f_jv01', 'viability', 'job_viability', '단절 전 직무가 현재 시장에서도 존재한다.', false, ['UF:security']),
  Q('f_jv02', 'viability', 'job_viability', '해당 직무의 채용 공고를 최근에 확인해보았다.', false, ['SP:Execution']),
  Q('f_jv03', 'viability', 'job_viability', '단절 전 직무의 핵심 업무 내용이 크게 변하지 않았다.', false, ['UF:stability']),
  Q('f_jv04', 'viability', 'job_viability', '해당 분야에서 요구하는 새로운 기술/도구가 많아졌다.', true, ['SP:Learning']),
  Q('f_jv05', 'viability', 'job_viability', '단절 전 보유했던 자격증이나 인증이 여전히 유효하다.', false, ['UF:security']),
  Q('f_jv06', 'viability', 'job_viability', '같은 직무를 다시 할 수 있는 자신감이 있다.', false, ['CH:self_esteem']),
  Q('f_jv07', 'viability', 'job_viability', '공백 기간 동안 해당 분야의 변화를 어느 정도 파악하고 있다.', false, ['SP:Learning']),
  Q('f_jv08', 'viability', 'job_viability', '단절 전 직무 경험이 3년 이상이었다.', false, ['SP:Expertise']),
  Q('f_jv09', 'viability', 'job_viability', '해당 직무의 전문 용어와 업무 프로세스를 여전히 기억한다.', false, ['SP:Expertise']),
  Q('f_jv10', 'viability', 'job_viability', '복귀한다면 교육 없이 바로 업무에 투입될 수 있다.', false, ['SP:Execution']),
  Q('f_jv11', 'viability', 'job_viability', '해당 분야에서 나의 경력 수준(연차)이 경쟁력이 있다.', false, ['SP:Expertise']),
  Q('f_jv12', 'viability', 'job_viability', '단절 기간이 3년 이상이다.', true, ['UF:stability']),

  // === skill_currency (스킬 현재성) — 12문항 ===
  Q('f_sc01', 'viability', 'skill_currency', '단절 전에 사용하던 도구/소프트웨어를 여전히 다룰 수 있다.', false, ['SP:Expertise']),
  Q('f_sc02', 'viability', 'skill_currency', '해당 분야에서 새로 등장한 도구/기술을 알고 있다.', false, ['SP:Learning']),
  Q('f_sc03', 'viability', 'skill_currency', '새 도구를 배우는 데 걸리는 시간을 현실적으로 예측할 수 있다.', false, ['SP:Thinking']),
  Q('f_sc04', 'viability', 'skill_currency', '기술 변화 속도가 빨라 따라잡기 어렵다고 느낀다.', true, ['SP:Resilience']),
  Q('f_sc05', 'viability', 'skill_currency', '단절 기간에도 관련 기술을 부분적으로 유지했다.', false, ['SP:Learning']),
  Q('f_sc06', 'viability', 'skill_currency', '업데이트가 필요한 스킬 목록을 구체적으로 작성할 수 있다.', false, ['SP:Execution']),
  Q('f_sc07', 'viability', 'skill_currency', '스킬 업데이트를 위한 교육 프로그램을 찾아본 적이 있다.', false, ['SP:Learning']),
  Q('f_sc08', 'viability', 'skill_currency', '기본기(core fundamentals)는 변하지 않아 여전히 유효하다.', false, ['SP:Expertise']),
  Q('f_sc09', 'viability', 'skill_currency', '디지털 리터러시(기본 IT 활용 능력)에 자신이 있다.', false, ['SP:Expertise']),
  Q('f_sc10', 'viability', 'skill_currency', '산업 전체가 구조적으로 변해 기존 스킬이 무의미해졌다.', true, ['UF:security']),
  Q('f_sc11', 'viability', 'skill_currency', '스킬 갭을 6개월 이내에 메울 수 있다고 생각한다.', false, ['SP:Growth']),
  Q('f_sc12', 'viability', 'skill_currency', '현장 언어(업계 용어, 약어 등)가 낯설어졌다.', true, ['SP:Expertise']),

  // === market_reentry (시장 재진입) — 12문항 ===
  Q('f_mr01', 'viability', 'market_reentry', '경력 단절자를 채용하는 기업이나 프로그램이 있다는 것을 안다.', false, ['UF:belonging']),
  Q('f_mr02', 'viability', 'market_reentry', '재취업 지원 프로그램(정부, 기관)을 알아본 적이 있다.', false, ['SP:Execution']),
  Q('f_mr03', 'viability', 'market_reentry', '단절 전 업계에 아직 연락 가능한 사람이 있다.', false, ['UF:belonging']),
  Q('f_mr04', 'viability', 'market_reentry', '채용 시장에서 경력 단절에 대한 인식이 예전보다 나아졌다고 느낀다.', false, ['UF:stability']),
  Q('f_mr05', 'viability', 'market_reentry', '파트타임이나 계약직으로라도 복귀할 의지가 있다.', false, ['UF:income']),
  Q('f_mr06', 'viability', 'market_reentry', '단절 전보다 낮은 직급/급여도 수용할 수 있다.', false, ['UF:autonomy']),
  Q('f_mr07', 'viability', 'market_reentry', '새로운 분야로의 전환도 열려 있다.', false, ['BT:D', 'SP:Growth']),
  Q('f_mr08', 'viability', 'market_reentry', '내 경력 공백을 긍정적으로 설명할 수 있는 스토리가 있다.', false, ['SP:Expression', 'UF:clarity']),
  Q('f_mr09', 'viability', 'market_reentry', '재취업에 성공한 비슷한 상황의 롤모델이 있다.', false, ['UF:belonging']),
  Q('f_mr10', 'viability', 'market_reentry', '현재 거주 지역에서 재취업 기회가 충분하다.', false, ['UF:security']),
  Q('f_mr11', 'viability', 'market_reentry', '원격 근무(재택근무) 포지션도 적극 고려하고 있다.', false, ['UF:autonomy']),
  Q('f_mr12', 'viability', 'market_reentry', '재취업이 현실적으로 어렵다고 느낀다.', true, ['CH:self_esteem']),
];

// ── 모듈3: 심리적 회복력 (28문항) ──────────────────────────────────

export const resilienceQuestions: FQuestion[] = [
  // === self_narrative (자기 서사) — 10문항 ===
  Q('f_sn01', 'resilience', 'self_narrative', '경력 단절/실패를 내 탓으로만 돌리지 않는다.', false, ['CH:self_esteem', 'SP:Resilience']),
  Q('f_sn02', 'resilience', 'self_narrative', '이 경험을 통해 더 강해졌다고 느낀다.', false, ['SP:Resilience']),
  Q('f_sn03', 'resilience', 'self_narrative', '내 이야기를 부끄러워하지 않고 말할 수 있다.', false, ['CH:self_esteem', 'SP:Expression']),
  Q('f_sn04', 'resilience', 'self_narrative', '단절 전의 나보다 지금의 내가 더 나은 부분이 있다.', false, ['SP:Growth']),
  Q('f_sn05', 'resilience', 'self_narrative', '실패한 경험에서 구체적으로 배운 교훈이 있다.', false, ['SP:Learning']),
  Q('f_sn06', 'resilience', 'self_narrative', '다른 사람의 시선이 두려워 재도전을 망설인다.', true, ['CH:emotional']),
  Q('f_sn07', 'resilience', 'self_narrative', '내 가치가 직업적 성공에만 달려있지 않다고 믿는다.', false, ['UF:meaning']),
  Q('f_sn08', 'resilience', 'self_narrative', '과거의 경력을 흑역사가 아닌 자산으로 본다.', false, ['SP:Resilience', 'UF:clarity']),
  Q('f_sn09', 'resilience', 'self_narrative', '지금의 상황이 영원히 계속되지는 않을 것이다.', false, ['SP:Resilience']),
  Q('f_sn10', 'resilience', 'self_narrative', '나를 긍정적으로 평가해주는 사람이 주변에 있다.', false, ['UF:belonging', 'BT:S']),

  // === self_esteem (자존감) — 8문항 ===
  Q('f_se01', 'resilience', 'self_esteem', '경력 공백에도 불구하고 나는 유능한 사람이다.', false, ['CH:self_esteem']),
  Q('f_se02', 'resilience', 'self_esteem', '나를 채용하는 곳은 좋은 선택을 한 것이다.', false, ['CH:self_esteem']),
  Q('f_se03', 'resilience', 'self_esteem', '면접에서 자신 있게 나를 어필할 수 있다.', false, ['BT:D', 'SP:Expression']),
  Q('f_se04', 'resilience', 'self_esteem', '경력 단절 때문에 나는 다른 지원자보다 불리하다.', true, ['CH:self_esteem']),
  Q('f_se05', 'resilience', 'self_esteem', '내가 가진 경험의 총합은 여전히 가치가 있다.', false, ['SP:Expertise']),
  Q('f_se06', 'resilience', 'self_esteem', '나이가 들었다는 이유로 기회가 줄었다고 느낀다.', true, ['CH:self_esteem']),
  Q('f_se07', 'resilience', 'self_esteem', '새로운 환경에서도 나만의 방식으로 기여할 수 있다.', false, ['SP:Leadership', 'BT:I']),
  Q('f_se08', 'resilience', 'self_esteem', '다시 시작할 자격이 충분하다고 느낀다.', false, ['CH:self_esteem']),

  // === retry_willingness (재도전 의지) — 10문항 ===
  Q('f_rw01', 'resilience', 'retry_willingness', '어떤 형태로든 다시 일하고 싶다는 의지가 강하다.', false, ['BT:D', 'SP:Execution']),
  Q('f_rw02', 'resilience', 'retry_willingness', '재도전에 대한 두려움보다 기대감이 크다.', false, ['SP:Resilience', 'BT:I']),
  Q('f_rw03', 'resilience', 'retry_willingness', '거절당해도 다시 지원할 수 있다.', false, ['SP:Resilience']),
  Q('f_rw04', 'resilience', 'retry_willingness', '작은 것부터 시작해도 괜찮다.', false, ['BT:S', 'BT:C']),
  Q('f_rw05', 'resilience', 'retry_willingness', '재도전을 위해 필요한 노력을 기꺼이 할 수 있다.', false, ['SP:Execution']),
  Q('f_rw06', 'resilience', 'retry_willingness', '실패해도 다시 도전하는 것이 포기하는 것보다 낫다.', false, ['SP:Resilience', 'BT:D']),
  Q('f_rw07', 'resilience', 'retry_willingness', '주변에서 재도전을 응원해주는 사람이 있다.', false, ['UF:belonging']),
  Q('f_rw08', 'resilience', 'retry_willingness', '구체적인 재도전 계획을 세우기 시작했다.', false, ['SP:Execution', 'BT:C']),
  Q('f_rw09', 'resilience', 'retry_willingness', '완벽하지 않아도 일단 시작하는 것이 중요하다고 생각한다.', false, ['BT:D', 'SP:Execution']),
  Q('f_rw10', 'resilience', 'retry_willingness', '3개월 이내에 구체적인 행동을 시작할 수 있다.', false, ['SP:Execution']),
];

// ── 모듈4: 재도전 방향 결정 (32문항) ───────────────────────────────

export const directionQuestions: FQuestion[] = [
  // === career_restoration (경력 복원) — 10문항 ===
  Q('f_cr01', 'direction', 'career_restoration', '단절 전과 같은 직무로 돌아가고 싶다.', false, ['UF:security']),
  Q('f_cr02', 'direction', 'career_restoration', '기존 경력을 살려 같은 업계에서 재취업하고 싶다.', false, ['UF:security', 'SP:Expertise']),
  Q('f_cr03', 'direction', 'career_restoration', '이전 직장(또는 비슷한 곳)에 복귀할 수 있다면 좋겠다.', false, ['UF:belonging']),
  Q('f_cr04', 'direction', 'career_restoration', '경력 공백을 메우고 원래 경력 트랙으로 돌아가고 싶다.', false, ['UF:stability']),
  Q('f_cr05', 'direction', 'career_restoration', '기존 전문성을 유지하고 발전시키는 것이 최선이다.', false, ['SP:Expertise']),
  Q('f_cr06', 'direction', 'career_restoration', '이전 분야의 사람들과 다시 연결되고 싶다.', false, ['UF:belonging', 'BT:I']),
  Q('f_cr07', 'direction', 'career_restoration', '경력 단절 전의 직급/보상 수준을 회복하고 싶다.', false, ['UF:income']),
  Q('f_cr08', 'direction', 'career_restoration', '기존 경력이 나의 정체성의 핵심이다.', false, ['UF:clarity']),
  Q('f_cr09', 'direction', 'career_restoration', '같은 분야에서 최신 기술/트렌드를 빠르게 따라잡을 수 있다.', false, ['SP:Learning']),
  Q('f_cr10', 'direction', 'career_restoration', '복귀 후 단절 전보다 더 잘할 자신이 있다.', false, ['CH:self_esteem', 'SP:Growth']),

  // === career_pivot (경력 전환) — 12문항 ===
  Q('f_cp01', 'direction', 'career_pivot', '이전과는 다른 분야에서 새로 시작하고 싶다.', false, ['BT:D', 'SP:Growth']),
  Q('f_cp02', 'direction', 'career_pivot', '단절 기간에 새롭게 관심이 생긴 분야가 있다.', false, ['BT:I', 'SP:Learning']),
  Q('f_cp03', 'direction', 'career_pivot', '이전 직무의 한계를 절감했기 때문에 전환이 필요하다.', false, ['UF:meaning']),
  Q('f_cp04', 'direction', 'career_pivot', '새로운 분야를 배우는 것이 기존 분야로 돌아가는 것보다 끌린다.', false, ['SP:Learning']),
  Q('f_cp05', 'direction', 'career_pivot', '기존 역량의 일부를 새 분야에 융합할 수 있다.', false, ['SP:Expertise', 'SP:Growth']),
  Q('f_cp06', 'direction', 'career_pivot', '전환하고 싶은 구체적인 직무나 산업이 있다.', false, ['SP:Execution']),
  Q('f_cp07', 'direction', 'career_pivot', '급여가 줄더라도 하고 싶은 일을 선택하겠다.', false, ['UF:meaning', 'UF:autonomy']),
  Q('f_cp08', 'direction', 'career_pivot', '단절이 오히려 새로운 방향을 발견하는 계기가 되었다.', false, ['SP:Growth']),
  Q('f_cp09', 'direction', 'career_pivot', '기존 경력에 미련이 없다.', false, ['UF:autonomy']),
  Q('f_cp10', 'direction', 'career_pivot', '인턴이나 수습 과정부터 다시 시작할 수 있다.', false, ['BT:S', 'CH:growth']),
  Q('f_cp11', 'direction', 'career_pivot', '새 분야에서 경쟁력을 갖추기 위한 교육 계획이 있다.', false, ['SP:Learning', 'SP:Execution']),
  Q('f_cp12', 'direction', 'career_pivot', '이전 경력과 전혀 무관한 일도 해볼 의지가 있다.', false, ['BT:D', 'UF:autonomy']),

  // === fresh_start (새 출발) — 10문항 ===
  Q('f_fs01', 'direction', 'fresh_start', '직장 생활이 아닌 다른 삶의 형태(창업, 프리랜서, 자영업)를 원한다.', false, ['UF:autonomy', 'BT:D']),
  Q('f_fs02', 'direction', 'fresh_start', '과거 경력을 깨끗이 잊고 완전히 다시 시작하고 싶다.', false, ['UF:autonomy']),
  Q('f_fs03', 'direction', 'fresh_start', '직업 자체보다 삶의 질과 행복이 더 중요하다.', false, ['UF:meaning']),
  Q('f_fs04', 'direction', 'fresh_start', '기존의 성공 기준과 다른 나만의 기준을 만들고 싶다.', false, ['UF:meaning', 'UF:clarity']),
  Q('f_fs05', 'direction', 'fresh_start', '돈보다 의미 있는 일을 하고 싶다.', false, ['UF:meaning']),
  Q('f_fs06', 'direction', 'fresh_start', '조직에 소속되지 않고 독립적으로 살고 싶다.', false, ['UF:autonomy']),
  Q('f_fs07', 'direction', 'fresh_start', '이전 삶과 완전히 다른 환경(지역, 국가)에서 새 출발하고 싶다.', false, ['UF:autonomy']),
  Q('f_fs08', 'direction', 'fresh_start', '사회적 기대나 체면보다 내면의 소리를 따르겠다.', false, ['UF:meaning', 'UF:clarity']),
  Q('f_fs09', 'direction', 'fresh_start', '작은 규모라도 내가 주인인 일을 하고 싶다.', false, ['UF:autonomy', 'BT:D']),
  Q('f_fs10', 'direction', 'fresh_start', '단절을 통해 인생에서 정말 중요한 것이 무엇인지 알게 되었다.', false, ['UF:meaning', 'SP:Growth']),
];

// ── 모듈5: 재진입 준비도 (24문항) ──────────────────────────────────

export const readinessQuestions: FQuestion[] = [
  // === skill_update (스킬 업데이트) — 6문항 ===
  Q('f_su01', 'readiness', 'skill_update', '복귀에 필요한 핵심 스킬을 파악하고 있다.', false, ['SP:Execution', 'SP:Learning']),
  Q('f_su02', 'readiness', 'skill_update', '스킬 업데이트를 위한 교육/학습을 시작했다(또는 계획이 있다).', false, ['SP:Learning']),
  Q('f_su03', 'readiness', 'skill_update', '온라인 교육 플랫폼을 활용하여 학습할 수 있다.', false, ['SP:Learning']),
  Q('f_su04', 'readiness', 'skill_update', '실무 감각을 되살리기 위한 구체적인 방법이 있다.', false, ['SP:Execution']),
  Q('f_su05', 'readiness', 'skill_update', '학습에 투자할 시간과 비용을 확보하고 있다.', false, ['UF:income', 'UF:stability']),
  Q('f_su06', 'readiness', 'skill_update', '현재 기술 수준으로는 바로 복귀하기 어렵다.', true, ['SP:Expertise']),

  // === network_status (네트워크 상태) — 6문항 ===
  Q('f_ns01', 'readiness', 'network_status', '단절 전 인맥 중 연락 가능한 사람이 있다.', false, ['UF:belonging']),
  Q('f_ns02', 'readiness', 'network_status', '새로운 인맥을 만들기 위한 활동을 하고 있다.', false, ['BT:I', 'SP:Expression']),
  Q('f_ns03', 'readiness', 'network_status', '재취업 관련 커뮤니티나 모임에 참여하고 있다.', false, ['BT:S', 'UF:belonging']),
  Q('f_ns04', 'readiness', 'network_status', '도움을 요청하는 것이 어렵지 않다.', false, ['BT:I', 'BT:S']),
  Q('f_ns05', 'readiness', 'network_status', '경력 단절자 대상 프로그램(정부지원 등)을 알고 있다.', false, ['SP:Execution']),
  Q('f_ns06', 'readiness', 'network_status', '사회적으로 고립된 느낌이 있다.', true, ['UF:belonging', 'CH:emotional']),

  // === self_presentation (자기 표현) — 6문항 ===
  Q('f_sp01', 'readiness', 'self_presentation', '경력 공백을 자연스럽고 긍정적으로 설명할 수 있다.', false, ['SP:Expression', 'UF:clarity']),
  Q('f_sp02', 'readiness', 'self_presentation', '이력서에 공백 기간을 어떻게 채울지 알고 있다.', false, ['SP:Execution']),
  Q('f_sp03', 'readiness', 'self_presentation', '면접에서 "왜 다시 일하려 하는가"에 설득력 있게 답할 수 있다.', false, ['SP:Expression', 'BT:I']),
  Q('f_sp04', 'readiness', 'self_presentation', '나의 강점을 3가지 이상 명확하게 말할 수 있다.', false, ['UF:clarity', 'CH:self_esteem']),
  Q('f_sp05', 'readiness', 'self_presentation', '경력 단절이 오히려 나를 더 매력적인 후보로 만들 수 있다.', false, ['SP:Resilience', 'CH:self_esteem']),
  Q('f_sp06', 'readiness', 'self_presentation', '포트폴리오나 성과 자료를 정리할 수 있다.', false, ['SP:Execution']),

  // === field_language (현장 언어) — 6문항 ===
  Q('f_fl01', 'readiness', 'field_language', '목표 분야의 최신 트렌드와 키워드를 알고 있다.', false, ['SP:Learning']),
  Q('f_fl02', 'readiness', 'field_language', '업계 뉴스나 미디어를 정기적으로 확인한다.', false, ['SP:Learning']),
  Q('f_fl03', 'readiness', 'field_language', '업무 관련 대화에서 자연스럽게 참여할 수 있다.', false, ['SP:Expression', 'BT:I']),
  Q('f_fl04', 'readiness', 'field_language', '채용 공고의 요구사항을 정확하게 이해할 수 있다.', false, ['SP:Expertise']),
  Q('f_fl05', 'readiness', 'field_language', '업계 커뮤니티의 토론이나 글을 이해하는 데 어려움이 없다.', false, ['SP:Expertise']),
  Q('f_fl06', 'readiness', 'field_language', '단절 기간이 길어져 현장 감각이 많이 떨어졌다.', true, ['SP:Expertise']),
];

// ── 미끼 (Validity) 2문항 ────────────────────────────────────────

export const decoyFQuestions: FQuestion[] = [
  Q('f_val01', 'decoy', 'DECOY', '나는 항상 모든 사람에게 100% 솔직하게 말한다.', false, []),
  Q('f_val02', 'decoy', 'DECOY', '나는 지금까지 단 한 번도 실수를 한 적이 없다.', false, []),
];

// ── 전체 통합 export ──────────────────────────────────────────────

export const fQuestions: FQuestion[] = [
  ...breakContextQuestions,
  ...viabilityQuestions,
  ...resilienceQuestions,
  ...directionQuestions,
  ...readinessQuestions,
  ...decoyFQuestions,
];

/** @deprecated fQuestions 사용 권장 */
export const allHitFQuestions = fQuestions;
/** @deprecated fQuestions 사용 권장 */
export const allFQuestions = fQuestions;

/**
 * 채점 모듈 배열 (FModuleKey 대응)
 */
export const hitFModules = [
  { key: 'break_context', questions: breakContextQuestions },
  { key: 'viability',     questions: viabilityQuestions },
  { key: 'resilience',    questions: resilienceQuestions },
  { key: 'direction',     questions: directionQuestions },
  { key: 'readiness',     questions: readinessQuestions },
] as const;
