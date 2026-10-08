import { PartnerProgramPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

// 연계 프로그램 — 정식 서비스·신청은 HeRo (2026-10-09). 옛 MADLeague 자체 신청 폼(mad_hero_applications)은 폐지
const program = getMadProgram('hero');
export const metadata = { title: program.title, description: program.desc };

export default function HeroProgramPage() {
  return <PartnerProgramPage programKey="hero" />;
}
