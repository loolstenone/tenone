'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchGPRs, createGPR, updateGPR } from '@/lib/supabase/wio';

type Level = 'company' | 'team' | 'individual';
type GPRStatus = 'draft' | 'in_progress' | 'review' | 'completed';

const LEVEL_LABELS: Record<Level, { label: string; color: string }> = {
  company: { label: '전사', color: 'text-violet-400 bg-violet-500/10' },
  team: { label: '팀', color: 'text-blue-400 bg-blue-500/10' },
  individual: { label: '개인', color: 'text-emerald-400 bg-emerald-500/10' },
};

const STATUS_LABELS: Record<GPRStatus, { label: string; color: string; icon: typeof Target }> = {
  draft: { label: '작성 중', color: 'text-slate-400', icon: Clock },
  in_progress: { label: '진행 중', color: 'text-amber-400', icon: TrendingUp },
  review: { label: '리뷰', color: 'text-blue-400', icon: AlertCircle },
  completed: { label: '완료', color: 'text-emerald-400', icon: CheckCircle2 },
};

const PERIODS = [
  { value: '2026-Q1', label: '2026 1분기' },
  { value: '2026-Q2', label: '2026 2분기' },
  { value: '2026-Q3', label: '2026 3분기' },
  { value: '2026-Q4', label: '2026 4분기' },
];

