'use client';

/**
 * WIO People — PublicProfile
 *
 * 크로스 브랜드 공개 프로필 표시 컴포넌트. 아바타/이름/역할/유니버스 활동/
 * 커리어 타임라인을 일관된 형태로 보여준다. 브랜드별 고유 섹션은 children/
 * extraSections 슬롯으로 확장.
 */

import { Briefcase, Clock } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PublicCareerEntry {
  id: string;
  company: string;
  title: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  description: string;
}

export interface PublicProfileData {
  displayName: string;
  avatarUrl?: string | null;
  /** 직무/산업/연차 등을 이미 조합한 한 줄 텍스트 */
  roleLine?: string | null;
  bio?: string | null;
  /** 크로스 브랜드 활동 (affiliations slug 배열) */
  affiliations?: string[];
  /** 크로스 브랜드 커리어 타임라인 */
  career?: PublicCareerEntry[];
  /** 활동 중 플래그 — 프로필이 활성 멤버인지 */
  isActive?: boolean;
}

export interface PublicProfileProps {
  profile: PublicProfileData;
  /** 유니버스 슬러그 → 표시 라벨 */
  brandLabels?: Record<string, string>;
  /** 이름 옆에 붙는 커스텀 배지 (예: "바닥장") */
  badge?: ReactNode;
  /** 프로필 영역 아래 확장 섹션 (태그, 개설 모임 등) */
  extraSections?: ReactNode;
  /** 테마 — 기본 dark */
  theme?: 'dark' | 'light';
}

const DEFAULT_BRAND_LABELS: Record<string, string> = {
  badak: '바닥',
  hero: 'HeRo',
  madleague: 'MAD League',
  madleap: 'MADLeap',
  mindle: 'Mindle',
  smarcomm: 'SmarComm',
  wio: 'WIO',
  myverse: 'MyVerse',
  rook: 'RooK',
  luki: 'LUKI',
};

function formatCareerPeriod(c: PublicCareerEntry): string {
  const start = `${c.startYear}.${String(c.startMonth).padStart(2, '0')}`;
  const end = c.isCurrent
    ? '현재'
    : c.endYear
      ? `${c.endYear}.${String(c.endMonth ?? 1).padStart(2, '0')}`
      : '';
  return end ? `${start} – ${end}` : start;
}

export function PublicProfile({
  profile,
  brandLabels,
  badge,
  extraSections,
  theme = 'dark',
}: PublicProfileProps) {
  const labels = { ...DEFAULT_BRAND_LABELS, ...brandLabels };
  const avatarLetter = profile.displayName.charAt(0);

  // 테마별 스타일 토큰
  const isDark = theme === 'dark';
  const nameColor = isDark ? 'text-white' : 'text-neutral-900';
  const subColor = isDark ? 'text-white/50' : 'text-neutral-500';
  const bioColor = isDark ? 'text-white/55' : 'text-neutral-600';
  const sectionBorder = isDark ? 'border-white/6' : 'border-neutral-200';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const avatarBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const avatarColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  const sortedCareer = profile.career
    ? [...profile.career].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return b.startYear * 100 + b.startMonth - (a.startYear * 100 + a.startMonth);
      })
    : [];

  const hasHeRoTime =
    (profile.affiliations && profile.affiliations.length > 1) || sortedCareer.length > 0;

  return (
    <>
      {/* 프로필 헤더 */}
      <div className="px-6 pb-5 pt-2">
        <div className="flex items-start gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
              style={{ background: avatarBg, color: avatarColor }}
            >
              {avatarLetter}
            </div>
          )}

          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[18px] font-bold leading-tight ${nameColor}`}>
                {profile.displayName}
              </span>
              {badge}
              {profile.isActive && (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#4ade80' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                  활동 중
                </span>
              )}
            </div>
            {profile.roleLine && (
              <div className={`flex items-center gap-1 text-[13px] ${subColor}`}>
                <Briefcase className="h-3 w-3 shrink-0" />
                <span>{profile.roleLine}</span>
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <p
            className={`mt-4 text-[13px] leading-relaxed ${bioColor}`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {profile.bio}
          </p>
        )}
      </div>

      {/* HeRo Time */}
      {hasHeRoTime && (
        <div className={`border-t ${sectionBorder} px-6 py-4`}>
          <div
            className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#fbbf24' }}
          >
            <Clock className="h-3.5 w-3.5" />
            HeRo Time
          </div>

          {profile.affiliations && profile.affiliations.length > 1 && (
            <div className="mb-4">
              <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>
                유니버스 활동
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.affiliations.map((a) => (
                  <span
                    key={a}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: 'rgba(251,191,36,0.08)',
                      color: '#fcd34d',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    {labels[a] ?? a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sortedCareer.length > 0 && (
            <div className="space-y-2.5">
              {sortedCareer.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl p-3"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={`text-[13px] font-semibold truncate ${isDark ? 'text-white/85' : 'text-neutral-900'}`}>
                        {c.company}
                      </div>
                      <div className={`text-[12px] truncate ${isDark ? 'text-white/55' : 'text-neutral-500'}`}>
                        {c.title}
                      </div>
                    </div>
                    <div className={`shrink-0 text-[10px] whitespace-nowrap pt-0.5 ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>
                      {formatCareerPeriod(c)}
                      {c.isCurrent && (
                        <span
                          className="ml-1 rounded-full px-1.5 py-0.5 text-[9px]"
                          style={{ background: 'rgba(74,222,128,0.12)', color: '#86efac' }}
                        >
                          재직
                        </span>
                      )}
                    </div>
                  </div>
                  {c.description && (
                    <p
                      className={`mt-2 text-[11.5px] leading-relaxed ${isDark ? 'text-white/45' : 'text-neutral-500'}`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {c.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 브랜드 고유 확장 영역 */}
      {extraSections}
    </>
  );
}
