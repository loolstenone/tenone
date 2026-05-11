import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const [{ data }, { data: member }] = await Promise.all([
        admin
            .from('myverse_users')
            .select('*')
            .eq('member_id', memberId)
            .maybeSingle(),
        admin
            .from('members')
            .select('handle')
            .eq('id', memberId)
            .maybeSingle(),
    ]);

    // row 없거나 metrics 미설정이면 기본값 주입
    const user = (data ?? {}) as Record<string, unknown>;
    if (!Array.isArray(user.daily_tracking_metrics) || (user.daily_tracking_metrics as unknown[]).length === 0) {
        user.daily_tracking_metrics = ["satisfaction"];
    }
    // page_visible 기본값 (row 없는 신규 사용자)
    if (!('page_visible' in user)) {
        user.page_visible = true;
    }
    return NextResponse.json({ user, memberId, handle: member?.handle ?? null });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const patch = await req.json();
    const admin = createAdminClient();
    // upsert 로 변경 — myverse_users row 가 없는 사용자(자동 생성 직후 등)에서도 동작
    const { data, error } = await admin
        .from('myverse_users')
        .upsert(
            { member_id: memberId, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id' }
        )
        .select()
        .single();

    if (error) {
        console.error('settings upsert error', { patch, error });
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
    return NextResponse.json({ user: data });
}
