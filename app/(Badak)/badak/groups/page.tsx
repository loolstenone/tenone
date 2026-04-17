'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Calendar, MapPin, Users, Search,
  Crown, Flame, Clock, Sparkles, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface GroupItem {
  id: string;
  slug?: string;
  title: string;
  description: string | null;
  status: string;
  max_members: number;
  current_members: number;
  event_date: string | null;
  location: string | null;
  fee: number;
  tags: string[];
  cover_image_url: string | null;
  leader: { display_name: string; job_function: string; avatar_url?: string | null } | null;
  need: { display_text: string; count: number } | null;
}

// ── Mock 데이터 (DB 연동 전까지) ──
const MOCK_GROUPS: GroupItem[] = [
  {
    id: 'g1', slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', description: 'B2B SaaS 마케팅 전략과 실무를 나누는 정기 모임입니다. 퍼포먼스 마케팅부터 콘텐츠 마케팅까지.',
    status: 'recruiting', max_members: 20, current_members: 13,
    event_date: '2026-04-26T14:00:00', location: '강남역', fee: 0,
    tags: ['B2B', '마케팅', 'SaaS'],
    cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '마케터J', job_function: '퍼포먼스 마케팅' },
    need: { display_text: 'B2B 마케팅', count: 28 },
  },
  {
    id: 'g2', slug: 'copywriting-practice', title: '카피라이팅 같이 연습할래?', description: '광고 카피, SNS 카피, 브랜드 슬로건 등 카피라이팅 실력을 함께 키워봐요.',
    status: 'confirmed', max_members: 12, current_members: 12,
    event_date: '2026-04-20T19:00:00', location: '성수동', fee: 5000,
    tags: ['카피', '글쓰기', '광고'],
    cover_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '피장인', job_function: '브랜드 마케터' },
    need: { display_text: '카피라이팅', count: 35 },
  },
  {
    id: 'g3', slug: 'sns-content-studio', title: '소셜미디어 트렌드 분석', description: '매주 소셜미디어 트렌드를 분석하고 인사이트를 공유합니다.',
    status: 'recruiting', max_members: 15, current_members: 8,
    event_date: '2026-05-03T14:00:00', location: '홍대', fee: 0,
    tags: ['SNS', '트렌드', '분석'],
    cover_image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '트렌디K', job_function: '소셜미디어 마케터' },
    need: { display_text: '소셜미디어', count: 22 },
  },
  {
    id: 'g4', slug: 'startup-marketer-club', title: '마케터 사이드 프로젝트', description: '마케터끼리 모여서 사이드 프로젝트를 진행합니다. 기획부터 런칭까지!',
    status: 'recruiting', max_members: 8, current_members: 5,
    event_date: '2026-05-10T10:00:00', location: '온라인 (Zoom)', fee: 0,
    tags: ['사이드프로젝트', '기획', '런칭'],
    cover_image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '기획자A', job_function: 'PM' },
    need: null,
  },
  {
    id: 'g5', slug: 'ai-prompt-engineering', title: 'AI 프롬프트 엔지니어링 스터디', description: 'ChatGPT, Claude 등 AI 도구 활용 마케팅 실습. 매주 과제 기반.',
    status: 'recruiting', max_members: 15, current_members: 11,
    event_date: '2026-04-27T15:00:00', location: '강남역', fee: 10000,
    tags: ['AI', '프롬프트', 'ChatGPT'],
    cover_image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: 'AI마스터', job_function: '그로스 마케터' },
    need: { display_text: 'AI 마케팅', count: 45 },
  },
  {
    id: 'g6', slug: 'performance-case-study', title: '퍼포먼스 마케팅 네트워킹', description: '페이스북, 구글, 네이버 광고 실무자들의 네트워킹. 비정기 만남.',
    status: 'recruiting', max_members: 30, current_members: 18,
    event_date: '2026-05-17T19:30:00', location: '을지로', fee: 0,
    tags: ['퍼포먼스', '광고', '네트워킹'],
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '광고맨P', job_function: '퍼포먼스 마케팅' },
    need: { display_text: '퍼포먼스 광고', count: 31 },
  },
  {
    id: 'g7', slug: 'brand-strategy-reading', title: '콘텐츠 마케팅 독서 모임', description: '마케팅 관련 책을 함께 읽고 토론합니다. 월 1권.',
    status: 'recruiting', max_members: 10, current_members: 4,
    event_date: '2026-05-24T14:00:00', location: '합정', fee: 0,
    tags: ['독서', '콘텐츠', '마케팅'],
    cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '콘텐츠러L', job_function: '콘텐츠 마케터' },
    need: null,
  },
  {
    id: 'g8', slug: 'data-analytics-meetup', title: '데이터 분석 마케터 모임', description: 'GA4, Mixpanel, Amplitude 등 분석 도구 스터디',
    status: 'confirmed', max_members: 10, current_members: 10,
    event_date: '2026-04-19T14:00:00', location: '삼성역', fee: 15000,
    tags: ['데이터', 'GA4', '분석'],
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=560&h=200&fit=crop&auto=format',
    leader: { display_name: '데이터M', job_function: '데이터 분석가' },
    need: { display_text: '데이터 분석', count: 19 },
  },
];

