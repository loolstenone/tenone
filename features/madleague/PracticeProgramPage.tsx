import Link from 'next/link';
import { ArrowRight, Dumbbell, Briefcase } from 'lucide-react';
import { ProgramForms } from '@/features/madleague/ProgramForms';

/**
 * MADLeague 실전 훈련 프로그램 공용 페이지 — RooKie(크리에이티브) · Planner's(전략 기획)
 * 훈련 + 실전 프로젝트 참여. 참가 신청서는 인트라 › 참가 신청에서 프로그램 키로 만들면 자동으로 붙는다 (form-programs.ts)
 */
export function PracticeProgramPage({ programKey, eyebrow, title, field, summary, accent }: {
    programKey: string;
    eyebrow: string;
    title: string;
    /** 훈련 분야 (예: 크리에이티브 · 전략 기획) */
    field: string;
    summary: string;
    accent: string;
}) {
    return (
        <div className="bg-[var(--mad-black,#000)] text-white">
            <section className="relative overflow-hidden border-b border-neutral-900">
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, ${accent}2e, transparent 60%)` }} aria-hidden />
                <div className="relative mx-auto max-w-5xl px-6 py-32 sm:py-40">
                    <div className="text-xs font-bold tracking-widest" style={{ color: accent }}>{eyebrow}</div>
                    <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">{title}</h1>
                    <p className="mt-8 max-w-2xl text-xl sm:text-2xl text-neutral-300 leading-relaxed">{summary}</p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { icon: Dumbbell, title: `실전 ${field} 훈련`, desc: `실전 ${field} 역량을 훈련합니다.` },
                        { icon: Briefcase, title: '실전 프로젝트 참여', desc: '훈련한 역량으로 실전 프로젝트에 참여할 기회가 주어집니다.' },
                    ].map(c => (
                        <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-12">
                            <c.icon className="h-10 w-10" style={{ color: accent }} />
                            <div className="mt-8 text-3xl font-black">{c.title}</div>
                            <p className="mt-4 text-lg text-neutral-400 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ backgroundColor: accent }}>
                <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <div className="text-sm font-bold tracking-widest text-black/60 mb-3">APPLY</div>
                        <div className="text-3xl sm:text-4xl font-black text-black">{title} 참가</div>
                        <div className="mt-4">
                            <ProgramForms program={programKey} fallback={<p className="text-black/70">다음 모집 일정은 공지 예정입니다.</p>} />
                        </div>
                    </div>
                    <Link href="/madleague/apply" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-10 py-5 text-lg transition shrink-0">
                        매드리거 등록 <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
