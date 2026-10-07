import { ProgramsSubNav } from '@/features/madleague/ProgramsSubNav';

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProgramsSubNav />
      {children}
    </>
  );
}
