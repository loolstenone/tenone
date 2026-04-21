"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    logo_url: string | null;
    primary_color: string | null;
    service_name: string | null;
    powered_by: string | null;
    plan: string | null;
    max_members: number | null;
    is_active: boolean;
    modules: string[] | null;
    created_at: string;
}

interface TenantConfig {
    id: string;
    tenant_id: string;
    config_key: string;
    config_value: string | null;
    description: string | null;
}

export default function TenantsStandardPage() {
    const [loading, setLoading] = useState(true);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [configs, setConfigs] = useState<TenantConfig[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [tRes, cRes] = await Promise.all([
                sb.from("wio_tenants").select("*").order("created_at"),
                sb.from("wio_tenant_configs").select("*"),
            ]);
            setTenants(tRes.data ?? []);
            setConfigs(cRes.data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const configsByTenant: Record<string, TenantConfig[]> = {};
    configs.forEach(c => {
        if (!configsByTenant[c.tenant_id]) configsByTenant[c.tenant_id] = [];
        configsByTenant[c.tenant_id].push(c);
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="테넌트 레지스트리"
                description={`${tenants.length} 테넌트 · CLAUDE.md §1.8 테넌트 격리 아키텍처`}
            />

            {/* Philosophy */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-neutral-300" />
                    <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">테넌트 격리 아키텍처</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                        <p className="text-neutral-300 mb-0.5">tenant_id</p>
                        <p className="text-white leading-relaxed">계약 단위 (TenOne, XXXX Corp...) — RLS 격리 경계</p>
                    </div>
                    <div>
                        <p className="text-neutral-300 mb-0.5">brand_id</p>
                        <p className="text-white leading-relaxed">유니버스 내부 브랜드 구분 (LUKI, Badak, MADLeague...)</p>
                    </div>
                </div>
            </div>

            {/* Tenants */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">등록 테넌트</h2>
                <div className="space-y-3">
                    {tenants.map(t => {
                        const tConfigs = configsByTenant[t.id] ?? [];
                        return (
                            <div key={t.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        className="h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
                                        style={{ backgroundColor: t.primary_color || "#171717" }}
                                    >
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-semibold text-neutral-900">{t.name}</h3>
                                            <span className="text-[10px] font-mono text-neutral-500">{t.slug}</span>
                                            {t.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700"><CheckCircle2 className="h-3 w-3" /> 활성</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400"><XCircle className="h-3 w-3" /> 비활성</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600">
                                            {t.domain && <span>🌐 {t.domain}</span>}
                                            {t.service_name && <span>서비스: {t.service_name}</span>}
                                            {t.plan && <span>플랜: <strong>{t.plan}</strong></span>}
                                            {t.max_members && <span>최대 {t.max_members}명</span>}
                                            {t.powered_by && <span className="text-neutral-400">powered by {t.powered_by}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Modules */}
                                {t.modules && t.modules.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-[10px] text-neutral-500 uppercase mb-1">모듈 ({t.modules.length})</p>
                                        <div className="flex flex-wrap gap-1">
                                            {t.modules.map(m => (
                                                <span key={m} className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-mono">{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Configs */}
                                {tConfigs.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-neutral-500 uppercase mb-1">설정 ({tConfigs.length})</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {tConfigs.map(c => (
                                                <div key={c.id} className="bg-neutral-50 rounded p-2 text-[10px]">
                                                    <p className="font-mono text-neutral-500">{c.config_key}</p>
                                                    <p className="font-semibold text-neutral-900 truncate">{c.config_value || "-"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {tenants.length === 0 && (
                        <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                            등록된 테넌트가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* 3-분류 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">테이블 3분류 (CLAUDE.md §1.8)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-neutral-900 mb-1">제품 모듈 (판매용)</p>
                        <p className="text-[10px] text-neutral-500 font-mono mb-1">wio_* · tenant_id 필수</p>
                        <p className="text-[11px] text-neutral-600">외부 판매 O · RLS tenant 격리</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-neutral-900 mb-1">내부 운영 (자사)</p>
                        <p className="text-[10px] text-neutral-500 font-mono mb-1">wio_* · tenant_id=tenone 고정</p>
                        <p className="text-[11px] text-neutral-600">외부 판매 X · 코드는 WIO 소유</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-neutral-900 mb-1">Universe 운영</p>
                        <p className="text-[10px] text-neutral-500 font-mono mb-1">brand_id 기반</p>
                        <p className="text-[11px] text-neutral-600">외부 판매 X · 26 브랜드 내부</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Link href="/intra/ums/wio/tenants" className="flex-1 bg-neutral-900 text-white px-4 py-2 text-xs rounded hover:bg-neutral-700 flex items-center justify-center gap-1 font-semibold">
                    테넌트 상세 관리 <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