export default function GPRPage() {
  const { tenant, member } = useWIO();
  const [gprs, setGprs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Level | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 새 GPR 폼
  const [newGoal, setNewGoal] = useState('');
  const [newLevel, setNewLevel] = useState<Level>('individual');
  const [newPeriod, setNewPeriod] = useState(PERIODS[1].value);

  // Plan/Result 인라인 편집
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [planText, setPlanText] = useState('');
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    if (!tenant) return;
    fetchGPRs(tenant.id).then(g => { setGprs(g); setLoading(false); });
  }, [tenant]);

  const handleCreate = async () => {
    if (!tenant || !member || !newGoal.trim()) return;
    await createGPR({ tenantId: tenant.id, level: newLevel, ownerId: member.id, period: newPeriod, goal: newGoal.trim() });
    setNewGoal(''); setShowForm(false);
    fetchGPRs(tenant.id).then(setGprs);
  };

  const handleSavePlan = async (gprId: string) => {
    await updateGPR(gprId, { plan: planText });
    setEditingPlan(null);
    fetchGPRs(tenant!.id).then(setGprs);
  };

  const handleSaveResult = async (gprId: string) => {
    await updateGPR(gprId, { result: resultText });
    setEditingResult(null);
    fetchGPRs(tenant!.id).then(setGprs);
  };

  const handleScore = async (gprId: string, score: number) => {
    await updateGPR(gprId, { score, status: 'completed' });
    fetchGPRs(tenant!.id).then(setGprs);
  };

  const filtered = filter === 'all' ? gprs : gprs.filter(g => g.level === filter);
  const myGprs = filtered.filter(g => g.ownerId === member?.id);
  const otherGprs = filtered.filter(g => g.ownerId !== member?.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">GPR</h1>
          <p className="text-xs text-slate-500 mt-0.5">Goal → Plan → Result</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 목표 설정
        </button>
      </div>

      {/* 필터 */}
      <div className="flex gap-1.5 mb-4">
        {[{ id: 'all' as const, label: '전체' }, ...Object.entries(LEVEL_LABELS).map(([id, v]) => ({ id: id as Level | 'all', label: v.label }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filter === f.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 새 GPR 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="flex gap-2">
            <select value={newLevel} onChange={e => setNewLevel(e.target.value as Level)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none">
              {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={newPeriod} onChange={e => setNewPeriod(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none">
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="이번 분기에 달성할 목표를 입력하세요"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleCreate} disabled={!newGoal.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">등록</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Target size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400 mb-1">아직 목표가 없어요</p>
          <p className="text-xs text-slate-600 mb-4">이번 분기 목표를 설정하고 Plan → Result로 관리하세요</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
            <Plus size={14} /> 첫 목표 설정하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 내 GPR */}
          {myGprs.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">내 목표</h2>
              <div className="space-y-2">
                {myGprs.map(g => <GPRCard key={g.id} g={g} expandedId={expandedId} setExpandedId={setExpandedId}
                  editingPlan={editingPlan} setEditingPlan={setEditingPlan} planText={planText} setPlanText={setPlanText} handleSavePlan={handleSavePlan}
                  editingResult={editingResult} setEditingResult={setEditingResult} resultText={resultText} setResultText={setResultText} handleSaveResult={handleSaveResult}
                  handleScore={handleScore} isMine />)}
              </div>
            </div>
          )}
          {/* 팀 GPR */}
          {otherGprs.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">팀 목표</h2>
              <div className="space-y-2">
                {otherGprs.map(g => <GPRCard key={g.id} g={g} expandedId={expandedId} setExpandedId={setExpandedId}
                  editingPlan={editingPlan} setEditingPlan={setEditingPlan} planText={planText} setPlanText={setPlanText} handleSavePlan={handleSavePlan}
                  editingResult={editingResult} setEditingResult={setEditingResult} resultText={resultText} setResultText={setResultText} handleSaveResult={handleSaveResult}
                  handleScore={handleScore} isMine={false} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GPRCard({ g, expandedId, setExpandedId, editingPlan, setEditingPlan, planText, setPlanText, handleSavePlan, editingResult, setEditingResult, resultText, setResultText, handleSaveResult, handleScore, isMine }: any) {
  const level = LEVEL_LABELS[g.level as Level] || LEVEL_LABELS.individual;
  const status = STATUS_LABELS[g.status as GPRStatus] || STATUS_LABELS.draft;
  const StatusIcon = status.icon;
  const expanded = expandedId === g.id;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button onClick={() => setExpandedId(expanded ? null : g.id)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
        <StatusIcon size={16} className={status.color} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{g.goal}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${level.color}`}>{level.label}</span>
            <span className="text-[10px] text-slate-600">{g.period}</span>
            <span className="text-[10px] text-slate-600">{g.owner?.displayName || ''}</span>
          </div>
        </div>
        {g.score != null && <span className="text-lg font-bold text-indigo-400">{g.score}</span>}
        {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Goal */}
          <div>
            <span className="text-[10px] font-semibold text-violet-400 uppercase">Goal</span>
            <p className="text-sm text-slate-300 mt-1">{g.goal}</p>
          </div>

          {/* Plan */}
          <div>
            <span className="text-[10px] font-semibold text-blue-400 uppercase">Plan</span>
            {editingPlan === g.id ? (
              <div className="mt-1 flex gap-2">
                <textarea value={planText} onChange={e => setPlanText(e.target.value)} rows={3}
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
                <button onClick={() => handleSavePlan(g.id)} className="rounded-lg bg-indigo-600 px-3 text-sm hover:bg-indigo-500 transition-colors">저장</button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">
                {g.plan || (isMine ? <button onClick={() => { setEditingPlan(g.id); setPlanText(g.plan || ''); }} className="text-indigo-400 hover:text-indigo-300">계획을 작성하세요 →</button> : '아직 작성되지 않음')}
                {g.plan && isMine && <button onClick={() => { setEditingPlan(g.id); setPlanText(g.plan || ''); }} className="ml-2 text-[10px] text-slate-600 hover:text-indigo-400">수정</button>}
              </p>
            )}
          </div>

          {/* Result */}
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase">Result</span>
            {editingResult === g.id ? (
              <div className="mt-1 flex gap-2">
                <textarea value={resultText} onChange={e => setResultText(e.target.value)} rows={3}
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
                <button onClick={() => handleSaveResult(g.id)} className="rounded-lg bg-indigo-600 px-3 text-sm hover:bg-indigo-500 transition-colors">저장</button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">
                {g.result || (isMine ? <button onClick={() => { setEditingResult(g.id); setResultText(g.result || ''); }} className="text-indigo-400 hover:text-indigo-300">결과를 기록하세요 →</button> : '아직 기록되지 않음')}
                {g.result && isMine && <button onClick={() => { setEditingResult(g.id); setResultText(g.result || ''); }} className="ml-2 text-[10px] text-slate-600 hover:text-indigo-400">수정</button>}
              </p>
            )}
          </div>

          {/* 점수 (내 것만) */}
          {isMine && g.status !== 'completed' && g.plan && g.result && (
            <div>
              <span className="text-[10px] font-semibold text-amber-400 uppercase">자기 평가 (1~5)</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => handleScore(g.id, s)}
                    className={`w-8 h-8 rounded-lg border text-sm font-bold transition-all ${g.score === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-slate-500 hover:border-indigo-500 hover:text-indigo-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
