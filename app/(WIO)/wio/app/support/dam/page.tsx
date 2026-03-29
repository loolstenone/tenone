'use client';

import { useState } from 'react';
import { Film, Search, Grid3X3, List, Download, Image, FileText, Music, Video, Shield } from 'lucide-react';
import { useWIO } from '../../layout';

const FILE_TYPES: Record<string, { icon: any; color: string }> = {
  image: { icon: Image, color: 'bg-pink-500/20 text-pink-400' },
  video: { icon: Video, color: 'bg-violet-500/20 text-violet-400' },
  document: { icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  audio: { icon: Music, color: 'bg-emerald-500/20 text-emerald-400' },
};

const LICENSE_MAP: Record<string, { label: string; color: string }> = {
  owned: { label: '자체 보유', color: 'text-emerald-400 bg-emerald-500/10' },
  licensed: { label: '라이선스', color: 'text-blue-400 bg-blue-500/10' },
  cc: { label: 'CC', color: 'text-amber-400 bg-amber-500/10' },
  expiring: { label: '만료 임박', color: 'text-red-400 bg-red-500/10' },
};

const MOCK_ASSETS = [
  { id: 'DAM-001', name: 'TenOne 브랜드 필름 (60s)', type: 'video', format: 'MP4', size: '245MB', brand: 'TenOne', tags: ['브랜드', '홍보영상'], license: 'owned', licenseExpiry: null, downloads: 89, createdAt: '2026-02-15' },
  { id: 'DAM-002', name: 'MAD League 시즌3 포스터', type: 'image', format: 'PSD/PNG', size: '42MB', brand: 'MAD League', tags: ['포스터', '시즌3'], license: 'owned', licenseExpiry: null, downloads: 156, createdAt: '2026-03-20' },
  { id: 'DAM-003', name: '제품 촬영 세트 (IoT 게이트웨이)', type: 'image', format: 'RAW/JPG', size: '1.2GB', brand: 'TenOne', tags: ['제품', '촬영', 'IoT'], license: 'owned', licenseExpiry: null, downloads: 34, createdAt: '2026-03-10' },
  { id: 'DAM-004', name: 'BGM 라이브러리 - 기업 프레젠테이션', type: 'audio', format: 'WAV', size: '180MB', brand: '공통', tags: ['BGM', '프레젠테이션'], license: 'licensed', licenseExpiry: '2027-03-31', downloads: 67, createdAt: '2025-04-01' },
  { id: 'DAM-005', name: '웹사이트 히어로 이미지 세트', type: 'image', format: 'WebP/PNG', size: '85MB', brand: 'Orbi', tags: ['웹', '히어로', 'UI'], license: 'owned', licenseExpiry: null, downloads: 223, createdAt: '2026-03-18' },
  { id: 'DAM-006', name: '인포그래픽 템플릿 (5종)', type: 'document', format: 'AI/PDF', size: '35MB', brand: 'SmarComm', tags: ['인포그래픽', '템플릿'], license: 'owned', licenseExpiry: null, downloads: 98, createdAt: '2026-02-28' },
  { id: 'DAM-007', name: 'SNS 캠페인 소재 (3월)', type: 'image', format: 'PSD/PNG', size: '120MB', brand: 'SmarComm', tags: ['SNS', '캠페인', '3월'], license: 'owned', licenseExpiry: null, downloads: 45, createdAt: '2026-03-01' },
  { id: 'DAM-008', name: '스톡 이미지 패키지 (100장)', type: 'image', format: 'JPG', size: '850MB', brand: '공통', tags: ['스톡', '이미지'], license: 'licensed', licenseExpiry: '2026-06-30', downloads: 312, createdAt: '2025-07-01' },
  { id: 'DAM-009', name: 'Badak 캐릭터 모션', type: 'video', format: 'MOV/GIF', size: '65MB', brand: 'Badak', tags: ['캐릭터', '모션', '애니메이션'], license: 'owned', licenseExpiry: null, downloads: 78, createdAt: '2026-03-25' },
  { id: 'DAM-010', name: '기업 소개서 (국/영)', type: 'document', format: 'PDF', size: '28MB', brand: 'TenOne', tags: ['소개서', '국문', '영문'], license: 'owned', licenseExpiry: null, downloads: 189, createdAt: '2026-03-15' },
  { id: 'DAM-011', name: '팟캐스트 인트로/아웃트로', type: 'audio', format: 'MP3', size: '12MB', brand: '공통', tags: ['팟캐스트', '인트로'], license: 'cc', licenseExpiry: null, downloads: 23, createdAt: '2026-01-10' },
  { id: 'DAM-012', name: 'Shutterstock 연간 라이선스 소재', type: 'image', format: 'JPG', size: '2.1GB', brand: '공통', tags: ['스톡', 'Shutterstock'], license: 'expiring', licenseExpiry: '2026-04-15', downloads: 456, createdAt: '2025-04-15' },
];

const TYPE_FILTERS = ['전체', 'image', 'video', 'document', 'audio'];

export default function DAMPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = MOCK_ASSETS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search));
    const matchType = typeFilter === '전체' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const expiringCount = MOCK_ASSETS.filter(a => a.license === 'expiring').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">디지털자산관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">CNT-DAM &middot; 미디어, 브랜드 자산, 라이선스</p>
        </div>
        {expiringCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-400"><Shield size={12} />라이선스 만료 임박 {expiringCount}건</span>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">전체 자산</p>
          <p className="text-2xl font-bold mt-1">{MOCK_ASSETS.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">이미지</p>
          <p className="text-2xl font-bold mt-1 text-pink-400">{MOCK_ASSETS.filter(a => a.type === 'image').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">영상</p>
          <p className="text-2xl font-bold mt-1 text-violet-400">{MOCK_ASSETS.filter(a => a.type === 'video').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">총 다운로드</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{MOCK_ASSETS.reduce((a, m) => a + m.downloads, 0).toLocaleString()}</p>
        </div>
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

      <div className="flex gap-1 mb-4">
        {TYPE_FILTERS.map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`text-[10px] px-2.5 py-1 rounded-full ${typeFilter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
            {f === '전체' ? '전체' : f === 'image' ? '이미지' : f === 'video' ? '영상' : f === 'document' ? '문서' : '오디오'}
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(a => {
            const ft = FILE_TYPES[a.type];
            const lc = LICENSE_MAP[a.license];
            const Icon = ft.icon;
            return (
              <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all group">
                <div className={`h-24 ${ft.color.split(' ')[0]} flex items-center justify-center`}>
                  <Icon size={24} className={ft.color.split(' ')[1]} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate mb-1">{a.name}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] text-slate-500">{a.format}</span>
                    <span className="text-[9px] text-slate-600">{a.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${lc.color}`}>{lc.label}</span>
                    <span className="text-[9px] text-slate-600">{a.downloads} DL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const ft = FILE_TYPES[a.type];
            const lc = LICENSE_MAP[a.license];
            const Icon = ft.icon;
            return (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className={`h-10 w-10 rounded-lg ${ft.color.split(' ')[0]} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={ft.color.split(' ')[1]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{a.name}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${lc.color}`}>{lc.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>{a.format}</span>
                    <span>{a.size}</span>
                    <span>{a.brand}</span>
                    {a.licenseExpiry && <span className={a.license === 'expiring' ? 'text-red-400' : ''}>만료: {a.licenseExpiry}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500">{a.downloads} DL</p>
                  <p className="text-[10px] text-slate-600">{a.createdAt}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
