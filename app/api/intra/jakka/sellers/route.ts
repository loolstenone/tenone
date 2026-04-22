import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );
}

// GET /api/intra/jakka/sellers?status=pending
export async function GET(req: NextRequest) {
    const supabaseAdmin = getAdmin();
    const status = req.nextUrl.searchParams.get("status") ?? "pending";
    const { data, error } = await supabaseAdmin
        .from("jakka_seller_applications")
        .select("*, creator:jakka_creators(id, handle, display_name, user_id, email, seller_status)")
        .eq("status", status)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data ?? [] });
}

// POST /api/intra/jakka/sellers — { applicationId, action: 'approve'|'reject', note?, reviewerId }
export async function POST(req: NextRequest) {
    const supabaseAdmin = getAdmin();
    const body = await req.json();
    const { applicationId, action, note, reviewerId } = body as {
        applicationId: string;
        action: "approve" | "reject";
        note?: string;
        reviewerId: string;
    };

    if (!applicationId || !action || !reviewerId) {
        return NextResponse.json({ error: "applicationId, action, reviewerId required" }, { status: 400 });
    }

    const { data: app, error: fetchErr } = await supabaseAdmin
        .from("jakka_seller_applications")
        .select("id, creator_id, status")
        .eq("id", applicationId)
        .single();
    if (fetchErr || !app) return NextResponse.json({ error: "application not found" }, { status: 404 });
    if (app.status !== "pending") return NextResponse.json({ error: "already reviewed" }, { status: 400 });

    const newAppStatus = action === "approve" ? "approved" : "rejected";
    const newCreatorStatus = action === "approve" ? "approved" : "rejected";

    const { error: updErr } = await supabaseAdmin
        .from("jakka_seller_applications")
        .update({
            status: newAppStatus,
            reviewer_id: reviewerId,
            reviewer_note: note ?? null,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const updatePayload: Record<string, unknown> = { seller_status: newCreatorStatus };
    if (action === "approve") updatePayload.seller_approved_at = new Date().toISOString();

    const { error: creatorErr } = await supabaseAdmin
        .from("jakka_creators")
        .update(updatePayload)
        .eq("id", app.creator_id);
    if (creatorErr) return NextResponse.json({ error: creatorErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, status: newAppStatus });
}
