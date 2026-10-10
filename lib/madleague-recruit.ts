/**
 * MADLeague 동아리 부원 공동 모집 (2026-10-10 사용자 결정 — 공동 모집 페이지 + 동아리별 지원)
 *   - 동아리마다 유니버스 폼 1개: forms.brand_id='madleague', program = `club-recruit:{동아리 slug}`
 *   - 공동 모집 페이지(/madleague/clubs/recruit)는 지금 열린 지원서를 모아 보여 준다 — 모집 기간 = 각 폼의 열기·마감
 *   - 응답은 그 동아리 운영진 + 직원만 본다 (/madleague/clubs/{slug}/manage) — 다른 동아리에 넘기지 않는다
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { formAvailability } from '@/lib/forms';
import type { FormAvailability, FormDef } from '@/types/forms';

export const CLUB_RECRUIT_PREFIX = 'club-recruit:';

export const clubRecruitProgram = (slug: string) => `${CLUB_RECRUIT_PREFIX}${slug}`;

export function clubSlugFromProgram(program: string | null | undefined): string | null {
  return program?.startsWith(CLUB_RECRUIT_PREFIX) ? program.slice(CLUB_RECRUIT_PREFIX.length) : null;
}

export interface ClubRecruitForm {
  id: string;
  slug: string;
  title: string;
  clubSlug: string;
  opens_at: string | null;
  closes_at: string | null;
  availability: FormAvailability;
}

/** 공개된 동아리 모집 지원서 (status open·closed, 초안 제외) — 동아리 slug별 가장 최근 1개 */
export async function fetchClubRecruitForms(): Promise<Map<string, ClubRecruitForm>> {
  const admin = createAdminClient();
  const { data } = await admin.from('forms')
    .select('id, slug, title, program, status, opens_at, closes_at, settings')
    .eq('brand_id', 'madleague').like('program', `${CLUB_RECRUIT_PREFIX}%`).neq('status', 'draft')
    .order('created_at', { ascending: false });
  const out = new Map<string, ClubRecruitForm>();
  for (const f of (data ?? []) as Array<Pick<FormDef, 'id' | 'slug' | 'title' | 'program' | 'status' | 'opens_at' | 'closes_at' | 'settings'>>) {
    const clubSlug = clubSlugFromProgram(f.program);
    if (!clubSlug) continue;
    const availability = formAvailability(f);
    const prev = out.get(clubSlug);
    // 열린 지원서를 우선, 그다음 최신
    if (prev && (prev.availability === 'open' || availability !== 'open')) continue;
    out.set(clubSlug, { id: f.id, slug: f.slug, title: f.title, clubSlug, opens_at: f.opens_at, closes_at: f.closes_at, availability });
  }
  return out;
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

/** 모집 기간 표기 — 10.1 ~ 10.31 */
export function recruitPeriodLabel(f: Pick<ClubRecruitForm, 'opens_at' | 'closes_at'>): string | null {
  if (!f.opens_at && !f.closes_at) return null;
  return `${f.opens_at ? fmt(f.opens_at) : ''} ~ ${f.closes_at ? fmt(f.closes_at) : ''}`.trim();
}
