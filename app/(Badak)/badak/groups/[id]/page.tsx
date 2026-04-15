'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Banknote, ChevronRight } from 'lucide-react';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';

interface GroupDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  meeting_type: 'once' | 'recurring' | null;
  max_members: number;
  current_members: number;
  event_date: string | null;
  schedule: string | null;
  location: string | null;
  location_detail: string | null;
  fee: number;
  tags: string[];
  cover_image_url: string | null;
  leader: { id: string; display_name: string; job_function: string; experience_years: number; bio?: string | null } | null;
  need: { id: string; display_text: string; count: number } | null;
}

// ── Mock 상세 데이터 (API 없을 때 fallback) ──
const MOCK_DETAIL: Record<string, GroupDetail> = {
  g1: {
    id: 'g1', title: 'B2B 마케팅 실무 모임',
    description: 'B2B SaaS 마케팅 전략과 실무를 나누는 정기 모임입니다.\n\n퍼포먼스 마케팅부터 콘텐츠 마케팅, ABM 전략까지 함께 배우고 경험을 나눕니다.\n\n• 매주 1명이 실제 캠페인 케이스를 발표\n• 자유 토론 및 피드백\n• 업계 네트워킹',
    status: 'recruiting', meeting_type: 'recurring', max_members: 20, current_members: 13,
    event_date: '2026-04-26T14:00:00', schedule: '매주 토 14:00', location: '강남역', location_detail: '스타벅스 강남점 2층',
    fee: 0, tags: ['B2B', '마케팅', 'SaaS', '실무'],
    cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l1', display_name: '마케터J', job_function: '퍼포먼스 마케팅', experience_years: 3, bio: 'B2B SaaS 스타트업 3년차 마케터. 리드 제너레이션과 콘텐츠 마케팅을 함께 고민합니다.' },
    need: { id: 'n1', display_text: 'B2B 마케팅 같이 공부하고 싶어', count: 28 },
  },
  g2: {
    id: 'g2', title: '카피라이팅 같이 연습할래?',
    description: '광고 카피, SNS 카피, 브랜드 슬로건 등 카피라이팅 실력을 함께 키워봐요.\n\n매주 하나의 테마로 각자 카피를 써오고, 피드백을 주고받습니다.',
    status: 'confirmed', meeting_type: 'recurring', max_members: 12, current_members: 12,
    event_date: '2026-04-20T19:00:00', schedule: '매주 일 19:00', location: '성수동', location_detail: null,
    fee: 5000, tags: ['카피', '글쓰기', '광고'],
    cover_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l2', display_name: '카피장인', job_function: '브랜드 마케터', experience_years: 7, bio: null },
    need: { id: 'n2', display_text: '카피라이팅 스터디', count: 35 },
  },
  g5: {
    id: 'g5', title: 'AI 프롬프트 엔지니어링 스터디',
    description: 'ChatGPT, Claude 등 AI 도구를 마케팅에 실제로 활용하는 방법을 공부합니다.\n\n• 매주 과제 기반 실습\n• 최신 AI 마케팅 트렌드 공유\n• 실무 프롬프트 라이브러리 구축',
    status: 'recruiting', meeting_type: 'recurring', max_members: 15, current_members: 11,
    event_date: '2026-04-27T15:00:00', schedule: '매주 일 15:00', location: '강남역', location_detail: '패스트파이브 강남점',
    fee: 10000, tags: ['AI', '프롬프트', 'ChatGPT', '마케팅'],
    cover_image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l5', display_name: 'AI마스터', job_function: '그로스 마케터', experience_years: 5, bio: 'AI 마케팅 전도사. 프롬프트 엔지니어링으로 업무 효율 10배 향상 경험을 나눕니다.' },
    need: { id: 'n5', display_text: 'AI 마케팅 같이 공부하고 싶어', count: 45 },
  },
  g3: {
    id: 'g3', title: 'SNS 콘텐츠 기획 & 제작 스터디',
    description: '인스타그램·유튜브·틱톡 콘텐츠 기획부터 촬영, 편집까지 함께 배워요.\n\n• 매주 한 플랫폼 집중 분석\n• 실제 콘텐츠 만들어보고 피드백\n• 팔로워 성장 전략 공유',
    status: 'recruiting', meeting_type: 'recurring', max_members: 10, current_members: 6,
    event_date: '2026-04-25T19:30:00', schedule: '격주 금 19:30', location: '홍대입구', location_detail: '공유오피스 3층',
    fee: 0, tags: ['SNS', '콘텐츠', '인스타그램', '유튜브'],
    cover_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l3', display_name: '콘텐츠크리에이터K', job_function: 'SNS 마케터', experience_years: 4, bio: '현직 SNS 마케터. 인스타 팔로워 10만 달성 노하우를 나눕니다.' },
    need: { id: 'n3', display_text: 'SNS 콘텐츠 같이 만들고 싶어', count: 22 },
  },
  g4: {
    id: 'g4', title: '퍼포먼스 마케팅 케이스 스터디',
    description: '페이스북/구글/카카오 광고 실전 케이스를 함께 분석합니다.\n\n실제 집행 데이터 기반으로 ROAS 개선 포인트를 찾고, 최적화 전략을 공유합니다.',
    status: 'needs_gathering', meeting_type: 'recurring', max_members: 12, current_members: 4,
    event_date: null, schedule: '월 2회 (일정 미정)', location: '온라인', location_detail: null,
    fee: 0, tags: ['퍼포먼스', 'Facebook광고', '구글광고', 'ROAS'],
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l4', display_name: '광고전문P', job_function: '퍼포먼스 마케터', experience_years: 6, bio: null },
    need: { id: 'n4', display_text: '퍼포먼스 마케팅 실무 배우고 싶어', count: 17 },
  },
  g6: {
    id: 'g6', title: '스타트업 마케터 네트워킹 클럽',
    description: '스타트업에서 일하는 마케터들의 정보 교류 모임입니다.\n\n규모는 달라도 고민은 비슷해요. 번아웃, 리소스 부족, ROI 증명… 함께 헤쳐나가요.',
    status: 'recruiting', meeting_type: 'recurring', max_members: 20, current_members: 14,
    event_date: '2026-05-03T18:00:00', schedule: '월 1회 토 18:00', location: '합정역', location_detail: '루프탑 카페',
    fee: 15000, tags: ['스타트업', '네트워킹', '마케터'],
    cover_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l6', display_name: '스타트업마케터S', job_function: '그로스 마케터', experience_years: 5, bio: '시리즈B 스타트업 마케팅 리드. 0→1 마케팅 경험 공유.' },
    need: { id: 'n6', display_text: '스타트업 마케터끼리 만나고 싶어', count: 33 },
  },
  g7: {
    id: 'g7', title: '브랜드 전략 독서 모임',
    description: '브랜딩, 마케팅 전략 관련 책을 함께 읽고 토론합니다.\n\n매월 1권 선정 → 각자 읽고 → 인상 깊은 구절 + 실무 연결점 발표',
    status: 'confirmed', meeting_type: 'recurring', max_members: 8, current_members: 8,
    event_date: '2026-04-28T20:00:00', schedule: '월 1회 월 20:00', location: '교대역', location_detail: null,
    fee: 0, tags: ['브랜딩', '독서', '전략'],
    cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l7', display_name: '브랜드스토리텔러', job_function: '브랜드 매니저', experience_years: 8, bio: '브랜드를 이야기로 만드는 사람.' },
    need: { id: 'n7', display_text: '브랜드 전략 같이 공부하고 싶어', count: 14 },
  },
  g8: {
    id: 'g8', title: '데이터 분석 마케터 모임',
    description: 'GA4, Mixpanel, Amplitude 등 마케팅 분석 도구를 함께 공부합니다.\n\n데이터 드리븐 마케팅을 지향하는 분들의 실무 스터디',
    status: 'confirmed', meeting_type: 'once', max_members: 10, current_members: 10,
    event_date: '2026-04-19T14:00:00', schedule: null, location: '삼성역', location_detail: null,
    fee: 15000, tags: ['데이터', 'GA4', '분석'],
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=860&h=320&fit=crop&auto=format',
    leader: { id: 'l8', display_name: '데이터M', job_function: '데이터 분석가', experience_years: 4, bio: null },
    need: { id: 'n8', display_text: '데이터 분석 배우고 싶어', count: 19 },
  },
};

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [showLeaderProfile, setShowLeaderProfile] = useState(false);

  useEffect(() => {
    fetch(`/api/badak/groups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.group) setGroup(data.group);
        else {
          const mock = MOCK_DETAIL[id];
          if (mock) setGroup(mock);
        }
      })
      .catch(() => {
        const mock = MOCK_DETAIL[id];
        if (mock) setGroup(mock);
      });
  }, [id]);

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="text-sm text-white/30">로딩 중...</div>
      </div>
    );
  }

  const isFull = group.current_members >= group.max_members;
  const isClosed = group.status === 'closed' || group.status === 'ended';
  const leader = group.leader;

  return (
    <div className="mx-auto min-h-screen max-w-[860px] bg-[#1a1a2e] pt-14 text-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <Link href="/badak/groups" className="text-white/30 hover:text-white/60">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{group.title}</h1>
      </div>

      {/* 커버 이미지 */}
      {group.cover_image_url ? (
        <img
          src={group.cover_image_url}
          alt=""
          className={`h-48 w-full object-cover ${isClosed ? 'opacity-40 grayscale' : ''}`}
        />
      ) : (
        <div
          className={`h-28 w-full ${isClosed ? 'opacity-40' : ''}`}
          style={{ background: 'linear-gradient(135deg, rgba(255,217,61,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(59,130,246,0.08) 100%)' }}
        />
      )}

      {/* 컨텐츠 */}
      <div className="px-5 pb-16 pt-5 space-y-5">

        {/* 상태 + 타입 배지 */}
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: group.status === 'recruiting' ? 'rgba(74,222,128,0.1)' : group.status === 'confirmed' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.06)',
              color: group.status === 'recruiting' ? '#4ade80' : group.status === 'confirmed' ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
            }}
          >
            {group.status === 'recruiting' ? '모집중' : group.status === 'confirmed' ? '확정' : '마감'}
          </span>
          {group.meeting_type && (
            <span className="inline-flex items-center rounded-full bg-white/6 px-3 py-1 text-xs text-white/40">
              {group.meeting_type === 'recurring' ? '🔁 정기 모임' : '1️⃣ 1회 모임'}
            </span>
          )}
        </div>

        {/* 연결된 니즈 */}
        {group.need && (
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,217,61,0.05)', border: '1px solid rgba(255,217,61,0.12)' }}
          >
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/50">이 모임의 니즈</div>
            <p className="text-sm text-white/70">"{group.need.display_text}"</p>
            <p className="mt-0.5 text-[11px] text-white/30">{group.need.count}명이 같은 니즈를 가지고 있어요</p>
          </div>
        )}

        {/* 설명 */}
        {group.description && (
          <div
            className="rounded-xl border border-white/6 px-4 py-4"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <p className="text-sm leading-relaxed text-white/55 whitespace-pre-line">{group.description}</p>
          </div>
        )}

        {/* 바닥장 — 클릭 시 공개 프로필 시트 오픈 */}
        {leader && (
          <button
            type="button"
            onClick={() => setShowLeaderProfile(true)}
            className="w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-amber-400/20"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
            >
              {leader.display_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/85">{leader.display_name}</span>
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">바닥장</span>
              </div>
              <div className="mt-0.5 text-xs text-white/35">{leader.job_function} · {leader.experience_years}년차</div>
              {leader.bio && (
                <p className="mt-2 text-xs leading-relaxed text-white/40 line-clamp-2">{leader.bio}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/20 mt-1" />
          </button>
        )}

        {/* 모임 세부 정보 */}
        <div
          className="rounded-xl border border-white/8 px-4 py-4 space-y-3"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">모임 정보</h3>

          {group.event_date && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
              <span className="text-sm text-white/60">
                {new Date(group.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  weekday: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          )}
          {group.schedule && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
              <span className="text-sm text-white/60">{group.schedule}</span>
            </div>
          )}
          {group.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
              <span className="text-sm text-white/60">
                {group.location}{group.location_detail ? ` · ${group.location_detail}` : ''}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 shrink-0 text-white/20" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: isFull ? '#f87171' : 'rgba(255,255,255,0.6)' }}>
                  {group.current_members}/{group.max_members}명
                  {isFull && <span className="ml-2 text-xs text-red-400">마감 임박</span>}
                </span>
                <span className="text-xs text-white/25">{group.max_members - group.current_members}자리 남음</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${(group.current_members / group.max_members) * 100}%`,
                    background: isFull ? '#f87171' : 'linear-gradient(90deg, #ffd93d, #ff9f43)',
                  }}
                />
              </div>
            </div>
          </div>
          {group.fee > 0 && (
            <div className="flex items-center gap-3">
              <Banknote className="h-4 w-4 shrink-0 text-white/20" />
              <span className="text-sm text-white/60">{group.fee.toLocaleString()}원</span>
            </div>
          )}
        </div>

        {/* 태그 */}
        {group.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {group.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs text-white/40"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 바닥장 공개 프로필 시트 */}
      {showLeaderProfile && leader && (
        <MemberProfileSheet
          memberId={leader.id}
          displayName={leader.display_name}
          job={`${leader.job_function} · ${leader.experience_years}년차`}
          isLeader
          onClose={() => setShowLeaderProfile(false)}
        />
      )}
    </div>
  );
}
