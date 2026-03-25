'use client';

import Link from 'next/link';
import { MapPin, Briefcase, Search, Gift } from 'lucide-react';
import type { BadakProfile } from '@/types/badak';

interface Props {
  profile: BadakProfile;
  variant?: 'compact' | 'full' | 'mini';
}

export default function ProfileCard({ profile, variant = 'compact' }: Props) {
  const initials = profile.displayName.charAt(0).toUpperCase();
  const levelShort = profile.jobLevel.replace(/\s*\(.*\)/, '');

  if (variant === 'mini') {
    return (
      <Link href={`/bk/profile/${profile.id}`} className="flex items-center gap-2.5 rounded-lg border border-neutral-200 p-2.5 hover:bg-neutral-50 transition-colors">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{initials}</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-neutral-900 truncate">{profile.displayName}</div>
          <div className="text-[11px] text-neutral-500 truncate">{profile.jobFunction} · {levelShort}</div>
        </div>
      </Link>
    );
  }

  if (variant === 'full') {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start gap-5">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">{initials}</div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-neutral-900">{profile.displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1"><Briefcase size={13} />{profile.jobFunction}</span>
              <span>·</span>
              <span>{levelShort}</span>
              <span>·</span>
              <span>{profile.experienceYears}년차</span>
              {profile.company && profile.companyVisible && (
                <><span>·</span><span className="flex items-center gap-1"><MapPin size={13} />{profile.company}</span></>
              )}
            </div>
            {profile.industry && (
              <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{profile.industry}</span>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{profile.bio}</p>

        <div className="mt-5 space-y-3">
          {profile.lookingFor.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-600"><Search size={12} />찾고 있는 것</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.lookingFor.map(tag => <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{tag}</span>)}
              </div>
            </div>
          )}
          {profile.canOffer.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><Gift size={12} />줄 수 있는 것</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.canOffer.map(tag => <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{tag}</span>)}
              </div>
            </div>
          )}
          {profile.interestTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interestTags.map(tag => <span key={tag} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500">#{tag}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // compact (기본) — 탐색 그리드용
  return (
    <Link href={`/bk/profile/${profile.id}`} className="group block rounded-xl border border-neutral-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">{initials}</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">{profile.displayName}</div>
          <div className="text-xs text-neutral-500">{profile.jobFunction} · {levelShort} · {profile.experienceYears}년</div>
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-600 line-clamp-2">{profile.bio}</p>

      <div className="mt-3 space-y-1.5">
        {profile.lookingFor.length > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <Search size={10} className="text-blue-500 shrink-0" />
            <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
              {profile.lookingFor.slice(0, 3).map(tag => <span key={tag} className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">{tag}</span>)}
              {profile.lookingFor.length > 3 && <span className="text-neutral-400">+{profile.lookingFor.length - 3}</span>}
            </div>
          </div>
        )}
        {profile.canOffer.length > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <Gift size={10} className="text-emerald-500 shrink-0" />
            <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
              {profile.canOffer.slice(0, 3).map(tag => <span key={tag} className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">{tag}</span>)}
              {profile.canOffer.length > 3 && <span className="text-neutral-400">+{profile.canOffer.length - 3}</span>}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
