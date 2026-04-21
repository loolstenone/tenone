"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface RoleRow {
    role: string;
    context: string | null;
    count: number;
}

const ROLE_DEFS = [
    { role: "member", label: "회원", condition: "기본 가입", scope: "본인 데이터", color: "bg-neutral-100 text-neutral-700" },
    { role: "subscriber", label: "구독자", condition: "구독 결제 완료", scope: "구독 기능 활성", color: "bg-emerald-100 text-emerald-700" },
    { role: "purchaser", label: "구매자", condition: "건별 결제 완료", scope: "구매 항목 접근", color: "bg-teal-100 text-teal-700" },
    { role: "approved_member", label: "승인 멤버", condition: "멤버십 심사 승인", scope: "해당 커뮤니티 참여", color: "bg-violet-100 text-violet-700" },
    { role: "leader", label: "리더", condition: "그룹/모임 리더", scope: "해당 그룹 관리 (context)", color: "bg-amber-100 text-amber-700" },
    { role: "staff", label: "직원", condition: "TenOne 직원", scope: "Intra 접근", color: "bg-blue-100 text-blue-700" },
    { role: "manager", label: "매니저", condition: "매니저급 직원", scope: "담당 브랜드 관리", color: "bg-indigo-100 text-indigo-700" },
    { role: "super_admin", label: "마스터", condition: "lools@tenone.biz", scope: "전체 시스템", color: "bg-rose-100 text-rose-700" },
];

const CONTEXT_RULES = [
    { pattern: "brand:[siteId]", desc: "특정 브랜드 한정", example: "brand:badak · brand:madleague" },
    { pattern: "global", desc: "유니버스 전체", example: "super_admin에 주로 부여" },
    { pattern: "staff", desc: "직원 영역", example: "Intra 접근 제어" },
];

export default function RolesStandardPage() {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<RoleRow[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("member_roles").select("role, context, is_active").eq("is_active", true);
            const group: Record<string, RoleRow> = {};
            (data ?? []).forEach((r: { role: string; context: string | null }) => {
                const k = `${r.role}|${r.context ?? ""}`;
                if (!group[k]) group[k] = { role: r.role, context: r.context, count: 0 };
                group[k].count++;
            });
            setCounts(Object.values(group).sort((a, b) => b.count - a.count));
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="권한 체계 (Roles)"
                description="모든 권한은 member_roles(user_id, role, context, is_active)에서 파생 · CLAUDE.md §1.6"
            />

            {/* 8 Role Definitions */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Role 분류 (8종)</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">Role</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">라벨</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">부여 조건</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">접근 범위</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROLE_DEFS.map((r) => (
                                <tr key={r.role} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${r.color}`}>{r.role}</span>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-neutral-900">{r.label}</td>
                                    <td className="px-3 py-2 text-neutral-600">{r.condition}</td>
                                    <td className="px-3 py-2 text-neutral-500">{r.scope}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Context Rules */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Context 규약</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {CONTEXT_RULES.map((c) => (
                        <div key={c.pattern} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-xs font-mono font-semibold text-neutral-900 mb-1">{c.pattern}</p>
                            <p className="text-[11px] text-neutral-600 mb-2">{c.desc}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">{c.example}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Distribution */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-purple-600" />
                    현재 활성 Role 분포
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : counts.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">활성 role이 없습니다.</div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">Role</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">Context</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">활성 멤버 수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counts.map((r, i) => {
                                    const def = ROLE_DEFS.find(d => d.role === r.role);
                                    return (
                                        <tr key={i} className="border-b border-neutral-100 last:border-0">
                                            <td className="px-3 py-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${def?.color || "bg-neutral-100 text-neutral-700"}`}>{r.role}</span>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-[10px] text-neutral-600">{r.context || "-"}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-neutral-900">{r.count}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
