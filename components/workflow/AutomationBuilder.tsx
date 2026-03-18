"use client";

import { useState } from "react";
import { AutomationRule, TriggerType, ActionType, AutomationCondition } from "@/types/workflow";
import { brands } from "@/lib/data";
import { X, Plus, Zap, ArrowDown } from "lucide-react";

interface AutomationBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: AutomationRule) => void;
    editingRule?: AutomationRule | null;
}

const triggerOptions: { type: TriggerType; label: string }[] = [
    { type: 'task_status_change', label: 'Task Status Changed' },
    { type: 'new_content', label: 'New Content Created' },
    { type: 'schedule', label: 'On Schedule' },
    { type: 'manual', label: 'Manual Trigger' },
];

const actionOptions: { type: ActionType; label: string }[] = [
    { type: 'move_task', label: 'Move Task' },
    { type: 'notify', label: 'Send Notification' },
    { type: 'create_task', label: 'Create Task' },
    { type: 'update_status', label: 'Update Status' },
];

export function AutomationBuilder({ isOpen, onClose, onSave, editingRule }: AutomationBuilderProps) {
    const [name, setName] = useState(editingRule?.name ?? '');
    const [description, setDescription] = useState(editingRule?.description ?? '');
    const [brandId, setBrandId] = useState(editingRule?.brandId ?? 'tenone');
    const [triggerType, setTriggerType] = useState<TriggerType>(editingRule?.trigger.type ?? 'task_status_change');
    const [conditions, setConditions] = useState<AutomationCondition[]>(editingRule?.conditions ?? []);
    const [selectedActions, setSelectedActions] = useState<ActionType[]>(
        editingRule?.actions.map(a => a.type) ?? ['notify']
    );

    if (!isOpen) return null;

    const addCondition = () => {
        setConditions([...conditions, { field: 'status', operator: 'equals', value: '' }]);
    };

    const removeCondition = (idx: number) => {
        setConditions(conditions.filter((_, i) => i !== idx));
    };

    const updateCondition = (idx: number, updates: Partial<AutomationCondition>) => {
        setConditions(conditions.map((c, i) => i === idx ? { ...c, ...updates } : c));
    };

    const toggleAction = (type: ActionType) => {
        if (selectedActions.includes(type)) {
            if (selectedActions.length > 1) {
                setSelectedActions(selectedActions.filter(a => a !== type));
            }
        } else {
            setSelectedActions([...selectedActions, type]);
        }
    };

    const handleSave = () => {
        const triggerLabel = triggerOptions.find(t => t.type === triggerType)?.label ?? triggerType;
        const rule: AutomationRule = {
            id: editingRule?.id ?? `auto${Date.now()}`,
            name,
            description,
            brandId,
            trigger: { type: triggerType, label: triggerLabel, config: {} },
            conditions,
            actions: selectedActions.map(type => ({
                type,
                label: actionOptions.find(a => a.type === type)?.label ?? type,
                config: {},
            })),
            enabled: editingRule?.enabled ?? true,
            createdAt: editingRule?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        onSave(rule);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl mx-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-white">
                            {editingRule ? 'Edit Automation' : 'New Automation'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Automation name"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                        />
                        <select
                            value={brandId}
                            onChange={e => setBrandId(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        >
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    {/* Trigger */}
                    <div>
                        <h4 className="text-sm font-medium text-blue-400 mb-2">1. Trigger (When)</h4>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {triggerOptions.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => setTriggerType(opt.type)}
                                        className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                                            triggerType === opt.type
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowDown className="h-5 w-5 text-zinc-600" />
                    </div>

                    {/* Conditions */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-amber-400">2. Conditions (If)</h4>
                            <button onClick={addCondition} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
                                <Plus className="h-3 w-3" /> Add
                            </button>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
                            {conditions.length === 0 ? (
                                <p className="text-xs text-zinc-600 text-center py-2">No conditions (always triggers)</p>
                            ) : (
                                conditions.map((cond, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <select
                                            value={cond.field}
                                            onChange={e => updateCondition(idx, { field: e.target.value })}
                                            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="status">Status</option>
                                            <option value="priority">Priority</option>
                                            <option value="brandId">Brand</option>
                                            <option value="assignee">Assignee</option>
                                        </select>
                                        <select
                                            value={cond.operator}
                                            onChange={e => updateCondition(idx, { operator: e.target.value as AutomationCondition['operator'] })}
                                            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="equals">equals</option>
                                            <option value="not_equals">not equals</option>
                                            <option value="contains">contains</option>
                                        </select>
                                        <input
                                            value={cond.value}
                                            onChange={e => updateCondition(idx, { value: e.target.value })}
                                            placeholder="value"
                                            className="flex-1 rounded border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                        <button onClick={() => removeCondition(idx)} className="text-zinc-600 hover:text-red-400">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowDown className="h-5 w-5 text-zinc-600" />
                    </div>

                    {/* Actions */}
                    <div>
                        <h4 className="text-sm font-medium text-emerald-400 mb-2">3. Actions (Then)</h4>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {actionOptions.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => toggleAction(opt.type)}
                                        className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                                            selectedActions.includes(opt.type)
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {editingRule ? 'Save Changes' : 'Create Automation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
