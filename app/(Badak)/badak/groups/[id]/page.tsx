'use client';

import { useState, useEffect, useRef, use } from 'react';
import { sanitizeHtml } from '@/lib/sanitize-html';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Calendar, MapPin, Users, Banknote, ChevronRight,
  Heart, Share2, Bell, CheckCircle2, Clock, Lock, Bookmark,
  Star, X, Send, MessageCircle,
} from 'lucide-react';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── 타입 정의 ──────────────────────────────────────────
interface GroupSession {
  number: number;
  title: string;
  description: string;
  date?: string;
}

interface GroupReview {
  id: string;
  author: string;
  avatar_url: string | null;
  job_function: string | null;
  rating: number;
  content: string;
  created_at: string;
  season_number?: number | null;  // 상속된 후기의 시즌 번호
}

interface GroupMember {
  id: string;
  display_name: string;
  job_function: string | null;
  avatar_url: string | null;
}

interface GroupDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;        // 소개 탭
  intro_who: string | null;          // 소개 탭 - 이런 분께 추천
  structure: GroupSession[] | null;  // 구성 탭
  guide: string | null;              // 상세 안내 탭
  notice: string | null;             // 주요 공지
  status: string;
  join_type: 'firstcome' | 'approval';
  meeting_type: 'onetime' | 'series' | 'recurring' | null;
  series_count?: number | null;
  parent_group_id?: string | null;
  parent_slug?: string | null;
  season_number?: number | null;
  show_leader_reviews?: boolean;
  leader_career?: string | null;
  leader_reason?: string | null;
  max_members: number;
  current_members: number;
  event_date: string | null;
  schedule: string | null;
  location: string | null;
  location_detail: string | null;
  fee: number;
  tags: string[];
  cover_image_url: string | null;
  created_at?: string;
  leader: {
    id: string; display_name: string; job_function: string;
    experience_years: number; bio?: string | null; avatar_url?: string | null;
  } | null;
  need: { id: string; display_text: string; count: number } | null;
  members: GroupMember[];
  reviews: GroupReview[];
  related: { slug: string; title: string; current_members: number; max_members: number; tags: string[]; cover_image_url?: string | null }[];
}

// 모임이 없으면 '없는 모임'으로 표시한다 — 가짜 모임을 대체값으로 보여주지 않는다 (2026-10-10, CLAUDE.md §1.9.5 목업 금지)

// 구 ID → 슬러그 호환 맵
const ID_TO_SLUG: Record<string, string> = {
  g1: 'b2b-marketing-weekly', g2: 'copywriting-practice',
  g3: 'sns-content-studio', g4: 'performance-case-study',
  g5: 'ai-prompt-engineering', g6: 'startup-marketer-club',
  g7: 'brand-strategy-reading', g8: 'data-analytics-meetup',
  g9: 'career-transition-agency-inhouse',
};

