import { InviteJoin } from '@/features/programs/InviteJoin';

export const metadata = { title: '팀 초대', robots: { index: false, follow: false } };

/** 팀 초대 링크 — 가입·로그인 → 참가 동의 → 합류 */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="min-h-[70vh] bg-black px-4 py-16 text-white sm:px-6">
      <InviteJoin code={code} />
    </div>
  );
}
