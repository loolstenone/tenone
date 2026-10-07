import { NextRequest, NextResponse } from "next/server";
import { sessionMemberId } from "@/lib/programs/access";
import { recordProgramConsent } from "@/lib/programs/consent";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// POST { brand, agree: true } — 프로그램 참가 동의 (주인 브랜드 기준, member_brand_joins)
export async function POST(req: NextRequest) {
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (body.agree !== true) return NextResponse.json({ error: "동의가 필요합니다." }, { status: 400 });
    const brand = String(body.brand ?? "");
    const { data: site } = await createAdminClient().from("ums_sites").select("slug").eq("slug", brand).maybeSingle();
    if (!site) return NextResponse.json({ error: "알 수 없는 서비스입니다." }, { status: 400 });
    const { error } = await recordProgramConsent(memberId, brand);
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ ok: true });
}
