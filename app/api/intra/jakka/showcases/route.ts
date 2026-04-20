import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
);

// GET /api/intra/jakka/showcases?status=pending|approved|rejected|ended|all
export async function GET(req: NextRequest) {
    const status = req.nextUrl.searchParams.get("status") ?? "all";

    let query = supabaseAdmin
        .from("jakka_showcases")
        .select(`
            id, slug, handle, title, subtitle, cover_image, category, location,
            start_date, end_date, start_time, end_time,
            status, publish_mode, approval_count, interests_count,
            organizer_id, user_id, admin_user_id,
            created_at, approved_at, rejected_at,
            organizer:jakka_creators!jakka_showcases_organizer_id_fkey(handle, display_name, email)
        `)
        .order("created_at", { ascending: false });
    if (status !== "all") query = query.eq("status", status);

    const { data: shows, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ids = (shows ?? []).map((s) => s.id);
    const [{ data: approvals }, { data: artistRows }, { data: workRows }] = await Promise.all([
        supabaseAdmin.from("jakka_showcase_approvals").select("showcase_id, approver_email, status, approved_at")
            .in("showcase_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
        supabaseAdmin.from("jakka_showcase_artists").select("showcase_id").in("showcase_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
        supabaseAdmin.from("jakka_showcase_works").select("showcase_id").in("showcase_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    const apprMap: Record<string, { approved: number; rejected: number; pending: number; emails: string[] }> = {};
    for (const a of approvals ?? []) {
        apprMap[a.showcase_id] ??= { approved: 0, rejected: 0, pending: 0, emails: [] };
        if (a.status === "approved") apprMap[a.showcase_id].approved++;
        else if (a.status === "rejected") apprMap[a.showcase_id].rejected++;
        else apprMap[a.showcase_id].pending++;
        apprMap[a.showcase_id].emails.push(a.approver_email);
    }
    const artistCount: Record<string, number> = {};
    for (const a of artistRows ?? []) artistCount[a.showcase_id] = (artistCount[a.showcase_id] ?? 0) + 1;
    const workCount: Record<string, number> = {};
    for (const w of workRows ?? []) workCount[w.showcase_id] = (workCount[w.showcase_id] ?? 0) + 1;

    const enriched = (shows ?? []).map((s) => ({
        ...s,
        approvals_summary: apprMap[s.id] ?? { approved: 0, rejected: 0, pending: 0, emails: [] },
        artist_count: artistCount[s.id] ?? 0,
        work_count: workCount[s.id] ?? 0,
    }));

    return NextResponse.json({ showcases: enriched });
}

// POST /api/intra/jakka/showcases — { showcaseId, action: 'approve'|'reject'|'end', reviewerId }
export async function POST(req: NextRequest) {
    const { showcaseId, action, reviewerId } = await req.json();
    if (!showcaseId || !action || !reviewerId) {
        return NextResponse.json({ error: "showcaseId, action, reviewerId required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {};
    if (action === "approve") payload.status = "approved", payload.approved_at = new Date().toISOString();
    else if (action === "reject") payload.status = "rejected", payload.rejected_at = new Date().toISOString();
    else if (action === "end") payload.status = "ended";
    else return NextResponse.json({ error: "invalid action" }, { status: 400 });

    const { error } = await supabaseAdmin.from("jakka_showcases").update(payload).eq("id", showcaseId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
