import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Link2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { UniverseProfile } from '@/components/UniverseProfile';
import { ProfileComments } from '@/components/ProfileComments';
import { ProfileViewBeacon } from '@/components/profile/ProfileViewBeacon';
import { ProfileReportButton } from '@/components/profile/ProfileReportButton';
import { ProfileInvite } from '@/components/profile/ProfileInvite';
import { HANDLE_RE, toPublicProfileData, type PublicProfileRow } from '@/lib/profile/public-profile';

/**
 * 유니버스 공개 프로필 — tenone.biz/@핸들
 *
 * 공개 항목은 DB(get_public_profile → profile_public_payload)가 정한다. 화면은 받은 값만 그린다.
 * - 비공개: 기한 있는 공유 링크(?s=토큰)를 받은 사람만 본다 — 검색 제외·리퍼러 차단
 * - 검색 노출: 본인이 따로 켠 경우에만 (기본 noindex)
 * - 옛 핸들(30일 내): 새 주소로 이동
 */

function getAnonClient() {
    return createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

function cleanHandle(raw: string) {
    const h = (raw.startsWith('%40') ? raw.slice(3)
        : raw.startsWith('@') ? raw.slice(1)
        : raw).toLowerCase();
    return HANDLE_RE.test(h) ? h : '';
}

function cleanShareToken(raw: string | string[] | undefined) {
    return typeof raw === 'string' && /^[0-9a-f]{64}$/.test(raw) ? raw : undefined;
}

const NOINDEX = { index: false, follow: false } as const;

interface Props {
    params: Promise<{ handle: string }>;
    searchParams: Promise<{ s?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { handle } = await params;
    const h = cleanHandle(handle);
    if (!h) return { title: '프로필을 찾을 수 없습니다', robots: NOINDEX };

    // 공유 링크로 연 화면: 이름·소개를 미리보기에 싣지 않는다 (링크 열람 수도 여기서 올리지 않는다)
    if (cleanShareToken((await searchParams).s)) {
        return { title: `@${h} | Ten:One™ Universe`, robots: NOINDEX, referrer: 'no-referrer' };
    }

    const { data } = await getAnonClient().rpc('get_public_profile', { p_handle: h });
    const row = data as PublicProfileRow | null;
    if (!row || row.moved_to) return { title: '프로필을 찾을 수 없습니다', robots: NOINDEX };
    if (row.profile_visibility !== 'public') return { title: `@${h} | Ten:One™ Universe`, robots: NOINDEX };
    return {
        title: `${row.name} (@${h}) | Ten:One™ Universe`,
        description: row.bio || `${row.name}의 Ten:One™ Universe 프로필`,
        robots: row.searchable ? { index: true, follow: true } : NOINDEX,
        openGraph: {
            title: `${row.name} | Ten:One™ Universe`,
            description: row.bio || '',
            // 미리보기 이미지는 opengraph-image.tsx (이름·핸들 카드)
        },
    };
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
    const { handle } = await params;
    const h = cleanHandle(handle);
    if (!h) notFound();
    const share = cleanShareToken((await searchParams).s);

    // 프로필 데이터 + 현재 로그인 세션 병렬 조회
    const [profileResult, supabase] = await Promise.all([
        getAnonClient().rpc('get_public_profile', share ? { p_handle: h, p_share: share } : { p_handle: h }),
        createServerClient(),
    ]);

    const row = profileResult.data as PublicProfileRow | null;
    if (!row) notFound();
    if (row.moved_to) redirect(`/@${row.moved_to}`);

    // 로그인한 사용자가 프로필 소유자인지 확인 — 본인 members 행(RLS: auth_id = auth.uid())의 id 비교
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isLoggedIn = !!authUser;
    let isOwner = false;
    if (authUser && row.id) {
        const { data: me } = await supabase.from('members').select('id').eq('auth_id', authUser.id).maybeSingle();
        isOwner = me?.id === row.id;
    }

    // 소유자는 /profile 로 redirect (소유자 전용 편집 뷰)
    if (isOwner) redirect('/profile');

    const viaShare = !!row.via_share;
    if (row.profile_visibility !== 'public' && !viaShare) {
        return <ProfileInvite variant={share ? 'expired' : 'private'} handle={h} />;
    }

    const publicData = toPublicProfileData(row, h);
    const isPublic = row.profile_visibility === 'public';

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
            <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-1 text-sm tn-text-sub hover:tn-text transition-colors">
                    <ArrowLeft className="h-4 w-4" /> 홈으로
                </Link>
                {!isLoggedIn && (
                    <Link
                        href={`/login?redirect=${encodeURIComponent(`/@${h}`)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium tn-text-sub hover:tn-text border tn-border rounded-lg px-3 py-1.5 transition-colors"
                    >
                        <LogIn className="h-3.5 w-3.5" />
                        로그인
                    </Link>
                )}
            </div>
            {viaShare && !isPublic && (
                <p className="flex items-center gap-1.5 text-xs tn-text-sub border tn-border rounded-xl px-4 py-3">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    공유 링크로 열린 비공개 프로필입니다. 링크를 다른 곳에 옮기지 말아 주세요.
                </p>
            )}
            <UniverseProfile isOwner={false} publicData={publicData}>
                {isPublic && (
                    <ProfileComments
                        targetMemberId={publicData.id}
                        targetHandle={publicData.handle}
                        isOwner={false}
                    />
                )}
            </UniverseProfile>
            {isPublic && <ProfileReportButton targetMemberId={publicData.id} />}
            {isPublic && !viaShare && <ProfileViewBeacon handle={h} />}
        </div>
    );
}
