import { PartnerProgramPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

// 연계 프로그램 — 정식 서비스는 Planner's (2026-10-09). 연결처(사이트) 미정 → programs-list partner.href 추가 시 버튼 활성
const program = getMadProgram('planners');
export const metadata = { title: program.title, description: program.desc };

export default function PlannersPage() {
  return <PartnerProgramPage programKey="planners" />;
}
