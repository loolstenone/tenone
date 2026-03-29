'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Calculator, PieChart, History, Plus,
  ChevronDown, ChevronUp, TrendingUp, Award
} from 'lucide-react';
import { useWIO } from '../../layout';

type IncentiveType = 'performance' | 'project' | 'special';
type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

const TYPE_LABEL: Record<IncentiveType, string> = { performance: '성과급', project: '프로젝트', special: '특별' };
const TYPE_COLOR: Record<IncentiveType, string> = {
  performance: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  project: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  special: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

const GRADE_MULTIPLIER: Record<Grade, number> = { S: 2.0, A: 1.5, B: 1.0, C: 0.5, D: 0 };
const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  A: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  B: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  D: 'text-red-400 bg-red-500/10 border-red-500/20',
};

interface IncentivePolicy {
  id: string; name: string; type: IncentiveType; formula: string; period: string; basePay: number;
}

const MOCK_POLICIES: IncentivePolicy[] = [
  { id: 'p1', name: '반기 성과급', type: 'performance', formula: '기본급 x 등급배수', period: '2026 상반기', basePay: 4000000 },
  { id: 'p2', name: '프로젝트 인센티브', type: 'project', formula: '프로젝트 수익 x 기여도%', period: '수시', basePay: 0 },
  { id: 'p3', name: '우수사원 특별상여', type: 'special', formula: '기본급 x 0.5 (정액)', period: '연 1회', basePay: 4000000 },
];

const MOCK_HISTORY = [
  { id: 'h1', name: '반기 성과급', recipient: '김서연', grade: 'A' as Grade, amount: 6000000, date: '2025-12-20', period: '2025 하반기' },
  { id: 'h2', name: '반기 성과급', recipient: '이준호', grade: 'S' as Grade, amount: 8000000, date: '2025-12-20', period: '2025 하반기' },
  { id: 'h3', name: '프로젝트 인센티브', recipient: '최수진', grade: 'A' as Grade, amount: 3200000, date: '2025-11-30', period: 'WIO MVP' },
  { id: 'h4', name: '우수사원 특별상여', recipient: '박지민', grade: 'S' as Grade, amount: 2000000, date: '2025-12-31', period: '2025 연말' },
  { id: 'h5', name: '반기 성과급', recipient: '한민수', grade: 'B' as Grade, amount: 4000000, date: '2025-12-20', period: '2025 하반기' },
];

const DISTRIBUTION = { individual: 60, team: 25, company: 15 };

export default function IncentivePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<IncentivePolicy[]>([]);
  const [history, setHistory] = useState<typeof MOCK_HISTORY>([]);
  const [simGrade, setSimGrade] = useState<Grade>('B');
  const [simPolicy, setSimPolicy] = useState<string>('p1');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) {
      setPolicies(MOCK_POLICIES);
      setHistory(MOCK_HISTORY);
    }
    setLoading(false);
  }, [tenant, isDemo]);

  const selectedPolicy = policies.find(p => p.id === simPolicy);
  const simAmount = selectedPolicy
    ? selectedPolicy.type === 'special'
      ? selectedPolicy.basePay * 0.5
      : selectedPolicy.basePay * GRADE_MULTIPLIER[simGrade]
    : 0;

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">인센티브/성과급</h1>
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
          <h1 className="text-xl font-bold">인센티브/성과급</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-INC | 정책 관리 & 시뮬레이션</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-600/30 transition-colors">
          <Plus size={13} /> 정책 생성
        </button>
      </div>

      <div className="space-y-6">
        {/* Policy Create Form */}
        {showForm && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Plus size={15} className="text-indigo-400" /> 인센티브 정책 생성
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">정책 이름</label>
                <input type="text" placeholder="예: Q2 성과급" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">유형</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">산식</label>
                <input type="text" placeholder="기본급 x 등급배수" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">적용 기간</label>
                <input type="text" placeholder="2026 상반기" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300">취소</button>
              <button className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">생성</button>
            </div>
          </div>
        )}

        {/* Policy List */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-emerald-400" /> 인센티브 정책
          </h2>
          <div className="space-y-2">
            {policies.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${TYPE_COLOR[p.type]}`}>{TYPE_LABEL[p.type]}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{p.formula}</span>
                </div>
                <span className="text-[10px] text-slate-500">{p.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calculator size={15} className="text-blue-400" /> 성과급 시뮬레이터
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">정책 선택</label>
              <select value={simPolicy} onChange={e => setSimPolicy(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                {policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">등급 선택</label>
              <div className="flex gap-1.5">
                {(['S', 'A', 'B', 'C', 'D'] as Grade[]).map(g => (
                  <button key={g} onClick={() => setSimGrade(g)}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors border ${simGrade === g ? GRADE_COLORS[g] : 'border-white/5 text-slate-500 hover:bg-white/5'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-4 text-center">
            <p className="text-[10px] text-slate-500 mb-1">예상 금액</p>
            <p className="text-2xl font-bold text-emerald-400">{simAmount.toLocaleString()}원</p>
            <p className="text-[10px] text-slate-600 mt-1">
              {selectedPolicy?.type === 'special'
                ? `기본급 ${selectedPolicy.basePay.toLocaleString()}원 x 0.5`
                : `기본급 ${selectedPolicy?.basePay.toLocaleString() ?? 0}원 x ${GRADE_MULTIPLIER[simGrade]}배`
              }
            </p>
          </div>
        </div>

        {/* Distribution */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <PieChart size={15} className="text-violet-400" /> 배분 비율
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="flex h-6 rounded-lg overflow-hidden">
                <div className="bg-indigo-500/60 flex items-center justify-center text-[10px] font-bold" style={{ width: `${DISTRIBUTION.individual}%` }}>
                  개인 {DISTRIBUTION.individual}%
                </div>
                <div className="bg-emerald-500/60 flex items-center justify-center text-[10px] font-bold" style={{ width: `${DISTRIBUTION.team}%` }}>
                  팀 {DISTRIBUTION.team}%
                </div>
                <div className="bg-amber-500/60 flex items-center justify-center text-[10px] font-bold" style={{ width: `${DISTRIBUTION.company}%` }}>
                  전사 {DISTRIBUTION.company}%
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '개인 성과', pct: DISTRIBUTION.individual, color: 'text-indigo-400', desc: '개인 목표 달성도 기반' },
              { label: '팀 성과', pct: DISTRIBUTION.team, color: 'text-emerald-400', desc: '팀 KPI 달성률 기반' },
              { label: '전사 성과', pct: DISTRIBUTION.company, color: 'text-amber-400', desc: '회사 매출/영업이익 기반' },
            ].map((d, i) => (
              <div key={i} className="rounded-lg bg-white/[0.02] p-3 text-center">
                <p className={`text-lg font-bold ${d.color}`}>{d.pct}%</p>
                <p className="text-xs font-medium mt-1">{d.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <History size={15} className="text-emerald-400" /> 지급 이력
            </h2>
            {showHistory ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${GRADE_COLORS[h.grade]}`}>{h.grade}</span>
                  <span className="text-xs font-medium flex-1">{h.recipient}</span>
                  <span className="text-[10px] text-slate-500">{h.name}</span>
                  <span className="text-xs font-bold text-emerald-400">{h.amount.toLocaleString()}원</span>
                  <span className="text-[10px] text-slate-600">{h.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
