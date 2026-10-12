/**
 * 생애주기·상황 검사(C~GAP) 리포트 모듈 선택 — 규칙 기반 (2026-10-12)
 *
 * 결과 행(DB, snake_case)의 점수 → hit_report_modules id. 같은 점수면 언제나 같은 모듈이 나온다 (재현 가능).
 * 모듈 본문은 HeRo가 미리 작성·검수한 해설(인트라 › HeRo › 리포트 모듈에서 편집). AI는 관여하지 않는다.
 * 구간: 67 이상 HIGH · 34 이상 MID · 그 아래 LOW (lib/hit/report-assembler.ts getLevel과 같은 기준)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, any>;

const level = (v: unknown) => { const n = Number(v ?? 0); return n >= 67 ? 'HIGH' : n >= 34 ? 'MID' : 'LOW'; };
const grade = (v: unknown) => { const n = Number(v ?? 0); return n >= 75 ? 'A' : n >= 50 ? 'B' : n >= 25 ? 'C' : 'D'; };
const tri = (v: unknown, hi: string, mid: string, lo: string) => { const n = Number(v ?? 0); return n >= 67 ? hi : n >= 34 ? mid : lo; };

export type ReportStage = 'c' | 'd' | 'e' | 'f' | 'gap';

export function selectStageModules(stage: ReportStage, r: Row): string[] {
  const m: string[] = [];
  switch (stage) {
    case 'c':
      m.push(`READY-${grade(r.readiness_total)}`);
      break;
    case 'd': {
      const cs = r.capital_scores ?? {};
      m.push(`CC-DOMAIN-${level(cs.domain_expertise)}`, `CC-ACHIEVE-${level(cs.achievement)}`, `CC-RELATION-${level(cs.relational)}`, `CC-TRANSFER-${level(cs.transferable)}`);
      m.push(r.motivation_type === 'push_driven' ? 'CM-PUSH-DOMINANT' : r.motivation_type === 'pull_driven' ? 'CM-PULL-DOMINANT' : 'CM-BALANCED');
      const ts = r.transferability_scores ?? {};
      m.push(`CT-SKILL-${level(ts.skill_transfer)}`, `CT-MARKET-${level(ts.market_fit)}`, `CT-ADAPT-${level(ts.adaptation)}`);
      if (typeof r.ctype === 'string' && r.ctype.startsWith('CTYPE-')) m.push(r.ctype);
      break;
    }
    case 'e': {
      const ed = r.expertise_domains ?? {};
      m.push(`DE-DEPTH-${level(ed.domain_depth)}`, `DE-TACIT-${level(ed.tacit_knowledge)}`, `DE-REDEPLOY-${level(ed.redeployment)}`, `DE-BRAND-${level(ed.personal_brand)}`);
      const lt: Record<string, string> = { exec_leadership: 'DL-EXEC', strategic_leadership: 'DL-STRATEGIC', coaching_leadership: 'DL-COACH', independent_leadership: 'DL-INDEPENDENT' };
      if (lt[r.leadership_type]) m.push(lt[r.leadership_type]);
      m.push(tri(r.identity_flexibility, 'DI-FLEXIBLE', 'DI-MODERATE', 'DI-RIGID'));
      m.push(`DN-STRONG-${level(r.network_quality)}`, `DN-WEAK-${level(r.network_breadth)}`);
      m.push(`DR-${grade(r.senior_readiness)}`);
      // 채점이 내는 역할 코드 중 해설 모듈이 없는 것은 가장 가까운 모듈로 (EXPERT→컨설팅, BOARD→어드바이저, COACH→교육·코칭)
      const roleAlias: Record<string, string> = { 'DROLE-EXPERT': 'DROLE-CONSULTING', 'DROLE-BOARD': 'DROLE-ADVISOR', 'DROLE-COACH': 'DROLE-EDUCATION' };
      const roles = (r.next_role_matrix?.possible_roles ?? []) as { code: string }[];
      for (const role of roles.slice(0, 3)) {
        const id = roleAlias[role?.code] ?? role?.code;
        if (id && !m.includes(id)) m.push(id);
      }
      break;
    }
    case 'f': {
      const dt: Record<string, string> = { re_employment: 'ED-REEMPLOY', entrepreneurship: 'ED-ENTREPRENEUR', social_contribution: 'ED-SOCIAL', mentoring: 'ED-MENTOR', leisure: 'ED-SELFACTUAL' };
      if (dt[r.direction_type]) m.push(dt[r.direction_type]);
      m.push(`EL-SAT-${level(r.life_satisfaction)}`, `EL-PASSION-${level(r.remaining_passion)}`);
      const ls = r.legacy_scores ?? {};
      if (r.legacy_scores) m.push(`ER-TRANSFER-${level(ls.transferable_legacy)}`, `ER-SHARE-${level(ls.knowledge_transfer)}`, `ER-NEW-${level(ls.new_capability)}`);
      const ss = r.social_scores ?? {};
      if (r.social_scores) m.push(`ES-BELONG-${level(ss.belonging)}`, `ES-ROLE-${level(ss.role_necessity)}`);
      m.push(`EP-${grade(r.second_act_readiness)}`);
      break;
    }
    case 'gap': {
      const dd: Record<string, string> = { career_restoration: 'FD-RESTORE', career_pivot: 'FD-PIVOT', fresh_start: 'FD-FRESH' };
      if (dd[r.direction_dominant]) m.push(dd[r.direction_dominant]);
      const bc = r.break_context_scores ?? {};
      m.push(tri(bc.gap_activities, 'FL-GAP-ACTIVE', 'FL-GAP-PARTIAL', 'FL-GAP-MINIMAL'), `FL-HIDDEN-${level(bc.hidden_competency)}`);
      const rs = r.resilience_scores ?? {};
      m.push(tri(rs.self_narrative, 'FR-NARRATIVE-POS', 'FR-NARRATIVE-MIX', 'FR-NARRATIVE-NEG'), `FR-ESTEEM-${level(rs.self_esteem)}`, `FR-RETRY-${level(rs.retry_willingness)}`);
      if (['HIGH', 'MID', 'LOW'].includes(r.cvi_grade)) m.push(`FV-${r.cvi_grade}`);
      const lt = r.latent_scores ?? {};
      m.push(tri(lt.job_viability, 'FV-JOB-VALID', 'FV-JOB-EVOLVED', 'FV-JOB-OBSOLETE'), tri(lt.skill_currency, 'FV-SKILL-CURRENT', 'FV-SKILL-GAP', 'FV-SKILL-OUTDATED'));
      m.push(`FP-${grade(r.reentry_readiness)}`);
      break;
    }
  }
  return m;
}

export interface ReportModule { id: string; title: string; content: string }

/** 선택된 모듈 본문 — 선택 순서 유지, DB에 없는 id는 건너뜀. 플레이스홀더({score} 등)는 지운다 */
export async function loadReportModules(sb: SupabaseClient, ids: string[]): Promise<ReportModule[]> {
  if (ids.length === 0) return [];
  const { data } = await sb.from('hit_report_modules').select('id, title, content').in('id', ids);
  const byId = new Map(((data ?? []) as ReportModule[]).map(m => [m.id, m]));
  return ids.filter(id => byId.has(id)).map(id => {
    const m = byId.get(id)!;
    return {
      id,
      title: m.title.replace(/\{[^}]+\}/g, '').replace(/\s*%\s*/g, ' ').replace(/\s+/g, ' ').trim(),
      content: m.content.replace(/\{[^}]+\}/g, '').trim(),
    };
  });
}
