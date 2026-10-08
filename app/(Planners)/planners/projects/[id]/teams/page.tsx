import { RoundTeams } from '@/features/programs/RoundTeams';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '팀 구성', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoundTeams id={id} theme={PROGRAM_THEMES.planners} />;
}
