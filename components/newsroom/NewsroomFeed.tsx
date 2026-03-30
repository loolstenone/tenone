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

// Mock 데이터 (DB 데이터 없을 때)
const MOCK_POSTS: FeedPost[] = [
  { id: 'n1', site: 'madleague', board: 'madzine', title: 'MADLeague 시즌 4 — 참가 대학 30곳 확정', excerpt: '전국 30개 대학에서 120개 팀이 참가하는 시즌 4가 4월 1일 킥오프합니다.', represent_image: null, created_at: '2026-03-30T10:00:00Z', view_count: 1240, like_count: 45, comment_count: 12, author_name: '운영팀', guest_nickname: null, author_type: 'member', category: '공지' },
  { id: 'n2', site: 'badak', board: 'community', title: '4월 네트워킹 데이 — 마케팅/광고 업계 밋업', excerpt: '현업 마케터, 광고인들이 모여 인사이트를 나누는 월간 네트워킹. 참여 신청 오픈!', represent_image: null, created_at: '2026-03-29T14:30:00Z', view_count: 890, like_count: 32, comment_count: 8, author_name: null, guest_nickname: '바닥 운영진', author_type: 'guest', category: '모임' },
  { id: 'n3', site: 'tenone', board: 'newsroom', title: 'Ten:One Universe 2026 비전 — 가치로 연결된 세계관', excerpt: '올해 Ten:One이 집중하는 3가지 키워드: 본질, 속도, 이행.', represent_image: null, created_at: '2026-03-28T09:00:00Z', view_count: 2100, like_count: 78, comment_count: 15, author_name: '텐원', guest_nickname: null, author_type: 'member', category: '비전' },
  { id: 'n4', site: 'rook', board: 'board', title: 'RooK AI 크리에이터 챌린지 — 수상작 발표', excerpt: 'AI를 활용한 크리에이티브 작품 100점 중 TOP 10을 선정했습니다.', represent_image: null, created_at: '2026-03-27T16:00:00Z', view_count: 560, like_count: 23, comment_count: 5, author_name: 'RooK', guest_nickname: null, author_type: 'member', category: '이벤트' },
  { id: 'n5', site: 'hero', board: 'news', title: 'HeRo HIT 통합검사 2.0 — 역량 진단의 새로운 기준', excerpt: 'AI 기반 역량 매칭 알고리즘이 업데이트되었습니다. 더 정밀한 진단을 경험하세요.', represent_image: null, created_at: '2026-03-26T11:00:00Z', view_count: 430, like_count: 19, comment_count: 3, author_name: 'HeRo', guest_nickname: null, author_type: 'member', category: '업데이트' },
  { id: 'n6', site: 'changeup', board: 'news', title: 'ChangeUp 6기 데모데이 — 5개 창업팀 투자 유치 성공', excerpt: '총 8억원 규모의 시드 투자를 유치한 ChangeUp 6기 졸업팀들의 이야기.', represent_image: null, created_at: '2026-03-25T13:00:00Z', view_count: 780, like_count: 56, comment_count: 20, author_name: 'ChangeUp', guest_nickname: null, author_type: 'member', category: '성과' },
];

export default function NewsroomFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [brand, setBrand] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const brands = getAllBrands();

  const loadPosts = useCallback(async (p: number, reset: boolean = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`/api/newsroom/feed?sort=${sort}&brand=${brand}&limit=12&page=${p}`);
      const data = await res.json();
      if (data.posts?.length > 0) {
        setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
        setHasMore(data.hasMore);
      } else if (p === 1) {
        setPosts(MOCK_POSTS);
        setHasMore(false);
      }
    } catch {
      if (p === 1) setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, brand]);

  useEffect(() => {
    setPage(1);
    loadPosts(1, true);
  }, [loadPosts]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  return (
    <div>
      {/* 필터 바 */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setBrand('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${brand === 'all' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}>
            전체
          </button>
          {brands.filter(b => b.code !== 'tenone').map(b => (
            <button key={b.code} onClick={() => setBrand(b.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${brand === b.code ? `${b.meta.bgColor} ${b.meta.textColor}` : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${b.meta.dotColor}`} />
              {b.meta.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-neutral-800 rounded-full p-0.5">
          <button onClick={() => setSort('latest')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${sort === 'latest' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
            최신순
          </button>
          <button onClick={() => setSort('popular')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${sort === 'popular' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
            인기순
          </button>
        </div>
      </div>

      {/* 로딩 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => {
              const meta = getBrandMeta(post.site);
              const href = post.site === 'tenone'
                ? `/newsroom?postId=${post.id}`
                : `${meta.boardPath}?postId=${post.id}`;
              const isExternal = post.site !== 'tenone';

              return (
                <Link
                  key={post.id}
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden hover:border-neutral-600 transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* 대표 이미지 */}
                  {post.represent_image ? (
                    <div className="aspect-[16/9] bg-neutral-800 overflow-hidden">
                      <img src={post.represent_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                      <span className="text-3xl font-black text-neutral-700">{meta.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* 본문 */}
                  <div className="p-4">
                    {/* 브랜드 배지 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                        {meta.name}
                      </span>
                      {post.category && (
                        <span className="text-[10px] text-neutral-500">{post.category}</span>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-2 group-hover:text-neutral-200 transition-colors">
                      {post.title}
                    </h3>

                    {/* 발췌 */}
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                      {post.excerpt || ''}
                    </p>

                    {/* 메타 */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.like_count}</span>
                        {post.comment_count > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count}</span>}
                      </div>
                      <span>{formatRelative(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 더 보기 */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors disabled:opacity-50">
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                더 보기
              </button>
            </div>
          )}

          {posts.length === 0 && (
            <div className="text-center py-20 text-neutral-500">
              <p className="text-sm">아직 게시된 소식이 없습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
