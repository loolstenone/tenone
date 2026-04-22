"use client";

import { useEffect, useState } from "react";
import {
    Building2, Users, Cpu, Crown, CheckCircle2, XCircle,
    Loader2, Search, ChevronDown, ChevronUp, MoreHorizontal,
    PlusCircle, Globe,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    service_name: string | null;
    plan: string | null;
    max_members: number | null;
    is_active: boolean | null;
    created_at: string | null;
    modules: string[] | null;
    member_count: number;
}

const PLAN_LABELS: Record<string, string> = {
    free: "Free", starter: "Starter", pro: "Pro",
    business: "Business", enterprise: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
    free: "bg-neutral-100 text-neutral-600",
    starter: "bg-blue-100 text-blue-700",
    pro: "bg-violet-100 text-violet-700",
    business: "bg-amber-100 text-amber-700",
    enterprise: "bg-emerald-100 text-emerald-700",
};

function relDate(d: string | null) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

export default function WIOTenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data: tenantRows } = await sb
                .from("wio_tenants")
                .select("id, name, slug, domain, service_name, plan, max_members, is_active, created_at, modules")
                .order("created_at", { ascending: false });

            if (!tenantRows) { setLoading(false); return; }

            const counts = await Promise.all(
                tenantRows.map((t) =>
                    sb.from("wio_members")
                        .select("*", { count: "exact", head: true })
                        .eq("tenant_id", t.id)
                        .eq("is_active", true)
                        .then((r) => r.count ?? 0)
                )
            );

            setTenants(tenantRows.map((t, i) => ({ ...t, member_count: counts[i] })));
            setLoading(false);
        }
        load();
    }, []);

    const filtered = tenants.filter((t) => {
        const matchSearch = !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.slug.toLowerCase().includes(search.toLowerCase());
        const matchPlan = planFilter === "all" || t.plan === planFilter;
        return matchSearch && matchPlan;
    });

    const stats = {
        total: tenants.length,
        active: tenants.filter((t) => t.is_active).length,
        enterprise: tenants.filter((t) => t.plan === "enterprise").length,
        totalMembers: tenants.reduce((s, t) => s + t.member_count, 0),
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="WIO 테넌트 관리" description="WIO 구독 테넌트 목록 및 플랜 현황" />

            {/* Summary Strip */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { icon: Building2, label: "전체 테넌트", value: stats.total, color: "text-blue-600" },
                    { icon: CheckCircle2, label: "활성", value: stats.active, color: "text-emerald-600" },
                    { icon: Crown, label: "Enterprise", value: stats.enterprise, color: "text-amber-600" },
                    { icon: Users, label: "전체 멤버", value: stats.totalMembers, color: "text-violet-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-[11px] text-neutral-500">{label}</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="테넌트 이름 / 슬러그 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1">
                    {["all", "free", "starter", "pro", "business", "enterprise"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPlanFilter(p)}
                            className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-colors ${
                                planFilter === p
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                            }`}
                        >
                            {p === "all" ? "전체" : PLAN_LABELS[p] ?? p}
                        </button>
                    ))}
                </div>
                <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <PlusCircle className="h-3.5 w-3.5" />
                    테넌트 추가
                </button>
            </div>

            {/* Tenant Table */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                    {["테넌트", "플랜", "멤버", "모듈", "상태", ""].map((h) => (
                        <span key={h} className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{h}</span>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-neutral-400">테넌트가 없습니다.</div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filtered.map((t) => (
                            <div key={t.id}>
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center hover:bg-neutral-50/50">
                                    {/* Name */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-neutral-900 truncate">{t.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-neutral-400 font-mono">{t.slug}</span>
                                                {t.domain && (
                                                    <>
                                                        <span className="text-neutral-200">·</span>
                                                        <Globe className="h-2.5 w-2.5 text-neutral-300" />
                                                        <span className="text-[10px] text-neutral-400 truncate">{t.domain}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan */}
                                    <div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${PLAN_COLORS[t.plan ?? "free"] ?? "bg-neutral-100 text-neutral-600"}`}>
                                            {PLAN_LABELS[t.plan ?? "free"] ?? t.plan ?? "-"}
                                        </span>
                                        {t.max_members && (
                                            <p className="text-[10px] text-neutral-400 mt-0.5">최대 {t.max_members === 999 ? "∞" : t.max_members}명</p>
                                        )}
                                    </div>

                                    {/* Members */}
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                                        <span className="text-sm font-semibold text-neutral-900">{t.member_count}</span>
                                        {t.max_members && t.max_members < 999 && (
                                            <span className="text-[10px] text-neutral-400">/ {t.max_members}</span>
                                        )}
                                    </div>

                                    {/* Modules */}
                                    <div>
                                        {t.modules && t.modules.length > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <Cpu className="h-3 w-3 text-neutral-400" />
                                                <span className="text-xs text-neutral-600">{t.modules.length}개</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-neutral-300">-</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-1">
                                        {t.is_active ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-[11px] text-emerald-600 font-semibold">활성</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="text-[11px] text-neutral-400">비활성</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 justify-end">
                                        <button
                                            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                                            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400"
                                        >
                                            {expanded === t.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        </button>
                                        <button className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400">
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {expanded === t.id && (
                                    <div className="px-5 pb-4 bg-neutral-50/60 border-t border-neutral-100">
                                        <div className="pt-3 grid grid-cols-3 gap-6 text-[11px]">
                                            <div>
                                                <p className="text-neutral-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">기본 정보</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-500">ID</span>
                                                        <span className="font-mono text-neutral-700 text-[10px]">{t.id.slice(0, 12)}…</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-500">서비스명</span>
                                                        <span className="text-neutral-700">{t.service_name ?? "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-500">도메인</span>
                                                        <span className="text-neutral-700">{t.domain ?? "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-500">생성일</span>
                                                        <span className="text-neutral-700">{relDate(t.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-neutral-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">활성 모듈</p>
                                                {t.modules && t.modules.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {t.modules.map((m) => (
                                                            <span key={m} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono">{m}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-neutral-400">모듈 없음</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-[10px] text-neutral-400 text-center">
                총 {filtered.length}개 테넌트 표시 중 (전체 {tenants.length}개)
            </p>
        </div>
    );
}
