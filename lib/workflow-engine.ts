/**
 * Workflow Engine — WIO Orbi
 *
 * 워크플로우 정의(definition) → 인스턴스(instance) → 스텝(step) 실행 엔진.
 * Supabase 테이블: wio_workflow_definitions, wio_workflow_instances, wio_workflow_steps
 *
 * 트리거 타입: manual(수동), event(이벤트), schedule(스케줄)
 * 스텝 타입: task, approval, notification, condition, parallel
 */

import { createClient } from '@/lib/supabase/client';

/* ══════════════════════════════════════════
   타입 정의
   ══════════════════════════════════════════ */

/** 워크플로우 담당자 규칙 */
export interface AssigneeRule {
  type: 'role' | 'specific' | 'manager' | 'submitter';
  /** role일 때 역할 이름, specific일 때 user id */
  value?: string;
}

/** 조건 분기 규칙 */
export interface ConditionRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
  value: unknown;
  /** 조건 충족 시 이동할 step id */
  trueStepId: string;
  /** 조건 미충족 시 이동할 step id */
  falseStepId: string;
}

/** 워크플로우 스텝 정의 */
export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  type: 'task' | 'approval' | 'notification' | 'condition' | 'parallel';
  assigneeRule: AssigneeRule;
  timeoutHours: number;
  /** condition 타입일 때 사용 */
  conditionRule?: ConditionRule;
  /** parallel 타입일 때 병렬 실행할 step id 목록 */
  parallelStepIds?: string[];
  /** notification 타입일 때 메시지 템플릿 */
  notificationTemplate?: string;
}

/** 워크플로우 정의 */
export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  layer: 'company' | 'department';
  triggerType: 'manual' | 'event' | 'schedule';
  /** 이벤트 트리거 시 어떤 이벤트인지 */
  triggerEvent?: string;
  steps: WorkflowStep[];
  slaHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 스텝 실행 결과 */
export interface StepResult {
  stepId: string;
  stepName: string;
  action: 'approve' | 'reject' | 'complete' | 'skip' | 'timeout';
  actorId: string;
  comment?: string;
  completedAt: string;
  /** 스텝 소요 시간(분) */
  durationMinutes: number;
}

/** 워크플로우 인스턴스 */
export interface WorkflowInstance {
  id: string;
  tenantId: string;
  definitionId: string;
  definitionName: string;
  currentStepIndex: number;
  status: 'running' | 'completed' | 'cancelled' | 'timeout' | 'rejected';
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  /** 워크플로우 실행 시 전달된 컨텍스트 데이터 */
  context: Record<string, unknown>;
  stepHistory: StepResult[];
  /** SLA 마감 시각 (startedAt + slaHours) */
  slaDeadline: string;
}

/* ══════════════════════════════════════════
   Supabase 헬퍼 — snake_case ↔ camelCase 변환
   ══════════════════════════════════════════ */

/** snake_case 객체를 camelCase로 변환 */
function toCamel<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

/** camelCase 객체를 snake_case로 변환 */
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

/* ══════════════════════════════════════════
   워크플로우 정의 CRUD
   ══════════════════════════════════════════ */

/** 워크플로우 정의 목록 조회 */
export async function fetchWorkflowDefinitions(
  tenantId: string,
): Promise<WorkflowDefinition[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from('wio_workflow_definitions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[workflow] 정의 목록 조회 실패:', error.message);
    return [];
  }
  return (data || []).map((r: Record<string, unknown>) => {
    const def = toCamel<WorkflowDefinition>(r);
    // steps는 JSON 컬럼 → 파싱
    if (typeof def.steps === 'string') {
      def.steps = JSON.parse(def.steps as unknown as string);
    }
    return def;
  });
}

/** 워크플로우 정의 단건 조회 */
export async function fetchWorkflowDefinition(
  definitionId: string,
): Promise<WorkflowDefinition | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from('wio_workflow_definitions')
    .select('*')
    .eq('id', definitionId)
    .single();

  if (error || !data) return null;
  const def = toCamel<WorkflowDefinition>(data as Record<string, unknown>);
  if (typeof def.steps === 'string') {
    def.steps = JSON.parse(def.steps as unknown as string);
  }
  return def;
}

/** 워크플로우 정의 생성/수정 */
export async function upsertWorkflowDefinition(
  tenantId: string,
  def: Partial<WorkflowDefinition>,
): Promise<WorkflowDefinition | null> {
  const sb = createClient();
  const now = new Date().toISOString();

  const row = toSnake({
    ...def,
    tenantId,
    steps: JSON.stringify(def.steps || []),
    updatedAt: now,
    ...(!def.id ? { createdAt: now } : {}),
  });

  // id가 없으면 insert, 있으면 update
  if (!def.id) {
    delete row.id;
    const { data, error } = await sb
      .from('wio_workflow_definitions')
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error('[workflow] 정의 생성 실패:', error.message);
      return null;
    }
    return toCamel<WorkflowDefinition>(data as Record<string, unknown>);
  }

  const { data, error } = await sb
    .from('wio_workflow_definitions')
    .update(row)
    .eq('id', def.id)
    .select()
    .single();
  if (error) {
    console.error('[workflow] 정의 수정 실패:', error.message);
    return null;
  }
  return toCamel<WorkflowDefinition>(data as Record<string, unknown>);
}

