'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Target, BarChart3, Star, Users, MessageSquare,
  ChevronDown, ChevronUp, TrendingUp, Award
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
type EvalTab = 'self' | 'manager' | 'peer' | 'subordinate';

const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  A: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  B: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  D: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const EVAL_TABS: { id: EvalTab; label: string }[] = [
  { id: 'self', label: '자기평가' },
  { id: 'manager', label: '상사평가' },
  { id: 'peer', label: '동료평가' },
  { id: 'subordinate', label: '부하평가' },
];

const MOCK_GOALS = [
  { id: '1', title: 'WIO 프로덕트 MVP 출시', weight: 40, achievement: 85, comment: 'Q1 내 MVP 출시 완료, 사용자 피드백 수집 중' },
  { id: '2', title: '팀 개발 프로세스 개선', weight: 30, achievement: 70, comment: 'CI/CD 파이프라인 구축 완료, 코드리뷰 문화 정착 중' },
  { id: '3', title: '신규 고객 3사 온보딩', weight: 30, achievement: 100, comment: '3사 온보딩 완료, 추가 2사 진행중' },
];

const CORE_VALUES = [
  { id: '1', name: '혁신', description: '새로운 방법을 시도하고 변화를 주도한다', score: 4 },
  { id: '2', name: '협업', description: '팀원과 적극적으로 소통하고 협력한다', score: 5 },
  { id: '3', name: '성장', description: '끊임없이 학습하고 역량을 키운다', score: 4 },
  { id: '4', name: '책임', description: '맡은 일에 책임감을 갖고 완수한다', score: 3 },
  { id: '5', name: '고객중심', description: '고객의 입장에서 생각하고 행동한다', score: 4 },
];

const MOCK_MULTI: Record<EvalTab, { evaluator: string; grade: Grade; comment: string }[]> = {
  self: [{ evaluator: '나', grade: 'A', comment: '목표 달성률이 높고, 특히 고객 온보딩에서 초과 달성했습니다.' }],
  manager: [{ evaluator: '팀장 이영수', grade: 'A', comment: '프로젝트 리딩 능력이 뛰어나고, 팀 문화 개선에 기여했습니다.' }],
  peer: [
    { evaluator: '동료 박지민', grade: 'B', comment: '협업이 원활하고 항상 도움을 줍니다.' },
    { evaluator: '동료 김하늘', grade: 'A', comment: '기술적 역량이 뛰어나고 코드리뷰가 도움이 됩니다.' },
  ],
  subordinate: [{ evaluator: '팀원 최수진', grade: 'A', comment: '방향을 잘 잡아주시고 성장할 수 있도록 도와주십니다.' }],
};

const MOCK_FEEDBACK_HISTORY = [
  { date: '2026-03-15', from: '팀장 이영수', type: '성과', content: 'MVP 출시 일정을 잘 관리해주셨습니다.' },
  { date: '2026-02-28', from: '동료 박지민', type: '역량', content: '기술 세미나 발표가 인상적이었습니다.' },
  { date: '2026-02-10', from: '팀장 이영수', type: '성과', content: '고객사 미팅에서 좋은 인상을 남겼습니다.' },
  { date: '2026-01-20', from: '동료 김하늘', type: '협업', content: '코드리뷰 피드백이 항상 도움이 됩니다.' },
];

