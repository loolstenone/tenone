// 마인드맵/캔버스 공유 링크 생성·해제

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

// POST — 공유 토큰 생성 (이미 있으면 재사용)
export async function POST(_: Request, ctx: RouteContext) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { id } = await ctx.params;

    const admin = createAdminClient();

    // 소유권 확인
    const { data: canvas } = await admin
        .from("myverse_canvases")
        .select("id, share_token")
        .eq("id", id)
        .eq("member_id", user.id)
        .maybeSingle();
    if (!canvas) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 이미 토큰 있으면 그대로 반환
    if (canvas.share_token) {
        return NextResponse.json({ share_token: canvas.share_token });
    }

    // 새 UUID 토큰 생성
    const { data: tokenRow } = await admin.rpc("gen_random_uuid" as never);
    const token = (tokenRow as string) ?? crypto.randomUUID();

    const { error } = await admin
        .from("myverse_canvases")
        .update({ share_token: token })
        .eq("id", id)
        .eq("member_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ share_token: token });
}

// DELETE — 공유 링크 해제
export async function DELETE(_: Request, ctx: RouteContext) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { id } = await ctx.params;

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_canvases")
        .update({ share_token: null })
        .eq("id", id)
        .eq("member_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
