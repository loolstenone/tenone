import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

async function verifyOwnership(projectId: string, noteId: string, memberId: string): Promise<boolean> {
    const admin = createAdminClient();
    const { data } = await admin
        .from('myverse_project_notes')
        .select('id, myverse_projects!inner(member_id)')
        .eq('id', noteId)
        .eq('project_id', projectId)
        .maybeSingle();
    if (!data) return false;
    const p = (data as { myverse_projects: { member_id: string } | { member_id: string }[] }).myverse_projects;
    const ownerId = Array.isArray(p) ? p[0]?.member_id : p?.member_id;
    return ownerId === memberId;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; noteId: string }> }) {
    const { id, noteId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!(await verifyOwnership(id, noteId, memberId))) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const patch = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('myverse_project_notes')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; noteId: string }> }) {
    const { id, noteId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!(await verifyOwnership(id, noteId, memberId))) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const admin = createAdminClient();
    await admin.from('myverse_project_notes').delete().eq('id', noteId);
    return NextResponse.json({ ok: true });
}
