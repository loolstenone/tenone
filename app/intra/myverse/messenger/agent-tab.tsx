"use client";

import clsx from "clsx";
import { Bot, Cloud, Monitor, ChevronRight } from "lucide-react";
import type { AgentProfileExtended } from "@/types/messenger";

interface AgentTabProps {
    agents: AgentProfileExtended[];
    selectedAgentDM: string | null;
    onSelectAgent: (agent: AgentProfileExtended) => void;
}

const layerLabels: Record<number, string> = {
    0: 'L0 Meta',
    1: 'L1 Infra',
    2: 'L2 Brand',
    3: 'L3 Sub',
};

const layerColors: Record<number, string> = {
    0: 'bg-amber-100 text-amber-700',
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-emerald-100 text-emerald-700',
    3: 'bg-neutral-100 text-neutral-500',
};

export default function AgentTab({ agents, selectedAgentDM, onSelectAgent }: AgentTabProps) {
    const cloudAgents = agents.filter(a => a.runtime !== 'local');
    const localAgents = agents.filter(a => a.runtime === 'local');

    return (
        <div className="py-1">
            {/* 클라우드 AI */}
            <div className="px-3 py-2 text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                클라우드 AI
            </div>
            {cloudAgents.map(agent => (
                <AgentRow
                    key={agent.name}
                    agent={agent}
                    isSelected={selectedAgentDM === agent.name}
                    onSelect={() => onSelectAgent(agent)}
                    isOnline={true}
                />
            ))}

            {/* 로컬 AI */}
            {localAgents.length > 0 && (
                <>
                    <div className="px-3 py-2 mt-1 text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1 border-t border-neutral-100">
                        <Monitor className="h-3 w-3" />
                        로컬 AI (PC)
                    </div>
                    {localAgents.map(agent => (
                        <AgentRow
                            key={agent.name}
                            agent={agent}
                            isSelected={selectedAgentDM === agent.name}
                            onSelect={() => onSelectAgent(agent)}
                            isOnline={false}
                        />
                    ))}
                </>
            )}

            {agents.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-neutral-400">에이전트가 없습니다</p>
            )}
        </div>
    );
}

function AgentRow({
    agent,
    isSelected,
    onSelect,
    isOnline,
}: {
    agent: AgentProfileExtended;
    isSelected: boolean;
    onSelect: () => void;
    isOnline: boolean;
}) {
    return (
        <button
            onClick={onSelect}
            className={clsx(
                "w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors",
                isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"
            )}
        >
            {/* 아바타 + 상태 도트 */}
            <div className="relative shrink-0">
                <div className="h-8 w-8 bg-neutral-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-neutral-500" />
                </div>
                <span
                    className={clsx(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-2 border-white rounded-full",
                        isOnline ? "bg-green-400" : "bg-neutral-300"
                    )}
                />
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-neutral-700 truncate">
                        {agent.display_name}
                    </span>
                    <span className={clsx("text-[9px] px-1 py-0.5 rounded font-medium", layerColors[agent.layer] || layerColors[2])}>
                        {layerLabels[agent.layer] || `L${agent.layer}`}
                    </span>
                    {agent.runtime === 'local' && (
                        <span className={clsx("text-[9px] px-1 py-0.5 rounded",
                            isOnline ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
                        )}>
                            {isOnline ? 'PC' : '오프라인'}
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-neutral-400 truncate">
                    {agent.name} · {agent.agent_type}
                </p>
            </div>

            <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
        </button>
    );
}
