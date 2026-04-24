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

async function verifyOwnership(projectId: string, noteId: string, memberId: string): Promise<boolean> {
    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_project_notes')
        .select('id, planners_projects!inner(member_id)')
        .eq('id', noteId)
        .eq('project_id', projectId)
        .maybeSingle();
    if (!data) return false;
    const p = (data as { planners_projects: { member_id: string } | { member_id: string }[] }).planners_projects;
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
        .from('planners_project_notes')
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
    await admin.from('planners_project_notes').delete().eq('id', noteId);
    return NextResponse.json({ ok: true });
}
