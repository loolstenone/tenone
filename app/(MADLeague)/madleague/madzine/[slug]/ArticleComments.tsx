'use client';

import { useEffect, useState, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  mad_members: { name: string; avatar_url: string | null } | null;
}

export function ArticleComments({ articleId, canComment }: { articleId: string; canComment: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/madleague/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/madleague/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert('댓글 등록 실패: ' + (d.error ?? 'UNKNOWN'));
        return;
      }
      setValue('');
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="comments">
      {canComment ? (
        <form onSubmit={submit} className="mb-8 flex gap-2">
          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} maxLength={2000}
            placeholder="의견을 남겨주세요" className="flex-1 bg-white border border-neutral-300 px-4 py-3 text-neutral-900 resize-none focus:border-[#EC1D25] focus:outline-none" />
          <button type="submit" disabled={submitting || !value.trim()}
            className="bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-300 text-white font-bold px-5 inline-flex items-center">
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div className="mb-8 bg-neutral-50 border border-neutral-200 p-4 text-sm text-neutral-500 text-center">
          댓글은 매드리거만 작성할 수 있습니다.
          <a href="/login?redirect=/madleague/madzine" className="ml-2 text-[#EC1D25] font-bold hover:underline">로그인</a>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-sm text-neutral-400">아직 댓글이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="border-b border-neutral-200 pb-4 last:border-0">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                <span className="font-bold text-neutral-700">{c.mad_members?.name ?? '익명'}</span>
                <span>·</span>
                <span>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
