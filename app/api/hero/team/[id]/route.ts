/**
 * 팀 진단 — 리포트 (기업 담당자)
 * GET   /api/hero/team/:id  → 검사 완료 참여자가 5명 이상이면 묶음 리포트, 아니면 인원 현황만
 * PATCH /api/hero/team/:id  { action: 'close' | 'reopen' }  → 참여 마감·재개
 * ❌ 참여자 이름·개인 결과는 내보내지 않는다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { companyAccess } from "@/lib/hero/offers-server";
import { GROUP_FLOOR, latestHitA } from "@/lib/hero/group-stats";
import { buildTeamReport } from "@/lib/hero/team-report";

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string, memberId: string, isStaff: boolean) {
    const sb = createAdminClient();
    const { data: d } = await sb.from("hero_team_diagnoses")
        .select("id, company_id, name, invite_code, status, created_at, hero_companies(company_name)").eq("id", id).maybeSingle();
    if (!d) return { sb, d: null };
    return { sb, d: (await companyAccess(sb, memberId, d.company_id, isStaff)) ? d : null };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, d } = await load(id, auth.memberId, auth.isStaff);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: parts } = await sb.from("hero_team_participants").select("member_id").eq("diagnosis_id", id);
    const ids = (parts ?? []).map(p => p.member_id as string);
    const rows = await latestHitA(sb, ids);
    const ready = rows.length >= GROUP_FLOOR;
    return NextResponse.json({
        diagnosis: d,
        participants: ids.length,
        tested: rows.length,
        floor: GROUP_FLOOR,
        report: ready ? buildTeamReport(rows) : null,
    });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, d } = await load(id, auth.memberId, auth.isStaff);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();
    if (body?.action === "close") await sb.from("hero_team_diagnoses").update({ status: "closed", closed_at: now, updated_at: now }).eq("id", id);
    else if (body?.action === "reopen") await sb.from("hero_team_diagnoses").update({ status: "open", closed_at: null, updated_at: now }).eq("id", id);
    else return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    return NextResponse.json({ ok: true });
}
