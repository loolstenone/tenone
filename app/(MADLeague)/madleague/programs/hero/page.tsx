import { ArrowRight } from 'lucide-react';
import { PartnerProgramPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';
import { CrossSiteLink } from '@/components/CrossSiteLink';
import { HIT_STAGES, hitStageMinutesLabel } from '@/lib/hit/stages';

// 연계 프로그램 — HIT 미니(맛보기)는 2026-10-12 폐지(사용자 결정 "모든 조사는 회원만 · 미니 대신 HIT A").
// 검사는 HeRo HIT A 하나로, 같은 Ten:One ID로 간다. 옛 MADLeague 자체 신청 폼(mad_hero_applications)은 폐지
const program = getMadProgram('hero');
export const metadata = { title: program.title, description: program.desc };

export default function HeroProgramPage() {
  return (
    <PartnerProgramPage programKey="hero">
      <ProgramSection
        id="hit"
        eyebrow="HIT"
        title="나의 영웅 유형 — HIT - Archetype"
        intro="성격·행동·성품·적성과 성장 배경을 한 번에 보는 HeRo의 기본 검사. 회원이면 같은 Ten:One ID로 바로 시작하고, 결과는 내 계정에 남는다."
        tone="dark"
      >
        <div className="flex flex-wrap items-center gap-4">
          <CrossSiteLink href="/hero/hit/a" className="inline-flex items-center gap-3 bg-[#E53935] hover:bg-red-700 text-white font-bold px-8 py-4 text-lg transition">
            HIT - Archetype 시작하기 <ArrowRight className="h-5 w-5" />
          </CrossSiteLink>
          <p className="text-sm text-neutral-400">{hitStageMinutesLabel('a')} · {HIT_STAGES.a.approxQuestions}문항 · 무료 · 로그인 필요</p>
        </div>
      </ProgramSection>
    </PartnerProgramPage>
  );
}
