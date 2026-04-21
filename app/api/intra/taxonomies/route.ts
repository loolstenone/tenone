/**
 * Taxonomies CRUD API — Universe 공통 분류 상수 SSOT
 * GET /api/intra/taxonomies?kind=industry|job_function|...
 * POST — 추가 (staff role 필요)
 * PATCH — 수정 (id + 필드)
 * DELETE — id 기준
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

export async function GET(req: NextRequest) {
    const kind = req.nextUrl.searchParams.get("kind");
    const sb = adminClient();
    let q = sb.from("taxonomies").select("*").order("kind").order("sort_order");
    if (kind) q = q.eq("kind", kind);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { kind, value, category, sort_order, description } = body;
    if (!kind || !value) return NextResponse.json({ error: "kind·value 필수" }, { status: 400 });

    const sb = adminClient();
    const { data, error } = await sb.from("taxonomies").insert({
        kind, value, category: category || null, sort_order: sort_order ?? 99,
        description: description || null, is_active: true, is_core: false,
        tenant_id: "tenone",
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

    const sb = adminClient();
    const { data, error } = await sb.from("taxonomies").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });
    const sb = adminClient();
    const { error } = await sb.from("taxonomies").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
