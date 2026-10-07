/**
 * 인트라 프로그램 회차 (코어) — 직원 전용 · docs/Program_Module.md
 *   GET  /api/intra/programs/rounds?brand=   회차 목록 + 팀·참가자 수 (brand 없으면 전 브랜드 = 통합 관리)
 *   POST /api/intra/programs/rounds          새 회차 { brand, title, year, kind?, mode?, client_name? } — channels 기본 = [brand]
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const KINDS = ["competition", "project", "program", "course"];

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const admin = createAdminClient();
    const brand = req.nextUrl.searchParams.get("brand");
    let q = admin.from("program_rounds")
        .select("id, brand_id, channels, kind, mode, title, year, client_name, status, presentation_date, form_id, results_published_at")
        .order("year", { ascending: false }).order("created_at", { ascending: false });
    if (brand) q = q.eq("brand_id", brand);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 팀·참가자 수 — 회차별 head count
    const rows = await Promise.all((data ?? []).map(async r => {
        const [{ count: teams }, { count: people }] = await Promise.all([
            admin.from("program_teams").select("id", { count: "exact", head: true }).eq("round_id", r.id),
            admin.from("program_participants").select("id", { count: "exact", head: true }).eq("round_id", r.id),
        ]);
        return { ...r, team_count: teams ?? 0, participant_count: people ?? 0 };
    }));
    return NextResponse.json({ rounds: rows });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const brand = String(body.brand ?? "").trim();
    const title = String(body.title ?? "").trim();
    const year = Number(body.year);
    if (!brand) return NextResponse.json({ error: "운영 브랜드를 선택하세요." }, { status: 400 });
    if (!title || !Number.isInteger(year) || year < 2000 || year > 2100) {
        return NextResponse.json({ error: "제목과 연도가 필요합니다." }, { status: 400 });
    }
    const { data, error } = await createAdminClient().from("program_rounds").insert({
        brand_id: brand,
        channels: [brand],
        title,
        year,
        kind: KINDS.includes(body.kind) ? body.kind : "competition",
        mode: body.mode === "individual" ? "individual" : "team",
        client_name: String(body.client_name ?? "").trim() || null,
        status: "upcoming",
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message.includes("foreign key") ? "등록되지 않은 브랜드입니다." : error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
}
