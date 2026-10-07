import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// 로그인 회원 본인만 신청 — 서버(service_role)에서만 INSERT (테이블 공개 INSERT 정책 제거)
// 이름·이메일은 members가 SSOT (데이터 계약 1조) → 복사하지 않고 member_id만 저장
export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;

    const { plan, note } = await req.json().catch(() => ({} as { plan?: string; note?: string }));

    const { error } = await createAdminClient().from("coaching_waitlist").upsert({
        member_id: auth.memberId,
        plan: typeof plan === "string" && plan ? plan.slice(0, 50) : "standard",
        note: typeof note === "string" && note ? note.slice(0, 1000) : null,
        status: "waiting",
        created_at: new Date().toISOString(),
    }, { onConflict: "member_id,plan" });

    if (error) {
        console.error("[hero/coaching-waitlist]", error);
        return NextResponse.json({ error: "신청에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
