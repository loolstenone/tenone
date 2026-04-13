'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string | null;
  before_role: string | null;
  after_role: string | null;
  created_at: string;
  member: { display_name: string; avatar_url: string | null; job_function: string | null } | null;
}

// Mock stories for Phase 0
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
];

export default function StoryPage() {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);

  useEffect(() => {
    fetch('/api/badak/stories')
      .then((r) => r.json())
      .then((data) => {
        if (data.stories?.length > 0) setStories(data.stories);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-[860px] bg-white text-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-6">
        <Link href="/badak" className="text-neutral-900/60 hover:text-neutral-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Next Stage 스토리</h1>
      </div>

      <div className="px-6 pb-4">
        <p className="text-sm text-neutral-900/40">
          바닥에서 만남이 만들어낸 성장 이야기
        </p>
      </div>

      {/* Stories */}
      <div className="space-y-4 px-5 pb-20">
        {stories.map((story) => {
          const member = story.member as Story['member'];
          return (
            <div
              key={story.id}
              className="rounded-2xl border border-white/8 bg-white/4 p-6"
            >
              <div className="mb-4 inline-block rounded-full bg-[#74b9ff]/10 px-3 py-1 text-[11px] font-semibold text-[#74b9ff]">
                Next Stage 스토리
              </div>

              <h2 className="mb-3 text-base font-bold leading-snug">
                &ldquo;{story.title}&rdquo;
              </h2>

              {story.content && (
                <p className="mb-4 text-sm text-neutral-900/50 leading-relaxed">
                  {story.content}
                </p>
              )}

              <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #74b9ff, #a29bfe)', color: '#1a1a2e' }}
                >
                  {member?.display_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-sm font-medium">{member?.display_name}</div>
                  <div className="text-xs text-neutral-900/40">
                    前 {story.before_role} → 現 {story.after_role}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