/* ══════════════════════════════════════════
   워크플로우 인스턴스 실행
   ══════════════════════════════════════════ */

/**
 * 워크플로우 시작
 *
 * 1. definition 조회
 * 2. instance 레코드 생성 (status: running, currentStepIndex: 0)
 * 3. SLA 마감 시각 계산
 */
export async function startWorkflow(
  tenantId: string,
  definitionId: string,
  startedBy: string,
  context: Record<string, unknown> = {},
): Promise<WorkflowInstance | null> {
  // 정의 조회
  const def = await fetchWorkflowDefinition(definitionId);
  if (!def || !def.isActive) {
    console.error('[workflow] 정의를 찾을 수 없거나 비활성 상태:', definitionId);
    return null;
  }

  const now = new Date();
  const slaDeadline = new Date(now.getTime() + def.slaHours * 60 * 60 * 1000);

  const sb = createClient();
  const row = {
    tenant_id: tenantId,
    definition_id: definitionId,
    definition_name: def.name,
    current_step_index: 0,
    status: 'running',
    started_by: startedBy,
    started_at: now.toISOString(),
    context: JSON.stringify(context),
    step_history: JSON.stringify([]),
    sla_deadline: slaDeadline.toISOString(),
  };

  const { data, error } = await sb
    .from('wio_workflow_instances')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[workflow] 인스턴스 생성 실패:', error.message);
    return null;
  }

  return parseInstance(data as Record<string, unknown>);
}

/**
 * 스텝 진행 (승인/반려/완료)
 *
 * 1. 현재 인스턴스 조회
 * 2. 현재 스텝에 대한 결과 기록
 * 3. reject면 인스턴스 상태를 'rejected'로
 * 4. 다음 스텝으로 이동 또는 완료 처리
 */
export async function advanceStep(
  instanceId: string,
  action: 'approve' | 'reject' | 'complete',
  actorId: string,
  comment?: string,
): Promise<WorkflowInstance | null> {
  const sb = createClient();

  // 인스턴스 조회
  const { data: raw, error: fetchErr } = await sb
    .from('wio_workflow_instances')
    .select('*')
    .eq('id', instanceId)
    .single();
  if (fetchErr || !raw) {
    console.error('[workflow] 인스턴스 조회 실패:', fetchErr?.message);
    return null;
  }

  const instance = parseInstance(raw as Record<string, unknown>);
  if (instance.status !== 'running') {
    console.error('[workflow] 이미 종료된 워크플로우:', instance.status);
    return instance;
  }

  // 워크플로우 정의에서 스텝 목록 가져오기
  const def = await fetchWorkflowDefinition(instance.definitionId);
  if (!def) return null;

  const currentStep = def.steps[instance.currentStepIndex];
  if (!currentStep) {
    console.error('[workflow] 현재 스텝을 찾을 수 없음:', instance.currentStepIndex);
    return null;
  }

  const now = new Date();
  const startedAt = instance.stepHistory.length > 0
    ? new Date(instance.stepHistory[instance.stepHistory.length - 1].completedAt)
    : new Date(instance.startedAt);
  const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000);

  // 스텝 결과 기록
  const stepResult: StepResult = {
    stepId: currentStep.id,
    stepName: currentStep.name,
    action,
    actorId,
    comment,
    completedAt: now.toISOString(),
    durationMinutes,
  };

  const updatedHistory = [...instance.stepHistory, stepResult];

  // 반려 → 워크플로우 종료
  if (action === 'reject') {
    const { data, error } = await sb
      .from('wio_workflow_instances')
      .update({
        status: 'rejected',
        step_history: JSON.stringify(updatedHistory),
        completed_at: now.toISOString(),
      })
      .eq('id', instanceId)
      .select()
      .single();
    if (error) {
      console.error('[workflow] 반려 처리 실패:', error.message);
      return null;
    }
    return parseInstance(data as Record<string, unknown>);
  }

  // 다음 스텝으로 이동
  const nextIndex = instance.currentStepIndex + 1;
  const isLastStep = nextIndex >= def.steps.length;

  const updateRow: Record<string, unknown> = {
    step_history: JSON.stringify(updatedHistory),
    current_step_index: isLastStep ? instance.currentStepIndex : nextIndex,
  };

  if (isLastStep) {
    updateRow.status = 'completed';
    updateRow.completed_at = now.toISOString();
  }

  const { data, error } = await sb
    .from('wio_workflow_instances')
    .update(updateRow)
    .eq('id', instanceId)
    .select()
    .single();

  if (error) {
    console.error('[workflow] 스텝 진행 실패:', error.message);
    return null;
  }

  return parseInstance(data as Record<string, unknown>);
}

