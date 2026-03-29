'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitBranch, Plus, Play, Pause, ArrowRight, CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type WFStatus = 'active' | 'draft' | 'disabled';
type StepStatus = 'completed' | 'current' | 'pending';
type Step = { id: string; name: string; assignee: string; status: StepStatus; duration?: string };
type Workflow = {
  id: string; name: string; trigger: string; steps: Step[];
  status: WFStatus; executions: number; lastRun?: string; description: string;
};

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf1', name: '신제품 출시', trigger: '수동 시작', status: 'active', executions: 8, lastRun: '2026-03-25',
    description: '신제품 출시 전체 프로세스를 관리합니다.',
    steps: [
      { id: 's1', name: '기획서 작성', assignee: '윤기획', status: 'completed', duration: '3일' },
      { id: 's2', name: '디자인 리뷰', assignee: '정디자인', status: 'completed', duration: '2일' },
      { id: 's3', name: '개발 구현', assignee: '박개발', status: 'current', duration: '5일' },
      { id: 's4', name: 'QA 테스트', assignee: 'QA팀', status: 'pending', duration: '3일' },
      { id: 's5', name: '마케팅 준비', assignee: '이마케팅', status: 'pending', duration: '2일' },
      { id: 's6', name: '출시 승인', assignee: '김대표', status: 'pending' },
    ],
  },
  {
    id: 'wf2', name: '구매 승인', trigger: '구매 요청 시', status: 'active', executions: 24, lastRun: '2026-03-28',
    description: '일정 금액 이상의 구매에 대한 다단계 승인 프로세스입니다.',
    steps: [
      { id: 's7', name: '구매 요청서 작성', assignee: '요청자', status: 'completed' },
      { id: 's8', name: '팀장 승인', assignee: '팀장', status: 'completed' },
      { id: 's9', name: '재무팀 검토', assignee: '한재무', status: 'current' },
      { id: 's10', name: '최종 승인', assignee: '김대표', status: 'pending' },
    ],
  },
  {
    id: 'wf3', name: '직원 온보딩', trigger: '입사일 -7일', status: 'active', executions: 12, lastRun: '2026-03-20',
    description: '신규 직원의 온보딩 과정을 자동으로 관리합니다.',
    steps: [
      { id: 's11', name: '계정 생성', assignee: 'IT팀', status: 'completed', duration: '1일' },
      { id: 's12', name: '장비 배정', assignee: 'IT팀', status: 'completed', duration: '1일' },
      { id: 's13', name: '멘토 배정', assignee: '최인사', status: 'completed' },
      { id: 's14', name: '오리엔테이션', assignee: '최인사', status: 'current', duration: '1일' },
      { id: 's15', name: '팀 소개', assignee: '팀장', status: 'pending', duration: '1일' },
      { id: 's16', name: '온보딩 완료', assignee: '최인사', status: 'pending' },
    ],
  },
];

const STATUS_LABELS: Record<WFStatus, string> = { active: '활성', draft: '초안', disabled: '비활성' };
const STATUS_COLORS: Record<WFStatus, string> = { active: 'text-emerald-400 bg-emerald-500/10', draft: 'text-slate-400 bg-slate-500/10', disabled: 'text-rose-400 bg-rose-500/10' };
const STEP_ICONS: Record<StepStatus, typeof Circle> = { completed: CheckCircle2, current: Zap, pending: Circle };
const STEP_COLORS: Record<StepStatus, string> = { completed: 'text-emerald-400', current: 'text-indigo-400', pending: 'text-slate-600' };

export default function WorkflowPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [workflows, setWorkflows] = useState<Workflow[]>(isDemo ? MOCK_WORKFLOWS : []);
  const [selectedWF, setSelectedWF] = useState<string>('wf1');
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 워크플로우 데이터 로드
  const loadWorkflows = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('workflows')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setWorkflows(data.map((row: any) => ({
          id: row.id,
          name: row.name || '',
          trigger: row.trigger || '',
          steps: Array.isArray(row.steps) ? row.steps : [],
          status: row.status || 'draft',
          executions: row.executions || 0,
          lastRun: row.last_run ? row.last_run.split('T')[0] : undefined,
          description: row.description || '',
        })));
      } else {
        setWorkflows(MOCK_WORKFLOWS);
      }
    } catch {
      setWorkflows(MOCK_WORKFLOWS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  if (!tenant) return null;

  const currentWF = workflows.find(w => w.id === selectedWF);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">워크플로우관리</h1>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 새 워크플로우
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">워크플로우 로딩 중...</p>
        </div>
      )}

      {/* 워크플로우 카드 목록 */}
      {!loading && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {workflows.map(wf => (
          <button key={wf.id} onClick={() => setSelectedWF(wf.id)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${selectedWF === wf.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[wf.status]}`}>{STATUS_LABELS[wf.status]}</span>
              <GitBranch size={14} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1">{wf.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{wf.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-0.5"><Zap size={9} /> {wf.trigger}</span>
              <span>{wf.steps.length}단계</span>
              <span>실행 {wf.executions}회</span>
            </div>
          </button>
        ))}
      </div>}

      {/* 워크플로우 시각화 */}
      {currentWF && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">{currentWF.name} — 스텝 플로우</h3>
            {currentWF.lastRun && <span className="text-[10px] text-slate-500">마지막 실행: {currentWF.lastRun}</span>}
          </div>

          {/* 플로우차트 */}
          <div className="flex items-start gap-2 overflow-x-auto pb-4">
            {currentWF.steps.map((step, i) => {
              const Icon = STEP_ICONS[step.status];
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`rounded-xl border p-4 min-w-[160px] transition-colors ${step.status === 'current' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon size={14} className={STEP_COLORS[step.status]} />
                      <span className="text-xs font-semibold">{step.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{step.assignee}</div>
                    {step.duration && <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-0.5"><Clock size={8} /> {step.duration}</div>}
                  </div>
                  {i < currentWF.steps.length - 1 && (
                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* 진행 상태 요약 */}
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12} /> 완료: {currentWF.steps.filter(s => s.status === 'completed').length}</span>
            <span className="flex items-center gap-1 text-indigo-400"><Zap size={12} /> 진행중: {currentWF.steps.filter(s => s.status === 'current').length}</span>
            <span className="flex items-center gap-1 text-slate-500"><Circle size={12} /> 대기: {currentWF.steps.filter(s => s.status === 'pending').length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
