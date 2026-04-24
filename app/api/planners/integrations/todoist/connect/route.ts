// Todoist 연결 — 사용자가 API 토큰을 직접 제공 (Todoist 설정에서 발급)

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/planners/todoist";

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

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { token } = body;
    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "token_required" }, { status: 400 });
    }

    const { ok } = await verifyToken(token);
    if (!ok) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_integrations").upsert({
        member_id: memberId,
        provider: "todoist",
        status: "active",
        access_token: token,
        sync_direction: "read",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.json({ ok: true });
}
