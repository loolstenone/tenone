import Link from 'next/link';
import { Briefcase, Users, Target } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'PJT', description: 'MADLeague 실전 프로젝트 OJT' };

export default function ProjectPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-32 sm:py-40">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">PJT</div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">
            Project Job<br />Training
          </h1>
          <p className="mt-10 max-w-2xl text-xl text-neutral-300 leading-relaxed">
            기업의 실전 프로젝트를 통해<br />
            현장에서 배우는 인턴 프로그램.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Briefcase, title: '실제 과제', desc: '기업이 실제로 필요로 하는 마케팅 과제를 진행합니다.' },
            { icon: Users,     title: '크로스 팀', desc: '동아리·권역을 넘어 다양한 배경의 크루로 구성됩니다.' },
            { icon: Target,    title: '결과 책임', desc: '과제를 완수하고 결과를 납품합니다. 기업 피드백이 성장 지표.' },
          ].map((c) => (
            <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-12">
              <c.icon className="h-10 w-10 text-[#EC1D25]" />
              <div className="mt-8 text-3xl font-black">{c.title}</div>
              <p className="mt-4 text-lg text-neutral-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-3xl sm:text-4xl font-black text-white">PJT 참여 기업 모집</div>
          <Link href="mailto:lools@tenone.biz" className="inline-flex items-center gap-2 bg-black text-white font-bold px-10 py-5 text-lg">
            문의하기 <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
