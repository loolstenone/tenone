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

interface SearchHit {
    source: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'project' | 'project_note' | 'briefing' | 'identity';
    id: string;
    title: string;
    snippet: string;
    date?: string;
    href: string;
}

function snippet(text: string, q: string, width = 80): string {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, width);
    const start = Math.max(0, idx - 20);
    const end = Math.min(text.length, idx + q.length + width);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q || q.length < 2) return NextResponse.json({ hits: [] });

    const admin = createAdminClient();
    const hits: SearchHit[] = [];
    const ilike = `%${q}%`;

    const [daily, weekly, monthly, yearly, projects, notes, briefings, identity] = await Promise.all([
        admin.from('planners_daily')
            .select('id, date, notes, notes_secondary, daily_result')
            .eq('member_id', memberId)
            .or(`notes.ilike.${ilike},notes_secondary.ilike.${ilike},daily_result.ilike.${ilike}`)
            .order('date', { ascending: false })
            .limit(10),
        admin.from('planners_weekly')
            .select('id, year, week, vrief_what, vrief_why, vrief_how, gpr_goal, gpr_plan, gpr_result, reflection')
            .eq('member_id', memberId)
            .or(`vrief_what.ilike.${ilike},vrief_why.ilike.${ilike},vrief_how.ilike.${ilike},gpr_goal.ilike.${ilike},gpr_plan.ilike.${ilike},gpr_result.ilike.${ilike},reflection.ilike.${ilike}`)
            .order('year', { ascending: false })
            .order('week', { ascending: false })
            .limit(10),
        admin.from('planners_monthly')
            .select('id, year, month, theme, reflection')
            .eq('member_id', memberId)
            .or(`theme.ilike.${ilike},reflection.ilike.${ilike}`)
            .limit(10),
        admin.from('planners_yearly')
            .select('id, year, theme, reflection')
            .eq('member_id', memberId)
            .or(`theme.ilike.${ilike},reflection.ilike.${ilike}`)
            .limit(5),
        admin.from('planners_projects')
            .select('id, title')
            .eq('member_id', memberId)
            .ilike('title', ilike)
            .limit(10),
        admin.from('planners_project_notes')
            .select('id, title, content, project_id, planners_projects!inner(member_id)')
            .eq('planners_projects.member_id', memberId)
            .or(`title.ilike.${ilike},content.ilike.${ilike}`)
            .limit(10),
        admin.from('planners_ai_briefings')
            .select('id, briefing_type, briefing_date, content')
            .eq('member_id', memberId)
            .ilike('content', ilike)
            .order('briefing_date', { ascending: false })
            .limit(10),
        admin.from('planners_identities')
            .select('id, vision_statement, mission_statement, execution_plan, inside_who, inside_vision, outside_position')
            .eq('member_id', memberId)
            .or(`vision_statement.ilike.${ilike},mission_statement.ilike.${ilike},execution_plan.ilike.${ilike},inside_who.ilike.${ilike},inside_vision.ilike.${ilike},outside_position.ilike.${ilike}`)
            .limit(1),
    ]);

    (daily.data ?? []).forEach((r: { id: string; date: string; notes: string | null; notes_secondary: string | null; daily_result: string | null }) => {
        const text = [r.notes, r.notes_secondary, r.daily_result].filter(Boolean).join(" · ");
        hits.push({
            source: "daily",
            id: r.id,
            title: `Daily · ${r.date}`,
            snippet: snippet(text, q),
            date: r.date,
            href: `/planners/app/today?date=${r.date}`,
        });
    });

    (weekly.data ?? []).forEach((r: { id: string; year: number; week: number; vrief_what: string | null; vrief_why: string | null; vrief_how: string | null; gpr_goal: string | null; gpr_plan: string | null; gpr_result: string | null; reflection: string | null }) => {
        const text = [r.vrief_what, r.vrief_why, r.vrief_how, r.gpr_goal, r.gpr_plan, r.gpr_result, r.reflection].filter(Boolean).join(" · ");
        hits.push({
            source: "weekly",
            id: r.id,
            title: `Weekly · ${r.year} W${String(r.week).padStart(2, "0")}`,
            snippet: snippet(text, q),
            href: `/planners/app/weekly?year=${r.year}&week=${r.week}`,
        });
    });

    (monthly.data ?? []).forEach((r: { id: string; year: number; month: number; theme: string | null; reflection: string | null }) => {
        const text = [r.theme, r.reflection].filter(Boolean).join(" · ");
        hits.push({
            source: "monthly",
            id: r.id,
            title: `Monthly · ${r.year}.${String(r.month).padStart(2, "0")}`,
            snippet: snippet(text, q),
            href: `/planners/app/monthly?year=${r.year}&month=${r.month}`,
        });
    });

    (yearly.data ?? []).forEach((r: { id: string; year: number; theme: string | null; reflection: string | null }) => {
        const text = [r.theme, r.reflection].filter(Boolean).join(" · ");
        hits.push({
            source: "yearly",
            id: r.id,
            title: `Yearly · ${r.year}`,
            snippet: snippet(text, q),
            href: `/planners/app/yearly?year=${r.year}`,
        });
    });

    (projects.data ?? []).forEach((r: { id: string; title: string }) => {
        hits.push({
            source: "project",
            id: r.id,
            title: `Project · ${r.title}`,
            snippet: r.title,
            href: `/planners/app/projects/${r.id}`,
        });
    });

    (notes.data ?? []).forEach((r: { id: string; title: string | null; content: string | null; project_id: string }) => {
        const text = [r.title, r.content].filter(Boolean).join(" · ");
        hits.push({
            source: "project_note",
            id: r.id,
            title: `Note · ${r.title || "(무제)"}`,
            snippet: snippet(text, q),
            href: `/planners/app/projects/${r.project_id}`,
        });
    });

    (briefings.data ?? []).forEach((r: { id: string; briefing_type: string; briefing_date: string; content: string }) => {
        hits.push({
            source: "briefing",
            id: r.id,
            title: `${r.briefing_type === "morning" ? "아침" : "저녁"} 브리핑 · ${r.briefing_date}`,
            snippet: snippet(r.content, q),
            date: r.briefing_date,
            href: `/planners/app/ai-briefing`,
        });
    });

    (identity.data ?? []).forEach((r: { id: string; vision_statement: string | null; mission_statement: string | null; execution_plan: string | null; inside_who: string | null; inside_vision: string | null; outside_position: string | null }) => {
        const text = [r.vision_statement, r.mission_statement, r.execution_plan, r.inside_who, r.inside_vision, r.outside_position].filter(Boolean).join(" · ");
        hits.push({
            source: "identity",
            id: r.id,
            title: "Personal Identity",
            snippet: snippet(text, q),
            href: `/planners/app/identity`,
        });
    });

    return NextResponse.json({ hits });
}
