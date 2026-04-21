"use client";

import { useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Capability {
    key: string;
    name_ko: string;
    description: string | null;
    built_in_roles: string[] | null;
}

interface BrandCap {
    brand_id: string;
    capability_key: string;
}

const CAP_COLOR: Record<string, string> = {
    community: "bg-neutral-500", club: "bg-violet-500", meetup: "bg-amber-500",
    course: "bg-orange-500", membership: "bg-purple-500", portfolio: "bg-pink-500",
    showcase: "bg-rose-500", subscription: "bg-emerald-500", purchase: "bg-teal-500",
};

export default function CapabilitiesStandardPage() {
    const [loading, setLoading] = useState(true);
    const [caps, setCaps] = useState<Capability[]>([]);
    const [brandCaps, setBrandCaps] = useState<BrandCap[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [capRes, bcRes] = await Promise.all([
                sb.from("capabilities").select("key, name_ko, description, built_in_roles").order("key"),
                sb.from("brand_capabilities").select("brand_id, capability_key"),
            ]);
            setCaps(capRes.data ?? []);
            setBrandCaps(bcRes.data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    // 브랜드별 탑재 capability 그룹핑
    const brandsMap = new Map<string, Set<string>>();
    brandCaps.forEach(bc => {
        if (!brandsMap.has(bc.brand_id)) brandsMap.set(bc.brand_id, new Set());
        brandsMap.get(bc.brand_id)!.add(bc.capability_key);
    });
    const brandKeys = Array.from(brandsMap.keys()).sort();

    // capability별 탑재 브랜드 수
    const capBrandCount: Record<string, number> = {};
    brandCaps.forEach(bc => {
        capBrandCount[bc.capability_key] = (capBrandCount[bc.capability_key] ?? 0) + 1;
    });

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Capability 정의"
                description="9개 기능 모듈 · 브랜드가 탑재하는 활동 유형 정의 (CLAUDE.md §1.3.1)"
            />

            {/* 9 Capabilities */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Capability 레지스트리 ({caps.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {caps.map((c) => (
                        <div key={c.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`h-2 w-2 rounded-full ${CAP_COLOR[c.key] || "bg-neutral-400"}`} />
                                <span className="text-xs font-semibold text-neutral-900">{c.name_ko}</span>
                                <span className="text-[10px] font-mono text-neutral-400">{c.key}</span>
                            </div>
                            <p className="text-[11px] text-neutral-600 mb-2 leading-relaxed">{c.description || "-"}</p>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-neutral-500">탑재 브랜드</span>
                                <span className="font-semibold text-neutral-900">{capBrandCount[c.key] ?? 0}개</span>
                            </div>
                            {c.built_in_roles && c.built_in_roles.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {c.built_in_roles.map((r) => (
                                        <span key={r} className="text-[9px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono">{r}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 브랜드 × Capability 매트릭스 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                    브랜드 × Capability 매트릭스 ({brandKeys.length} 브랜드 × {caps.length} 기능 = {brandCaps.length} 탑재)
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-[11px]">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600 sticky left-0 bg-neutral-50">브랜드</th>
                                {caps.map((c) => (
                                    <th key={c.key} className="px-2 py-2 font-semibold text-neutral-600 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`h-1.5 w-1.5 rounded-full ${CAP_COLOR[c.key] || "bg-neutral-400"}`} />
                                            <span>{c.name_ko}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {brandKeys.map((b) => {
                                const has = brandsMap.get(b)!;
                                return (
                                    <tr key={b} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-3 py-1.5 font-medium text-neutral-900 sticky left-0 bg-white capitalize">{b}</td>
                                        {caps.map((c) => (
                                            <td key={c.key} className="px-2 py-1.5 text-center">
                                                {has.has(c.key) ? (
                                                    <span className={`inline-block w-3 h-3 rounded-full ${CAP_COLOR[c.key] || "bg-neutral-400"}`} />
                                                ) : (
                                                    <span className="text-neutral-200">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[11px] text-neutral-700">
                <p className="font-semibold mb-1">레시피 요약 (CLAUDE.md §1.6.1)</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li>회원 역할 변화 → 기존 row UPDATE 금지, <code className="font-mono bg-neutral-100 px-1 rounded">valid_until</code> 설정 + 새 row INSERT</li>
                    <li>새 브랜드 추가 시 <code className="font-mono bg-neutral-100 px-1 rounded">brand_capabilities</code>에 최소 <code className="font-mono">community</code> 탑재</li>
                    <li>새 capability 추가 시 <code className="font-mono bg-neutral-100 px-1 rounded">capabilities</code> + CAPABILITY_LABELS 상수 갱신</li>
                </ul>
            </div>
        </div>
    );
}
