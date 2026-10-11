'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Paperclip, Pin, Trash2, X, Eye, EyeOff } from 'lucide-react';

/**
 * 동아리 홍보 게시물 관리 (운영진·직원) — /api/madleague/clubs/{slug}/posts
 * 공개 글이라 동아리 페이지 "활동 소식"에 바로 노출된다. 사진은 /api/madleague/upload (매드리거 계정 필요)
 */
interface Media { url: string; type: 'image' | 'video' | 'file'; name: string; size: number }
interface ClubPost { id: string; title: string; content: string; media: Media[]; is_pinned: boolean; is_published: boolean; created_at: string }

const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';
const MAX_MEDIA = 10;

export function ClubPostsEditor({ slug, accent }: { slug: string; accent: string }) {
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const base = `/api/madleague/clubs/${slug}/posts`;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(base, { cache: 'no-store' }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setPosts(Array.isArray(data?.posts) ? data.posts : []);
    setLoading(false);
  }, [base]);
  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setError('');
    for (const f of Array.from(files).slice(0, MAX_MEDIA - media.length)) {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/madleague/upload', { method: 'POST', body: fd }).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (res?.ok && data?.url) setMedia(m => [...m, data as Media]);
      else setError(data?.error === 'FILE_TOO_LARGE' ? '파일이 너무 큽니다.' : data?.error === 'NOT_A_MEMBER' ? '사진 업로드는 매드리거 계정에서만 됩니다.' : '파일을 올리지 못했습니다.');
    }
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    setSaving(true); setError('');
    const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, media }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) { setError(data?.error ?? '저장하지 못했습니다.'); return; }
    setTitle(''); setContent(''); setMedia([]);
    load();
  };

  const patch = async (id: string, body: Partial<ClubPost>) => {
    const res = await fetch(`${base}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    if (!res?.ok) { setError('처리하지 못했습니다.'); return; }
    load();
  };
  const remove = async (id: string) => {
    if (!confirm('이 게시물을 삭제할까요?')) return;
    const res = await fetch(`${base}/${id}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) { setError('삭제하지 못했습니다.'); return; }
    load();
  };

  return (
    <div className="space-y-10">
      <p className="text-sm text-neutral-400 break-keep">
        동아리 페이지 <span className="text-white">활동 소식</span>에 공개됩니다 — 신입 부원 후보·기업·다른 동아리가 봅니다. 사진 위주의 짧은 소식이 좋습니다.
      </p>

      <form onSubmit={submit} className="space-y-3 border border-neutral-800 bg-neutral-950 p-5">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25]">NEW POST</div>
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="제목 (예: 2026 상반기 경쟁 PT 본선 진출!)" className={inputCls} />
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} maxLength={5000} placeholder="내용 (선택)" className={`${inputCls} resize-y`} />
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:border-white">
            <Paperclip className="h-3.5 w-3.5" /> 사진·파일 ({media.length}/{MAX_MEDIA})
            <input type="file" multiple accept="image/*,video/*,.pdf" className="hidden" disabled={uploading || media.length >= MAX_MEDIA}
              onChange={e => { upload(e.target.files); e.target.value = ''; }} />
          </label>
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        {media.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {media.map((m, i) => (
              <div key={m.url} className="relative">
                {m.type === 'image'
                  ? <Image src={m.url} alt="" width={96} height={96} className="h-24 w-24 object-cover" unoptimized />
                  : <div className="flex h-24 w-24 items-center justify-center border border-neutral-700 px-2 text-[11px] text-neutral-400 break-all">{m.name}</div>}
                <button type="button" onClick={() => setMedia(media.filter((_, j) => j !== i))} aria-label="첨부 삭제"
                  className="absolute -right-1.5 -top-1.5 bg-black border border-neutral-600 p-0.5"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={saving || uploading} className="px-6 py-3 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: accent }}>
          {saving ? '올리는 중…' : '게시'}
        </button>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-bold tracking-widest text-neutral-500">올린 게시물 {posts.length}</h3>
        {loading ? <p className="text-sm text-neutral-500">불러오는 중…</p> : posts.length === 0 ? (
          <p className="border border-neutral-800 px-4 py-10 text-center text-sm text-neutral-500">아직 올린 게시물이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-neutral-900 border border-neutral-800">
            {posts.map(p => (
              <li key={p.id} className="flex items-start gap-4 px-4 py-4">
                {p.media.find(m => m.type === 'image')
                  ? <Image src={p.media.find(m => m.type === 'image')!.url} alt="" width={64} height={64} className="h-16 w-16 shrink-0 object-cover" unoptimized />
                  : <div className="h-16 w-16 shrink-0 bg-neutral-900" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {p.is_pinned && <Pin className="h-3.5 w-3.5 text-[#EC1D25]" />}
                    <span className="truncate font-bold">{p.title}</span>
                    {!p.is_published && <span className="shrink-0 border border-neutral-700 px-1.5 text-[11px] text-neutral-400">비공개</span>}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{new Date(p.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} · 사진 {p.media.filter(m => m.type === 'image').length}</div>
                  {p.content && <p className="mt-1 line-clamp-2 text-sm text-neutral-400 break-keep">{p.content}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" onClick={() => patch(p.id, { is_pinned: !p.is_pinned })} title={p.is_pinned ? '고정 해제' : '상단 고정'}
                    className="border border-neutral-700 p-1.5 hover:border-white"><Pin className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => patch(p.id, { is_published: !p.is_published })} title={p.is_published ? '비공개로' : '공개로'}
                    className="border border-neutral-700 p-1.5 hover:border-white">{p.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  <button type="button" onClick={() => remove(p.id)} title="삭제"
                    className="border border-neutral-700 p-1.5 hover:border-[#EC1D25] hover:text-[#EC1D25]"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
