'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Users } from 'lucide-react';
import { JOB_FUNCTIONS, INDUSTRIES, JOB_LEVELS, LOOKING_FOR_TAGS, CAN_OFFER_TAGS } from '@/lib/badak-constants';
import { fetchBadakProfiles } from '@/lib/supabase/badak';
import ProfileCard from '@/components/badak/ProfileCard';
import type { BadakProfile } from '@/types/badak';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-56px)] items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<BadakProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // 필터 상태 (URL 파라미터에서 초기화)
  const [jobFunction, setJobFunction] = useState(searchParams.get('job') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [jobLevel, setJobLevel] = useState(searchParams.get('level') || '');
  const [lookingFor, setLookingFor] = useState(searchParams.get('looking') || '');
  const [canOffer, setCanOffer] = useState(searchParams.get('offer') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const LIMIT = 12;

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const result = await fetchBadakProfiles({
      jobFunction: jobFunction || undefined,
      industry: industry || undefined,
      jobLevel: jobLevel || undefined,
      lookingFor: lookingFor || undefined,
      canOffer: canOffer || undefined,
      search: search || undefined,
      page,
      limit: LIMIT,
    });
    setProfiles(result.profiles);
    setTotal(result.total);
    setLoading(false);
  }, [jobFunction, industry, jobLevel, lookingFor, canOffer, search, page]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (jobFunction) params.set('job', jobFunction);
    if (industry) params.set('industry', industry);
    if (jobLevel) params.set('level', jobLevel);
    if (lookingFor) params.set('looking', lookingFor);
    if (canOffer) params.set('offer', canOffer);
    if (search) params.set('q', search);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(`/badak/explore${qs ? '?' + qs : ''}`, { scroll: false });
  }, [jobFunction, industry, jobLevel, lookingFor, canOffer, search, page, router]);

  const clearFilters = () => {
    setJobFunction(''); setIndustry(''); setJobLevel('');
    setLookingFor(''); setCanOffer(''); setSearch(''); setPage(1);
  };

  const hasFilters = jobFunction || industry || jobLevel || lookingFor || canOffer || search;
  const totalPages = Math.ceil(total / LIMIT);

  const FilterChip = ({ label, value, onClear }: { label: string; value: string; onClear: () => void }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
      {label}: {value}
      <button onClick={onClear} className="ml-0.5 hover:text-blue-900"><X size={12} /></button>
    </span>
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">바닥 탐색</h1>
          <p className="text-sm text-neutral-500 mt-1">같은 바닥에서 성장할 사람을 찾아보세요</p>
        </div>

        {/* 검색 + 필터 토글 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="이름 또는 소개로 검색..."
              className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm transition-colors ${showFilters ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-neutral-200 text-neutral-600 hover:border-blue-300'}`}>
            <SlidersHorizontal size={15} /> 필터 {hasFilters ? `(${[jobFunction, industry, jobLevel, lookingFor, canOffer].filter(Boolean).length})` : ''}
          </button>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">직무</label>
                <select value={jobFunction} onChange={e => { setJobFunction(e.target.value); setPage(1); }}
                  className="w-full rounded border border-neutral-200 px-2.5 py-2 text-sm focus:border-blue-600 focus:outline-none">
                  <option value="">전체</option>
                  {JOB_FUNCTIONS.map(jf => <option key={jf} value={jf}>{jf}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">산업</label>
                <select value={industry} onChange={e => { setIndustry(e.target.value); setPage(1); }}
                  className="w-full rounded border border-neutral-200 px-2.5 py-2 text-sm focus:border-blue-600 focus:outline-none">
                  <option value="">전체</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">직급</label>
                <select value={jobLevel} onChange={e => { setJobLevel(e.target.value); setPage(1); }}
                  className="w-full rounded border border-neutral-200 px-2.5 py-2 text-sm focus:border-blue-600 focus:outline-none">
                  <option value="">전체</option>
                  {JOB_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">찾는 것</label>
                <select value={lookingFor} onChange={e => { setLookingFor(e.target.value); setPage(1); }}
                  className="w-full rounded border border-neutral-200 px-2.5 py-2 text-sm focus:border-blue-600 focus:outline-none">
                  <option value="">전체</option>
                  {LOOKING_FOR_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">줄 수 있는 것</label>
                <select value={canOffer} onChange={e => { setCanOffer(e.target.value); setPage(1); }}
                  className="w-full rounded border border-neutral-200 px-2.5 py-2 text-sm focus:border-blue-600 focus:outline-none">
                  <option value="">전체</option>
                  {CAN_OFFER_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">필터 초기화</button>
            )}
          </div>
        )}

        {/* 활성 필터 칩 */}
        {hasFilters && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {jobFunction && <FilterChip label="직무" value={jobFunction} onClear={() => setJobFunction('')} />}
            {industry && <FilterChip label="산업" value={industry} onClear={() => setIndustry('')} />}
            {jobLevel && <FilterChip label="직급" value={jobLevel} onClear={() => setJobLevel('')} />}
            {lookingFor && <FilterChip label="찾는 것" value={lookingFor} onClear={() => setLookingFor('')} />}
            {canOffer && <FilterChip label="줄 수 있는 것" value={canOffer} onClear={() => setCanOffer('')} />}
          </div>
        )}

        {/* 결과 수 */}
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
          <Users size={14} />
          <span>{total}명의 바닥 사람들</span>
        </div>

        {/* 프로필 그리드 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-neutral-500">조건에 맞는 사람이 아직 없습니다</p>
            <p className="text-sm text-neutral-400 mt-1">필터를 조정하거나 나중에 다시 확인해보세요</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map(p => <ProfileCard key={p.id} profile={p} />)}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-blue-300'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
