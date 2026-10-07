/**
 * 사이트 내 알림 — 본인 것만 (유니버스 유틸리티 바 🔔)
 *   GET   /api/notifications            최근 30건 + 안 읽은 수
 *   PATCH /api/notifications { ids? }   읽음 처리 (ids 없으면 전체)
 * 알림 생성은 서버 헬퍼 lib/notify.ts 만 (사용자 직접 생성 불가)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const me = await requireMember(req);
    if (me instanceof NextResponse) return me;
    const admin = createAdminClient();
    const [{ data }, { count }] = await Promise.all([
        admin.from("notifications").select("id, title, message, link, is_read, created_at, brand_id, type")
            .eq("member_id", me.memberId).order("created_at", { ascending: false }).limit(30),
        admin.from("notifications").select("id", { count: "exact", head: true }).eq("member_id", me.memberId).eq("is_read", false),
    ]);
    return NextResponse.json({
        notifications: (data ?? []).map(n => ({ id: n.id, title: n.title, body: n.message, href: n.link, created_at: n.created_at, read: n.is_read, brand_id: n.brand_id, type: n.type })),
        unread: count ?? 0,
    });
}

export async function PATCH(req: NextRequest) {
    const me = await requireMember(req);
    if (me instanceof NextResponse) return me;
    const body = await req.json().catch(() => ({}));
    let q = createAdminClient().from("notifications").update({ is_read: true }).eq("member_id", me.memberId).eq("is_read", false);
    if (Array.isArray(body.ids)) q = q.in("id", body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100));
    const { error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
