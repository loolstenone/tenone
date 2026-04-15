'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
}

interface Props {
  postId: string;
  initialComments: Comment[];
  currentMemberId: string;
}

export function CommentSection({ postId, initialComments, currentMemberId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/madleague/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert('댓글 등록 실패: ' + (d.error ?? 'UNKNOWN'));
        return;
      }
      const data = await res.json();
      setComments(prev => [...prev, {
        id: data.comment.id,
        content: data.comment.content,
        created_at: data.comment.created_at,
        author_id: currentMemberId,
        author_name: '나',
      }]);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-6">댓글 {comments.length}</h2>

      <form onSubmit={submit} className="mb-8 flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="댓글을 입력하세요"
          rows={2}
          maxLength={2000}
          className="flex-1 bg-black border border-neutral-800 px-3 py-2 text-white resize-none focus:border-[#EC1D25] focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className="bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold px-4 inline-flex items-center gap-1"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-4">
        {comments.map(c => (
          <div key={c.id} className="border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span className="font-bold text-neutral-300">{c.author_name}</span>
              <span>·</span>
              <span>{new Date(c.created_at).toLocaleString('ko-KR')}</span>
            </div>
            <div className="text-sm text-neutral-200 whitespace-pre-wrap">{c.content}</div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-neutral-500">첫 댓글을 남겨보세요.</div>
        )}
      </div>
    </div>
  );
}
