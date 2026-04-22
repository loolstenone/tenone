import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const { plan, note } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: member } = await supabase
        .from("members")
        .select("id, email, name")
        .eq("auth_id", user.id)
        .single();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const { error } = await supabase.from("coaching_waitlist").upsert({
        member_id: member.id,
        email: member.email,
        name: member.name,
        plan: plan || "standard",
        note: note || null,
        status: "waiting",
        created_at: new Date().toISOString(),
    }, { onConflict: "member_id,plan" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