export default function EvaluationPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<typeof MOCK_GOALS>([]);
  const [coreValues, setCoreValues] = useState<typeof CORE_VALUES>([]);
  const [multiEval, setMultiEval] = useState<typeof MOCK_MULTI | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<typeof MOCK_FEEDBACK_HISTORY>([]);
  const [activeTab, setActiveTab] = useState<EvalTab>('self');
  const [showFeedback, setShowFeedback] = useState(false);

  // Supabase에서 평가 데이터 로드
  const loadEvaluations = useCallback(async () => {
    if (isDemo) {
      setGoals(MOCK_GOALS);
      setCoreValues(CORE_VALUES);
      setMultiEval(MOCK_MULTI);
      setFeedbackHistory(MOCK_FEEDBACK_HISTORY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('evaluations')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        // DB 데이터에서 평가 항목 매핑
        const row = data[0]; // 최신 평가 기간
        setGoals(Array.isArray(row.goals) ? row.goals : MOCK_GOALS);
        setCoreValues(Array.isArray(row.core_values) ? row.core_values : CORE_VALUES);
        setMultiEval(row.multi_eval || MOCK_MULTI);
        setFeedbackHistory(Array.isArray(row.feedback_history) ? row.feedback_history : MOCK_FEEDBACK_HISTORY);
      } else {
        setGoals(MOCK_GOALS);
        setCoreValues(CORE_VALUES);
        setMultiEval(MOCK_MULTI);
        setFeedbackHistory(MOCK_FEEDBACK_HISTORY);
      }
    } catch {
      setGoals(MOCK_GOALS);
      setCoreValues(CORE_VALUES);
      setMultiEval(MOCK_MULTI);
      setFeedbackHistory(MOCK_FEEDBACK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    if (!tenant) return;
    loadEvaluations();
  }, [tenant, loadEvaluations]);

  const weightedScore = goals.reduce((s, g) => s + (g.achievement * g.weight / 100), 0);
  const avgCoreValue = coreValues.length > 0 ? (coreValues.reduce((s, c) => s + c.score, 0) / coreValues.length).toFixed(1) : '0';
  const overallGrade: Grade = weightedScore >= 90 ? 'S' : weightedScore >= 80 ? 'A' : weightedScore >= 70 ? 'B' : weightedScore >= 60 ? 'C' : 'D';

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">통합평가</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">통합평가</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-EVL+ | 2026 상반기</p>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${GRADE_COLORS[overallGrade]}`}>
          <Award size={16} />
          <span className="text-sm font-bold">종합 {overallGrade}등급</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Performance (What) */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Target size={15} className="text-indigo-400" /> 성과평가 (What)
            </h2>
            <span className="text-xs text-slate-500">가중 점수: <span className="text-indigo-400 font-bold">{weightedScore.toFixed(1)}</span>점</span>
          </div>
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="rounded-lg bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">가중치 {g.weight}%</span>
                    <span className={`text-sm font-bold ${g.achievement >= 80 ? 'text-emerald-400' : g.achievement >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {g.achievement}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${g.achievement >= 80 ? 'bg-emerald-500' : g.achievement >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(g.achievement, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400">{g.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Competency (How) */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Star size={15} className="text-amber-400" /> 역량평가 (How)
            </h2>
            <span className="text-xs text-slate-500">평균: <span className="text-amber-400 font-bold">{avgCoreValue}</span>/5.0</span>
          </div>
          <div className="space-y-3">
            {coreValues.map(cv => (
              <div key={cv.id} className="flex items-center gap-3">
                <div className="w-20 shrink-0">
                  <div className="text-sm font-medium">{cv.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{cv.description}</div>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`h-6 flex-1 rounded ${s <= cv.score ? 'bg-amber-500/60' : 'bg-white/5'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold w-8 text-right">{cv.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-rater */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users size={15} className="text-blue-400" /> 다면평가
          </h2>
          <div className="flex gap-1.5 mb-4">
            {EVAL_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {multiEval && (
            <div className="space-y-2">
              {multiEval[activeTab].map((ev, i) => (
                <div key={i} className="rounded-lg bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{ev.evaluator}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${GRADE_COLORS[ev.grade]}`}>{ev.grade}</span>
                  </div>
                  <p className="text-xs text-slate-400">{ev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback History */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <button onClick={() => setShowFeedback(!showFeedback)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare size={15} className="text-emerald-400" /> 피드백 히스토리
            </h2>
            {showFeedback ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showFeedback && (
            <div className="mt-4 space-y-2">
              {feedbackHistory.map((fb, i) => (
                <div key={i} className="flex gap-3 rounded-lg bg-white/[0.02] p-3">
                  <div className="text-[10px] text-slate-600 w-16 shrink-0 pt-0.5">{fb.date}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{fb.from}</span>
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-white/5 rounded">{fb.type}</span>
                    </div>
                    <p className="text-xs text-slate-400">{fb.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
