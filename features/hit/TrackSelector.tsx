'use client';

import { Megaphone, Palette, MonitorPlay, FileText, BarChart3, Star } from 'lucide-react';
import type { CompetencyTrack } from '@/types/hit';

interface TrackOption {
  id: CompetencyTrack;
  name: string;
  desc: string;
  icon: typeof Megaphone;
  riasecMatch: string[]; // RIASEC types that match this track
}

const TRACKS: TrackOption[] = [
  {
    id: 'marketing_strategy',
    name: '마케팅전략',
    desc: '시장 분석, 포지셔닝, 전략 수립',
    icon: Megaphone,
    riasecMatch: ['E', 'C', 'I'],
  },
  {
    id: 'branding',
    name: '브랜딩',
    desc: '브랜드 아이덴티티, 스토리텔링, 경험 설계',
    icon: Palette,
    riasecMatch: ['A', 'E', 'S'],
  },
  {
    id: 'advertising',
    name: '광고기획',
    desc: '캠페인 기획, 크리에이티브, 미디어 전략',
    icon: MonitorPlay,
    riasecMatch: ['A', 'E', 'I'],
  },
  {
    id: 'content',
    name: '콘텐츠',
    desc: '콘텐츠 전략, 카피라이팅, SNS 운영',
    icon: FileText,
    riasecMatch: ['A', 'S', 'E'],
  },
  {
    id: 'data_performance',
    name: '데이터/퍼포먼스',
    desc: '데이터 분석, 퍼포먼스 마케팅, 그로스해킹',
    icon: BarChart3,
    riasecMatch: ['I', 'C', 'R'],
  },
];

interface TrackSelectorProps {
  onSelect: (track: CompetencyTrack) => void;
  riasecScores?: { r: number; i: number; a: number; s: number; e: number; c: number };
}

export default function TrackSelector({ onSelect, riasecScores }: TrackSelectorProps) {
  // RIASEC 점수 기반 추천 계산
  const getRecommendScore = (track: TrackOption): number => {
    if (!riasecScores) return 0;
    const scoreMap: Record<string, number> = {
      R: riasecScores.r, I: riasecScores.i, A: riasecScores.a,
      S: riasecScores.s, E: riasecScores.e, C: riasecScores.c,
    };
    return track.riasecMatch.reduce((sum, type) => sum + (scoreMap[type] || 0), 0);
  };

  const recommendations = TRACKS.map(t => ({
    track: t,
    score: getRecommendScore(t),
  })).sort((a, b) => b.score - a.score);

  const topTrackId = riasecScores ? recommendations[0]?.track.id : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-[#E53935] text-xs font-bold mb-4">
          트랙 선택
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
          어떤 분야에 관심이 있나요?
        </h2>
        <p className="text-sm text-neutral-500">
          선택한 트랙에 맞는 심화 역량을 추가로 측정합니다
        </p>
      </div>

      <div className="space-y-3">
        {TRACKS.map((track) => {
          const isRecommended = track.id === topTrackId;
          const Icon = track.icon;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelect(track.id)}
              className={`
                relative w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left
                transition-all duration-200
                ${isRecommended
                  ? 'border-[#E53935] bg-red-50/50 hover:bg-red-50'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }
              `}
            >
              {isRecommended && (
                <div className="absolute -top-2.5 right-4 flex items-center gap-1 px-2 py-0.5 bg-[#E53935] text-white text-[10px] font-bold rounded-full">
                  <Star className="w-3 h-3" fill="currentColor" /> 추천
                </div>
              )}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isRecommended ? 'bg-[#E53935] text-white' : 'bg-neutral-100 text-neutral-500'}
              `}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-neutral-900">{track.name}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{track.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
