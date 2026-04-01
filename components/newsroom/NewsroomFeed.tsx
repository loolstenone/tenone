'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Eye, ThumbsUp, MessageSquare, Loader2, ChevronDown } from 'lucide-react';
import { getBrandMeta, getAllBrands } from '@/lib/brand-meta';

interface FeedPost {
  id: string;
  site: string;
  board: string;
  title: string;
  excerpt: string;
  represent_image: string | null;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  author_name: string | null;
  guest_nickname: string | null;
  author_type: string;
  category: string | null;
}

function formatRelative(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}일 전`;
  if (d < 30) return `${Math.floor(d / 7)}주 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function getAuthor(post: FeedPost): string {
  if (post.author_type === 'guest') return post.guest_nickname || '익명';
  return post.author_name || '관리자';
}

const MOCK_POSTS: FeedPost[] = [
  { id: 'n1', site: 'madleague', board: 'madzine', title: 'MADLeague 시즌 4 — 참가 대학 30곳 확정, 120개 팀 킥오프', excerpt: '전국 30개 대학에서 120개 팀이 참가하는 시즌 4가 4월 1일 킥오프합니다.', represent_image: null, created_at: '2026-03-30T10:00:00Z', view_count: 1240, like_count: 45, comment_count: 12, author_name: '운영팀', guest_nickname: null, author_type: 'member', category: '공지' },
  { id: 'n2', site: 'badak', board: 'community', title: '4월 네트워킹 데이 — 마케팅/광고 업계 밋업 참가 신청 오픈', excerpt: '현업 마케터, 광고인들이 모여 인사이트를 나누는 월간 네트워킹. 참여 신청 오픈!', represent_image: null, created_at: '2026-03-29T14:30:00Z', view_count: 890, like_count: 32, comment_count: 8, author_name: null, guest_nickname: '바닥 운영진', author_type: 'guest', category: '모임' },
  { id: 'n3', site: 'tenone', board: 'newsroom', title: 'Ten:One Universe 2026 비전 — 가치로 연결된 세계관', excerpt: '올해 Ten:One이 집중하는 3가지 키워드: 본질, 속도, 이행.', represent_image: null, created_at: '2026-03-28T09:00:00Z', view_count: 2100, like_count: 78, comment_count: 15, author_name: '텐원', guest_nickname: null, author_type: 'member', category: '비전' },
  { id: 'n4', site: 'rook', board: 'board', title: 'RooK AI 크리에이터 챌린지 — 수상작 발표', excerpt: 'AI를 활용한 크리에이티브 작품 100점 중 TOP 10을 선정했습니다.', represent_image: null, created_at: '2026-03-27T16:00:00Z', view_count: 560, like_count: 23, comment_count: 5, author_name: 'RooK', guest_nickname: null, author_type: 'member', category: '이벤트' },
  { id: 'n5', site: 'hero', board: 'news', title: 'HeRo HIT 통합검사 2.0 — 역량 진단의 새로운 기준', excerpt: 'AI 기반 역량 매칭 알고리즘이 업데이트되었습니다. 더 정밀한 진단을 경험하세요.', represent_image: null, created_at: '2026-03-26T11:00:00Z', view_count: 430, like_count: 19, comment_count: 3, author_name: 'HeRo', guest_nickname: null, author_type: 'member', category: '업데이트' },
  { id: 'n6', site: 'changeup', board: 'news', title: 'ChangeUp 6기 데모데이 — 5개 창업팀 투자 유치 성공', excerpt: '총 8억원 규모의 시드 투자를 유치한 ChangeUp 6기 졸업팀들의 이야기.', represent_image: null, created_at: '2026-03-25T13:00:00Z', view_count: 780, like_count: 56, comment_count: 20, author_name: 'ChangeUp', guest_nickname: null, author_type: 'member', category: '성과' },
  { id: 'n7', site: 'smarcomm', board: 'news', title: 'SmarComm GEO SEO 솔루션 — 2026 업데이트 공개', excerpt: 'AI 기반 검색 최적화 솔루션의 2026년 버전이 출시됩니다.', represent_image: null, created_at: '2026-03-24T10:00:00Z', view_count: 320, like_count: 14, comment_count: 2, author_name: 'SmarComm', guest_nickname: null, author_type: 'member', category: '업데이트' },
  { id: 'n8', site: 'youinone', board: 'news', title: 'YouInOne 신규 프로젝트 3건 런칭 — 크루 모집 중', excerpt: '디자인, 개발, 마케팅 크루를 모집합니다.', represent_image: null, created_at: '2026-03-23T09:00:00Z', view_count: 210, like_count: 9, comment_count: 1, author_name: 'YIO', guest_nickname: null, author_type: 'member', category: '모집' },
];

