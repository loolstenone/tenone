/**
 * GET  /api/brand-join?site={siteId} — 이 브랜드 이용 동의가 필요한가 (본인)
 * POST /api/brand-join { site }       — 첫 진입 동의 기록 (본인)
 * 회원 식별은 세션만 (body·query의 회원 id를 받지 않는다)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { hasBrandEntryConsent, recordBrandEntryConsent, resolveBrandSlug } from "@/lib/brand-join";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const slug = await resolveBrandSlug(req.nextUrl.searchParams.get("site") ?? "");
    if (!slug) return NextResponse.json({ required: false });
    return NextResponse.json({ required: !(await hasBrandEntryConsent(auth.memberId, slug)), brand: slug });
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({})) as { site?: string; agreed?: boolean };
    if (body.agreed !== true) return NextResponse.json({ error: "동의가 필요합니다" }, { status: 400 });
    const slug = await resolveBrandSlug(body.site ?? "");
    if (!slug) return NextResponse.json({ error: "대상 서비스가 아닙니다" }, { status: 400 });
    const { error } = await recordBrandEntryConsent(auth.memberId, slug);
    if (error) {
        console.error("[brand-join] record failed:", error);
        return NextResponse.json({ error: "동의 저장에 실패했습니다" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
