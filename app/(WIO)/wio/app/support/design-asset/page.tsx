'use client';

import { useState } from 'react';
import { Image, Search, Grid3X3, List, Download, Tag } from 'lucide-react';
import { useWIO } from '../../layout';

const CATEGORIES = ['전체', '로고', '템플릿', '가이드라인', '아이콘', '사진', '일러스트'];

const MOCK_ASSETS = [
  { id: 'A01', name: 'TenOne 로고 (메인)', category: '로고', type: 'SVG', size: '24KB', brand: 'TenOne', tags: ['로고', '메인', '가로형'], updatedAt: '2026-03-15', downloadCount: 145, color: 'bg-indigo-500/20' },
  { id: 'A02', name: 'MAD League 엠블럼', category: '로고', type: 'PNG', size: '186KB', brand: 'MAD League', tags: ['로고', '엠블럼'], updatedAt: '2026-03-10', downloadCount: 89, color: 'bg-violet-500/20' },
  { id: 'A03', name: '프레젠테이션 템플릿 (다크)', category: '템플릿', type: 'PPTX', size: '4.2MB', brand: 'TenOne', tags: ['발표', '다크테마'], updatedAt: '2026-03-20', downloadCount: 234, color: 'bg-slate-500/20' },
  { id: 'A04', name: '브랜드 가이드라인 v2', category: '가이드라인', type: 'PDF', size: '12MB', brand: 'TenOne', tags: ['가이드라인', '색상', '타이포'], updatedAt: '2026-02-28', downloadCount: 67, color: 'bg-amber-500/20' },
  { id: 'A05', name: 'SNS 배너 템플릿', category: '템플릿', type: 'PSD', size: '8.5MB', brand: 'SmarComm', tags: ['SNS', '배너', '인스타그램'], updatedAt: '2026-03-22', downloadCount: 156, color: 'bg-pink-500/20' },
  { id: 'A06', name: 'UI 아이콘 세트 (120개)', category: '아이콘', type: 'SVG', size: '340KB', brand: 'Orbi', tags: ['아이콘', 'UI', '라인'], updatedAt: '2026-03-18', downloadCount: 312, color: 'bg-cyan-500/20' },
  { id: 'A07', name: '팀 단체사진 (2026 Q1)', category: '사진', type: 'JPG', size: '5.8MB', brand: 'TenOne', tags: ['팀', '단체', '사진'], updatedAt: '2026-03-01', downloadCount: 28, color: 'bg-emerald-500/20' },
  { id: 'A08', name: 'Badak 캐릭터 일러스트', category: '일러스트', type: 'AI', size: '2.1MB', brand: 'Badak', tags: ['캐릭터', '마스코트'], updatedAt: '2026-03-25', downloadCount: 45, color: 'bg-orange-500/20' },
];

export default function DesignAssetPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = MOCK_ASSETS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search));
    const matchCat = category === '전체' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">디자인자산</h1>
        <p className="text-xs text-slate-500 mt-0.5">DSG-AST &middot; 로고, 템플릿, 가이드라인</p>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="자산 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10' : 'text-slate-500'}`}><Grid3X3 size={14} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10' : 'text-slate-500'}`}><List size={14} /></button>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap ${category === c ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
            {c}
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(a => (
            <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all group">
              <div className={`h-28 ${a.color} flex items-center justify-center`}>
                <Image size={28} className="text-white/30" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate">{a.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500">{a.type}</span>
                  <span className="text-[10px] text-slate-600">{a.size}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-600">{a.brand}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={12} className="text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className={`h-10 w-10 rounded-lg ${a.color} flex items-center justify-center shrink-0`}>
                <Image size={16} className="text-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{a.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{a.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{a.type} &middot; {a.size}</span>
                  <span className="text-[10px] text-slate-600">{a.brand}</span>
                  <div className="flex gap-1">
                    {a.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-slate-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-500">{a.downloadCount} DL</p>
                <p className="text-[10px] text-slate-600">{a.updatedAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
