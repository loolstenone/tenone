'use client';

import { useState } from 'react';
import { Smile, Frown, Meh, Bell, Hash, TrendingUp, MessageCircle } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_SENTIMENT = { positive: 62, neutral: 25, negative: 13, total: 4820 };

const MOCK_KEYWORDS = [
  { word: '혁신적', count: 342, sentiment: 'positive' },
  { word: '편리한', count: 289, sentiment: 'positive' },
  { word: '가격', count: 256, sentiment: 'neutral' },
  { word: '느림', count: 198, sentiment: 'negative' },
  { word: '디자인', count: 187, sentiment: 'positive' },
  { word: '고객지원', count: 165, sentiment: 'neutral' },
  { word: '추천', count: 154, sentiment: 'positive' },
  { word: '오류', count: 132, sentiment: 'negative' },
  { word: '업데이트', count: 121, sentiment: 'neutral' },
  { word: '만족', count: 118, sentiment: 'positive' },
  { word: '경쟁사', count: 98, sentiment: 'neutral' },
  { word: '불편', count: 87, sentiment: 'negative' },
];

const MOCK_TREND = [
  { date: '3/23', positive: 58, neutral: 28, negative: 14 },
  { date: '3/24', positive: 61, neutral: 26, negative: 13 },
  { date: '3/25', positive: 55, neutral: 30, negative: 15 },
  { date: '3/26', positive: 64, neutral: 24, negative: 12 },
  { date: '3/27', positive: 60, neutral: 27, negative: 13 },
  { date: '3/28', positive: 63, neutral: 25, negative: 12 },
  { date: '3/29', positive: 62, neutral: 25, negative: 13 },
];

const MOCK_ALERTS = [
  { id: 1, type: 'negative_spike', message: '3/25 부정 감성 15% 급증 - "서비스 장애" 관련 멘션 증가', time: '3/25 14:30' },
  { id: 2, type: 'keyword', message: '"오류" 키워드 전주 대비 40% 증가', time: '3/27 09:00' },
  { id: 3, type: 'positive', message: '"혁신적" 긍정 멘션 연속 3일 증가 추세', time: '3/28 10:00' },
];

const SENTIMENT_COLOR: Record<string, string> = { positive: 'text-emerald-400', neutral: 'text-slate-400', negative: 'text-red-400' };
const SENTIMENT_BG: Record<string, string> = { positive: 'bg-emerald-500', neutral: 'bg-slate-500', negative: 'bg-red-500' };

export default function SentimentPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">감성 분석</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-SEN &middot; 브랜드 감성 모니터링 및 키워드 분석</p>
        </div>
      </div>

      {/* 감성 도넛 + 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col items-center justify-center">
          {/* 도넛 차트 (CSS) */}
          <div className="relative w-32 h-32 mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(239 68 68 / 0.3)" strokeWidth="3"
                strokeDasharray={`${MOCK_SENTIMENT.negative} ${100 - MOCK_SENTIMENT.negative}`} strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(148 163 184 / 0.5)" strokeWidth="3"
                strokeDasharray={`${MOCK_SENTIMENT.neutral} ${100 - MOCK_SENTIMENT.neutral}`} strokeDashoffset={`-${MOCK_SENTIMENT.negative}`} />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(52 211 153)" strokeWidth="3"
                strokeDasharray={`${MOCK_SENTIMENT.positive} ${100 - MOCK_SENTIMENT.positive}`} strokeDashoffset={`-${MOCK_SENTIMENT.negative + MOCK_SENTIMENT.neutral}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold">{MOCK_SENTIMENT.total.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">총 멘션</div>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><Smile size={12} className="text-emerald-400" /> 긍정 {MOCK_SENTIMENT.positive}%</span>
            <span className="flex items-center gap-1"><Meh size={12} className="text-slate-400" /> 중립 {MOCK_SENTIMENT.neutral}%</span>
            <span className="flex items-center gap-1"><Frown size={12} className="text-red-400" /> 부정 {MOCK_SENTIMENT.negative}%</span>
          </div>
        </div>

        {/* 트렌드 */}
        <div className="md:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={14} /> 감성 추이 (7일)</h2>
          <div className="space-y-2">
            {MOCK_TREND.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-10">{d.date}</span>
                <div className="flex-1 flex h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${d.positive}%` }} />
                  <div className="bg-slate-500 h-full" style={{ width: `${d.neutral}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${d.negative}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 w-8 text-right">{d.positive}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 키워드 클라우드 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Hash size={14} /> 주요 키워드</h2>
        <div className="flex flex-wrap gap-2">
          {MOCK_KEYWORDS.map((k, i) => {
            const size = Math.max(12, Math.min(24, 10 + k.count / 30));
            return (
              <span key={i} className={`px-3 py-1 rounded-full border border-white/5 ${SENTIMENT_COLOR[k.sentiment]}`}
                style={{ fontSize: `${size}px` }}>
                {k.word} <span className="text-[10px] opacity-50">{k.count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 알림 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Bell size={14} /> 알림</h2>
        <div className="space-y-2">
          {MOCK_ALERTS.map(a => (
            <div key={a.id} className={`flex items-start gap-3 rounded-lg border p-3 ${a.type === 'negative_spike' ? 'border-red-500/20 bg-red-500/5' : a.type === 'positive' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
              <MessageCircle size={14} className={`mt-0.5 ${a.type === 'negative_spike' ? 'text-red-400' : a.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="flex-1">
                <div className="text-xs">{a.message}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
