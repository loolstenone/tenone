import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleEditor } from '../ArticleEditor';

export const metadata = { title: '아티클 편집' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?redirect=/madleague/madzine/write/' + id);

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) redirect('/madleague/member');

  const { data: article } = await sb.from('mad_articles')
    .select('id, title, subtitle, content, category, thumbnail_url, tags, author_id, status, reject_reason')
    .eq('id', id)
    .maybeSingle();
  if (!article) notFound();

  const a = article as {
    id: string; title: string; subtitle: string | null; content: string;
    category: string; thumbnail_url: string | null; tags: string[] | null;
    author_id: string; status: string; reject_reason: string | null;
  };
  if (a.author_id !== (member as { id: string }).id) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-black">접근 권한이 없습니다</h1>
          <p className="mt-3 text-neutral-400">본인 글만 편집할 수 있습니다.</p>
        </div>
      </div>
    );
  }
  if (!['draft', 'rejected'].includes(a.status)) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-black">편집 불가</h1>
          <p className="mt-3 text-neutral-400">검토 중이거나 이미 발행된 글은 편집할 수 없습니다.</p>
          <Link href="/madleague/madzine/write" className="mt-8 inline-block border border-neutral-700 hover:border-white px-6 py-3 text-white font-bold">돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Link href="/madleague/madzine/write" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
          <ChevronLeft className="h-4 w-4" /> 투고 목록
        </Link>
      </div>
      <section className="mx-auto max-w-4xl px-6 py-12">
        {a.reject_reason && (
          <div className="bg-red-950 border border-red-900 text-red-200 p-4 mb-8 text-sm">
            <strong>반려 사유:</strong> {a.reject_reason}
          </div>
        )}
        <h1 className="text-3xl font-black tracking-tight mb-8">아티클 편집</h1>
        <ArticleEditor initial={{
          id: a.id, title: a.title, subtitle: a.subtitle, content: a.content,
          category: a.category, thumbnail_url: a.thumbnail_url, tags: a.tags,
        }} />
      </section>
    </div>
  );
}
