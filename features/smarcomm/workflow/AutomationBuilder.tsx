"use client";

import { useState } from "react";
import { AutomationRule, TriggerType, ActionType, AutomationCondition } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { X, Plus, Zap, ArrowDown } from "lucide-react";

interface AutomationBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: AutomationRule) => void;
  editingRule?: AutomationRule | null;
}

const triggerOptions: { type: TriggerType; label: string }[] = [
  { type: 'task_status_change', label: 'Task 상태 변경' },
  { type: 'new_content', label: '새 콘텐츠 생성' },
  { type: 'schedule', label: '스케줄 실행' },
  { type: 'manual', label: '수동 실행' },
];

const actionOptions: { type: ActionType; label: string }[] = [
  { type: 'move_task', label: 'Task 이동' },
  { type: 'notify', label: '알림 전송' },
  { type: 'create_task', label: 'Task 생성' },
  { type: 'update_status', label: '상태 변경' },
];

export function AutomationBuilder({ isOpen, onClose, onSave, editingRule }: AutomationBuilderProps) {
  const [name, setName] = useState(editingRule?.name ?? '');
  const [description, setDescription] = useState(editingRule?.description ?? '');
  const [brandId, setBrandId] = useState(editingRule?.brandId ?? 'general');
  const [triggerType, setTriggerType] = useState<TriggerType>(editingRule?.trigger.type ?? 'task_status_change');
  const [conditions, setConditions] = useState<AutomationCondition[]>(editingRule?.conditions ?? []);
  const [selectedActions, setSelectedActions] = useState<ActionType[]>(editingRule?.actions.map(a => a.type) ?? ['notify']);

  if (!isOpen) return null;

  const addCondition = () => setConditions([...conditions, { field: 'status', operator: 'equals', value: '' }]);
  const removeCondition = (idx: number) => setConditions(conditions.filter((_, i) => i !== idx));
  const updateCondition = (idx: number, updates: Partial<AutomationCondition>) => setConditions(conditions.map((c, i) => i === idx ? { ...c, ...updates } : c));
  const toggleAction = (type: ActionType) => {
    if (selectedActions.includes(type)) { if (selectedActions.length > 1) setSelectedActions(selectedActions.filter(a => a !== type)); }
    else setSelectedActions([...selectedActions, type]);
  };

  const handleSave = () => {
    const triggerLabel = triggerOptions.find(t => t.type === triggerType)?.label ?? triggerType;
    onSave({
      id: editingRule?.id ?? `auto${Date.now()}`, name, description, brandId,
      trigger: { type: triggerType, label: triggerLabel, config: {} },
      conditions,
      actions: selectedActions.map(type => ({ type, label: actionOptions.find(a => a.type === type)?.label ?? type, config: {} })),
      enabled: editingRule?.enabled ?? true,
      createdAt: editingRule?.createdAt ?? new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const inputClass = "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none";
  const smallInputClass = "rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text focus:border-text focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-text-sub" />
            <h3 className="text-base font-bold text-text">{editingRule ? '자동화 수정' : '새 자동화'}</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="자동화 이름" className={inputClass} />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="설명" rows={2} className={`${inputClass} resize-none`} />
            <select value={brandId} onChange={e => setBrandId(e.target.value)} className={inputClass}>
              {workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-sub mb-2">1. 트리거 (When)</h4>
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="grid grid-cols-2 gap-2">
                {triggerOptions.map(opt => (
                  <button key={opt.type} onClick={() => setTriggerType(opt.type)}
                    className={`rounded-xl border px-3 py-2 text-xs text-left transition-colors ${triggerType === opt.type ? 'border-text bg-text text-white' : 'border-border text-text-sub hover:border-text-muted'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-text-muted/30" /></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-text-sub">2. 조건 (If)</h4>
              <button onClick={addCondition} className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text"><Plus className="h-3 w-3" /> 추가</button>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
              {conditions.length === 0 ? (
                <p className="text-[10px] text-text-muted text-center py-2">조건 없음 (항상 실행)</p>
              ) : conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select value={cond.field} onChange={e => updateCondition(idx, { field: e.target.value })} className={smallInputClass}>
                    <option value="status">상태</option><option value="priority">우선순위</option><option value="brandId">채널</option><option value="assignee">담당자</option>
                  </select>
                  <select value={cond.operator} onChange={e => updateCondition(idx, { operator: e.target.value as AutomationCondition['operator'] })} className={smallInputClass}>
                    <option value="equals">같음</option><option value="not_equals">다름</option><option value="contains">포함</option>
                  </select>
                  <input value={cond.value} onChange={e => updateCondition(idx, { value: e.target.value })} placeholder="값" className={`flex-1 ${smallInputClass}`} />
                  <button onClick={() => removeCondition(idx)} className="text-text-muted hover:text-danger"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-text-muted/30" /></div>

          <div>
            <h4 className="text-xs font-semibold text-text-sub mb-2">3. 액션 (Then)</h4>
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="grid grid-cols-2 gap-2">
                {actionOptions.map(opt => (
                  <button key={opt.type} onClick={() => toggleAction(opt.type)}
                    className={`rounded-xl border px-3 py-2 text-xs text-left transition-colors ${selectedActions.includes(opt.type) ? 'border-text bg-text text-white' : 'border-border text-text-sub hover:border-text-muted'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text">취소</button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 rounded-xl bg-text text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">{editingRule ? '저장' : '생성'}</button>
        </div>
      </div>
    </div>
  );
}
