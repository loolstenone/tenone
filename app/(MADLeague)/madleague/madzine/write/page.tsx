import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleEditor } from './ArticleEditor';

export const metadata = { title: 'MADzine 투고', description: '매드리거 아티클 작성' };

export default async function WritePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?redirect=/madleague/madzine/write');

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) redirect('/madleague/member');

  // 내 초안·반려 아티클 조회
  const { data: myDrafts } = await sb.from('mad_articles')
    .select('id, title, category, status, reject_reason, updated_at')
    .eq('author_id', (member as { id: string }).id)
    .in('status', ['draft', 'rejected', 'pending_review'])
    .order('updated_at', { ascending: false })
    .limit(10);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Link href="/madleague/madzine" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> MADzine
        </Link>
      </div>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">NEW ARTICLE</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">아티클 투고</h1>
        <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
          작성한 글은 <strong className="text-white">초안으로 저장</strong>하거나 <strong className="text-white">제출</strong>할 수 있습니다.
          제출된 글은 운영진 검토 후 MADzine에 발행됩니다.
        </p>

        {myDrafts && myDrafts.length > 0 && (
          <div className="mt-8 bg-neutral-950 border border-neutral-900 p-5">
            <div className="text-xs font-bold text-neutral-500 mb-3">내 글 ({myDrafts.length})</div>
            <div className="space-y-2">
              {myDrafts.map(d => {
                const item = d as { id: string; title: string; category: string; status: string; reject_reason: string | null; updated_at: string };
                return (
                  <Link key={item.id} href={`/madleague/madzine/write/${item.id}`} className="flex items-center justify-between py-2 border-b border-neutral-900 last:border-0 hover:text-white text-neutral-300">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{item.title}</div>
                      {item.reject_reason && <div className="text-xs text-red-400 mt-0.5">반려: {item.reject_reason}</div>}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${
                      item.status === 'draft' ? 'bg-neutral-800 text-neutral-400' :
                      item.status === 'pending_review' ? 'bg-amber-900 text-amber-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {item.status === 'draft' ? '초안' : item.status === 'pending_review' ? '검토중' : '반려'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10">
          <ArticleEditor />
        </div>
      </section>
    </div>
  );
}
