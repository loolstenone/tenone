import Image from 'next/image';
import { Trophy, Users, Search, Lightbulb, Presentation, Medal, Award, FolderOpen } from 'lucide-react';
import { MAD_PROGRAM_IMAGES, madProgramAsset } from '@/lib/madleague-program-assets';
import { fetchMadHallRounds, type MadHallRound } from '@/lib/supabase/madleague';
import { ProgramDetailPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

/* 순위 색 — 경쟁 PT는 MAD Crown 없이 순위만 (2026-10-07 결정) */
const RANK_TONE: Record<number, string> = { 1: 'text-[#FFC000] border-[#FFC000]/40', 2: 'text-neutral-200 border-neutral-500', 3: 'text-[#CD7F32] border-[#CD7F32]/40' };

/** 인트라에서 결과 발표한 회차 — 자동 반영 */
function HallRound({ r }: { r: MadHallRound }) {
  return (
    <div>
      <div className="text-sm text-neutral-500 font-bold tracking-widest mb-6">{r.year}년 · {r.title}</div>
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="lg:w-80 shrink-0">
          <div className="h-20 flex items-center">
            {r.client_logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.client_logo_url} alt={r.client_name ?? r.title} className="object-contain object-left max-h-16 w-auto" />
              : <span className="text-3xl font-black">{r.client_name ?? r.title}</span>}
          </div>
          {r.brief_title && <p className="mt-6 text-lg text-neutral-400 leading-relaxed">{r.brief_title}</p>}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {r.results.map((x, i) => (
            <div key={i} className={`border bg-neutral-950 p-6 ${x.rank ? RANK_TONE[x.rank] ?? 'border-neutral-800 text-neutral-400' : 'border-neutral-800 text-neutral-400'}`}>
              <div className="flex items-center gap-2 text-sm font-black">
                <Medal className="h-5 w-5" />
                {x.rank ? `${x.rank}위` : ''}{x.award_name ? `${x.rank ? ' · ' : ''}${x.award_name}` : ''}
              </div>
              <div className="mt-4 text-xl font-black text-white">{x.team_name}</div>
              {x.club && (
                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {x.club.logo_url && <img src={x.club.logo_url} alt="" className="h-5 w-5 object-contain" />}
                  {x.club.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 h-px bg-neutral-900" />
    </div>
  );
}

export const revalidate = 300;

const program = getMadProgram('competition');
export const metadata = { title: `${program.title} — 명예의 전당`, description: program.desc };

const STEPS = [
  { icon: Search,       title: '클라이언트 RFP',       desc: '실제 기업이 마케팅 과제를 RFP 형식으로 제시한다.' },
  { icon: Users,        title: '동아리별 팀 구성',       desc: '동아리 내 4~6인으로 팀을 꾸린다.' },
  { icon: Lightbulb,    title: '클라이언트 OT',         desc: '기업 담당자가 직접 과제 배경과 목표를 설명한다.' },
  { icon: Trophy,       title: '지역 예선 → 본선 진출',  desc: '지역 예선을 통과한 팀만 본선 무대에 오른다.' },
  { icon: Presentation, title: '본선 경쟁 프레젠테이션', desc: '현업 심사위원단 앞에서 전략을 발표하고 순위를 가린다.' },
];

const GETS = [
  { icon: Trophy,     title: '순위 · 명예의 전당', desc: '본선 결과는 명예의 전당에 영구 기록된다. 제안에서 끝나지 않고 실행까지 이어진다.' },
  { icon: FolderOpen, title: '포트폴리오 자동 반영', desc: '참가·수상 기록이 매드리거 포트폴리오에 자동으로 쌓인다.' },
  { icon: Award,      title: '참가 · 수상 인증서',  desc: '회차가 끝나면 본인 화면에서 참가 확인서·수상 확인서를 직접 발급한다.' },
];

// 인트라 결과 발표 이전의 기록 — 옛 사이트 명예의 전당 (madleague.net/pt)
const ARCHIVE = [
  {
    year: 2026,
    round: '1차',
    client: '춤추는 고래',
    desc: '여성용품(생리대, 팬티라이너) 브랜드 마케팅 전략 수립',
    logo: '/logos/madleague/dancingwhale-logo.png',
    gallery: [] as string[],
    awards: [
      { img: '/logos/madleague/26-1gold.png',   label: '1위' },
      { img: '/logos/madleague/26-1silver.png', label: '2위' },
      { img: '/logos/madleague/26-1bronze.png', label: '3위' },
    ],
  },
  {
    year: 2025,
    round: '2차',
    client: '리제로스',
    desc: '자연친화 스타트업 리제로스에서 개발한 배달, 포장 음식 냉매제에 대한 시장 진출 전략',
    logo: '/logos/madleague/rezerouslogo.png',
    gallery: [] as string[],
    awards: [
      { img: '/logos/madleague/25-1gold.png',   label: '1위' },
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
    gallery: [] as string[],
    awards: [
      { img: '/logos/madleague/25gold.png',    label: '1위' },
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
    gallery: [] as string[],
    awards: [
      { img: '/logos/madleague/24gold.png',   label: '1위' },
      { img: '/logos/madleague/24silver.png', label: '2위' },
      { img: '/logos/madleague/24bronze.png', label: '3위' },
    ],
  },
];

export default async function CompetitionPage() {
  const hallRounds = await fetchMadHallRounds();
  return (
    <ProgramDetailPage
      programKey="competition"
      heroImage={MAD_PROGRAM_IMAGES.ptHero}
      heroExtra={<p className="mt-4 text-sm text-neutral-500">제안에서 끝나는 것이 아니라 실행까지.</p>}
      steps={STEPS}
      stepsTitle="경쟁 PT는 이렇게 진행된다"
      gets={GETS}
    >
      <ProgramSection eyebrow="HALL OF FAME" title="명예의 전당">
        <div className="space-y-32">
          {hallRounds.map(r => <HallRound key={r.id} r={r} />)}
          {ARCHIVE.map((item) => (
            <div key={`${item.year}-${item.round}`}>
              <div className="text-sm text-neutral-500 font-bold tracking-widest mb-6">{item.year}년 {item.round}</div>
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-80 shrink-0">
                  <div className="h-20 flex items-center">
                    <Image src={item.logo} alt={item.client} width={200} height={80} className="object-contain object-left max-h-16 w-auto" />
                  </div>
                  {item.desc && <p className="mt-6 text-lg text-neutral-400 leading-relaxed">{item.desc}</p>}
                </div>
                <div className="flex flex-wrap gap-8 items-end flex-1">
                  {item.awards.map((award) => (
                    <div key={award.img} className="flex flex-col items-center gap-3">
                      <Image src={award.img} alt={award.label} width={180} height={220} className="object-contain w-40 sm:w-44 h-auto" />
                    </div>
                  ))}
                </div>
              </div>
              {item.gallery.length > 0 && <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2">
                {item.gallery.map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={id} src={madProgramAsset('pt', id)} alt={`${item.client} 경쟁 PT`} loading="lazy" className="aspect-[4/3] w-full object-cover bg-neutral-950" />
                ))}
              </div>}
              <div className="mt-16 h-px bg-neutral-900" />
            </div>
          ))}
        </div>
      </ProgramSection>
    </ProgramDetailPage>
  );
}
