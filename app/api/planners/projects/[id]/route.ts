import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberIdAndEmail } from "@/lib/planners/auth";

type UserRole = "owner" | "editor" | "viewer";
type Collaborator = { email: string; role: "viewer" | "editor"; invited_at?: string };

async function resolveRole(
    admin: ReturnType<typeof createAdminClient>,
    id: string,
    memberId: string,
    email: string,
    selectFields = '*'
): Promise<{ project: Record<string, unknown>; userRole: UserRole } | null> {
    const { data: project } = await admin
        .from('planners_projects')
        .select(selectFields)
        .eq('id', id)
        .maybeSingle();

    if (!project) return null;

    if (project.member_id === memberId) return { project, userRole: "owner" };

    const collabs: Collaborator[] = project.collaborators ?? [];
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

    const { data: vrief } = await admin.from('planners_project_vriefs').select('*').eq('project_id', id).maybeSingle();
    const { data: gpr } = await admin.from('planners_project_gprs').select('*').eq('project_id', id).maybeSingle();

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
            .from('planners_projects')
            .update({ ...projectPatch, updated_at: new Date().toISOString() })
            .eq('id', id);
    }
    if (body.vrief) {
        await admin
            .from('planners_project_vriefs')
            .upsert(
                { project_id: id, ...body.vrief, updated_at: new Date().toISOString() },
                { onConflict: 'project_id' }
            );
    }
    if (body.gpr) {
        await admin
            .from('planners_project_gprs')
            .upsert(
                { project_id: id, ...body.gpr, updated_at: new Date().toISOString() },
                { onConflict: 'project_id' }
            );
    }

    return NextResponse.json({ ok: true });
}