// ── 컬러 팔레트 ──
const AVATAR_COLORS = [
  { bg: 'rgba(255,217,61,0.15)', text: '#ffd93d' },
  { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
  { bg: 'rgba(251,146,60,0.15)', text: '#fb923c' },
  { bg: 'rgba(236,72,153,0.12)', text: '#f472b6' },
  { bg: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
];

// ── 탭 정의 ──
const TABS = ['소개', '구성', '상세 안내', '후기', '참여 이력', '추천 모임'] as const;
type TabName = typeof TABS[number];

// ── 상태 메타 ──
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  recruiting: { label: '모집중', bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  confirmed: { label: '모임 확정', bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  needs_gathering: { label: '니즈 모이는 중', bg: 'rgba(255,217,61,0.08)', color: '#ffd93d' },
  closed: { label: '마감', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  ended: { label: '종료', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
};

type JoinState = 'idle' | 'applying' | 'submitted' | 'joined' | 'waitlisted';

// ── 아바타 컴포넌트 ──
function Avatar({ name, avatarUrl, idx, size = 40 }: {
  name: string; avatarUrl?: string | null; idx: number; size?: number;
}) {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  if (avatarUrl) {
    return (
      <Image src={avatarUrl} alt={name} width={size} height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35, background: color.bg, color: color.text }}>
      {name.charAt(0)}
    </div>
  );
}

// ── 별점 ──
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className="h-3.5 w-3.5"
          style={{ fill: i <= rating ? '#ffd93d' : 'transparent', color: i <= rating ? '#ffd93d' : 'rgba(255,255,255,0.15)' }} />
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ──
export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawSlug } = use(params);
  const { isAuthenticated } = useAuth();

  // slug 또는 구 ID 모두 지원
  const slug = ID_TO_SLUG[rawSlug] || rawSlug;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('소개');
  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [applyMessage, setApplyMessage] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLeaderProfile, setShowLeaderProfile] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [myPastGroups, setMyPastGroups] = useState<{
    id: string; slug: string; title: string; status: string;
    event_date: string | null; schedule: string | null; cover_image_url: string | null;
    season_number: number | null;
  }[]>([]);
  const [myPastLoading, setMyPastLoading] = useState(true);

  // 섹션 refs
  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({
    소개: null, 구성: null, '상세 안내': null, 후기: null, '참여 이력': null, '추천 모임': null,
  });
  const tabBarRef = useRef<HTMLDivElement>(null);

  // 데이터 로드
  useEffect(() => {
    fetch(`/api/badak/groups/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.group) {
          const g = data.group;
          setGroupId(g.id);
          setGroup({
            ...g,
            members: g.members ?? [],
            reviews: [],  // 별도 useEffect에서 /reviews API로 로드
            related: g.related ?? [],
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  // 좋아요 + 참여 상태 로드
  useEffect(() => {
    if (!groupId) return;
    const load = async () => {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [likeRes, joinRes, reviewRes, bookmarkRes] = await Promise.all([
        fetch(`/api/badak/groups/${groupId}/like`, { headers }),
        fetch(`/api/badak/groups/${groupId}/join`, { headers }),
        fetch(`/api/badak/groups/${groupId}/reviews`),
        token ? fetch('/api/badak/bookmarks', { headers }) : Promise.resolve(null),
      ]);

      if (likeRes.ok) {
        const d = await likeRes.json();
        setIsLiked(d.liked);
        setLikeCount(d.count);
      }
      if (joinRes.ok) {
        const d = await joinRes.json();
        if (d.status === 'leader' || d.status === 'approved') setJoinState('joined');
        else if (d.status === 'applied') setJoinState('submitted');
        if (d.memberId) setMyMemberId(d.memberId);
      }
      if (reviewRes.ok) {
        const d = await reviewRes.json();
        if (d.reviews?.length > 0) {
          setGroup(prev => prev ? { ...prev, reviews: d.reviews } : prev);
        }
      }
      if (bookmarkRes?.ok) {
        const d = await bookmarkRes.json();
        const existing = d.bookmarks?.find((b: { item_type: string; item_id: string; id: string }) =>
          b.item_type === 'group' && b.item_id === groupId
        );
        if (existing) {
          setIsBookmarked(true);
          setBookmarkId(existing.id);
        }
      }
    };
    load();
  }, [groupId]);

  // IntersectionObserver — 스크롤 위치에 따라 활성 탭 업데이트
  useEffect(() => {
    if (!group) return;
    const headerH = (tabBarRef.current?.getBoundingClientRect().bottom ?? 112);
    const observers: IntersectionObserver[] = [];

    TABS.forEach(tab => {
      const el = sectionRefs.current[tab];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(tab); },
        { rootMargin: `-${headerH}px 0px -50% 0px` }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [group]);

  // 내 참여 이력 로드 (인증된 경우만)
  useEffect(() => {
    if (!isAuthenticated) return;
    setMyPastLoading(true);
    (async () => {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      if (!token) { setMyPastLoading(false); return; }
      const res = await fetch('/api/badak/groups?member=me&status=completed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setMyPastGroups(d.groups ?? []);
      }
      setMyPastLoading(false);
    })();
  }, [isAuthenticated]);

  function scrollToTab(tab: TabName) {
    const el = sectionRefs.current[tab];
    if (!el) return;
    const offset = (tabBarRef.current?.getBoundingClientRect().height ?? 44) + 56 + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveTab(tab);
  }

  function handleShare() {
    if (navigator.share) { navigator.share({ title: group?.title, url: window.location.href }); return; }
    navigator.clipboard.writeText(window.location.href);
    setToast('링크가 복사됐어요');
    setTimeout(() => setToast(null), 2500);
  }

  if (!group && notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1a1a2e] text-white/60">
        <p className="text-sm">모임을 찾을 수 없습니다</p>
        <Link href="/badak/groups" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">모임 목록으로</Link>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
      </div>
    );
  }

  const isFull = group.current_members >= group.max_members;
  const isClosed = group.status === 'closed' || group.status === 'ended';
  const isNeedsGathering = group.status === 'needs_gathering';
  const fillPct = Math.round((group.current_members / group.max_members) * 100);
  const remaining = group.max_members - group.current_members;
  const remainingPct = remaining / group.max_members;
  const isClosingSoon = !isFull && !isClosed && remainingPct <= 0.10;
  const isHot = !isFull && !isClosed && !isClosingSoon && remainingPct <= 0.40;
  const isNew = group.created_at ? (Date.now() - new Date(group.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
  const statusMeta = STATUS_META[group.status] ?? { label: group.status, bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' };
  const ctaDone = joinState === 'joined' || joinState === 'submitted' || joinState === 'waitlisted';
  const ctaDisabled = isClosed || (isFull && !isNeedsGathering);

  const ctaLabel = ctaDone
    ? (joinState === 'joined' ? '참여 완료' : joinState === 'submitted' ? '신청 완료 — 승인 대기' : '관심 등록 완료')
    : isClosed ? '모집 종료'
    : isFull && !isNeedsGathering ? '정원 마감'
    : isNeedsGathering ? '관심 표시하기'
    : group.join_type === 'approval' ? '참여 신청하기'
    : '바로 참여하기';

  async function handleLike() {
    if (!isAuthenticated || !groupId) return;
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/badak/groups/${groupId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setIsLiked(d.liked);
      setLikeCount(d.count);
    }
  }

  async function handleSubmitReview() {
    if (!isAuthenticated || !groupId || reviewSubmitting) return;
    if (!reviewContent.trim()) return;
    setReviewSubmitting(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setReviewSubmitting(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, content: reviewContent.trim() }),
    });
    if (res.ok) {
      // 제출 후 목록 재조회 — POST 응답에는 author 정보 없음
      const reviewsRes = await fetch(`/api/badak/groups/${groupId}/reviews`);
      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setGroup(prev => prev ? { ...prev, reviews: d.reviews ?? [] } : prev);
      }
      setReviewContent('');
      setReviewRating(5);
      setShowReviewForm(false);
    } else {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error ?? '';
      if (msg.includes('unique') || msg.includes('duplicate') || res.status === 409) {
        setToast('이미 이 모임에 후기를 남기셨어요');
        setShowReviewForm(false);
      } else if (res.status === 404) {
        setToast('바닥 멤버 프로필이 없습니다. 바닥 가입 후 이용해주세요');
      } else {
        setToast('후기 등록에 실패했습니다. 다시 시도해주세요');
      }
    }
    setReviewSubmitting(false);
  }

  async function handleJoin() {
    if (!isAuthenticated || !group || !groupId) return;
    if (isNeedsGathering) { setJoinState('waitlisted'); return; }
    if (group.join_type === 'approval') { setJoinState('applying'); return; }
    setIsJoining(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setIsJoining(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const d = await res.json();
      setJoinState(d.status === 'approved' ? 'joined' : 'submitted');
    }
    setIsJoining(false);
  }

  async function handleApplySubmit() {
    if (!applyMessage.trim() || !groupId || isJoining) return;
    setIsJoining(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setIsJoining(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: applyMessage }),
    });
    if (res.ok) setJoinState('submitted');
    setIsJoining(false);
  }

  async function handleBookmark() {
    if (!isAuthenticated || !groupId || isBookmarkLoading) return;
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    setIsBookmarkLoading(true);
    if (isBookmarked && bookmarkId) {
      const res = await fetch(`/api/badak/bookmarks?id=${bookmarkId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsBookmarked(false);
        setBookmarkId(null);
        setToast('북마크 해제됐어요');
        setTimeout(() => setToast(null), 2500);
      }
    } else {
      const res = await fetch('/api/badak/bookmarks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_type: 'group', item_id: groupId, title: group?.title }),
      });
      if (res.ok) {
        const d = await res.json();
        setIsBookmarked(true);
        setBookmarkId(d.bookmark?.id ?? null);
        setToast('북마크에 저장됐어요');
        setTimeout(() => setToast(null), 2500);
      }
    }
    setIsBookmarkLoading(false);
  }

  return (
    <div className="mx-auto min-h-screen max-w-[640px] bg-[#1a1a2e] pb-28 text-white">

      {/* ── 히어로 ── */}
      <div className="relative">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt={group.title}
            className={`h-64 w-full object-cover ${isClosed ? 'opacity-40 grayscale' : ''}`} />
        ) : (
          <div className="h-44 w-full"
            style={{ background: 'linear-gradient(135deg, rgba(255,217,61,0.1),rgba(139,92,246,0.1),rgba(59,130,246,0.08))' }} />
        )}
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #1a1a2e 0%, rgba(26,26,46,0.45) 55%, transparent 100%)' }} />

        {/* 상단 액션 바 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-16">
          <Link href="/badak/groups"
            className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            <ArrowLeft className="h-4 w-4 text-white/80" />
          </Link>
          <div className="flex gap-1.5">
            <button onClick={handleBookmark} disabled={isBookmarkLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              <Bookmark className="h-4 w-4"
                style={{ color: isBookmarked ? '#ffd93d' : 'rgba(255,255,255,0.7)', fill: isBookmarked ? '#ffd93d' : 'none' }} />
            </button>
            <button onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              <Share2 className="h-4 w-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* 히어로 하단 — 타이틀 + 배지 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
              style={{ background: statusMeta.bg, color: statusMeta.color }}>
              {statusMeta.label}
            </span>
            {group.meeting_type && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.55)' }}>
                {group.meeting_type === 'recurring' ? '정기 모임' : group.meeting_type === 'series' ? `${group.series_count ?? ''}회 시리즈` : '1회 모임'}
              </span>
            )}
            {group.join_type === 'approval' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.45)' }}>
                <Lock className="h-3 w-3" />승인제
              </span>
            )}
            {isClosingSoon && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
                style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>🔥 마감임박</span>
            )}
            {isHot && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>Hot</span>
            )}
            {isNew && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>New</span>
            )}
          </div>
          <h1 className="text-xl font-extrabold leading-tight text-white drop-shadow">{group.title}</h1>
          {group.tagline && <p className="mt-1 text-sm text-white/55 drop-shadow">{group.tagline}</p>}
        </div>
      </div>

      {/* ── 퀵 스탯 바 ── */}
      <div className="flex divide-x divide-white/8 border-b border-white/10 px-2"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { icon: <Users className="h-4 w-4" />, label: `${group.current_members}/${group.max_members}명`, color: isFull ? '#f87171' : 'rgba(255,255,255,0.80)' },
          group.location && { icon: <MapPin className="h-4 w-4" />, label: group.location, color: 'rgba(255,255,255,0.75)' },
          { icon: <Banknote className="h-4 w-4" />, label: group.fee > 0 ? `${group.fee.toLocaleString()}원` : '무료', color: group.fee === 0 ? '#4ade80' : 'rgba(255,255,255,0.75)' },
          (group.schedule || group.event_date) && {
            icon: <Calendar className="h-4 w-4" />,
            label: group.schedule ?? new Date(group.event_date!).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
            color: 'rgba(255,255,255,0.75)',
          },
        ].filter(Boolean).map((item, i) => (item &&
          <div key={i} className="flex flex-1 items-center justify-center gap-1.5 py-3">
            <span style={{ color: (item as {color: string}).color, opacity: 0.7 }}>{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: (item as {color: string}).color }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── 잔여석 강조 바 ── */}
      {!isFull && !isClosed && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ background: isClosingSoon ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isClosingSoon ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.09)'}` }}>
          <span className="text-xs" style={{ color: isClosingSoon ? '#fb923c' : 'rgba(255,255,255,0.45)' }}>
            {isClosingSoon ? '🔥 마감임박 · 서두르세요!' : '잔여석'}
          </span>
          <span className="text-sm font-bold" style={{ color: isClosingSoon ? '#fb923c' : '#fb923c' }}>
            {remaining}자리
          </span>
        </div>
      )}

      {/* ── 주요 공지 ── */}
      {group.notice && showNotice && (
        <div className="mx-4 mt-4 flex gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,217,61,0.07)', border: '1px solid rgba(255,217,61,0.18)' }}>
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="flex-1 text-sm leading-relaxed text-white/70">{group.notice}</p>
          <button onClick={() => setShowNotice(false)} className="shrink-0 text-white/20 hover:text-white/40">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── 정원 프로그레스 ── */}
      <div className="mx-4 mt-4 rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-white/40">모집 현황</span>
          <span style={{ color: isFull ? '#f87171' : 'rgba(255,255,255,0.65)' }}>
            {group.current_members}/{group.max_members}명
            {!isFull && !isClosed && <span className="ml-1.5 text-white/25">· {group.max_members - group.current_members}자리 남음</span>}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${fillPct}%`, background: isFull ? 'linear-gradient(90deg,#f87171,#fb923c)' : 'linear-gradient(90deg,#ffd93d,#ff9f43)', transition: 'width 0.7s' }} />
        </div>
      </div>

      {/* ── 일시·장소 요약 ── */}
      {(group.event_date || group.schedule || group.location) && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(group.event_date || group.schedule) && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="h-4 w-4 shrink-0 text-amber-400/70" />
              <span className="truncate text-sm font-medium text-white/75">
                {group.schedule ?? new Date(group.event_date!).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
            </div>
          )}
          {group.location && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 text-amber-400/70" />
              <span className="truncate text-sm font-medium text-white/75">
                {group.location}{group.location_detail ? ` · ${group.location_detail}` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 스티키 탭 바 ── */}
      <div ref={tabBarRef} className="sticky z-20 mt-4 border-b border-white/6"
        style={{ top: 56, background: '#1a1a2e' }}>
        <div className="flex">
          {TABS.map(tab => (
            <button key={tab} onClick={() => scrollToTab(tab)}
              className="flex-1 py-3 text-sm font-medium transition-colors text-center"
              style={{
                color: activeTab === tab ? '#ffd93d' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === tab ? '2px solid #ffd93d' : '2px solid transparent',
                marginBottom: -1,
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── 섹션 컨테이너 ── */}
      <div className="px-4">

        {/* ── 소개 ── */}
        <section ref={el => { sectionRefs.current['소개'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">소개</h2>

          {/* 모임 설명 */}
          {group.description && (
            <div className="mb-4 rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm leading-7 text-white/60 whitespace-pre-line">{group.description}</p>
            </div>
          )}

          {/* 이런 분께 추천 */}
          {group.intro_who && (
            <div className="mb-4 rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,217,61,0.04)', border: '1px solid rgba(255,217,61,0.1)' }}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400/50">이런 분께 추천해요</div>
              <p className="text-sm leading-7 text-white/60 whitespace-pre-line">{group.intro_who}</p>
            </div>
          )}

          {/* 연결된 니즈 */}
          {group.need && (
            <div className="mb-4 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">연결된 니즈</div>
              <p className="text-sm text-white/65">"{group.need.display_text}"</p>
              <p className="mt-0.5 text-[11px] text-amber-400/50">{group.need.count}명이 같은 니즈를 가지고 있어요</p>
            </div>
          )}

          {/* 바닥장 */}
          {group.leader && (
            <button type="button" onClick={() => setShowLeaderProfile(true)}
              className="w-full flex items-start gap-3.5 rounded-xl p-4 text-left transition-colors hover:border-amber-400/20"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Avatar name={group.leader.display_name} avatarUrl={group.leader.avatar_url} idx={0} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/85">{group.leader.display_name}</span>
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">바닥장</span>
                </div>
                <div className="mt-0.5 text-xs text-white/35">{group.leader.job_function} · {group.leader.experience_years}년차</div>
                {group.leader_career && <p className="mt-1 text-xs text-white/40 line-clamp-1">{group.leader_career}</p>}
                {group.leader_reason && <p className="mt-1 text-xs leading-relaxed text-amber-400/50 line-clamp-2">{group.leader_reason}</p>}
                {!group.leader_career && !group.leader_reason && group.leader.bio && <p className="mt-1.5 text-xs leading-relaxed text-white/40 line-clamp-2">{group.leader.bio}</p>}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/20 mt-1" />
            </button>
          )}
        </section>

        {/* ── 구성 ── */}
        <section ref={el => { sectionRefs.current['구성'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">구성</h2>
          {group.structure?.length ? (
            <div className="relative">
              {/* 타임라인 라인 */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="space-y-1">
                {group.structure.map(session => (
                  <div key={session.number} className="flex gap-4">
                    {/* 번호 원 */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold z-10"
                      style={{ background: '#1a1a2e', border: '1.5px solid rgba(255,217,61,0.3)', color: '#ffd93d' }}>
                      {session.number}
                    </div>
                    <div className="flex-1 pb-6 pt-1.5">
                      <div className="text-sm font-semibold text-white/80">{session.title}</div>
                      <div className="mt-1 text-xs leading-relaxed text-white/45">{session.description}</div>
                      {session.date && <div className="mt-1 text-[11px] text-amber-400/40">{session.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-8 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm text-white/30">아직 등록된 구성 안내가 없습니다</p>
            </div>
          )}
        </section>

        {/* ── 상세 안내 ── */}
        <section ref={el => { sectionRefs.current['상세 안내'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">상세 안내</h2>

          {/* 모임 정보 그리드 */}
          <div className="mb-4 rounded-xl px-4 py-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              group.event_date && {
                icon: <Calendar className="h-3.5 w-3.5 text-amber-400/60" />,
                label: new Date(group.event_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }),
              },
              group.schedule && { icon: <Clock className="h-3.5 w-3.5 text-amber-400/60" />, label: group.schedule },
              group.location && {
                icon: <MapPin className="h-3.5 w-3.5 text-amber-400/60" />,
                label: `${group.location}${group.location_detail ? ` · ${group.location_detail}` : ''}`,
              },
              { icon: <Banknote className="h-3.5 w-3.5 text-amber-400/60" />, label: group.fee > 0 ? `회비 ${group.fee.toLocaleString()}원` : '무료' },
              { icon: <Users className="h-3.5 w-3.5 text-amber-400/60" />, label: `최대 ${group.max_members}명` },
            ].filter(Boolean).map((item, i) => (item &&
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(255,217,61,0.08)' }}>{item.icon}</div>
                <span className="text-sm text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 상세 안내 텍스트 */}
          {group.guide && (
            <div className="rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-sm leading-7 text-white/55 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(group.guide.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/75 font-medium">$1</strong>')) }} />
            </div>
          )}

          {/* 태그 */}
          {group.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {group.tags.map(tag => (
                <span key={tag} className="rounded-full px-3 py-1.5 text-xs text-white/40"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>#{tag}</span>
              ))}
            </div>
          )}
        </section>

        {/* ── 후기 ── */}
        <section ref={el => { sectionRefs.current['후기'] = el; }} className="pt-6 pb-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white/85">후기</h2>
            {group.reviews.length > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.round(group.reviews.reduce((s, r) => s + r.rating, 0) / group.reviews.length)} />
                <span className="text-xs text-white/40">
                  {(group.reviews.reduce((s, r) => s + r.rating, 0) / group.reviews.length).toFixed(1)}
                  <span className="ml-1">({group.reviews.length})</span>
                </span>
              </div>
            )}
          </div>

          {/* 후기 작성 버튼 — 종료된 모임 + 참여자만 */}
          {isAuthenticated && group.status === 'completed' && (joinState === 'joined' || !groupId) && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{ background: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.15)', color: 'rgba(255,217,61,0.75)' }}>
              <Star className="h-4 w-4" />후기 남기기
            </button>
          )}

          {/* 후기 작성 폼 */}
          {showReviewForm && (
            <div className="mb-4 rounded-xl px-4 py-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,217,61,0.15)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/75">후기 작성</span>
                <button onClick={() => setShowReviewForm(false)} className="text-white/25 hover:text-white/50">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* 별점 선택 */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setReviewRating(i)}>
                    <Star className="h-6 w-6"
                      style={{ fill: i <= reviewRating ? '#ffd93d' : 'transparent', color: i <= reviewRating ? '#ffd93d' : 'rgba(255,255,255,0.2)' }} />
                  </button>
                ))}
              </div>
              <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)}
                placeholder="모임 참여 경험을 솔직하게 남겨주세요"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 placeholder-white/25 resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 80 }} />
              <button onClick={handleSubmitReview} disabled={!reviewContent.trim() || reviewSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-30"
                style={{ background: '#ffd93d', color: '#1a1a2e' }}>
                <Send className="h-4 w-4" />
                {reviewSubmitting ? '제출 중...' : '후기 등록'}
              </button>
            </div>
          )}

          {/* 이전 시즌 후기 포함 안내 배너 */}
          {group.parent_group_id && group.reviews.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(255,217,61,0.05)', border: '1px solid rgba(255,217,61,0.12)' }}>
              <span className="text-[11px] text-amber-400/60">
                시즌 {(group.season_number ?? 2) - 1} 참여자들의 후기가 함께 표시됩니다
              </span>
              {group.parent_slug && (
                <Link href={`/badak/groups/${group.parent_slug}`}
                  className="ml-auto shrink-0 text-[11px] text-amber-400/50 hover:text-amber-400/80 transition-colors">
                  시즌 1 보기 →
                </Link>
              )}
            </div>
          )}

          {group.reviews.length > 0 ? (
            <div className="space-y-3">
              {group.reviews.map((review, i) => {
                const isInherited = group.parent_group_id && review.season_number != null && review.season_number < (group.season_number ?? 1);
                return (
                  <div key={review.id} className="rounded-xl px-4 py-4 space-y-2"
                    style={{
                      background: isInherited ? 'rgba(255,217,61,0.025)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isInherited ? 'rgba(255,217,61,0.08)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={review.author} avatarUrl={review.avatar_url} idx={i + 1} size={32} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/75">{review.author}</span>
                          {review.job_function && <span className="text-[11px] text-white/30">{review.job_function}</span>}
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        {isInherited && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ background: 'rgba(255,217,61,0.1)', color: 'rgba(255,217,61,0.6)', border: '1px solid rgba(255,217,61,0.15)' }}>
                            시즌 {review.season_number}
                          </span>
                        )}
                        <span className="text-[11px] text-white/20">
                          {new Date(review.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/55">{review.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">아직 후기가 없어요</p>
              <p className="mt-1 text-xs text-white/20">첫 번째 후기를 남겨보세요</p>
            </div>
          )}
        </section>

        {/* ── 참여 이력 ── */}
        <section ref={el => { sectionRefs.current['참여 이력'] = el; }} className="pt-6 pb-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white/85">내 참여 이력</h2>
            {myPastGroups.length > 0 && (
              <span className="text-xs text-white/30">총 {myPastGroups.length}개</span>
            )}
          </div>
          {!isAuthenticated ? (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">로그인하면 내 참여 이력을 볼 수 있어요</p>
            </div>
          ) : myPastLoading ? (
            <div className="space-y-2">
              {[0, 1].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : myPastGroups.length > 0 ? (
            <div className="space-y-2">
              {myPastGroups.map(pg => (
                <Link key={pg.id} href={`/badak/groups/${pg.slug}`}
                  className="flex items-center gap-3 overflow-hidden rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {pg.cover_image_url ? (
                    <img src={pg.cover_image_url} alt="" className="h-14 w-20 shrink-0 object-cover" />
                  ) : (
                    <div className="h-14 w-16 shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  )}
                  <div className="flex-1 min-w-0 py-2">
                    <p className="truncate text-sm font-medium text-white/75">{pg.title}</p>
                    {pg.schedule && (
                      <p className="mt-0.5 truncate text-[11px] text-white/30">{pg.schedule}</p>
                    )}
                  </div>
                  <div className="shrink-0 pr-3 text-right">
                    <span className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      종료됨
                    </span>
                    {pg.season_number && pg.season_number > 1 && (
                      <div className="mt-1 text-[10px]" style={{ color: 'rgba(255,217,61,0.5)' }}>
                        시즌 {pg.season_number}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">아직 완료한 모임이 없어요</p>
              <p className="mt-1 text-xs text-white/20">모임에 참여해보세요</p>
            </div>
          )}
        </section>

        {/* ── 추천 모임 ── */}
        <section ref={el => { sectionRefs.current['추천 모임'] = el; }} className="pt-6 pb-8">
          <h2 className="mb-4 text-base font-bold text-white/85">추천 모임</h2>
          {group.related.length > 0 ? (
            <div className="space-y-3">
              {group.related.map(rel => {
                const relFull = rel.current_members >= rel.max_members;
                return (
                  <Link key={rel.slug} href={`/badak/groups/${rel.slug}`}
                    className="flex items-center gap-3 overflow-hidden rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {rel.cover_image_url && (
                      <img src={rel.cover_image_url} alt="" className="h-16 w-20 shrink-0 object-cover" />
                    )}
                    <div className={`flex flex-1 min-w-0 flex-col py-3 ${rel.cover_image_url ? '' : 'px-4'}`}>
                      <p className="truncate text-sm text-white/70">{rel.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rel.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] text-white/30">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 px-3 text-right">
                      <div className="text-xs" style={{ color: relFull ? '#f87171' : 'rgba(255,255,255,0.35)' }}>
                        {rel.current_members}/{rel.max_members}명
                      </div>
                    </div>
                    <ChevronRight className="mr-3 h-4 w-4 shrink-0 text-white/20" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-6">추천할 다른 모임이 아직 없습니다</p>
          )}
        </section>
      </div>

      {/* ── 참여 신청 시트 (승인제) ── */}
      {joinState === 'applying' && (
        <div className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setJoinState('idle'); }}>
          <div className="w-full max-w-[640px] mx-auto rounded-t-2xl px-5 pb-10 pt-5 space-y-4"
            style={{ background: '#1e1e38', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white/85">참여 신청 — {group.title}</h3>
              <button onClick={() => setJoinState('idle')} className="text-white/30 hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-white/40">
              이 모임은 <span className="text-amber-400/70">승인제</span>입니다. 간단한 자기소개와 참여 동기를 남겨주세요.
            </p>
            <div className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-white/55 font-medium">신청 제출</span>
              <span className="text-white/20">→</span>
              <span className="text-white/55 font-medium">바닥장 검토 (1~2일)</span>
              <span className="text-white/20">→</span>
              <span className="text-white/55 font-medium">참여 확정 알림</span>
            </div>
            <textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)}
              placeholder="예: 퍼포먼스 마케터 3년차입니다. B2B SaaS 케이스를 함께 공부하고 싶어 신청합니다."
              className="w-full rounded-xl px-4 py-3 text-sm text-white/75 placeholder-white/25 resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 100 }} />
            <button onClick={handleApplySubmit}
              disabled={!applyMessage.trim() || isJoining}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold disabled:opacity-30"
              style={{ background: '#ffd93d', color: '#1a1a2e' }}>
              {isJoining ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e]" /> : <Send className="h-4 w-4" />}
              {isJoining ? '처리 중…' : '신청 보내기'}
            </button>
          </div>
        </div>
      )}

      {/* ── 하단 고정 CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, #1a1a2e 70%, transparent 100%)' }}>
        <div className="mx-auto max-w-[640px]">
          {joinState === 'submitted' && (
            <div className="mb-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                <p className="text-xs font-semibold text-indigo-300">신청 완료</p>
              </div>
              {/* 신청 → 검토 → 확정 흐름 */}
              <div className="flex items-center gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>① 신청 완료</span>
                <span className="text-white/20 text-xs">→</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>② 바닥장 검토</span>
                <span className="text-white/20 text-xs">→</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>③ 알림 발송</span>
              </div>
              <p className="mt-2 text-[11px] text-indigo-300/50">승인되면 알림으로 알려드릴게요. 보통 1~2일 내 검토됩니다.</p>
            </div>
          )}
          {joinState === 'waitlisted' && (
            <div className="mb-2.5 flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.15)' }}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-400/70">관심 등록 완료! 모임 개설 시 알림으로 알려드릴게요.</p>
            </div>
          )}
          <div className="flex gap-2">
            {/* 좋아요 버튼 */}
            <button onClick={handleLike}
              className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 transition-colors"
              style={{
                background: isLiked ? 'rgba(255,100,130,0.12)' : 'rgba(255,255,255,0.06)',
                border: isLiked ? '1px solid rgba(255,100,130,0.25)' : '1px solid rgba(255,255,255,0.1)',
              }}>
              <Heart className="h-5 w-5"
                style={{ color: isLiked ? '#ff6482' : 'rgba(255,255,255,0.35)', fill: isLiked ? '#ff6482' : 'none' }} />
              {likeCount > 0 && (
                <span className="text-xs font-medium" style={{ color: isLiked ? '#ff6482' : 'rgba(255,255,255,0.3)' }}>
                  {likeCount}
                </span>
              )}
            </button>
            {/* 잔여 석 */}
            {!isClosed && !isFull && (
              <div className="flex h-12 shrink-0 items-center justify-center rounded-xl px-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-xs text-white/40">잔여</span>
                <span className="ml-1 text-sm font-bold text-white/65">{group.max_members - group.current_members}</span>
                <span className="ml-0.5 text-xs text-white/30">석</span>
              </div>
            )}
            {/* 참여 CTA */}
            <button onClick={handleJoin} disabled={ctaDisabled || ctaDone || isJoining}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:cursor-default"
              style={{
                background: ctaDone ? 'rgba(255,255,255,0.06)' : ctaDisabled ? 'rgba(255,255,255,0.05)' : '#ffd93d',
                color: ctaDone ? 'rgba(255,255,255,0.35)' : ctaDisabled ? 'rgba(255,255,255,0.2)' : '#1a1a2e',
                border: ctaDone || ctaDisabled ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
              {isJoining ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e]" /> : ctaDone ? <CheckCircle2 className="h-4 w-4" /> : isNeedsGathering ? <Bell className="h-4 w-4" /> : group.join_type === 'approval' ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {isJoining ? '처리 중…' : ctaLabel}
            </button>
          </div>
          {group.fee > 0 && !ctaDone && !ctaDisabled && (
            <p className="mt-2 text-center text-[11px] text-white/25">참여 시 회비 {group.fee.toLocaleString()}원이 발생합니다</p>
          )}
          {!ctaDone && !ctaDisabled && !isNeedsGathering && (
            <p className="mt-1.5 text-center text-[11px] text-white/20">
              {group.join_type === 'approval'
                ? '승인제 · 바닥장이 신청서를 검토 후 참여 확정'
                : '선착순 · 신청 즉시 자동 확정 · 정원 차면 마감'}
            </p>
          )}
        </div>
      </div>

      {/* ── 토스트 ── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium text-white/90 shadow-xl"
          style={{ background: 'rgba(30,30,56,0.95)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* ── 바닥장 프로필 시트 ── */}
      {showLeaderProfile && group.leader && (
        <MemberProfileSheet
          memberId={group.leader.id}
          displayName={group.leader.display_name}
          job={`${group.leader.job_function} · ${group.leader.experience_years}년차`}
          isLeader
          onClose={() => setShowLeaderProfile(false)}
        />
      )}
    </div>
  );
}
