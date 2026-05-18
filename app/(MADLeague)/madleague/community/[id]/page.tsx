import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, MessageCircle, Heart, FileText, Download, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CommentSection } from './CommentSection';

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'file';
  name: string;
  size: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABEL: Record<string, string> = {
  free: '자유', question: '질문', share: '공유', insight: '인사이트', pinboard: '핀보드', notice: '공지',
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?redirect=/madleague/community/' + id);

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) redirect('/madleague/member');

  const { data: post } = await sb
    .from('mad_posts')
    .select('*, mad_members!author_id(name, avatar_url), mad_clubs(slug, name, color)')
    .eq('id', id)
    .maybeSingle();
  if (!post) notFound();

  const { data: comments } = await sb
    .from('mad_comments')
    .select('*, mad_members!author_id(name, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  const typed = post as {
    id: string; title: string; content: string; category: string;
    author_id: string; likes_count: number; comments_count: number;
    is_pinned: boolean; created_at: string;
    media: MediaItem[] | null;
    mad_members: { name: string; avatar_url: string | null } | null;
    mad_clubs: { slug: string; name: string; color: string | null } | null;
  };

  const media: MediaItem[] = Array.isArray(typed.media) ? typed.media : [];
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const files = media.filter(m => m.type === 'file');

  const currentMemberId = (member as { id: string }).id;
  const isOwner = typed.author_id === currentMemberId;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link href="/madleague/community" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> 커뮤니티
        </Link>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="font-bold text-[#EC1D25]">{CATEGORY_LABEL[typed.category] ?? typed.category}</span>
          {typed.mad_clubs && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="inline-flex items-center gap-1 text-neutral-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: typed.mad_clubs.color ?? '#EC1D25' }} />
                {typed.mad_clubs.name}
              </span>
            </>
          )}
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500">{new Date(typed.created_at).toLocaleString('ko-KR')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{typed.title}</h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
          <span className="font-medium">{typed.mad_members?.name ?? '익명'}</span>
        </div>

        <div className="mt-8 whitespace-pre-wrap text-neutral-200 leading-relaxed">
          {typed.content}
        </div>

        {/* Media gallery */}
        {images.length > 0 && (
          <div className={`mt-6 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-neutral-950 border border-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="w-full object-cover max-h-[480px]" />
              </a>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-6 space-y-3">
            {videos.map((vid, i) => (
              <div key={i} className="bg-neutral-950 border border-neutral-900 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-900 text-xs text-neutral-500">
                  <Play className="h-3 w-3 text-[#EC1D25]" />
                  <span className="truncate">{vid.name}</span>
                  <span className="ml-auto shrink-0">{formatBytes(vid.size)}</span>
                </div>
                <video src={vid.url} controls className="w-full max-h-[400px] bg-black" />
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((f, i) => (
              <a
                key={i}
                href={f.url}
                download={f.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 px-4 py-3 hover:border-neutral-700 transition group"
              >
                <FileText className="h-4 w-4 text-neutral-500 group-hover:text-white shrink-0" />
                <span className="flex-1 text-sm text-neutral-300 truncate group-hover:text-white">{f.name}</span>
                <span className="text-xs text-neutral-600">{formatBytes(f.size)}</span>
                <Download className="h-4 w-4 text-neutral-600 group-hover:text-white shrink-0" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center gap-4 text-sm text-neutral-500 border-t border-neutral-900 pt-6">
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {typed.likes_count}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {typed.comments_count}</span>
          {isOwner && (
            <form action={`/api/madleague/posts/${typed.id}`} method="post" className="ml-auto">
              {/* DELETE는 별도 클라이언트 구현이 낫지만 간단히 안내만 */}
              <span className="text-xs">본인 글 — 삭제는 추후 기능으로 제공</span>
            </form>
          )}
        </div>
      </article>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <CommentSection
          postId={typed.id}
          initialComments={(comments ?? []).map((c) => {
            const cc = c as { id: string; content: string; created_at: string; author_id: string; mad_members: { name: string; avatar_url: string | null } | null };
            return {
              id: cc.id,
              content: cc.content,
              created_at: cc.created_at,
              author_id: cc.author_id,
              author_name: cc.mad_members?.name ?? '익명',
            };
          })}
          currentMemberId={currentMemberId}
        />
      </section>
    </div>
  );
}
