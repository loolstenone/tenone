'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip, X, Loader2 } from 'lucide-react';

interface Media { url: string; type: 'image' | 'video' | 'file'; name: string; size: number }
const MAX_FILES = 5;
const inputCls = 'w-full bg-black border border-neutral-800 px-4 py-3 text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';

/** 동아리 방 글쓰기 — 게시판·제목·본문·첨부(최대 5) → /api/madleague/posts (clubSlug) */
export function CafeWriteForm({ slug, boards, defaultBoard, accent }: {
    slug: string;
    boards: { key: string; label: string }[];
    defaultBoard: string;
    accent: string;
}) {
    const router = useRouter();
    const [board, setBoard] = useState(defaultBoard);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<Media[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const upload = async (files: FileList | null) => {
        if (!files?.length) return;
        const list = Array.from(files).slice(0, MAX_FILES - media.length);
        setUploading(true); setError('');
        for (const f of list) {
            const fd = new FormData();
            fd.append('file', f);
            const res = await fetch('/api/madleague/upload', { method: 'POST', body: fd }).catch(() => null);
            const data = await res?.json().catch(() => null);
            if (res?.ok && data?.url) setMedia(m => [...m, data as Media]);
            else setError(data?.error === 'FILE_TOO_LARGE' ? '파일이 너무 큽니다.' : data?.error === 'INVALID_FILE_TYPE' ? '올릴 수 없는 파일 형식입니다.' : '파일을 올리지 못했습니다.');
        }
        setUploading(false);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) { setError('제목과 내용을 입력해주세요.'); return; }
        setSaving(true); setError('');
        const res = await fetch('/api/madleague/posts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubSlug: slug, category: board, title, content, media }),
        }).catch(() => null);
        const data = await res?.json().catch(() => null);
        setSaving(false);
        if (!res?.ok) { setError(data?.error === 'NOTICE_OFFICER_ONLY' ? '공지는 운영진만 쓸 수 있습니다.' : '글을 저장하지 못했습니다.'); return; }
        router.replace(`/madleague/clubs/${slug}/room/${data.post.id}`);
        router.refresh();
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <select value={board} onChange={e => setBoard(e.target.value)} className={inputCls}>
                {boards.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="제목" className={inputCls} />
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} maxLength={10000} placeholder="내용을 입력하세요" className={`${inputCls} resize-y`} />

            <div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:border-white">
                    <Paperclip className="h-3.5 w-3.5" /> 사진·파일 첨부 ({media.length}/{MAX_FILES})
                    <input type="file" multiple className="hidden" disabled={uploading || media.length >= MAX_FILES}
                        onChange={e => { upload(e.target.files); e.target.value = ''; }} />
                </label>
                {uploading && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
                {media.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {media.map((m, i) => (
                            <li key={m.url} className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="truncate">{m.name}</span>
                                <button type="button" onClick={() => setMedia(media.filter((_, j) => j !== i))} aria-label="첨부 삭제"><X className="h-3.5 w-3.5" /></button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
                <button type="submit" disabled={saving || uploading} className="px-6 py-3 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: accent }}>
                    {saving ? '저장 중…' : '등록'}
                </button>
                <button type="button" onClick={() => router.back()} className="border border-neutral-700 px-6 py-3 text-sm text-neutral-300 hover:border-white">취소</button>
            </div>
        </form>
    );
}
