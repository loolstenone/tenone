"use client";

import clsx from "clsx";
import {
    Brain, Globe, Megaphone, Server, UserSearch, Users, Check, Loader2,
} from "lucide-react";
import type { ActionPayload, ActionButton } from "@/types/messenger";

interface ActionCardProps {
    payload: ActionPayload;
    messageId: string;
    senderName: string;
    metadata?: Record<string, unknown> | null;
    onAction: (messageId: string, action: ActionButton) => void;
    isLoading?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    Brain, Globe, Megaphone, Server, UserSearch, Users,
};

const buttonStyles: Record<string, string> = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

export default function ActionCard({ payload, messageId, senderName, metadata, onAction, isLoading }: ActionCardProps) {
    const icon = metadata?.icon as string | undefined;
    const color = metadata?.color as string | undefined;
    const Icon = iconMap[icon || ''] || Server;
    const isActed = payload.status === 'acted';
    const actedAction = isActed ? payload.actions.find(a => a.id === payload.acted_action_id) : null;

    return (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden max-w-[380px]">
            {/* 헤더 */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100" style={{ backgroundColor: `${color || '#666'}08` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: color || '#666' }} />
                <span className="text-[11px] font-medium" style={{ color: color || '#666' }}>
                    {senderName}
                </span>
            </div>

            {/* 본문 */}
            <div className="px-3 py-2.5">
                <p className="text-[12px] font-medium text-neutral-800">{payload.title}</p>
                <p className="text-[11px] text-neutral-500 mt-1 whitespace-pre-line">{payload.body}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="px-3 pb-2.5">
                {isActed ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-green-600">
                        <Check className="h-3 w-3" />
                        <span>
                            &ldquo;{actedAction?.label}&rdquo; 선택됨
                            {payload.acted_at && (
                                <span className="text-neutral-400 ml-1">
                                    {new Date(payload.acted_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {payload.actions.map(action => (
                            <button
                                key={action.id}
                                onClick={() => onAction(messageId, action)}
                                disabled={isLoading}
                                className={clsx(
                                    "px-3 py-1.5 text-[11px] font-medium rounded transition-colors",
                                    buttonStyles[action.style || 'secondary'],
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    action.label
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
