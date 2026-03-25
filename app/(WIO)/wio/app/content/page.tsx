'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Globe, Eye, EyeOff } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchContents, createContent, publishContent } from '@/lib/supabase/wio';

export default function ContentPage() {
  const { tenant, member } = useWIO();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('blog');

  useEffect(() => {
    if (!tenant) return;
    fetchContents(tenant.id).then(c => { setContents(c); setLoading(false); });
  }, [tenant]);

  const handleCreate = async () => {
    if (!tenant || !member || !title.trim()) return;
    await createContent({ tenantId: tenant.id, title: title.trim(), body: body.trim(), channel, authorId: member.id });
    setTitle(''); setBody(''); setShowForm(false);
    fetchContents(tenant.id).then(setContents);
  };

  const handlePublish = async (id: string) => {
    await publishContent(id);
    fetchContents(tenant!.id).then(setContents);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">콘텐츠</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 새 콘텐츠
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="flex gap-3">
            <select value={channel} onChange={e => setChannel(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
              <option value="blog">블로그</option><option value="works">Works</option><option value="newsroom">Newsroom</option>
            </select>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="내용" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleCreate} disabled={!title.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">저장 (초안)</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : contents.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><FileText size={32} className="mx-auto mb-2 text-slate-600" /><p>콘텐츠가 없습니다</p></div>
      ) : (
        <div className="space-y-2">
          {contents.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.title}</span>
                  <span className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded bg-white/5">{c.channel}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{c.author?.displayName} · {new Date(c.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
              {c.status === 'published' ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400"><Globe size={12} />발행됨</span>
              ) : (
                <button onClick={() => handlePublish(c.id)} className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"><Eye size={12} />발행</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
