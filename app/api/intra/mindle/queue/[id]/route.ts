// PATCH /api/intra/mindle/queue/:id
// body: { action: 'publish' | 'draft' | 'reject' }
//
// status='collected'인 mindle_trends row를 운영자가 1-click 전환.
// staff/manager/super_admin 권한 필요.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ACTION_TO_STATUS = {
    publish: "published",
    draft: "draft",
    reject: "archived",   // archived = 운영자 기각 (collected_data와 구분)
} as const;

type Action = keyof typeof ACTION_TO_STATUS;

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "id 누락" }, { status: 400 });
        }

        // 1. 인증
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "인증 필요" }, { status: 401 });
        }

        // 2. 권한 — staff/manager/super_admin만
        const admin = createAdminClient();
        const { data: member } = await admin
            .from("members")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();
        if (!member) {
            return NextResponse.json({ error: "멤버 정보 없음" }, { status: 404 });
        }

        const { data: roleRow } = await admin
            .from("member_roles")
            .select("role")
            .eq("member_id", member.id)
            .in("role", ["staff", "manager", "super_admin"])
            .eq("is_active", true)
            .maybeSingle();
        if (!roleRow) {
            return NextResponse.json({ error: "Mindle 검수 권한이 없습니다." }, { status: 403 });
        }

        // 3. action 검증
        const body = await request.json().catch(() => ({}));
        const action = body.action as Action | undefined;
        if (!action || !(action in ACTION_TO_STATUS)) {
            return NextResponse.json({ error: "action은 publish/draft/reject 중 하나" }, { status: 400 });
        }

        const newStatus = ACTION_TO_STATUS[action];

        // 4. 대상이 진짜 collected인지 확인 (이중 클릭 방지)
        const { data: target } = await admin
            .from("mindle_trends")
            .select("id, status")
            .eq("id", id)
            .maybeSingle();
        if (!target) {
            return NextResponse.json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
        }
        if (target.status !== "collected") {
            return NextResponse.json({ error: `이미 ${target.status} 상태입니다.` }, { status: 409 });
        }

        // 5. status 전환
        const { error: updErr } = await admin
            .from("mindle_trends")
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...(newStatus === "published" ? { published_at: new Date().toISOString() } : {}),
            })
            .eq("id", id);
        if (updErr) {
            return NextResponse.json({ error: updErr.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id, status: newStatus });
    } catch (e) {
        console.error("[mindle/queue] PATCH error", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
