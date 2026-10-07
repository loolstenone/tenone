import { RoundRoom } from '@/features/programs/RoundRoom';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '회차 공지 · Q&A' };

/** 회차 방 — MADLeague 창구 (공용 features/programs/RoundRoom) */
export default async function RoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoundRoom id={id} theme={PROGRAM_THEMES.madleague} />;
}
