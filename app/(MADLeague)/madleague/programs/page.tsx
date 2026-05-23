import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: '프로그램',
  description: 'MADLeague 7가지 실전 무대',
};

const programs = [
  {
    href: '/madleague/programs/competition',
    title: '경쟁 PT',
    desc: '실제 기업 과제에 동아리가 경쟁한다. MAD Crown을 향해.',
    featured: true,
  },
  {
    href: '/madleague/programs/project',
    title: 'PJT',
    desc: '실전 프로젝트 OJT — 현장에서 배우고, 현장에서 성장한다.',
  },
  {
    href: '/madleague/programs/markethon',
    title: '마케톤',
    desc: 'Marketing + Hacking + Marathon — 72시간의 열정.',
  },
  {
    href: '/madleague/programs/insight-touring',
    title: '인사이트 투어링',
    desc: '지역·기업을 돌며 혁신 제안. 당신의 통찰이 지역을 바꾼다.',
  },
  {
    href: '/madleague/programs/im',
    title: '아이디어 무브먼트',
    desc: '연말 전국 대학생 아이디어 쇼케이스. 내 아이디어로 세상을 바꾼다.',
  },
  {
    href: '/madleague/programs/hero',
    title: '히어로 프로그램',
    desc: 'HeRo와 연계한 커리어 솔루션 — 취업·인턴 연결.',
  },
  {
    href: '/madleague/programs/dam',
    title: 'DAM 파티',
    desc: 'Digital Advertising Meeting — 기업-학생 네트워킹 허브.',
  },
];

export default function ProgramsPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">PROGRAMS</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            7가지 실전 무대
          </h1>
          <p className="mt-6 max-w-xl text-neutral-400 leading-relaxed">
            MADLeague는 학생이 실전을 경험할 수 있는 7가지 프로그램을 운영한다.
            각 프로그램마다 방식은 다르지만, 결국 하나를 남긴다 — <span className="text-white">진짜 경험</span>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative p-10 border transition ${
                p.featured
                  ? 'bg-[#EC1D25] border-[#EC1D25] hover:bg-[#d01820]'
                  : 'bg-neutral-950 border-neutral-900 hover:border-[#EC1D25]'
              }`}
            >
              <div className="text-3xl font-black text-white">{p.title}</div>
              <div className={`mt-4 text-sm leading-relaxed ${p.featured ? 'text-white/90' : 'text-neutral-400'}`}>
                {p.desc}
              </div>
              <ArrowRight className={`mt-8 h-5 w-5 ${p.featured ? 'text-white' : 'text-neutral-600 group-hover:text-[#EC1D25]'} transition`} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
