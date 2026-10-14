"use client";

import { ExternalLink, Users, FileText, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { SiteMenuTable, useSiteStatus } from "@/components/intra/BrandSiteStatus";

// 숫자 출처 = /api/intra/sites/status (통합 관리 > 사이트 현황과 동일) · 메뉴 = lib/brand-site-menus.ts (2026-10-14 집중 승격)
export default function PlannersDashboard() {
    const { data, error } = useSiteStatus("planners");
    const site = data?.[0];

    return (
        <div>
            <PageHeader title="Planner's 대시보드" description="기획자의 정체성·도구·훈련 — 사이트 메뉴별 자료·프로젝트 현황">
                <a href={brandSiteUrl("planners", "/planners")} target="_blank" rel="noopener noreferrer"
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
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <StatCard label="가입 회원" value={`${site.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="게시글" value={`${site.posts}개`} icon={<FileText className="h-4 w-4" />} />
                    </div>
                    <Card>
                        <SectionTitle title="사이트 메뉴별 현황" />
                        <SiteMenuTable site={site} />
                    </Card>
                </>
            )}
        </div>
    );
}
