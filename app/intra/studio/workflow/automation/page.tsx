"use client";

import { useState, useEffect } from "react";
import { fetchAutomations, toggleAutomationEnabled } from "@/lib/supabase/workflow";
import { initialAutomations } from "@/lib/workflow-data";
import { AutomationCard } from "@/components/workflow/AutomationCard";
import { AutomationBuilder } from "@/components/workflow/AutomationBuilder";
import { AutomationRule } from "@/types/workflow";
import { Plus, Zap, Power, AlertCircle, Loader2 } from "lucide-react";

export default function AutomationPage() {
    const [automations, setAutomations] = useState<AutomationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchAutomations()
            .then(a => { if (!cancelled) setAutomations(a.length > 0 ? a : initialAutomations); })
            .catch(() => { if (!cancelled) setAutomations(initialAutomations); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const addAutomation = (rule: AutomationRule) => {
        setAutomations(prev => [rule, ...prev]);
    };

    const updateAutomation = (id: string, updates: Partial<AutomationRule>) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const toggleAutomation = (id: string) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
        const rule = automations.find(a => a.id === id);
        if (rule) toggleAutomationEnabled(id, !rule.enabled).catch(() => {});
    };

    const deleteAutomation = (id: string) => {
        setAutomations(prev => prev.filter(a => a.id !== id));
    };

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

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">Automation</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">자동화 규칙을 설정하고 관리합니다</p>
                </div>
                <button
                    onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
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
