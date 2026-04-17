import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { UniverseProfile, type PublicProfileData } from '@/components/UniverseProfile';
import { ProfileComments } from '@/components/ProfileComments';

function getAnonClient() {
    return createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

function cleanHandle(raw: string) {
    return raw.startsWith('%40') ? raw.slice(3)
        : raw.startsWith('@') ? raw.slice(1)
        : raw;
}

interface Props {
    params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { handle } = await params;
    const h = cleanHandle(handle);
    const { data } = await getAnonClient().rpc('get_public_profile', { p_handle: h });

    if (!data) return { title: '프로필을 찾을 수 없습니다' };
    if (data.profile_visibility === 'private') return { title: `@${h} | Ten:One Universe` };
    return {
        title: `${data.name} (@${h}) | Ten:One Universe`,
        description: data.bio || `${data.name}의 Ten:One Universe 프로필`,
        openGraph: {
            title: `${data.name} | Ten:One Universe`,
            description: data.bio || '',
            ...(data.avatar_url ? { images: [data.avatar_url] } : {}),
        },
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const { handle } = await params;
    const h = cleanHandle(handle);

    // 프로필 데이터 + 현재 로그인 세션 병렬 조회
    const [profileResult, supabase] = await Promise.all([
        getAnonClient().rpc('get_public_profile', { p_handle: h }),
        createServerClient(),
    ]);

    const { data } = profileResult;
    if (!data) notFound();

    // 로그인한 사용자가 프로필 소유자인지 확인 — email 비교 (RLS 우회)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isLoggedIn = !!authUser;
    const isOwner = !!authUser && !!data.email && authUser.email === data.email;

    // 소유자는 /profile 로 redirect (소유자 전용 편집 뷰)
    if (isOwner) redirect('/profile');

    if (data.profile_visibility === 'private') {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                        <Lock className="h-7 w-7 text-neutral-400" />
                    </div>
                </div>
                <h1 className="text-lg font-bold tn-text mb-2">비공개 프로필</h1>
                <p className="text-sm tn-text-sub">@{h}님의 프로필은 비공개로 설정되어 있습니다.</p>
                <Link href="/" className="inline-flex items-center gap-1 mt-6 text-sm tn-text-sub hover:tn-text transition-colors">
                    <ArrowLeft className="h-4 w-4" /> 홈으로
                </Link>
            </div>
        );
    }

    const publicData: PublicProfileData = {
        id: data.id,
        name: data.name,
        handle: data.handle || h,
        email: data.email,
        company: data.company || undefined,
        bio: data.bio || undefined,
        avatarUrl: data.avatar_url || undefined,
        affiliations: data.affiliations || [],
        interestsIndustry: data.interests_industry || [],
        interestsJob: data.interests_job || [],
        profileVisibility: (data.profile_visibility as 'public' | 'private') || 'public',
        role: data.role || 'Member',
        createdAt: data.created_at,
        privacySettings: data.privacy_settings || undefined,
        socialLinks: data.social_links || undefined,
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
            <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-1 text-sm tn-text-sub hover:tn-text transition-colors">
                    <ArrowLeft className="h-4 w-4" /> 홈으로
                </Link>
                {!isLoggedIn && (
                    <Link
                        href={`/login?redirect=/@${h}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium tn-text-sub hover:tn-text border tn-border rounded-lg px-3 py-1.5 transition-colors"
                    >
                        <LogIn className="h-3.5 w-3.5" />
                        로그인
                    </Link>
                )}
            </div>
            <UniverseProfile isOwner={isOwner} publicData={publicData}>
                <ProfileComments
                    targetMemberId={publicData.id}
                    targetHandle={publicData.handle}
                    isOwner={isOwner}
                />
            </UniverseProfile>
        </div>
    );
}
