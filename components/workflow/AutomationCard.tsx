"use client";

import { AutomationRule } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Zap, Clock, GitBranch, Play, MoreHorizontal } from "lucide-react";

interface AutomationCardProps {
    rule: AutomationRule;
    onToggle: (id: string) => void;
    onEdit: (rule: AutomationRule) => void;
    onDelete: (id: string) => void;
}

const triggerIcons: Record<string, typeof Zap> = {
    task_status_change: GitBranch,
    new_content: Zap,
    schedule: Clock,
    manual: Play,
};

export function AutomationCard({ rule, onToggle, onEdit, onDelete }: AutomationCardProps) {
    const brandName = brands.find(b => b.id === rule.brandId)?.name ?? rule.brandId;
    const TriggerIcon = triggerIcons[rule.trigger.type] ?? Zap;

    return (
        <div className={`rounded-xl border bg-white p-5 transition-all ${
            rule.enabled ? 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm' : 'border-neutral-200 opacity-60'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${rule.enabled ? 'bg-amber-50' : 'bg-neutral-100'}`}>
                        <TriggerIcon className={`h-5 w-5 ${rule.enabled ? 'text-amber-500' : 'text-neutral-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{rule.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{brandName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggle(rule.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            rule.enabled ? 'bg-neutral-900' : 'bg-neutral-300'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-neutral-500 mt-3">{rule.description}</p>

            {/* Flow visualization */}
            <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">{rule.trigger.label}</span>
                {rule.conditions.length > 0 && (
                    <>
                        <span className="text-neutral-300">→</span>
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-600">
                            {rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}
                        </span>
                    </>
                )}
                <span className="text-neutral-300">→</span>
                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600">
                    {rule.actions.length} action{rule.actions.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
                <div className="text-xs text-neutral-400">
                    {rule.lastTriggered
                        ? `Last triggered: ${rule.lastTriggered}`
                        : 'Never triggered'}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(rule)}
                        className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(rule.id)}
                        className="text-xs text-red-400 hover:text-red-500 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
