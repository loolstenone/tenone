import type { LikertQuestion } from './personality-questions';

/**
 * HIT F -- "경력 공백 복귀?" (Career Break Recovery)
 * 4개 모듈, 55문항
 *
 * 모듈 1: 공백 맥락 (break_context) -- 10문항
 *   - break_context (경력 단절 상황) -- 5문항
 *   - break_reason (단절 사유) -- 5문항
 *   NOTE: 일부 문항은 break_months, job_category를 CVI 계산용으로 수집
 *
 * 모듈 2: 잠재 역량 (latent_skills) -- 20문항
 *   - technical_retention (기술적 역량 유지) -- 7문항
 *   - soft_skill_retention (소프트 스킬 유지) -- 7문항
 *   - continuous_learning (지속적 학습) -- 6문항
 *
 * 모듈 3: 회복탄력성 (resilience) -- 15문항
 *   - emotional_resilience (정서적 회복력) -- 5문항
 *   - confidence (자신감) -- 5문항
 *   - adaptability (적응력) -- 5문항
 *
 * 모듈 4: 재진입 준비도 (reentry) -- 10문항
 *   - practical_readiness (실질적 준비) -- 5문항
 *   - reentry_motivation (복귀 동기) -- 5문항
 */

// ── 모듈 1: 공백 맥락 (10문항) ──────────────────────────────────

export const breakContextQuestions: LikertQuestion[] = [
  // === break_context (경력 단절 상황) ===
  { id: 'f_ctx_001', text: '경력 공백 기간이 나에게 부담으로 느껴진다.', subscale: 'break_context' },
  { id: 'f_ctx_002', text: '공백 기간 동안에도 업무와 관련된 활동을 했다.', subscale: 'break_context' },
  { id: 'f_ctx_003', text: '경력 단절이 내 커리어에 심각한 영향을 줄 것이라 생각한다.', subscale: 'break_context' },
  { id: 'f_ctx_004', text: '공백 기간 동안 나 자신에 대해 많이 성찰했다.', subscale: 'break_context' },
  { id: 'f_ctx_005', text: '경력 단절 경험이 오히려 나를 성장시켰다고 생각한다.', subscale: 'break_context' },

  // === break_reason (단절 사유) ===
  { id: 'f_ctx_006', text: '경력 단절은 내가 선택한 결정이었다.', subscale: 'break_reason' },
  { id: 'f_ctx_007', text: '단절 사유를 면접에서 자신 있게 설명할 수 있다.', subscale: 'break_reason' },
  { id: 'f_ctx_008', text: '경력 공백의 원인이 해소되어 복귀 준비가 가능하다.', subscale: 'break_reason' },
  { id: 'f_ctx_009', text: '단절 기간 동안 새로운 관점이나 가치관을 얻었다.', subscale: 'break_reason' },
  { id: 'f_ctx_010', text: '경력 공백이 부끄러운 일이라고 생각한다.', reverse: true, subscale: 'break_reason' },
];

// ── 모듈 2: 잠재 역량 (20문항) ──────────────────────────────────

export const latentSkillsQuestions: LikertQuestion[] = [
  // === technical_retention (기술적 역량 유지) ===
  { id: 'f_lat_001', text: '이전 직무에서 사용하던 핵심 기술을 아직 기억하고 있다.', subscale: 'technical_retention' },
  { id: 'f_lat_002', text: '공백 기간 동안 업계 기술 변화를 어느 정도 파악하고 있다.', subscale: 'technical_retention' },
  { id: 'f_lat_003', text: '이전 직무에서의 전문 지식이 아직 유효하다고 생각한다.', subscale: 'technical_retention' },
  { id: 'f_lat_004', text: '기술적 감각이 많이 떨어졌다고 느낀다.', reverse: true, subscale: 'technical_retention' },
  { id: 'f_lat_005', text: '새로운 도구나 소프트웨어를 빠르게 익힐 자신이 있다.', subscale: 'technical_retention' },
  { id: 'f_lat_006', text: '이전 업무 경험에서 축적한 노하우가 여전히 가치 있다.', subscale: 'technical_retention' },
  { id: 'f_lat_007', text: '복귀 후 기술적 역량을 빠르게 회복할 수 있다고 생각한다.', subscale: 'technical_retention' },

  // === soft_skill_retention (소프트 스킬 유지) ===
  { id: 'f_lat_008', text: '사람들과 효과적으로 의사소통하는 능력이 유지되고 있다.', subscale: 'soft_skill_retention' },
  { id: 'f_lat_009', text: '문제를 분석하고 해결하는 사고력이 여전히 강하다.', subscale: 'soft_skill_retention' },
  { id: 'f_lat_010', text: '팀워크와 협업 경험이 복귀 후에도 도움이 될 것이다.', subscale: 'soft_skill_retention' },
  { id: 'f_lat_011', text: '리더십이나 프로젝트 관리 능력이 약해졌다고 느낀다.', reverse: true, subscale: 'soft_skill_retention' },
  { id: 'f_lat_012', text: '공백 기간 동안 대인관계 능력이 오히려 향상되었다.', subscale: 'soft_skill_retention' },
  { id: 'f_lat_013', text: '업무 상황에서의 판단력과 의사결정 능력이 여전하다.', subscale: 'soft_skill_retention' },
  { id: 'f_lat_014', text: '시간 관리와 우선순위 설정 능력이 유지되고 있다.', subscale: 'soft_skill_retention' },

  // === continuous_learning (지속적 학습) ===
  { id: 'f_lat_015', text: '공백 기간 동안 새로운 것을 배우는 활동을 했다.', subscale: 'continuous_learning' },
  { id: 'f_lat_016', text: '온라인 강의, 독서 등으로 전문 지식을 유지하려 노력했다.', subscale: 'continuous_learning' },
  { id: 'f_lat_017', text: '자격증 취득이나 교육 프로그램에 참여한 경험이 있다.', subscale: 'continuous_learning' },
  { id: 'f_lat_018', text: '관심 분야의 최신 트렌드를 꾸준히 팔로우하고 있다.', subscale: 'continuous_learning' },
  { id: 'f_lat_019', text: '공백 기간 동안 배운 것이 거의 없다.', reverse: true, subscale: 'continuous_learning' },
  { id: 'f_lat_020', text: '새로운 분야나 기술에 대한 호기심이 여전히 강하다.', subscale: 'continuous_learning' },
];

