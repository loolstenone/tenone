"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { AutomationCard } from "@/components/workflow/AutomationCard";
import { AutomationBuilder } from "@/components/workflow/AutomationBuilder";
import { AutomationRule } from "@/types/workflow";
import { Plus, Zap, Power, AlertCircle } from "lucide-react";

export default function AutomationPage() {
    const { automations, addAutomation, updateAutomation, toggleAutomation, deleteAutomation } = useWorkflow();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

    const activeCount = automations.filter(a => a.enabled).length;

    const handleEdit = (rule: AutomationRule) => {
        setEditingRule(rule);
        setIsBuilderOpen(true);
    };

    const handleSave = (rule: AutomationRule) => {
        if (editingRule) {
            updateAutomation(rule.id, rule);
        } else {
            addAutomation(rule);
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">Automation</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">자동화 규칙을 설정하고 관리합니다</p>
                </div>
                <button
                    onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    새 자동화
                </button>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Zap className="h-4 w-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">활성 규칙</span>
                    </div>
                    <p className="text-xl font-bold">{activeCount}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Power className="h-4 w-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">전체 규칙</span>
                    </div>
                    <p className="text-xl font-bold">{automations.length}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <AlertCircle className="h-4 w-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">비활성</span>
                    </div>
                    <p className="text-xl font-bold">{automations.length - activeCount}</p>
                </div>
            </div>

            {/* 규칙 목록 */}
            <div className="grid gap-3 sm:grid-cols-2">
                {automations.map((rule) => (
                    <AutomationCard
                        key={rule.id}
                        rule={rule}
                        onToggle={toggleAutomation}
                        onEdit={handleEdit}
                        onDelete={deleteAutomation}
                    />
                ))}
                {automations.length === 0 && (
                    <div className="col-span-2 border border-dashed border-neutral-200 bg-white text-center py-16">
                        <Zap className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                        <p className="text-sm text-neutral-400">자동화 규칙이 없습니다</p>
                        <p className="text-xs text-neutral-300 mt-1">새 자동화를 만들어 업무를 효율화하세요</p>
                    </div>
                )}
            </div>

            <AutomationBuilder
                isOpen={isBuilderOpen}
                onClose={() => { setIsBuilderOpen(false); setEditingRule(null); }}
                onSave={handleSave}
                editingRule={editingRule}
            />
        </div>
    );
}