/* ══════════════════════════════════════════
   인스턴스 조회
   ══════════════════════════════════════════ */

/** 테넌트의 활성 인스턴스 목록 */
export async function getActiveInstances(
  tenantId: string,
): Promise<WorkflowInstance[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from('wio_workflow_instances')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'running')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('[workflow] 활성 인스턴스 조회 실패:', error.message);
    return [];
  }
  return (data || []).map((r: Record<string, unknown>) => parseInstance(r));
}

/** 테넌트 전체 인스턴스 목록 (상태 필터 옵션) */
export async function getInstances(
  tenantId: string,
  statusFilter?: WorkflowInstance['status'],
): Promise<WorkflowInstance[]> {
  const sb = createClient();
  let query = sb
    .from('wio_workflow_instances')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('started_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[workflow] 인스턴스 목록 조회 실패:', error.message);
    return [];
  }
  return (data || []).map((r: Record<string, unknown>) => parseInstance(r));
}

/** 단건 인스턴스 조회 */
export async function getInstance(
  instanceId: string,
): Promise<WorkflowInstance | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from('wio_workflow_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  if (error || !data) return null;
  return parseInstance(data as Record<string, unknown>);
}

/* ══════════════════════════════════════════
   SLA 위반 체크
   ══════════════════════════════════════════ */

/**
 * SLA 마감이 지난 활성 인스턴스 조회
 */
export async function checkSLABreaches(
  tenantId: string,
): Promise<WorkflowInstance[]> {
  const sb = createClient();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from('wio_workflow_instances')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'running')
    .lt('sla_deadline', now)
    .order('sla_deadline', { ascending: true });

  if (error) {
    console.error('[workflow] SLA 위반 조회 실패:', error.message);
    return [];
  }
  return (data || []).map((r: Record<string, unknown>) => parseInstance(r));
}

/**
 * SLA 위반 인스턴스를 timeout 상태로 변경
 */
export async function markSLATimeout(
  instanceId: string,
): Promise<WorkflowInstance | null> {
  const sb = createClient();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from('wio_workflow_instances')
    .update({ status: 'timeout', completed_at: now })
    .eq('id', instanceId)
    .eq('status', 'running')
    .select()
    .single();

  if (error) {
    console.error('[workflow] SLA 타임아웃 처리 실패:', error.message);
    return null;
  }
  return parseInstance(data as Record<string, unknown>);
}

/* ══════════════════════════════════════════
   워크플로우 취소
   ══════════════════════════════════════════ */

/** 실행 중인 워크플로우 취소 */
export async function cancelWorkflow(
  instanceId: string,
  actorId: string,
  reason?: string,
): Promise<WorkflowInstance | null> {
  const sb = createClient();
  const now = new Date().toISOString();

  // 현재 인스턴스 조회
  const instance = await getInstance(instanceId);
  if (!instance || instance.status !== 'running') return instance;

  const cancelResult: StepResult = {
    stepId: 'cancel',
    stepName: '워크플로우 취소',
    action: 'skip',
    actorId,
    comment: reason || '사용자에 의한 취소',
    completedAt: now,
    durationMinutes: 0,
  };

  const updatedHistory = [...instance.stepHistory, cancelResult];

  const { data, error } = await sb
    .from('wio_workflow_instances')
    .update({
      status: 'cancelled',
      step_history: JSON.stringify(updatedHistory),
      completed_at: now,
    })
    .eq('id', instanceId)
    .select()
    .single();

  if (error) {
    console.error('[workflow] 취소 처리 실패:', error.message);
    return null;
  }
  return parseInstance(data as Record<string, unknown>);
}

/* ══════════════════════════════════════════
   내부 유틸
   ══════════════════════════════════════════ */

/** DB 로우를 WorkflowInstance로 파싱 */
function parseInstance(row: Record<string, unknown>): WorkflowInstance {
  const inst = toCamel<WorkflowInstance>(row);
  // JSON 컬럼 파싱
  if (typeof inst.context === 'string') {
    inst.context = JSON.parse(inst.context as unknown as string);
  }
  if (typeof inst.stepHistory === 'string') {
    inst.stepHistory = JSON.parse(inst.stepHistory as unknown as string);
  }
  // 배열 보장
  if (!Array.isArray(inst.stepHistory)) {
    inst.stepHistory = [];
  }
  return inst;
}
