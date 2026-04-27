// 프로젝트 마일스톤 — 체크리스트 + 간트 표시용
// planners_project_milestones 테이블
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

async function checkOwnership(admin: ReturnType<typeof createAdminClient>, memberId: string, projectId: string) {
    const { data } = await admin
        .from("planners_projects")
        .select("id")
        .eq("id", projectId)
        .eq("member_id", memberId)
        .maybeSingle();
    return !!data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    if (!(await checkOwnership(admin, memberId, projectId))) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const { data } = await admin
        .from("planners_project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

    return NextResponse.json({ milestones: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    if (!(await checkOwnership(admin, memberId, projectId))) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const body = await req.json();
    const { data, error } = await admin
        .from("planners_project_milestones")
        .insert({
            project_id: projectId,
            title: body.title || "새 마일스톤",
            description: body.description ?? null,
            due_date: body.due_date ?? null,
            order_index: body.order_index ?? 0,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ milestone: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    if (!(await checkOwnership(admin, memberId, projectId))) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const { data, error } = await admin
        .from("planners_project_milestones")
        .update(patch)
        .eq("id", id)
        .eq("project_id", projectId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ milestone: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    if (!(await checkOwnership(admin, memberId, projectId))) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const { error } = await admin
        .from("planners_project_milestones")
        .delete()
        .eq("id", id)
        .eq("project_id", projectId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
