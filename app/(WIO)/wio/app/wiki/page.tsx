'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, Search, Archive } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchDocuments, createDocument } from '@/lib/supabase/wio';

const CATEGORIES = ['general', 'culture', 'handbook', 'project_archive', 'vrief', 'gpr_review'];
const CAT_LABELS: Record<string, string> = {
  general: '일반', culture: '문화', handbook: '핸드북',
  project_archive: '프로젝트 아카이브', vrief: 'Vrief 리서치', gpr_review: 'GPR 회고',
};

export default function WikiPage() {
  const { tenant, member } = useWIO();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cat, setCat] = useState('general');

  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    fetchDocuments(tenant.id, category || undefined).then(d => { setDocs(d); setLoading(false); });
  }, [tenant, category]);

  const filtered = search ? docs.filter((d: any) => d.title?.toLowerCase().includes(search.toLowerCase())) : docs;

  const handleCreate = async () => {
    if (!tenant || !member || !title.trim()) return;
    await createDocument({ tenantId: tenant.id, title: title.trim(), body: body.trim(), category: cat, authorId: member.id });
    setTitle(''); setBody(''); setShowForm(false);
    fetchDocuments(tenant.id, category || undefined).then(setDocs);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">위키</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 새 문서
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="문서 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
          <option value="">전체</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="flex gap-3">
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="문서 제목"
              className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="내용"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleCreate} disabled={!title.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">저장</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><Library size={32} className="mx-auto mb-2 text-slate-600" /><p>문서가 없습니다</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d: any) => (
            <div key={d.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.title}</span>
                  <span className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded bg-white/5">{CAT_LABELS[d.category] || d.category}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{d.author?.displayName} · {new Date(d.updatedAt).toLocaleDateString('ko-KR')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
