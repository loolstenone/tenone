'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pin, Trash2, Loader2 } from 'lucide-react';

/** 동아리 방 글 관리 — 운영진·관리자: 고정/해제·삭제, 작성자: 삭제 */
export function CafeModeration({ slug, postId, pinned, canModerate, isAuthor }: {
    slug: string; postId: string; pinned: boolean; canModerate: boolean; isAuthor: boolean;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    if (!canModerate && !isAuthor) return null;

    const call = async (method: 'PATCH' | 'DELETE', body?: object) => {
        setBusy(true); setError('');
        const res = await fetch(`/api/madleague/clubs/${slug}/room/posts/${postId}`, {
            method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
        }).catch(() => null);
        setBusy(false);
        if (!res?.ok) { setError('처리하지 못했습니다. 잠시 후 다시 시도해주세요.'); return; }
        if (method === 'DELETE') router.replace(`/madleague/clubs/${slug}/room`);
        router.refresh();
    };

    return (
        <div className="ml-auto flex items-center gap-2">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {canModerate && (
                <button type="button" onClick={() => call('PATCH', { pinned: !pinned })} disabled={busy}
                    className="inline-flex items-center gap-1 border border-neutral-700 hover:border-white px-3 py-1.5 text-xs transition">
                    <Pin className="h-3.5 w-3.5" /> {pinned ? '고정 해제' : '상단 고정'}
                </button>
            )}
            <button type="button" disabled={busy}
                onClick={() => { if (confirm('이 글을 삭제할까요? 댓글도 함께 지워집니다.')) call('DELETE'); }}
                className="inline-flex items-center gap-1 border border-neutral-700 hover:border-[#EC1D25] hover:text-[#EC1D25] px-3 py-1.5 text-xs transition">
                <Trash2 className="h-3.5 w-3.5" /> 삭제
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
    );
}
