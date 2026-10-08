import Link from 'next/link';
import Image from 'next/image';
import { Lock, PenSquare, Settings, Users, LayoutGrid } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadAccess } from '@/lib/madleague-roles';
import { clubRoomAccess, CAFE_BOARDS, type ClubRoomAccess } from '@/lib/madleague-club-cafe';
import { MadLoginGate } from '@/features/madleague/MadLoginButton';

/**
 * MADLeague 동아리 방(작은 네이버 카페) — 서버 공용: 입장 확인 + 카페 틀(사이드바)
 * 입장 규칙: lib/madleague-club-cafe.ts · 읽기 범위는 DB 정책(mad_can_access_club)이 2차로 강제
 */
export interface RoomClub { id: string; slug: string; name: string; region: string | null; color: string | null; logo_url: string | null; description: string | null }
export interface RoomContext {
    club: RoomClub;
    access: ClubRoomAccess;
    /** 글쓴이 키 = mad_members.id (관리자 계정은 없을 수 있음 → 읽기·관리만) */
    madMemberId: string | null;
}

/** 입장 확인 — 통과하면 컨텍스트, 아니면 보여줄 화면(로그인·잠금) */
export async function loadRoom(slug: string): Promise<{ ctx: RoomContext } | { gate: React.ReactNode } | null> {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    const admin = createAdminClient();
    const { data: club } = await admin.from('mad_clubs')
        .select('id, slug, name, region, color, logo_url, description').eq('slug', slug).maybeSingle();
    if (!club) return null;
    if (!user) return { gate: <MadLoginGate /> };

    const { data: me } = await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle();
    const access = me ? clubRoomAccess(await getMadAccess(me.id), club.id) : { canEnter: false, isOfficer: false, isStaff: false, myRole: null };
    if (!access.canEnter) return { gate: <LockedRoom club={club as RoomClub} /> };

    const { data: mad } = await admin.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
    return { ctx: { club: club as RoomClub, access, madMemberId: mad?.id ?? null } };
}

function LockedRoom({ club }: { club: RoomClub }) {
    return (
        <div className="bg-black text-white min-h-[70vh] flex items-center justify-center px-6">
            <div className="max-w-md text-center">
                <Lock className="mx-auto h-10 w-10 text-neutral-600" />
                <h1 className="mt-4 text-2xl font-black">{club.name} 동아리 방</h1>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    이 동아리 소속 매드리거(현역·운영진·OB)와 담당 멘토만 들어갈 수 있어요.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href={`/madleague/clubs/${club.slug}`} className="border border-neutral-700 hover:border-white px-5 py-2.5 text-sm font-bold transition">동아리 소개 보기</Link>
                    <Link href={`/madleague/apply?club=${club.slug}`} className="bg-[#EC1D25] hover:bg-[#d01820] px-5 py-2.5 text-sm font-bold transition">{club.name} 매드리거 등록</Link>
                </div>
            </div>
        </div>
    );
}

/** 카페 틀 — 왼쪽 동아리 카드·게시판 목록, 오른쪽 본문 */
export function CafeShell({ ctx, memberCount, active, children }: {
    ctx: RoomContext;
    memberCount: number;
    /** 'home' | 게시판 key | 'members' */
    active: string;
    children: React.ReactNode;
}) {
    const { club, access } = ctx;
    const accent = club.color ?? '#EC1D25';
    const base = `/madleague/clubs/${club.slug}/room`;
    const item = (key: string, href: string, label: React.ReactNode) => (
        <Link key={key} href={href}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition ${active === key ? 'bg-white/10 text-white font-bold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
            {label}
        </Link>
    );
    return (
        <div className="bg-black text-white min-h-screen">
            {/* 대문 띠 */}
            <div className="border-b border-neutral-900" style={{ background: `linear-gradient(90deg, ${accent}33, transparent 60%)` }}>
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <Link href={base} className="text-xs font-bold tracking-widest" style={{ color: accent }}>CLUB ROOM</Link>
                    <h1 className="mt-1 text-3xl font-black">{club.name}</h1>
                    <p className="mt-1 text-sm text-neutral-400">{club.region ?? ''} · MADLeague 공식 동아리</p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="space-y-4">
                    <div className="border border-neutral-800 bg-neutral-950 p-5">
                        <div className="flex items-center gap-3">
                            {club.logo_url
                                ? <Image src={club.logo_url} alt={club.name} width={40} height={40} className="h-10 w-10 object-contain bg-white" />
                                : <div className="h-10 w-10" style={{ backgroundColor: accent }} />}
                            <div>
                                <div className="font-black">{club.name}</div>
                                <div className="text-xs text-neutral-500">멤버 {memberCount}명</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-neutral-400">내 역할 · <span className="text-white font-bold">{access.myRole ?? '—'}</span></div>
                        {ctx.madMemberId ? (
                            <Link href={`${base}/write${active !== 'home' && active !== 'members' ? `?board=${active}` : ''}`}
                                className="mt-4 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                                style={{ backgroundColor: accent }}>
                                <PenSquare className="h-4 w-4" /> 글쓰기
                            </Link>
                        ) : (
                            <p className="mt-4 text-[11px] text-neutral-500">관리자 계정은 읽기·관리만 할 수 있어요.</p>
                        )}
                    </div>

                    <nav className="border border-neutral-800 bg-neutral-950 py-2">
                        {item('home', base, <><LayoutGrid className="h-3.5 w-3.5" /> 카페 대문</>)}
                        {item('all', `${base}?board=all`, '전체글 보기')}
                        <div className="my-1 border-t border-neutral-900" />
                        {CAFE_BOARDS.map(b => item(b.key, `${base}?board=${b.key}`, b.label))}
                        <div className="my-1 border-t border-neutral-900" />
                        {item('members', `${base}?tab=members`, <><Users className="h-3.5 w-3.5" /> 멤버</>)}
                        {access.isOfficer && item('manage', `/madleague/clubs/${club.slug}/manage`, <><Settings className="h-3.5 w-3.5" /> 동아리 관리</>)}
                    </nav>
                </aside>

                <main className="lg:col-span-3 min-w-0">{children}</main>
            </div>
        </div>
    );
}
