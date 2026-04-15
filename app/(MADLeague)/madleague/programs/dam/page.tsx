import { Users, Building2, GraduationCap } from 'lucide-react';

export const metadata = { title: 'DAM 파티', description: 'Digital Advertising Meeting — 기업·학생 네트워킹' };

export default function DamPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">DAM PARTY</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            Digital Advertising<br />Meeting
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            현업 광고·마케터 200명, 매드리거 400명, 기업 30개가 1박 2일간 모이는
            MADLeague의 플래그십 네트워킹 이벤트.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">WHO JOINS</div>
        <h2 className="text-3xl font-black mb-10">세 가지 자리</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: GraduationCap, title: '학생', desc: '매드리거는 기본 참여. 일반 학생도 DAM 티켓으로 신청 가능.' },
            { icon: Users, title: '현업', desc: '광고·마케팅 실무자. 멘토링·네트워킹·강연.' },
            { icon: Building2, title: '기업', desc: '부스 운영, 채용 설명, 경쟁PT 과제기업 매칭.' },
          ].map((c) => (
            <div key={c.title} className="bg-neutral-950 border border-neutral-900 p-10">
              <c.icon className="h-8 w-8 text-[#EC1D25]" />
              <div className="mt-6 text-2xl font-black">{c.title}</div>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">NEXT DAM</div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">일정 공지 예정</div>
            <p className="mt-2 text-white/80 text-sm">참가 신청 페이지는 곧 오픈됩니다.</p>
          </div>
          <a href="mailto:info@madleague.net" className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4">사전 문의</a>
        </div>
      </section>
    </div>
  );
}
