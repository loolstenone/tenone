// 프로젝트 대시보드용 집계 — Daily PROJECT 카드에서 사용
// 활성 프로젝트 + 진행률(GPR avg) + D-N(end_date) + 오늘 task 수
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const admin = createAdminClient();

    // 활성 프로젝트 + GPR 진행률
    const { data: projects } = await admin
        .from("planners_projects")
        .select("id, title, color, cover_id, category, end_date, status, planners_project_gprs(progress)")
        .eq("member_id", memberId)
        .eq("status", "active")
        .order("order_index");

    // 오늘 daily의 task 배열 — 프로젝트별 카운트
    const { data: daily } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", date)
        .maybeSingle();

    const tasks: Array<{ project_id?: string | null; status?: string }> = Array.isArray(daily?.tasks)
        ? daily.tasks
        : [];

    const taskCountByProject: Record<string, { total: number; done: number }> = {};
    for (const t of tasks) {
        const pid = t.project_id;
        if (!pid) continue;
        if (!taskCountByProject[pid]) taskCountByProject[pid] = { total: 0, done: 0 };
        taskCountByProject[pid].total += 1;
        if (t.status === "done") taskCountByProject[pid].done += 1;
    }

    type GprRow = { progress: number };
    type ProjectRow = {
        id: string;
        title: string;
        color: string | null;
        cover_id: string | null;
        category: string | null;
        end_date: string | null;
        status: string;
        planners_project_gprs: GprRow[] | GprRow | null;
    };

    const items = ((projects ?? []) as ProjectRow[]).map((p) => {
        const gprs = Array.isArray(p.planners_project_gprs)
            ? p.planners_project_gprs
            : p.planners_project_gprs ? [p.planners_project_gprs] : [];
        const progress = gprs.length > 0
            ? Math.round(gprs.reduce((s: number, g: { progress: number }) => s + (g.progress || 0), 0) / gprs.length)
            : 0;

        let daysLeft: number | null = null;
        if (p.end_date) {
            const end = new Date(p.end_date + "T00:00:00Z");
            const now = new Date(date + "T00:00:00Z");
            daysLeft = Math.round((end.getTime() - now.getTime()) / 86400000);
        }

        return {
            id: p.id,
            title: p.title,
            color: p.color,
            cover_id: p.cover_id,
            category: p.category,
            end_date: p.end_date,
            progress,
            days_left: daysLeft,
            today_task_count: taskCountByProject[p.id]?.total ?? 0,
            today_task_done: taskCountByProject[p.id]?.done ?? 0,
        };
    });

    return NextResponse.json({ projects: items });
}
