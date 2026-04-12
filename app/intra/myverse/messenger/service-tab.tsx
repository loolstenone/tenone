"use client";

import clsx from "clsx";
import {
    Brain, Globe, Megaphone, Server, UserSearch, Users, ChevronRight,
} from "lucide-react";
import type { MessengerServiceHook } from "@/types/messenger";

interface ServiceTabProps {
    services: MessengerServiceHook[];
    selectedService: string | null;
    onSelectService: (service: MessengerServiceHook) => void;
    unreadCounts: Record<string, number>;
}

const iconMap: Record<string, React.ElementType> = {
    Brain, Globe, Megaphone, Server, UserSearch, Users,
};

export default function ServiceTab({ services, selectedService, onSelectService, unreadCounts }: ServiceTabProps) {
    return (
        <div className="py-1">
            <div className="px-3 py-2 text-[10px] text-neutral-400 uppercase tracking-wider">
                연결된 서비스
            </div>
            {services.map(svc => {
                const Icon = iconMap[svc.icon || ''] || Server;
                const unread = unreadCounts[svc.service_name] || 0;
                return (
                    <button
                        key={svc.service_name}
                        onClick={() => onSelectService(svc)}
                        className={clsx(
                            "w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors border-b border-neutral-50",
                            selectedService === svc.service_name ? "bg-neutral-100" : "hover:bg-neutral-50"
                        )}
                    >
                        {/* 아이콘 */}
                        <div
                            className="h-8 w-8 flex items-center justify-center shrink-0 rounded"
                            style={{ backgroundColor: `${svc.color}15` }}
                        >
                            <Icon className="h-4 w-4" style={{ color: svc.color || '#666' }} />
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-neutral-700">
                                    {svc.display_name}
                                </span>
                                {!svc.is_active && (
                                    <span className="text-[9px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded">
                                        비활성
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate">
                                {svc.events.length}개 이벤트
                            </p>
                        </div>

                        {/* 미읽 뱃지 */}
                        {unread > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full shrink-0 min-w-[18px] text-center">
                                {unread}
                            </span>
                        )}

                        <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
                    </button>
                );
            })}

            {services.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-neutral-400">연결된 서비스가 없습니다</p>
            )}
        </div>
    );
}
