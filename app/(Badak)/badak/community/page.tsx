'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, Heart, PenLine, Clock, Eye, MessageSquare, Star, Lightbulb,
  X, Send, ArrowLeft, Trash2, Edit3, Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';

type BoardType = 'chat' | 'review' | 'proposal';

interface Post {
  id: string;
  board: BoardType;
  title: string;
  content: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  user_id: string;
  group_id: string | null;
  rating: number | null;
  target_members: number | null;
  created_at: string;
  member: { display_name: string; job_function: string | null; avatar_url: string | null } | null;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  member: { display_name: string; avatar_url: string | null } | null;
}

const BOARD_ICONS: Record<BoardType, React.ReactNode> = {
  chat: <MessageSquare className="h-4 w-4" />,
  review: <Star className="h-4 w-4" />,
  proposal: <Lightbulb className="h-4 w-4" />,
};

const BOARDS: { key: BoardType; label: string; desc: string }[] = [
  { key: 'chat', label: '수다', desc: '자유롭게 이야기해요' },
  { key: 'review', label: '모임 후기', desc: '모임 경험을 나눠요' },
  { key: 'proposal', label: '모임 제안', desc: '새로운 모임을 제안해요' },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function CommunityPage() {
  const [activeBoard, setActiveBoard] = useState<BoardType>('chat');
  const [showLogin, setShowLogin] = useState(false);
  const [showWrite, setShowWrite] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Record<BoardType, number>>({ chat: 0, review: 0, proposal: 0 });
  const [loading, setLoading] = useState(true);

  // 글 상세
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);

  // 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // 삭제 확인
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);

  // 수정
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 글쓰기 폼
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeTags, setWriteTags] = useState('');
  const [writeRating, setWriteRating] = useState(0);
  const [writeTarget, setWriteTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getSession = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const { data: { session } } = await createClient().auth.getSession();
    return session;
  };

  // 각 보드 글 개수 갱신 (글 작성/삭제 후 호출)
  const refreshCounts = useCallback(async () => {
    const results = await Promise.all(
      (['chat', 'review', 'proposal'] as BoardType[]).map(async (b) => {
        // count-only endpoint이 없으므로 limit=50으로 가져와서 길이 측정
        const res = await fetch(`/api/badak/community?board=${b}&limit=50`);
        const data = await res.json();
        return [b, data.posts?.length || 0] as const;
      })
    );
    setCounts(Object.fromEntries(results) as Record<BoardType, number>);
  }, []);

  const loadPosts = useCallback(async (board: BoardType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/badak/community?board=${board}&limit=30`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  useEffect(() => { loadPosts(activeBoard); }, [activeBoard, loadPosts]);

  const activeInfo = BOARDS.find((b) => b.key === activeBoard)!;

  // 글 상세 열기
  const openPost = async (post: Post) => {
    setSelectedPost(post);
    setLiked(false);
    try {
      const res = await fetch(`/api/badak/community/${post.id}`);
      const data = await res.json();
      if (data.post) setSelectedPost(data.post);
      setComments(data.comments || []);
    } catch { /* ignore */ }
  };

  // 좋아요
  const handleLike = async () => {
    if (!isAuthenticated || !selectedPost) { setShowLogin(true); return; }
    const session = await getSession();
    if (!session) return;
    const res = await fetch(`/api/badak/community/${selectedPost.id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setSelectedPost({ ...selectedPost, likes_count: data.likesCount });
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!selectedPost || !newComment.trim() || submittingComment) return;
    if (!isAuthenticated) { setShowLogin(true); return; }
    setSubmittingComment(true);
    const session = await getSession();
    if (!session) { setSubmittingComment(false); return; }
    const res = await fetch(`/api/badak/community/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      setNewComment('');
      // 댓글 재로드
      const r = await fetch(`/api/badak/community/${selectedPost.id}`);
      const d = await r.json();
      setComments(d.comments || []);
      setSelectedPost({ ...selectedPost, comments_count: (d.comments || []).length });
    }
    setSubmittingComment(false);
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return;
    const session = await getSession();
    if (!session) return;
    const res = await fetch(`/api/badak/community/${selectedPost.id}/comments?commentId=${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId));
      setSelectedPost({ ...selectedPost, comments_count: selectedPost.comments_count - 1 });
    }
  };

  // 글 삭제
  const handleDeletePost = async (postId: string) => {
    const session = await getSession();
    if (!session) return;
    const res = await fetch(`/api/badak/community/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setPendingDeletePostId(null);
      setSelectedPost(null);
      loadPosts(activeBoard);
      refreshCounts();
    }
  };

  // 글 수정
  const startEdit = (post: Post) => {
    setEditingPost(post);
    setWriteTitle(post.title);
    setWriteContent(post.content);
    setWriteTags(post.tags?.join(', ') || '');
    setWriteRating(post.rating || 0);
    setWriteTarget(post.target_members?.toString() || '');
    setShowWrite(true);
    setSelectedPost(null);
  };

  // 글 작성/수정 제출
  const handleSubmitPost = async () => {
    if (!writeTitle.trim() || !writeContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session) { setShowLogin(true); setSubmitting(false); return; }
      const tags = writeTags.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        board: activeBoard,
        title: writeTitle.trim(),
        content: writeContent.trim(),
        tags,
        rating: activeBoard === 'review' && writeRating > 0 ? writeRating : undefined,
        targetMembers: activeBoard === 'proposal' && writeTarget ? parseInt(writeTarget) : undefined,
      };

      const url = editingPost ? `/api/badak/community/${editingPost.id}` : '/api/badak/community';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowWrite(false);
        setEditingPost(null);
        setWriteTitle(''); setWriteContent(''); setWriteTags(''); setWriteRating(0); setWriteTarget('');
        loadPosts(activeBoard);
        refreshCounts();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || '글 작성에 실패했습니다. 로그인 상태를 확인해주세요.');
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleWrite = () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setEditingPost(null);
    setWriteTitle(''); setWriteContent(''); setWriteTags(''); setWriteRating(0); setWriteTarget('');
    setShowWrite(true);
  };

  // 검색 필터
  const filteredPosts = searchQuery.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const isMyPost = (post: Post) => user?.id && post.user_id === user.id;

  // ── 글 상세 뷰 ──
  if (selectedPost) {
    const author = selectedPost.member;
    return (
      <div className="min-h-screen bg-[#1a1a2e] pt-14">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
          <button onClick={() => setSelectedPost(null)} className="mb-4 flex items-center gap-1.5 text-sm text-white/30 hover:text-white/50">
            <ArrowLeft className="h-4 w-4" /> 목록
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">{BOARDS.find(b => b.key === selectedPost.board)?.label}</span>
            {selectedPost.board === 'review' && selectedPost.rating && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5" style={{ color: i < selectedPost.rating! ? '#fbbf24' : 'rgba(255,255,255,0.15)', fill: i < selectedPost.rating! ? '#fbbf24' : 'none' }} />
                ))}
              </span>
            )}
          </div>

          <h1 className="text-lg font-bold text-white/90">{selectedPost.title}</h1>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/50">
                {author?.display_name?.charAt(0) || '?'}
              </div>
              <span>{author?.display_name || '익명'}</span>
              {author?.job_function && <><span className="text-white/15">·</span><span className="text-white/20">{author.job_function}</span></>}
              <span className="text-white/15">·</span>
              <span>{timeAgo(selectedPost.created_at)}</span>
            </div>
            {isMyPost(selectedPost) && (
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(selectedPost)} className="text-white/25 hover:text-white/50"><Edit3 className="h-3.5 w-3.5" /></button>
                <button
                  onClick={() => setPendingDeletePostId(selectedPost.id)}
                  className="text-white/25 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 삭제 확인 배너 */}
          {pendingDeletePostId === selectedPost.id && (
            <div className="mt-3 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <p className="mb-1.5 text-[12px] font-semibold text-red-400/90">이 글을 삭제하시겠습니까?</p>
              <p className="mb-3 text-[11px] text-white/35">삭제된 글은 복구할 수 없습니다. 댓글도 함께 삭제됩니다.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  삭제
                </button>
                <button
                  onClick={() => setPendingDeletePostId(null)}
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-[11px] text-white/40"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {selectedPost.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">#{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/60">{selectedPost.content}</div>

          {/* 좋아요 + 통계 */}
          <div className="mt-6 flex items-center gap-4 border-t border-b border-white/8 py-3">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: liked ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
              <Heart className="h-4 w-4" style={{ fill: liked ? '#f87171' : 'none' }} /> {selectedPost.likes_count}
            </button>
            <span className="flex items-center gap-1 text-xs text-white/25"><MessageCircle className="h-3.5 w-3.5" /> {comments.length}</span>
            <span className="flex items-center gap-1 text-xs text-white/25"><Eye className="h-3.5 w-3.5" /> {formatNumber(selectedPost.views_count)}</span>
          </div>

          {/* 댓글 */}
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-bold text-white/60">댓글 {comments.length}</h3>
            <div className="space-y-2">
              {comments.map(c => (
                <div key={c.id} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <span className="font-medium text-white/50">{c.member?.display_name || '익명'}</span>
                      <span>{timeAgo(c.created_at)}</span>
                    </div>
                    {user?.id === c.user_id && (
                      <button onClick={() => handleDeleteComment(c.id)} className="text-white/15 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/60">{c.content}</p>
                </div>
              ))}
            </div>

            {isAuthenticated && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="댓글 입력"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ffd93d]/30"
                />
                <button onClick={handleSubmitComment} disabled={!newComment.trim() || submittingComment}
                  className="rounded-lg p-2.5 disabled:opacity-30" style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  // ── 목록 뷰 ──
  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
        <div className="mb-6">
          <h1 className="mb-1 text-lg font-bold text-white">커뮤니티</h1>
          <p className="text-xs text-white/40">바닥 멤버들과 자유롭게 소통하세요</p>
        </div>

        {/* 보드 탭 */}
        <div className="mb-5 flex gap-2">
          {BOARDS.map((board) => {
            const isActive = activeBoard === board.key;
            return (
              <button key={board.key} onClick={() => setActiveBoard(board.key)}
                className="flex-1 rounded-xl border px-3 py-3 text-left transition-all"
                style={{ background: isActive ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)', borderColor: isActive ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.06)' }}>
                <div className="mb-1" style={{ color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>{BOARD_ICONS[board.key]}</div>
                <div className="text-xs font-semibold" style={{ color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.7)' }}>{board.label}</div>
                <div className="text-[10px]" style={{ color: isActive ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.25)' }}>{counts[board.key]}개 글</div>
              </button>
            );
          })}
        </div>

        {/* 보드 설명 + 검색 + 글쓰기 */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white/40">
            {BOARD_ICONS[activeBoard]}
            <span className="text-xs">{activeInfo.desc}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/50">
              <Search className="h-4 w-4" />
            </button>
            <button onClick={handleWrite} className="flex items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
              <PenLine className="h-3.5 w-3.5" /> 글쓰기
            </button>
          </div>
        </div>

        {/* 검색 바 */}
        {showSearch && (
          <div className="mb-4">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="제목, 내용, 태그 검색..."
              autoFocus
              className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40"
            />
          </div>
        )}

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-2 flex justify-center text-white/20">{BOARD_ICONS[activeBoard]}</div>
            <div className="text-sm text-white/40">{searchQuery ? '검색 결과가 없어요' : '아직 작성된 글이 없어요'}</div>
            {!searchQuery && <div className="mt-1 text-xs text-white/20">첫 번째 글을 남겨보세요!</div>}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPosts.map((post) => {
              const author = post.member;
              return (
                <button key={post.id} onClick={() => openPost(post)}
                  className="group w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.06]">
                  {post.tags?.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {post.tags.map(tag => <span key={tag} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">#{tag}</span>)}
                    </div>
                  )}
                  {post.board === 'review' && post.rating && (
                    <div className="mb-2 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5" style={{ color: i < post.rating! ? '#fbbf24' : 'rgba(255,255,255,0.15)', fill: i < post.rating! ? '#fbbf24' : 'none' }} />
                      ))}
                    </div>
                  )}
                  <h3 className="mb-1 text-sm font-semibold text-white/90 group-hover:text-white">{post.title}</h3>
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/40">{post.content}</p>
                  {post.board === 'proposal' && post.target_members && (
                    <div className="mb-3 flex items-center justify-between text-[10px]">
                      <span className="text-white/30">목표 인원</span>
                      <span className="font-medium text-white/50">{post.target_members}명</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/50">{author?.display_name?.charAt(0) || '?'}</div>
                      <span className="text-[11px] text-white/50">{author?.display_name || '익명'}</span>
                      {author?.job_function && <><span className="text-[10px] text-white/20">·</span><span className="text-[10px] text-white/25">{author.job_function}</span></>}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/25">
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {formatNumber(post.views_count)}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                      <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {post.comments_count}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/15"><Clock className="h-2.5 w-2.5" /> {timeAgo(post.created_at)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 글쓰기/수정 모달 */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#1e1e38] p-5" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80">{editingPost ? '글 수정' : `${activeInfo.label} 글쓰기`}</h2>
              <button onClick={() => { setShowWrite(false); setEditingPost(null); }} className="text-white/30 hover:text-white/50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={writeTitle} onChange={e => setWriteTitle(e.target.value)} placeholder="제목"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
              <textarea value={writeContent} onChange={e => setWriteContent(e.target.value)} placeholder="내용을 입력하세요" rows={6}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
              <input value={writeTags} onChange={e => setWriteTags(e.target.value)} placeholder="태그 (쉼표로 구분)"
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#ffd93d]/30" />
              {activeBoard === 'review' && (
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">모임 평점</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setWriteRating(n)}>
                        <Star className="h-5 w-5" style={{ color: n <= writeRating ? '#fbbf24' : 'rgba(255,255,255,0.15)', fill: n <= writeRating ? '#fbbf24' : 'none' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeBoard === 'proposal' && (
                <input value={writeTarget} onChange={e => setWriteTarget(e.target.value)} placeholder="목표 인원수" type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#ffd93d]/30" />
              )}
              <button onClick={handleSubmitPost} disabled={!writeTitle.trim() || !writeContent.trim() || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: writeTitle.trim() && writeContent.trim() ? 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)' : 'rgba(255,255,255,0.06)', color: writeTitle.trim() && writeContent.trim() ? '#1a1a2e' : 'rgba(255,255,255,0.2)' }}>
                <Send className="h-4 w-4" />
                {submitting ? '등록 중...' : editingPost ? '수정하기' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
