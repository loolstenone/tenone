"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/smarcomm/workflow-context";
import { PipelineStage } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { Sparkles, Filter } from "lucide-react";

const stages: { key: PipelineStage; label: string }[] = [
  { key: 'Idea', label: '아이디어' }, { key: 'Scripting', label: '기획' }, { key: 'Production', label: '제작' },
  { key: 'Review', label: '리뷰' }, { key: 'Scheduled', label: '예약' }, { key: 'Published', label: '발행' },
];

export default function PipelinePage() {
  const { pipelineItems, movePipelineItem } = useWorkflow();
  const [brandFilter, setBrandFilter] = useState('all');
  const filteredItems = brandFilter === 'all' ? pipelineItems : pipelineItems.filter(item => item.brandId === brandFilter);
  const getChannelName = (id: string) => workflowChannels.find(c => c.id === id)?.name ?? id;

  const handleDragStart = (e: React.DragEvent, itemId: string) => { e.dataTransfer.setData('text/plain', itemId); };
  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) movePipelineItem(id, stage); e.currentTarget.classList.remove('ring-2', 'ring-text-muted'); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-text-muted'); };
  const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('ring-2', 'ring-text-muted'); };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">콘텐츠 파이프라인</h1>
          <p className="mt-1 text-xs text-text-muted">소재 제작 흐름을 단계별로 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text focus:border-text focus:outline-none">
            <option value="all">전체 채널</option>
            {workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2.5 overflow-x-auto">
        {stages.map(stage => {
          const stageItems = filteredItems.filter(item => item.stage === stage.key);
          return (
            <div key={stage.key} className="rounded-2xl border border-border bg-surface/40 p-3 min-h-[400px] transition-all"
              onDrop={e => handleDrop(e, stage.key)} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-sub">{stage.label}</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-surface text-text-muted rounded">{stageItems.length}</span>
              </div>
              <div className="space-y-2">
                {stageItems.map(item => (
                  <div key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)}
                    className="rounded-xl border border-border bg-white p-3 cursor-grab active:cursor-grabbing hover:border-text-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium text-text leading-tight">{item.title}</p>
                      {item.aiGenerated && <Sparkles className="h-3 w-3 text-text-muted/40 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{getChannelName(item.brandId)}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] text-text-muted/50">{item.type}</span>
                      {item.dueDate && <span className="text-[9px] text-text-muted/50">{item.dueDate}</span>}
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
