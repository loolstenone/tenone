/**
 * 팀 진단 — 참여 (팀장·팀원)
 * GET    /api/hero/team/join/:code  → 팀·기업 이름, 내 참여·역할·설문 여부, 기본 성향 검사 완료 여부
 * POST   /api/hero/team/join/:code  { consent: true } → 참여 (동의 기록). 팀 진단을 만든 사람은 팀장(leader)
 * PUT    /api/hero/team/join/:code  { survey } → 팀 설문 제출·수정 (lib/hero/team-survey.ts)
 * DELETE /api/hero/team/join/:code  → 나가기 (통계·서술에서 빠짐)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { TEAM_CONSENT, TEAM_CONSENT_VERSION } from "@/lib/hero/team-report";
import { normalizeSurvey } from "@/lib/hero/team-survey";

type Ctx = { params: Promise<{ code: string }> };

async function find(code: string) {
    const sb = createAdminClient();
    const { data } = await sb.from("hero_team_diagnoses")
        .select("id, name, status, created_by, hero_companies(company_name)").eq("invite_code", code).maybeSingle();
    return { sb, d: data };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { code } = await params;
    const { sb, d } = await find(code);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [{ data: mine }, { count }] = await Promise.all([
        sb.from("hero_team_participants").select("id, role, survey_at").eq("diagnosis_id", d.id).eq("member_id", auth.memberId).maybeSingle(),
        sb.from("hit_a_results").select("id", { count: "exact", head: true }).eq("member_id", auth.memberId),
    ]);
    const company = (d.hero_companies as unknown as { company_name: string } | null)?.company_name ?? "";
    return NextResponse.json({
        id: d.id, team: d.name, company, status: d.status,
        joined: !!mine, role: mine?.role ?? (d.created_by === auth.memberId ? "leader" : "member"),
        surveyed: !!mine?.survey_at, hasHitA: (count ?? 0) > 0,
    });
}

export async function POST(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    if (body?.consent !== true) return NextResponse.json({ error: "참여하려면 동의가 필요합니다." }, { status: 400 });
    const { sb, d } = await find(code);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (d.status !== "open") return NextResponse.json({ error: "참여가 마감된 팀 진단입니다." }, { status: 400 });
    const { error } = await sb.from("hero_team_participants").upsert({
        diagnosis_id: d.id, member_id: auth.memberId,
        role: d.created_by === auth.memberId ? "leader" : "member",
        consent: { version: TEAM_CONSENT_VERSION, purpose: TEAM_CONSENT.purpose, agreed_at: new Date().toISOString() },
    }, { onConflict: "diagnosis_id,member_id", ignoreDuplicates: true });
    if (error) {
        console.error("[hero/team/join]", error.message);
        return NextResponse.json({ error: "참여하지 못했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    const survey = normalizeSurvey(body?.survey);
    if (!survey) return NextResponse.json({ error: "모든 문항에 답해 주세요." }, { status: 400 });
    const { sb, d } = await find(code);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (d.status !== "open") return NextResponse.json({ error: "참여가 마감된 팀 진단입니다." }, { status: 400 });
    const { data, error } = await sb.from("hero_team_participants")
        .update({ survey, survey_at: new Date().toISOString() })
        .eq("diagnosis_id", d.id).eq("member_id", auth.memberId).select("id");
    if (error) {
        console.error("[hero/team/join PUT]", error.message);
        return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
    }
    if (!data?.length) return NextResponse.json({ error: "먼저 참여해 주세요." }, { status: 400 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { code } = await params;
    const { sb, d } = await find(code);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await sb.from("hero_team_participants").delete().eq("diagnosis_id", d.id).eq("member_id", auth.memberId);
    return NextResponse.json({ ok: true });
}
