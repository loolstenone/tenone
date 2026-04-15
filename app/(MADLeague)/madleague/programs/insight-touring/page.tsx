import { MapPin, Eye, Lightbulb } from 'lucide-react';

export const metadata = { title: '인사이트 투어링', description: '지역·기업을 돌며 혁신 제안' };

export default function InsightTouringPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">INSIGHT TOURING</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            당신의 통찰이<br />지역을 바꾼다
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            지역과 기업을 직접 방문하고 현장의 목소리를 듣습니다.
            그 후 매드리거만의 시선으로 혁신 전략을 제안하는 프로그램.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: MapPin, title: '지역 투어', desc: '지역 산업·문화·거점을 현장에서 직접 탐구.' },
          { icon: Eye, title: '관찰 · 인터뷰', desc: '대표·실무자 인터뷰, 소비자 관찰, 경쟁사 답사.' },
          { icon: Lightbulb, title: '혁신 제안', desc: '학생의 시선으로 재해석한 전략 제안서 제출.' },
        ].map((c) => (
          <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-10">
            <c.icon className="h-8 w-8 text-[#EC1D25]" />
            <div className="mt-6 text-2xl font-black">{c.title}</div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
