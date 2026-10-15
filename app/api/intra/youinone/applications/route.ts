/**
 * YouInOne 크루 신청 심사 — 직원 전용
 *   신청 = member_capability_roles (youinone · membership · applicant, 진행 중)
 *   승인 = 신청 행 종료 + approved_member 새 행 / 거절 = 신청 행 종료 (§1.3.1 — 역할 UPDATE 금지, DB 트리거가 강제)
 *   회원 역할 테이블은 브라우저에서 직원도 못 쓰므로(RLS) 서버가 처리한다
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const APPLICANT = { brand_id: "youinone", capability_key: "membership", role: "applicant" } as const;

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { data, error } = await createAdminClient().from("member_capability_roles")
        .select("id, member_id, role, context, valid_from, member:members!member_capability_roles_member_id_fkey(name)")
        .match(APPLICANT)
        .is("valid_until", null)
        .order("valid_from", { ascending: false })
        .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data ?? [] });
}

// POST { id, action: 'approve' | 'reject' }
export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => ({})) as { id?: string; action?: string };
    if (!body.id || !["approve", "reject"].includes(body.action ?? "")) {
        return NextResponse.json({ error: "id, action required" }, { status: 400 });
    }

    const admin = createAdminClient();
    // 진행 중인 신청 행만 종료 — 이미 처리된 신청이면 0행
    const { data: closed, error } = await admin.from("member_capability_roles")
        .update({ valid_until: new Date().toISOString() })
        .eq("id", body.id)
        .match(APPLICANT)
        .is("valid_until", null)
        .select("member_id")
        .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!closed) return NextResponse.json({ error: "이미 처리된 신청입니다." }, { status: 409 });

    if (body.action === "approve") {
        const { error: insErr } = await admin.from("member_capability_roles").insert({
            member_id: closed.member_id, brand_id: "youinone", capability_key: "membership", role: "approved_member",
            context: { application_id: body.id },
        });
        if (insErr) return NextResponse.json({ error: `신청은 종료됐지만 멤버 등록에 실패했습니다: ${insErr.message}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
