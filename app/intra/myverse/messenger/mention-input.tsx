"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Bot, Send, Paperclip } from "lucide-react";
import type { AgentProfileExtended, MessengerServiceHook } from "@/types/messenger";

interface MentionTarget {
    type: "agent" | "service";
    name: string;
    displayName: string;
    color?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    onMentionSend: (target: MentionTarget, message: string) => void;
    agents: AgentProfileExtended[];
    services: MessengerServiceHook[];
    placeholder?: string;
    disabled?: boolean;
}

export default function MentionInput({
    value, onChange, onSend, onMentionSend, agents, services, placeholder, disabled,
}: MentionInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // 멘션 후보 목록
    const allTargets: MentionTarget[] = [
        ...agents.map(a => ({ type: "agent" as const, name: a.name, displayName: a.display_name, color: undefined })),
        ...services.map(s => ({ type: "service" as const, name: s.service_name, displayName: s.display_name, color: s.color || undefined })),
    ];

    const filtered = mentionQuery
        ? allTargets.filter(t =>
            t.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            t.displayName.toLowerCase().includes(mentionQuery.toLowerCase())
        )
        : allTargets;

    const suggestions = filtered.slice(0, 8);

    // @ 감지
    useEffect(() => {
        const atIdx = value.lastIndexOf("@");
        if (atIdx >= 0) {
            const afterAt = value.slice(atIdx + 1);
            // 공백 없으면 멘션 중
            if (!afterAt.includes(" ")) {
                setMentionQuery(afterAt);
                setShowSuggestions(true);
                setSelectedIdx(0);
                return;
            }
        }
        setShowSuggestions(false);
        setMentionQuery("");
    }, [value]);

    const selectMention = (target: MentionTarget) => {
        const atIdx = value.lastIndexOf("@");
        const beforeAt = value.slice(0, atIdx);
        const afterMessage = beforeAt.trim();

        // @뒤에 메시지가 있으면 해당 에이전트에게 위임
        if (afterMessage) {
            onMentionSend(target, afterMessage);
        } else {
            onChange(`@${target.name} `);
        }
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIdx(prev => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                selectMention(suggestions[selectedIdx]);
                return;
            }
            if (e.key === "Escape") {
                setShowSuggestions(false);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // 멘션이 포함된 메시지인지 체크
            const mentionMatch = value.match(/^@(\S+)\s+(.+)/);
            if (mentionMatch) {
                const targetName = mentionMatch[1];
                const message = mentionMatch[2];
                const target = allTargets.find(t => t.name === targetName);
                if (target) {
                    onMentionSend(target, message);
                    return;
                }
            }
            onSend();
        }
    };

    return (
        <div className="relative">
            {/* 자동완성 드롭다운 */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    <div className="px-3 py-1.5 text-[10px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                        멘션 대상 선택
                    </div>
                    {suggestions.map((target, idx) => (
                        <button
                            key={`${target.type}-${target.name}`}
                            onClick={() => selectMention(target)}
                            className={clsx(
                                "w-full text-left px-3 py-2 flex items-center gap-2 transition-colors",
                                idx === selectedIdx ? "bg-neutral-100" : "hover:bg-neutral-50"
                            )}
                        >
                            {target.type === "agent" ? (
                                <Bot className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            ) : (
                                <div className="h-3.5 w-3.5 rounded shrink-0"
                                    style={{ backgroundColor: target.color || "#666" }} />
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-medium text-neutral-700">
                                    {target.displayName}
                                </span>
                                <span className="text-[10px] text-neutral-400 ml-1.5">
                                    @{target.name}
                                </span>
                            </div>
                            <span className={clsx("text-[9px] px-1 py-0.5 rounded",
                                target.type === "agent" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-600"
                            )}>
                                {target.type === "agent" ? "AI" : "서비스"}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* 입력창 */}
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "메시지를 입력하세요... (@로 멘션)"}
                    className="flex-1 px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400"
                    disabled={disabled}
                />
                <button
                    onClick={() => {
                        const mentionMatch = value.match(/^@(\S+)\s+(.+)/);
                        if (mentionMatch) {
                            const target = allTargets.find(t => t.name === mentionMatch[1]);
                            if (target) { onMentionSend(target, mentionMatch[2]); return; }
                        }
                        onSend();
                    }}
                    disabled={!value.trim() || disabled}
                    className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
                >
                    <Send className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
