/**
 * 팀 진단 — 리포트 (팀장·기업 담당자 + 참여한 팀원)
 * GET   /api/hero/team/:id  → 설문 리포트(팀원 응답 5명 이상) + 성향 구성(검사 완료 5명 이상), 아니면 인원 현황만
 * PATCH /api/hero/team/:id  { action: 'close' | 'reopen' }  → 참여 마감·재개 (기업 담당자만)
 * ❌ 참여자 이름·개인 응답·개인 결과는 내보내지 않는다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { companyAccess } from "@/lib/hero/offers-server";
import { GROUP_FLOOR, latestHitA } from "@/lib/hero/group-stats";
import { buildTeamReport } from "@/lib/hero/team-report";
import { buildSurveyReport, type SurveyAnswer } from "@/lib/hero/team-survey";

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
    const sb = createAdminClient();
    const { data: d } = await sb.from("hero_team_diagnoses")
        .select("id, company_id, name, invite_code, status, created_at, hero_companies(company_name)").eq("id", id).maybeSingle();
    return { sb, d };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, d } = await load(id);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: parts } = await sb.from("hero_team_participants").select("member_id, role, survey").eq("diagnosis_id", id);
    const rows = (parts ?? []) as { member_id: string; role: string; survey: SurveyAnswer | null }[];
    const isManager = await companyAccess(sb, auth.memberId, d.company_id, auth.isStaff);
    const isParticipant = rows.some(r => r.member_id === auth.memberId);
    if (!isManager && !isParticipant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hit = await latestHitA(sb, rows.map(r => r.member_id));
    const memberSurveys = rows.filter(r => r.role === "member" && r.survey).map(r => r.survey!);
    const leaderSurvey = rows.find(r => r.role === "leader" && r.survey)?.survey ?? null;

    return NextResponse.json({
        diagnosis: { ...d, invite_code: isManager ? d.invite_code : undefined },
        canManage: isManager,
        participants: rows.length,
        surveyed: memberSurveys.length,
        leaderSurveyed: !!leaderSurvey,
        tested: hit.length,
        floor: GROUP_FLOOR,
        survey: buildSurveyReport(memberSurveys, leaderSurvey),
        report: hit.length >= GROUP_FLOOR ? buildTeamReport(hit) : null,
    });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, d } = await load(id);
    if (!d || !(await companyAccess(sb, auth.memberId, d.company_id, auth.isStaff))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();
    if (body?.action === "close") await sb.from("hero_team_diagnoses").update({ status: "closed", closed_at: now, updated_at: now }).eq("id", id);
    else if (body?.action === "reopen") await sb.from("hero_team_diagnoses").update({ status: "open", closed_at: null, updated_at: now }).eq("id", id);
    else return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    return NextResponse.json({ ok: true });
}
