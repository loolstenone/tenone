/**
 * GET  /api/hero/achievements?memberId=...&limit=20&offset=0
 * POST /api/hero/achievements  { memberId, content, tags?, achieved_at? }
 * DELETE /api/hero/achievements?id=...&memberId=...
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    if (!memberId) return NextResponse.json({ error: "memberId 필수" }, { status: 400 });

    const sb = createAdminClient();
    const { data, error, count } = await sb
        .from("hero_achievements")
        .select("*", { count: "exact" })
        .eq("member_id", memberId)
        .order("achieved_at", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}

export async function POST(req: NextRequest) {
    const body = await req.json() as {
        memberId?: string;
        content?: string;
        tags?: string[];
        achieved_at?: string;
    };

    const { memberId, content, tags, achieved_at } = body;

    if (!memberId || !content?.trim()) {
        return NextResponse.json({ error: "memberId, content 필수" }, { status: 400 });
    }
    if (content.length > 200) {
        return NextResponse.json({ error: "내용은 200자 이내" }, { status: 400 });
    }
    if (tags && tags.length > 5) {
        return NextResponse.json({ error: "태그는 5개 이내" }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data, error } = await sb
        .from("hero_achievements")
        .insert({
            member_id: memberId,
            content: content.trim(),
            tags: (tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 5),
            achieved_at: achieved_at ?? new Date().toISOString().slice(0, 10),
        })
        .select("*")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const memberId = searchParams.get("memberId");

    if (!id || !memberId) return NextResponse.json({ error: "id, memberId 필수" }, { status: 400 });

    const sb = createAdminClient();
    const { error } = await sb
        .from("hero_achievements")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
