/**
 * 생애주기 검사(D·E·F·GAP) — DB sub_domain → 화면·채점 모듈 매핑 SSOT (2026-10-12)
 *
 * DB `hit_questions.module`은 'layer_{x}' 하나뿐이라 화면이 sub_domain으로 모듈을 정한다.
 * 채점(`lib/hit/scoring-{x}.ts`)은 응답 row의 module로 필터하므로 여기 모듈 이름 = 채점 모듈 이름이어야 한다.
 * 체크리스트로 옮긴 sub_domain(이력서·면접·타이밍·재정 …)은 DB test_type이 '{X}_checklist'라 출제되지 않는다 (`lib/hero/journey-checklists.ts`).
 */
export const STAGE_SUBDOMAIN_MODULE: Record<'d' | 'e' | 'f' | 'gap', Record<string, string>> = {
  d: {
    domain_expertise: 'careerCapital', achievement: 'careerCapital', relational: 'careerCapital', transferable: 'careerCapital',
    push: 'motivation', pull: 'motivation',
    skill_transfer: 'transferability', market_fit: 'transferability', adaptation: 'transferability',
  },
  e: {
    domain_depth: 'expertise', tacit_knowledge: 'expertise', redeployment: 'expertise', personal_brand: 'expertise',
    exec_leadership: 'leadership', strategic_leadership: 'leadership', coaching_leadership: 'leadership', independent_leadership: 'leadership',
    identity_strength: 'identity', new_role: 'identity', identity_recon: 'identity',
    strong_ties: 'network', weak_ties: 'network',
  },
  f: {
    life_satisfaction: 'satisfaction', residual_passion: 'satisfaction', psych_transition: 'satisfaction',
    re_employment: 'direction', entrepreneurship: 'direction', social_contribution: 'direction', mentoring: 'direction', leisure: 'direction',
    transferable_legacy: 'legacy', knowledge_transfer: 'legacy', new_capability: 'legacy',
    belonging: 'social', role_necessity: 'social',
  },
  gap: {
    disruption_context: 'latent_capability', hidden_competency: 'latent_capability', gap_activities: 'latent_capability',
    job_viability: 'career_viability', skill_currency: 'career_viability', market_reentry: 'career_viability',
    self_narrative: 'resilience', self_esteem: 'resilience', retry_willingness: 'resilience',
    career_restoration: 'direction_bifurcation', career_pivot: 'direction_bifurcation', fresh_start: 'direction_bifurcation',
  },
};
