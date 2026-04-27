// 자유 캔버스 단건 — 조회 / 저장 / 삭제

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMember() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_: Request, ctx: RouteContext) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { id } = await ctx.params;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_canvases")
        .select("id, title, data, thumbnail_url, is_archived, created_at, updated_at, member_id")
        .eq("id", id)
        .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.member_id !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 응답에서 member_id 제거
    const { member_id: _omit, ...canvas } = data;
    void _omit;
    return NextResponse.json({ canvas });
}

export async function PATCH(req: Request, ctx: RouteContext) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (body.data !== undefined) patch.data = body.data;
    if (typeof body.thumbnail_url === "string") patch.thumbnail_url = body.thumbnail_url;
    if (typeof body.is_archived === "boolean") patch.is_archived = body.is_archived;
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "no_fields" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_canvases")
        .update(patch)
        .eq("id", id)
        .eq("member_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, ctx: RouteContext) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { id } = await ctx.params;

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_canvases")
        .delete()
        .eq("id", id)
        .eq("member_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
