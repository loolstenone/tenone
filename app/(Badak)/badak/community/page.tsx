'use client';

import { useState } from 'react';
import { MessageCircle, Heart, PenLine, Clock, Eye, MessageSquare, Star, Lightbulb } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';

type BoardType = 'chat' | 'review' | 'proposal';

interface Post {
  id: string;
  board: BoardType;
  title: string;
  preview: string;
  author: string;
  authorJob: string;
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  tags?: string[];
  // review 전용
  groupName?: string;
  rating?: number;
  // proposal 전용
  targetMembers?: number;
  interestedCount?: number;
}

const BOARD_ICONS: Record<BoardType, React.ReactNode> = {
  chat: <MessageSquare className="h-4 w-4" />,
  review: <Star className="h-4 w-4" />,
  proposal: <Lightbulb className="h-4 w-4" />,
};

const BOARDS: { key: BoardType; label: string; desc: string }[] = [
  { key: 'chat', label: '수다', desc: '자유롭게 이야기해요' },
  { key: 'review', label: '모임 후기', desc: '모임 경험을 나눠요' },
  { key: 'proposal', label: '모임 제안', desc: '새로운 모임을 제안해요' },
];

// ── Mock 데이터 ──
const MOCK_POSTS: Post[] = [
  // 수다
  {
    id: 'c1', board: 'chat', title: '마케팅 직무전환 하신 분 계신가요?',
    preview: '개발 5년차인데 마케팅으로 전환 고민 중입니다. 비슷한 경험 있으신 분 조언 부탁드려요...',
    author: '전환러', authorJob: '개발자', createdAt: '2시간 전',
    likes: 12, comments: 8, views: 156, tags: ['직무전환', '마케팅'],
  },
  {
    id: 'c2', board: 'chat', title: '프리랜서 전향 1년차 후기',
    preview: '회사 다니다가 프리랜서로 전향한 지 1년. 솔직한 후기 남깁니다. 수입은...',
    author: '자유인', authorJob: '프리랜서 마케터', createdAt: '5시간 전',
    likes: 34, comments: 21, views: 489, tags: ['프리랜서', '후기'],
  },
  {
    id: 'c3', board: 'chat', title: '요즘 채용 시장 어떤가요?',
    preview: '4월인데 채용 공고가 작년보다 확 줄은 느낌... 다들 체감 어떠세요?',
    author: '구직중', authorJob: '콘텐츠 마케터', createdAt: '8시간 전',
    likes: 28, comments: 15, views: 342,
  },
  {
    id: 'c4', board: 'chat', title: '마케터가 알아야 할 AI 툴 추천',
    preview: 'ChatGPT 말고도 실무에서 진짜 쓸만한 AI 도구들 정리해봤습니다.',
    author: 'AI덕후', authorJob: '퍼포먼스 마케터', createdAt: '1일 전',
    likes: 67, comments: 32, views: 1204, tags: ['AI', '툴추천'],
  },
  {
    id: 'c5', board: 'chat', title: '연봉협상 팁 공유합니다',
    preview: '이직하면서 연봉 30% 올린 경험담입니다. 핵심은 타이밍과 데이터...',
    author: '협상왕', authorJob: 'CRM 마케터', createdAt: '2일 전',
    likes: 89, comments: 45, views: 2103, tags: ['연봉', '이직'],
  },

  // 모임 후기
  {
    id: 'r1', board: 'review', title: '소셜미디어 트렌드 분석 모임 다녀왔어요!',
    preview: '지난 토요일 소셜미디어 트렌드 같이 분석하는 모임 다녀왔는데, 정말 유익했습니다. 특히...',
    author: '소셜러', authorJob: '소셜미디어 마케터', createdAt: '1일 전',
    likes: 23, comments: 7, views: 218, groupName: '소셜미디어 트렌드 같이 분석', rating: 5,
    tags: ['소셜미디어', '트렌드'],
  },
  {
    id: 'r2', board: 'review', title: '카피라이팅 스터디 3회차 후기',
    preview: '매주 화요일 진행하는 카피라이팅 스터디, 벌써 3회차! 실전 과제가 정말 도움 됩니다.',
    author: '카피장인', authorJob: '브랜드 마케터', createdAt: '3일 전',
    likes: 18, comments: 11, views: 167, groupName: '카피라이팅 같이 연습할래?', rating: 4,
    tags: ['카피라이팅', '스터디'],
  },
  {
    id: 'r3', board: 'review', title: 'B2B 마케팅 네트워킹 후기 (강남)',
    preview: 'B2B 마케터들끼리 모여서 고민 나누는 시간이었어요. 같은 고민을 하는 사람들이 이렇게 많다니...',
    author: 'B2B전문', authorJob: 'B2B 마케터', createdAt: '5일 전',
    likes: 31, comments: 14, views: 298, groupName: 'B2B 마케팅 해본 사람?', rating: 5,
    tags: ['B2B', '네트워킹'],
  },

  // 모임 제안
  {
    id: 'p1', board: 'proposal', title: '주말 마케팅 북클럽 같이 해요!',
    preview: '격주 토요일, 마케팅 관련 책 한 권 읽고 토론하는 모임 만들고 싶어요. 관심 있으신 분?',
    author: '독서광', authorJob: '콘텐츠 마케터', createdAt: '3시간 전',
    likes: 15, comments: 9, views: 132, targetMembers: 10, interestedCount: 6,
    tags: ['북클럽', '마케팅'],
  },
  {
    id: 'p2', board: 'proposal', title: '포트폴리오 피드백 교환 모임',
    preview: '서로의 포트폴리오를 봐주고 피드백하는 모임을 제안합니다. 이직 준비하시는 분들 특히 환영!',
    author: '포폴러', authorJob: '디지털 마케터', createdAt: '1일 전',
    likes: 42, comments: 18, views: 387, targetMembers: 8, interestedCount: 8,
    tags: ['포트폴리오', '피드백'],
  },
  {
    id: 'p3', board: 'proposal', title: '데이터 분석 입문 스터디 (SQL부터)',
    preview: 'SQL 기초부터 GA4 분석까지, 마케터를 위한 데이터 분석 스터디 모집합니다.',
    author: '데이터맨', authorJob: '그로스 마케터', createdAt: '2일 전',
    likes: 56, comments: 24, views: 612, targetMembers: 12, interestedCount: 9,
    tags: ['데이터', 'SQL', 'GA4'],
  },
  {
    id: 'p4', board: 'proposal', title: '마케터 사이드 프로젝트 팀 구합니다',
    preview: '실제 제품/서비스를 기획하고 마케팅까지 해보는 사이드 프로젝트팀을 모집합니다.',
    author: '사이드', authorJob: 'PM', createdAt: '4일 전',
    likes: 38, comments: 16, views: 445, targetMembers: 6, interestedCount: 4,
    tags: ['사이드프로젝트', '기획'],
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function PostCard({ post }: { post: Post }) {
  return (
    <div className="group rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.06]">
      {/* 태그 */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 모임 후기: 모임명 뱃지 */}
      {post.board === 'review' && post.groupName && (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
            {post.groupName}
          </span>
          {post.rating && (
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5"
                  style={{
                    color: i < post.rating! ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                    fill: i < post.rating! ? '#fbbf24' : 'none',
                  }}
                />
              ))}
            </span>
          )}
        </div>
      )}

      {/* 제목 */}
      <h3 className="mb-1 text-sm font-semibold text-white/90 group-hover:text-white">
        {post.title}
      </h3>

      {/* 미리보기 */}
      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/40">
        {post.preview}
      </p>

      {/* 모임 제안: 모집 현황 */}
      {post.board === 'proposal' && post.targetMembers && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-white/30">관심 표현</span>
            <span className="font-medium text-white/50">
              {post.interestedCount}<span className="text-white/25">/{post.targetMembers}명</span>
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, ((post.interestedCount || 0) / post.targetMembers) * 100)}%`,
                background: (post.interestedCount || 0) >= post.targetMembers
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
              }}
            />
          </div>
        </div>
      )}

      {/* 하단 메타 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/50">
            {post.author.charAt(0)}
          </div>
          <span className="text-[11px] text-white/50">{post.author}</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/25">{post.authorJob}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/25">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" /> {formatNumber(post.views)}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" /> {post.likes}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" /> {post.comments}
          </span>
        </div>
      </div>

      {/* 시간 */}
      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/15">
        <Clock className="h-2.5 w-2.5" />
        {post.createdAt}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [activeBoard, setActiveBoard] = useState<BoardType>('chat');
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated } = useAuth();

  const filteredPosts = MOCK_POSTS.filter((p) => p.board === activeBoard);
  const activeInfo = BOARDS.find((b) => b.key === activeBoard)!;

  const handleWrite = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    // TODO: 글쓰기 모달/페이지
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="mb-1 text-lg font-bold text-white">커뮤니티</h1>
          <p className="text-xs text-white/40">바닥 멤버들과 자유롭게 소통하세요</p>
        </div>

        {/* 보드 탭 */}
        <div className="mb-5 flex gap-2">
          {BOARDS.map((board) => {
            const isActive = activeBoard === board.key;
            const count = MOCK_POSTS.filter((p) => p.board === board.key).length;
            return (
              <button
                key={board.key}
                onClick={() => setActiveBoard(board.key)}
                className="flex-1 rounded-xl border px-3 py-3 text-left transition-all"
                style={{
                  background: isActive ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="mb-1" style={{ color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                  {BOARD_ICONS[board.key]}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.7)' }}
                >
                  {board.label}
                </div>
                <div className="text-[10px]" style={{ color: isActive ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.25)' }}>
                  {count}개 글
                </div>
              </button>
            );
          })}
        </div>

        {/* 보드 설명 + 글쓰기 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40">
            {BOARD_ICONS[activeBoard]}
            <span className="text-xs">{activeInfo.desc}</span>
          </div>
          <button
            onClick={handleWrite}
            className="flex items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
          >
            <PenLine className="h-3.5 w-3.5" />
            글쓰기
          </button>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-2.5">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredPosts.length === 0 && (
          <div className="py-20 text-center">
            <div className="mb-2 flex justify-center text-white/20">{BOARD_ICONS[activeBoard]}</div>
            <div className="text-sm text-white/40">아직 작성된 글이 없어요</div>
            <div className="mt-1 text-xs text-white/20">첫 번째 글을 남겨보세요!</div>
          </div>
        )}
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
