import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Heart, MessageCircle, FileText, Download, Pin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { withMadAuthors } from '@/lib/madleague-people';
import { getCafeMembers, cafeBoardLabel } from '@/lib/madleague-club-cafe';
import { loadRoom, CafeShell } from '@/features/madleague/cafe/room';
import { CafeModeration } from '@/features/madleague/cafe/CafeModeration';
import { CommentSection } from '@/app/(MADLeague)/madleague/community/[id]/CommentSection';

export const dynamic = 'force-dynamic';

interface MediaItem { url: string; type: 'image' | 'video' | 'file'; name: string; size: number }
interface PageProps { params: Promise<{ slug: string; postId: string }> }

const fmtBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

export default async function ClubRoomPostPage({ params }: PageProps) {
  const { slug, postId } = await params;
  const room = await loadRoom(slug);
  if (!room) notFound();
  if ('gate' in room) return room.gate;
  const { ctx } = room;

  // 읽기 범위는 DB 정책이 강제 — 다른 동아리 글 id를 넣어도 null
  const sb = await createClient();
  const { data: row } = await sb.from('mad_posts').select('*').eq('id', postId).eq('club_id', ctx.club.id).maybeSingle();
  if (!row) notFound();
  const { data: commentRows } = await sb.from('mad_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  const [post] = await withMadAuthors([row]);
  const comments = await withMadAuthors(commentRows ?? []);
  const members = await getCafeMembers(ctx.club.id);

  const p = post as unknown as {
    id: string; title: string; content: string; category: string; author_id: string; created_at: string;
    likes_count: number; comments_count: number; is_pinned: boolean; media: MediaItem[] | null;
    mad_members: { name: string } | null;
  };
  const media = Array.isArray(p.media) ? p.media : [];
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const files = media.filter(m => m.type === 'file');
  const commentList = comments.map(c => {
    const cc = c as unknown as { id: string; content: string; created_at: string; author_id: string; mad_members: { name: string } | null };
    return { id: cc.id, content: cc.content, created_at: cc.created_at, author_id: cc.author_id, author_name: cc.mad_members?.name ?? '익명' };
  });

  return (
    <CafeShell ctx={ctx} memberCount={members.length} active={p.category}>
      <Link href={`/madleague/clubs/${slug}/room?board=${p.category}`} className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> {cafeBoardLabel(p.category)}
      </Link>

      <article className="mt-4 border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {p.is_pinned && <Pin className="h-3.5 w-3.5 text-[#EC1D25]" />}
          <span className="font-bold text-[#EC1D25]">{cafeBoardLabel(p.category)}</span>
          <span>·</span>
          <span>{new Date(p.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
        </div>
        <h1 className="mt-2 text-2xl font-black">{p.title}</h1>
        <div className="mt-2 text-sm text-neutral-400">{p.mad_members?.name ?? '익명'}</div>

        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-neutral-200">{p.content}</div>

        {images.length > 0 && (
          <div className={`mt-6 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border border-neutral-900 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="max-h-[480px] w-full object-cover" />
              </a>
            ))}
          </div>
        )}
        {videos.map((v, i) => <video key={i} src={v.url} controls className="mt-6 max-h-[400px] w-full bg-black" />)}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((f, i) => (
              <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 border border-neutral-900 bg-black px-4 py-3 hover:border-neutral-700">
                <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="flex-1 truncate text-sm text-neutral-300 group-hover:text-white">{f.name}</span>
                <span className="text-xs text-neutral-600">{fmtBytes(f.size)}</span>
                <Download className="h-4 w-4 shrink-0 text-neutral-600" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-4 border-t border-neutral-900 pt-4 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {p.likes_count}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {p.comments_count}</span>
          <CafeModeration slug={slug} postId={p.id} pinned={p.is_pinned}
            canModerate={ctx.access.isOfficer} isAuthor={!!ctx.madMemberId && ctx.madMemberId === p.author_id} />
        </div>
      </article>

      <section className="mt-6">
        {ctx.madMemberId ? (
          <CommentSection postId={p.id} initialComments={commentList} currentMemberId={ctx.madMemberId} />
        ) : (
          <div className="border border-neutral-800 divide-y divide-neutral-900">
            {commentList.map(c => (
              <div key={c.id} className="px-4 py-3 text-sm">
                <span className="font-bold text-neutral-300">{c.author_name}</span>
                <p className="mt-1 whitespace-pre-wrap text-neutral-400">{c.content}</p>
              </div>
            ))}
            <p className="px-4 py-3 text-xs text-neutral-500">관리자 계정은 댓글을 읽기만 할 수 있어요.</p>
          </div>
        )}
      </section>
    </CafeShell>
  );
}
