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
    const month = parseInt(url.searchParams.get("month") || "0", 10);
    if (!year || !month) return NextResponse.json({ error: "year_month_required" }, { status: 400 });

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDate = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;

    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_daily')
        .select('date, tasks, notes, notes_secondary, energy_level')
        .eq('member_id', memberId)
        .gte('date', firstDay)
        .lte('date', lastDay);

    const hits = (data ?? []).map((row: { date: string; tasks: unknown[]; notes: string | null; notes_secondary: string | null; energy_level: number | null }) => ({
        date: row.date,
        has_tasks: Array.isArray(row.tasks) && row.tasks.length > 0,
        has_notes: !!(row.notes || row.notes_secondary),
        energy_level: row.energy_level,
    }));

    return NextResponse.json({ hits });
}
