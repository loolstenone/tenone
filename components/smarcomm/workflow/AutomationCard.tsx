"use client";

import { AutomationRule } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { Zap, Clock, GitBranch, Play } from "lucide-react";

interface AutomationCardProps {
  rule: AutomationRule;
  onToggle: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
}

const triggerIcons: Record<string, typeof Zap> = { task_status_change: GitBranch, new_content: Zap, schedule: Clock, manual: Play };

export function AutomationCard({ rule, onToggle, onEdit, onDelete }: AutomationCardProps) {
  const channelName = workflowChannels.find(c => c.id === rule.brandId)?.name ?? rule.brandId;
  const TriggerIcon = triggerIcons[rule.trigger.type] ?? Zap;

  return (
    <div className={`rounded-2xl border bg-white p-4 transition-all ${rule.enabled ? 'border-border hover:border-text-muted/40' : 'border-border/50 opacity-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-surface rounded-lg"><TriggerIcon className="h-4 w-4 text-text-muted" /></div>
          <div>
            <h3 className="text-xs font-semibold text-text">{rule.name}</h3>
            <p className="text-[9px] text-text-muted">{channelName}</p>
          </div>
        </div>
        <button onClick={() => onToggle(rule.id)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rule.enabled ? 'bg-text' : 'bg-border'}`}>
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      </div>
      <p className="text-[10px] text-text-muted mt-2 leading-relaxed">{rule.description}</p>
      <div className="mt-2.5 flex items-center gap-1.5 text-[9px]">
        <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600">{rule.trigger.label}</span>
        {rule.conditions.length > 0 && (<><span className="text-text-muted/30">→</span><span className="px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-600">{rule.conditions.length} 조건</span></>)}
        <span className="text-text-muted/30">→</span>
        <span className="px-1.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-600">{rule.actions.length} 액션</span>
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border">
        <span className="text-[8px] text-text-muted/50">{rule.lastTriggered ? `최근: ${rule.lastTriggered}` : '실행 기록 없음'}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(rule)} className="text-[10px] text-text-muted hover:text-text">수정</button>
          <button onClick={() => onDelete(rule.id)} className="text-[10px] text-text-muted/50 hover:text-danger">삭제</button>
        </div>
      </div>
    </div>
  );
}
