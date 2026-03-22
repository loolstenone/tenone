'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ExternalLink, BookOpen, Lightbulb } from 'lucide-react';
import { GUIDES } from '@/lib/smarcomm/guide-data';

export default function GuidePage() {
  const [activeGuideId, setActiveGuideId] = useState(GUIDES[0].id);
  const router = useRouter();

  const guide = GUIDES.find(g => g.id === activeGuideId)!;

  // 카테고리별 그룹핑
  const categories = Array.from(new Set(GUIDES.map(g => g.category)));

  return (
    <div className="flex gap-0 -m-6">
      {/* 좌측: 목차 사이드바 */}
      <div className="w-56 shrink-0 border-r border-border bg-white p-5 min-h-[calc(100vh-56px)] overflow-y-auto">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-text">
          <BookOpen size={16} /> 서비스 가이드
        </h2>

        {categories.map(cat => (
          <div key={cat} className="mb-4">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{cat}</div>
            {GUIDES.filter(g => g.category === cat).map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGuideId(g.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeGuideId === g.id
                    ? 'bg-surface font-semibold text-text'
                    : 'text-text-sub hover:bg-surface hover:text-text'
                }`}
              >
                {g.title.replace(/하기$/, '').replace(/하기$/, '')}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* 우측: 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          {/* 브레드크럼 */}
          <div className="mb-4 flex items-center gap-1 text-xs text-text-muted">
            <span>서비스 가이드</span>
            <ChevronRight size={10} />
            <span>{guide.category}</span>
            <ChevronRight size={10} />
            <span className="text-text-sub">{guide.title}</span>
          </div>

          {/* 타이틀 */}
          <h1 className="mb-2 text-2xl font-bold text-text">{guide.title}</h1>
          <p className="mb-8 text-sm text-text-sub leading-relaxed">{guide.description}</p>

          {/* Step별 콘텐츠 */}
          <div className="space-y-8">
            {guide.steps.map((step, i) => (
              <div key={i} className="relative">
                {/* 스텝 번호 + 라인 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="mb-2 text-base font-bold text-text">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-text-sub">{step.content}</p>

                    {/* 팁 */}
                    {step.tip && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                        <Lightbulb size={14} className="mt-0.5 shrink-0 text-warning" />
                        <span className="text-xs text-text-sub">{step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 연결선 */}
                {i < guide.steps.length - 1 && (
                  <div className="ml-4 mt-2 h-6 w-px bg-border" />
                )}
              </div>
            ))}
          </div>

          {/* 관련 링크 */}
          <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">관련 페이지</h3>
            <div className="flex flex-wrap gap-2">
              {guide.relatedLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => router.push(link.href)}
                  className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-text-sub transition-colors hover:text-text"
                >
                  {link.label}
                  <ExternalLink size={10} />
                </button>
              ))}
            </div>
          </div>

          {/* 피드백 */}
          <div className="mt-6 text-center text-xs text-text-muted">
            이 가이드가 도움이 되었나요?{' '}
            <button className="font-medium text-text-sub hover:text-text">Yes</button>
            {' / '}
            <button className="font-medium text-text-sub hover:text-text">No</button>
          </div>
        </div>
      </div>
    </div>
  );
}
