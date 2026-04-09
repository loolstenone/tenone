'use client';

import { useRef } from 'react';
import {
  Play, MousePointer,
  Circle, CircleDot, Square, Diamond, Shield, Grip, Timer, Zap, Bell,
} from 'lucide-react';
import {
  type WfNode, type WfEdge, type WfNodeType, type WorkflowTemplate,
  WF_NODE_TYPES, WORKFLOW_TEMPLATES,
} from './settings-data';

function getNodeColor(type: WfNodeType): string {
  switch (type) {
    case 'start': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
    case 'end': return 'bg-red-500/20 border-red-500/40 text-red-400';
    case 'task': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
    case 'condition': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
    case 'approval': return 'bg-violet-500/20 border-violet-500/40 text-violet-400';
    case 'parallel': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
    case 'timer': return 'bg-orange-500/20 border-orange-500/40 text-orange-400';
    case 'action': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
    case 'notify': return 'bg-pink-500/20 border-pink-500/40 text-pink-400';
  }
}

function getNodeIcon(type: WfNodeType) {
  switch (type) {
    case 'start': return <Circle size={14} />;
    case 'end': return <CircleDot size={14} />;
    case 'task': return <Square size={14} />;
    case 'condition': return <Diamond size={14} />;
    case 'approval': return <Shield size={14} />;
    case 'parallel': return <Grip size={14} />;
    case 'timer': return <Timer size={14} />;
    case 'action': return <Zap size={14} />;
    case 'notify': return <Bell size={14} />;
  }
}

interface WorkflowCanvasProps {
  selectedTemplate: WorkflowTemplate;
  setSelectedTemplate: (tpl: WorkflowTemplate) => void;
  selectedWfNode: WfNode | null;
  setSelectedWfNode: (node: WfNode | null) => void;
  selectedWfEdge: WfEdge | null;
  setSelectedWfEdge: (edge: WfEdge | null) => void;
  testRunning: boolean;
  testStep: number;
  startTestRun: () => void;
}

export default function WorkflowCanvas({
  selectedTemplate,
  setSelectedTemplate,
  selectedWfNode,
  setSelectedWfNode,
  selectedWfEdge,
  setSelectedWfEdge,
  testRunning,
  testStep,
  startTestRun,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Template selector at top */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-slate-500 shrink-0">템플릿:</span>
        {WORKFLOW_TEMPLATES.map(tpl => (
          <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl); setSelectedWfNode(null); setSelectedWfEdge(null); }}
            className={`shrink-0 text-[11px] px-3 py-1.5 rounded-lg transition ${
              selectedTemplate.id === tpl.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}>
            {tpl.name}
          </button>
        ))}
        <div className="ml-auto shrink-0">
          <button onClick={startTestRun} disabled={testRunning}
            className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-50">
            <Play size={10} /> {testRunning ? '실행 중...' : '테스트 실행'}
          </button>
        </div>
      </div>

      {/* Node type palette */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5">
        <span className="text-[10px] text-slate-500 mr-1">노드:</span>
        {WF_NODE_TYPES.map(nt => (
          <div key={nt.type}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 cursor-grab text-[10px] text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>{nt.icon}</span>
            <span>{nt.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas + properties side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div ref={canvasRef}
          className="flex-1 relative bg-[#0a0a1a] overflow-auto"
          style={{ minHeight: 350 }}>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              </pattern>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.15)" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {selectedTemplate.edges.map((edge, i) => {
              const fromNode = selectedTemplate.nodes.find(n => n.id === edge.from);
              const toNode = selectedTemplate.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const isSelected = selectedWfEdge?.from === edge.from && selectedWfEdge?.to === edge.to;
              const midX = (fromNode.x + 60 + toNode.x) / 2;
              return (
                <g key={i} onClick={() => { setSelectedWfEdge(edge); setSelectedWfNode(null); }} className="cursor-pointer">
                  <path
                    d={`M ${fromNode.x + 60} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`}
                    fill="none"
                    stroke={isSelected ? '#818cf8' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.condition && (
                    <text x={midX} y={Math.min(fromNode.y, toNode.y) - 8}
                      fill={isSelected ? '#818cf8' : 'rgba(255,255,255,0.25)'}
                      fontSize="9" textAnchor="middle">
                      {edge.condition}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {selectedTemplate.nodes.map((node, i) => {
            const isSelected = selectedWfNode?.id === node.id;
            const isTestActive = testRunning && testStep === i;
            return (
              <div key={node.id}
                onClick={() => { setSelectedWfNode(node); setSelectedWfEdge(null); }}
                className={`absolute flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-all select-none ${getNodeColor(node.type)} ${
                  isSelected ? 'ring-2 ring-indigo-500/60 scale-105' : ''
                } ${isTestActive ? 'ring-2 ring-emerald-400 animate-pulse' : ''}`}
                style={{ left: node.x - 50, top: node.y - 18, minWidth: 100 }}>
                {getNodeIcon(node.type)}
                <div>
                  <p className="text-[11px] font-semibold">{node.label}</p>
                  {node.assignee && <p className="text-[9px] opacity-60">{node.assignee}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Properties slide-in panel */}
        <div className="w-[220px] shrink-0 border-l border-white/5 bg-white/[0.01] overflow-y-auto p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-400">속성</p>
          {selectedWfNode ? (
            <>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">노드 타입</label>
                <div className={`rounded-lg border px-2 py-1.5 text-xs ${getNodeColor(selectedWfNode.type)}`}>
                  {WF_NODE_TYPES.find(t => t.type === selectedWfNode.type)?.icon} {WF_NODE_TYPES.find(t => t.type === selectedWfNode.type)?.label}
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">라벨</label>
                <input value={selectedWfNode.label} readOnly
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
              </div>
              {selectedWfNode.assignee && (
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">담당자 규칙</label>
                  <input value={selectedWfNode.assignee} readOnly
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                </div>
              )}
              {selectedWfNode.timeout && (
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">타임아웃</label>
                  <input value={selectedWfNode.timeout} readOnly
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                </div>
              )}
              {selectedWfNode.escalation && (
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">에스컬레이션</label>
                  <input value={selectedWfNode.escalation} readOnly
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                </div>
              )}
            </>
          ) : selectedWfEdge ? (
            <>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">연결선</label>
                <div className="text-xs text-white">
                  {selectedTemplate.nodes.find(n => n.id === selectedWfEdge.from)?.label}
                  {' → '}
                  {selectedTemplate.nodes.find(n => n.id === selectedWfEdge.to)?.label}
                </div>
              </div>
              {selectedWfEdge.condition && (
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">조건</label>
                  <input value={selectedWfEdge.condition} readOnly
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">조건 타입</label>
                <select className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none">
                  <option className="bg-[#0F0F23]">금액 기준</option>
                  <option className="bg-[#0F0F23]">유형 기준</option>
                  <option className="bg-[#0F0F23]">직급 기준</option>
                  <option className="bg-[#0F0F23]">부서 기준</option>
                </select>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[10px] text-slate-600">
              <MousePointer size={20} className="mx-auto mb-2 opacity-30" />
              노드 또는 연결선을 클릭하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
