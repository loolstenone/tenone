'use client';

import { Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { siteConfigs } from '@/lib/site-config';
import type { SiteIdentifier } from '@/lib/site-config';

/** Universe에서 회원 가입이 가능한 사이트 목록 (authMethods가 하나라도 true) */
const JOINABLE_SITES: { id: SiteIdentifier; name: string; path: string; color: string }[] = (
  Object.values(siteConfigs) as (typeof siteConfigs)[SiteIdentifier][]
)
  .filter(s => s.authMethods.email || s.authMethods.google || s.authMethods.kakao)
  .filter(s => s.id !== 'tenone') // tenone은 기본
  .map(s => ({ id: s.id, name: s.name, path: s.homePath, color: s.colors.primary }));

export function UniverseMembership() {
  const { user } = useAuth();
  if (!user) return null;

  const originSite = (user as Record<string, unknown>).originSite as string | undefined;
  const affiliations = (user as Record<string, unknown>).affiliations as string[] | undefined;

  return (
    <div className="rounded-2xl border tn-border tn-surface p-8">
      <h2 className="text-sm font-semibold text-neutral-700 mb-1 flex items-center gap-2">
        <Globe className="h-4 w-4 tn-text-sub" /> Ten:One™ Universe
      </h2>
      <p className="text-[11px] tn-text-sub mb-5">하나의 계정으로 모든 유니버스 서비스를 이용합니다.</p>

      {/* 가입 경로 */}
      {originSite && (
        <div className="mb-5">
          <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-1">가입 경로</div>
          <span className="inline-flex items-center gap-1.5 text-sm tn-text font-medium">
            {originSite}
          </span>
        </div>
      )}

      {/* 활동 중인 커뮤니티 */}
      {affiliations && affiliations.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-2">활동 중인 커뮤니티</div>
          <div className="flex flex-wrap gap-2">
            {affiliations.map((aff) => {
              const site = siteConfigs[aff as SiteIdentifier];
              return (
                <span
                  key={aff}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: site?.colors.primary || '#d4d4d4', color: site?.colors.primary || '#525252' }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: site?.colors.primary || '#525252' }} />
                  {site?.name || aff}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 이용 가능 사이트 */}
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wider tn-text-sub mb-2">이용 가능한 서비스</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {JOINABLE_SITES.map((s) => {
            const joined = affiliations?.includes(s.id);
            return (
              <a
                key={s.id}
                href={s.path}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-neutral-50"
                style={{ borderColor: joined ? s.color : '#e5e5e5' }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: joined ? s.color : '#d4d4d4' }}
                />
                <span className={joined ? 'font-semibold' : 'tn-text-sub'}>{s.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
