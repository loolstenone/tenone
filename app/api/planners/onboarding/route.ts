import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
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
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('email', user.email!)
        .maybeSingle();
    if (!member) return NextResponse.json({ error: "member_not_found" }, { status: 404 });

    const body = await req.json();
    const {
        mode,
        ai_morning_time,
        ai_evening_time,
        ai_tone,
        vision_statement,
        mission_statement,
    } = body;

    const admin = createAdminClient();

    // 1. planners_users upsert
    await admin
        .from('planners_users')
        .upsert(
            {
                member_id: member.id,
                mode,
                ai_morning_time,
                ai_evening_time,
                ai_tone,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'member_id' }
        );

    // 2. planners_identities upsert (vision/mission만)
    if (vision_statement || mission_statement) {
        await admin
            .from('planners_identities')
            .upsert(
                {
                    member_id: member.id,
                    vision_statement: vision_statement || null,
                    mission_statement: mission_statement || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'member_id' }
            );
    }

    return NextResponse.json({ ok: true });
}
