"use client";

/**
 * 브랜드 사이트 메뉴별 콘텐츠 현황 — 통합 관리 > 사이트 현황과 같은 API·같은 정의(lib/brand-site-menus.ts)
 * 사이트 메뉴 ↔ 콘텐츠 수 ↔ 인트라 관리 화면을 한 줄로 보여 준다 → 사이트·인트라 불일치를 눈으로 바로 확인
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { brandSiteUrl } from "@/lib/domain-registry";
import type { SiteStatus } from "@/types/site-status";

export function useSiteStatus(site?: string) {
    const [data, setData] = useState<SiteStatus[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        fetch(`/api/intra/sites/status${site ? `?site=${encodeURIComponent(site)}` : ""}`)
            .then(async r => {
                const d = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(d.error || "현황을 불러오지 못했습니다.");
                setData(d.sites ?? []);
            })
            .catch(e => setError(e instanceof Error ? e.message : "현황을 불러오지 못했습니다."));
    }, [site]);
    return { data, error };
}

export function SiteMenuTable({ site }: { site: SiteStatus }) {
    if (!site.menus) {
        return <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">메뉴 매핑 없음 — lib/brand-site-menus.ts에 이 사이트의 메뉴를 등록하면 메뉴별 현황이 표시됩니다.</p>;
    }
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-xs text-neutral-400">
                    <th className="py-2 pr-3 font-medium">사이트 메뉴</th>
                    <th className="py-2 pr-3 font-medium text-right">콘텐츠</th>
                    <th className="py-2 pr-3 font-medium text-right">처리 대기</th>
                    <th className="py-2 font-medium">인트라 관리</th>
                </tr>
            </thead>
            <tbody>
                {site.menus.map(m => (
                    <tr key={m.path + m.label} className="border-t border-neutral-100">
                        <td className="py-2 pr-3">
                            <a href={brandSiteUrl(site.slug, m.path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                {m.label} <ExternalLink className="h-3 w-3 text-neutral-300" />
                            </a>
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{m.kind === "static" ? <span className="text-neutral-300">고정 페이지</span> : m.count === null ? <span className="text-red-500">조회 실패</span> : `${m.count}${m.unit}`}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{m.pending ? <span className="font-semibold text-red-600">{m.pending}</span> : <span className="text-neutral-300">-</span>}</td>
                        <td className="py-2">{m.adminHref ? <Link href={m.adminHref} className="text-xs text-blue-600 hover:underline">열기</Link> : <span className="text-xs text-neutral-300">{m.kind === "static" ? "-" : "관리 화면 없음"}</span>}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/** 브랜드 대시보드용 — 사이트 하나의 메뉴별 현황 */
export function BrandSiteStatus({ site }: { site: string }) {
    const { data, error } = useSiteStatus(site);
    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!data) return <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>;
    const s = data[0];
    if (!s) return <p className="text-sm text-neutral-400">사이트 정보 없음</p>;
    return <SiteMenuTable site={s} />;
}
