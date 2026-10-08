import type { CSSProperties } from 'react';
import { InviteJoin } from '@/features/programs/InviteJoin';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '팀 초대', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="min-h-[70vh] bg-black px-4 py-16 text-white sm:px-6" style={{ '--pa': PROGRAM_THEMES.planners.accent } as CSSProperties}>
      <InviteJoin code={code} accentColor={PROGRAM_THEMES.planners.accent} />
    </div>
  );
}
