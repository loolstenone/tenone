import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(req: Request) {
    const supabaseAdmin = getAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // 'new'|'read'|'in_progress'|'resolved'|'archived'|null
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 100, 1), 500);

    let q = supabaseAdmin
        .from("myverse_feedback")
        .select("id, user_id, user_email, message, user_agent, page_path, status, priority, notes, handled_at, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(limit);
    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // counts by status
    const { data: counts } = await supabaseAdmin
        .rpc("myverse_feedback_counts")
        .select();
    // RPC 가 없으면 fallback group-by 시뮬레이션 (가벼우니 in-app aggregation)
    let stats: Record<string, number> = {};
    if (Array.isArray(counts)) {
        for (const r of counts as Array<{ status: string; n: number }>) stats[r.status] = r.n;
    } else {
        const { data: all } = await supabaseAdmin.from("myverse_feedback").select("status");
        for (const r of all ?? []) stats[r.status] = (stats[r.status] ?? 0) + 1;
    }

    return NextResponse.json({ feedback: data ?? [], stats });
}

export async function PATCH(req: Request) {
    const supabaseAdmin = getAdmin();
    const body = await req.json().catch(() => ({}));
    const { id, status, priority, notes } = body as { id: string; status?: string; priority?: string; notes?: string | null };
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (status) patch.status = status;
    if (priority) patch.priority = priority;
    if (notes !== undefined) patch.notes = notes;
    if (status && status !== "new") patch.handled_at = new Date().toISOString();

    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: "no_fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("myverse_feedback")
        .update(patch)
        .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const supabaseAdmin = getAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
    const { error } = await supabaseAdmin.from("myverse_feedback").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
