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

async function verifyProjectOwnership(projectId: string, memberId: string): Promise<boolean> {
    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_projects')
        .select('id')
        .eq('id', projectId)
        .eq('member_id', memberId)
        .maybeSingle();
    return !!data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!(await verifyProjectOwnership(id, memberId))) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_project_notes')
        .select('*')
        .eq('project_id', id)
        .order('order_index')
        .order('created_at');

    return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!(await verifyProjectOwnership(id, memberId))) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const body = await req.json();
    const admin = createAdminClient();

    // 순서 자동 할당
    const { data: maxRow } = await admin
        .from('planners_project_notes')
        .select('order_index')
        .eq('project_id', id)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();
    const nextOrder = (maxRow?.order_index ?? -1) + 1;

    const { data, error } = await admin
        .from('planners_project_notes')
        .insert({ project_id: id, order_index: nextOrder, ...body })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data });
}
