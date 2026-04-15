import Link from 'next/link';
import { Briefcase, Users, Target } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'PJT', description: 'MADLeague 실전 프로젝트 OJT' };

export default function ProjectPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">PJT</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">실전 프로젝트 OJT</h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            현장에서 배우고, 현장에서 성장한다.<br />
            PJT는 실제 기업의 마케팅 과제를 매드리거가 직접 수행하는 프로그램입니다.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Briefcase, title: '실제 과제', desc: '기업이 실제로 필요로 하는 마케팅 과제를 진행합니다.' },
          { icon: Users, title: '크로스 팀', desc: '동아리·권역을 넘어 다양한 배경의 크루로 구성됩니다.' },
          { icon: Target, title: '결과 책임', desc: 'OJT지만 결과를 납품합니다. 기업 피드백이 성장 지표.' },
        ].map((c) => (
          <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-10">
            <c.icon className="h-8 w-8 text-[#EC1D25]" />
            <div className="mt-6 text-2xl font-black">{c.title}</div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </section>
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl sm:text-3xl font-black text-white">PJT 참여 기업 모집</div>
          <Link href="mailto:info@madleague.net" className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4">문의 <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
