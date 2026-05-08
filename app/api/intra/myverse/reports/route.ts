// 인트라 — 모먼트 신고 목록 (필터: status)
// GET /api/intra/myverse/reports?status=open|reviewing|resolved|dismissed
// 권한: staff/manager/super_admin

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireIntraStaff } from "@/lib/myverse/intra-auth";

export const dynamic = "force-dynamic";

const VALID_STATUS = new Set(["open", "reviewing", "resolved", "dismissed"]);

export async function GET(req: Request) {
    const auth = await requireIntraStaff();
    if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: auth.status });

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const filter = status && VALID_STATUS.has(status) ? status : "open";

    const admin = createAdminClient();
    const { data: reports } = await admin
        .from("myverse_moment_reports")
        .select("id, moment_id, reporter_id, reason, detail, status, created_at, resolved_at")
        .eq("status", filter)
        .order("created_at", { ascending: false })
        .limit(100);

    if (!reports || reports.length === 0) return NextResponse.json({ reports: [] });

    const momentIds = Array.from(new Set(reports.map(r => r.moment_id as string)));
    const reporterIds = Array.from(new Set(reports.map(r => r.reporter_id as string)));

    const [momentsRes, reportersRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("id, member_id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, visibility")
            .in("id", momentIds),
        admin.from("members").select("id, name, handle, avatar_url, email").in("id", reporterIds),
    ]);

    const authorIds = Array.from(new Set((momentsRes.data ?? []).map(m => m.member_id as string)));
    const { data: authors } = await admin.from("members")
        .select("id, name, handle, avatar_url, email").in("id", authorIds);

    const momentById = new Map((momentsRes.data ?? []).map(m => [m.id, m]));
    const reporterById = new Map((reportersRes.data ?? []).map(m => [m.id, m]));
    const authorById = new Map((authors ?? []).map(m => [m.id, m]));

    const enriched = reports.map(r => {
        const moment = momentById.get(r.moment_id as string) ?? null;
        const author = moment ? authorById.get(moment.member_id as string) ?? null : null;
        return {
            ...r,
            moment,
            author,
            reporter: reporterById.get(r.reporter_id as string) ?? null,
        };
    });

    return NextResponse.json({ reports: enriched });
}
