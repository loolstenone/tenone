"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface SiteRow {
    id: string;
    site_id: string | null;
    slug: string;
    name: string;
    domain: string | null;
    domains: string[] | null;
    site_type: string | null;
    access_model: string | null;
    is_open: boolean;
    meta_title: string | null;
    meta_description: string | null;
    og_image_url: string | null;
    favicon_url: string | null;
}

const META_STANDARDS = [
    { field: "meta_title", rule: "브랜드명 없이 고유 슬로건 · 60자 이내 · Ten:One™ Universe 템플릿 접미사 자동 추가" },
    { field: "meta_description", rule: "핵심 가치 + 주요 기능 3개 · 155자 이내" },
    { field: "meta_keywords", rule: "5-10개 · 쉼표 구분 · 브랜드 키워드 + 산업군" },
    { field: "og_image_url", rule: "1200×630 · Supabase Storage site-branding 버킷 · 브랜드 컬러 + 로고" },
    { field: "favicon_url", rule: "32×32 ico · 동일 버킷" },
    { field: "is_open", rule: "false → SiteClosedOverlay 자동 차단 (마스터/Staff bypass)" },
];

export default function SitesStandardPage() {
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState<SiteRow[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("ums_sites").select("*").order("name");
            setSites(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    const openCount = sites.filter(s => s.is_open).length;
    const withMeta = sites.filter(s => s.meta_title && s.meta_description).length;
    const withOg = sites.filter(s => s.og_image_url).length;
    const withFavicon = sites.filter(s => s.favicon_url).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="사이트 · 도메인 표준"
                description="29 도메인 · SEO 기본값 · 오픈그래프 · favicon 정책 SSOT"
            />

            {/* Completion Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] text-neutral-500">오픈</span>
                    </div>
                    <p className="text-lg font-bold">{openCount} / {sites.length}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">메타 타이틀·설명</p>
                    <p className="text-lg font-bold">{withMeta} / {sites.length}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">OG 이미지</p>
                    <p className="text-lg font-bold">{withOg} / {sites.length}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">Favicon</p>
                    <p className="text-lg font-bold">{withFavicon} / {sites.length}</p>
                </div>
            </div>

            {/* Meta Standards */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">메타데이터 표준</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">필드</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">규칙</th>
                            </tr>
                        </thead>
                        <tbody>
                            {META_STANDARDS.map(s => (
                                <tr key={s.field} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2 font-mono text-[10px] text-neutral-700">{s.field}</td>
                                    <td className="px-3 py-2 text-neutral-700">{s.rule}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sites Table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">사이트 레지스트리 ({sites.length})</h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">slug</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">메인 도메인</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">타입</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">접근 모델</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">오픈</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">메타</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">OG</th>
                                    <th className="text-center px-3 py-2 font-semibold text-neutral-600">Favicon</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sites.map(s => (
                                    <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                        <td className="px-3 py-1.5 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-3 py-1.5 font-mono text-neutral-600">{s.slug}</td>
                                        <td className="px-3 py-1.5 text-neutral-500">
                                            {s.domain ? (
                                                <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-neutral-900">
                                                    {s.domain} <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            ) : "-"}
                                        </td>
                                        <td className="px-3 py-1.5 text-neutral-500">{s.site_type || "-"}</td>
                                        <td className="px-3 py-1.5">
                                            {s.access_model && (
                                                <span className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">{s.access_model}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            {s.is_open ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="inline h-3.5 w-3.5 text-neutral-300" />}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            {s.meta_title && s.meta_description ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="inline h-3.5 w-3.5 text-neutral-300" />}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            {s.og_image_url ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="inline h-3.5 w-3.5 text-neutral-300" />}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            {s.favicon_url ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="inline h-3.5 w-3.5 text-neutral-300" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-700">
                <p className="font-semibold mb-1">도메인 감지 3단계 (lib/domain-registry.ts)</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li>① 독립 도메인 (domainMap): <code className="font-mono bg-neutral-100 px-1 rounded">madleague.net → madleague</code></li>
                    <li>② 서브도메인 자동 감지 (*.tenone.biz regex)</li>
                    <li>③ 경로 분기 (pathSiteMap, localhost 개발용)</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <Link href="/intra/ums/sites/list" className="flex-1 bg-neutral-900 text-white px-4 py-2 text-xs rounded hover:bg-neutral-700 flex items-center justify-center gap-1 font-semibold">
                    <Globe className="h-4 w-4" /> 사이트 목록 관리
                </Link>
            </div>
        </div>
    );
}
