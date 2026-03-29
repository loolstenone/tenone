'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stamp, Plus, Clock, Check, X, FileText, ChevronRight, Filter, AlertCircle, ArrowRight, CheckCircle2, Circle, Zap, MessageSquare } from 'lucide-react';
import { useWIO } from '../layout';
import { createClient } from '@/lib/supabase/client';
import {
  startWorkflow, advanceStep, getInstance, fetchWorkflowDefinitions,
  type WorkflowInstance, type WorkflowDefinition, type WorkflowStep as WFStep,
} from '@/lib/workflow-engine';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'draft';
type ApprovalType = '지출' | '휴가' | '구매' | '계약' | '기타';
type Tab = 'received' | 'sent' | 'all';

interface ApprovalItem {
  id: string;
  title: string;
  type: ApprovalType;
  requester: string;
  amount?: number;
  status: ApprovalStatus;
  createdAt: string;
  description: string;
  approvers: { name: string; status: ApprovalStatus }[];
  /** 연결된 워크플로우 인스턴스 ID */
  workflowInstanceId?: string;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; icon: any }> = {
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: '승인', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Check },
  rejected: { label: '반려', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: X },
  draft: { label: '초안', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: FileText },
};

// 데모 폴백 데이터
const MOCK_APPROVALS: ApprovalItem[] = [
  { id: 'a1', title: 'MADLeague S7 시상금 집행', type: '지출', requester: '전천일', amount: 3500000, status: 'pending', createdAt: '2026-03-25',
    description: 'MADLeague 시즌7 대상(200만) + 최우수상(100만) + 우수상(50만) 시상금', approvers: [{ name: '김관리', status: 'approved' }, { name: '이재무', status: 'pending' }] },
  { id: 'a2', title: '연차 휴가 신청 (3/31~4/2)', type: '휴가', requester: 'Sarah Kim', status: 'approved', createdAt: '2026-03-24',
    description: '개인 사유 연차 3일', approvers: [{ name: '전천일', status: 'approved' }] },
  { id: 'a3', title: 'Figma Enterprise 라이선스 구매', type: '구매', requester: '최디자인', amount: 1800000, status: 'pending', createdAt: '2026-03-23',
    description: '디자인팀 Figma Enterprise 연간 라이선스 (5석)', approvers: [{ name: '전천일', status: 'pending' }] },
  { id: 'a4', title: 'SmarComm 클라이언트 계약', type: '계약', requester: '전천일', amount: 12000000, status: 'approved', createdAt: '2026-03-20',
    description: 'A사 마케팅 대행 6개월 계약', approvers: [{ name: '김관리', status: 'approved' }, { name: '이재무', status: 'approved' }] },
  { id: 'a5', title: '장비 구매 — 모니터 2대', type: '구매', requester: '정개발', amount: 1200000, status: 'rejected', createdAt: '2026-03-18',
    description: '개발팀 32인치 모니터 2대', approvers: [{ name: '전천일', status: 'rejected' }] },
];

// 데모 워크플로우 정의
const MOCK_WF_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wfd-expense', tenantId: 'demo', name: '지출 결재', description: '지출 결재 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 48, isActive: true,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    steps: [
      { id: 's1', order: 0, name: '팀장 검토', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
      { id: 's2', order: 1, name: '재무팀 검토', type: 'approval', assigneeRule: { type: 'role', value: '재무' }, timeoutHours: 24 },
      { id: 's3', order: 2, name: '최종 승인', type: 'approval', assigneeRule: { type: 'role', value: '대표' }, timeoutHours: 48 },
    ],
  },
  {
    id: 'wfd-leave', tenantId: 'demo', name: '휴가 결재', description: '휴가 신청 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 24, isActive: true,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    steps: [
      { id: 's1', order: 0, name: '팀장 승인', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
    ],
  },
  {
    id: 'wfd-purchase', tenantId: 'demo', name: '구매 결재', description: '구매 요청 프로세스',
    layer: 'company', triggerType: 'manual', slaHours: 72, isActive: true,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    steps: [
      { id: 's1', order: 0, name: '팀장 검토', type: 'approval', assigneeRule: { type: 'manager' }, timeoutHours: 24 },
      { id: 's2', order: 1, name: '구매팀 검토', type: 'approval', assigneeRule: { type: 'role', value: '구매' }, timeoutHours: 24 },
      { id: 's3', order: 2, name: '최종 승인', type: 'approval', assigneeRule: { type: 'role', value: '대표' }, timeoutHours: 48 },
    ],
  },
];

