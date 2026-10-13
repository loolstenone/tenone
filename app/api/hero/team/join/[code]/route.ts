/**
 * 팀 진단 — 팀원 참여
 * GET    /api/hero/team/join/:code  → 팀·기업 이름, 내 참여 여부, 기본 성향 검사 완료 여부
 * POST   /api/hero/team/join/:code  { consent: true } → 참여 (팀 통계 작성 동의 기록)
 * DELETE /api/hero/team/join/:code  → 나가기 (통계에서 빠짐)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { TEAM_CONSENT, TEAM_CONSENT_VERSION } from "@/lib/hero/team-report";

type Ctx = { params: Promise<{ code: string }> };

async function find(code: string) {
    const sb = createAdminClient();
    const { data } = await sb.from("hero_team_diagnoses")
        .select("id, name, status, hero_companies(company_name)").eq("invite_code", code).maybeSingle();
    return { sb, d: data };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { code } = await params;
    const { sb, d } = await find(code);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [{ data: mine }, { count }] = await Promise.all([
        sb.from("hero_team_participants").select("id").eq("diagnosis_id", d.id).eq("member_id", auth.memberId).maybeSingle(),
        sb.from("hit_a_results").select("id", { count: "exact", head: true }).eq("member_id", auth.memberId),
    ]);
    const company = (d.hero_companies as unknown as { company_name: string } | null)?.company_name ?? "";
    return NextResponse.json({ team: d.name, company, status: d.status, joined: !!mine, hasHitA: (count ?? 0) > 0 });
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
        consent: { version: TEAM_CONSENT_VERSION, purpose: TEAM_CONSENT.purpose, agreed_at: new Date().toISOString() },
    }, { onConflict: "diagnosis_id,member_id", ignoreDuplicates: true });
    if (error) {
        console.error("[hero/team/join]", error.message);
        return NextResponse.json({ error: "참여하지 못했습니다." }, { status: 500 });
    }
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
