'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Banknote, MessageSquare, Pin, ImageIcon, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

interface GroupDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  max_members: number;
  current_members: number;
  event_date: string | null;
  location: string | null;
  location_detail: string | null;
  fee: number;
  tags: string[];
  cover_image_url: string | null;
  leader: { display_name: string; job_function: string; experience_years: number } | null;
  need: { display_text: string; count: number } | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  pinned: boolean;
  created_at: string;
  commentCount: number;
  author: { id: string; display_name: string; avatar_url: string | null; job_function: string | null } | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; display_name: string; avatar_url: string | null } | null;
}

type Tab = 'info' | 'board';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [tab, setTab] = useState<Tab>('info');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  // Board state
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showWrite, setShowWrite] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeImages, setWriteImages] = useState<string[]>([]);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetch(`/api/badak/groups?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.groups?.find((g: GroupDetail) => g.id === id);
        if (found) setGroup(found);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (tab === 'board') {
      fetch(`/api/badak/groups/${id}/posts`)
        .then((r) => r.json())
        .then((data) => setPosts(data.posts || []))
        .catch(() => {});
    }
  }, [tab, id]);

  const loadComments = (postId: string) => {
    fetch(`/api/badak/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {});
  };

  const handleJoin = async () => {
    if (!isAuthenticated) { alert('로그인이 필요합니다'); return; }
    setJoining(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setJoining(false); return; }

    const res = await fetch(`/api/badak/groups/${id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      setJoined(true);
      if (group) setGroup({ ...group, current_members: group.current_members + 1 });
    } else {
      const err = await res.json();
      alert(err.error || '참여 신청 실패');
    }
    setJoining(false);
  };

  const handleWritePost = async () => {
    if (!writeTitle.trim() || !writeContent.trim()) return;
    setSubmittingPost(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmittingPost(false); return; }

    const res = await fetch(`/api/badak/groups/${id}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: writeTitle, content: writeContent, images: writeImages }),
    });

    if (res.ok) {
      setShowWrite(false);
      setWriteTitle('');
      setWriteContent('');
      setWriteImages([]);
      // 리로드
      const data = await fetch(`/api/badak/groups/${id}/posts`).then((r) => r.json());
      setPosts(data.posts || []);
    }
    setSubmittingPost(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) { alert('5MB 이하만 가능'); return; }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/badak/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });
    if (res.ok) {
      const { url } = await res.json();
      setWriteImages((prev) => [...prev, url]);
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedPost || !newComment.trim()) return;
    setSubmittingComment(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmittingComment(false); return; }

    const res = await fetch(`/api/badak/posts/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment('');
      loadComments(selectedPost.id);
    }
    setSubmittingComment(false);
  };

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-neutral-400">로딩 중...</div>
      </div>
    );
  }

  const isFull = group.current_members >= group.max_members;
  const leader = group.leader as GroupDetail['leader'];

  return (
    <div className="mx-auto min-h-screen max-w-[860px] bg-white text-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <Link href="/badak" className="text-neutral-400 hover:text-neutral-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{group.title}</h1>
      </div>

      {/* Cover */}
      {group.cover_image_url ? (
        <img src={group.cover_image_url} alt="" className="h-40 w-full object-cover" />
      ) : (
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f0fdf4 100%)' }} />
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 px-5">
        {[
          { key: 'info' as Tab, label: '모임 정보' },
          { key: 'board' as Tab, label: '게시판' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedPost(null); }}
            className="border-b-2 px-4 pb-3 pt-4 text-sm font-medium transition-colors"
            style={{
              borderColor: tab === t.key ? '#2563eb' : 'transparent',
              color: tab === t.key ? '#2563eb' : '#9ca3af',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="px-5 pb-28 pt-4">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: group.status === 'recruiting' ? '#f0fdf4' : '#fef2f2',
              color: group.status === 'recruiting' ? '#16a34a' : '#dc2626',
            }}
          >
            {group.status === 'recruiting' ? '모집중' : '마감'}
          </span>

          {group.description && (
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{group.description}</p>
          )}

          {leader && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-100 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {leader.display_name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium">바닥장 {leader.display_name}</div>
                <div className="text-xs text-neutral-400">{leader.job_function} · {leader.experience_years}년차</div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {group.event_date && (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Calendar className="h-4 w-4 text-neutral-300" />
                {new Date(group.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            )}
            {group.location && (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <MapPin className="h-4 w-4 text-neutral-300" />
                {group.location}{group.location_detail ? ` · ${group.location_detail}` : ''}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Users className="h-4 w-4 text-neutral-300" />
              <span style={{ color: isFull ? '#dc2626' : undefined }}>
                {group.current_members}/{group.max_members}명
              </span>
            </div>
            {group.fee > 0 && (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Banknote className="h-4 w-4 text-neutral-300" />
                {group.fee.toLocaleString()}원
              </div>
            )}
          </div>

          {group.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {group.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-neutral-50 px-3 py-1 text-xs text-neutral-400">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Board tab */}
      {tab === 'board' && !selectedPost && !showWrite && (
        <div className="px-5 pb-28 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-neutral-400">{posts.length}개의 글</span>
            {isAuthenticated && (
              <button
                onClick={() => setShowWrite(true)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                글쓰기
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-300">
              아직 게시글이 없어요
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => {
                const author = post.author as Post['author'];
                return (
                  <button
                    key={post.id}
                    onClick={() => { setSelectedPost(post); loadComments(post.id); }}
                    className="w-full rounded-xl border border-neutral-100 p-4 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-start gap-3">
                      {post.images?.length > 0 && (
                        <img src={post.images[0]} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {post.pinned && <Pin className="h-3 w-3 text-blue-500" />}
                          <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                        </div>
                        <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{post.content}</p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-300">
                          <span>{author?.display_name}</span>
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" /> {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Write post */}
      {tab === 'board' && showWrite && (
        <div className="px-5 pb-28 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setShowWrite(false)} className="text-sm text-neutral-400">← 뒤로</button>
            <h2 className="text-sm font-bold">글쓰기</h2>
            <div className="w-10" />
          </div>

          <div className="space-y-4">
            <input
              value={writeTitle}
              onChange={(e) => setWriteTitle(e.target.value)}
              placeholder="제목"
              className="w-full border-b border-neutral-200 pb-3 text-lg font-bold outline-none placeholder:text-neutral-300"
            />
            <textarea
              value={writeContent}
              onChange={(e) => setWriteContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={8}
              className="w-full resize-none text-sm leading-relaxed outline-none placeholder:text-neutral-300"
            />

            {writeImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {writeImages.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-50">
                <ImageIcon className="h-4 w-4" /> 이미지
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[860px] -translate-x-1/2 border-t border-neutral-100 bg-white px-5 py-4">
            <button
              onClick={handleWritePost}
              disabled={!writeTitle.trim() || !writeContent.trim() || submittingPost}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-30"
            >
              {submittingPost ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </div>
      )}

      {/* Post detail */}
      {tab === 'board' && selectedPost && (
        <div className="px-5 pb-28 pt-4">
          <button onClick={() => setSelectedPost(null)} className="mb-4 text-sm text-neutral-400">← 목록</button>

          <h2 className="text-lg font-bold">{selectedPost.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
            <span>{(selectedPost.author as Post['author'])?.display_name}</span>
            <span>·</span>
            <span>{new Date(selectedPost.created_at).toLocaleDateString('ko-KR')}</span>
          </div>

          <div className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
            {selectedPost.content}
          </div>

          {selectedPost.images?.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedPost.images.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Comments */}
          <div className="mt-8 border-t border-neutral-100 pt-4">
            <h3 className="mb-3 text-sm font-bold">댓글 {comments.length}</h3>
            <div className="space-y-3">
              {comments.map((c) => {
                const author = c.author as Comment['author'];
                return (
                  <div key={c.id} className="rounded-lg bg-neutral-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-medium text-neutral-600">{author?.display_name}</span>
                      <span>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-700">{c.content}</p>
                  </div>
                );
              })}
            </div>

            {isAuthenticated && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="댓글 입력"
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-blue-300"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="rounded-lg bg-blue-600 p-2.5 text-white disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom CTA (info tab only) */}
      {tab === 'info' && (
        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[860px] -translate-x-1/2 border-t border-neutral-100 bg-white px-5 py-4">
          {joined ? (
            <div className="rounded-xl bg-green-50 py-3.5 text-center text-sm font-bold text-green-600">
              참여 신청 완료!
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isFull || joining}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-30"
              style={{ background: isFull ? '#d1d5db' : '#2563eb' }}
            >
              {isFull ? '모집 마감' : joining ? '신청 중...' : '참여 신청하기'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
