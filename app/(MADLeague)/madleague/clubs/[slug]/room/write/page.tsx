import { notFound, redirect } from 'next/navigation';
import { getCafeMembers, CAFE_BOARDS, isCafeBoard } from '@/lib/madleague-club-cafe';
import { loadRoom, CafeShell } from '@/features/madleague/cafe/room';
import { CafeWriteForm } from '@/features/madleague/cafe/CafeWriteForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: '글쓰기 · 동아리 방' };

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ board?: string }>;
}

export default async function ClubRoomWritePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { board } = await searchParams;
  const room = await loadRoom(slug);
  if (!room) notFound();
  if ('gate' in room) return room.gate;
  const { ctx } = room;
  // 글쓴이 = 매드리거 회원(mad_members). 관리자 계정은 읽기·관리만
  if (!ctx.madMemberId) redirect(`/madleague/clubs/${slug}/room`);

  const boards = CAFE_BOARDS.filter(b => !('officerOnly' in b && b.officerOnly) || ctx.access.isOfficer).map(b => ({ key: b.key, label: b.label }));
  const defaultBoard = isCafeBoard(board) && boards.some(b => b.key === board) ? board : 'free';
  const members = await getCafeMembers(ctx.club.id);

  return (
    <CafeShell ctx={ctx} memberCount={members.length} active={defaultBoard}>
      <h2 className="mb-4 text-xl font-black">글쓰기</h2>
      <CafeWriteForm slug={slug} boards={boards} defaultBoard={defaultBoard} accent={ctx.club.color ?? '#EC1D25'} />
    </CafeShell>
  );
}
