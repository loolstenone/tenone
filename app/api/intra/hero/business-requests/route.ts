/**
 * 인트라 — HeRo 기업 서비스 신청 (팀 진단 · 인재 풀 리포트 · 헤드헌팅)
 * GET   /api/intra/hero/business-requests?service=&status=
 * PATCH /api/intra/hero/business-requests  { id, status?, adminNote? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_REQUEST_STATUS } from "@/lib/hero/business-services";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const service = req.nextUrl.searchParams.get("service");
    const status = req.nextUrl.searchParams.get("status");
    let q = createAdminClient().from("hero_business_inquiries").select("*")
        .not("service", "is", null).order("created_at", { ascending: false }).limit(300);
    if (service && service !== "all") q = q.eq("service", service);
    if (status && status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "";
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now };
    if (typeof body?.status === "string" && body.status in BUSINESS_REQUEST_STATUS) {
        patch.status = body.status;
        if (body.status !== "pending") patch.handled_at = now;
    }
    if (typeof body?.adminNote === "string") patch.admin_note = body.adminNote.slice(0, 2000);
    const { error } = await createAdminClient().from("hero_business_inquiries").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
