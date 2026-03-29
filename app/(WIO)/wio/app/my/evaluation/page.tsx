'use client';

import { useState, useEffect } from 'react';
import {
  Target, Star, MessageSquare, Award, TrendingUp, Calendar,
  ChevronDown, ChevronUp, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';

/* ── MY 탭 네비게이션 ── */
const MY_TABS = [
  { label: '대시보드', href: '/wio/app/my' },
  { label: '인사기록', href: '/wio/app/my/hr' },
  { label: '내 평가', href: '/wio/app/my/evaluation' },
  { label: '내 업무', href: '/wio/app/my/work' },
  { label: '기안/결재', href: '/wio/app/my/approval' },
];

type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  A: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  B: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  D: 'text-red-400 bg-red-500/10 border-red-500/20',
};

/* ── Mock data ── */
const MOCK_GOALS = [
  { id: '1', title: '마케팅 캠페인 ROI 20% 개선', weight: 40, progress: 70, status: '진행 중' },
  { id: '2', title: '신규 리드 500건 확보', weight: 35, progress: 45, status: '진행 중' },
  { id: '3', title: '콘텐츠 자동화 파이프라인 구축', weight: 25, progress: 90, status: '마감 임박' },
];

const MOCK_FEEDBACK = [
  { id: 'f1', from: '팀장 이영수', type: '성과', content: 'Q1 캠페인 성과가 인상적이었습니다. ROI 개선이 목표에 근접하고 있어요.', date: '2026-03-20' },
  { id: 'f2', from: '동료 박지민', type: '협업', content: '크로스펑셔널 프로젝트에서 커뮤니케이션이 매우 원활했습니다.', date: '2026-03-12' },
  { id: 'f3', from: '동료 김하늘', type: '역량', content: '데이터 분석 능력이 크게 향상되었어요. 인사이트가 날카롭습니다.', date: '2026-02-28' },
  { id: 'f4', from: '팀장 이영수', type: '성과', content: '콘텐츠 자동화 프로젝트 리딩을 잘 해주고 있습니다.', date: '2026-02-15' },
  { id: 'f5', from: '동료 최수진', type: '문화', content: '팀 분위기를 밝게 만들어주셔서 감사합니다.', date: '2026-01-30' },
];

const MOCK_COMPETENCIES = [
  { name: '혁신', score: 4.2 },
  { name: '협업', score: 4.5 },
  { name: '성장', score: 3.8 },
  { name: '책임', score: 4.0 },
  { name: '고객중심', score: 3.5 },
];

const MOCK_EVAL_HISTORY = [
  { year: '2025 하반기', grade: 'A' as Grade, comment: '안정적인 성과와 팀 기여' },
  { year: '2025 상반기', grade: 'B' as Grade, comment: '성장 가능성이 큰 인재' },
  { year: '2024 하반기', grade: 'A' as Grade, comment: '입사 첫 해 우수한 적응력' },
];

const MOCK_IDP = [
  { id: 'idp1', goal: '데이터 기반 의사결정 역량 강화', action: 'SQL/Python 심화 과정 수료, 월 1회 데이터 분석 리포트 발행', deadline: '2026-06-30', progress: 40 },
  { id: 'idp2', goal: '프레젠테이션 스킬 향상', action: '사내 발표 3회 이상, 스피치 코칭 참여', deadline: '2026-12-31', progress: 20 },
];

