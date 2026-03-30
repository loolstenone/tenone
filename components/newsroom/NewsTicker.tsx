'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBrandMeta } from '@/lib/brand-meta';

interface TickerItem {
  id: string;
  site: string;
  title: string;
  created_at: string;
}

export default function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch('/api/newsroom/feed?sort=latest&limit=20')
      .then(r => r.json())
      .then(data => {
        if (data.posts?.length > 0) {
          setItems(data.posts.map((p: any) => ({
            id: p.id,
            site: p.site,
            title: p.title,
            created_at: p.created_at,
          })));
        } else {
          // 데이터 없으면 Mock
          setItems([
            { id: 't1', site: 'madleague', title: 'MADLeague 시즌 4 참가팀 모집 시작', created_at: '' },
            { id: 't2', site: 'badak', title: '4월 네트워킹 데이 — 마케팅/광고 업계 밋업', created_at: '' },
            { id: 't3', site: 'tenone', title: 'Ten:One Universe 2026 비전 발표', created_at: '' },
            { id: 't4', site: 'rook', title: 'RooK AI 크리에이터 챌린지 결과 발표', created_at: '' },
            { id: 't5', site: 'hero', title: 'HeRo HIT 검사 2.0 업데이트 출시', created_at: '' },
            { id: 't6', site: 'changeup', title: 'ChangeUp 6기 창업팀 데모데이 개최', created_at: '' },
            { id: 't7', site: 'ogamja', title: '0gamja AI 콘텐츠 100만 조회 달성', created_at: '' },
            { id: 't8', site: 'youinone', title: 'YouInOne 신규 프로젝트 3건 런칭', created_at: '' },
          ]);
        }
      })
      .catch(() => {
        setItems([
          { id: 't1', site: 'tenone', title: 'Ten:One Universe 뉴스룸 오픈', created_at: '' },
          { id: 't2', site: 'madleague', title: 'MADLeague 시즌 4 모집 중', created_at: '' },
          { id: 't3', site: 'badak', title: 'Badak 4월 밋업 안내', created_at: '' },
        ]);
      });
  }, []);

  if (items.length === 0) return null;

  // 이중 복제로 무한 스크롤 효과
  const doubled = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-neutral-900 border-y border-neutral-800">
      <div className="flex items-center">
        {/* LIVE 배지 */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 border-r border-neutral-700 z-10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-400 tracking-wider">LIVE</span>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${items.length * 4}s`,
            }}
          >
            {doubled.map((item, i) => {
              const brand = getBrandMeta(item.site);
              const href = item.site === 'tenone'
                ? `/newsroom?postId=${item.id}`
                : `${brand.boardPath}?postId=${item.id}`;
              return (
                <Link
                  key={`${item.id}-${i}`}
                  href={href}
                  className="flex items-center gap-2 shrink-0 py-2.5 group"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${brand.dotColor} shrink-0`} />
                  <span className={`text-[11px] font-semibold ${brand.textColor} shrink-0`}>{brand.name}</span>
                  <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}
