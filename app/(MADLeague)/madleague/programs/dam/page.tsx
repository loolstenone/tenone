import Link from 'next/link';
import { Users, Building2, GraduationCap } from 'lucide-react';

export const metadata = { title: 'DAM 파티', description: 'Draft Assembly Meeting — 자네 나와 일해 보지 않겠나?' };

export default function DamPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-32 sm:py-40">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">DAM PARTY</div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">
            Draft Assembly<br />Meeting
          </h1>
          <p className="mt-10 max-w-2xl text-xl text-neutral-300 leading-relaxed">
            자네 나와 일해 보지 않겠나?<br />
            현업 광고·마케터와 매드리거가 한자리에서 만나는
            MADLeague의 플래그십 네트워킹 이벤트.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">WHO JOINS</div>
        <h2 className="text-4xl sm:text-5xl font-black mb-16">세 가지 자리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: GraduationCap, title: '학생',  desc: '매드리거는 기본 참여. 일반 학생도 DAM 티켓으로 신청 가능.' },
            { icon: Users,         title: '현업',  desc: '광고·마케팅 실무자. 멘토링·네트워킹·강연.' },
            { icon: Building2,     title: '기업',  desc: '부스 운영, 채용 설명, 경쟁PT 과제기업 매칭.' },
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
            <div className="text-sm font-bold tracking-widest text-white/70 mb-3">NEXT DAM</div>
            <div className="text-3xl sm:text-4xl font-black text-white">일정 공지 예정</div>
          </div>
          <Link href="mailto:lools@tenone.biz" className="inline-flex items-center gap-2 bg-black text-white font-bold px-10 py-5 text-lg">
            사전 문의
          </Link>
        </div>
      </section>
    </div>
  );
}
