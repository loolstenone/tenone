import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
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
    const { data: member } = await supabase.from('members').select('id').eq('email', user.email!).maybeSingle();
    return member?.id ?? null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
    }

    const h = await headers();
    const userAgent = h.get("user-agent") || null;

    const admin = createAdminClient();
    await admin.from("planners_push_subscriptions").upsert({
        member_id: memberId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
    }, { onConflict: "endpoint" });

    // 구독 등록 시 자동으로 push 알림 활성화
    await admin
        .from("planners_users")
        .update({ notify_push_briefing: true, updated_at: new Date().toISOString() })
        .eq("member_id", memberId);

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: "endpoint_required" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_push_subscriptions").delete().eq("member_id", memberId).eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
}
