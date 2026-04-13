"use client";

import { useState, useEffect } from "react";
import { Target, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Building2, Users, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

type GoalStatus = "확정" | "승인대기" | "초안" | "반려";

interface Goal {
    id: string;
    title: string;
    weight: number;
    progress: number;
    status: GoalStatus;
}

interface PersonNode {
    id: string;
    name: string;
    position: string;
    rate: number;
    goals: Goal[];
}

interface DivisionNode {
    name: string;
    rate: number;
    members: PersonNode[];
}

const companyGoals: Goal[] = [
    { id: "C-1", title: "10,000명의 기획자 발굴·연결 네트워크 구축", weight: 30, progress: 25, status: "확정" },
    { id: "C-2", title: "AI 그룹 LUKI 데뷔 및 글로벌 노출", weight: 25, progress: 60, status: "확정" },
    { id: "C-3", title: "Badak 파트너 네트워크 10개사 확보", weight: 20, progress: 15, status: "확정" },
    { id: "C-4", title: "분기 매출 목표 달성 (1.2억)", weight: 25, progress: 40, status: "확정" },
];

const DB_STATUS_MAP: Record<string, GoalStatus> = {
    "Agreed": "확정",
    "Completed": "확정",
    "Pending Approval": "승인대기",
    "Draft": "초안",
    "In Progress": "초안",
    "Self Evaluated": "승인대기",
    "Evaluated": "승인대기",
};

const statusStyle: Record<GoalStatus, string> = {
    "확정": "bg-green-50 text-green-600",
    "승인대기": "bg-yellow-50 text-yellow-600",
    "초안": "bg-neutral-100 text-neutral-500",
    "반려": "bg-red-50 text-red-600",
};

const statusIcon: Record<GoalStatus, typeof CheckCircle2> = {
    "확정": CheckCircle2,
    "승인대기": Clock,
    "초안": Target,
    "반려": AlertCircle,
};

function calcRate(goals: Goal[]) {
    if (!goals.length) return 0;
    const total = goals.reduce((s, g) => s + g.progress * g.weight, 0);
    const weights = goals.reduce((s, g) => s + g.weight, 0);
    return weights > 0 ? Math.round(total / weights) : 0;
}

export default function GPRCascadePage() {
    const [expandedDivs, setExpandedDivs] = useState<Set<string>>(new Set());
    const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
    const [divisions, setDivisions] = useState<DivisionNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadCascade(); }, []);

    const loadCascade = async () => {
        setLoading(true);
        const supabase = createClient();

        const [membersRes, goalsRes] = await Promise.all([
            supabase
                .from("members")
                .select("id, name, department, position, account_type")
                .in("account_type", ["staff", "partner", "crew", "junior_partner"])
                .order("name"),
            supabase
                .from("gpr_goals")
                .select("id, staff_id, title, weight, progress, status")
                .order("created_at", { ascending: false }),
        ]);

        const members = (membersRes.data || []) as Record<string, unknown>[];
        const goals = (goalsRes.data || []) as Record<string, unknown>[];

        if (members.length === 0) {
            setLoading(false);
            return; // mock fallback은 rendering에서 처리
        }

        // 멤버별 goals 매핑
        const goalsByMember = new Map<string, Goal[]>();
        for (const g of goals) {
            const mid = (g.staff_id || g.member_id) as string;
            if (!mid) continue;
            const status = DB_STATUS_MAP[(g.status as string) || "Draft"] || "초안";
            const goal: Goal = {
                id: g.id as string,
                title: (g.title as string) || "목표 미입력",
                weight: (g.weight as number) || 10,
                progress: (g.progress as number) || 0,
                status,
            };
            if (!goalsByMember.has(mid)) goalsByMember.set(mid, []);
            goalsByMember.get(mid)!.push(goal);
        }

        // department별 그룹핑
        const divMap = new Map<string, PersonNode[]>();
        for (const m of members) {
            const dept = (m.department as string) || "미분류";
            const mGoals = goalsByMember.get(m.id as string) || [];
            const person: PersonNode = {
                id: m.id as string,
                name: m.name as string,
                position: (m.position as string) || "-",
                rate: calcRate(mGoals),
                goals: mGoals,
            };
            if (!divMap.has(dept)) divMap.set(dept, []);
            divMap.get(dept)!.push(person);
        }

        const divs: DivisionNode[] = Array.from(divMap.entries()).map(([name, mems]) => ({
            name,
            rate: mems.length > 0 ? Math.round(mems.reduce((s, m) => s + m.rate, 0) / mems.length) : 0,
            members: mems,
        }));

        setDivisions(divs);
        if (divs.length > 0) setExpandedDivs(new Set([divs[0].name]));
        setLoading(false);
    };

    const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
        const next = new Set(set);
        next.has(key) ? next.delete(key) : next.add(key);
        setter(next);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="목표 캐스케이드"
                description={`회사 → 사업부 → 개인으로 이어지는 목표 설정 및 승인 흐름 · ${divisions.reduce((s, d) => s + d.members.length, 0)}명`}
            />

            {/* Company Level */}
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-neutral-400" />
                    <h2 className="text-sm font-semibold">전사 목표 (CEO)</h2>
                    <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white ml-auto">2026 Q1</span>
                </div>
                <div className="space-y-3">
                    {companyGoals.map(g => (
                        <div key={g.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                            <span className="font-mono text-xs text-neutral-400 w-8">{g.id}</span>
                            <span className="text-sm flex-1">{g.title}</span>
                            <span className="text-xs text-neutral-400 w-12 text-right">{g.weight}%</span>
                            <div className="w-20 h-1.5 bg-neutral-100 rounded-full">
                                <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${g.progress}%` }} />
                            </div>
                            <span className="text-xs text-neutral-500 w-8 text-right">{g.progress}%</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${statusStyle[g.status]}`}>{g.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Division → Person cascade */}
            {divisions.length === 0 ? (
                <div className="border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-400">
                    GPR 목표가 등록된 구성원이 없습니다.
                </div>
            ) : (
                <div className="space-y-2">
                    {divisions.map(div => (
                        <div key={div.name} className="border border-neutral-200 bg-white">
                            <button
                                onClick={() => toggle(expandedDivs, div.name, setExpandedDivs)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
                            >
                                {expandedDivs.has(div.name) ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
                                <Users className="h-4 w-4 text-neutral-400" />
                                <span className="text-sm font-bold flex-1 text-left">{div.name}</span>
                                <span className="text-xs text-neutral-400">{div.members.length}명</span>
                                <div className="w-20 h-1.5 bg-neutral-100 rounded-full mx-3">
                                    <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${div.rate}%` }} />
                                </div>
                                <span className="text-xs font-bold w-10 text-right">{div.rate}%</span>
                            </button>

                            {expandedDivs.has(div.name) && (
                                <div className="border-t border-neutral-100">
                                    {div.members.map(member => (
                                        <div key={member.id} className="ml-6 border-l border-neutral-100">
                                            <button
                                                onClick={() => toggle(expandedMembers, member.id, setExpandedMembers)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                                            >
                                                {expandedMembers.has(member.id) ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                                <User className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="text-xs flex-1 text-left font-medium">{member.name}</span>
                                                <span className="text-xs text-neutral-400">{member.position}</span>
                                                <span className="text-[11px] text-neutral-400 mx-2">{member.goals.length}개 목표</span>
                                                <span className="text-xs font-bold w-10 text-right">{member.rate}%</span>
                                            </button>

                                            {expandedMembers.has(member.id) && (
                                                <div className="ml-10 pb-3 space-y-1">
                                                    {member.goals.length === 0 ? (
                                                        <p className="px-4 py-2 text-xs text-neutral-400">등록된 목표 없음</p>
                                                    ) : (
                                                        member.goals.map(g => {
                                                            const Icon = statusIcon[g.status];
                                                            return (
                                                                <div key={g.id} className="flex items-center gap-2 px-4 py-1.5">
                                                                    <Icon className={`h-3 w-3 shrink-0 ${g.status === "확정" ? "text-green-500" : g.status === "승인대기" ? "text-yellow-500" : "text-neutral-400"}`} />
                                                                    <span className="text-xs flex-1">{g.title}</span>
                                                                    <span className="text-xs text-neutral-400">{g.weight}%</span>
                                                                    <div className="w-16 h-1 bg-neutral-100 rounded-full">
                                                                        <div className="h-1 bg-neutral-900 rounded-full" style={{ width: `${g.progress}%` }} />
                                                                    </div>
                                                                    <span className="text-xs text-neutral-500 w-8 text-right">{g.progress}%</span>
                                                                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${statusStyle[g.status]}`}>{g.status}</span>
                                                                    {g.status === "승인대기" && (
                                                                        <div className="flex gap-1">
                                                                            <button className="text-[11px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">승인</button>
                                                                            <button className="text-[11px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">반려</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Flow explanation */}
            <div className="mt-8 border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">GPR 설정 흐름</h3>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">CEO 전사목표 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">사업부장 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">팀장 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">팀원 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-neutral-900 text-white px-3 py-1.5 rounded font-medium">상부 승인</span>
                </div>
            </div>
        </div>
    );
}