// 사용자 프로필 기반 추천 (Mock — 실제는 API에서 매칭)
const USER_PROFILE = {
  industry: '광고/에이전시',
  jobFunction: '퍼포먼스 마케팅',
  interests: ['네트워킹', '업무 스킬 향상', '이직 준비'],
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]}) ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return dateStr; }
};

// ── 가로 슬라이드 섹션 ──
function SlideSection({ title, icon, groups, emptyText }: {
  title: string; icon: React.ReactNode; groups: GroupItem[]; emptyText: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  if (groups.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // PC 마우스 드래그 — FeedHighlights와 동일 패턴
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    hasDragged.current = false;
    setGrabbing(true);
    startX.current = e.pageX;
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - dx;
  };
  const onMouseUp = () => { isDragging.current = false; setGrabbing(false); };

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-base font-bold text-white">{title}</h2>
          <span className="text-xs text-white/35">{groups.length}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="rounded-full border border-white/10 p-1.5 text-white/30 transition-colors hover:border-white/25 hover:text-white/70"
            aria-label="이전"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-full border border-white/10 p-1.5 text-white/30 transition-colors hover:border-white/25 hover:text-white/70"
            aria-label="다음"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 px-4 pb-2 select-none sm:px-6"
        style={{
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: grabbing ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} hasDragged={hasDragged} />
        ))}
      </div>
    </div>
  );
}

