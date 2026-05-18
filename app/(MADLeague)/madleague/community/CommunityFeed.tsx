'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Pin, Loader2, Plus, X, Paperclip, ImageIcon, Film, FileText, AlertCircle } from 'lucide-react';
import type { MadClub } from '@/lib/supabase/madleague';

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'file';
  name: string;
  size: number;
}

interface Post {
  id: string;
  category: string;
  title: string;
  content: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  club_id: string | null;
  media: MediaItem[] | null;
  mad_members: { name: string; avatar_url: string | null } | null;
  mad_clubs: { slug: string; name: string; color: string | null } | null;
}

type LikeState = Record<string, { count: number; liked: boolean; processing: boolean }>;

interface Props {
  initialCategory: string;
  initialClub?: string;
  clubs: MadClub[];
}

const CATEGORY_LABEL: Record<string, string> = {
  free: '자유', question: '질문', share: '공유', insight: '인사이트', pinboard: '핀보드', notice: '공지',
};

const MAX_FILES = 5;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function CommunityFeed({ initialCategory, initialClub, clubs }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [likes, setLikes] = useState<LikeState>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (initialCategory && initialCategory !== 'all') qs.set('category', initialCategory);
      if (initialClub) qs.set('club', initialClub);
      const res = await fetch(`/api/madleague/posts?${qs.toString()}`);
      const data = await res.json();
      const fetched: Post[] = data.posts ?? [];
      setPosts(fetched);
      setLikes(prev => {
        const next = { ...prev };
        fetched.forEach(p => {
          if (!next[p.id]) next[p.id] = { count: p.likes_count, liked: false, processing: false };
        });
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [initialCategory, initialClub]);

  useEffect(() => { load(); }, [load]);

  async function toggleLike(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    e.stopPropagation();
    const cur = likes[postId];
    if (!cur || cur.processing) return;
    setLikes(prev => ({
      ...prev,
      [postId]: { count: cur.liked ? cur.count - 1 : cur.count + 1, liked: !cur.liked, processing: true },
    }));
    try {
      const res = await fetch(`/api/madleague/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) {
        setLikes(prev => ({ ...prev, [postId]: { ...cur, processing: false } }));
      } else {
        const data = await res.json();
        setLikes(prev => ({
          ...prev,
          [postId]: { count: prev[postId].count, liked: data.liked, processing: false },
        }));
      }
    } catch {
      setLikes(prev => ({ ...prev, [postId]: { ...cur, processing: false } }));
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-neutral-500" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-neutral-500">{posts.length}개 글</div>
        <button
          onClick={() => setWriting(true)}
          className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-4 py-2 text-sm transition"
        >
          <Plus className="h-4 w-4" /> 새 글
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 text-sm">
          글이 없습니다. 첫 글을 작성해보세요.
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const images = (post.media ?? []).filter(m => m.type === 'image');
            const totalMedia = (post.media ?? []).length;
            const firstImage = images[0];

            return (
              <Link
                key={post.id}
                href={`/madleague/community/${post.id}`}
                className="block bg-neutral-950 border border-neutral-900 hover:border-[#EC1D25] transition p-5"
              >
                <div className={`flex gap-4 ${firstImage ? 'items-start' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      {post.is_pinned && <Pin className="h-3 w-3 text-[#FFC000]" />}
                      <span className="font-bold text-[#EC1D25]">{CATEGORY_LABEL[post.category] ?? post.category}</span>
                      {post.mad_clubs && (
                        <>
                          <span className="text-neutral-600">·</span>
                          <span className="inline-flex items-center gap-1 text-neutral-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: post.mad_clubs.color ?? '#EC1D25' }} />
                            {post.mad_clubs.name}
                          </span>
                        </>
                      )}
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-500">{timeAgo(post.created_at)}</span>
                    </div>
                    <div className="font-bold text-white line-clamp-1">{post.title}</div>
                    <div className="mt-1 text-sm text-neutral-400 line-clamp-2">{post.content}</div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                      <button
                        onClick={(e) => toggleLike(e, post.id)}
                        className={`inline-flex items-center gap-1 transition-colors hover:text-[#EC1D25] ${likes[post.id]?.liked ? 'text-[#EC1D25]' : ''}`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${likes[post.id]?.liked ? 'fill-current' : ''}`} />
                        {likes[post.id]?.count ?? post.likes_count}
                      </button>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}</span>
                      {totalMedia > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" /> {totalMedia}
                        </span>
                      )}
                      {post.mad_members && <span className="ml-auto">{post.mad_members.name}</span>}
                    </div>
                  </div>

                  {firstImage && (
                    <div className="shrink-0 w-20 h-20 bg-neutral-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstImage.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {writing && (
        <WriteModal
          clubs={clubs}
          onClose={() => setWriting(false)}
          onCreated={() => { setWriting(false); load(); }}
        />
      )}
    </>
  );
}

interface UploadingFile {
  id: string;
  file: File;
  progress: 'uploading' | 'done' | 'error';
  result?: MediaItem;
  error?: string;
}

function FileTypeIcon({ type }: { type: 'image' | 'video' | 'file' }) {
  if (type === 'image') return <ImageIcon className="h-4 w-4" />;
  if (type === 'video') return <Film className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function WriteModal({ clubs, onClose, onCreated }: { clubs: MadClub[]; onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedMedia = uploadQueue
    .filter(u => u.progress === 'done' && u.result)
    .map(u => u.result!);

  const isUploading = uploadQueue.some(u => u.progress === 'uploading');
  const canAddMore = uploadQueue.length < MAX_FILES;

  async function handleFiles(files: FileList) {
    const toAdd = Array.from(files).slice(0, MAX_FILES - uploadQueue.length);
    if (toAdd.length === 0) return;

    const newEntries: UploadingFile[] = toAdd.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      progress: 'uploading',
    }));
    setUploadQueue(prev => [...prev, ...newEntries]);

    await Promise.all(
      newEntries.map(async (entry) => {
        const fd = new FormData();
        fd.append('file', entry.file);
        try {
          const res = await fetch('/api/madleague/upload', { method: 'POST', body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'UPLOAD_FAILED');
          setUploadQueue(prev =>
            prev.map(u => u.id === entry.id ? { ...u, progress: 'done', result: data } : u)
          );
        } catch (e) {
          setUploadQueue(prev =>
            prev.map(u => u.id === entry.id
              ? { ...u, progress: 'error', error: e instanceof Error ? e.message : '업로드 실패' }
              : u
            )
          );
        }
      })
    );
  }

  function removeFile(id: string) {
    setUploadQueue(prev => prev.filter(u => u.id !== id));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return;
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      category: String(fd.get('category') ?? 'free'),
      title: String(fd.get('title') ?? ''),
      content: String(fd.get('content') ?? ''),
      clubSlug: String(fd.get('clubSlug') ?? '') || undefined,
      media: completedMedia,
    };
    try {
      const res = await fetch('/api/madleague/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'UNKNOWN');
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출 실패');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-900">
          <h2 className="text-lg font-black text-white">새 글 작성</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs font-bold text-neutral-400 mb-1">카테고리</div>
              <select name="category" defaultValue="free" className="w-full bg-black border border-neutral-800 px-3 py-2 text-white text-sm focus:border-[#EC1D25] focus:outline-none">
                <option value="free">자유</option>
                <option value="question">질문</option>
                <option value="share">공유</option>
                <option value="insight">인사이트</option>
                <option value="pinboard">핀보드 (공모전/프로젝트)</option>
              </select>
            </label>
            <label className="block">
              <div className="text-xs font-bold text-neutral-400 mb-1">동아리 (선택)</div>
              <select name="clubSlug" defaultValue="" className="w-full bg-black border border-neutral-800 px-3 py-2 text-white text-sm focus:border-[#EC1D25] focus:outline-none">
                <option value="">전체 공개</option>
                {clubs.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <div className="text-xs font-bold text-neutral-400 mb-1">제목</div>
            <input name="title" required maxLength={200} className="w-full bg-black border border-neutral-800 px-3 py-2 text-white focus:border-[#EC1D25] focus:outline-none" />
          </label>

          <label className="block">
            <div className="text-xs font-bold text-neutral-400 mb-1">내용</div>
            <textarea name="content" required rows={8} maxLength={10000} className="w-full bg-black border border-neutral-800 px-3 py-2 text-white resize-none focus:border-[#EC1D25] focus:outline-none" />
          </label>

          {/* 미디어 첨부 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-neutral-400">첨부 파일 ({uploadQueue.length}/{MAX_FILES})</div>
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  <Paperclip className="h-3.5 w-3.5" /> 파일 추가
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="hidden"
              onChange={e => { if (e.target.files) { handleFiles(e.target.files); e.target.value = ''; } }}
            />

            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                {uploadQueue.map(u => (
                  <div key={u.id} className="flex items-center gap-3 bg-black border border-neutral-900 p-3">
                    {u.progress === 'done' && u.result ? (
                      <>
                        {u.result.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.result.url} alt={u.result.name} className="h-10 w-10 object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 bg-neutral-900 flex items-center justify-center shrink-0 text-[#EC1D25]">
                            <FileTypeIcon type={u.result.type} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{u.result.name}</div>
                          <div className="text-xs text-neutral-500">{formatBytes(u.result.size)}</div>
                        </div>
                      </>
                    ) : u.progress === 'error' ? (
                      <>
                        <div className="h-10 w-10 bg-red-950 flex items-center justify-center shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{u.file.name}</div>
                          <div className="text-xs text-red-400">{u.error}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 bg-neutral-900 flex items-center justify-center shrink-0">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{u.file.name}</div>
                          <div className="text-xs text-neutral-500">업로드 중...</div>
                        </div>
                      </>
                    )}
                    <button type="button" onClick={() => removeFile(u.id)} className="shrink-0 text-neutral-600 hover:text-white transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadQueue.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-neutral-800 hover:border-neutral-600 p-6 text-center text-sm text-neutral-600 hover:text-neutral-400 transition"
              >
                <Paperclip className="h-5 w-5 mx-auto mb-2" />
                이미지, 영상, 파일 첨부 (최대 {MAX_FILES}개, 파일당 50MB)
              </button>
            )}
          </div>

          {error && <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-2">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-white px-4 py-2">취소</button>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold px-6 py-2 text-sm"
            >
              {isUploading ? '업로드 중...' : submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}
