"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { AutomationCard } from "@/components/smarcomm/workflow/AutomationCard";
import { AutomationBuilder } from "@/components/smarcomm/workflow/AutomationBuilder";
import { AutomationRule } from "@/types/workflow";
import { Plus, Zap, Power, AlertCircle } from "lucide-react";
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

export default function AutomationPage() {
  const { automations, addAutomation, updateAutomation, toggleAutomation, deleteAutomation } = useWorkflow();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const activeCount = automations.filter(a => a.enabled).length;
  const handleEdit = (rule: AutomationRule) => { setEditingRule(rule); setIsBuilderOpen(true); };
  const handleSave = (rule: AutomationRule) => { editingRule ? updateAutomation(rule.id, rule) : addAutomation(rule); };

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">자동화</h1><GuideHelpButton /></div>
          <p className="text-xs text-text-muted mt-0.5">자동화 규칙을 설정하고 관리합니다</p>
        </div>
        <button onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
          <Plus className="h-3.5 w-3.5" /> 새 자동화
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ icon: Zap, label: '활성 규칙', value: activeCount }, { icon: Power, label: '전체 규칙', value: automations.length }, { icon: AlertCircle, label: '비활성', value: automations.length - activeCount }].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-1"><s.icon className="h-3.5 w-3.5 text-text-muted" /><span className="text-[10px] text-text-muted">{s.label}</span></div>
            <p className="text-xl font-bold text-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {automations.map(rule => <AutomationCard key={rule.id} rule={rule} onToggle={toggleAutomation} onEdit={handleEdit} onDelete={deleteAutomation} />)}
        {automations.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-border bg-white text-center py-16">
            <Zap className="h-8 w-8 text-text-muted/20 mx-auto mb-3" />
            <p className="text-sm text-text-muted">자동화 규칙이 없습니다</p>
            <p className="text-xs text-text-muted/50 mt-1">새 자동화를 만들어 업무를 효율화하세요</p>
          </div>
        )}
      </div>

      <AutomationBuilder isOpen={isBuilderOpen} onClose={() => { setIsBuilderOpen(false); setEditingRule(null); }} onSave={handleSave} editingRule={editingRule} />
    </div>
  );
}
