// 특정 날짜 범위의 외부 이벤트 조회 (캘린더 뷰에서 사용)

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: member } = await supabase.from("members").select("id").eq("email", user.email!).maybeSingle();
    return member?.id ?? null;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!from || !to) return NextResponse.json({ events: [] });

    const admin = createAdminClient();
    const { data } = await admin
        .from("planners_external_events")
        .select("*")
        .eq("member_id", memberId)
        .gte("start_at", from)
        .lte("start_at", to)
        .order("start_at");

    return NextResponse.json({ events: data ?? [] });
}
