import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = await params;
    if (!memberId) return NextResponse.json({ error: "member_id_required" }, { status: 400 });

    const admin = createAdminClient();

    const [{ data: owner }, { data: projects }] = await Promise.all([
        admin
            .from("members")
            .select("id, name, avatar_url")
            .eq("id", memberId)
            .maybeSingle(),
        admin
            .from("planners_projects")
            .select("id, title, color, cover_id, category, status, start_date, end_date, completed_at, public_token, tags")
            .eq("member_id", memberId)
            .eq("visibility", "public_link")
            .order("created_at", { ascending: false }),
    ]);

    if (!owner) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!projects || projects.length === 0) return NextResponse.json({ error: "no_public_projects" }, { status: 404 });

    // milestone 진행률은 각 프로젝트별로 집계
    const milestoneStats = await Promise.all(
        projects.map(async (p) => {
            const { data: ms } = await admin
                .from("planners_project_milestones")
                .select("id, done_at")
                .eq("project_id", p.id);
            const total = ms?.length ?? 0;
            const done = ms?.filter(m => m.done_at).length ?? 0;
            return { id: p.id, total, done };
        })
    );

    const statsMap = Object.fromEntries(milestoneStats.map(s => [s.id, s]));

    return NextResponse.json({
        owner,
        projects: projects.map(p => ({
            ...p,
            milestone_total: statsMap[p.id]?.total ?? 0,
            milestone_done: statsMap[p.id]?.done ?? 0,
        })),
    });
}