// 브랜드 배지
function BrandBadge({ site, category }: { site: string; category?: string | null }) {
  const meta = getBrandMeta(site);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
        {meta.name.toUpperCase()}
      </span>
      {category && (
        <span className="text-[10px] text-neutral-400">{category}</span>
      )}
    </div>
  );
}

// 메인 피처 카드 (좌측 큰 카드)
function FeatureCard({ post }: { post: FeedPost }) {
  const meta = getBrandMeta(post.site);
  return (
    <Link href={`/newsroom/${post.id}`} className="group relative block overflow-hidden" style={{ backgroundColor: 'var(--tn-surface)' }}>
      {/* 이미지 영역 */}
      <div className="aspect-[16/10] overflow-hidden" style={{ backgroundColor: 'var(--tn-surface)' }}>
        {post.represent_image ? (
          <img src={post.represent_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--tn-surface)' }}>
            <span className="text-6xl font-black" style={{ color: 'var(--tn-border)' }}>{meta.name.charAt(0)}</span>
          </div>
        )}
      </div>
      {/* 오버레이 텍스트 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
        <BrandBadge site={post.site} category={post.category} />
        <h2 className="mt-2 text-xl md:text-2xl font-black text-white leading-snug line-clamp-3 group-hover:text-neutral-200 transition-colors">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{post.excerpt}</p>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-400">
          <span>{getAuthor(post)}</span>
          <span>·</span>
          <span>{formatRelative(post.created_at)}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>
        </div>
      </div>
    </Link>
  );
}

// 편집자 추천 리스트 아이템
function EditorPickItem({ post, rank }: { post: FeedPost; rank: number }) {
  const meta = getBrandMeta(post.site);
  return (
    <Link href={`/newsroom/${post.id}`} className="group flex gap-3 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--tn-border)' }}>
      {/* 번호 */}
      <span className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-black" style={{ backgroundColor: 'var(--tn-text)', color: 'var(--tn-bg)' }}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] font-bold" style={{ color: 'var(--tn-text-sub)' }}>{meta.name.toUpperCase()}</span>
          {post.category && <span className="text-[9px]" style={{ color: 'var(--tn-text-sub)' }}>· {post.category}</span>}
        </div>
        <p className="text-xs font-semibold line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--tn-text)' }}>
          {post.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px]" style={{ color: 'var(--tn-text-sub)' }}>
          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.view_count}</span>
          <span>{formatRelative(post.created_at)}</span>
        </div>
      </div>
      {/* 썸네일 */}
      {post.represent_image && (
        <div className="shrink-0 w-16 h-12 overflow-hidden">
          <img src={post.represent_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </Link>
  );
}

// 일반 카드 (하단 그리드)
function NewsCard({ post }: { post: FeedPost }) {
  const meta = getBrandMeta(post.site);
  return (
    <Link href={`/newsroom/${post.id}`} className="group border-b pb-5" style={{ borderColor: 'var(--tn-border)' }}>
      <div className="flex gap-3">
        {/* 썸네일 */}
        <div className="shrink-0 w-24 h-16 overflow-hidden" style={{ backgroundColor: 'var(--tn-surface)' }}>
          {post.represent_image ? (
            <img src={post.represent_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg font-black" style={{ color: 'var(--tn-border)' }}>{meta.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold" style={{ color: 'var(--tn-text-sub)' }}>{meta.name.toUpperCase()}</span>
            {post.category && <span className="text-[9px]" style={{ color: 'var(--tn-text-sub)' }}>· {post.category}</span>}
          </div>
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--tn-text)' }}>
            {post.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-[10px]" style={{ color: 'var(--tn-text-sub)' }}>
            <span>{formatRelative(post.created_at)}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.view_count}</span>
            <span className="flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{post.like_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewsroomFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [brand, setBrand] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const brandList = getAllBrands();

  const loadPosts = useCallback(async (p: number, reset: boolean = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`/api/newsroom/feed?sort=latest&brand=${brand}&limit=20&page=${p}`);
      const data = await res.json();
      if (data.posts?.length > 0) {
        setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
        setHasMore(data.hasMore);
      } else if (p === 1) {
        const { isMockAllowed } = await import('@/lib/env');
        if (isMockAllowed()) setPosts(MOCK_POSTS);
        setHasMore(false);
      }
    } catch {
      const { isMockAllowed } = await import('@/lib/env');
      if (p === 1 && isMockAllowed()) setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [brand]);

  useEffect(() => {
    setPage(1);
    loadPosts(1, true);
  }, [loadPosts]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  // 인기순 (view_count 기준)
  const sorted = [...posts].sort((a, b) => b.view_count - a.view_count);
  const featured = posts[0];
  const editorPicks = sorted.slice(0, 5);
  const remaining = posts.slice(1);

  return (
    <div>
      {/* 브랜드 필터 바 */}
      <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b" style={{ borderColor: 'var(--tn-border)' }}>
        <button
          onClick={() => setBrand('all')}
          className="px-3 py-1 text-xs font-medium transition-colors border"
          style={{
            backgroundColor: brand === 'all' ? 'var(--tn-text)' : 'transparent',
            color: brand === 'all' ? 'var(--tn-bg)' : 'var(--tn-text-sub)',
            borderColor: brand === 'all' ? 'var(--tn-text)' : 'var(--tn-border)',
          }}>
          전체
        </button>
        {brandList.filter(b => b.code !== 'tenone').map(b => (
          <button
            key={b.code}
            onClick={() => setBrand(b.code)}
            className="px-3 py-1 text-xs font-medium transition-colors border"
            style={{
              backgroundColor: brand === b.code ? 'var(--tn-text)' : 'transparent',
              color: brand === b.code ? 'var(--tn-bg)' : 'var(--tn-text-sub)',
              borderColor: brand === b.code ? 'var(--tn-text)' : 'var(--tn-border)',
            }}>
            {b.meta.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--tn-text-sub)' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--tn-text-sub)' }}>
          <p className="text-sm">아직 게시된 소식이 없습니다</p>
        </div>
      ) : (
        <>
          {/* 메인 섹션: 피처(좌) + 편집자 추천(우) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border mb-8" style={{ borderColor: 'var(--tn-border)' }}>
            {/* 피처 카드 */}
            {featured && (
              <div className="lg:col-span-2 border-r" style={{ borderColor: 'var(--tn-border)' }}>
                <FeatureCard post={featured} />
              </div>
            )}

            {/* 편집자 추천 */}
            <div className="flex flex-col">
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--tn-border)' }}>
                <p className="text-xs font-black tracking-widest" style={{ color: 'var(--tn-text)' }}>편집자가 집은 기사</p>
              </div>
              <div className="px-4 flex-1">
                {editorPicks.map((post, i) => (
                  <EditorPickItem key={post.id} post={post} rank={i + 1} />
                ))}
              </div>
            </div>
          </div>

          {/* 최신 뉴스 섹션 */}
          {remaining.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b" style={{ borderColor: 'var(--tn-border)' }}>
                <span className="w-1 h-5" style={{ backgroundColor: 'var(--tn-text)' }} />
                <h2 className="text-sm font-black tracking-widest" style={{ color: 'var(--tn-text)' }}>최신 소식</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
                {remaining.map(post => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* 더 보기 */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 text-sm border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--tn-border)', color: 'var(--tn-text-sub)' }}>
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                더 보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
