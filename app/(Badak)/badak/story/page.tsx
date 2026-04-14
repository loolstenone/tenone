'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight, Quote, TrendingUp, Briefcase, Star,
  Heart, MessageCircle, Bookmark, Share2,
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string | null;
  before_role: string | null;
  after_role: string | null;
  created_at: string;
  member: { display_name: string; avatar_url: string | null; job_function: string | null } | null;
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: '바닥에서 만난 개발자 덕분에 사이드 프로젝트가 회사가 됐어요',
    content: '마케터로 5년 일하면서 늘 "내 서비스를 만들고 싶다"는 생각을 했어요. 바닥 모임에서 개발자를 만났고, 3개월 만에 MVP를 출시했습니다. 지금은 시드 투자까지 받았어요.',
    before_role: '마케터',
    after_role: '스타트업 대표',
    created_at: '2026-03-15',
    member: { display_name: '최민지', avatar_url: null, job_function: '마케팅' },
  },
  {
    id: '2',
    title: '에이전시에서 인하우스로, 바닥이 다리가 되어줬어요',
    content: '광고 에이전시 7년차, 인하우스로 이직하고 싶었지만 업계가 좁아서 쉽지 않았어요. 바닥 이직 모임에서 현직 인하우스 마케터들의 리얼한 이야기를 듣고, 결국 원하던 곳에 합류했습니다.',
    before_role: '에이전시 AE',
    after_role: '인하우스 브랜드 매니저',
    created_at: '2026-02-28',
    member: { display_name: '박서연', avatar_url: null, job_function: '광고' },
  },
  {
    id: '3',
    title: '팀장이 된 후 가장 도움이 된 건 바닥 리더십 모임이었어요',
    content: '제조업에서 팀장이 됐는데, 사수도 없고 매뉴얼도 없었어요. 바닥에서 "팀장 1년차 모임"을 발견하고 참여했는데, 같은 고민을 하는 사람들이 이렇게 많다니. 매달 모여서 서로의 경험을 나누고 있어요.',
    before_role: '실무자',
    after_role: '팀장 2년차',
    created_at: '2026-01-20',
    member: { display_name: '이준호', avatar_url: null, job_function: '제조' },
  },
  {
    id: '4',
    title: '프리랜서 전환, 혼자였으면 절대 못 했어요',
    content: '회사에서 10년 일하고 프리랜서로 전환하려니 막막했어요. 바닥 "프리랜서 전환" 모임에서 계약서 작성법, 단가 책정, 클라이언트 관리까지 실전 노하우를 배웠습니다. 지금은 월 수입이 회사 다닐 때보다 30% 올랐어요.',
    before_role: '디자이너 (회사원)',
    after_role: '프리랜서 디자이너',
    created_at: '2025-12-10',
    member: { display_name: '김하늘', avatar_url: null, job_function: '디자인' },
  },
  {
    id: '5',
    title: '해외 진출 꿈, 바닥 네트워킹이 현실로 만들어줬어요',
    content: '동남아 시장에 진출하고 싶었지만 현지 정보가 전혀 없었어요. 바닥 "해외 마케팅" 모임에서 베트남 현지 마케터와 연결되어 3개월 만에 파일럿 캠페인을 론칭했습니다.',
    before_role: '국내 마케터',
    after_role: '글로벌 마케팅 매니저',
    created_at: '2025-11-05',
    member: { display_name: '정유진', avatar_url: null, job_function: '마케팅' },
  },
];

const CATEGORY_COLORS = [
  { bg: 'rgba(255,217,61,0.08)', border: 'rgba(255,217,61,0.15)', accent: '#ffd93d' },
  { bg: 'rgba(116,185,255,0.08)', border: 'rgba(116,185,255,0.15)', accent: '#74b9ff' },
  { bg: 'rgba(162,155,254,0.08)', border: 'rgba(162,155,254,0.15)', accent: '#a29bfe' },
  { bg: 'rgba(255,118,117,0.08)', border: 'rgba(255,118,117,0.15)', accent: '#ff7675' },
  { bg: 'rgba(0,206,201,0.08)', border: 'rgba(0,206,201,0.15)', accent: '#00cec9' },
];

export default function StoryPage() {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/badak/stories')
      .then((r) => r.json())
      .then((data) => { if (data.stories?.length > 0) setStories(data.stories); })
      .catch(() => {});
  }, []);

  const toggleLike = (id: string) => setLiked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSave = (id: string) => setSaved((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">성장 스토리</h1>
          </div>
          <p className="text-xs text-white/40">바닥에서 만남이 만들어낸 변화의 이야기</p>
        </div>

        {/* 스탯 카드 */}
        <div className="mb-6 flex gap-2">
          {[
            { label: '성장 스토리', value: `${stories.length}건`, icon: Star },
            { label: '직무 전환', value: '12건', icon: Briefcase },
            { label: '누적 응원', value: '248', icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-1 items-center gap-2 rounded-xl border border-white/8 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Icon className="h-4 w-4 text-white/20" />
              <div>
                <div className="text-xs font-bold text-white/70">{value}</div>
                <div className="text-[9px] text-white/25">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 스토리 목록 */}
        <div className="space-y-4">
          {stories.map((story, idx) => {
            const c = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const member = story.member;
            const isLiked = liked.has(story.id);
            const isSaved = saved.has(story.id);

            return (
              <div key={story.id} className="overflow-hidden rounded-2xl border transition-all hover:border-white/15"
                style={{ background: c.bg, borderColor: c.border }}>
                <div className="p-5">
                  {/* 전환 뱃지 */}
                  {story.before_role && story.after_role && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white/50"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        {story.before_role}
                      </span>
                      <ArrowRight className="h-3 w-3" style={{ color: c.accent }} />
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${c.accent}20`, color: c.accent }}>
                        {story.after_role}
                      </span>
                    </div>
                  )}

                  {/* 제목 */}
                  <div className="mb-3 flex gap-2">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accent, opacity: 0.5 }} />
                    <h2 className="text-[15px] font-bold leading-snug text-white">{story.title}</h2>
                  </div>

                  {/* 본문 */}
                  {story.content && (
                    <p className="mb-4 pl-6 text-xs leading-relaxed text-white/45">{story.content}</p>
                  )}

                  {/* 하단: 프로필 + 액션 */}
                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: `${c.accent}20`, color: c.accent }}>
                        {member?.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/70">{member?.display_name}</div>
                        <div className="text-[10px] text-white/30">{member?.job_function}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleLike(story.id)} className="flex items-center gap-1 text-[10px] text-white/30 transition-colors hover:text-red-400">
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                        {isLiked ? '응원!' : '응원'}
                      </button>
                      <button onClick={() => toggleSave(story.id)} className="text-white/30 transition-colors hover:text-amber-400">
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 내 스토리 제출 CTA */}
        <div className="mt-8 rounded-2xl border border-white/8 p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Quote className="mx-auto mb-2 h-6 w-6 text-amber-400/30" />
          <p className="mb-1 text-sm font-bold text-white/60">당신의 성장 스토리를 들려주세요</p>
          <p className="mb-4 text-xs text-white/30">바닥에서의 경험이 누군가에게 용기가 됩니다</p>
          <button className="rounded-xl px-5 py-2.5 text-xs font-bold"
            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
            스토리 보내기
          </button>
        </div>
      </div>
    </div>
  );
}
