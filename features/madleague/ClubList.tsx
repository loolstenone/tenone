'use client';

/**
 * 동아리 목록 — 리스트형 (2026-10-10 사용자 결정)
 * 로고 · 동아리명 · 활동 지역 · 랭킹 · 동아리 소개 · 동아리 방 입장 — 정렬은 우측 상단 펼침 메뉴 하나 (기본 = 이름 알파벳순)
 * (2026-10-11 머리글 클릭 정렬 → 펼침 메뉴: 모바일·PC에서 정렬 버튼 줄이 어긋나던 문제)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Check, DoorOpen } from 'lucide-react';

export interface ClubListRow {
  slug: string;
  name: string;
  region: string;
  logo_url: string | null;
  color: string | null;
  score: number;
  teams: number;
  partial: boolean;
  rank: number | null;
}

type SortKey = 'name' | 'region' | 'score';
type SortOption = { id: string; key: SortKey; dir: 1 | -1; label: string };

const SORT_OPTIONS: SortOption[] = [
  { id: 'name-asc', key: 'name', dir: 1, label: '동아리명 A → Z' },
  { id: 'name-desc', key: 'name', dir: -1, label: '동아리명 Z → A' },
  { id: 'region-asc', key: 'region', dir: 1, label: '활동 지역 가나다순' },
  { id: 'region-desc', key: 'region', dir: -1, label: '활동 지역 역순' },
  { id: 'score-desc', key: 'score', dir: -1, label: '랭킹 높은 순' },
  { id: 'score-asc', key: 'score', dir: 1, label: '랭킹 낮은 순' },
];

const collator = new Intl.Collator('ko', { sensitivity: 'base', numeric: true });

export function ClubList({ rows }: { rows: ClubListRow[] }) {
  const [sortId, setSortId] = useState<string>('name-asc');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sort = SORT_OPTIONS.find(o => o.id === sortId) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const sorted = useMemo(() => {
    const cmp = (a: ClubListRow, b: ClubListRow) => {
      if (sort.key === 'score') return (a.score - b.score) || collator.compare(b.name, a.name);
      return sort.key === 'name' ? a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) : collator.compare(a.region, b.region);
    };
    return [...rows].sort((a, b) => cmp(a, b) * sort.dir);
  }, [rows, sort]);

  return (
    <div>
      {/* 정렬 — 우측 상단 펼침 메뉴 */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <span className="text-xs font-bold tracking-widest text-neutral-500">{rows.length}개 동아리</span>
        <div ref={menuRef} className="relative">
          <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
            className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white px-3.5 py-2 text-sm font-bold text-neutral-200 hover:text-white transition">
            <span className="text-neutral-500 font-normal">정렬</span>
            {sort.label}
            <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <ul role="listbox" className="absolute right-0 z-20 mt-1 min-w-[12rem] border border-neutral-700 bg-black py-1 shadow-xl">
              {SORT_OPTIONS.map(o => (
                <li key={o.id} role="option" aria-selected={o.id === sortId}>
                  <button type="button" onClick={() => { setSortId(o.id); setOpen(false); }}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition hover:bg-neutral-900 ${o.id === sortId ? 'text-white font-bold' : 'text-neutral-400'}`}>
                    {o.label}
                    {o.id === sortId && <Check className="h-4 w-4 text-[#EC1D25]" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ul className="divide-y divide-neutral-900">
        {sorted.map(club => (
          <li key={club.slug} className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[3.5rem_1.4fr_1fr_1fr_auto] items-center gap-x-4 gap-y-3 py-5">
            {club.logo_url ? (
              <div className="h-14 w-14 flex items-center justify-center bg-white">
                <Image src={club.logo_url} alt={club.name} width={56} height={56} className="object-contain" />
              </div>
            ) : (
              <div className="h-14 w-14" style={{ backgroundColor: club.color ?? '#EC1D25' }} />
            )}
            <div className="min-w-0">
              <Link href={`/madleague/clubs/${club.slug}`} className="text-2xl font-black hover:text-[#EC1D25] transition">{club.name}</Link>
              <div className="mt-1 text-sm text-neutral-400 md:hidden">
                {club.region} · {club.rank ? `${club.rank}위 · ${club.score}점` : '기록 없음'}
              </div>
            </div>
            <div className="hidden md:block text-neutral-300">{club.region}</div>
            <div className="hidden md:block">
              {club.rank ? (
                <span title={`경쟁 PT ${club.teams}팀 참가${club.partial ? ' (팀 정보가 없는 회차는 최소 1팀으로 계산)' : ''}`}>
                  <span className="text-xl font-black tabular-nums">{club.rank}위</span>
                  <span className="ml-2 text-sm text-neutral-400 tabular-nums">{club.score}점</span>
                </span>
              ) : <span className="text-sm text-neutral-600">기록 없음</span>}
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-wrap gap-2 md:justify-end">
              <Link href={`/madleague/clubs/${club.slug}`}
                className="inline-flex items-center gap-1.5 border border-neutral-700 hover:border-white px-3.5 py-2 text-sm font-bold text-neutral-300 hover:text-white transition whitespace-nowrap">
                동아리 소개 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/madleague/clubs/${club.slug}/room`}
                className="inline-flex items-center gap-1.5 bg-[#EC1D25] hover:bg-[#d01820] px-3.5 py-2 text-sm font-bold text-white transition whitespace-nowrap">
                <DoorOpen className="h-4 w-4" /> 동아리 방 입장
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-neutral-500 break-keep">
        랭킹 = MAD League 경쟁 PT 참가 팀마다 최고 성적 점수의 합 (1등 5점 · 2등 4점 · 3등 3점 · 본선 2점 · 참가 1점)
      </p>
    </div>
  );
}
