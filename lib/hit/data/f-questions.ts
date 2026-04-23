/**
 * HIT F — 경력단절·재도전검사
 * 152문항 + 미끼 2 = 154문항 · 7점 리커트
 * HIT_F_Final.md 설계서 기준 (확정판)
 *
 * 모듈1: 공백 역량 발굴 latent_capability (32)
 *   - disruption_context 12 + hidden_competency 10 + gap_activities 10
 * 모듈2: 경력 유효성 CVI career_viability (36)
 *   - job_viability 12 + skill_currency 12 + market_reentry 12
 * 모듈3: 심리적 회복력 resilience (28)
 *   - self_narrative 10 + self_esteem 8 + retry_willingness 10
 * 모듈4: 재도전 방향 direction_bifurcation (32)
 *   - career_restoration 12 + career_pivot 10 + fresh_start 10
 * 모듈5: 재진입 준비도 reentry_readiness (24)
 *   - skill_update 6 + network 6 + self_presentation 6 + field_language 6
 * 미끼: 2 (f_val01 @ 45번째, f_val02 @ 110번째)
 */

import type { LikertQuestion } from '@/types/hit';

export type FSection =
  | 'latent_capability'
  | 'career_viability'
  | 'resilience'
  | 'direction_bifurcation'
  | 'reentry_readiness'
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

// 1-1. 단절 맥락 (disruption_context) — 12문항
const disruptionContextQuestions: FQuestion[] = [
  Q('f_dc01', 'latent_capability', 'disruption_context', '경력 단절의 사유를 객관적으로 설명할 수 있다.', false, ['PT:T', 'BT:C']),
  Q('f_dc02', 'latent_capability', 'disruption_context', '단절 기간이 나에게 부정적 영향만 준 것은 아니다.', false, ['UF:trauma(PTG)']),
  Q('f_dc03', 'latent_capability', 'disruption_context', '단절 기간 동안 내가 선택한 것이 있다(돌봄, 학습, 치유 등).', false, ['UF:self', 'SP:Guard']),
  Q('f_dc04', 'latent_capability', 'disruption_context', '단절의 이유를 타인에게 솔직하게 말할 수 있다.', false, ['CH:integrity', 'BT:I']),
  Q('f_dc05', 'latent_capability', 'disruption_context', '경력 단절이 나의 전문성을 완전히 무효화시켰다고 생각한다.', true, ['UF:self']),
  Q('f_dc06', 'latent_capability', 'disruption_context', '단절 기간이 길어질수록 복귀가 어려워진다는 두려움이 있다.', true, ['CH:emotional']),
  Q('f_dc07', 'latent_capability', 'disruption_context', '단절 기간을 "공백"이 아닌 "다른 경험"으로 설명할 수 있다.', false, ['UF:trauma(PTG)', 'SP:Creativity']),
  Q('f_dc08', 'latent_capability', 'disruption_context', '비자발적 단절(해고, 질병 등)의 상처를 어느 정도 극복했다.', false, ['UF:trauma', 'CH:emotional']),
  Q('f_dc09', 'latent_capability', 'disruption_context', '단절 전 마지막 직무에서의 경험이 여전히 가치 있다고 느낀다.', false, ['SP:Guard', 'UF:self']),
  Q('f_dc10', 'latent_capability', 'disruption_context', '단절 기간 동안 사회적 고립을 경험했다.', true, ['UF:peer', 'CH:emotional']),
  Q('f_dc11', 'latent_capability', 'disruption_context', '단절의 원인이 해소되었거나 관리 가능한 상태다.', false, ['CH:emotional']),
  Q('f_dc12', 'latent_capability', 'disruption_context', '복귀 시점을 스스로 결정할 수 있는 상황이다.', false, ['BT:D', 'UF:self']),
];

