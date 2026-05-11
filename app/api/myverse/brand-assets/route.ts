// 브랜드 자산 API — 로고/팔레트/타이포/태그라인/미션/이미지/링크
// GET    /api/myverse/brand-assets[?type=logo|palette|...]
// POST   /api/myverse/brand-assets   { type, title, ... }
// PATCH  /api/myverse/brand-assets   { id, ...patch }
// DELETE /api/myverse/brand-assets?id=...

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
    "logo", "palette", "typography", "image", "template", "link", "tagline", "mission",
]);

const ALLOWED_VIS = new Set(["private", "friends", "public"]);

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const cardOnly = url.searchParams.get("card_only") === "1";

    const admin = createAdminClient();
    let q = admin
        .from("myverse_brand_assets")
        .select("*")
        .eq("member_id", memberId)
        .order("type")
        .order("is_primary", { ascending: false })
        .order("order_index")
        .order("created_at", { ascending: false });

    if (type && ALLOWED_TYPES.has(type)) q = q.eq("type", type);
    if (cardOnly) q = q.eq("show_on_card", true);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ assets: data ?? [] });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const type = String(body.type ?? "");
    const title = String(body.title ?? "").trim();

    if (!ALLOWED_TYPES.has(type)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 });

    const admin = createAdminClient();
    const insert: Record<string, unknown> = {
        member_id: memberId,
        type,
        title,
        description: body.description ?? null,
        file_url: body.file_url ?? null,
        thumbnail_url: body.thumbnail_url ?? null,
        data: body.data ?? {},
        category: body.category ?? null,
        order_index: typeof body.order_index === "number" ? body.order_index : 0,
        is_primary: !!body.is_primary,
        visibility: ALLOWED_VIS.has(body.visibility) ? body.visibility : "private",
        show_on_card: !!body.show_on_card,
        show_on_portfolio: !!body.show_on_portfolio,
    };

    // is_primary=true 시 같은 type 의 기존 primary 해제
    if (insert.is_primary) {
        await admin
            .from("myverse_brand_assets")
            .update({ is_primary: false })
            .eq("member_id", memberId)
            .eq("type", type);
    }

    const { data, error } = await admin
        .from("myverse_brand_assets")
        .insert(insert)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ asset: data });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) patch.title = String(body.title).trim();
    if (body.description !== undefined) patch.description = body.description;
    if (body.file_url !== undefined) patch.file_url = body.file_url;
    if (body.thumbnail_url !== undefined) patch.thumbnail_url = body.thumbnail_url;
    if (body.data !== undefined) patch.data = body.data;
    if (body.category !== undefined) patch.category = body.category;
    if (body.order_index !== undefined) patch.order_index = body.order_index;
    if (body.is_primary !== undefined) patch.is_primary = !!body.is_primary;
    if (body.visibility !== undefined && ALLOWED_VIS.has(body.visibility)) patch.visibility = body.visibility;
    if (body.show_on_card !== undefined) patch.show_on_card = !!body.show_on_card;
    if (body.show_on_portfolio !== undefined) patch.show_on_portfolio = !!body.show_on_portfolio;

    // is_primary 전환 시 동일 type 내 다른 primary 해제
    if (patch.is_primary === true) {
        const { data: target } = await admin
            .from("myverse_brand_assets")
            .select("type")
            .eq("id", id)
            .eq("member_id", memberId)
            .maybeSingle();
        if (target?.type) {
            await admin
                .from("myverse_brand_assets")
                .update({ is_primary: false })
                .eq("member_id", memberId)
                .eq("type", target.type)
                .neq("id", id);
        }
    }

    const { data, error } = await admin
        .from("myverse_brand_assets")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ asset: data });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_brand_assets")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
