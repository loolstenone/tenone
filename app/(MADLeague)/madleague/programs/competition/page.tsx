import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Users, Search, Lightbulb, Presentation, ArrowRight } from 'lucide-react';

export const revalidate = 300;

export const metadata = {
  title: '경쟁 PT — Hall of Fame',
  description: '실제 기업 과제에 동아리가 경쟁. MADLeague 경쟁PT 수상작 아카이브.',
};

const STEPS = [
  { icon: Search,       title: '클라이언트 RFP',       desc: '실제 기업이 마케팅 과제를 RFP 형식으로 제시한다.' },
  { icon: Users,        title: '동아리별 팀 구성',       desc: '동아리 내 4~6인으로 팀을 꾸린다.' },
  { icon: Lightbulb,    title: '클라이언트 OT',         desc: '기업 담당자가 직접 과제 배경과 목표를 설명한다.' },
  { icon: Trophy,       title: '지역 예선 → 본선 진출',  desc: '지역 예선을 통과한 팀만 본선 무대에 오른다.' },
  { icon: Presentation, title: '본선 경쟁 프레젠테이션', desc: '현업 심사위원단 앞에서 전략을 발표한다. 최고의 전략이 MAD Crown을 받는다.' },
];

const ARCHIVE = [
  {
    year: 2025,
    round: '2차',
    client: '리제로스',
    desc: '자연친화 스타트업 리제로스에서 개발한 배달, 포장 음식 냉매제에 대한 시장 진출 전략',
    logo: '/logos/madleague/rezerouslogo.png',
    awards: [
      { img: '/logos/madleague/25-1gold.png',   label: 'MAD Crown' },
      { img: '/logos/madleague/25-1silver.png',  label: '2위' },
      { img: '/logos/madleague/25-1bronze.png',  label: '3위' },
    ],
  },
  {
    year: 2025,
    round: '1차',
    client: '대성학원',
    desc: '대성학원 연간 소셜 캠페인 제안',
    logo: '/logos/madleague/daesunglogo.png',
    awards: [
      { img: '/logos/madleague/25gold.png',    label: 'MAD Crown' },
      { img: '/logos/madleague/25silver.png',  label: '2위' },
      { img: '/logos/madleague/25silver2.png', label: '3위' },
      { img: '/logos/madleague/25silver3.png', label: '4위' },
    ],
  },
  {
    year: 2024,
    round: '',
    client: '지평주조',
    desc: '지평 막걸리 100주년을 기점으로 지역을 벗어나 전국 막걸리가 되기 위한 전략 제안',
    logo: '/logos/madleague/지평로고.png',
    awards: [
      { img: '/logos/madleague/24gold.png',   label: 'MAD Crown' },
      { img: '/logos/madleague/24silver.png', label: '2위' },
      { img: '/logos/madleague/24bronze.png', label: '3위' },
    ],
  },
];

export default async function CompetitionPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,29,37,0.2),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:py-40">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">COMPETITION</div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">경쟁 PT</h1>
          <p className="mt-8 max-w-2xl text-xl text-neutral-300 leading-relaxed">
            실제 기업의 고민을 전국의 동아리가 같이 경쟁한다.
            최고의 전략은 <span className="text-[#FFC000] font-bold">MAD Crown</span>을 받는다.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">PROCESS</div>
        <h2 className="text-4xl sm:text-5xl font-black mb-16">경쟁PT는 이렇게 진행된다</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-neutral-950 border border-neutral-900 p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#EC1D25] flex items-center justify-center text-sm font-black shrink-0">
                  {i + 1}
                </div>
                <s.icon className="h-6 w-6 text-neutral-500" />
              </div>
              <div className="text-xl font-black">{s.title}</div>
              <div className="mt-3 text-base text-neutral-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Archive */}
      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-4">HALL OF FAME</div>
          <h2 className="text-4xl sm:text-6xl font-black mb-24">수상작 아카이브</h2>

          <div className="space-y-32">
            {ARCHIVE.map((item) => (
              <div key={`${item.year}-${item.round}`}>
                {/* 연도 + 클라이언트 헤더 */}
                <div className="text-sm text-neutral-500 font-bold tracking-widest mb-6">
                  {item.year}년 {item.round}
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                  {/* 클라이언트 정보 */}
                  <div className="lg:w-80 shrink-0">
                    <div className="h-20 flex items-center">
                      <Image
                        src={item.logo}
                        alt={item.client}
                        width={200}
                        height={80}
                        className="object-contain object-left max-h-16 w-auto rounded-xl"
                      />
                    </div>
                    <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* 수상 배지 */}
                  <div className="flex flex-wrap gap-8 items-end flex-1">
                    {item.awards.map((award) => (
                      <div key={award.img} className="flex flex-col items-center gap-3">
                        <Image
                          src={award.img}
                          alt={award.label}
                          width={180}
                          height={220}
                          className="object-contain w-40 sm:w-44 h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-16 h-px bg-neutral-900" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/70 mb-3">FOR CORPORATE</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">과제 기업으로 참여하시겠습니까?</h2>
            <p className="mt-3 text-white/80 text-lg">전국 대학생의 크리에이티브를 기업의 마케팅 과제에 연결합니다.</p>
          </div>
          <Link
            href="mailto:lools@tenone.biz"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-10 py-5 text-lg transition shrink-0"
          >
            문의하기 <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
