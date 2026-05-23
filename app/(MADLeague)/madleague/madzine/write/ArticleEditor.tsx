'use client';

import { useState } from 'react';
import { Save, Send, X, Plus, Loader2 } from 'lucide-react';

const inputCls = 'w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white outline-none transition focus:border-[#EC1D25]';

const CATEGORIES = [
  { slug: 'interview', label: '인터뷰' },
  { slug: 'case',      label: '케이스' },
  { slug: 'report',    label: '리포트' },
  { slug: 'cover',     label: '커버' },
  { slug: 'news',      label: '동아리 소식' },
];

interface Props {
  initial?: {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    category: string;
    thumbnail_url: string | null;
    tags: string[] | null;
  };
}

export function ArticleEditor({ initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'interview');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState<'draft' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const t = newTag.trim();
    if (!t || tags.includes(t) || tags.length >= 10) return;
    setTags([...tags, t]);
    setNewTag('');
  }

  async function save(action: 'draft' | 'submit') {
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문은 필수입니다.');
      return;
    }
    setSubmitting(action);
    setError(null);
    try {
      const url = initial?.id ? `/api/madleague/articles/${initial.id}` : '/api/madleague/articles';
      const method = initial?.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, content, category, thumbnail_url: thumbnailUrl, tags, action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'UNKNOWN');
      }
      window.location.href = action === 'submit' ? '/madleague/madzine/write?submitted=1' : '/madleague/madzine/write?saved=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <Field label="카테고리">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </Field>

      <Field label="제목 *">
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="독자의 시선을 끄는 제목" className={`${inputCls} text-xl font-bold`} />
        <div className="text-xs text-neutral-500 text-right mt-1">{title.length} / 200</div>
      </Field>

      <Field label="부제 (선택)">
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={300} placeholder="한 문장으로 요약" className={inputCls} />
      </Field>

      <Field label="썸네일 이미지 URL (선택)">
        <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} type="url" placeholder="https://..." className={inputCls} />
      </Field>

      <Field label="본문 *">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} maxLength={50000}
          placeholder="마크다운 또는 일반 텍스트. 엔터는 줄바꿈으로 렌더됩니다." className={`${inputCls} resize-y leading-relaxed font-mono text-sm`} />
        <div className="text-xs text-neutral-500 text-right mt-1">{content.length.toLocaleString()} / 50,000</div>
      </Field>

      <Field label={`태그 (${tags.length}/10)`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-white">
              #{tag}
              <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-neutral-500 hover:text-red-400">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="예: 경쟁PT, 수상, MADLeap" maxLength={30} className={`${inputCls} flex-1`} />
          <button type="button" onClick={addTag} className="bg-neutral-900 border border-neutral-800 text-white px-4 inline-flex items-center">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Field>

      {error && <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">{error}</div>}

      <div className="flex items-center gap-3 pt-4 border-t border-neutral-900">
        <button type="button" onClick={() => save('draft')} disabled={!!submitting}
          className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white text-white font-bold px-6 py-3 disabled:opacity-50">
          {submitting === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          초안 저장
        </button>
        <button type="button" onClick={() => save('submit')} disabled={!!submitting}
          className="ml-auto inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold px-8 py-3">
          {submitting === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          검토 제출
        </button>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-bold tracking-wider text-neutral-400 mb-2">{label}</div>
      {children}
    </label>
  );
}
