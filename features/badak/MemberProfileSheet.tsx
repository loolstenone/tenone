'use client';

import { useState, useEffect } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { BottomSheet } from '@/lib/wio/ui/BottomSheet';
import { PublicProfile, type PublicCareerEntry } from '@/lib/wio/people/PublicProfile';

interface PublicGroup {
  id: string;
  title: string;
  type: string;
  status: string;
  currentMembers: number;
  maxMembers: number;
  schedule?: string;
  eventDate?: string;
  location?: string;
}

interface BadakMemberProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  jobFunction: string;
  industry: string;
  experienceYears: number;
  jobLevel: string;
  bio: string | null;
  lookingFor: string[];
  canOffer: string[];
  interestTags: string[];
  career: PublicCareerEntry[];
  affiliations: string[];
  isActive: boolean;
  joinedAt: string;
}

interface MemberProfileSheetProps {
  /** DB member ID — 있으면 API 조회 */
  memberId?: string | null;
  /** ID 없을 때 기본 표시용 */
  displayName: string;
  job?: string;
  isLeader?: boolean;
  onClose: () => void;
}

export function MemberProfileSheet({
  memberId,
  displayName,
  job,
  isLeader,
  onClose,
}: MemberProfileSheetProps) {
  const [profile, setProfile] = useState<BadakMemberProfile | null>(null);
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    fetch(`/api/badak/members/${memberId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.member) setProfile(d.member);
        if (d.groups) setGroups(d.groups);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  const name = profile?.displayName ?? displayName;
  const roleLine = profile
    ? [
        profile.jobFunction,
        profile.industry,
        profile.experienceYears ? `${profile.experienceYears}년차` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : job ?? '';

  const leaderBadge = isLeader ? (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        background: 'rgba(255,217,61,0.15)',
        color: '#ffd93d',
        border: '1px solid rgba(255,217,61,0.25)',
      }}
    >
      바닥장
    </span>
  ) : null;

  // Badak 고유 섹션 — 태그, 개설 모임, 안내 메시지
  const extraSections = (
    <>
      {/* 로딩 중 */}
      {loading && (
        <div className="px-6 pb-2 flex items-center justify-center gap-2 text-[12px] text-white/25">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white/15 border-t-amber-400/50 animate-spin" />
          프로필 불러오는 중...
        </div>
      )}

      {/* 태그 섹션 */}
      {profile && (profile.lookingFor.length > 0 || profile.canOffer.length > 0) && (
        <div className="px-6 pb-4 space-y-3">
          {profile.lookingFor.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-semibold text-white/30">원하는 것</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.lookingFor.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-[11px]"
                    style={{
                      background: 'rgba(96,165,250,0.1)',
                      color: '#93c5fd',
                      border: '1px solid rgba(96,165,250,0.2)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.canOffer.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-semibold text-white/30">줄 수 있는 것</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.canOffer.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-[11px]"
                    style={{
                      background: 'rgba(74,222,128,0.1)',
                      color: '#86efac',
                      border: '1px solid rgba(74,222,128,0.2)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 관심 태그 */}
      {profile && profile.interestTags.length > 0 && (
        <div className="px-6 pb-3 flex flex-wrap gap-1.5">
          {profile.interestTags.map((t) => (
            <span
              key={t}
              className="rounded-xl px-2 py-0.5 text-[11px] text-white/30"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 개설한 모임 */}
      {groups.length > 0 && (
        <div className="border-t border-white/6 px-6 py-4">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/35 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5" />
            개설한 모임 {groups.length}
          </div>
          <div className="space-y-2">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/badak/groups/${g.id}`}
                onClick={onClose}
                className="flex items-start justify-between rounded-xl p-3 transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-white/80">
                    {g.title}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-white/30">
                    {g.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {g.location}
                      </span>
                    )}
                    {(g.schedule || g.eventDate) && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {g.schedule ??
                          new Date(g.eventDate!).toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                          })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <span className="text-[11px] text-white/35">
                    {g.currentMembers}/{g.maxMembers}명
                  </span>
                  {g.status === 'confirmed' && (
                    <div className="mt-0.5 text-[9px]" style={{ color: '#a5b4fc' }}>
                      확정
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ID 없을 때 (Mock 데이터) — 안내 메시지 */}
      {!memberId && !loading && (
        <div className="border-t border-white/6 px-6 py-5">
          <p className="text-center text-[12px] text-white/20">
            상세 프로필은 멤버 가입 후 확인할 수 있어요
          </p>
        </div>
      )}
    </>
  );

  return (
    <BottomSheet open onClose={onClose} theme="dark">
      <PublicProfile
        profile={{
          displayName: name,
          avatarUrl: profile?.avatarUrl ?? null,
          roleLine,
          bio: profile?.bio ?? null,
          affiliations: profile?.affiliations ?? [],
          career: profile?.career ?? [],
          isActive: profile?.isActive,
        }}
        badge={leaderBadge}
        extraSections={extraSections}
        theme="dark"
      />
    </BottomSheet>
  );
}
