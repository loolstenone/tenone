"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import { DutyRolesManager } from "@/components/intra/DutyRolesManager";

interface RoleRow {
    role: string;
    context: string | null;
    count: number;
}

// 실제 운영 체계 (v3) — sync_roles_to_jwt 트리거·auth-context·api-guard가 이 규약에 의존
const ROLE_DEFS = [
    { role: "super_admin", context: "universe", label: "마스터", condition: "lools@tenone.biz", scope: "전체 시스템 · JWT is_super_admin", color: "bg-rose-100 text-rose-700" },
    { role: "staff", context: "universe", label: "직원", condition: "입사 → tenone_staff_profiles 등록", scope: "인트라 · JWT is_staff → RLS auth_is_staff()", color: "bg-blue-100 text-blue-700" },
    { role: "manager", context: "universe", label: "매니저", condition: "매니저급 직원", scope: "직원 권한 + 담당 영역 관리", color: "bg-indigo-100 text-indigo-700" },
    { role: "crew", context: "universe", label: "크루", condition: "외부 협업 크루", scope: "인트라 일부 접근", color: "bg-sky-100 text-sky-700" },
    { role: "member", context: "universe", label: "회원", condition: "가입 시 자동 부여", scope: "본인 데이터", color: "bg-neutral-100 text-neutral-700" },
    { role: "intra_access", context: "system", label: "인트라 진입", condition: "직원·크루 계정 생성 시", scope: "인트라 메뉴 표시 (권한 판단은 staff)", color: "bg-neutral-900 text-white" },
    { role: "hr · payroll · finance · accounting", context: "duty", label: "직무 권한", condition: "마스터가 아래 표에서 부여", scope: "전 직원 인사·급여·재무·회계 데이터 (RLS auth_has_duty) — 없으면 본인 기록만", color: "bg-emerald-100 text-emerald-700" },
    { role: "{모듈명}", context: "module", label: "모듈 접근", condition: "직원별 모듈 배정", scope: "erp · hero · wiki · smarcomm · project 등 인트라 모듈 메뉴", color: "bg-amber-100 text-amber-700" },
    { role: "{브랜드 slug}", context: "brand", label: "브랜드 관리", condition: "브랜드 담당 배정", scope: "해당 브랜드 인트라 관리 메뉴", color: "bg-violet-100 text-violet-700" },
];

const CONTEXT_RULES = [
    { pattern: "universe", desc: "유니버스 전체 등급 — role이 등급", example: "staff · super_admin · member" },
    { pattern: "system", desc: "시스템 기능 플래그", example: "intra_access" },
    { pattern: "module", desc: "인트라 모듈 접근 — role이 모듈명", example: "erp · hero · wiki" },
    { pattern: "brand", desc: "브랜드 관리 — role이 브랜드 slug", example: "badak · madleague · tenone" },
    { pattern: "duty", desc: "직무 권한 — role이 직무 (lib/staff-duties.ts)", example: "hr · payroll · finance · accounting" },
];

const KNOWN_CONTEXTS = new Set(CONTEXT_RULES.map(c => c.pattern));

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
                description="모든 권한은 member_roles(member_id, role, context, is_active)에서 파생 · 데이터 계약 2조 · universe·system·duty 부여는 마스터만, brand·module은 직원"
            />

            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">직무 권한 — 인사 · 급여 · 재무 · 회계</h2>
                <p className="text-[11px] text-neutral-500 mb-3">직원이라고 전원의 인사·재무 데이터를 보지 않습니다. 담당 직무가 있는 사람만 봅니다 (개인정보보호법 제29조 접근권한 최소화).</p>
                <DutyRolesManager />
            </div>

            {/* 8 Role Definitions */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Role 규약 (role × context)</h2>
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
                                        <span className="ml-1.5 text-[10px] font-mono text-neutral-400">@{r.context}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {CONTEXT_RULES.map((c) => (
                        <div key={c.pattern} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-xs font-mono font-semibold text-neutral-900 mb-1">{c.pattern}</p>
                            <p className="text-[11px] text-neutral-600 mb-2">{c.desc}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">{c.example}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[11px] text-neutral-700 space-y-1">
                <p className="font-semibold text-neutral-900">판단 경로</p>
                <p>· DB(RLS): member_roles 변경 → <code className="font-mono">sync_roles_to_jwt</code> 트리거 → JWT app_metadata.is_staff (staff@universe) → <code className="font-mono">auth_is_staff()</code></p>
                <p>· 서버 API: <code className="font-mono">lib/api-guard.ts</code> requireStaff — staff·manager·super_admin (member_roles만 — 이메일 도메인 판단은 2026-10-07 폐지) · 인사·재무 데이터는 RLS <code className="font-mono">auth_has_duty()</code></p>
                <p>· 회원 활동 역할(멘토·현역·바닥장 등)은 권한이 아니므로 <code className="font-mono">member_capability_roles</code>에 기록. MADLeague의 <code className="font-mono">brand:madleague</code> 행은 이관 대상</p>
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
                                    const def = ROLE_DEFS.find(d => d.role === r.role && d.context === r.context)
                                        ?? ROLE_DEFS.find(d => d.context === r.context && d.role.startsWith("{"));
                                    const offSpec = !KNOWN_CONTEXTS.has(r.context ?? "");
                                    return (
                                        <tr key={i} className="border-b border-neutral-100 last:border-0">
                                            <td className="px-3 py-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${def?.color || "bg-neutral-100 text-neutral-700"}`}>{r.role}</span>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-[10px] text-neutral-600">
                                                {r.context || "-"}
                                                {offSpec && <span className="ml-1.5 font-sans text-rose-600">규약 밖</span>}
                                            </td>
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
