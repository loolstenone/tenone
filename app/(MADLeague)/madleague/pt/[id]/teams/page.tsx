import { RoundTeams } from '@/features/programs/RoundTeams';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '팀 구성' };

/** 팀 구성·관리 — MADLeague 창구 (공용 features/programs/RoundTeams) */
export default async function RoundTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoundTeams id={id} theme={PROGRAM_THEMES.madleague} />;
}
