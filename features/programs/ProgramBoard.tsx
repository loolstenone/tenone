/**
 * 창구 사이트의 프로그램 목록 (서버 컴포넌트) — channels에 이 사이트가 있는 모집 예정·진행 중 회차
 * MADLeague 화면에서 RooK 프로젝트·HeRo 프로그램을 보여도 "운영: {주인 브랜드}" — 데이터·동의는 주인 브랜드
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { PROGRAM_KIND_LABEL, PROGRAM_STATUS_LABEL } from '@/lib/programs/paths';
import { ApplyButton } from '@/features/programs/ApplyButton';
import type { ProgramTheme } from '@/features/programs/ProgramTheme';
import { Calendar } from 'lucide-react';

const day = (d: string | null) => d ? new Date(`${d}T00:00:00+09:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }) : null;

interface Round {
  id: string; brand_id: string; kind: string; title: string; year: number; status: string; client_name: string | null;
  brief_title: string | null; start_date: string | null; end_date: string | null; presentation_date: string | null; applications_open: boolean;
}

export async function ProgramBoard({ theme, brands, kinds, dark = true, emptyText = '지금 모집 중인 회차가 없습니다.', title, hideWhenEmpty = false }: {
  theme: ProgramTheme;
  /** 주인 브랜드로 거르기 (예: MADLeague 화면에서 RooK 회차만) */
  brands?: string[];
  kinds?: string[];
  dark?: boolean;
  emptyText?: string;
  /** 목록 위 제목 (있을 때만) */
  title?: string;
  /** 회차가 없으면 아무것도 그리지 않는다 (기존 화면에 덧붙일 때) */
  hideWhenEmpty?: boolean;
}) {
  const db = createAdminClient();
  let q = db.from('program_rounds')
    .select('id, brand_id, kind, title, year, status, client_name, brief_title, start_date, end_date, presentation_date, applications_open')
    .contains('channels', [theme.site]).in('status', ['upcoming', 'ongoing'])
    .order('start_date', { ascending: true, nullsFirst: false });
  if (brands?.length) q = q.in('brand_id', brands);
  if (kinds?.length) q = q.in('kind', kinds);
  const { data } = await q;
  const rounds = (data ?? []) as Round[];
  const { data: sites } = rounds.length
    ? await db.from('ums_sites').select('slug, name').in('slug', [...new Set(rounds.map(r => r.brand_id))])
    : { data: [] as { slug: string; name: string }[] };
  const nameOf = new Map((sites ?? []).map(s => [s.slug, s.name]));

  const card = dark ? 'border-neutral-900 bg-neutral-950' : 'border-neutral-200 bg-white';
  const muted = dark ? 'text-neutral-500' : 'text-neutral-500';
  if (!rounds.length) return hideWhenEmpty ? null : <p className={`border p-8 text-center text-sm ${card} ${muted}`}>{emptyText}</p>;

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-black">{title}</h2>}
      {rounds.map(r => {
        const dates = [['시작', day(r.start_date)], ['마감', day(r.end_date)], ['발표', day(r.presentation_date)]].filter(([, v]) => v) as [string, string][];
        return (
          <article key={r.id} className={`border p-5 sm:p-6 ${card}`}>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 text-white" style={{ background: theme.accent }}>{PROGRAM_STATUS_LABEL[r.status] ?? r.status}</span>
              <span className={`px-2.5 py-1 ${dark ? 'bg-white/5 text-white/60' : 'bg-neutral-100 text-neutral-600'}`}>{PROGRAM_KIND_LABEL[r.kind] ?? r.kind}</span>
              {r.brand_id !== theme.site && <span className={`px-2.5 py-1 ${dark ? 'bg-white/5 text-white/60' : 'bg-neutral-100 text-neutral-600'}`}>운영 · {nameOf.get(r.brand_id) ?? r.brand_id}</span>}
            </div>
            <h3 className="text-xl font-black">{r.title}</h3>
            {r.client_name && <p className={`mt-1 text-sm ${muted}`}>클라이언트 · {r.client_name}</p>}
            {r.brief_title && <p className={`mt-2 text-sm ${dark ? 'text-neutral-300' : 'text-neutral-700'}`}>{r.brief_title}</p>}
            {dates.length > 0 && (
              <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs ${muted}`}>
                {dates.map(([k, v]) => <span key={k} className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" style={{ color: theme.accent }} />{k} {v}</span>)}
              </div>
            )}
            <div className="mt-4">
              <ApplyButton roundId={r.id} channel={theme.site} roomHref={`${theme.roomBase}/${r.id}`} accentColor={theme.accent} dark={dark} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
