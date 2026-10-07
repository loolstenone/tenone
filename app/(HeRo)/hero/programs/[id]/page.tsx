import { RoundRoom } from '@/features/programs/RoundRoom';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: 'HeRo 프로그램 · 회차 방', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoundRoom id={id} theme={PROGRAM_THEMES.hero} />;
}
