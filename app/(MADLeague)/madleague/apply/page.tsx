import { fetchMadClubs } from '@/lib/supabase/madleague';
import { ApplyForm } from './ApplyForm';

export const revalidate = 300;

export const metadata = {
  title: '지원하기',
  description: 'MADLeague 공식 동아리 지원',
};

interface PageProps {
  searchParams: Promise<{ club?: string }>;
}

export default async function ApplyPage({ searchParams }: PageProps) {
  const { club } = await searchParams;
  const clubs = await fetchMadClubs();
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">APPLY</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">다음 기수 합류</h1>
          <p className="mt-6 text-neutral-400 leading-relaxed">
            전국 7개 권역 동아리 중 하나를 선택하세요.
            접수된 지원서는 해당 동아리 운영진이 검토 후 연락드립니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <ApplyForm clubs={clubs} preselectedClub={club} />
      </section>
    </div>
  );
}
