import { RoundRoom } from '@/features/programs/RoundRoom';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '실전 프로젝트 · 회차 방', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoundRoom id={id} theme={PROGRAM_THEMES.rook} />;
}
