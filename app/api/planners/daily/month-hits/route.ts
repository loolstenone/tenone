import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

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

    const hits = (data ?? []).map((row: { date: string; tasks: Array<{ text: string; status: string }> | null; notes: string | null; notes_secondary: string | null; energy_level: number | null }) => {
        const tasks = Array.isArray(row.tasks) ? row.tasks : [];
        const todoTasks = tasks.filter(t => t.status === "todo" || t.status === "done");

        return {
            date: row.date,
            task_texts: todoTasks.slice(0, 4).map(t => t.text),
            energy_level: row.energy_level,
        };
    });

    return NextResponse.json({ hits });
}
