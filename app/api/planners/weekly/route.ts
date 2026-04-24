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
    const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('email', user.email!)
        .maybeSingle();
    return member?.id ?? null;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    const week = parseInt(url.searchParams.get("week") || "0", 10);
    if (!year || !week) return NextResponse.json({ error: "year_week_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_weekly')
        .select('*')
        .eq('member_id', memberId)
        .eq('year', year)
        .eq('week', week)
        .maybeSingle();

    return NextResponse.json({ weekly: data });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { year, week, week_start, week_end, ...patch } = body;
    if (!year || !week) return NextResponse.json({ error: "year_week_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('planners_weekly')
        .upsert(
            {
                member_id: memberId,
                year,
                week,
                week_start,
                week_end,
                ...patch,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'member_id,year,week' }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ weekly: data });
}
