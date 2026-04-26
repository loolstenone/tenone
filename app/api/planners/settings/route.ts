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
    const { data, error } = await admin
        .from('planners_users')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('member_id', memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data });
}
