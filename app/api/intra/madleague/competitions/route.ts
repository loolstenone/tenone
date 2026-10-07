/**
 * 인트라 경쟁 PT 회차 — 직원 전용 (매드리거 구조 개편 2단계)
 *   GET  /api/intra/madleague/competitions   회차 목록 + 팀 수
 *   POST /api/intra/madleague/competitions   새 회차 { title, year, client_name? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const admin = createAdminClient();
    const { data, error } = await admin.from("mad_competitions")
        .select("id, title, year, client_name, status, presentation_date, form_id")
        .order("year", { ascending: false }).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 팀 수 — 회차별 head count
    const rows = await Promise.all((data ?? []).map(async c => {
        const { count } = await admin.from("mad_competition_teams").select("id", { count: "exact", head: true }).eq("competition_id", c.id);
        return { ...c, team_count: count ?? 0 };
    }));
    return NextResponse.json({ competitions: rows });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim();
    const year = Number(body.year);
    if (!title || !Number.isInteger(year) || year < 2000 || year > 2100) {
        return NextResponse.json({ error: "제목과 연도가 필요합니다." }, { status: 400 });
    }
    const { data, error } = await createAdminClient().from("mad_competitions").insert({
        tenant_id: "tenone",
        title,
        year,
        client_name: String(body.client_name ?? "").trim() || null,
        status: "upcoming",
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
}