// ── 모듈 3: 회복탄력성 (15문항) ────────────────────────────────

export const resilienceQuestions: LikertQuestion[] = [
  // === emotional_resilience (정서적 회복력) ===
  { id: 'f_res_001', text: '경력 공백으로 인한 스트레스를 잘 관리하고 있다.', subscale: 'emotional_resilience' },
  { id: 'f_res_002', text: '복귀 과정에서 거절당해도 다시 도전할 수 있다.', subscale: 'emotional_resilience' },
  { id: 'f_res_003', text: '불확실한 상황에서도 감정적으로 안정을 유지한다.', subscale: 'emotional_resilience' },
  { id: 'f_res_004', text: '경력 단절에 대한 사회적 시선이 나를 위축시킨다.', reverse: true, subscale: 'emotional_resilience' },
  { id: 'f_res_005', text: '어려운 시기를 겪으며 내면적으로 더 강해졌다고 느낀다.', subscale: 'emotional_resilience' },

  // === confidence (자신감) ===
  { id: 'f_res_006', text: '내가 직장에서 충분히 가치 있는 인재라고 확신한다.', subscale: 'confidence' },
  { id: 'f_res_007', text: '이력서에 경력 공백이 있어도 자신 있게 지원할 수 있다.', subscale: 'confidence' },
  { id: 'f_res_008', text: '면접에서 나의 강점을 효과적으로 어필할 수 있다.', subscale: 'confidence' },
  { id: 'f_res_009', text: '경력 공백 때문에 내 능력이 부족하다고 느낀다.', reverse: true, subscale: 'confidence' },
  { id: 'f_res_010', text: '복귀 후 동료들과 대등하게 업무를 수행할 수 있다.', subscale: 'confidence' },

  // === adaptability (적응력) ===
  { id: 'f_res_011', text: '새로운 직장 환경에 빠르게 적응할 수 있다.', subscale: 'adaptability' },
  { id: 'f_res_012', text: '업무 방식이나 도구가 바뀌어도 유연하게 대처한다.', subscale: 'adaptability' },
  { id: 'f_res_013', text: '이전과 다른 역할이나 직급도 수용할 수 있다.', subscale: 'adaptability' },
  { id: 'f_res_014', text: '조직 문화가 이전과 달라도 잘 적응할 자신이 있다.', subscale: 'adaptability' },
  { id: 'f_res_015', text: '변화가 두렵기보다는 새로운 기회로 느껴진다.', subscale: 'adaptability' },
];

// ── 모듈 4: 재진입 준비도 (10문항) ──────────────────────────────

export const reentryQuestions: LikertQuestion[] = [
  // === practical_readiness (실질적 준비) ===
  { id: 'f_ren_001', text: '이력서를 최근에 업데이트했거나 업데이트할 계획이 있다.', subscale: 'practical_readiness' },
  { id: 'f_ren_002', text: '복귀에 필요한 자격증이나 교육을 준비하고 있다.', subscale: 'practical_readiness' },
  { id: 'f_ren_003', text: '구직 활동을 위한 시간과 에너지를 확보하고 있다.', subscale: 'practical_readiness' },
  { id: 'f_ren_004', text: '복귀 후 일과 생활의 균형을 유지할 수 있는 환경이 갖춰져 있다.', subscale: 'practical_readiness' },
  { id: 'f_ren_005', text: '구직 기간 동안 경제적으로 버틸 수 있는 여유가 있다.', subscale: 'practical_readiness' },

  // === reentry_motivation (복귀 동기) ===
  { id: 'f_ren_006', text: '일을 통해 자아실현을 하고 싶은 강한 욕구가 있다.', subscale: 'reentry_motivation' },
  { id: 'f_ren_007', text: '경제적 독립을 위해 복귀가 반드시 필요하다.', subscale: 'reentry_motivation' },
  { id: 'f_ren_008', text: '사회적 연결과 소속감을 다시 느끼고 싶다.', subscale: 'reentry_motivation' },
  { id: 'f_ren_009', text: '내 경험과 능력을 활용하여 사회에 기여하고 싶다.', subscale: 'reentry_motivation' },
  { id: 'f_ren_010', text: '복귀에 대한 의지가 흔들리지 않고 확고하다.', subscale: 'reentry_motivation' },
];

// ── 모듈 메타 정보 ──────────────────────────────────────────────

export const hitFModules = [
  { key: 'break_context', label: '공백 맥락', icon: '🕐', questions: breakContextQuestions, count: 10, time: 2 },
  { key: 'latent_skills', label: '잠재 역량', icon: '💡', questions: latentSkillsQuestions, count: 20, time: 4 },
  { key: 'resilience', label: '회복탄력성', icon: '🔋', questions: resilienceQuestions, count: 15, time: 3 },
  { key: 'reentry', label: '재진입 준비도', icon: '🚀', questions: reentryQuestions, count: 10, time: 2 },
] as const;

export const allFQuestions: LikertQuestion[] = [
  ...breakContextQuestions,
  ...latentSkillsQuestions,
  ...resilienceQuestions,
  ...reentryQuestions,
];
