import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSitesStatus } from "@/lib/site-status";

export const dynamic = "force-dynamic";

/**
 * GET /api/intra/sites/status[?site=rook] — 통합 관리 > 사이트 현황 · 브랜드 대시보드 공용
 * 전 사이트 공통 지표(가입 회원·게시글·문의) + 메뉴 레지스트리(lib/brand-site-menus.ts)가 있는 브랜드는 사이트 메뉴별 콘텐츠 수
 * Tier·상태 = ums_sites (헌법 §0.1 SSOT)
 */
export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    try {
        const sites = await computeSitesStatus(createAdminClient(), req.nextUrl.searchParams.get("site"));
        return NextResponse.json({ sites, generatedAt: new Date().toISOString() });
    } catch (e) {
        console.error("[intra/sites/status]", e);
        return NextResponse.json({ error: "사이트 현황을 불러오지 못했습니다." }, { status: 500 });
    }
}
