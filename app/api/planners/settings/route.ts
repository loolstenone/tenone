import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_users')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

    return NextResponse.json({ user: data });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const patch = await req.json();
    const admin = createAdminClient();
    // upsert 로 변경 — planners_users row 가 없는 사용자(자동 생성 직후 등)에서도 동작
    const { data, error } = await admin
        .from('planners_users')
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
