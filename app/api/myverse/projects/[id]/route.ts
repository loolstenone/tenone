import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberIdAndEmail } from "@/lib/myverse/auth";

type UserRole = "owner" | "editor" | "viewer";
type Collaborator = { email: string; role: "viewer" | "editor"; invited_at?: string };

async function resolveRole(
    admin: ReturnType<typeof createAdminClient>,
    id: string,
    memberId: string,
    email: string,
    selectFields = '*'
): Promise<{ project: Record<string, unknown>; userRole: UserRole } | null> {
    const { data: projectRaw } = await admin
        .from('myverse_projects')
        .select(selectFields)
        .eq('id', id)
        .maybeSingle();

    if (!projectRaw) return null;
    const project = projectRaw as unknown as Record<string, unknown>;

    if (project.member_id === memberId) return { project, userRole: "owner" };

    const collabs: Collaborator[] = (project.collaborators as Collaborator[] | null) ?? [];
    const collab = collabs.find(c => c.email === email);
    if (!collab) return null;

    return { project, userRole: collab.role };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getMemberIdAndEmail();
    if (!auth) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { memberId, email } = auth;

    const admin = createAdminClient();
    const resolved = await resolveRole(admin, id, memberId, email);
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { project, userRole } = resolved;

    const { data: vrief } = await admin.from('myverse_project_vriefs').select('*').eq('project_id', id).maybeSingle();
    const { data: gpr } = await admin.from('myverse_project_gprs').select('*').eq('project_id', id).maybeSingle();

    return NextResponse.json({ project, vrief, gpr, userRole });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getMemberIdAndEmail();
    if (!auth) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { memberId, email } = auth;

    const body = await req.json();
    const admin = createAdminClient();

    const resolved = await resolveRole(admin, id, memberId, email, 'id, member_id, collaborators');
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { userRole } = resolved;

    if (userRole === "viewer") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    let projectPatch = body.project;
    if (userRole === "editor" && projectPatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { collaborators, visibility, public_token, member_id, ...safeFields } = projectPatch;
        projectPatch = safeFields;
    }

    if (projectPatch && Object.keys(projectPatch).length > 0) {
        await admin
            .from('myverse_projects')
            .update({ ...projectPatch, updated_at: new Date().toISOString() })
            .eq('id', id);
    }
    if (body.vrief) {
        await admin
            .from('myverse_project_vriefs')
            .upsert(
                { project_id: id, ...body.vrief, updated_at: new Date().toISOString() },
                { onConflict: 'project_id' }
            );
    }
    if (body.gpr) {
        await admin
            .from('myverse_project_gprs')
            .upsert(
                { project_id: id, ...body.gpr, updated_at: new Date().toISOString() },
                { onConflict: 'project_id' }
            );
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getMemberIdAndEmail();
    if (!auth) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { memberId, email } = auth;

    const admin = createAdminClient();
    const resolved = await resolveRole(admin, id, memberId, email, "id, member_id, collaborators");
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
    // 오너만 삭제 가능 — editor / viewer 차단
    if (resolved.userRole !== "owner") {
        return NextResponse.json({ error: "forbidden", message: "프로젝트 삭제는 오너만 가능합니다." }, { status: 403 });
    }

    // 자식 데이터 정리 (FK CASCADE 가정 — 없을 시 명시 삭제)
    await admin.from("myverse_project_vriefs").delete().eq("project_id", id);
    await admin.from("myverse_project_gprs").delete().eq("project_id", id);
    await admin.from("myverse_project_notes").delete().eq("project_id", id);
    const { error } = await admin.from("myverse_projects").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
