import { PartnerProgramPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';
import { ProgramBoard } from '@/features/programs/ProgramBoard';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const revalidate = 300;

// 연계 프로그램 — 정식 서비스·신청은 RooK (2026-10-09). 맛보기 = 모집 중인 RooK 프로젝트 미리보기
const program = getMadProgram('rookie');
export const metadata = { title: program.title, description: program.desc };

export default function RooKiePage() {
  return (
    <PartnerProgramPage programKey="rookie">
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <ProgramBoard theme={PROGRAM_THEMES.madleague} brands={['rook']} title="모집 중인 RooK 프로젝트" hideWhenEmpty />
      </section>
    </PartnerProgramPage>
  );
}
