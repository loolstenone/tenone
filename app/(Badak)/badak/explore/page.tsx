'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, TrendingUp, Sparkles, Crown,
  Flame, BarChart3, UserPlus, Target, ChevronRight,
  UserCircle2, Handshake,
} from 'lucide-react';
import { CLOUD_WORDS as FALLBACK_WORDS } from '@/lib/badak-cloud-data';
import type { CloudWord } from '@/types/badak';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';
import { MatchCard, type MatchCardData } from '@/features/badak/explore/MatchCard';
import { WantsCard, type WantsCardData } from '@/features/badak/explore/WantsCard';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import type { MatchMode } from '@/lib/wio/people/matching';
import { INDUSTRIES, JOB_FUNCTIONS } from '@/lib/badak-constants';
import { Filter } from 'lucide-react';

// 니즈 카테고리 분류
type NeedCategory = 'all' | 'withGroup' | 'waiting' | 'hot';
type ExploreTab = 'needs' | 'people' | 'wants';
type PeopleView = 'match' | 'browse';

export default function ExplorePage() {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [dismissedWants, setDismissedWants] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<{ memberId: string | null; displayName: string; jobFunction: string | null } | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<NeedCategory>('all');
  const [tab, setTab] = useState<ExploreTab>('needs');

  // People 탭 상태
  const [peopleView, setPeopleView] = useState<PeopleView>('match');
  const [peopleMode, setPeopleMode] = useState<MatchMode>('needs_match');
  const [matches, setMatches] = useState<MatchCardData[]>([]);

  // 전체 멤버 검색 상태
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseIndustry, setBrowseIndustry] = useState('');
  const [browseJobFn, setBrowseJobFn] = useState('');
  const [browseMembers, setBrowseMembers] = useState<any[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  // Wants 탭 상태
  const [wants, setWants] = useState<WantsCardData[]>([]);
  const [wantsLoading, setWantsLoading] = useState(false);

  const fetchWithAuth = useCallback(async (path: string) => {
    const { createClient } = await import('@/lib/supabase/client');
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) return null;
    const res = await fetch(path, { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!res.ok) return null;
    return res.json();
  }, []);

  const loadMatches = useCallback(async (mode: MatchMode) => {
    if (!isAuthenticated) return;
    setMatchesLoading(true);
    setMatchesError(null);
    const data = await fetchWithAuth(`/api/badak/explore/people?mode=${mode}&limit=20`);
    if (!data) setMatchesError('로그인 후 매칭이 가능해요');
    else setMatches(data.matches ?? []);
    setMatchesLoading(false);
  }, [isAuthenticated, fetchWithAuth]);

  const loadWants = useCallback(async () => {
    if (!isAuthenticated) return;
    setWantsLoading(true);
    const data = await fetchWithAuth('/api/badak/explore/wants?limit=10');
    setWants(data?.wants ?? []);
    setWantsLoading(false);
  }, [isAuthenticated, fetchWithAuth]);

  const loadBrowse = useCallback(async () => {
    setBrowseLoading(true);
    const params = new URLSearchParams();
    if (browseQuery) params.set('q', browseQuery);
    if (browseIndustry) params.set('industry', browseIndustry);
    if (browseJobFn) params.set('job_function', browseJobFn);
    params.set('limit', '20');
    const res = await fetch(`/api/badak/members/search?${params}`);
    const data = await res.json();
    setBrowseMembers(data.members ?? []);
    setBrowseTotal(data.total ?? 0);
    setBrowseLoading(false);
  }, [browseQuery, browseIndustry, browseJobFn]);

  useEffect(() => {
    if (tab === 'people' && peopleView === 'match') loadMatches(peopleMode);
  }, [tab, peopleView, peopleMode, loadMatches]);

  useEffect(() => {
    if (tab === 'people' && peopleView === 'browse') loadBrowse();
  }, [tab, peopleView, loadBrowse]);

  useEffect(() => {
    if (tab === 'wants') loadWants();
  }, [tab, loadWants]);

  const [sentConnections, setSentConnections] = useState<Set<string>>(new Set());

  const handleConnect = async (peerUserId: string, type: MatchMode = 'needs_match') => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    if (sentConnections.has(peerUserId)) return;

    const connType = type === 'mutual' ? 'partner' : type === 'network' ? 'network' : 'interest';

    const { createClient } = await import('@/lib/supabase/client');
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) return;

    const res = await fetch('/api/badak/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ toUserId: peerUserId, type: connType }),
    });

    if (res.ok) {
      setSentConnections((prev) => new Set(prev).add(peerUserId));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? '관심 전송 실패');
    }
  };

  const handleStartDm = async (peerUserId: string) => {
    if (!isAuthenticated) { setShowLogin(true); return; }

    const { createClient } = await import('@/lib/supabase/client');
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) return;

    // 대화 신청 = partner 타입 connection 요청으로 매핑 (수락 시 Talk 스레드 자동 생성됨)
    const res = await fetch('/api/badak/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ toUserId: peerUserId, type: 'partner', message: '원츠를 함께 실행해보고 싶어요' }),
    });

    if (res.ok) {
      alert('대화 신청을 보냈어요. 상대가 수락하면 Talk 창이 열려요.');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? '대화 신청 실패');
    }
  };

  // 실DB에서 니즈 로드 (실패 시 Mock 폴백)
  const [words, setWords] = useState<CloudWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/badak/needs?limit=100');
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

  // 통계
  const totalNeeds = words.length;
  const withGroup = words.filter((w) => w.hasGroup).length;
  const totalMembers = words.reduce((sum, w) => sum + w.members, 0);

  // 필터링
  const filtered = words
    .filter((w) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return w.text.toLowerCase().includes(q) || w.group?.title.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((w) => {
      if (category === 'withGroup') return w.hasGroup;
      if (category === 'waiting') return !w.hasGroup;
      if (category === 'hot') return w.members >= 10;
      return true;
    })
    .sort((a, b) => b.members - a.members);

  // 추천: 사용자 관심사 매칭 (Phase 2에서 실제 프로필 기반으로 교체)
  const recommended = words.filter((w) => {
    const text = w.text.toLowerCase();
    const title = w.group?.title?.toLowerCase() || '';
    return (
      text.includes('마케팅') || text.includes('광고') || text.includes('퍼포먼스') ||
      text.includes('이직') || text.includes('네트워킹') ||
      title.includes('마케팅') || title.includes('광고')
    );
  }).sort((a, b) => b.members - a.members).slice(0, 8);

  // Hot 니즈
  const hotNeeds = [...words].sort((a, b) => b.members - a.members).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl py-6">
        {/* 헤더 */}
        <div className="mb-5 px-4 sm:px-6">
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">니즈 탐색</h1>
          </div>
          <p className="mt-1 text-sm text-white/50">니즈와 니즈가 만나 원츠(Wants)가 된다</p>
        </div>

        {/* 탭 */}
        <div className="mb-5 flex gap-1 px-4 sm:px-6">
          {([
            { id: 'needs' as const, label: '니즈', icon: Target },
            { id: 'people' as const, label: '사람', icon: UserCircle2 },
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

        {/* === 니즈 탭 === */}
        {tab === 'needs' && (
        <>
        {/* 통계 카드 */}
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

        {/* 검색 */}
        <div className="relative mb-5 px-4 sm:px-6">
          <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 sm:left-9" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="어떤 니즈를 찾고 있나요?"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/30"
          />
        </div>

        {/* 내 관심사 추천 (로그인 시) */}
        {isAuthenticated && recommended.length > 0 && !search && (
          <SlideSection
            title="내 관심사 추천"
            subtitle="산업군 · 직무 · 관심사 기반"
            icon={<Sparkles className="h-4 w-4 text-amber-400" />}
            words={recommended}
            onSelect={setSelectedWord}
          />
        )}

        {/* Hot 니즈 */}
        {!search && (
          <SlideSection
            title="Hot 니즈"
            subtitle="관심이 가장 많은 니즈"
            icon={<Flame className="h-4 w-4 text-orange-400" />}
            words={hotNeeds}
            onSelect={setSelectedWord}
          />
        )}

        {/* 전체 니즈 목록 */}
        <div className="px-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              전체 니즈 <span className="ml-1 text-white/30">{filtered.length}</span>
            </h2>
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {([
              { id: 'all' as const, label: '전체' },
              { id: 'withGroup' as const, label: '모임 개설됨' },
              { id: 'waiting' as const, label: '관심 대기' },
              { id: 'hot' as const, label: '10명+' },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => setCategory(id)}
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{
                  background: category === id ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.05)',
                  color: category === id ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${category === id ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* 니즈 리스트 */}
          <div className="space-y-2">
            {filtered.map((w) => (
              <NeedCard key={w.text} word={w} onClick={() => setSelectedWord(w)} />
            ))}
          </div>

          {loading && words.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">검색 결과가 없습니다</p>
            </div>
          )}
        </div>

        </>
        )}

        {/* === 사람 탭 === */}
        {tab === 'people' && (
          <div className="px-4 sm:px-6">
            {/* 뷰 전환: 매칭 / 전체 멤버 */}
            <div className="mb-4 flex gap-2">
              <button onClick={() => setPeopleView('match')}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold transition-all"
                style={{ background: peopleView === 'match' ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.05)', color: peopleView === 'match' ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                <Sparkles className="inline h-3.5 w-3.5 mr-1" />매칭
              </button>
              <button onClick={() => setPeopleView('browse')}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold transition-all"
                style={{ background: peopleView === 'browse' ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.05)', color: peopleView === 'browse' ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                <Users className="inline h-3.5 w-3.5 mr-1" />전체 멤버
              </button>
            </div>

            {/* 전체 멤버 뷰 — 검색 + 필터 */}
            {peopleView === 'browse' && (
              <>
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input value={browseQuery} onChange={e => setBrowseQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && loadBrowse()}
                      placeholder="이름, 직무, 산업으로 검색"
                      className="w-full rounded-xl bg-white/5 border border-white/8 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none" />
                  </div>
                  <button onClick={loadBrowse} className="shrink-0 rounded-xl bg-amber-500/15 px-4 text-sm font-medium text-amber-400 hover:bg-amber-500/25 transition-colors">
                    검색
                  </button>
                </div>
                <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide">
                  <select value={browseIndustry} onChange={e => { setBrowseIndustry(e.target.value); }}
                    className="shrink-0 rounded-lg bg-white/5 border border-white/8 px-3 py-1.5 text-xs text-white/60 focus:outline-none">
                    <option value="">산업군 전체</option>
                    {INDUSTRIES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select value={browseJobFn} onChange={e => { setBrowseJobFn(e.target.value); }}
                    className="shrink-0 rounded-lg bg-white/5 border border-white/8 px-3 py-1.5 text-xs text-white/60 focus:outline-none">
                    <option value="">직무 전체</option>
                    {JOB_FUNCTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {(browseIndustry || browseJobFn) && (
                    <button onClick={() => { setBrowseIndustry(''); setBrowseJobFn(''); }}
                      className="shrink-0 text-xs text-white/40 hover:text-white/60">초기화</button>
                  )}
                </div>

                {browseLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
                  </div>
                ) : browseMembers.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-white/15" />
                    <p className="text-sm text-white/40">검색 결과가 없습니다</p>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-white/30">{browseTotal}명의 멤버</p>
                    <div className="space-y-2">
                      {browseMembers.map((m: any) => (
                        <button key={m.id}
                          onClick={() => setSelectedPeer({ memberId: m.id, displayName: m.display_name, jobFunction: m.job_function })}
                          className="w-full flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                              {m.display_name?.[0] || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{m.display_name}</p>
                            <p className="text-xs text-white/40 truncate">
                              {[m.job_function, m.industry].filter(Boolean).join(' · ') || '프로필 미완성'}
                            </p>
                          </div>
                          {m.experience_years && (
                            <span className="shrink-0 text-[10px] text-white/30">{m.experience_years}년</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* 매칭 뷰 — 기존 모드 스위처 */}
            {peopleView === 'match' && (
            <>
            <div className="mb-5 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {([
                { id: 'needs_match' as const, label: '같은 니즈' },
                { id: 'mutual' as const, label: '상호 보완' },
                { id: 'network' as const, label: '업계 네트워킹' },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setPeopleMode(id)}
                  className="shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all"
                  style={{
                    background: peopleMode === id ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.05)',
                    color: peopleMode === id ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${peopleMode === id ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-white/8 p-6 text-center">
                <UserCircle2 className="mx-auto mb-3 h-10 w-10 text-white/20" />
                <p className="mb-1 text-base font-semibold text-white/60">로그인하면 매칭이 보여요</p>
                <p className="mb-4 text-sm text-white/35">니즈와 니즈가 만나는 사람들</p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                >
                  로그인
                </button>
              </div>
            )}

            {isAuthenticated && matchesLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            )}

            {isAuthenticated && !matchesLoading && matchesError && (
              <div className="py-16 text-center text-sm text-white/40">{matchesError}</div>
            )}

            {isAuthenticated && !matchesLoading && !matchesError && matches.length === 0 && (
              <div className="py-16 text-center">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-white/15" />
                <p className="mb-1 text-base text-white/50">아직 매칭된 사람이 없어요</p>
                <p className="text-sm text-white/30">프로필을 더 채우거나 니즈에 관심을 표현해보세요</p>
              </div>
            )}

            {isAuthenticated && matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((m) => (
                  <MatchCard
                    key={m.peerId}
                    match={m}
                    onProfile={() => setSelectedPeer({
                      memberId: m.memberId,
                      displayName: m.displayName,
                      jobFunction: m.jobFunction,
                    })}
                    onConnect={() => handleConnect(m.peerId)}
                  />
                ))}
              </div>
            )}
            </>
            )}
          </div>
        )}

        {/* === 원츠 탭 === */}
        {tab === 'wants' && (
          <div className="px-4 sm:px-6">
            <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
              <div className="text-[13px] font-semibold text-amber-400">
                💡 원츠(Wants)는 니즈와 니즈가 만나서 생긴 공동의 지향이에요
              </div>
              <div className="mt-1 text-[11.5px] text-white/50">
                내 니즈 × 상대 니즈 = 우리가 같이 할 수 있는 일
              </div>
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-white/8 p-6 text-center">
                <Handshake className="mx-auto mb-3 h-10 w-10 text-white/20" />
                <p className="mb-1 text-base font-semibold text-white/60">로그인하면 원츠가 보여요</p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                >
                  로그인
                </button>
              </div>
            )}

            {isAuthenticated && wantsLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
              </div>
            )}

            {isAuthenticated && !wantsLoading && wants.length === 0 && (
              <div className="py-16 text-center">
                <Handshake className="mx-auto mb-3 h-10 w-10 text-white/15" />
                <p className="mb-1 text-base text-white/50">아직 원츠가 생기지 않았어요</p>
                <p className="text-sm text-white/30">니즈에 관심을 표현하면 원츠가 떠올라요</p>
              </div>
            )}

            {isAuthenticated && wants.length > 0 && user?.id && (
              <div className="space-y-4">
                {wants
                  .filter((w, i) => !dismissedWants.has(`${i}-${w.needIds.join(',')}-${w.others[0]?.userId}`))
                  .map((w, i) => {
                    const key = `${i}-${w.needIds.join(',')}-${w.others[0]?.userId}`;
                    return (
                      <WantsCard
                        key={key}
                        want={w}
                        myUserId={user.id}
                        onStartDm={handleStartDm}
                        onDismiss={() => setDismissedWants((prev) => new Set(prev).add(key))}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 시트 */}
        <NeedDetailSheet word={selectedWord} onClose={() => setSelectedWord(null)} />
        {selectedPeer && (
          <MemberProfileSheet
            memberId={selectedPeer.memberId}
            displayName={selectedPeer.displayName}
            job={selectedPeer.jobFunction ?? undefined}
            onClose={() => setSelectedPeer(null)}
          />
        )}
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
  return (
    <div className="mb-6">
      <div className="mb-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        <p className="mt-0.5 text-[10px] text-white/25">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6">
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
      {/* 상태 */}
      <div className="mb-2 flex items-center gap-1.5">
        {w.hasGroup ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
            모임 개설됨
          </span>
        ) : w.members >= 15 ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            바닥장 모집중
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
            관심 모집중
          </span>
        )}
        <span className="text-[10px] text-white/30">{w.members}명</span>
      </div>

      {/* 니즈 텍스트 */}
      <p className="mb-2.5 line-clamp-2 text-xs font-semibold leading-snug text-white/80">{w.text}</p>

      {/* 프로그레스 */}
      <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{
          width: `${progress}%`,
          background: w.hasGroup
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : progress >= 100 ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
        }} />
      </div>

      {/* 하단 정보 */}
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
function NeedCard({ word: w, onClick }: { word: CloudWord; onClick: () => void }) {
  const g = w.group;

  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-white/15"
      style={{
        background: w.hasGroup ? 'rgba(255,200,87,0.03)' : 'rgba(255,255,255,0.02)',
        borderColor: w.hasGroup ? 'rgba(255,200,87,0.12)' : 'rgba(255,255,255,0.06)',
      }}>
      {/* 관심 인원 원형 */}
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
        <p className="mb-0.5 truncate text-[13px] font-semibold text-white/80">{w.text}</p>
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
