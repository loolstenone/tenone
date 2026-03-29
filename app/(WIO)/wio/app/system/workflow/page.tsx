'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, Plus, Play, Pause, ArrowRight, CheckCircle2, Circle, Clock, Zap,
  AlertTriangle, BarChart3, Eye, XCircle, RefreshCw, Search,
} from 'lucide-react';
import { useWIO } from '../../layout';
import {
  fetchWorkflowDefinitions, getActiveInstances, getInstances, checkSLABreaches,
  cancelWorkflow, markSLATimeout, upsertWorkflowDefinition,
  type WorkflowDefinition, type WorkflowInstance,
} from '@/lib/workflow-engine';

type ViewTab = 'definitions' | 'active' | 'history' | 'sla';

/* ── Mock 폴백 ── */
const MOCK_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wfd-expense', tenantId: 'demo', name: '지출 결재', description: '지출 결재 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 48, isActive: true,
    createdAt: '2026-01-15', updatedAt: '2026-03-20',
    steps: [
      { id: 's1', order: 0, name: '팀장 검토', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
      { id: 's2', order: 1, name: '재무팀 검토', type: 'approval', assigneeRule: { type: 'role', value: '재무' }, timeoutHours: 24 },
      { id: 's3', order: 2, name: '최종 승인', type: 'approval', assigneeRule: { type: 'role', value: '대표' }, timeoutHours: 48 },
    ],
  },
  {
    id: 'wfd-leave', tenantId: 'demo', name: '휴가 결재', description: '휴가 신청 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 24, isActive: true,
    createdAt: '2026-01-15', updatedAt: '2026-03-20',
    steps: [
      { id: 's1', order: 0, name: '팀장 승인', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
    ],
  },
  {
    id: 'wfd-purchase', tenantId: 'demo', name: '구매 결재', description: '구매 요청 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 72, isActive: true,
    createdAt: '2026-02-01', updatedAt: '2026-03-25',
    steps: [
      { id: 's1', order: 0, name: '팀장 검토', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
      { id: 's2', order: 1, name: '구매팀 검토', type: 'approval', assigneeRule: { type: 'role', value: '구매' }, timeoutHours: 24 },
      { id: 's3', order: 2, name: '최종 승인', type: 'approval', assigneeRule: { type: 'role', value: '대표' }, timeoutHours: 48 },
    ],
  },
  {
    id: 'wfd-onboarding', tenantId: 'demo', name: '직원 온보딩', description: '신규 직원 온보딩 프로세스',
    layer: 'department', triggerType: 'event', triggerEvent: 'employee.hired', slaHours: 168, isActive: true,
    createdAt: '2026-01-20', updatedAt: '2026-03-10',
    steps: [
      { id: 's1', order: 0, name: '계정 생성', type: 'task', assigneeRule: { type: 'role', value: 'IT' }, timeoutHours: 24 },
      { id: 's2', order: 1, name: '장비 배정', type: 'task', assigneeRule: { type: 'role', value: 'IT' }, timeoutHours: 24 },
      { id: 's3', order: 2, name: '멘토 배정', type: 'task', assigneeRule: { type: 'role', value: 'HR' }, timeoutHours: 48 },
      { id: 's4', order: 3, name: '오리엔테이션', type: 'task', assigneeRule: { type: 'role', value: 'HR' }, timeoutHours: 24 },
      { id: 's5', order: 4, name: '온보딩 완료', type: 'notification', assigneeRule: { type: 'submitter' }, timeoutHours: 168 },
    ],
  },
];

const MOCK_ACTIVE_INSTANCES: WorkflowInstance[] = [
  {
    id: 'wi-1', tenantId: 'demo', definitionId: 'wfd-expense', definitionName: '지출 결재',
    currentStepIndex: 1, status: 'running', startedBy: '전천일', startedAt: '2026-03-25T09:00:00Z',
    context: { title: 'MADLeague S7 시상금 집행' }, slaDeadline: '2026-03-27T09:00:00Z',
    stepHistory: [{ stepId: 's1', stepName: '팀장 검토', action: 'approve', actorId: '김관리', completedAt: '2026-03-25T14:00:00Z', durationMinutes: 300 }],
  },
  {
    id: 'wi-2', tenantId: 'demo', definitionId: 'wfd-purchase', definitionName: '구매 결재',
    currentStepIndex: 0, status: 'running', startedBy: '최디자인', startedAt: '2026-03-28T10:00:00Z',
    context: { title: 'Figma Enterprise 라이선스 구매' }, slaDeadline: '2026-03-31T10:00:00Z',
    stepHistory: [],
  },
  {
    id: 'wi-3', tenantId: 'demo', definitionId: 'wfd-onboarding', definitionName: '직원 온보딩',
    currentStepIndex: 3, status: 'running', startedBy: 'HR팀', startedAt: '2026-03-20T09:00:00Z',
    context: { title: '김신입 온보딩' }, slaDeadline: '2026-03-27T09:00:00Z',
    stepHistory: [
      { stepId: 's1', stepName: '계정 생성', action: 'complete', actorId: 'IT팀', completedAt: '2026-03-20T15:00:00Z', durationMinutes: 360 },
      { stepId: 's2', stepName: '장비 배정', action: 'complete', actorId: 'IT팀', completedAt: '2026-03-21T10:00:00Z', durationMinutes: 1140 },
      { stepId: 's3', stepName: '멘토 배정', action: 'complete', actorId: '최인사', completedAt: '2026-03-22T11:00:00Z', durationMinutes: 1500 },
    ],
  },
];

const MOCK_HISTORY_INSTANCES: WorkflowInstance[] = [
  {
    id: 'wi-h1', tenantId: 'demo', definitionId: 'wfd-leave', definitionName: '휴가 결재',
    currentStepIndex: 0, status: 'completed', startedBy: 'Sarah Kim', startedAt: '2026-03-24T08:00:00Z',
    completedAt: '2026-03-24T10:30:00Z',
    context: { title: '연차 휴가 신청' }, slaDeadline: '2026-03-25T08:00:00Z',
    stepHistory: [{ stepId: 's1', stepName: '팀장 승인', action: 'approve', actorId: '전천일', completedAt: '2026-03-24T10:30:00Z', durationMinutes: 150 }],
  },
  {
    id: 'wi-h2', tenantId: 'demo', definitionId: 'wfd-purchase', definitionName: '구매 결재',
    currentStepIndex: 0, status: 'rejected', startedBy: '정개발', startedAt: '2026-03-18T09:00:00Z',
    completedAt: '2026-03-18T16:00:00Z',
    context: { title: '장비 구매 - 모니터 2대' }, slaDeadline: '2026-03-21T09:00:00Z',
    stepHistory: [{ stepId: 's1', stepName: '팀장 검토', action: 'reject', actorId: '전천일', comment: '예산 부족', completedAt: '2026-03-18T16:00:00Z', durationMinutes: 420 }],
  },
];

const MOCK_SLA_BREACHES: WorkflowInstance[] = [
  MOCK_ACTIVE_INSTANCES[2], // 온보딩 SLA 초과
];

/* ── 상태 색상/레이블 ── */
const STATUS_MAP: Record<WorkflowInstance['status'], { label: string; color: string; icon: typeof Circle }> = {
  running: { label: '진행중', color: 'text-indigo-400 bg-indigo-500/10', icon: Zap },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  cancelled: { label: '취소', color: 'text-slate-400 bg-slate-500/10', icon: XCircle },
  timeout: { label: 'SLA 초과', color: 'text-red-400 bg-red-500/10', icon: AlertTriangle },
  rejected: { label: '반려', color: 'text-red-400 bg-red-500/10', icon: XCircle },
};

const TRIGGER_LABELS: Record<string, string> = { manual: '수동', event: '이벤트', schedule: '스케줄' };

/* ── 인스턴스 행 ── */
function InstanceRow({ inst, definition, onCancel }: { inst: WorkflowInstance; definition?: WorkflowDefinition; onCancel?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[inst.status];
  const StIcon = st.icon;
  const steps = definition?.steps || [];
  const contextTitle = (inst.context?.title as string) || inst.definitionName;
  const isSLABreach = inst.status === 'running' && new Date(inst.slaDeadline) < new Date();

  return (
    <div className={`border rounded-xl bg-white/[0.02] transition-colors ${isSLABreach ? 'border-red-500/30' : expanded ? 'border-indigo-500/20' : 'border-white/5 hover:border-white/10'}`}>
      <div className="p-4 cursor-pointer flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
        <StIcon size={14} className={st.color.split(' ')[0]} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold truncate">{contextTitle}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
            {isSLABreach && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-red-400 bg-red-500/10">SLA 초과</span>}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-3">
            <span>{inst.definitionName}</span>
            <span>시작: {new Date(inst.startedAt).toLocaleDateString('ko-KR')}</span>
            <span>기안: {inst.startedBy}</span>
            {inst.status === 'running' && steps.length > 0 && (
              <span className="text-indigo-400">스텝 {inst.currentStepIndex + 1}/{steps.length}</span>
            )}
          </div>
        </div>
        <ArrowRight size={12} className={`text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          {/* 스텝 플로우 */}
          {steps.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-3">
              {steps.map((step, i) => {
                const isDone = i < inst.currentStepIndex || inst.status === 'completed';
                const isCurr = i === inst.currentStepIndex && inst.status === 'running';
                const isRej = inst.status === 'rejected' && i === inst.currentStepIndex;
                let color = 'text-slate-600'; let bg = 'border-white/5';
                if (isDone) { color = 'text-emerald-400'; bg = 'border-emerald-500/20 bg-emerald-500/5'; }
                else if (isCurr) { color = 'text-indigo-400'; bg = 'border-indigo-500/30 bg-indigo-500/5'; }
                else if (isRej) { color = 'text-red-400'; bg = 'border-red-500/20 bg-red-500/5'; }

                const Icon = isDone ? CheckCircle2 : isCurr ? Zap : isRej ? XCircle : Circle;
                return (
                  <div key={step.id} className="flex items-center gap-1">
                    <div className={`rounded-lg border p-2 min-w-[90px] ${bg}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon size={9} className={color} />
                        <span className="text-[10px] font-semibold">{step.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-600">{step.type}</div>
                      {inst.stepHistory[i] && (
                        <div className="text-[9px] text-slate-600 mt-0.5">
                          {Math.round(inst.stepHistory[i].durationMinutes / 60)}h
                          {inst.stepHistory[i].comment && <span className="ml-1 text-slate-500">({inst.stepHistory[i].comment})</span>}
                        </div>
                      )}
                    </div>
                    {i < steps.length - 1 && <ArrowRight size={8} className="text-slate-700 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
          {/* SLA 정보 */}
          <div className="text-[10px] text-slate-600 flex items-center gap-4">
            <span className="flex items-center gap-1"><Clock size={9} /> SLA: {new Date(inst.slaDeadline).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {inst.completedAt && <span>완료: {new Date(inst.completedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
          {/* 취소 버튼 */}
          {inst.status === 'running' && onCancel && (
            <button onClick={(e) => { e.stopPropagation(); onCancel(inst.id); }}
              className="mt-3 flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/5 transition-colors">
              <XCircle size={10} /> 워크플로우 취소
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const tenantId = tenant?.id || 'demo';

  const [tab, setTab] = useState<ViewTab>('definitions');
  const [loading, setLoading] = useState(!isDemo);
  const [search, setSearch] = useState('');

  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>(isDemo ? MOCK_DEFINITIONS : []);
  const [activeInstances, setActiveInstances] = useState<WorkflowInstance[]>(isDemo ? MOCK_ACTIVE_INSTANCES : []);
  const [historyInstances, setHistoryInstances] = useState<WorkflowInstance[]>(isDemo ? MOCK_HISTORY_INSTANCES : []);
  const [slaBreaches, setSlaBreaches] = useState<WorkflowInstance[]>(isDemo ? MOCK_SLA_BREACHES : []);

  // 워크플로우 엔진에서 데이터 로드
  const loadAll = useCallback(async () => {
    if (isDemo) { setLoading(false); return; }
    setLoading(true);
    try {
      const [defs, active, breaches, allInst] = await Promise.all([
        fetchWorkflowDefinitions(tenantId),
        getActiveInstances(tenantId),
        checkSLABreaches(tenantId),
        getInstances(tenantId),
      ]);

      if (defs.length > 0) setDefinitions(defs);
      else setDefinitions(MOCK_DEFINITIONS);

      if (active.length > 0 || allInst.length > 0) {
        setActiveInstances(active);
        // 완료/반려/취소/timeout만 이력으로
        setHistoryInstances(allInst.filter(i => i.status !== 'running'));
        setSlaBreaches(breaches);
      } else {
        setActiveInstances(MOCK_ACTIVE_INSTANCES);
        setHistoryInstances(MOCK_HISTORY_INSTANCES);
        setSlaBreaches(MOCK_SLA_BREACHES);
      }
    } catch {
      setDefinitions(MOCK_DEFINITIONS);
      setActiveInstances(MOCK_ACTIVE_INSTANCES);
      setHistoryInstances(MOCK_HISTORY_INSTANCES);
      setSlaBreaches(MOCK_SLA_BREACHES);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenantId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // 워크플로우 취소
  const handleCancel = async (instanceId: string) => {
    if (isDemo) {
      setActiveInstances(prev => prev.filter(i => i.id !== instanceId));
      return;
    }
    const result = await cancelWorkflow(instanceId, member?.userId || '', '관리자 취소');
    if (result) {
      setActiveInstances(prev => prev.filter(i => i.id !== instanceId));
      setHistoryInstances(prev => [result, ...prev]);
    }
  };

  // 정의 활성/비활성 토글
  const toggleDefinition = async (defId: string) => {
    const def = definitions.find(d => d.id === defId);
    if (!def) return;
    if (isDemo) {
      setDefinitions(prev => prev.map(d => d.id === defId ? { ...d, isActive: !d.isActive } : d));
      return;
    }
    const updated = await upsertWorkflowDefinition(tenantId, { ...def, isActive: !def.isActive });
    if (updated) {
      setDefinitions(prev => prev.map(d => d.id === defId ? updated : d));
    }
  };

  if (!tenant) return null;

  // 검색 필터
  const filteredDefs = definitions.filter(d => !search || d.name.includes(search) || d.description?.includes(search));
  const filteredActive = activeInstances.filter(i => !search || i.definitionName.includes(search) || (i.context?.title as string || '').includes(search));
  const filteredHistory = historyInstances.filter(i => !search || i.definitionName.includes(search) || (i.context?.title as string || '').includes(search));

  // 통계
  const stats = {
    totalDefs: definitions.length,
    activeDefs: definitions.filter(d => d.isActive).length,
    runningInstances: activeInstances.length,
    slaBreaches: slaBreaches.length,
  };

  const TABS: { id: ViewTab; label: string; count?: number }[] = [
    { id: 'definitions', label: '워크플로우 정의', count: stats.totalDefs },
    { id: 'active', label: '실행 중', count: stats.runningInstances },
    { id: 'history', label: '실행 이력', count: historyInstances.length },
    { id: 'sla', label: 'SLA 위반', count: stats.slaBreaches },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GitBranch size={18} className="text-indigo-400" /> 워크플로우 관리
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="p-2 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <RefreshCw size={14} />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            <Plus size={15} /> 새 워크플로우
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">정의 수</div>
          <div className="text-2xl font-bold text-slate-200">{stats.totalDefs}</div>
          <div className="text-[10px] text-slate-600">{stats.activeDefs}개 활성</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">실행 중</div>
          <div className="text-2xl font-bold text-indigo-400">{stats.runningInstances}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">완료</div>
          <div className="text-2xl font-bold text-emerald-400">{historyInstances.filter(i => i.status === 'completed').length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">SLA 위반</div>
          <div className={`text-2xl font-bold ${stats.slaBreaches > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{stats.slaBreaches}</div>
        </div>
      </div>

      {/* 탭 + 검색 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.id === 'sla' && t.count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-500'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..."
            className="pl-7 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 w-48 focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">워크플로우 로딩 중...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* 워크플로우 정의 탭 */}
          {tab === 'definitions' && (
            <div className="space-y-3">
              {filteredDefs.map(def => (
                <div key={def.id} className="border border-white/5 rounded-xl bg-white/[0.02] p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{def.name}</h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${def.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                          {def.isActive ? '활성' : '비활성'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{def.layer}</span>
                      </div>
                      <p className="text-xs text-slate-500">{def.description}</p>
                    </div>
                    <button onClick={() => toggleDefinition(def.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${def.isActive ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' : 'border-white/5 text-slate-500 hover:bg-white/5'}`}>
                      {def.isActive ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                  </div>
                  {/* 스텝 미리보기 */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
                    {def.steps.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-1 rounded border border-white/5 bg-white/[0.03] text-slate-400 whitespace-nowrap">
                          {step.name}
                          <span className="text-slate-600 ml-1">({step.type})</span>
                        </span>
                        {i < def.steps.length - 1 && <ArrowRight size={8} className="text-slate-700 shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-600">
                    <span className="flex items-center gap-0.5"><Zap size={9} /> {TRIGGER_LABELS[def.triggerType] || def.triggerType}</span>
                    <span>{def.steps.length}단계</span>
                    <span>SLA {def.slaHours}시간</span>
                    <span>수정: {new Date(def.updatedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              ))}
              {filteredDefs.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">워크플로우 정의가 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 실행 중 탭 */}
          {tab === 'active' && (
            <div className="space-y-3">
              {filteredActive.map(inst => (
                <InstanceRow key={inst.id} inst={inst}
                  definition={definitions.find(d => d.id === inst.definitionId)}
                  onCancel={handleCancel} />
              ))}
              {filteredActive.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">실행 중인 워크플로우가 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 이력 탭 */}
          {tab === 'history' && (
            <div className="space-y-3">
              {filteredHistory.map(inst => (
                <InstanceRow key={inst.id} inst={inst}
                  definition={definitions.find(d => d.id === inst.definitionId)} />
              ))}
              {filteredHistory.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">실행 이력이 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* SLA 위반 탭 */}
          {tab === 'sla' && (
            <div className="space-y-3">
              {slaBreaches.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 mb-2 text-sm text-red-300 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {slaBreaches.length}건의 SLA 위반 워크플로우가 있습니다.
                </div>
              )}
              {slaBreaches.map(inst => (
                <InstanceRow key={inst.id} inst={inst}
                  definition={definitions.find(d => d.id === inst.definitionId)}
                  onCancel={handleCancel} />
              ))}
              {slaBreaches.length === 0 && (
                <div className="text-center py-16 text-emerald-600">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-slate-500">SLA 위반 건이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
