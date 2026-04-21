"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface SiteRow {
    slug: string;
    name: string;
    access_model: string | null;
}

const MODELS = [
    { key: "오픈", label: "오픈", desc: "이메일만 있으면 즉시 이용", role: "member", color: "bg-emerald-100 text-emerald-800" },
    { key: "구독", label: "구독", desc: "플랜 선택 + 결제", role: "subscriber", color: "bg-blue-100 text-blue-800" },
    { key: "구매", label: "구매", desc: "건별 결제 (상담·교육·제품·모임비)", role: "purchaser", color: "bg-teal-100 text-teal-800" },
    { key: "승인 멤버십", label: "승인 멤버십", desc: "신청서 → 운영진 심사/승인", role: "approved_member / leader", color: "bg-violet-100 text-violet-800" },
    { key: "직원", label: "직원", desc: "입사 → tenone_staff_profiles 등록", role: "staff / manager / super_admin", color: "bg-neutral-900 text-white" },
    { key: "내부", label: "내부", desc: "외부 노출 없음 (기록 전용)", role: "internal", color: "bg-amber-100 text-amber-800" },
];

export default function AccessModelStandardPage() {
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState<SiteRow[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("ums_sites").select("slug, name, access_model").order("access_model", { nullsFirst: false });
            setSites(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    // 모델별 브랜드 그룹핑
    const groups = new Map<string, SiteRow[]>();
    MODELS.forEach(m => groups.set(m.key, []));
    groups.set("미분류", []);
    sites.forEach(s => {
        const key = s.access_model && groups.has(s.access_model) ? s.access_model : "미분류";
        groups.get(key)!.push(s);
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="서비스 접근 모델 (6종)"
                description="CLAUDE.md §1.4 · 모든 브랜드는 6가지 중 하나 · 가입 경로·권한·UC 지급이 여기서 파생"
            />

            {/* 6 Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODELS.map(m => (
                    <div key={m.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${m.color}`}>{m.label}</span>
                            <span className="text-[10px] text-neutral-400">{groups.get(m.key)?.length ?? 0}개 브랜드</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mb-2 leading-relaxed">{m.desc}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">role: {m.role}</p>
                    </div>
                ))}
            </div>

            {/* Model × Brand Matrix */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-violet-500" />
                    모델별 브랜드 분포
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : (
                    <div className="space-y-3">
                        {[...MODELS, { key: "미분류", label: "미분류", desc: "access_model 값 없음 — 지정 필요", role: "-", color: "bg-rose-100 text-rose-800" }].map(m => {
                            const list = groups.get(m.key) ?? [];
                            if (list.length === 0 && m.key === "미분류") return null;
                            return (
                                <div key={m.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${m.color}`}>{m.label}</span>
                                            <span className="text-[11px] text-neutral-500">{list.length}개</span>
                                        </div>
                                    </div>
                                    {list.length === 0 ? (
                                        <p className="text-[11px] text-neutral-400 italic">해당 브랜드 없음</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {list.map(s => (
                                                <span key={s.slug} className="text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200 px-2 py-0.5 rounded">
                                                    {s.name} <span className="text-neutral-400">({s.slug})</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
                <strong>중요:</strong> 접근 모델 변경 시 기존 회원 role이 그대로 유지되지 않을 수 있습니다.
                모델 전환은 마이그레이션 계획 수립 후 진행하세요.
            </div>
        </div>
    );
}
