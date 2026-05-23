import Link from 'next/link';
import { Briefcase, UserCheck, ArrowRight } from 'lucide-react';

export const metadata = { title: '히어로 프로그램', description: 'HeRo와 연계한 커리어 솔루션 — 취업·인턴 연결' };

export default function HeroProgramPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-32 sm:py-40">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">HERO PROGRAM</div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">
            히어로 프로그램
          </h1>
          <p className="mt-10 max-w-2xl text-xl text-neutral-300 leading-relaxed">
            MADLeague × HeRo 커리어 연결 프로그램.<br />
            실전 경험을 쌓은 매드리거가 인재 채용·인턴 연결까지 이어지는 커리어 솔루션.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">HOW IT WORKS</div>
        <h2 className="text-4xl sm:text-5xl font-black mb-16">두 가지 연결</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Briefcase,
              title: '인턴 연결',
              desc: '매드리그 활동을 증명하고 HeRo 파트너 기업의 인턴십에 우선 지원. 포트폴리오가 곧 서류다.',
            },
            {
              icon: UserCheck,
              title: '채용 연결',
              desc: '경쟁PT 수상·프로젝트 성과를 보유한 매드리거를 HeRo가 파트너 기업에 직접 매칭한다.',
            },
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
          <div>
            <div className="text-sm font-bold tracking-widest text-white/70 mb-3">APPLY</div>
            <div className="text-3xl sm:text-4xl font-black text-white">지금 매드리거로 시작하자</div>
            <p className="mt-3 text-white/80">경험이 커리어가 되는 길 — 히어로 프로그램이 연결한다.</p>
          </div>
          <Link href="/madleague/apply" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-10 py-5 text-lg transition">
            지원하기 <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
