'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search, Users, TrendingUp, Sparkles,
  Flame, BarChart3, UserPlus, Target,
  Handshake, Crown, ChevronRight, ChevronLeft, Clock,
} from 'lucide-react';
import { CLOUD_WORDS as FALLBACK_WORDS } from '@/lib/badak-cloud-data';
import type { CloudWord } from '@/types/badak';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';

type ExploreTab = 'needs' | 'wants';

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<ExploreTab>('needs');

  // 내 관심사 태그
  const [myTags, setMyTags] = useState<string[]>([]);
  const [myTagsLoading, setMyTagsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setMyTags([]); return; }
    (async () => {
      setMyTagsLoading(true);
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) return;
        const res = await fetch('/api/badak/members/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        setMyTags(json.member?.interest_tags ?? []);
      } finally {
        setMyTagsLoading(false);
      }
    })();
  }, [isAuthenticated]);

  // 니즈 로드 (API → Mock 폴백)
  const [words, setWords] = useState<CloudWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/badak/needs?limit=200');
        const data = await res.json();
        const fetched = (data.words as CloudWord[]) ?? [];
        setWords(fetched.length > 0 ? fetched : FALLBACK_WORDS);
      } catch {
        setWords(FALLBACK_WORDS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 최신 니즈 전용 fetch (created_at 기준)
  const [latestWords, setLatestWords] = useState<CloudWord[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/badak/needs?sort=created_at&limit=8');
        const data = await res.json();
        setLatestWords((data.words as CloudWord[]) ?? []);
      } catch { /* ignore */ }
    })();
  }, []);

  // 기간 필터 상태
  const [period, setPeriod] = useState<'' | '1w' | '1m' | '3m'>('');
  const [periodWords, setPeriodWords] = useState<CloudWord[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);

  useEffect(() => {
    if (!period) { setPeriodWords([]); return; }
    setPeriodLoading(true);
    (async () => {
      try {
        const days = period === '1w' ? 7 : period === '1m' ? 30 : 90;
        const from = new Date();
        from.setDate(from.getDate() - days);
        const fromStr = from.toISOString().split('T')[0];
        const res = await fetch(`/api/badak/needs?from=${fromStr}&sort=count&limit=500`);
        const data = await res.json();
        setPeriodWords((data.words as CloudWord[]) ?? []);
      } catch { /* ignore */ } finally {
        setPeriodLoading(false);
      }
    })();
  }, [period]);

  // 통계
  const totalNeeds = words.length;
  const withGroup = words.filter((w) => w.hasGroup).length;
  const totalMembers = words.reduce((sum, w) => sum + w.members, 0);

  // 써머리용 슬라이스
  const hotNeeds = [...words].sort((a, b) => b.members - a.members).slice(0, 8);
  const latestNeeds = latestWords.length > 0 ? latestWords.slice(0, 8) : [];
  const groupedNeeds = words.filter((w) => w.hasGroup).slice(0, 8);

  // 유사 관심사 매칭
  const matchedNeeds = myTags.length === 0 ? [] : words.filter((w) => {
    const text = w.text.toLowerCase();
    return myTags.some((tag) =>
      text.includes(tag.toLowerCase()) || tag.toLowerCase().includes(text)
    );
  });
  const matchedTexts = new Set(matchedNeeds.map((w) => w.text));

  // 원츠 탭 필터링
  const toggleFilter = (id: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // 원츠 탭: 기간 필터 활성 시 periodWords 사용
  const sourceWords = period ? periodWords : words;

  const filtered = sourceWords
    .filter((w) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return w.text.toLowerCase().includes(q) || w.group?.title.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((w) => {
      if (filters.size === 0) return true;
      if (filters.has('withGroup') && w.hasGroup) return true;
      if (filters.has('noGroup') && !w.hasGroup) return true;
      if (filters.has('hot') && w.members >= 10) return true;
      if (filters.has('similar') && matchedTexts.has(w.text)) return true;
      return false;
    })
    .sort((a, b) => {
      // 유사 관심사 필터 활성 시 매칭된 것 우선
      if (filters.has('similar')) {
        const aM = matchedTexts.has(a.text) ? 1 : 0;
        const bM = matchedTexts.has(b.text) ? 1 : 0;
        if (aM !== bM) return bM - aM;
      }
      return b.members - a.members;
    });

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl py-6">
        {/* 헤더 */}
        <div className="mb-5 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">니즈 탐색</h1>
          </div>
          <p className="mt-1 text-sm text-white/50">니즈와 니즈가 만나 원츠(Wants)가 된다</p>
        </div>

        {/* 탭 */}
        <div className="mb-5 flex gap-1 px-4 sm:px-6">
          {([
            { id: 'needs' as const, label: '니즈', icon: Target },
            { id: 'wants' as const, label: '원츠', icon: Handshake },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: tab === id ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
                borderColor: tab === id ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)',
                color: tab === id ? '#ffd93d' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* ===== 니즈 탭 — 써머리 ===== */}
        {tab === 'needs' && (
          <>
            {/* 통계 */}
            <div className="mb-6 flex gap-2 px-4 sm:px-6">
              {[
                { label: '전체 니즈', value: totalNeeds, icon: BarChart3, accent: '#ffd93d' },
                { label: '모임 개설', value: withGroup, icon: Users, accent: '#4ade80' },
                { label: '관심 대기', value: totalNeeds - withGroup, icon: UserPlus, accent: '#60a5fa' },
                { label: '총 관심', value: totalMembers, icon: TrendingUp, accent: '#f472b6' },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="flex flex-1 flex-col items-center rounded-xl border border-white/8 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <Icon className="mb-1 h-4 w-4" style={{ color: accent }} />
                  <div className="text-sm font-bold text-white">{value}</div>
                  <div className="text-[9px] text-white/30">{label}</div>
                </div>
              ))}
            </div>

            {loading && words.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : (
              <>
                {/* Hot 니즈 */}
                <SlideSection
                  title="Hot 니즈"
                  subtitle="관심이 가장 많은 니즈"
                  icon={<Flame className="h-4 w-4 text-orange-400" />}
                  words={hotNeeds}
                  onSelect={setSelectedWord}
                />

                {/* 최신 니즈 */}
                {latestNeeds.length > 0 && (
                  <SlideSection
                    title="최신 니즈"
                    subtitle="새로 올라온 니즈"
                    icon={<Clock className="h-4 w-4 text-blue-400" />}
                    words={latestNeeds}
                    onSelect={setSelectedWord}
                  />
                )}

                {/* 모임 개설됨 */}
                {groupedNeeds.length > 0 && (
                  <SlideSection
                    title="모임 개설됨"
                    subtitle="바닥장이 모임을 열었어요"
                    icon={<Users className="h-4 w-4 text-green-400" />}
                    words={groupedNeeds}
                    onSelect={setSelectedWord}
                  />
                )}

                {/* 내 관심사 매칭 (로그인 + 태그 있을 때) */}
                {isAuthenticated && matchedNeeds.length > 0 && (
                  <SlideSection
                    title="내 관심사 추천"
                    subtitle="내 관심사 태그 기반"
                    icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                    words={matchedNeeds.slice(0, 8)}
                    onSelect={setSelectedWord}
                  />
                )}

                {/* 원츠 탭으로 이동 CTA */}
                <div className="mt-2 px-4 sm:px-6">
                  <button
                    onClick={() => setTab('wants')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
                  >
                    <Search className="h-4 w-4" />
                    전체 니즈 탐색하기
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== 원츠 탭 — 탐색 ===== */}
        {tab === 'wants' && (
          <div className="px-4 sm:px-6">
            {/* 기간 필터 */}
            <div className="mb-3 flex items-center gap-1.5">
              {([
                { id: '' as const, label: '전체' },
                { id: '1w' as const, label: '1주일' },
                { id: '1m' as const, label: '1개월' },
                { id: '3m' as const, label: '3개월' },
              ]).map(({ id, label }) => (
                <button
                  key={label}
                  onClick={() => setPeriod(id)}
                  className="rounded-full px-3 py-1 text-[11px] font-medium transition-all"
                  style={{
                    background: period === id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
                    color: period === id ? '#93c5fd' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${period === id ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {label}
                </button>
              ))}
              {period && periodLoading && (
                <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-blue-400" />
              )}
            </div>

            {/* 검색 */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="어떤 니즈를 찾고 있나요?"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/30"
              />
            </div>

            {/* 내 관심사 매칭 배너 */}
            {isAuthenticated && !myTagsLoading && matchedNeeds.length > 0 && !search && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                <div>
                  <div className="text-[12px] font-semibold text-amber-400">
                    내 관심사와 맞는 니즈 {matchedNeeds.length}개
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-white/40">
                    {myTags.slice(0, 3).join(' · ')}{myTags.length > 3 ? ` 외 ${myTags.length - 3}개` : ''}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFilters((prev) => {
                      const next = new Set(prev);
                      next.has('similar') ? next.delete('similar') : next.add('similar');
                      return next;
                    });
                  }}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: filters.has('similar') ? 'rgba(255,217,61,0.2)' : 'rgba(255,217,61,0.08)',
                    color: '#ffd93d',
                    border: `1px solid ${filters.has('similar') ? 'rgba(255,217,61,0.4)' : 'rgba(255,217,61,0.2)'}`,
                  }}
                >
                  {filters.has('similar') ? '✓ 필터 중' : '보기'}
                </button>
              </div>
            )}

            {/* 비로그인 매칭 안내 */}
            {!isAuthenticated && !search && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="text-[12px] text-white/40">로그인하면 내 관심사 매칭이 보여요</div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/50 transition-colors hover:text-white/70"
                >
                  로그인
                </button>
              </div>
            )}

            {/* 필터 칩 */}
            <div className="mb-4 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {([
                { id: 'withGroup', label: '모임 개설됨' },
                { id: 'noGroup', label: '모임 대기' },
                { id: 'hot', label: '인기 10명+' },
                ...(isAuthenticated && myTags.length > 0 ? [{ id: 'similar', label: '유사 관심사' }] : []),
              ]).map(({ id, label }) => {
                const active = filters.has(id);
                return (
                  <button key={id} onClick={() => toggleFilter(id)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                    style={{
                      background: active ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.05)',
                      color: active ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${active ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {label}
                  </button>
                );
              })}
              {filters.size > 0 && (
                <button
                  onClick={() => setFilters(new Set())}
                  className="ml-auto shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/40 transition-colors hover:text-white/60"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 결과 헤더 */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] text-white/30">
                {search ? `"${search}" 검색 결과` : filters.size > 0 ? '필터 결과' : period ? { '1w': '1주일', '1m': '1개월', '3m': '3개월' }[period] + ' 내 니즈' : '전체 니즈'}
                {' '}
                <span className="font-semibold text-white/50">{filtered.length}</span>
              </span>
            </div>

            {/* 니즈 리스트 */}
            {(loading && words.length === 0) || periodLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-white/15" />
                <p className="mb-1 text-sm font-medium text-white/40">
                  {search ? `"${search}"에 해당하는 니즈가 없어요` : '해당 조건의 니즈가 없어요'}
                </p>
                <p className="mb-5 text-xs text-white/25">다른 키워드나 필터를 써보세요</p>
                {(search || filters.size > 0) && (
                  <button
                    onClick={() => { setSearch(''); setFilters(new Set()); }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold"
                    style={{ background: 'rgba(255,217,61,0.1)', color: '#ffd93d' }}
                  >
                    초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((w) => (
                  <NeedCard
                    key={w.text}
                    word={w}
                    isMatched={matchedTexts.has(w.text)}
                    onClick={() => setSelectedWord(w)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 시트 */}
        <NeedDetailSheet word={selectedWord} onClose={() => setSelectedWord(null)} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    </div>
  );
}

// ── 슬라이드 섹션 ──
function SlideSection({ title, subtitle, icon, words, onSelect }: {
  title: string; subtitle: string; icon: React.ReactNode;
  words: CloudWord[]; onSelect: (w: CloudWord) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-white/25">{subtitle}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={() => scroll('left')} disabled={!canLeft}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 transition-all disabled:opacity-20 hover:enabled:border-white/25 hover:enabled:bg-white/5">
            <ChevronLeft className="h-4 w-4 text-white/60" />
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 transition-all disabled:opacity-20 hover:enabled:border-white/25 hover:enabled:bg-white/5">
            <ChevronRight className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} onScroll={updateButtons}
        className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6">
        {words.map((w) => (
          <NeedSlideCard key={w.text} word={w} onClick={() => onSelect(w)} />
        ))}
      </div>
    </div>
  );
}

// ── 슬라이드 카드 ──
function NeedSlideCard({ word: w, onClick }: { word: CloudWord; onClick: () => void }) {
  const progress = w.hasGroup
    ? Math.min(100, ((w.group?.currentMembers || 0) / (w.group?.maxMembers || 1)) * 100)
    : Math.min(100, (w.members / 15) * 100);

  return (
    <button onClick={onClick}
      className="w-[220px] shrink-0 rounded-xl border p-3.5 text-left transition-all hover:border-white/20 sm:w-[240px]"
      style={{
        background: w.hasGroup ? 'rgba(255,200,87,0.04)' : 'rgba(255,255,255,0.03)',
        borderColor: w.hasGroup ? 'rgba(255,200,87,0.15)' : 'rgba(255,255,255,0.08)',
      }}>
      <div className="mb-2 flex items-center gap-1.5">
        {w.hasGroup ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>모임 개설됨</span>
        ) : w.members >= 15 ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>바닥장 모집중</span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>관심 모집중</span>
        )}
        <span className="text-[10px] text-white/30">{w.members}명</span>
      </div>
      <p className="mb-2.5 line-clamp-2 text-xs font-semibold leading-snug text-white/80">{w.text}</p>
      <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{
          width: `${progress}%`,
          background: w.hasGroup
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
        }} />
      </div>
      {w.hasGroup && w.group ? (
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <Crown className="h-2.5 w-2.5 text-amber-400/50" />
          {w.group.leaderName} · {w.group.location}
        </div>
      ) : (
        <div className="text-[10px] text-white/25">
          {w.members >= 15 ? '15명 달성! 바닥장을 찾고 있어요' : `${15 - w.members}명 더 모이면 모임 개설 가능`}
        </div>
      )}
    </button>
  );
}

// ── 리스트 카드 ──
function NeedCard({ word: w, isMatched, onClick }: {
  word: CloudWord; isMatched?: boolean; onClick: () => void;
}) {
  const g = w.group;

  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-white/15"
      style={{
        background: w.hasGroup ? 'rgba(255,200,87,0.03)' : 'rgba(255,255,255,0.02)',
        borderColor: isMatched
          ? 'rgba(255,217,61,0.2)'
          : w.hasGroup ? 'rgba(255,200,87,0.12)' : 'rgba(255,255,255,0.06)',
      }}>
      {/* 관심 인원 */}
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full"
        style={{
          background: w.hasGroup ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${w.hasGroup ? 'rgba(255,217,61,0.2)' : 'rgba(255,255,255,0.1)'}`,
        }}>
        <span className="text-sm font-bold" style={{ color: w.hasGroup ? '#ffd93d' : 'rgba(255,255,255,0.6)' }}>
          {w.members}
        </span>
        <span className="text-[7px] text-white/25">명</span>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 flex items-center gap-1.5">
          <p className="truncate text-[13px] font-semibold text-white/80">{w.text}</p>
          {isMatched && (
            <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>매칭</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          {w.hasGroup && g ? (
            <>
              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>모임</span>
              <span>{g.title}</span>
            </>
          ) : w.members >= 15 ? (
            <span style={{ color: '#fbbf24' }}>바닥장 모집중</span>
          ) : (
            <span>{15 - w.members}명 더 필요</span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-white/15" />
    </button>
  );
}
