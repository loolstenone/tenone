'use client';

/**
 * 동아리 목록 — 리스트형 (2026-10-10 사용자 결정)
 * 로고 · 동아리명 · 활동 지역 · 랭킹 · 동아리 소개 · 동아리 방 입장 — 동아리명·지역·랭킹 머리글을 눌러 정렬 (기본 = 이름 알파벳순)
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, DoorOpen } from 'lucide-react';

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

const collator = new Intl.Collator('ko', { sensitivity: 'base', numeric: true });

export function ClubList({ rows }: { rows: ClubListRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });

  const sorted = useMemo(() => {
    const cmp = (a: ClubListRow, b: ClubListRow) => {
      if (sort.key === 'score') return (a.score - b.score) || collator.compare(b.name, a.name);
      return sort.key === 'name' ? a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) : collator.compare(a.region, b.region);
    };
    return [...rows].sort((a, b) => cmp(a, b) * sort.dir);
  }, [rows, sort]);

  const toggle = (key: SortKey) => setSort(s => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === 'score' ? -1 : 1 }));

  const Head = ({ k, label, className = '' }: { k: SortKey; label: string; className?: string }) => {
    const Icon = sort.key !== k ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
    return (
      <button type="button" onClick={() => toggle(k)} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
        className={`inline-flex items-center gap-1 text-xs font-bold tracking-widest transition ${sort.key === k ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'} ${className}`}>
        {label}<Icon className="h-3.5 w-3.5" />
      </button>
    );
  };

  return (
    <div>
      {/* 머리글 (모바일은 정렬 버튼 줄) */}
      <div className="grid grid-cols-[3.5rem_1fr_auto] md:grid-cols-[3.5rem_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-neutral-800 pb-3">
        <span />
        <Head k="name" label="동아리" />
        <Head k="region" label="활동 지역" className="hidden md:inline-flex" />
        <Head k="score" label="랭킹" className="hidden md:inline-flex" />
        <span className="flex gap-3 md:hidden">
          <Head k="region" label="지역" />
          <Head k="score" label="랭킹" />
        </span>
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