// 1-2. 비공식 역량 (hidden_competency) — 10문항
const hiddenCompetencyQuestions: FQuestion[] = [
  Q('f_hc01', 'latent_capability', 'hidden_competency', '경력 단절 기간에도 새로운 것을 배운 경험이 있다.', false, ['CH:growth', 'SP:Creativity']),
  Q('f_hc02', 'latent_capability', 'hidden_competency', '돌봄(육아, 간병)을 통해 인내력과 멀티태스킹 능력이 향상되었다.', false, ['BT:S', 'SP:Execution']),
  Q('f_hc03', 'latent_capability', 'hidden_competency', '가사 관리나 가정 운영에서 기획·조직·예산 관리 역량을 발휘했다.', false, ['SP:Analytical', 'PT:J']),
  Q('f_hc04', 'latent_capability', 'hidden_competency', '자원봉사, 커뮤니티 활동 등을 통해 사회적 스킬을 유지했다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('f_hc05', 'latent_capability', 'hidden_competency', '건강 회복 과정에서 자기 관리 능력이 강화되었다.', false, ['UF:trauma(PTG)', 'CH:emotional']),
  Q('f_hc06', 'latent_capability', 'hidden_competency', '독학이나 온라인 학습으로 새로운 스킬을 습득했다.', false, ['CH:growth']),
  Q('f_hc07', 'latent_capability', 'hidden_competency', '창작, 글쓰기, 디자인 등 개인 프로젝트를 수행했다.', false, ['AP:A', 'SP:Creativity']),
  Q('f_hc08', 'latent_capability', 'hidden_competency', '단절 기간의 경험이 이전 직무에서 얻지 못한 관점을 주었다.', false, ['PT:N', 'SP:Strategic']),
  Q('f_hc09', 'latent_capability', 'hidden_competency', '나의 비공식 경험이 고용주에게 가치 있을 수 있다고 생각한다.', false, ['UF:self']),
  Q('f_hc10', 'latent_capability', 'hidden_competency', '단절 기간 동안 아무런 성장이 없었다고 느낀다.', true, ['UF:self', 'CH:emotional']),
];

// 1-3. 공백 기간 활동 (gap_activities) — 10문항
const gapActivitiesQuestions: FQuestion[] = [
  Q('f_ga01', 'latent_capability', 'gap_activities', '단절 기간에 자격증, 교육, 수료 등을 취득했다.', false, ['CH:growth', 'PT:J']),
  Q('f_ga02', 'latent_capability', 'gap_activities', '프리랜서, 아르바이트, 단기 프로젝트 등으로 업무 감각을 유지했다.', false, ['SP:Execution']),
  Q('f_ga03', 'latent_capability', 'gap_activities', '직무 관련 커뮤니티나 네트워크에 참여했다.', false, ['BT:I']),
  Q('f_ga04', 'latent_capability', 'gap_activities', '업계 동향을 꾸준히 파악하고 있었다.', false, ['PT:N', 'SP:Strategic']),
  Q('f_ga05', 'latent_capability', 'gap_activities', '단절 기간에 내가 한 활동을 이력서에 포함시킬 수 있다.', false, ['BT:C', 'UF:self']),
  Q('f_ga06', 'latent_capability', 'gap_activities', '개인 블로그, SNS, 포트폴리오 등으로 존재감을 유지했다.', false, ['BT:I', 'PT:E']),
  Q('f_ga07', 'latent_capability', 'gap_activities', '건강 관리, 체력 회복 등 복귀를 위한 기반을 다졌다.', false, ['CH:integrity']),
  Q('f_ga08', 'latent_capability', 'gap_activities', '완전히 쉬면서 충전한 시간도 의미 있었다.', false, ['UF:trauma', 'CH:emotional']),
  Q('f_ga09', 'latent_capability', 'gap_activities', '복귀를 위한 구체적 준비 활동을 시작했다.', false, ['SP:Execution', 'PT:J']),
  Q('f_ga10', 'latent_capability', 'gap_activities', '단절 기간을 전혀 활용하지 못하고 시간만 흘렀다.', true, ['CH:emotional', 'UF:self']),
];

export const latentCapabilityQuestions: FQuestion[] = [
  ...disruptionContextQuestions,
  ...hiddenCompetencyQuestions,
  ...gapActivitiesQuestions,
];

// ── 모듈2: 경력 유효성 CVI (36문항) ──────────────────────────────────

// 2-1. 직무 유효성 (job_viability) — 12문항
const jobViabilityQuestions: FQuestion[] = [
  Q('f_jv01', 'career_viability', 'job_viability', '이전 직무가 현재 시장에서도 존재한다.', false, ['PT:S', 'SP:Strategic']),
  Q('f_jv02', 'career_viability', 'job_viability', '이전 직무의 채용 공고를 최근 확인한 적이 있다.', false, ['PT:J', 'BT:C']),
  Q('f_jv03', 'career_viability', 'job_viability', '이전 직무가 AI·자동화로 크게 변하지 않았다.', false, ['PT:N', 'SP:Strategic']),
  Q('f_jv04', 'career_viability', 'job_viability', '이전 업종이 성장세이거나 최소한 유지 중이다.', false, ['PT:N']),
  Q('f_jv05', 'career_viability', 'job_viability', '이전 직무와 동일한 직함의 포지션이 시장에 있다.', false, ['SP:Strategic']),
  Q('f_jv06', 'career_viability', 'job_viability', '이전 직무의 요구 역량이 크게 바뀌지 않았다.', false, ['SP:Guard']),
  Q('f_jv07', 'career_viability', 'job_viability', '이전 직장이나 유사 기업이 여전히 건재하다.', false, ['PT:S']),
  Q('f_jv08', 'career_viability', 'job_viability', '이전 직무의 핵심 업무 방식이 근본적으로 바뀌었다.', true, ['PT:N']),
  Q('f_jv09', 'career_viability', 'job_viability', '내가 했던 업무를 다시 설명하면 현재 고용주도 이해할 것이다.', false, ['BT:I', 'PT:T']),
  Q('f_jv10', 'career_viability', 'job_viability', '이전 직무 경험이 "경력"으로 인정받을 수 있다고 확신한다.', false, ['UF:self']),
  Q('f_jv11', 'career_viability', 'job_viability', '단절 기간이 채용 과정에서 불이익이 될 것이 걱정된다.', true, ['CH:emotional']),
  Q('f_jv12', 'career_viability', 'job_viability', '이전 직무와 유사한 분야에서 일하고 싶다.', false, ['AP:방향유지']),
];

// 2-2. 기술 유효성 (skill_currency) — 12문항
const skillCurrencyQuestions: FQuestion[] = [
  Q('f_sc01', 'career_viability', 'skill_currency', '이전 직무에서 사용하던 도구와 기술을 지금도 다룰 수 있다.', false, ['SP:Execution', 'BT:C']),
  Q('f_sc02', 'career_viability', 'skill_currency', '이전 직무의 새로운 도구·기술·트렌드를 파악하고 있다.', false, ['CH:growth', 'PT:N']),
  Q('f_sc03', 'career_viability', 'skill_currency', '단절 기간 동안 업무 관련 스킬이 눈에 띄게 퇴화했다고 느낀다.', true, ['UF:self']),
  Q('f_sc04', 'career_viability', 'skill_currency', '새로운 업무 도구를 빠르게 배울 수 있다는 자신감이 있다.', false, ['CH:growth', 'SP:Creativity']),
  Q('f_sc05', 'career_viability', 'skill_currency', '이전에 쌓은 전문 지식이 여전히 유효하다.', false, ['SP:Guard']),
  Q('f_sc06', 'career_viability', 'skill_currency', '업계의 기술 변화 속도가 나의 공백 기간보다 빠르다.', true, ['PT:N']),
  Q('f_sc07', 'career_viability', 'skill_currency', '복귀 전 업데이트해야 할 기술 목록을 파악하고 있다.', false, ['PT:J', 'BT:C']),
  Q('f_sc08', 'career_viability', 'skill_currency', '이전 직무의 "하드 스킬"보다 "소프트 스킬"이 더 유효하다고 본다.', false, ['SP:Interpersonal']),
  Q('f_sc09', 'career_viability', 'skill_currency', '관련 자격증이나 인증이 유효 기간 내에 있다.', false, ['BT:C']),
  Q('f_sc10', 'career_viability', 'skill_currency', '단절 기간에 관련 분야 공부를 계속했다.', false, ['CH:growth']),
  Q('f_sc11', 'career_viability', 'skill_currency', '기술 격차를 메우는 데 3개월이면 충분하다고 생각한다.', false, ['UF:self']),
  Q('f_sc12', 'career_viability', 'skill_currency', '기술적으로 완전히 뒤처져서 처음부터 다시 배워야 한다고 느낀다.', true, ['UF:self', 'CH:emotional']),
];

// 2-3. 시장 재진입 가능성 (market_reentry) — 12문항
const marketReentryQuestions: FQuestion[] = [
  Q('f_mr01', 'career_viability', 'market_reentry', '경력단절자를 수용하는 기업이나 프로그램을 알고 있다.', false, ['PT:S', 'BT:C']),
  Q('f_mr02', 'career_viability', 'market_reentry', '내 분야에서 경력단절 후 복귀에 성공한 사례를 알고 있다.', false, ['PT:N']),
  Q('f_mr03', 'career_viability', 'market_reentry', '리턴십(returnship), 재취업 지원 프로그램을 탐색해보았다.', false, ['PT:J']),
  Q('f_mr04', 'career_viability', 'market_reentry', '파트타임, 계약직, 프리랜서 등 유연한 복귀 경로를 수용할 수 있다.', false, ['PT:P', 'BT:S']),
  Q('f_mr05', 'career_viability', 'market_reentry', '이전보다 낮은 직급에서 시작하는 것도 수용할 수 있다.', false, ['UF:self', 'BT:S']),
  Q('f_mr06', 'career_viability', 'market_reentry', '이전보다 낮은 보상도 수용할 수 있다.', false, ['UF:self']),
  Q('f_mr07', 'career_viability', 'market_reentry', '헤드헌터나 채용 담당자에게 연락해본 적이 있다.', false, ['BT:I', 'SP:Execution']),
  Q('f_mr08', 'career_viability', 'market_reentry', '이전 직장 동료나 업계 인맥이 아직 유효하다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('f_mr09', 'career_viability', 'market_reentry', '복귀 시점에 대한 현실적인 타임라인이 있다.', false, ['PT:J', 'SP:Strategic']),
  Q('f_mr10', 'career_viability', 'market_reentry', '채용 시장이 경력단절자에게 우호적이라고 느낀다.', false, ['PT:S']),
  Q('f_mr11', 'career_viability', 'market_reentry', '면접에서 경력 공백에 대한 설득력 있는 답변이 준비되어 있다.', false, ['BT:I', 'PT:T']),
  Q('f_mr12', 'career_viability', 'market_reentry', '아무도 나를 뽑아주지 않을 것이라는 두려움이 있다.', true, ['UF:self', 'CH:emotional']),
];

export const viabilityQuestions: FQuestion[] = [
  ...jobViabilityQuestions,
  ...skillCurrencyQuestions,
  ...marketReentryQuestions,
];

// ── 모듈3: 심리적 회복력 (28문항) ──────────────────────────────────

// 3-1. 자기 해석 방식 (self_narrative) — 10문항
const selfNarrativeQuestions: FQuestion[] = [
  Q('f_sn01', 'resilience', 'self_narrative', '경력 단절을 "실패"가 아닌 "전환"으로 해석한다.', false, ['UF:trauma(PTG)']),
  Q('f_sn02', 'resilience', 'self_narrative', '나의 가치는 직업 유무와 무관하다고 믿는다.', false, ['UF:self']),
  Q('f_sn03', 'resilience', 'self_narrative', '단절 기간에 대해 수치심보다 수용감이 크다.', false, ['UF:self', 'CH:emotional']),
  Q('f_sn04', 'resilience', 'self_narrative', '내 인생 스토리에서 단절도 의미 있는 챕터다.', false, ['UF:trauma(PTG)']),
  Q('f_sn05', 'resilience', 'self_narrative', '이 경험이 나를 더 강하게 만들었다.', false, ['UF:trauma(PTG)', 'SP:Breakthrough']),
  Q('f_sn06', 'resilience', 'self_narrative', '사람들이 내 경력 공백을 부정적으로 볼까 걱정된다.', true, ['UF:peer', 'CH:emotional']),
  Q('f_sn07', 'resilience', 'self_narrative', '경력 단절이 내 정체성에 큰 타격을 주었다.', true, ['UF:self']),
  Q('f_sn08', 'resilience', 'self_narrative', '단절 전과 후의 나는 다르지만 모두 나다.', false, ['UF:self']),
  Q('f_sn09', 'resilience', 'self_narrative', '내 이야기를 솔직하게 말하면 공감을 얻을 수 있다고 생각한다.', false, ['BT:I', 'UF:self']),
  Q('f_sn10', 'resilience', 'self_narrative', '이 경험을 다른 경력단절자에게 도움이 되도록 나눌 수 있다.', false, ['AP:S', 'SP:Harmony']),
];

// 3-2. 자존감 (self_esteem) — 8문항
const selfEsteemQuestions: FQuestion[] = [
  Q('f_se01', 'resilience', 'self_esteem', '나는 여전히 가치 있는 사람이라고 느낀다.', false, ['UF:self']),
  Q('f_se02', 'resilience', 'self_esteem', '내 능력에 대한 자신감이 단절 전과 비슷하다.', false, ['UF:self']),
  Q('f_se03', 'resilience', 'self_esteem', '일을 하지 않으면 무가치한 사람 같은 느낌이 든다.', true, ['UF:self', 'CH:emotional']),
  Q('f_se04', 'resilience', 'self_esteem', '주변 사람들이 나를 존중한다고 느낀다.', false, ['UF:peer']),
  Q('f_se05', 'resilience', 'self_esteem', '경력 단절이 내 자존감을 크게 손상시켰다.', true, ['UF:self', 'CH:emotional']),
  Q('f_se06', 'resilience', 'self_esteem', '새로운 도전을 시작할 자격이 있다고 느낀다.', false, ['UF:self', 'SP:Breakthrough']),
  Q('f_se07', 'resilience', 'self_esteem', '다른 경력단절자들과 비교하며 자괴감을 느낀다.', true, ['UF:peer', 'CH:emotional']),
  Q('f_se08', 'resilience', 'self_esteem', '나를 있는 그대로 받아들이는 편이다.', false, ['UF:self', 'CH:emotional']),
];

// 3-3. 재도전 의지 (retry_willingness) — 10문항
const retryWillingnessQuestions: FQuestion[] = [
  Q('f_rw01', 'resilience', 'retry_willingness', '다시 일을 시작할 강한 의지가 있다.', false, ['BT:D', 'SP:Breakthrough']),
  Q('f_rw02', 'resilience', 'retry_willingness', '복귀 과정의 어려움을 감당할 준비가 되어 있다.', false, ['CH:emotional', 'UF:self']),
  Q('f_rw03', 'resilience', 'retry_willingness', '거절당해도 계속 시도할 수 있다.', false, ['UF:self', 'SP:Breakthrough']),
  Q('f_rw04', 'resilience', 'retry_willingness', '작은 것부터 시작해도 괜찮다.', false, ['BT:S', 'PT:P']),
  Q('f_rw05', 'resilience', 'retry_willingness', '이전 수준을 회복하는 데 시간이 걸려도 인내할 수 있다.', false, ['CH:integrity', 'BT:S']),
  Q('f_rw06', 'resilience', 'retry_willingness', '가족이나 주변의 지지가 나의 재도전을 돕고 있다.', false, ['UF:family', 'UF:peer']),
  Q('f_rw07', 'resilience', 'retry_willingness', '재도전의 동기가 외부 압박이 아닌 내적 욕구에서 나온다.', false, ['CH:growth', 'UF:self']),
  Q('f_rw08', 'resilience', 'retry_willingness', '포기하고 싶은 순간에도 다시 일어설 수 있다.', false, ['UF:trauma(PTG)', 'SP:Breakthrough']),
  Q('f_rw09', 'resilience', 'retry_willingness', '나이나 공백 기간이 장애물이 아닌 도전 과제라고 본다.', false, ['UF:self', 'CH:growth']),
  Q('f_rw10', 'resilience', 'retry_willingness', '복귀 후 성공하면 그 경험이 누군가에게 영감이 될 수 있다.', false, ['AP:S', 'SP:Harmony']),
];

export const resilienceQuestions: FQuestion[] = [
  ...selfNarrativeQuestions,
  ...selfEsteemQuestions,
  ...retryWillingnessQuestions,
];

// ── 모듈4: 재도전 방향 결정 (32문항) ──────────────────────────────────
// 방향 에너지 분모: 복구 12×7=84, 전환 10×7=70, 새시작 10×7=70

// 4-1. 경력 복구 에너지 (career_restoration) — 12문항
const careerRestorationQuestions: FQuestion[] = [
  Q('f_cr01', 'direction_bifurcation', 'career_restoration', '이전과 동일한 직무로 복귀하고 싶다.', false, ['SP:Guard']),
  Q('f_cr02', 'direction_bifurcation', 'career_restoration', '이전 직장(또는 동종업계)에서 다시 일하고 싶다.', false, ['BT:S']),
  Q('f_cr03', 'direction_bifurcation', 'career_restoration', '이전 직무의 전문성을 회복하는 것이 현실적이라 생각한다.', false, ['SP:Guard', 'UF:self']),
  Q('f_cr04', 'direction_bifurcation', 'career_restoration', '이전 인맥을 활용하면 복귀가 수월할 것이다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('f_cr05', 'direction_bifurcation', 'career_restoration', '이전과 같은 수준의 보상을 기대한다.', false, ['BT:D']),
  Q('f_cr06', 'direction_bifurcation', 'career_restoration', '이전 직무가 나에게 가장 잘 맞는다고 여전히 믿는다.', false, ['AP:방향유지']),
  Q('f_cr07', 'direction_bifurcation', 'career_restoration', '빠르게 원래 수준으로 돌아갈 수 있다는 자신감이 있다.', false, ['UF:self', 'SP:Execution']),
  Q('f_cr08', 'direction_bifurcation', 'career_restoration', '경력 단절 전의 루틴으로 복귀하는 것이 편할 것이다.', false, ['BT:S', 'PT:J']),
  Q('f_cr09', 'direction_bifurcation', 'career_restoration', '"원래 하던 일"이 아닌 새로운 시도는 부담스럽다.', true, ['CH:growth(low)']),
  Q('f_cr10', 'direction_bifurcation', 'career_restoration', '이전 직무에 대한 열정이 아직 식지 않았다.', false, ['AP:유지']),
  Q('f_cr11', 'direction_bifurcation', 'career_restoration', '복귀 후 안정적으로 일할 수 있는 환경을 원한다.', false, ['BT:S']),
  Q('f_cr12', 'direction_bifurcation', 'career_restoration', '경력 복구가 가장 현실적이고 효율적인 선택이다.', false, ['PT:S', 'SP:Strategic']),
];

// 4-2. 직무 전환 에너지 (career_pivot) — 10문항
const careerPivotQuestions: FQuestion[] = [
  Q('f_cp01', 'direction_bifurcation', 'career_pivot', '이전 직무와 다른 분야에서 새 가능성을 탐색하고 싶다.', false, ['PT:N', 'SP:Creativity']),
  Q('f_cp02', 'direction_bifurcation', 'career_pivot', '이전 경험을 살리되 다른 역할이나 산업으로 전환하고 싶다.', false, ['SP:Strategic']),
  Q('f_cp03', 'direction_bifurcation', 'career_pivot', '경력 단절이 오히려 방향을 바꿀 기회라고 생각한다.', false, ['UF:trauma(PTG)', 'SP:Breakthrough']),
  Q('f_cp04', 'direction_bifurcation', 'career_pivot', '이전 직무에 미련은 있지만 더 나은 선택이 있을 수 있다.', false, ['PT:N']),
  Q('f_cp05', 'direction_bifurcation', 'career_pivot', '관심 있는 새 분야가 구체적으로 있다.', false, ['AP:변화방향']),
  Q('f_cp06', 'direction_bifurcation', 'career_pivot', '전환에 필요한 학습이나 자격 취득을 시작할 의지가 있다.', false, ['CH:growth', 'PT:J']),
  Q('f_cp07', 'direction_bifurcation', 'career_pivot', '이전 역량의 일부가 새 분야에서도 쓸모 있을 것이다.', false, ['SP:Strategic']),
  Q('f_cp08', 'direction_bifurcation', 'career_pivot', '보상이 줄어도 더 만족스러운 일을 선택할 수 있다.', false, ['PT:F', 'CH:ethics']),
  Q('f_cp09', 'direction_bifurcation', 'career_pivot', '전환 과정의 불확실성을 감당할 수 있다.', false, ['CH:emotional', 'SP:Breakthrough']),
  Q('f_cp10', 'direction_bifurcation', 'career_pivot', '이전과 완전히 다른 환경에서 일하는 것이 오히려 설렌다.', false, ['CH:growth']),
];

// 4-3. 완전 새 시작 에너지 (fresh_start) — 10문항
const freshStartQuestions: FQuestion[] = [
  Q('f_fs01', 'direction_bifurcation', 'fresh_start', '이전 경력과 무관하게 완전히 새로운 일을 시작하고 싶다.', false, ['SP:Breakthrough', 'PT:N']),
  Q('f_fs02', 'direction_bifurcation', 'fresh_start', '지금까지의 경력을 백지로 돌려도 괜찮다는 생각이 든다.', false, ['UF:self']),
  Q('f_fs03', 'direction_bifurcation', 'fresh_start', '나이와 경험에 구애받지 않고 초심으로 돌아갈 수 있다.', false, ['CH:growth', 'UF:self']),
  Q('f_fs04', 'direction_bifurcation', 'fresh_start', '창업이나 1인 사업에 관심이 있다.', false, ['BT:D', 'AP:E']),
  Q('f_fs05', 'direction_bifurcation', 'fresh_start', '과거의 직업적 정체성을 완전히 내려놓을 준비가 되었다.', false, ['UF:self']),
  Q('f_fs06', 'direction_bifurcation', 'fresh_start', '내가 진정으로 원하는 것을 이제야 알게 되었다.', false, ['UF:trauma(PTG)', 'AP:변화']),
  Q('f_fs07', 'direction_bifurcation', 'fresh_start', '이전 경력이 오히려 새 시작의 발목을 잡는다고 느낀다.', true, ['UF:self']),
  Q('f_fs08', 'direction_bifurcation', 'fresh_start', '처음부터 다시 배우는 과정이 두렵지 않다.', false, ['CH:growth', 'SP:Breakthrough']),
  Q('f_fs09', 'direction_bifurcation', 'fresh_start', '안정보다 진정성 있는 삶을 선택하겠다.', false, ['CH:ethics', 'PT:F']),
  Q('f_fs10', 'direction_bifurcation', 'fresh_start', '완전히 새로운 사람으로 시작하는 상상을 하면 에너지가 올라간다.', false, ['SP:Breakthrough', 'PT:N']),
];

export const directionQuestions: FQuestion[] = [
  ...careerRestorationQuestions,
  ...careerPivotQuestions,
  ...freshStartQuestions,
];

// ── 모듈5: 재진입 준비도 (24문항) ──────────────────────────────────

// 5-1. 스킬 업데이트 (skill_update) — 6문항
const skillUpdateQuestions: FQuestion[] = [
  Q('f_su01', 'reentry_readiness', 'skill_update', '복귀 대상 직무에 필요한 현재 스킬을 파악하고 있다.', false, ['PT:S', 'BT:C']),
  Q('f_su02', 'reentry_readiness', 'skill_update', '갭을 메우기 위한 학습 계획이 있다.', false, ['PT:J', 'CH:growth']),
  Q('f_su03', 'reentry_readiness', 'skill_update', '온라인 강좌, 부트캠프 등을 수강한(또는 수강 중인) 경험이 있다.', false, ['CH:growth']),
  Q('f_su04', 'reentry_readiness', 'skill_update', '새로운 디지털 도구에 대한 적응력이 있다.', false, ['CH:growth']),
  Q('f_su05', 'reentry_readiness', 'skill_update', '단기간에 집중 학습할 수 있는 환경이 확보되어 있다.', false, ['PT:J']),
  Q('f_su06', 'reentry_readiness', 'skill_update', '복귀에 필요한 기술 격차가 극복 가능한 수준이라 판단한다.', false, ['UF:self', 'SP:Strategic']),
];

// 5-2. 네트워크 (network) — 6문항
const networkQuestions: FQuestion[] = [
  Q('f_nw01', 'reentry_readiness', 'network', '이전 직장이나 업계 인맥과 연락이 가능하다.', false, ['BT:I']),
  Q('f_nw02', 'reentry_readiness', 'network', '복귀를 도와줄 멘토나 조력자가 있다.', false, ['UF:peer']),
  Q('f_nw03', 'reentry_readiness', 'network', '구직 활동에 활용할 네트워크가 충분하다.', false, ['BT:I', 'SP:Interpersonal']),
  Q('f_nw04', 'reentry_readiness', 'network', '네트워크를 재활성화하기 위한 활동을 시작했다.', false, ['BT:I', 'PT:J']),
  Q('f_nw05', 'reentry_readiness', 'network', '경력단절자 커뮤니티나 지원 모임에 참여하고 있다.', false, ['UF:peer']),
  Q('f_nw06', 'reentry_readiness', 'network', '새로운 사람과 관계를 맺는 것에 거부감이 없다.', false, ['PT:E', 'BT:I']),
];

// 5-3. 자기소개·자기표현 (self_presentation) — 6문항
const selfPresentationQuestions: FQuestion[] = [
  Q('f_sp01', 'reentry_readiness', 'self_presentation', '나를 소개할 때 경력 공백을 당당하게 설명할 수 있다.', false, ['BT:I', 'UF:self']),
  Q('f_sp02', 'reentry_readiness', 'self_presentation', '이력서에 경력 공백 기간을 어떻게 표현할지 준비되어 있다.', false, ['BT:C', 'PT:T']),
  Q('f_sp03', 'reentry_readiness', 'self_presentation', '면접에서 단절 사유를 긍정적으로 프레이밍할 수 있다.', false, ['BT:I', 'PT:T']),
  Q('f_sp04', 'reentry_readiness', 'self_presentation', '나의 강점과 차별점을 명확히 전달할 수 있다.', false, ['SP:전반', 'BT:I']),
  Q('f_sp05', 'reentry_readiness', 'self_presentation', '포트폴리오나 성과 자료를 준비하고 있다.', false, ['BT:C', 'PT:J']),
  Q('f_sp06', 'reentry_readiness', 'self_presentation', '자기 PR에 대한 자신감이 부족하다.', true, ['UF:self', 'CH:emotional']),
];

// 5-4. 현장 언어·감각 (field_language) — 6문항
const fieldLanguageQuestions: FQuestion[] = [
  Q('f_fl01', 'reentry_readiness', 'field_language', '현재 업계에서 사용하는 용어와 트렌드를 파악하고 있다.', false, ['PT:N', 'BT:C']),
  Q('f_fl02', 'reentry_readiness', 'field_language', '업무 현장의 분위기와 속도에 적응할 수 있다는 자신감이 있다.', false, ['UF:temperament', 'CH:emotional']),
  Q('f_fl03', 'reentry_readiness', 'field_language', '직장 문화(회의, 보고, 협업)에 재적응하는 데 큰 어려움은 없을 것이다.', false, ['BT:S', 'UF:temperament']),
  Q('f_fl04', 'reentry_readiness', 'field_language', '현재 고용 시장의 채용 프로세스(온라인 지원, AI 면접 등)를 이해하고 있다.', false, ['CH:growth']),
  Q('f_fl05', 'reentry_readiness', 'field_language', '복귀 후 첫 1개월이 가장 어려울 것이라 예상하고 대비하고 있다.', false, ['PT:J', 'SP:Strategic']),
  Q('f_fl06', 'reentry_readiness', 'field_language', '현장에 돌아가면 감을 빠르게 되찾을 수 있다고 생각한다.', false, ['UF:self', 'SP:Execution']),
];

export const readinessQuestions: FQuestion[] = [
  ...skillUpdateQuestions,
  ...networkQuestions,
  ...selfPresentationQuestions,
  ...fieldLanguageQuestions,
];

// ── 미끼 (Validity) 2문항 ──────────────────────────────────────────
// f_val01: 45번째 삽입, f_val02: 110번째 삽입 (설계서 기준)

export const decoyFQuestions: FQuestion[] = [
  Q('f_val01', 'decoy', 'DECOY', '나는 경력 단절 기간에 단 한 번도 불안을 느낀 적이 없다.', false, []),
  Q('f_val02', 'decoy', 'DECOY', '내가 복귀하면 모든 것이 즉시 예전처럼 될 것이다.', false, []),
];

// ── 전체 통합 export ──────────────────────────────────────────────

export const fQuestions: FQuestion[] = [
  ...latentCapabilityQuestions,  // 32
  ...viabilityQuestions,         // 36
  ...resilienceQuestions,        // 28
  ...directionQuestions,         // 32
  ...readinessQuestions,         // 24
  ...decoyFQuestions,            // 2
]; // 총 154문항

/** @deprecated fQuestions 사용 권장 */
export const allHitFQuestions = fQuestions;
/** @deprecated fQuestions 사용 권장 */
export const allFQuestions = fQuestions;

export const hitFModules = [
  { key: 'latent_capability',    questions: latentCapabilityQuestions },
  { key: 'career_viability',     questions: viabilityQuestions },
  { key: 'resilience',           questions: resilienceQuestions },
  { key: 'direction_bifurcation', questions: directionQuestions },
  { key: 'reentry_readiness',    questions: readinessQuestions },
] as const;
