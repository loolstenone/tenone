import { FileText, MessageCircle, Briefcase, Compass, UserCheck, FolderOpen } from 'lucide-react';
import { HeroForm } from './HeroForm';
import { MAD_PROGRAM_IMAGES } from '@/lib/madleague-program-assets';
import { ProgramDetailPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

// 옛 주소 /madleague/hero 는 next.config 리다이렉트 (2026-10-08 사용자 결정 — 프로그램 주소 체계 통일)
const program = getMadProgram('hero');
export const metadata = { title: program.title, description: program.desc };

const STEPS = [
  { icon: FileText,      title: '신청',            desc: '아래 신청서를 작성한다. 매드리거라면 로그인 후 신청 — 활동 이력이 자동 연동되어 이력서·포트폴리오를 따로 준비하지 않아도 된다.' },
  { icon: MessageCircle, title: '커리어 상담',       desc: '진로에 대한 고민, 커리어 관리에 대한 상담을 받는다. 단순 취업 상담이 아니라 활동 이력을 자산으로 바꾸는 설계.' },
  { icon: Briefcase,     title: '인턴 · 채용 연결',  desc: 'HeRo 파트너 기업의 인턴십에 우선 지원하고, 경쟁 PT 수상·프로젝트 성과를 가진 매드리거는 기업에 직접 매칭된다.' },
];

const GETS = [
  { icon: Compass,    title: '진로 설계',      desc: '어디로 갈지부터 함께 정한다. 현업 네트워크가 기회로 이어지는 커리어 솔루션.' },
  { icon: UserCheck,  title: '인턴 · 채용 기회', desc: 'HeRo 파트너 기업 인턴십 우선 지원, 성과 보유 매드리거 직접 매칭.' },
  { icon: FolderOpen, title: '활동 이력이 곧 서류', desc: '매드리그에서 쌓은 활동이 그대로 증명이 된다. 포트폴리오가 곧 서류다.' },
];

export default function HeroProgramPage() {
  return (
    <ProgramDetailPage
      programKey="hero"
      heroExtra={<p className="mt-4 text-lg text-[#FFC000] font-bold">진로에 대한 고민, 커리어 관리에 대한 상담을 제공합니다.</p>}
      steps={STEPS}
      stepsTitle="신청부터 연결까지"
      gets={GETS}
      cta={{ primary: { label: '신청서 작성', href: '#apply' } }}
    >
      {/* 원본 madleague.net/hero_prgram 키비주얼 */}
      <section className="bg-white border-t border-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAD_PROGRAM_IMAGES.heroWide} alt="HeRo — We believe in your talent" className="mx-auto hidden w-full max-w-6xl sm:block" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAD_PROGRAM_IMAGES.heroTall} alt="HeRo — We believe in your talent" className="mx-auto block w-full sm:hidden" />
      </section>

      <ProgramSection id="apply" eyebrow="APPLY" title="HeRo 프로그램 신청" tone="dark">
        <div className="max-w-3xl">
          <div className="bg-black border border-neutral-900 p-8 mb-8">
            <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-2">매드리거 혜택</div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              이미 MADLeague 매드리거라면, 로그인 후 신청하시면 활동 이력이 자동 연동됩니다.
              이력서·포트폴리오를 별도로 준비하지 않아도 됩니다.
            </p>
          </div>
          <HeroForm />
        </div>
      </ProgramSection>
    </ProgramDetailPage>
  );
}