// ── 모임 카드 (슬라이드용) ──
function GroupCard({ group: g, hasDragged }: { group: GroupItem; hasDragged?: React.RefObject<boolean> }) {
  const remaining = g.max_members - g.current_members;
  const isFull = remaining <= 0;

  const statusStyle = (() => {
    switch (g.status) {
      case 'recruiting': return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: '모집중' };
      case 'confirmed': return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: '확정' };
      case 'closed': return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', label: '종료됨' };
      case 'ended': return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', label: '종료됨' };
      default: return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: '검토중' };
    }
  })();

  const isClosed = g.status === 'closed' || g.status === 'ended';

  return (
    <Link
      href={`/badak/groups/${g.slug || g.id}`}
      onClick={(e) => { if (hasDragged?.current) e.preventDefault(); }}
      draggable={false}
      className="block w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/8 no-underline transition-all hover:border-white/15 sm:w-[300px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        scrollSnapAlign: 'start',
        opacity: isClosed ? 0.45 : 1,
        filter: isClosed ? 'grayscale(0.6)' : 'none',
      }}
    >
      {/* 커버 or 컬러 헤더 */}
      {g.cover_image_url ? (
        <div className="h-24 w-full overflow-hidden">
          <img src={g.cover_image_url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-16 items-end px-3 pb-2"
          style={{ background: `linear-gradient(135deg, rgba(255,217,61,0.08), rgba(255,107,107,0.08))` }}>
          {g.need && (
            <span className="rounded-full px-2 py-0.5 text-[9px] text-white/30" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {g.need.display_text}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        {/* 상태 뱃지 */}
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
          {g.fee === 0 ? (
            <span className="text-xs text-green-400/70">무료</span>
          ) : (
            <span className="text-xs text-white/40">{g.fee.toLocaleString()}원</span>
          )}
        </div>

        {/* 제목 */}
        <h3 className="mb-3 line-clamp-2 text-[15px] font-bold leading-snug text-white">{g.title}</h3>

        {/* 일정/장소 */}
        <div className="mb-4 flex flex-col gap-1.5 text-[12.5px] text-white/45">
          {g.event_date && (
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(g.event_date)}</span>
          )}
          {g.location && (
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {g.location}</span>
          )}
        </div>

        {/* 인원 바 */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11.5px]">
            <span className="text-white/45">{g.current_members}/{g.max_members}명</span>
            <span className="text-white/30">{isFull ? '마감' : `잔여 ${remaining}석`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (g.current_members / g.max_members) * 100)}%`,
                background: isFull ? '#ef4444' : remaining <= 3 ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'linear-gradient(90deg, #22c55e, #16a34a)',
              }}
            />
          </div>
        </div>

        {/* 바닥장 */}
        {g.leader && (
          <div className="flex items-center gap-2 pt-0.5">
            {g.leader.avatar_url ? (
              <Image src={g.leader.avatar_url} alt={g.leader.display_name} width={24} height={24}
                className="h-6 w-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d' }}>
                {g.leader.display_name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-white/55">
              <Crown className="mr-0.5 inline h-3 w-3 text-amber-400/60" />
              {g.leader.display_name}
            </span>
            <span className="text-[11px] text-white/30">· {g.leader.job_function}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── 메인 페이지 ──
export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // DB 조회 시도 → 없으면 Mock
    fetch('/api/badak/groups')
      .then((r) => r.json())
      .then((data) => {
        const fetched = data.groups || [];
        setGroups(fetched.length > 0 ? fetched : MOCK_GROUPS);
        setLoading(false);
      })
      .catch(() => { setGroups(MOCK_GROUPS); setLoading(false); });
  }, []);

  // ── 섹션 분류 ──
  // Hot: 인원 충족률 높은 순 (모집중만)
  const hotGroups = [...groups]
    .filter((g) => g.status === 'recruiting')
    .sort((a, b) => (b.current_members / b.max_members) - (a.current_members / a.max_members))
    .slice(0, 6);

  // 최신: 최근 생성순
  const latestGroups = [...groups]
    .filter((g) => g.status === 'recruiting')
    .sort((a, b) => {
      const da = a.event_date || '';
      const db = b.event_date || '';
      return db.localeCompare(da);
    })
    .slice(0, 6);

  // 추천: 사용자 직무/관심사 기반 매칭
  const recommendedGroups = groups
    .filter((g) => {
      if (g.status !== 'recruiting') return false;
      const matchTags = g.tags?.some((t) =>
        USER_PROFILE.interests.some((i) => t.includes(i) || i.includes(t))
      );
      const matchJob = g.leader?.job_function.includes(USER_PROFILE.jobFunction) ||
        g.need?.display_text.includes('마케팅');
      const matchDesc = g.title.includes('마케팅') || g.title.includes('네트워킹');
      return matchTags || matchJob || matchDesc;
    })
    .slice(0, 6);

  // 전체 모임 (검색 필터)
  const allFiltered = groups.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.tags?.some((t) => t.toLowerCase().includes(q)) ||
      g.leader?.display_name.toLowerCase().includes(q) ||
      g.need?.display_text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-3xl py-8 sm:py-10">
        {/* 헤더 */}
        <div className="mb-7 flex items-center justify-between px-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold text-white">모임</h1>
            <p className="mt-1.5 text-sm text-white/50">함께 성장할 모임을 찾아보세요</p>
          </div>
          <Link
            href="/badak/groups/create"
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold no-underline"
            style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}
          >
            <Plus className="h-4 w-4" /> 모임 만들기
          </Link>
        </div>

        {/* 검색 */}
        <div className="relative mb-8 px-5 sm:px-8">
          <Search className="absolute left-8 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/35 sm:left-11" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowAll(true); }}
            placeholder="모임명, 태그, 바닥장 검색"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/30"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
          </div>
        )}

        {!loading && !showAll && (
          <>
            {/* 추천 모임 — 로그인 사용자 프로필 기반 */}
            {recommendedGroups.length > 0 && (
              <SlideSection
                title="추천 모임"
                icon={<Sparkles className="h-5 w-5 text-amber-400" />}
                groups={recommendedGroups}
                emptyText=""
              />
            )}

            {/* Hot 모임 */}
            <SlideSection
              title="Hot 모임"
              icon={<Flame className="h-5 w-5 text-orange-400" />}
              groups={hotGroups}
              emptyText="모집 중인 모임이 없습니다"
            />

            {/* 최신 모임 */}
            <SlideSection
              title="최신 모임"
              icon={<Clock className="h-5 w-5 text-blue-400" />}
              groups={latestGroups}
              emptyText="등록된 모임이 없습니다"
            />

            {/* 전체 보기 버튼 */}
            <div className="px-5 sm:px-8">
              <button
                onClick={() => setShowAll(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-4 text-sm font-medium text-white/50 transition-all hover:border-white/25 hover:text-white/75"
              >
                전체 모임 보기 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* 전체 모임 목록 */}
        {!loading && showAll && (
          <div className="px-5 sm:px-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                전체 모임 <span className="ml-1.5 text-white/40">{allFiltered.length}</span>
              </h2>
              <button
                onClick={() => { setShowAll(false); setSearch(''); }}
                className="text-sm text-white/40 hover:text-white/65"
              >
                슬라이드 보기
              </button>
            </div>

            {allFiltered.length === 0 ? (
              <div className="py-20 text-center">
                <SlidersHorizontal className="mx-auto mb-4 h-12 w-12 text-white/15" />
                <p className="mb-1.5 text-base font-medium text-white/50">
                  {search ? '검색 결과가 없습니다' : '아직 모임이 없습니다'}
                </p>
                <p className="text-sm text-white/30">
                  {search ? '다른 키워드로 검색해보세요' : '첫 번째 바닥장이 되어보세요!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allFiltered.map((g) => {
                  const remaining = g.max_members - g.current_members;
                  const isFull = remaining <= 0;
                  const st = (() => {
                    switch (g.status) {
                      case 'recruiting': return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: '모집중' };
                      case 'confirmed': return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: '확정' };
                      default: return { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', label: '마감' };
                    }
                  })();

                  return (
                    <Link key={g.id} href={`/badak/groups/${g.id}`}
                      className="flex gap-4 rounded-xl border border-white/8 p-5 no-underline transition-all hover:border-white/15"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          {g.fee === 0 && <span className="text-xs text-green-400/70">무료</span>}
                        </div>
                        <h3 className="mb-2 text-[15px] font-bold text-white">{g.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-white/40">
                          {g.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(g.event_date)}</span>}
                          {g.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {g.location}</span>}
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.current_members}/{g.max_members}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <ChevronRight className="h-5 w-5 text-white/20" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