export default function MyEvaluationPage() {
  const { member, isDemo } = useWIO();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<typeof MOCK_GOALS>([]);
  const [feedback, setFeedback] = useState<typeof MOCK_FEEDBACK>([]);
  const [competencies, setCompetencies] = useState<typeof MOCK_COMPETENCIES>([]);
  const [evalHistory, setEvalHistory] = useState<typeof MOCK_EVAL_HISTORY>([]);
  const [idp, setIdp] = useState<typeof MOCK_IDP>([]);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setGoals(MOCK_GOALS);
      setFeedback(MOCK_FEEDBACK);
      setCompetencies(MOCK_COMPETENCIES);
      setEvalHistory(MOCK_EVAL_HISTORY);
      setIdp(MOCK_IDP);
    }
    setLoading(false);
  }, [isDemo]);

  const overallGPR = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.progress * g.weight / 100), 0))
    : 0;
  const dDay = 93; // D-93 until end of H1

  const avgCompetency = competencies.length > 0
    ? (competencies.reduce((s, c) => s + c.score, 0) / competencies.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">내 평가</h1>
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
      {/* MY 탭 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {MY_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab.href === '/wio/app/my/evaluation'
                ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-white/5'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">내 평가</h1>
          <p className="text-xs text-slate-500 mt-0.5">MY-EVL | 개인 평가 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            2026 상반기
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            D-{dDay}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 내 목표 GPR */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Target size={15} className="text-indigo-400" /> 내 목표 (GPR)
            </h2>
            <span className="text-xs text-slate-500">종합 진척률: <span className="text-indigo-400 font-bold">{overallGPR}%</span></span>
          </div>
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="rounded-lg bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">가중치 {g.weight}%</span>
                    <span className={`text-sm font-bold ${g.progress >= 80 ? 'text-emerald-400' : g.progress >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {g.progress}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full transition-all ${g.progress >= 80 ? 'bg-emerald-500' : g.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(g.progress, 100)}%` }} />
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  g.status === '마감 임박' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                }`}>{g.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 받은 피드백 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare size={15} className="text-emerald-400" /> 받은 피드백
            </h2>
            <span className="text-xs text-slate-500">{feedback.length}건</span>
          </div>
          <div className="space-y-2">
            {(showAllFeedback ? feedback : feedback.slice(0, 3)).map(f => (
              <div key={f.id} className="flex gap-3 rounded-lg bg-white/[0.02] p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{f.from}</span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-white/5 rounded">{f.type}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{f.date}</span>
                  </div>
                  <p className="text-xs text-slate-400">{f.content}</p>
                </div>
              </div>
            ))}
          </div>
          {feedback.length > 3 && (
            <button onClick={() => setShowAllFeedback(!showAllFeedback)}
              className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              {showAllFeedback ? <><ChevronUp size={12} /> 접기</> : <><ChevronDown size={12} /> 전체 보기 ({feedback.length}건)</>}
            </button>
          )}
        </div>

        {/* 역량 점수 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Star size={15} className="text-amber-400" /> 역량 점수
            </h2>
            <span className="text-xs text-slate-500">평균: <span className="text-amber-400 font-bold">{avgCompetency}</span>/5.0</span>
          </div>
          <div className="space-y-3">
            {competencies.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-16 shrink-0 text-sm font-medium">{c.name}</div>
                <div className="flex-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="flex-1 h-6 rounded relative overflow-hidden bg-white/5">
                      {s <= Math.floor(c.score) && <div className="absolute inset-0 bg-amber-500/60 rounded" />}
                      {s === Math.ceil(c.score) && s !== Math.floor(c.score) && (
                        <div className="absolute inset-y-0 left-0 bg-amber-500/60 rounded"
                          style={{ width: `${(c.score % 1) * 100}%` }} />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold w-10 text-right">{c.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 평가 이력 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award size={15} className="text-violet-400" /> 평가 이력
          </h2>
          <div className="space-y-2">
            {evalHistory.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{e.year}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${GRADE_COLORS[e.grade]}`}>{e.grade}</span>
                <span className="text-xs text-slate-400 truncate">{e.comment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 성장 계획 IDP */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-blue-400" /> 성장 계획 (IDP)
          </h2>
          <div className="space-y-3">
            {idp.map(item => (
              <div key={item.id} className="rounded-lg bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.goal}</span>
                  <span className="text-[10px] text-slate-500">~{item.deadline}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{item.action}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-xs text-blue-400 font-bold">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
