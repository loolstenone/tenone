import { Clock, Zap, Users } from 'lucide-react';

export const metadata = { title: '마케톤', description: 'Marketing + Hacking + Marathon — 72시간의 열정' };

export default function MarkethonPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,192,0,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-32 sm:py-40">
          <div className="text-xs font-bold tracking-widest text-[#FFC000]">MARKETHON</div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">72시간의<br />열정</h1>
          <p className="mt-6 text-2xl sm:text-3xl font-black text-[#FFC000]">
            Marketing + Hacking + Marathon
          </p>
          <p className="mt-8 max-w-2xl text-xl text-neutral-300 leading-relaxed">
            3일 동안 잠도 잊고, 생각도 멈추지 않고.<br />
            한계까지 밀어붙이는 매드리거의 시그니처 프로그램.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Clock,  title: '72시간',    desc: '금요일 저녁부터 월요일 아침까지. 논스톱.' },
            { icon: Zap,    title: '해커톤 형식', desc: '브리프 공개 → 즉석 팀 구성 → 실시간 멘토링 → 최종 발표.' },
            { icon: Users,  title: '크로스 권역', desc: '전국 7개 동아리 매드리거가 한 공간에 모입니다.' },
          ].map((c) => (
            <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-12">
              <c.icon className="h-10 w-10 text-[#FFC000]" />
              <div className="mt-8 text-3xl font-black">{c.title}</div>
              <p className="mt-4 text-lg text-neutral-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
