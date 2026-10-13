"use client";

import { useState } from "react";
import {
    BookOpen,
    Brain,
    BarChart3,
    PenTool,
    Monitor,
    Megaphone,
    Users,
    Clock,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StudyProgram = {
    id: string;
    title: string;
    description: string | null;
    icon_name: string;
    tags: string[];
    capacity: number;
    current_count: number;
    schedule: string | null;
    day_label: string | null;
    leader_name: string | null;
    leader_school: string | null;
    status: "recruiting" | "in_progress" | "closed";
    semester: string | null;
    curriculum: string[];
};

const ICON_MAP: Record<string, LucideIcon> = {
    BookOpen, Brain, BarChart3, PenTool, Monitor, Megaphone,
};

const STATUS_LABEL: Record<StudyProgram["status"], string> = {
    recruiting: "모집중",
    in_progress: "진행중",
    closed: "마감",
};

const STATUS_STYLE: Record<StudyProgram["status"], { color: string; dot: string }> = {
    recruiting: { color: "bg-green-100 text-green-700", dot: "bg-green-500" },
    in_progress: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    closed: { color: "bg-neutral-100 text-neutral-500", dot: "bg-neutral-400" },
};

export default function StudyRoomList({ items }: { items: StudyProgram[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {items.map((s) => {
                const Icon = ICON_MAP[s.icon_name] ?? BookOpen;
                const isExpanded = expanded === s.id;
                const fillPct = s.capacity > 0 ? Math.round((s.current_count / s.capacity) * 100) : 0;
                const style = STATUS_STYLE[s.status];

                return (
                    <div
                        key={s.id}
                        className={`border rounded-xl overflow-hidden transition-all ${
                            isExpanded ? "border-[#4361ee]/30 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                        }`}
                    >
                        <button
                            onClick={() => setExpanded(isExpanded ? null : s.id)}
                            className="w-full text-left p-5 md:p-6 flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-[#4361ee]/10 rounded-xl flex items-center justify-center shrink-0">
                                <Icon className="h-6 w-6 text-[#4361ee]" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-lg">{s.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${style.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${s.status === "recruiting" ? "animate-pulse" : ""}`} />
                                        {STATUS_LABEL[s.status]}
                                    </span>
                                </div>
                                {s.description && (
                                    <p className="text-neutral-500 text-sm line-clamp-1 mb-3">{s.description}</p>
                                )}

                                <div className="flex items-center gap-4 flex-wrap text-xs text-neutral-400">
                                    {s.capacity > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {s.current_count}/{s.capacity}명
                                        </span>
                                    )}
                                    {s.schedule && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {s.schedule}
                                        </span>
                                    )}
                                    {s.leader_name && (
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            리더: {s.leader_name}{s.leader_school ? ` (${s.leader_school})` : ""}
                                        </span>
                                    )}
                                </div>

                                {s.capacity > 0 && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    fillPct >= 100 ? "bg-neutral-400" : fillPct >= 80 ? "bg-orange-400" : "bg-[#4361ee]"
                                                }`}
                                                style={{ width: `${Math.min(fillPct, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-neutral-400 shrink-0">{fillPct}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 mt-1">
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-neutral-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-neutral-400" />
                                )}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-neutral-100 px-5 md:px-6 py-5 bg-neutral-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {s.curriculum.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-[#4361ee]" />
                                                커리큘럼 미리보기
                                            </h4>
                                            <ul className="space-y-2">
                                                {s.curriculum.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                                        <CheckCircle className="h-4 w-4 text-[#4361ee]/50 shrink-0 mt-0.5" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                            <h4 className="text-sm font-bold mb-3">스터디 정보</h4>
                                            <div className="space-y-2 text-sm">
                                                {s.schedule && (
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">일정</span>
                                                        <span className="font-medium">{s.schedule}</span>
                                                    </div>
                                                )}
                                                {s.capacity > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">정원</span>
                                                        <span className="font-medium">{s.current_count} / {s.capacity}명</span>
                                                    </div>
                                                )}
                                                {s.semester && (
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">운영기간</span>
                                                        <span className="font-medium">{s.semester}</span>
                                                    </div>
                                                )}
                                                {s.leader_name && (
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">스터디 리더</span>
                                                        <span className="font-medium">
                                                            {s.leader_name}{s.leader_school ? ` (${s.leader_school})` : ""}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {s.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {s.tags.map((tag) => (
                                                    <span key={tag} className="text-xs px-2 py-0.5 bg-[#4361ee]/10 text-[#4361ee] rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {s.status === "recruiting" ? (
                                            <button className="w-full py-3 bg-[#4361ee] text-white font-medium rounded-lg hover:bg-[#3451de] transition-colors flex items-center justify-center gap-2">
                                                스터디 신청하기
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        ) : s.status === "closed" ? (
                                            <button className="w-full py-3 bg-neutral-200 text-neutral-500 font-medium rounded-lg cursor-not-allowed" disabled>
                                                모집 마감
                                            </button>
                                        ) : (
                                            <button className="w-full py-3 bg-neutral-100 text-neutral-600 font-medium rounded-lg cursor-default" disabled>
                                                진행중 (다음 기수에 신청 가능)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
