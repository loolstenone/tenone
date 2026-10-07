"use client";

import Link from "next/link";
import { ExternalLink, Users, MessageCircle, Loader2, LayoutGrid } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { SiteMenuTable, useSiteStatus } from "@/components/intra/BrandSiteStatus";

// 숫자 출처 = /api/intra/sites/status (통합 관리 > 사이트 현황과 동일) · 메뉴 = lib/brand-site-menus.ts
export default function RookDashboard() {
    const { data, error } = useSiteStatus("rook");
    const site = data?.[0];

    return (
        <div>
            <PageHeader title="RooK 대시보드" description="AI 크리에이터 루크 — 사이트 메뉴별 콘텐츠·문의 현황">
                <a href={brandSiteUrl("rook", "/rook")} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </a>
            </PageHeader>

            {error ? (
                <p className="text-sm text-red-600">{error}</p>
            ) : !site ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="가입 회원" value={`${site.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="게시글" value={`${site.posts}개`} icon={<LayoutGrid className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${site.openInquiries}건`}
                            sub="Contact · RooKie 지원" icon={<MessageCircle className="h-4 w-4" />} />
                    </div>

                    <Card>
                        <SectionTitle title="사이트 메뉴별 현황" />
                        <SiteMenuTable site={site} />
                        <div className="mt-4 flex gap-3 text-xs">
                            <Link href="/intra/ums/rook/community" className="text-blue-600 hover:underline">전체 게시글</Link>
                            <Link href="/intra/ums/rook/members" className="text-blue-600 hover:underline">회원 관리</Link>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
