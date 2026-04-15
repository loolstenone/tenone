import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from './ProfileEditor';

export const metadata = { title: '프로필 편집' };

export default async function ProfileEditPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-black">로그인이 필요합니다</h1>
          <Link href="/login?redirect=/madleague/member/profile" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</Link>
        </div>
      </div>
    );
  }

  const { data: member } = await sb
    .from('mad_members')
    .select('id, name, email, phone, university, major, year_in_school, bio, skill_tags, portfolio_public, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-black">매드리거 연동이 필요합니다</h1>
          <Link href="/madleague/member" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">매드리거 페이지로</Link>
        </div>
      </div>
    );
  }

  const m = member as {
    id: string; name: string; email: string | null; phone: string | null;
    university: string | null; major: string | null; year_in_school: number | null;
    bio: string | null; skill_tags: string[] | null; portfolio_public: boolean;
    avatar_url: string | null;
  };

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link href="/madleague/member" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> 매드리거
        </Link>
      </div>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">PROFILE</div>
        <h1 className="text-4xl font-black tracking-tight">프로필 편집</h1>
        <p className="mt-3 text-sm text-neutral-400">이름·동아리·기수는 운영진만 수정할 수 있습니다.</p>

        <div className="mt-10">
          <ProfileEditor initial={m} />
        </div>
      </section>
    </div>
  );
}
