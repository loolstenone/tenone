import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data: project } = await admin
        .from('planners_projects')
        .select('*')
        .eq('id', id)
        .eq('member_id', memberId)
        .maybeSingle();

    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: vrief } = await admin.from('planners_project_vriefs').select('*').eq('project_id', id).maybeSingle();
    const { data: gpr } = await admin.from('planners_project_gprs').select('*').eq('project_id', id).maybeSingle();

    return NextResponse.json({ project, vrief, gpr });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminClient();

    // Verify ownership
    const { data: owned } = await admin
        .from('planners_projects')
        .select('id')
        .eq('id', id)
        .eq('member_id', memberId)
        .maybeSingle();
    if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });

    if (body.project) {
        await admin
            .from('planners_projects')
            .update({ ...body.project, updated_at: new Date().toISOString() })
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
