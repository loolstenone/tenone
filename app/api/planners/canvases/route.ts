// 자유 캔버스 (Excalidraw) 컬렉션 — 목록 조회 + 신규 생성

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

export async function GET() {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_canvases")
        .select("id, title, thumbnail_url, is_archived, created_at, updated_at")
        .eq("member_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ canvases: data ?? [] });
}

export async function POST(req: Request) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title: string = (body?.title ?? "").trim() || "제목 없음";

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_canvases")
        .insert({ member_id: user.id, title, data: { elements: [], appState: {} } })
        .select("id, title, created_at, updated_at")
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ canvas: data });
}
