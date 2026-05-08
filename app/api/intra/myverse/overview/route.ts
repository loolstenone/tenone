// 인트라 — Myverse 전체 통계 + 처리 대기 큐 카운트
// GET /api/intra/myverse/overview
// 권한: staff/manager/super_admin

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireIntraStaff } from "@/lib/myverse/intra-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const auth = await requireIntraStaff();
    if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: auth.status });

    const admin = createAdminClient();

    const [
        members, momentsTotal, momentsPublic,
        threads, weeklyReports, coachInsights,
        reportsOpen, reportsResolved, blocks,
    ] = await Promise.all([
        admin.from("members").select("id", { count: "exact", head: true }).not("affiliations", "is", null).contains("affiliations", ["myverse"]),
        admin.from("myverse_daily_moments").select("id", { count: "exact", head: true }),
        admin.from("myverse_daily_moments").select("id", { count: "exact", head: true }).eq("visibility", "public"),
        admin.from("myverse_dm_threads").select("id", { count: "exact", head: true }),
        admin.from("myverse_weekly_reports").select("id", { count: "exact", head: true }),
        admin.from("myverse_coach_insights").select("id", { count: "exact", head: true }),
        admin.from("myverse_moment_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
        admin.from("myverse_moment_reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
        admin.from("myverse_user_blocks").select("blocker_id", { count: "exact", head: true }),
    ]);

    // 최근 7일 활성 사용자 — 흔적·일과·메시지 중 하나라도 작성한 회원 distinct
    const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const [actMoments, actRoutines, actMessages] = await Promise.all([
        admin.from("myverse_daily_moments").select("member_id").gte("created_at", since),
        admin.from("myverse_daily_routines").select("member_id").gte("created_at", since),
        admin.from("myverse_dm_messages").select("sender_id").gte("created_at", since),
    ]);
    const activeSet = new Set<string>();
    for (const r of actMoments.data ?? []) activeSet.add(r.member_id as string);
    for (const r of actRoutines.data ?? []) activeSet.add(r.member_id as string);
    for (const r of actMessages.data ?? []) activeSet.add(r.sender_id as string);

    return NextResponse.json({
        members_count: members.count ?? 0,
        moments_total: momentsTotal.count ?? 0,
        moments_public: momentsPublic.count ?? 0,
        dm_threads: threads.count ?? 0,
        weekly_reports: weeklyReports.count ?? 0,
        coach_insights: coachInsights.count ?? 0,
        reports_open: reportsOpen.count ?? 0,
        reports_resolved: reportsResolved.count ?? 0,
        blocks_total: blocks.count ?? 0,
        active_7d: activeSet.size,
    });
}
