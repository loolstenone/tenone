"use client";

/**
 * 통합 관리 > 사이트 현황 — 전 사이트 집계 (Tier·상태 = DB ums_sites, 메뉴 = lib/brand-site-menus.ts)
 * 브랜드별 대시보드와 같은 API(/api/intra/sites/status)를 쓴다 → 숫자가 어긋나지 않는다
 */
import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { SiteMenuTable, useSiteStatus } from "@/components/intra/BrandSiteStatus";
import { brandAdminHref } from "@/lib/intra-nav";
import { brandSiteUrl } from "@/lib/domain-registry";
import type { SiteStatus } from "@/types/site-status";

const TIER_LABEL: Record<string, string> = { core: "핵심", focus: "집중", experiment: "실험", archive: "보관" };
const LIFECYCLE_LABEL: Record<string, string> = { active: "운영", frozen: "동결", sunset: "종료 예정", closed: "종료" };

function groupOf(s: SiteStatus): "focus" | "rest" {
    return s.tier === "core" || s.tier === "focus" ? "focus" : "rest";
}

export default function SitesStatusPage() {
    const { data, error } = useSiteStatus();
    const [open, setOpen] = useState<Set<string>>(new Set());
    const toggle = (slug: string) => setOpen(prev => { const n = new Set(prev); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });

    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!data) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

    const focus = data.filter(s => groupOf(s) === "focus").sort((a, b) => (a.tier === "core" ? -1 : 0) - (b.tier === "core" ? -1 : 0) || a.slug.localeCompare(b.slug));
    const rest = data.filter(s => groupOf(s) === "rest");
    const sum = (k: "members" | "posts" | "openInquiries") => data.reduce((n, s) => n + s[k], 0);
    const untiered = data.filter(s => !s.tier).length;
    const unmappedFocus = focus.filter(s => !s.menus).length;

    const Table = ({ rows, title, desc }: { rows: SiteStatus[]; title: string; desc: string }) => (
        <section className="mb-8">
            <h2 className="text-sm font-bold text-neutral-900">{title} <span className="font-normal text-neutral-400">({rows.length})</span></h2>
            <p className="text-xs text-neutral-400 mb-3">{desc}</p>
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-50 text-left text-xs text-neutral-500">
                            {["", "사이트", "Tier", "상태", "호스팅", "공개", "가입 회원", "게시글", "문의 (미답변)", "메뉴 매핑", ""].map((h, i) => <th key={i} className="px-3 py-2.5 font-semibold">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(s => (
                            <Fragment key={s.slug}>
                                <tr className="border-t border-neutral-100 hover:bg-neutral-50 cursor-pointer" onClick={() => toggle(s.slug)}>
                                    <td className="pl-3 py-2.5 text-neutral-300">{open.has(s.slug) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                                    <td className="px-3 py-2.5 font-medium">{s.name ?? s.slug} <span className="text-xs text-neutral-400">{s.slug}</span></td>
                                    <td className="px-3 py-2.5 text-xs">{s.tier ? TIER_LABEL[s.tier] ?? s.tier : <span className="text-amber-600">미지정</span>}</td>
                                    <td className="px-3 py-2.5 text-xs text-neutral-500">{s.lifecycle ? LIFECYCLE_LABEL[s.lifecycle] ?? s.lifecycle : "-"}</td>
                                    <td className="px-3 py-2.5 text-xs text-neutral-500">{s.hosting === "external" ? "외부 → 새로 제작" : s.hosting ?? "-"}</td>
                                    <td className="px-3 py-2.5 text-xs">{s.isOpen ? <span className="text-emerald-600">공개</span> : <span className="text-neutral-400">비공개</span>}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{s.members}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{s.posts}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{s.inquiries} {s.openInquiries > 0 && <span className="font-semibold text-red-600">({s.openInquiries})</span>}</td>
                                    <td className="px-3 py-2.5 text-xs">{s.menus ? <span className="text-emerald-600">{s.menus.length}개</span> : <span className="text-neutral-400">없음</span>}</td>
                                    <td className="px-3 py-2.5 text-xs whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                        <Link href={brandAdminHref(s.slug)} className="text-blue-600 hover:underline mr-3">관리</Link>
                                        <a href={brandSiteUrl(s.slug, `/${s.slug === "tenone" ? "" : s.slug}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-neutral-400 hover:text-neutral-700">사이트 <ExternalLink className="h-3 w-3" /></a>
                                    </td>
                                </tr>
                                {open.has(s.slug) && (
                                    <tr className="bg-neutral-50/60">
                                        <td />
                                        <td colSpan={10} className="px-3 py-3"><SiteMenuTable site={s} /></td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    return (
        <div>
            <PageHeader title="사이트 현황" description="전 사이트 집계 — Tier·상태는 ums_sites, 메뉴별 콘텐츠는 사이트 메뉴 레지스트리 기준" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard label="전체 사이트" value={`${data.length}개`} sub={`핵심·집중 ${focus.length} · 그 외 ${rest.length}`} />
                <StatCard label="가입 회원 (브랜드 합계)" value={`${sum("members")}`} sub="member_brand_joins" />
                <StatCard label="게시글" value={`${sum("posts")}`} sub="통합 게시판" />
                <StatCard label="미답변 문의" value={`${sum("openInquiries")}건`} sub="전 브랜드" />
                <StatCard label="점검 필요" value={`${untiered + unmappedFocus}건`} sub={`Tier 미지정 ${untiered} · 집중 메뉴 미매핑 ${unmappedFocus}`} />
            </div>
            <Table rows={focus} title="핵심 · 집중 브랜드" desc="ums_sites.tier = core·focus. 사이드바 '집중 브랜드'와 같은 기준 — tier를 바꾸면 자동으로 이동" />
            <Table rows={rest} title="실험 · 보관 브랜드" desc="tier = experiment·archive 또는 미지정. 미지정은 Tier 결정 필요 (헌법 §0.1)" />
        </div>
    );
}
