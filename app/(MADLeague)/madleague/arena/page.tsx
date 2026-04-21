import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MessageSquare, FolderKanban, Trophy, ArrowRight } from 'lucide-react';

export const metadata = { title: '아레나', description: '매드 아레나 — 게시판·라이브러리·교육·프로젝트·취업정보' };

export default async function ArenaPage() {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
        return (
            <div className="bg-black text-white min-h-[60vh]">
                <div className="mx-auto max-w-3xl px-6 py-24">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ARENA</div>
                    <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 입장 가능합니다</h1>
                    <p className="mt-6 text-neutral-400">로그인 후 매드리거 연동을 완료하면 아레나에 입장할 수 있습니다.</p>
                    <Link href="/login?redirect=/madleague/arena" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</Link>
                </div>
            </div>
        );
    }

    const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
    if (!memberRow) redirect('/madleague/apply');

    const { data: roleRow } = await sb
        .from('member_roles')
        .select('id')
        .eq('member_id', memberRow.id)
        .in('role', ['approved_member', 'leader', 'mentor', 'corporate', 'staff', 'manager', 'super_admin'])
        .eq('context', 'brand:madleague')
        .eq('is_active', true)
        .maybeSingle();

    const { data: globalAdmin } = roleRow ? { data: null } : await sb
        .from('member_roles')
        .select('id')
        .eq('member_id', memberRow.id)
        .eq('role', 'super_admin')
        .eq('is_active', true)
        .maybeSingle();

    if (!roleRow && !globalAdmin) redirect('/madleague/apply');

    const SECTIONS = [
        {
            key: 'board',
            icon: MessageSquare,
            title: '게시판',
            desc: '자유 소통, 질문, 인사이트 공유. 매드리거끼리 이야기 나누는 공간.',
            href: '/madleague/community',
            cta: '게시판 입장',
        },
        {
            key: 'projects',
            icon: FolderKanban,
            title: '프로젝트',
            desc: '매드리거가 함께 기획하고 실행하는 프로젝트 워크스페이스.',
            href: '/madleague/projects',
            cta: '프로젝트 보기',
        },
        {
            key: 'pt',
            icon: Trophy,
            title: '경쟁PT 워크스페이스',
            desc: '아이디어 무브먼트·PT 경쟁 프로그램 참여 팀의 작업 공간.',
            href: '/madleague/pt',
            cta: 'PT 워크스페이스 입장',
        },
    ];

    return (
        <div className="bg-black text-white min-h-screen">
            {/* 헤더 */}
            <section className="border-b border-neutral-900">
                <div className="mx-auto max-w-6xl px-6 py-16">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MAD LEAGUE · ARENA</div>
                    <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">매드 아레나</h1>
                    <p className="mt-4 text-sm text-neutral-400 max-w-lg">
                        매드리거가 모여 배우고, 나누고, 성장하는 공간.<br />
                        게시판·라이브러리·교육·프로젝트·취업 정보가 모두 여기에.
                    </p>
                </div>
            </section>

            {/* 섹션 */}
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-col gap-4">
                    {SECTIONS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Link
                                key={s.key}
                                href={s.href}
                                className="group relative bg-neutral-950 border border-neutral-800 hover:border-[#EC1D25] p-8 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Icon className="h-6 w-6 text-[#EC1D25]" />
                                    <span className="font-black text-lg">{s.title}</span>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
                                <div className="mt-6 flex items-center gap-1.5 text-sm font-bold text-[#EC1D25] group-hover:gap-3 transition-all">
                                    {s.cta} <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
