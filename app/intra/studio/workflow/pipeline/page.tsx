"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { PipelineStage } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Sparkles, Filter } from "lucide-react";

const stages: { key: PipelineStage; label: string }[] = [
    { key: 'Idea', label: 'Idea' },
    { key: 'Scripting', label: 'Scripting' },
    { key: 'Production', label: 'Production' },
    { key: 'Review', label: 'Review' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Published', label: 'Published' },
];

export default function PipelinePage() {
    const { pipelineItems, movePipelineItem } = useWorkflow();
    const [brandFilter, setBrandFilter] = useState<string>('all');

    const filteredItems = brandFilter === 'all'
        ? pipelineItems
        : pipelineItems.filter(item => item.brandId === brandFilter);

    const getBrandName = (brandId: string) =>
        brands.find(b => b.id === brandId)?.name ?? brandId;

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        if (itemId) movePipelineItem(itemId, stage);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('ring-2', 'ring-neutral-400');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('ring-2', 'ring-neutral-400');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Content Pipeline</h2>
                    <p className="mt-2 text-neutral-500">콘텐츠 제작 흐름을 단계별로 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                    >
                        <option value="all">All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3 overflow-x-auto">
                {stages.map((stage) => {
                    const stageItems = filteredItems.filter(item => item.stage === stage.key);
                    return (
                        <div
                            key={stage.key}
                            className="border border-neutral-200 bg-white p-3 min-h-[400px] transition-all"
                            onDrop={(e) => handleDrop(e, stage.key)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-neutral-500">{stage.key}</h3>
                                <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500">
                                    {stageItems.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {stageItems.map((item) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        className="border border-neutral-200 bg-white p-3 cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="text-sm font-medium leading-tight">{item.title}</p>
                                            {item.aiGenerated && <Sparkles className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />}
                                        </div>
                                        <p className="text-xs text-neutral-400 mt-1.5">{getBrandName(item.brandId)}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-neutral-300">{item.type}</span>
                                            {item.dueDate && (
                                                <span className="text-xs text-neutral-300">{item.dueDate}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
