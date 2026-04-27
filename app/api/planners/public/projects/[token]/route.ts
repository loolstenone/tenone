// 공개 프로젝트 읽기 (인증 불필요)
// public_token이 일치하면 프로젝트 + 노트 + 마일스톤 + 회고를 read-only로 반환
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: project } = await admin
        .from("planners_projects")
        .select("id, member_id, title, color, cover_id, category, status, start_date, end_date, completed_at, retrospective, tracking_metrics, custom_fields, tags")
        .eq("public_token", token)
        .eq("visibility", "public_link")
        .maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const [{ data: notes }, { data: milestones }, { data: vrief }, { data: gpr }, { data: owner }] = await Promise.all([
        admin.from("planners_project_notes").select("id, title, content, order_index").eq("project_id", project.id).order("order_index"),
        admin.from("planners_project_milestones").select("id, title, description, due_date, done_at, order_index").eq("project_id", project.id).order("order_index"),
        admin.from("planners_project_vriefs").select("*").eq("project_id", project.id).maybeSingle(),
        admin.from("planners_project_gprs").select("*").eq("project_id", project.id).maybeSingle(),
        admin.from("members").select("name, avatar_url").eq("id", project.member_id).maybeSingle(),
    ]);

    return NextResponse.json({
        project: { ...project, member_id: undefined },
        notes: notes ?? [],
        milestones: milestones ?? [],
        vrief: vrief ?? null,
        gpr: gpr ?? null,
        owner: owner ?? null,
    });
}