// 데모 워크플로우 인스턴스 (이미 진행 중인 건)
const MOCK_WF_INSTANCES: Record<string, WorkflowInstance> = {
  a1: {
    id: 'wi-a1', tenantId: 'demo', definitionId: 'wfd-expense', definitionName: '지출 결재',
    currentStepIndex: 1, status: 'running', startedBy: '전천일', startedAt: '2026-03-25T09:00:00Z',
    context: { approvalId: 'a1', title: 'MADLeague S7 시상금 집행' }, slaDeadline: '2026-03-27T09:00:00Z',
    stepHistory: [{ stepId: 's1', stepName: '팀장 검토', action: 'approve', actorId: '김관리', completedAt: '2026-03-25T14:00:00Z', durationMinutes: 300 }],
  },
  a3: {
    id: 'wi-a3', tenantId: 'demo', definitionId: 'wfd-purchase', definitionName: '구매 결재',
    currentStepIndex: 0, status: 'running', startedBy: '최디자인', startedAt: '2026-03-23T10:00:00Z',
    context: { approvalId: 'a3', title: 'Figma Enterprise 라이선스 구매' }, slaDeadline: '2026-03-26T10:00:00Z',
    stepHistory: [],
  },
};

// DB 행 → ApprovalItem 매핑
function mapRow(row: any): ApprovalItem {
  return {
    id: row.id,
    title: row.title || '',
    type: row.type || '기타',
    requester: row.requester_name || row.requester_id || '',
    amount: row.amount ?? undefined,
    status: row.status || 'pending',
    createdAt: row.created_at ? row.created_at.split('T')[0] : '',
    description: row.description || '',
    approvers: Array.isArray(row.approvers) ? row.approvers : [],
    workflowInstanceId: row.workflow_instance_id || undefined,
  };
}

