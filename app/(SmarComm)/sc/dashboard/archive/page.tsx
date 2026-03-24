'use client';

import { useState } from 'react';
import { Search, Image, Type, Video, Filter, Download, Eye, Trash2, Plus } from 'lucide-react';
import { MOCK_CREATIVES } from '@/lib/smarcomm/dashboard-data';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

const TYPE_ICON = { text: Type, banner: Image, video: Video };
const TYPE_LABEL = { text: '텍스트', banner: '이미지', video: '영상' };

export default function ArchivePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'banner' | 'video'>('all');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const filtered = MOCK_CREATIVES.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.channel.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">소재 아카이브</h1>
          <p className="mt-1 text-xs text-text-muted">제작한 소재를 저장하고 관리하세요</p>
        </div>
        <button onClick={() => window.location.href = '/sc/dashboard/creative'} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 새 소재
        </button>
      </div>

      {/* 검색 + 필터 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="소재 검색"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'text', 'banner', 'video'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-full px-3 py-2 text-xs font-medium ${typeFilter === t ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
              {t === 'all' ? '전체' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* 소재 목록 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <Image size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-sub">소재가 없습니다</p>
          <p className="text-xs text-text-muted">소재 제작에서 새 소재를 만들어보세요</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-3 text-left font-medium">소재</th>
                <th className="px-5 py-3 text-left font-medium">유형</th>
                <th className="px-5 py-3 text-left font-medium">채널</th>
                <th className="px-5 py-3 text-center font-medium">상태</th>
                <th className="px-5 py-3 text-right font-medium">생성일</th>
                <th className="px-5 py-3 text-center font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const Icon = TYPE_ICON[c.type];
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
                          <Icon size={16} className="text-text-sub" />
                        </div>
                        <span className="font-medium text-text">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-sub">{TYPE_LABEL[c.type]}</td>
                    <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium ${c.status === 'active' ? 'text-success' : 'text-text-muted'}`}>
                        {c.status === 'active' ? '● 사용 중' : c.status === 'draft' ? '● 초안' : '● 보관'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted">{c.createdAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface" title="미리보기" aria-label="미리보기"><Eye size={13} /></button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface" title="다운로드" aria-label="다운로드"><Download size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NextStepCTA stage="제작 → 실행" title="보관된 소재를 캠페인에 활용" description="승인된 소재를 선택하여 광고 캠페인을 생성하세요" actionLabel="캠페인 생성" href="/sc/dashboard/campaigns" />
    </div>
  );
}
