'use client';

import { useState } from 'react';
import { Heart, TrendingUp, TrendingDown, MessageSquare, MapPin, Star } from 'lucide-react';
import { useWIO } from '../../layout';

const NPS_HISTORY = [
  { month: '2025-10', score: 42 }, { month: '2025-11', score: 48 }, { month: '2025-12', score: 45 },
  { month: '2026-01', score: 52 }, { month: '2026-02', score: 58 }, { month: '2026-03', score: 62 },
];

const MOCK_VOC = [
  { id: 'V01', customer: '김태현', content: '앱 속도가 많이 개선되었어요. 감사합니다!', sentiment: 'positive', category: '서비스', date: '2026-03-28', score: 5 },
  { id: 'V02', customer: '이수진', content: '배송이 예상보다 하루 늦었습니다.', sentiment: 'negative', category: '배송', date: '2026-03-27', score: 2 },
  { id: 'V03', customer: '최서연', content: '고객센터 응대가 친절했어요', sentiment: 'positive', category: '지원', date: '2026-03-27', score: 5 },
  { id: 'V04', customer: '오지훈', content: 'API 문서가 더 상세했으면 좋겠습니다', sentiment: 'neutral', category: '기술', date: '2026-03-26', score: 3 },
  { id: 'V05', customer: '한동훈', content: '결제 과정이 너무 복잡해요', sentiment: 'negative', category: '결제', date: '2026-03-26', score: 2 },
  { id: 'V06', customer: '박지민', content: '신규 기능이 딱 필요했던 거였어요', sentiment: 'positive', category: '서비스', date: '2026-03-25', score: 4 },
  { id: 'V07', customer: '강민수', content: '가격 대비 괜찮은 서비스입니다', sentiment: 'neutral', category: '가격', date: '2026-03-25', score: 3 },
  { id: 'V08', customer: '윤미래', content: '모바일 UI가 데스크톱과 너무 달라요', sentiment: 'negative', category: 'UX', date: '2026-03-24', score: 2 },
];

const JOURNEY_STEPS = [
  { step: '인지', channels: ['SNS광고', '검색'], satisfaction: 78, dropoff: 15 },
  { step: '관심', channels: ['웹사이트', '블로그'], satisfaction: 72, dropoff: 22 },
  { step: '가입', channels: ['회원가입'], satisfaction: 65, dropoff: 30 },
  { step: '구매', channels: ['장바구니', '결제'], satisfaction: 70, dropoff: 18 },
  { step: '사용', channels: ['앱', '대시보드'], satisfaction: 82, dropoff: 8 },
  { step: '재구매', channels: ['이메일', '푸시'], satisfaction: 85, dropoff: 5 },
];

const SENTIMENT_MAP: Record<string, { label: string; color: string }> = {
  positive: { label: '긍정', color: 'text-emerald-400 bg-emerald-500/10' },
  neutral: { label: '중립', color: 'text-slate-400 bg-slate-500/10' },
  negative: { label: '부정', color: 'text-red-400 bg-red-500/10' },
};

export default function CXPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [vocFilter, setVocFilter] = useState('all');

  const currentNPS = NPS_HISTORY[NPS_HISTORY.length - 1].score;
  const prevNPS = NPS_HISTORY[NPS_HISTORY.length - 2].score;
  const npsDiff = currentNPS - prevNPS;

  const sentimentStats = {
    positive: MOCK_VOC.filter(v => v.sentiment === 'positive').length,
    neutral: MOCK_VOC.filter(v => v.sentiment === 'neutral').length,
    negative: MOCK_VOC.filter(v => v.sentiment === 'negative').length,
  };

  const filteredVOC = MOCK_VOC.filter(v => vocFilter === 'all' || v.sentiment === vocFilter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">고객경험</h1>
        <p className="text-xs text-slate-500 mt-0.5">CRM-CX &middot; NPS, VOC, 여정맵</p>
      </div>

      {/* NPS + 만족도 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">NPS 점수</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-indigo-400">{currentNPS}</span>
            <span className={`flex items-center gap-0.5 text-xs font-medium ${npsDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {npsDiff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{npsDiff >= 0 ? '+' : ''}{npsDiff}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">평균 만족도</p>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={16} className={i <= 3.5 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
            ))}
            <span className="text-lg font-bold ml-2">3.5</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">VOC 감정 분포</p>
          <div className="flex gap-3 mt-2">
            <span className="text-sm"><span className="text-emerald-400 font-bold">{sentimentStats.positive}</span> 긍정</span>
            <span className="text-sm"><span className="text-slate-400 font-bold">{sentimentStats.neutral}</span> 중립</span>
            <span className="text-sm"><span className="text-red-400 font-bold">{sentimentStats.negative}</span> 부정</span>
          </div>
        </div>
      </div>

      {/* NPS 추이 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">NPS 추이</h2>
        <div className="flex items-end gap-2 h-32">
          {NPS_HISTORY.map(h => (
            <div key={h.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400 font-medium">{h.score}</span>
              <div className="w-full rounded-t bg-indigo-500/60" style={{ height: `${(h.score / 80) * 100}%` }} />
              <span className="text-[9px] text-slate-600">{h.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 고객 여정맵 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">고객 여정맵</h2>
        <div className="flex gap-1 overflow-x-auto">
          {JOURNEY_STEPS.map((j, idx) => (
            <div key={j.step} className="flex-1 min-w-[120px]">
              <div className="text-center">
                <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${j.satisfaction >= 80 ? 'bg-emerald-500/20 text-emerald-400' : j.satisfaction >= 70 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {j.satisfaction}
                </div>
                <p className="text-xs font-medium mt-1.5">{j.step}</p>
                <p className="text-[10px] text-slate-600">{j.channels.join(', ')}</p>
                <p className="text-[10px] text-red-400 mt-0.5">이탈 {j.dropoff}%</p>
              </div>
              {idx < JOURNEY_STEPS.length - 1 && (
                <div className="h-0.5 bg-white/5 mt-3" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VOC 목록 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">VOC 목록</h2>
        <div className="flex gap-1">
          {['all', 'positive', 'neutral', 'negative'].map(f => (
            <button key={f} onClick={() => setVocFilter(f)}
              className={`text-[10px] px-2.5 py-1 rounded-full ${vocFilter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
              {f === 'all' ? '전체' : SENTIMENT_MAP[f].label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filteredVOC.map(v => {
          const sm = SENTIMENT_MAP[v.sentiment];
          return (
            <div key={v.id} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <MessageSquare size={16} className="text-slate-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{v.customer}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sm.color}`}>{sm.label}</span>
                  <span className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded bg-white/5">{v.category}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{v.content}</p>
                <p className="text-xs text-slate-600 mt-1">{v.date}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={10} className={i <= v.score ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
