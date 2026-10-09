/** 첫 로그인 확인(인사 처리 안내 + 보안 서약) — 본인 세션으로만 (lib/staff-lifecycle.ts) */
import { NextResponse, type NextRequest } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { completeOnboarding } from "@/lib/staff-lifecycle";
import { HR_NOTICE_VERSION, SECURITY_PLEDGE_VERSION } from "@/lib/staff-presets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => null) as { hrNotice?: boolean; pledge?: boolean } | null;
    if (!body?.hrNotice || !body.pledge) return NextResponse.json({ error: "두 항목 모두 확인해 주세요" }, { status: 400 });
    try {
        await completeOnboarding(auth.memberId, { hr_notice_version: HR_NOTICE_VERSION, pledge_version: SECURITY_PLEDGE_VERSION });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
}