/* ── 워크플로우 진행 시각화 컴포넌트 ── */
function WorkflowProgress({ instance, definition }: { instance: WorkflowInstance; definition?: WorkflowDefinition }) {
  const steps = definition?.steps || [];
  if (steps.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-3 flex items-center gap-1">
        <Zap size={10} className="text-indigo-400" /> 워크플로우: {instance.definitionName}
        {instance.status === 'rejected' && <span className="text-red-400 ml-2">반려됨</span>}
        {instance.status === 'completed' && <span className="text-emerald-400 ml-2">완료</span>}
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const isCompleted = i < instance.currentStepIndex || instance.status === 'completed';
          const isCurrent = i === instance.currentStepIndex && instance.status === 'running';
          const isRejected = instance.status === 'rejected' && i === instance.currentStepIndex;

          let Icon = Circle;
          let color = 'text-slate-600';
          let bg = 'border-white/5 bg-white/[0.02]';

          if (isCompleted) {
            const historyItem = instance.stepHistory[i];
            if (historyItem?.action === 'reject') {
              Icon = X; color = 'text-red-400'; bg = 'border-red-500/20 bg-red-500/5';
            } else {
              Icon = CheckCircle2; color = 'text-emerald-400'; bg = 'border-emerald-500/20 bg-emerald-500/5';
            }
          } else if (isCurrent) {
            Icon = Zap; color = 'text-indigo-400'; bg = 'border-indigo-500/30 bg-indigo-500/5';
          } else if (isRejected) {
            Icon = X; color = 'text-red-400'; bg = 'border-red-500/20 bg-red-500/5';
          }

          return (
            <div key={step.id} className="flex items-center gap-1">
              <div className={`rounded-lg border p-2 min-w-[100px] ${bg}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon size={10} className={color} />
                  <span className="text-[10px] font-semibold">{step.name}</span>
                </div>
                <div className="text-[9px] text-slate-600">
                  {step.assigneeRule.type === 'manager' ? '직속 상위' : step.assigneeRule.value || step.assigneeRule.type}
                </div>
                {isCompleted && instance.stepHistory[i] && (
                  <div className="text-[9px] text-slate-600 mt-0.5">
                    {Math.round(instance.stepHistory[i].durationMinutes / 60)}h
                    {instance.stepHistory[i].comment && (
                      <span className="ml-1" title={instance.stepHistory[i].comment}>
                        <MessageSquare size={7} className="inline" />
                      </span>
                    )}
                  </div>
                )}
              </div>
              {i < steps.length - 1 && <ArrowRight size={10} className="text-slate-700 shrink-0" />}
            </div>
          );
        })}
      </div>
      {/* SLA 표시 */}
      {instance.status === 'running' && (
        <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1">
          <Clock size={9} />
          SLA 마감: {new Date(instance.slaDeadline).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {new Date(instance.slaDeadline) < new Date() && (
            <span className="text-red-400 font-semibold ml-1">SLA 초과!</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 새 기안 모달 ── */
function NewApprovalModal({
  open, onClose, definitions, isDemo, tenantId, memberId,
  onCreated,
}: {
  open: boolean; onClose: () => void;
  definitions: WorkflowDefinition[];
  isDemo: boolean; tenantId: string; memberId: string;
  onCreated: (item: ApprovalItem, instance: WorkflowInstance) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ApprovalType>('지출');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDefId, setSelectedDefId] = useState(definitions[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (definitions.length > 0 && !selectedDefId) setSelectedDefId(definitions[0].id);
  }, [definitions, selectedDefId]);

  if (!open) return null;

  const TYPE_TO_DEF: Record<ApprovalType, string> = {
    '지출': 'wfd-expense', '휴가': 'wfd-leave', '구매': 'wfd-purchase', '계약': 'wfd-expense', '기타': 'wfd-expense',
  };

  // 유형 변경 시 자동으로 워크플로우 정의 선택
  const handleTypeChange = (t: ApprovalType) => {
    setType(t);
    const matchDef = definitions.find(d => d.id === TYPE_TO_DEF[t]) || definitions[0];
    if (matchDef) setSelectedDefId(matchDef.id);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const selectedDef = definitions.find(d => d.id === selectedDefId);

      if (isDemo) {
        // 데모: 로컬로 만들기
        const now = new Date();
        const mockInstance: WorkflowInstance = {
          id: `wi-${Date.now()}`, tenantId: 'demo', definitionId: selectedDefId,
          definitionName: selectedDef?.name || '결재', currentStepIndex: 0, status: 'running',
          startedBy: memberId, startedAt: now.toISOString(),
          context: { title }, stepHistory: [],
          slaDeadline: new Date(now.getTime() + (selectedDef?.slaHours || 48) * 3600000).toISOString(),
        };
        const newItem: ApprovalItem = {
          id: `a-${Date.now()}`, title, type, requester: memberId,
          amount: amount ? parseInt(amount) : undefined,
          status: 'pending', createdAt: now.toISOString().split('T')[0],
          description, approvers: (selectedDef?.steps || []).map(s => ({
            name: s.assigneeRule.value || s.assigneeRule.type, status: 'pending' as ApprovalStatus,
          })),
          workflowInstanceId: mockInstance.id,
        };
        onCreated(newItem, mockInstance);
        onClose();
        return;
      }

      // 실제: startWorkflow 호출
      const wfInstance = await startWorkflow(tenantId, selectedDefId, memberId, { title, type, amount: amount ? parseInt(amount) : 0 });
      if (!wfInstance) throw new Error('워크플로우 시작 실패');

      // approval_requests 테이블에도 저장
      const sb = createClient();
      const { data, error } = await sb.from('approval_requests').insert({
        tenant_id: tenantId,
        title, type, description,
        amount: amount ? parseInt(amount) : null,
        requester_id: memberId,
        requester_name: memberId,
        status: 'pending',
        workflow_instance_id: wfInstance.id,
        approvers: JSON.stringify((selectedDef?.steps || []).map(s => ({
          name: s.assigneeRule.value || s.assigneeRule.type, status: 'pending',
        }))),
        created_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      const newItem = mapRow(data);
      onCreated(newItem, wfInstance);
      onClose();
    } catch (err) {
      console.error('[approval] 기안 생성 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const types: ApprovalType[] = ['지출', '휴가', '구매', '계약', '기타'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F0F23] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={16} className="text-indigo-400" /> 새 결재 요청</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">제목</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="결재 제목을 입력하세요"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">유형</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value as ApprovalType)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                {types.map(t => <option key={t} value={t} className="bg-[#0F0F23]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">금액 (원)</label>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">설명</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="결재 내용을 설명하세요"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">결재 라인 (워크플로우)</label>
            <select value={selectedDefId} onChange={e => setSelectedDefId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
              {definitions.map(d => (
                <option key={d.id} value={d.id} className="bg-[#0F0F23]">{d.name} ({d.steps.length}단계, SLA {d.slaHours}h)</option>
              ))}
            </select>
            {/* 선택한 워크플로우 스텝 미리보기 */}
            {(() => {
              const def = definitions.find(d => d.id === selectedDefId);
              if (!def) return null;
              return (
                <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1">
                  {def.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-1">
                      <span className="text-[10px] px-2 py-1 rounded border border-white/5 bg-white/[0.03] text-slate-400">
                        {step.name}
                      </span>
                      {i < def.steps.length - 1 && <ArrowRight size={8} className="text-slate-700" />}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg border border-white/5 hover:border-white/10 transition-colors">
            취소
          </button>
          <button onClick={handleSubmit} disabled={submitting || !title.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {submitting ? <div className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Stamp size={13} />}
            기안 제출
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('received');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [approvals, setApprovals] = useState<ApprovalItem[]>(isDemo ? MOCK_APPROVALS : []);
  const [loading, setLoading] = useState(!isDemo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [comment, setComment] = useState('');

  // 워크플로우 정의 목록
  const [wfDefinitions, setWfDefinitions] = useState<WorkflowDefinition[]>(isDemo ? MOCK_WF_DEFINITIONS : []);
  // 워크플로우 인스턴스 캐시 (approvalId → instance)
  const [wfInstances, setWfInstances] = useState<Record<string, WorkflowInstance>>(isDemo ? MOCK_WF_INSTANCES : {});

  // 워크플로우 정의 로드
  const loadDefinitions = useCallback(async () => {
    if (isDemo) return;
    try {
      const defs = await fetchWorkflowDefinitions(tenant!.id);
      if (defs.length > 0) {
        setWfDefinitions(defs.filter(d => d.isActive));
      } else {
        setWfDefinitions(MOCK_WF_DEFINITIONS);
      }
    } catch {
      setWfDefinitions(MOCK_WF_DEFINITIONS);
    }
  }, [isDemo, tenant]);

  // Supabase에서 결재 목록 로드
  const loadApprovals = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('approval_requests')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const items = data.map(mapRow);
        setApprovals(items);
        // 워크플로우 인스턴스 로드
        const instanceIds = items.filter(a => a.workflowInstanceId).map(a => a.workflowInstanceId!);
        if (instanceIds.length > 0) {
          const instanceMap: Record<string, WorkflowInstance> = {};
          await Promise.all(instanceIds.map(async (iid) => {
            const inst = await getInstance(iid);
            if (inst) {
              // approvalId 매핑: context에서 찾기 또는 item에서 찾기
              const matchItem = items.find(a => a.workflowInstanceId === iid);
              if (matchItem) instanceMap[matchItem.id] = inst;
            }
          }));
          setWfInstances(instanceMap);
        }
      } else {
        setApprovals(MOCK_APPROVALS);
        setWfInstances(MOCK_WF_INSTANCES);
      }
    } catch {
      setApprovals(MOCK_APPROVALS);
      setWfInstances(MOCK_WF_INSTANCES);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadDefinitions(); }, [loadDefinitions]);
  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  // 결재 승인/반려 → 워크플로우 advanceStep 호출
  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const wfAction = action === 'approved' ? 'approve' : 'reject';
    const instance = wfInstances[id];

    if (isDemo) {
      // 데모: 로컬 상태만 업데이트
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
      if (instance) {
        const now = new Date();
        const def = wfDefinitions.find(d => d.id === instance.definitionId);
        const currentStep = def?.steps[instance.currentStepIndex];
        const newHistory = [...instance.stepHistory, {
          stepId: currentStep?.id || 'unknown', stepName: currentStep?.name || '결재',
          action: wfAction as any, actorId: member?.userId || 'demo-user',
          comment: comment || undefined, completedAt: now.toISOString(), durationMinutes: 0,
        }];
        if (action === 'rejected') {
          setWfInstances(prev => ({ ...prev, [id]: { ...instance, status: 'rejected', stepHistory: newHistory, completedAt: now.toISOString() } }));
        } else {
          const nextIndex = instance.currentStepIndex + 1;
          const isLast = nextIndex >= (def?.steps.length || 0);
          setWfInstances(prev => ({
            ...prev,
            [id]: {
              ...instance,
              currentStepIndex: isLast ? instance.currentStepIndex : nextIndex,
              status: isLast ? 'completed' : 'running',
              stepHistory: newHistory,
              ...(isLast ? { completedAt: now.toISOString() } : {}),
            },
          }));
          if (isLast) {
            setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
          }
        }
      }
      setComment('');
      return;
    }

    try {
      // 워크플로우 엔진으로 스텝 진행
      if (instance) {
        const updated = await advanceStep(instance.id, wfAction, member?.userId || '', comment || undefined);
        if (updated) {
          setWfInstances(prev => ({ ...prev, [id]: updated }));
          // 워크플로우가 완료/반려되면 approval 상태도 업데이트
          if (updated.status === 'completed' || updated.status === 'rejected') {
            const finalStatus = updated.status === 'completed' ? 'approved' : 'rejected';
            const sb = createClient();
            await sb.from('approval_requests').update({ status: finalStatus, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant!.id);
            setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: finalStatus } : a));
          }
        }
      } else {
        // 워크플로우 없이 단순 승인/반려
        const sb = createClient();
        const { error } = await sb.from('approval_requests').update({ status: action, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant!.id);
        if (!error) {
          setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
        }
      }
    } catch { /* 실패 시 무시 */ }
    setComment('');
  };

  // 새 기안 생성 콜백
  const handleNewApproval = (item: ApprovalItem, instance: WorkflowInstance) => {
    setApprovals(prev => [item, ...prev]);
    setWfInstances(prev => ({ ...prev, [item.id]: instance }));
  };

  const types: ApprovalType[] = ['지출', '휴가', '구매', '계약', '기타'];
  const filtered = approvals.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Stamp className="w-5 h-5 text-indigo-400" /> 전자결재</h1>
          <p className="text-sm text-slate-500 mt-0.5">결재 요청, 승인, 반려{isDemo ? ' (데모)' : ''}</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 새 기안
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">대기</div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">승인</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">반려</div>
          <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
        </div>
      </div>

      {/* Tabs + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {([['received', '받은 결재'], ['sent', '보낸 결재'], ['all', '전체']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tab === id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {label} {id === 'received' && stats.pending > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{stats.pending}</span>}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none">
          <option value="all" className="bg-[#0F0F23]">전체 유형</option>
          {types.map(t => <option key={t} value={t} className="bg-[#0F0F23]">{t}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">결재 목록 로딩 중...</p>
        </div>
      )}

      {/* Approval List */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(item => {
            const st = STATUS_CONFIG[item.status];
            const StatusIcon = st.icon;
            const isExpanded = selectedId === item.id;
            const wfInstance = wfInstances[item.id];
            const wfDef = wfInstance ? wfDefinitions.find(d => d.id === wfInstance.definitionId) : undefined;

            return (
              <div key={item.id}
                className={`border rounded-xl bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'border-indigo-500/30' : 'border-white/5 hover:border-indigo-500/20'}`}
                onClick={() => setSelectedId(isExpanded ? null : item.id)}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.color}`}>
                          <StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />{st.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{item.type}</span>
                        {wfInstance && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            <Zap size={8} className="inline mr-0.5" />{wfInstance.definitionName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-600 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>요청: {item.requester}</span>
                      <span>{item.createdAt}</span>
                      {item.amount && <span className="text-indigo-400 font-mono">{'\u20A9'}{(item.amount / 10000).toFixed(0)}만</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.approvers.map((ap, i) => {
                        const apSt = STATUS_CONFIG[ap.status];
                        return (
                          <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${apSt.color}`}>{ap.name}</span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 워크플로우 진행 시각화 */}
                  {wfInstance && <WorkflowProgress instance={wfInstance} definition={wfDef} />}
                </div>

                {/* 확장 영역: 승인/반려 액션 */}
                {isExpanded && item.status === 'pending' && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 block mb-1">코멘트 (선택)</label>
                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="의견을 입력하세요"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <button onClick={() => handleAction(item.id, 'approved')}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                        <Check size={12} /> 승인
                      </button>
                      <button onClick={() => handleAction(item.id, 'rejected')}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors">
                        <X size={12} /> 반려
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <Stamp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">결재 내역이 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* 새 기안 모달 */}
      <NewApprovalModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        definitions={wfDefinitions}
        isDemo={isDemo}
        tenantId={tenant?.id || 'demo'}
        memberId={member?.userId || 'demo-user'}
        onCreated={handleNewApproval}
      />
    </div>
  );
}
