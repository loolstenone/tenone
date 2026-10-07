import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadAccess } from '@/lib/madleague-roles';
import { MessageSquare, Trophy, Users, ArrowRight, MapPin } from 'lucide-react';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';

export const metadata = { title: '매드리거', description: '매드리거 전용 공간 — 내 동아리 · 내 프로그램 · 자유 게시판' };

// 매드리거 홈 = 내 대시보드 (2026-10-08 구조 개편)
//   내 동아리 — 소속 동아리 정보 (동아리별 게시판은 두지 않음, 사용자 결정)
//   내 프로그램 — 참여 중인 프로그램 회차의 팀 공간
//   자유 게시판 — 전체 매드리거 소통
const CATEGORY_LABEL: Record<string, string> = { free: '자유', question: '질문', share: '공유', insight: '인사이트', pinboard: '핀보드', notice: '공지' };

interface ClubRow { id: string; slug: string; name: string; region: string | null; logo_url: string | null; color: string | null }
interface MyProgram { teamId: string; teamName: string; role: string; compTitle: string; status: string; presentationDate: string | null }
interface PostRow { id: string; title: string; category: string; created_at: string }

export default async function MadleaguerPage() {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
        return (
            <div className="bg-black text-white min-h-[60vh]">
                <div className="mx-auto max-w-3xl px-6 py-24">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADLEAGUER</div>
                    <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 입장 가능합니다</h1>
                    <p className="mt-6 text-neutral-400">로그인 후 매드리거 연동을 완료하면 매드리거 공간에 입장할 수 있습니다.</p>
                    <MadLoginButton className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</MadLoginButton>
                </div>
            </div>
        );
    }

    const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
    if (!memberRow) redirect('/madleague/apply');

    // 매드리거(club·showcase 활동 역할) 또는 직원만 — member_capability_roles SSOT
    const access = await getMadAccess(memberRow.id);
    if (!access.canEnter) redirect('/madleague/apply');

    // 입장 확인 후 서버에서만 읽는다 (화면에 필요한 필드만)
    const admin = createAdminClient();

    // 내 동아리 = club 활동 역할의 context.club_id
    const clubRoles = access.roles.filter(r => r.capability_key === 'club' && typeof r.context?.club_id === 'string');
    const clubIds = [...new Set(clubRoles.map(r => r.context!.club_id as string))];
    const { data: clubs } = clubIds.length > 0
        ? await admin.from('mad_clubs').select('id, slug, name, region, logo_url, color').in('id', clubIds)
        : { data: [] as ClubRow[] };
    const roleByClub = new Map(clubRoles.map(r => [r.context!.club_id as string, r.role]));

    // 내 프로그램 = 내가 속한 팀 (진행·예정 회차 우선)
    const { data: madMember } = await admin.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
    let programs: MyProgram[] = [];
    if (madMember) {
        const { data: links } = await admin
            .from('mad_team_members')
            .select('role, mad_competition_teams(id, name, mad_competitions(title, status, presentation_date))')
            .eq('member_id', madMember.id);
        type Link = { role: string; mad_competition_teams: { id: string; name: string; mad_competitions: { title: string; status: string; presentation_date: string | null } | null } | null };
        programs = ((links ?? []) as unknown as Link[])
            .filter(l => l.mad_competition_teams?.mad_competitions)
            .map(l => ({
                teamId: l.mad_competition_teams!.id,
                teamName: l.mad_competition_teams!.name,
                role: l.role,
                compTitle: l.mad_competition_teams!.mad_competitions!.title,
                status: l.mad_competition_teams!.mad_competitions!.status,
                presentationDate: l.mad_competition_teams!.mad_competitions!.presentation_date,
            }))
            .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed'));
    }

    // 자유 게시판 최근 글
    const { data: posts } = await admin
        .from('mad_posts')
        .select('id, title, category, created_at')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="bg-black text-white min-h-screen">
            {/* 헤더 */}
            <section className="border-b border-neutral-900">
                <div className="mx-auto max-w-6xl px-6 py-16">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MAD LEAGUE · MADLEAGUER</div>
                    <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">매드리거</h1>
                    <p className="mt-4 text-sm text-neutral-400 max-w-lg">
                        내 동아리, 참여 중인 프로그램, 매드리거 소통을 한곳에서.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 내 동아리 */}
                <section className="bg-neutral-950 border border-neutral-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="h-5 w-5 text-[#EC1D25]" />
                        <h2 className="font-black text-lg">내 동아리</h2>
                    </div>
                    {(clubs ?? []).length === 0 ? (
                        <div className="text-sm text-neutral-500 leading-relaxed">
                            {access.isStaff ? '운영진 계정입니다. 소속 동아리가 없습니다.' : '소속 동아리 정보가 없습니다.'}
                            <Link href="/madleague/clubs" className="mt-4 flex items-center gap-1.5 font-bold text-neutral-300 hover:text-white">
                                동아리 둘러보기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {(clubs as ClubRow[]).map(c => (
                                <li key={c.id}>
                                    <Link href={`/madleague/clubs/${c.slug}`} className="group flex items-center gap-4">
                                        {c.logo_url ? (
                                            <Image src={c.logo_url} alt={c.name} width={48} height={48} className="h-12 w-12 object-contain bg-white" />
                                        ) : (
                                            <div className="h-12 w-12" style={{ backgroundColor: c.color ?? '#EC1D25' }} />
                                        )}
                                        <div>
                                            <div className="font-black group-hover:text-[#EC1D25] transition">{c.name}</div>
                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                                                <MapPin className="h-3 w-3" /> {c.region ?? '—'} · {roleByClub.get(c.id)}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* 내 프로그램 */}
                <section className="bg-neutral-950 border border-neutral-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="h-5 w-5 text-[#EC1D25]" />
                        <h2 className="font-black text-lg">내 프로그램</h2>
                    </div>
                    {programs.length === 0 ? (
                        <div className="text-sm text-neutral-500 leading-relaxed">
                            참여 중인 프로그램 팀이 없습니다. 열린 프로그램에 참가 신청하면 운영진이 팀을 배정합니다.
                            <Link href="/madleague/programs" className="mt-4 flex items-center gap-1.5 font-bold text-neutral-300 hover:text-white">
                                프로그램 보기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {programs.map(p => (
                                <li key={p.teamId}>
                                    <Link href="/madleague/pt" className="group block">
                                        <div className="font-black group-hover:text-[#EC1D25] transition">{p.compTitle}</div>
                                        <div className="mt-0.5 text-xs text-neutral-500">
                                            {p.teamName} · {p.role === 'leader' ? '팀장' : '팀원'}
                                            {p.status !== 'completed' && p.presentationDate && ` · 발표 ${new Date(p.presentationDate).toLocaleDateString('ko-KR')}`}
                                            {p.status === 'completed' && ' · 종료'}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link href="/madleague/pt" className="mt-6 flex items-center gap-1.5 text-sm font-bold text-[#EC1D25] hover:gap-3 transition-all">
                        경쟁 PT 워크스페이스 <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>

                {/* 자유 게시판 */}
                <section className="bg-neutral-950 border border-neutral-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="h-5 w-5 text-[#EC1D25]" />
                        <h2 className="font-black text-lg">자유 게시판</h2>
                    </div>
                    {(posts ?? []).length === 0 ? (
                        <p className="text-sm text-neutral-500">아직 글이 없습니다. 첫 글을 남겨 보세요.</p>
                    ) : (
                        <ul className="space-y-3">
                            {(posts as PostRow[]).map(p => (
                                <li key={p.id}>
                                    <Link href={`/madleague/community/${p.id}`} className="group flex items-baseline gap-2 text-sm">
                                        <span className="shrink-0 text-xs font-bold text-neutral-500">{CATEGORY_LABEL[p.category] ?? p.category}</span>
                                        <span className="truncate text-neutral-200 group-hover:text-white">{p.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link href="/madleague/community" className="mt-6 flex items-center gap-1.5 text-sm font-bold text-[#EC1D25] hover:gap-3 transition-all">
                        게시판 입장 <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
