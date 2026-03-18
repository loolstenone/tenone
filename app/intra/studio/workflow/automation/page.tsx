"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { AutomationCard } from "@/components/workflow/AutomationCard";
import { AutomationBuilder } from "@/components/workflow/AutomationBuilder";
import { AutomationRule } from "@/types/workflow";
import { Plus, Zap } from "lucide-react";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Automation</h2>
                    <p className="mt-2 text-zinc-400">자동화 규칙을 설정하고 관리합니다.</p>
                </div>
                <button
                    onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Automation
                </button>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white">{activeCount}</p>
                        <p className="text-xs text-zinc-500">Active Rules</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div>
                    <p className="text-lg font-bold text-white">{automations.length}</p>
                    <p className="text-xs text-zinc-500">Total Rules</p>
                </div>
            </div>

            {/* Rules List */}
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="col-span-2 text-center py-16 text-zinc-500">
                        No automation rules yet. Create one to get started.
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
