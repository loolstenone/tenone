import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Link2 } from 'lucide-react';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { BrandPublicProfile } from '@/features/profile/BrandPublicProfile';
import { MadProfileSection, type MadSection } from '@/features/madleague/MadProfileSection';
import { ProfileInvite } from '@/components/profile/ProfileInvite';
import { ProfileReportButton } from '@/components/profile/ProfileReportButton';
import { ProfileViewBeacon } from '@/components/profile/ProfileViewBeacon';
import { BRAND_PROFILES } from '@/lib/profile/brand-profiles';
import { HANDLE_RE, type BrandProfileRow } from '@/lib/profile/public-profile';

/**
 * MAD League 공개 프로필 — www.madleague.net/@핸들 (경로 모드 /madleague/@핸들)
 * middleware가 /@핸들 → /madleague/u/{핸들} 로 보낸다 (lib/profile/brand-profiles.ts)
 * 공개 항목 = DB get_brand_profile(…, 'madleague') · 비공개는 MADLeague 범위 공유 링크(?s=)로만
 */
const cfg = BRAND_PROFILES.madleague;
const NOINDEX = { index: false, follow: false } as const;

function anon() {
    return createAnonClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
function cleanHandle(raw: string) {
    const h = decodeURIComponent(raw).replace(/^@/, '').toLowerCase();
    return HANDLE_RE.test(h) ? h : '';
}
function cleanShareToken(raw: string | string[] | undefined) {
    return typeof raw === 'string' && /^[0-9a-f]{64}$/.test(raw) ? raw : undefined;
}

interface Props {
    params: Promise<{ handle: string }>;
    searchParams: Promise<{ s?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const h = cleanHandle((await params).handle);
    if (!h) return { title: '프로필을 찾을 수 없습니다', robots: NOINDEX };
    if (cleanShareToken((await searchParams).s)) return { title: `@${h}`, robots: NOINDEX, referrer: 'no-referrer' };

    const { data } = await anon().rpc('get_brand_profile', { p_handle: h, p_brand: cfg.siteId });
    const row = data as BrandProfileRow | null;
    if (!row || row.moved_to) return { title: '프로필을 찾을 수 없습니다', robots: NOINDEX };
    if (row.profile_visibility !== 'public') return { title: `@${h}`, robots: NOINDEX };
    return {
        title: `${row.name} (@${h})`,
        description: row.bio || `${row.name}의 ${cfg.name} 프로필`,
        robots: row.searchable ? { index: true, follow: true } : NOINDEX,
        openGraph: { title: `${row.name} | ${cfg.name}`, description: row.bio || '' },
    };
}

export default async function MadPublicProfilePage({ params, searchParams }: Props) {
    const h = cleanHandle((await params).handle);
    if (!h) notFound();
    const share = cleanShareToken((await searchParams).s);

    const [res, supabase] = await Promise.all([
        anon().rpc('get_brand_profile', share
            ? { p_handle: h, p_brand: cfg.siteId, p_share: share }
            : { p_handle: h, p_brand: cfg.siteId }),
        createServerClient(),
    ]);
    const row = res.data as BrandProfileRow | null;
    if (!row) notFound();
    if (row.moved_to) redirect(`${cfg.prefix}/@${row.moved_to}`);

    const viaShare = !!row.via_share;
    const isPublic = row.profile_visibility === 'public';
    if (!isPublic && !viaShare) {
        return (
            <div className="min-h-screen bg-black text-white">
                <ProfileInvite variant={share ? 'expired' : 'private'} handle={h} brand={cfg} />
            </div>
        );
    }

    // 본인이 보면 설정으로 가는 줄을 보여 준다 (본인 화면 = 마이페이지)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let isOwner = false;
    if (authUser && row.id) {
        const { data: me } = await supabase.from('members').select('id').eq('auth_id', authUser.id).maybeSingle();
        isOwner = me?.id === row.id;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {(viaShare && !isPublic) && (
                <p className="max-w-3xl mx-auto px-6 pt-28 -mb-20 flex items-center gap-2 text-sm text-neutral-400">
                    <Link2 className="h-4 w-4 shrink-0" /> 공유 링크로 열린 비공개 프로필입니다. 링크를 다른 곳에 옮기지 말아 주세요.
                </p>
            )}
            {isOwner && (
                <p className="max-w-3xl mx-auto px-6 pt-28 -mb-20 text-sm text-neutral-400">
                    내 프로필입니다. 공개 항목은 <a href={cfg.myPath} className="underline underline-offset-4 text-white">마이페이지</a>에서 바꿀 수 있습니다.
                </p>
            )}
            <BrandPublicProfile
                row={row}
                cfg={cfg}
                section={<MadProfileSection section={row.section as MadSection} basePath={cfg.prefix} />}
                footer={isPublic && row.id && !isOwner ? <ProfileReportButton targetMemberId={row.id} scope={cfg.siteId} dark /> : undefined}
            />
            {isPublic && !viaShare && !isOwner && <ProfileViewBeacon handle={h} scope={cfg.siteId} />}
        </div>
    );
}
