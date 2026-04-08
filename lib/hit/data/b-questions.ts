/**
 * HIT B — 신입·사회초년생 기초역량 검사
 * 공통 기초역량 18문항 + 공통 준비도 32문항 = 50문항 · 7점 리커트
 * HIT_B_Final.md 설계서 기준 (확정판)
 *
 * 모듈1: 공통 기초역량 competency_core (18)
 *   - problem_solving 3 + communication 3 + initiative 3
 *     + collaboration 3 + self_management 3 + learning_agility 3
 * 모듈2: 직무별 전문역량 — 기존 DB module='competency' 트랙별 추출 (별도 파일 없음)
 * 모듈3: 공통 준비도 readiness_core (32)
 *   - self_understanding 8 + job_understanding 8
 *     + skill_readiness 8 + action_readiness 8
 */

export type BSection = 'core_competency' | 'core_readiness';

export interface BQuestion {
  id: string;
  module: 'competency_core' | 'readiness_core';
  section: BSection;
  subscale: string;
  text: string;
  reverse: boolean;
  crossTags: string[];
}

const Q = (
  id: string,
  module: 'competency_core' | 'readiness_core',
  section: BSection,
  subscale: string,
  text: string,
  reverse: boolean,
  crossTags: string[],
): BQuestion => ({ id, module, section, subscale, text, reverse, crossTags });

// ── 모듈1: 공통 기초역량 (18문항) ────────────────────────────────────

// 1-1. 문제해결 (problem_solving) — 3문항
const problemSolvingQuestions: BQuestion[] = [
  Q('b_ps01', 'competency_core', 'core_competency', 'problem_solving', '복잡한 문제를 작은 단위로 나누어 접근하는 편이다.', false, ['SP:Analytical', 'PT:T', 'BT:C']),
  Q('b_ps02', 'competency_core', 'core_competency', 'problem_solving', '문제의 원인을 파악한 후 해결책을 찾는 순서를 따른다.', false, ['SP:Analytical', 'PT:T', 'PT:J']),
  Q('b_ps03', 'competency_core', 'core_competency', 'problem_solving', '해결책이 바로 떠오르지 않아도 다양한 방법을 시도해본다.', false, ['SP:Breakthrough', 'PT:N', 'PT:P']),
];

// 1-2. 소통 (communication) — 3문항
const communicationQuestions: BQuestion[] = [
  Q('b_cm01', 'competency_core', 'core_competency', 'communication', '내 생각을 상대방이 이해하기 쉽게 전달할 수 있다.', false, ['SP:Interpersonal', 'BT:I', 'PT:E']),
  Q('b_cm02', 'competency_core', 'core_competency', 'communication', '상대방의 말을 끝까지 듣고 핵심을 파악하는 편이다.', false, ['SP:Harmony', 'BT:S', 'PT:F']),
  Q('b_cm03', 'competency_core', 'core_competency', 'communication', '글로 자기 생각을 논리적으로 정리하는 것에 자신이 있다.', false, ['SP:Analytical', 'BT:C', 'PT:T']),
];

// 1-3. 주도성 (initiative) — 3문항
const initiativeQuestions: BQuestion[] = [
  Q('b_in01', 'competency_core', 'core_competency', 'initiative', '시키지 않아도 필요한 일을 먼저 찾아서 하는 편이다.', false, ['SP:Execution', 'BT:D', 'PT:J']),
  Q('b_in02', 'competency_core', 'core_competency', 'initiative', '새로운 아이디어가 있으면 직접 제안해본 경험이 있다.', false, ['SP:Creativity', 'BT:D', 'PT:N']),
  Q('b_in03', 'competency_core', 'core_competency', 'initiative', '주어진 것 이상의 결과를 내려고 노력하는 편이다.', false, ['SP:Execution', 'BT:D']),
];

// 1-4. 협업 (collaboration) — 3문항
const collaborationQuestions: BQuestion[] = [
  Q('b_cl01', 'competency_core', 'core_competency', 'collaboration', '팀에서 내 역할을 파악하고 맡은 바를 책임지는 편이다.', false, ['SP:Guard', 'BT:S', 'PT:J']),
  Q('b_cl02', 'competency_core', 'core_competency', 'collaboration', '의견이 다른 팀원과도 생산적으로 협력할 수 있다.', false, ['SP:Harmony', 'BT:S', 'PT:F']),
  Q('b_cl03', 'competency_core', 'core_competency', 'collaboration', '팀 목표를 위해 내 의견을 양보한 경험이 있다.', false, ['SP:Harmony', 'BT:S']),
];

