import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Pin, Heart, ImageIcon, Paperclip } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { withMadAuthors } from '@/lib/madleague-people';
import { getCafeMembers, cafeBoardLabel, isCafeBoard, CAFE_BOARDS } from '@/lib/madleague-club-cafe';
import { loadRoom, CafeShell } from '@/features/madleague/cafe/room';

export const dynamic = 'force-dynamic';
export const metadata = { title: '동아리 방' };

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ board?: string; tab?: string }>;
}

interface PostRow {
  id: string; title: string; category: string; created_at: string;
  comments_count: number; likes_count: number; is_pinned: boolean;
  media: { type: string }[] | null;
  mad_members: { name: string } | null;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' });

export default async function ClubRoomPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { board, tab } = await searchParams;
  const room = await loadRoom(slug);
  if (!room) notFound();
  if ('gate' in room) return room.gate;
  const { ctx } = room;

  const members = await getCafeMembers(ctx.club.id);
  const base = `/madleague/clubs/${slug}/room`;

  // 멤버 탭
  if (tab === 'members') {
    return (
      <CafeShell ctx={ctx} memberCount={members.length} active="members">
        <h2 className="text-xl font-black mb-4">멤버 <span className="text-neutral-500 text-base">{members.length}</span></h2>
        <div className="border border-neutral-800 divide-y divide-neutral-900">
          {members.map(m => (
            <div key={m.member_id} className="flex items-center gap-3 px-4 py-3">
              {m.avatar_url
                ? <Image src={m.avatar_url} alt="" width={32} height={32} className="h-8 w-8 object-cover" />
                : <div className="h-8 w-8 bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">{m.name.slice(0, 1)}</div>}
              <div className="flex-1 min-w-0 text-sm font-semibold truncate">{m.name}</div>
              <span className={`text-xs px-2 py-0.5 ${m.role === '임원' ? 'bg-[#EC1D25]/15 text-[#EC1D25]' : 'bg-neutral-900 text-neutral-400'}`}>
                {m.position ?? m.role}
              </span>
              {m.year && <span className="text-xs text-neutral-500 w-12 text-right">{m.year}</span>}
            </div>
          ))}
          {members.length === 0 && <p className="px-4 py-10 text-center text-sm text-neutral-500">아직 멤버가 없습니다.</p>}
        </div>
      </CafeShell>
    );
  }

  // 글 목록 — 읽기 범위는 DB 정책(mad_can_access_club)이 강제
  const sb = await createClient();
  const boardKey = isCafeBoard(board) ? board : null;
  const isHome = !board;
  let q = sb.from('mad_posts')
    .select('id, title, category, created_at, comments_count, likes_count, is_pinned, media, author_id')
    .eq('club_id', ctx.club.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(isHome ? 15 : 50);
  if (boardKey) q = q.eq('category', boardKey);
  const { data: rows } = await q;
  const posts = (await withMadAuthors(rows ?? [])) as unknown as PostRow[];

  // 대문: 공지(최근 5) 따로
  let notices: PostRow[] = [];
  if (isHome) {
    const { data: n } = await sb.from('mad_posts')
      .select('id, title, category, created_at, comments_count, likes_count, is_pinned, media, author_id')
      .eq('club_id', ctx.club.id).eq('category', 'notice')
      .order('created_at', { ascending: false }).limit(5);
    notices = (await withMadAuthors(n ?? [])) as unknown as PostRow[];
  }
  const listed = isHome ? posts.filter(p => p.category !== 'notice') : posts;
  const title = isHome ? '최근 글' : boardKey ? cafeBoardLabel(boardKey) : '전체글 보기';

  // 사진첩은 썸네일 대신 표 + 아이콘 (v1)
  const PostTable = ({ items }: { items: PostRow[] }) => (
    <div className="border border-neutral-800 divide-y divide-neutral-900">
      {items.map(p => (
        <Link key={p.id} href={`${base}/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition">
          {p.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#EC1D25]" />}
          <span className="hidden sm:inline w-20 shrink-0 text-xs text-neutral-500">[{cafeBoardLabel(p.category)}]</span>
          <span className="flex-1 min-w-0 truncate text-sm">
            {p.title}
            {p.comments_count > 0 && <span className="ml-1.5 text-xs font-bold text-[#EC1D25]">[{p.comments_count}]</span>}
            {(p.media ?? []).some(m => m.type === 'image') && <ImageIcon className="ml-1.5 inline h-3.5 w-3.5 text-neutral-500" />}
            {(p.media ?? []).some(m => m.type === 'file') && <Paperclip className="ml-1 inline h-3.5 w-3.5 text-neutral-500" />}
          </span>
          <span className="hidden sm:inline w-24 shrink-0 truncate text-xs text-neutral-400">{p.mad_members?.name ?? '—'}</span>
          <span className="w-12 shrink-0 text-right text-xs text-neutral-500">{fmtDate(p.created_at)}</span>
          <span className="hidden md:inline-flex w-10 shrink-0 items-center justify-end gap-1 text-xs text-neutral-500"><Heart className="h-3 w-3" />{p.likes_count}</span>
        </Link>
      ))}
      {items.length === 0 && <p className="px-4 py-10 text-center text-sm text-neutral-500">아직 글이 없습니다.</p>}
    </div>
  );

  return (
    <CafeShell ctx={ctx} memberCount={members.length} active={isHome ? 'home' : boardKey ?? 'all'}>
      {isHome && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">공지사항</h2>
            <Link href={`${base}?board=notice`} className="text-xs text-neutral-500 hover:text-white">더보기</Link>
          </div>
          <PostTable items={notices} />
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">{title}</h2>
          {isHome && <Link href={`${base}?board=all`} className="text-xs text-neutral-500 hover:text-white">전체글 보기</Link>}
        </div>
        <PostTable items={listed} />
      </section>
      {isHome && (
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CAFE_BOARDS.map(b => (
            <Link key={b.key} href={`${base}?board=${b.key}`} className="border border-neutral-800 px-3 py-3 text-center text-xs font-bold text-neutral-300 hover:border-white transition">
              {b.label}
            </Link>
          ))}
        </section>
      )}
    </CafeShell>
  );
}
