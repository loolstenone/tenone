import { fetchMadClubs } from '@/lib/supabase/madleague';
import { getAllTaxonomies } from '@/lib/supabase/taxonomies';
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
  const [clubs, taxonomies] = await Promise.all([fetchMadClubs(), getAllTaxonomies()]);
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">REGISTER</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">매드리거 등록</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <ApplyForm clubs={clubs} preselectedClub={club} industries={taxonomies.industry} jobFunctions={taxonomies.job_function} />
      </section>
    </div>
  );
}