// 1-5. 자기관리 (self_management) — 3문항
const selfManagementQuestions: BQuestion[] = [
  Q('b_sm01', 'competency_core', 'core_competency', 'self_management', '여러 과제가 동시에 있을 때 우선순위를 정해 처리한다.', false, ['SP:Execution', 'PT:J', 'BT:C']),
  Q('b_sm02', 'competency_core', 'core_competency', 'self_management', '스트레스 상황에서도 감정을 조절하며 업무를 수행할 수 있다.', false, ['CH:emotional', 'BT:S']),
  Q('b_sm03', 'competency_core', 'core_competency', 'self_management', '마감을 지키기 위해 스스로 일정을 관리하는 습관이 있다.', false, ['CH:integrity', 'PT:J']),
];

// 1-6. 학습민첩성 (learning_agility) — 3문항
const learningAgilityQuestions: BQuestion[] = [
  Q('b_la01', 'competency_core', 'core_competency', 'learning_agility', '처음 접하는 업무도 빠르게 파악하여 수행할 수 있다.', false, ['CH:growth', 'PT:N', 'UF:temperament']),
  Q('b_la02', 'competency_core', 'core_competency', 'learning_agility', '실패에서 배운 점을 다음에 적용하려고 노력한다.', false, ['CH:growth', 'UF:trauma(PTG)']),
  Q('b_la03', 'competency_core', 'core_competency', 'learning_agility', '피드백을 받으면 방어하기보다 개선점을 찾는 편이다.', false, ['CH:growth', 'BT:S']),
];

// ── 모듈3: 공통 준비도 (32문항) ──────────────────────────────────────

// 3-1. 자기이해 (self_understanding) — 8문항
const selfUnderstandingQuestions: BQuestion[] = [
  Q('b_su01', 'readiness_core', 'core_readiness', 'self_understanding', '내 강점과 약점을 구체적으로 설명할 수 있다.', false, ['UF:self', 'SP:전반']),
  Q('b_su02', 'readiness_core', 'core_readiness', 'self_understanding', '내가 일에서 가장 중요하게 생각하는 가치가 무엇인지 안다.', false, ['CH:ethics', 'AP:방향']),
  Q('b_su03', 'readiness_core', 'core_readiness', 'self_understanding', '어떤 환경에서 내가 가장 잘 일하는지 파악하고 있다.', false, ['BT:전반', 'PT:전반']),
  Q('b_su04', 'readiness_core', 'core_readiness', 'self_understanding', '내 성격이 직무에 미치는 영향을 이해하고 있다.', false, ['PT:전반', 'BT:전반']),
  Q('b_su05', 'readiness_core', 'core_readiness', 'self_understanding', '다른 사람이 나를 어떻게 보는지에 대한 인식이 있다.', false, ['UF:peer', 'BT:전반']),
  Q('b_su06', 'readiness_core', 'core_readiness', 'self_understanding', '나에게 맞지 않는 직무 유형이 무엇인지 안다.', false, ['AP:역방향']),
  Q('b_su07', 'readiness_core', 'core_readiness', 'self_understanding', '내가 스트레스를 받는 상황과 대처 방식을 이해한다.', false, ['CH:emotional', 'UF:temperament']),
  Q('b_su08', 'readiness_core', 'core_readiness', 'self_understanding', '자기소개서에 내 강점을 구체적 사례와 함께 쓸 수 있다.', false, ['BT:I', 'UF:self']),
];

// 3-2. 직무이해 (job_understanding) — 8문항
const jobUnderstandingQuestions: BQuestion[] = [
  Q('b_ju01', 'readiness_core', 'core_readiness', 'job_understanding', '희망 직무의 하루 업무를 구체적으로 설명할 수 있다.', false, ['PT:S', 'BT:C']),
  Q('b_ju02', 'readiness_core', 'core_readiness', 'job_understanding', '희망 산업의 시장 상황과 전망을 파악하고 있다.', false, ['PT:N', 'SP:Strategic']),
  Q('b_ju03', 'readiness_core', 'core_readiness', 'job_understanding', '희망 직무에서 요구하는 핵심 역량을 알고 있다.', false, ['SP:전반']),
  Q('b_ju04', 'readiness_core', 'core_readiness', 'job_understanding', '관심 기업 3곳 이상의 특징을 설명할 수 있다.', false, ['PT:S', 'BT:C']),
  Q('b_ju05', 'readiness_core', 'core_readiness', 'job_understanding', '해당 직무의 성장 경로(커리어 패스)를 이해하고 있다.', false, ['SP:Strategic', 'PT:N']),
  Q('b_ju06', 'readiness_core', 'core_readiness', 'job_understanding', '현직자와 대화하거나 정보를 수집한 경험이 있다.', false, ['BT:I', 'PT:E']),
  Q('b_ju07', 'readiness_core', 'core_readiness', 'job_understanding', '직무와 관련된 뉴스나 트렌드를 정기적으로 확인한다.', false, ['CH:growth', 'PT:N']),
  Q('b_ju08', 'readiness_core', 'core_readiness', 'job_understanding', '내 강점이 희망 직무에서 어떻게 발휘될지 설명할 수 있다.', false, ['SP:전반', 'UF:self']),
];

