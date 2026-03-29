'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Plus, Search, Clock, User, ChevronRight, X, File, FileSpreadsheet, Presentation } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type DocType = 'doc' | 'sheet' | 'slide' | 'pdf';
type Folder = 'all' | 'company' | 'dept' | 'personal';
type Doc = {
  id: string; title: string; author: string; updatedAt: string; type: DocType;
  folder: Folder; size: string; versions: number;
};

const MOCK_DOCS: Doc[] = [
  { id: 'd1', title: '2026년 사업계획서', author: '김대표', updatedAt: '2026-03-28', type: 'doc', folder: 'company', size: '2.4MB', versions: 5 },
  { id: 'd2', title: 'WIO 기술 아키텍처 문서', author: '박개발', updatedAt: '2026-03-27', type: 'doc', folder: 'dept', size: '1.8MB', versions: 12 },
  { id: 'd3', title: '월간 매출 리포트 (3월)', author: '한재무', updatedAt: '2026-03-26', type: 'sheet', folder: 'company', size: '890KB', versions: 3 },
  { id: 'd4', title: 'SmarComm 브랜드 가이드', author: '정디자인', updatedAt: '2026-03-25', type: 'slide', folder: 'dept', size: '15.2MB', versions: 7 },
  { id: 'd5', title: '신규 입사자 온보딩 매뉴얼', author: '최인사', updatedAt: '2026-03-24', type: 'doc', folder: 'company', size: '3.1MB', versions: 4 },
  { id: 'd6', title: '개인 업무 노트', author: '나', updatedAt: '2026-03-29', type: 'doc', folder: 'personal', size: '120KB', versions: 1 },
  { id: 'd7', title: 'MAD League 프로젝트 제안서', author: '윤기획', updatedAt: '2026-03-23', type: 'slide', folder: 'dept', size: '8.5MB', versions: 2 },
  { id: 'd8', title: '보안 정책 가이드라인', author: '시스템', updatedAt: '2026-03-20', type: 'pdf', folder: 'company', size: '540KB', versions: 1 },
];

const DOC_ICONS: Record<DocType, typeof FileText> = { doc: FileText, sheet: FileSpreadsheet, slide: Presentation, pdf: File };
const DOC_COLORS: Record<DocType, string> = { doc: 'text-blue-400', sheet: 'text-emerald-400', slide: 'text-amber-400', pdf: 'text-rose-400' };

export default function DocumentPage() {
  const { tenant } = useWIO();
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [folder, setFolder] = useState<Folder>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Folder>('personal');
  const [newBody, setNewBody] = useState('');

  const [loading, setLoading] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // Supabase에서 문서 로드
  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sb = createClient();
        const { data, error } = await sb
          .from('documents')
          .select('*')
          .eq('tenant_id', tenant!.id)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        if (!cancelled && data && data.length > 0) {
          setDocs(data.map((row: any): Doc => ({
            id: row.id,
            title: row.title || '',
            author: row.author_name || row.author_id || '',
            updatedAt: row.updated_at ? row.updated_at.split('T')[0] : '',
            type: row.type || 'doc',
            folder: row.folder || 'personal',
            size: row.size || '0KB',
            versions: row.versions ?? 1,
          })));
        }
        // 데이터 없으면 Mock 폴백 (초기값 유지)
      } catch {
        // 에러 시 Mock 폴백 (초기값 유지)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isDemo, tenant]);

  const FOLDERS: { id: Folder; label: string; icon: typeof FolderOpen }[] = [
    { id: 'all', label: '전체', icon: FolderOpen },
    { id: 'company', label: '전사', icon: FolderOpen },
    { id: 'dept', label: '부서', icon: FolderOpen },
    { id: 'personal', label: '개인', icon: FolderOpen },
  ];

  const filtered = docs
    .filter(d => folder === 'all' || d.folder === folder)
    .filter(d => !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.author.toLowerCase().includes(searchQuery.toLowerCase()));

  const detail = docs.find(d => d.id === selectedDoc);

  const handleCreate = () => {
    if (!newTitle) return;
    const doc: Doc = {
      id: `d${Date.now()}`, title: newTitle, author: '나', updatedAt: '2026-03-29',
      type: 'doc', folder: newCategory, size: '0KB', versions: 1,
    };
    setDocs(prev => [doc, ...prev]);
    setNewTitle(''); setNewBody(''); setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">문서관리</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            <Plus size={15} /> 새 문서
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="문서 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {FOLDERS.map(f => (
            <button key={f.id} onClick={() => setFolder(f.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${folder === f.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="문서 제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value as Folder)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="company" className="bg-[#0F0F23]">전사</option>
            <option value="dept" className="bg-[#0F0F23]">부서</option>
            <option value="personal" className="bg-[#0F0F23]">개인</option>
          </select>
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={5} placeholder="내용을 입력하세요..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleCreate} disabled={!newTitle}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">생성</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${selectedDoc ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">제목</div>
              <div className="col-span-2">작성자</div>
              <div className="col-span-2">수정일</div>
              <div className="col-span-1">유형</div>
              <div className="col-span-1">크기</div>
              <div className="col-span-1">버전</div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">문서가 없습니다</div>
            ) : filtered.map(d => {
              const Icon = DOC_ICONS[d.type];
              return (
                <button key={d.id} onClick={() => setSelectedDoc(d.id === selectedDoc ? null : d.id)}
                  className={`w-full text-left grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/[0.04] ${selectedDoc === d.id ? 'bg-indigo-600/5' : ''}`}>
                  <div className="col-span-5 flex items-center gap-2">
                    <Icon size={14} className={DOC_COLORS[d.type]} />
                    <span className="text-sm truncate">{d.title}</span>
                  </div>
                  <div className="col-span-2 text-xs text-slate-400 flex items-center">{d.author}</div>
                  <div className="col-span-2 text-xs text-slate-500 flex items-center">{d.updatedAt.slice(5)}</div>
                  <div className="col-span-1 text-xs text-slate-500 flex items-center uppercase">{d.type}</div>
                  <div className="col-span-1 text-xs text-slate-600 flex items-center">{d.size}</div>
                  <div className="col-span-1 text-xs text-slate-600 flex items-center">v{d.versions}</div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDoc && detail && (
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">문서 정보</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-500 hover:text-white"><X size={14} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-slate-500 text-xs">제목</span><div className="mt-0.5">{detail.title}</div></div>
              <div><span className="text-slate-500 text-xs">작성자</span><div className="mt-0.5">{detail.author}</div></div>
              <div><span className="text-slate-500 text-xs">최종 수정</span><div className="mt-0.5">{detail.updatedAt}</div></div>
              <div><span className="text-slate-500 text-xs">유형</span><div className="mt-0.5 uppercase">{detail.type}</div></div>
              <div><span className="text-slate-500 text-xs">크기</span><div className="mt-0.5">{detail.size}</div></div>
              <div>
                <span className="text-slate-500 text-xs">버전 이력</span>
                <div className="mt-1 space-y-1">
                  {Array.from({ length: Math.min(detail.versions, 5) }, (_, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={10} /> v{detail.versions - i} <span className="text-slate-600">{detail.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
