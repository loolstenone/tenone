'use client';

import { useState } from 'react';
import {
  Brain, AlertTriangle, TrendingUp, Sparkles, MessageSquare, Activity,
  ShieldAlert, Info, CheckCircle2, Clock, Send, Loader2,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── AI 분석 도구 4종 ── */
const AI_TOOLS = [
  { icon: ShieldAlert, label: '이상 탐지', desc: '데이터 이상 패턴 자동 감지', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: TrendingUp, label: '트렌드 예측', desc: '시계열 기반 미래 예측', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Sparkles, label: '추천 엔진', desc: '행동 기반 개인화 추천', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: MessageSquare, label: '자연어 리포트', desc: '질문하면 AI가 분석 리포트 생성', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

/* ── 이상 탐지 최근 감지 ── */
type Severity = 'high' | 'medium' | 'low';
const ANOMALIES: { date: string; module: string; desc: string; severity: Severity }[] = [
  { date: '2026-03-28', module: '영업', desc: '3월 신규 리드 전환율 급락 (18% → 7%)', severity: 'high' },
  { date: '2026-03-26', module: '재무', desc: '마케팅팀 3월 비용 예산 120% 초과 집행', severity: 'high' },
  { date: '2026-03-25', module: '인사', desc: '개발팀 야근 시간 전월 대비 45% 증가', severity: 'medium' },
  { date: '2026-03-23', module: '프로젝트', desc: 'HeRo 프로젝트 마일스톤 2주 지연', severity: 'medium' },
  { date: '2026-03-20', module: '콘텐츠', desc: '블로그 트래픽 주간 30% 감소', severity: 'low' },
];

const SEV_STYLE: Record<Severity, { label: string; color: string }> = {
  high: { label: '심각', color: 'text-red-400 bg-red-500/10' },
  medium: { label: '주의', color: 'text-amber-400 bg-amber-500/10' },
  low: { label: '참고', color: 'text-blue-400 bg-blue-500/10' },
};

/* ── 트렌드 예측 ── */
const FORECAST = {
  current: 12.4,
  predicted: 13.8,
  low: 12.1,
  high: 15.5,
  confidence: 82,
};

/* ── AI 모델 현황 ── */
const AI_MODELS = [
  { name: '고객 이탈 예측', accuracy: 89.2, lastTrained: '2026-03-15', status: 'active' as const },
  { name: '매출 예측', accuracy: 84.7, lastTrained: '2026-03-20', status: 'active' as const },
  { name: '콘텐츠 추천', accuracy: 78.3, lastTrained: '2026-03-10', status: 'training' as const },
  { name: '감성 분석', accuracy: 91.5, lastTrained: '2026-03-22', status: 'active' as const },
];

/* ── 자연어 질의 Mock 응답 ── */
const NL_RESPONSES: Record<string, string> = {
  default: '지난 분기 마케팅 ROI는 324%로, 전분기(287%) 대비 12.9% 상승했습니다.\n\n주요 요인:\n- 콘텐츠 마케팅 전환율 28% 향상\n- 유료 광고 CPA 15% 절감\n- SNS 오가닉 도달률 2배 증가\n\n권고: 콘텐츠 마케팅 예산을 20% 증액하면 다음 분기 ROI 350% 달성 가능합니다.',
};

export default function AIEnginePage() {
  const { tenant, isDemo } = useWIO();
  const [query, setQuery] = useState('지난 분기 마케팅 ROI');
  const [aiResponse, setAiResponse] = useState('');
  const [querying, setQuerying] = useState(false);

  const handleQuery = () => {
    if (!query.trim()) return;
    setQuerying(true);
    setAiResponse('');
    // Mock: 타이핑 효과
    const response = NL_RESPONSES.default;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 3;
      setAiResponse(response.slice(0, idx));
      if (idx >= response.length) {
        clearInterval(interval);
        setQuerying(false);
      }
    }, 20);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">AI 분석 엔진</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI 기반 데이터 분석 도구</p>
        </div>
        {isDemo && <span className="text-xs text-amber-400/60 bg-amber-500/10 px-2.5 py-1 rounded-full">데모 데이터</span>}
      </div>

      {/* AI 도구 4종 카드 */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {AI_TOOLS.map((tool, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${tool.bg} mb-3`}>
              <tool.icon size={18} className={tool.color} />
            </div>
            <div className="text-sm font-semibold mb-1">{tool.label}</div>
            <p className="text-xs text-slate-500">{tool.desc}</p>
          </div>
        ))}
      </div>

      {/* 이상 탐지 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} className="text-red-400" />
          <h2 className="text-sm font-semibold">최근 감지된 이상</h2>
        </div>
        <div className="space-y-2">
          {ANOMALIES.map((a, i) => {
            const sev = SEV_STYLE[a.severity];
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5 border border-white/5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 mt-0.5 ${sev.color}`}>{sev.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-600">{a.date}</span>
                    <span className="text-[10px] text-slate-600">|</span>
                    <span className="text-[10px] text-slate-500">{a.module}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 트렌드 예측 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-emerald-400" />
            <h2 className="text-sm font-semibold">다음 분기 매출 예측</h2>
          </div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-emerald-400">{FORECAST.predicted}억</div>
            <p className="text-xs text-slate-500 mt-1">예측 매출 (신뢰도 {FORECAST.confidence}%)</p>
          </div>
          {/* 신뢰구간 바 */}
          <div className="relative h-8 rounded-lg bg-white/5 overflow-hidden mb-3">
            {/* 범위 */}
            <div className="absolute top-0 h-full bg-emerald-500/15 rounded"
              style={{ left: `${(FORECAST.low / 20) * 100}%`, width: `${((FORECAST.high - FORECAST.low) / 20) * 100}%` }} />
            {/* 현재 */}
            <div className="absolute top-0 h-full w-0.5 bg-slate-400"
              style={{ left: `${(FORECAST.current / 20) * 100}%` }} />
            {/* 예측 */}
            <div className="absolute top-1 bottom-1 w-1 bg-emerald-400 rounded-full"
              style={{ left: `${(FORECAST.predicted / 20) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>하한 {FORECAST.low}억</span>
            <span>현재 {FORECAST.current}억</span>
            <span>상한 {FORECAST.high}억</span>
          </div>
        </div>

        {/* AI 모델 현황 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={15} className="text-violet-400" />
            <h2 className="text-sm font-semibold">AI 모델 현황</h2>
          </div>
          <div className="space-y-3">
            {AI_MODELS.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                      {m.status === 'active' ? '운영중' : '학습중'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Activity size={10} className="text-slate-500" />
                      <span className="text-[10px] text-slate-500">정확도 {m.accuracy}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-slate-500" />
                      <span className="text-[10px] text-slate-500">{m.lastTrained}</span>
                    </div>
                  </div>
                </div>
                {/* 정확도 바 */}
                <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden shrink-0">
                  <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${m.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 자연어 질의 */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={15} className="text-blue-400" />
          <h2 className="text-sm font-semibold">자연어 질의</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
            placeholder="궁금한 것을 물어보세요..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
          <button onClick={handleQuery} disabled={querying}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5">
            {querying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            질의
          </button>
        </div>
        {aiResponse && (
          <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-xs text-indigo-400 font-semibold">AI 분석 결과</span>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{aiResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