// 3-3. 역량준비 (skill_readiness) — 8문항
const skillReadinessQuestions: BQuestion[] = [
  Q('b_sr01', 'readiness_core', 'core_readiness', 'skill_readiness', '희망 직무와 관련된 자격증이나 수료증을 보유하고 있다.', false, ['CH:integrity', 'PT:J']),
  Q('b_sr02', 'readiness_core', 'core_readiness', 'skill_readiness', '인턴, 아르바이트, 프로젝트 등 실무 경험이 있다.', false, ['SP:Execution']),
  Q('b_sr03', 'readiness_core', 'core_readiness', 'skill_readiness', '포트폴리오나 결과물을 제출할 수 있는 상태다.', false, ['BT:C', 'PT:J']),
  Q('b_sr04', 'readiness_core', 'core_readiness', 'skill_readiness', '희망 직무에 필요한 도구(소프트웨어, 장비 등)를 다룰 수 있다.', false, ['SP:Execution']),
  Q('b_sr05', 'readiness_core', 'core_readiness', 'skill_readiness', '역량 갭을 인식하고 있으며 보완 계획이 있다.', false, ['SP:Strategic', 'CH:growth']),
  Q('b_sr06', 'readiness_core', 'core_readiness', 'skill_readiness', '관련 분야 스터디, 동아리, 커뮤니티에 참여한 경험이 있다.', false, ['BT:I', 'CH:growth']),
  Q('b_sr07', 'readiness_core', 'core_readiness', 'skill_readiness', '현재 역량 수준을 객관적으로 평가할 수 있다.', false, ['UF:self', 'SP:Analytical']),
  Q('b_sr08', 'readiness_core', 'core_readiness', 'skill_readiness', '역량 부족 영역을 보완하기 위해 현재 활동 중인 것이 있다.', false, ['CH:growth', 'SP:Execution']),
];

// 3-4. 실행준비 (action_readiness) — 8문항
const actionReadinessQuestions: BQuestion[] = [
  Q('b_ar01', 'readiness_core', 'core_readiness', 'action_readiness', '이력서가 최신 상태로 준비되어 있다.', false, ['PT:J', 'BT:C']),
  Q('b_ar02', 'readiness_core', 'core_readiness', 'action_readiness', '자기소개서를 기업별로 맞춤 작성할 수 있다.', false, ['PT:N', 'BT:C']),
  Q('b_ar03', 'readiness_core', 'core_readiness', 'action_readiness', '면접에서 자기 소개를 자신 있게 할 수 있다.', false, ['BT:I', 'UF:self']),
  Q('b_ar04', 'readiness_core', 'core_readiness', 'action_readiness', '면접에서 예상 질문에 대한 답변을 준비하고 있다.', false, ['PT:J', 'BT:C']),
  Q('b_ar05', 'readiness_core', 'core_readiness', 'action_readiness', '취업 관련 네트워킹(OB 방문, 박람회 등)에 참여한 적이 있다.', false, ['BT:I', 'PT:E']),
  Q('b_ar06', 'readiness_core', 'core_readiness', 'action_readiness', '구직 활동에 투자하는 시간을 정기적으로 확보하고 있다.', false, ['CH:integrity', 'PT:J']),
  Q('b_ar07', 'readiness_core', 'core_readiness', 'action_readiness', '지원 결과에 대한 불안을 관리하며 꾸준히 활동할 수 있다.', false, ['CH:emotional', 'SP:Breakthrough']),
  Q('b_ar08', 'readiness_core', 'core_readiness', 'action_readiness', '취업 활동을 지지해주는 가족, 친구, 멘토가 있다.', false, ['UF:family', 'UF:peer']),
];

// ── 집계 export ─────────────────────────────────────────────────────

export const COMPETENCY_CORE_QUESTIONS: BQuestion[] = [
  ...problemSolvingQuestions,
  ...communicationQuestions,
  ...initiativeQuestions,
  ...collaborationQuestions,
  ...selfManagementQuestions,
  ...learningAgilityQuestions,
];

export const READINESS_CORE_QUESTIONS: BQuestion[] = [
  ...selfUnderstandingQuestions,
  ...jobUnderstandingQuestions,
  ...skillReadinessQuestions,
  ...actionReadinessQuestions,
];

export const ALL_B_QUESTIONS: BQuestion[] = [
  ...COMPETENCY_CORE_QUESTIONS,
  ...READINESS_CORE_QUESTIONS,
];
