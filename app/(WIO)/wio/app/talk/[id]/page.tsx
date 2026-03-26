'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Bookmark, MessageSquare, Send, CornerDownRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';
import { fetchPost, fetchComments, createComment, deleteComment, toggleLike, checkLiked, toggleBookmark, checkBookmarked } from '@/lib/supabase/wio';

export default function TalkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tenant, member } = useWIO();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id || !member) return;
    const [p, c, l, b] = await Promise.all([
      fetchPost(id),
      fetchComments(id),
      checkLiked('post', id, member.id),
      checkBookmarked(id, member.id),
    ]);
    setPost(p);
    setComments(c);
    setLiked(l);
    setBookmarked(b);
    setLoading(false);
  }, [id, member]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleComment = async () => {
    if (!tenant || !member || !newComment.trim() || submitting) return;
    setSubmitting(true);
    await createComment({ postId: id, tenantId: tenant.id, authorId: member.id, content: newComment.trim() });
    setNewComment('');
    await loadData();
    setSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!tenant || !member || !replyContent.trim() || submitting) return;
    setSubmitting(true);
    await createComment({ postId: id, tenantId: tenant.id, authorId: member.id, content: replyContent.trim(), parentId });
    setReplyContent('');
    setReplyTo(null);
    await loadData();
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    await loadData();
  };

  const handleLike = async () => {
    if (!tenant || !member) return;
    const result = await toggleLike('post', id, tenant.id, member.id);
    setLiked(result);
    setPost((p: any) => p ? { ...p, likeCount: (p.likeCount || 0) + (result ? 1 : -1) } : p);
  };

  const handleBookmark = async () => {
    if (!tenant || !member) return;
    const result = await toggleBookmark(id, tenant.id, member.id);
    setBookmarked(result);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-white/5 rounded mb-6" />
        <div className="h-8 w-3/4 bg-white/5 rounded mb-4" />
        <div className="h-3 w-40 bg-white/5 rounded mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-4 w-full bg-white/5 rounded" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">게시글을 찾을 수 없습니다</p>
        <Link href="/wio/app/talk" className="text-indigo-400 text-sm hover:text-indigo-300">목록으로 돌아가기</Link>
      </div>
    );
  }

  // 댓글을 부모-자식 구조로 정리
  const rootComments = comments.filter(c => !c.parentId);
  const replies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div>
      {/* 뒤로가기 */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} /> 목록
      </button>

      {/* 게시글 */}
      <article>
        <h1 className="text-xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
          <span>{post.author?.displayName || '알 수 없음'}</span>
          <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>조회 {post.viewCount || 0}</span>
        </div>

        {/* 본문 */}
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-6 min-h-[100px]">
          {post.content || '내용이 없습니다'}
        </div>

        {/* 좋아요/북마크 */}
        <div className="flex items-center gap-3 border-t border-b border-white/5 py-3 mb-6">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${liked ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-white/5'}`}>
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {post.likeCount || 0}
          </button>
          <button onClick={handleBookmark} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${bookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'}`}>
            <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} /> 저장
          </button>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <MessageSquare size={15} /> {comments.length}
          </span>
        </div>
      </article>

      {/* 댓글 입력 */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
            placeholder="댓글 작성..."
            className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button onClick={handleComment} disabled={!newComment.trim() || submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {rootComments.length === 0 ? (
          <p className="text-center text-sm text-slate-600 py-6">첫 댓글을 남겨보세요</p>
        ) : rootComments.map(c => (
          <div key={c.id}>
            {/* 루트 댓글 */}
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">{c.author?.displayName || '알 수 없음'}</span>
                  <span className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors">답글</button>
                  {member && c.authorId === member.id && (
                    <button onClick={() => handleDelete(c.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-300">{c.content}</p>
            </div>

            {/* 대댓글 */}
            {replies(c.id).map(r => (
              <div key={r.id} className="ml-6 mt-2 rounded-lg border border-white/5 bg-white/[0.01] p-3 flex gap-2">
                <CornerDownRight size={12} className="text-slate-700 shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">{r.author?.displayName || '알 수 없음'}</span>
                      <span className="text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {member && r.authorId === member.id && (
                      <button onClick={() => handleDelete(r.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{r.content}</p>
                </div>
              </div>
            ))}

            {/* 답글 입력 */}
            {replyTo === c.id && (
              <div className="ml-6 mt-2 flex gap-2">
                <input
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReply(c.id)}
                  placeholder="답글 작성..."
                  autoFocus
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button onClick={() => handleReply(c.id)} disabled={!replyContent.trim() || submitting}
                  className="rounded-lg bg-indigo-600/80 px-3 py-2 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors">
                  <Send size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
