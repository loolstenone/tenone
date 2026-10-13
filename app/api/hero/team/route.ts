/**
 * 팀 진단 — 기업 담당자
 * GET  /api/hero/team                  → 내가 담당하는 기업들의 팀 진단 목록 (참여 인원·검사 완료 인원)
 * POST /api/hero/team { companyId, name } → 새 팀 진단 + 초대 코드
 */
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { companyAccess } from "@/lib/hero/offers-server";
import { GROUP_FLOOR, latestHitA } from "@/lib/hero/group-stats";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const sb = createAdminClient();
    const { data: links } = await sb.from("hero_company_members").select("company_id, hero_companies(company_name)")
        .eq("member_id", auth.memberId).eq("status", "active");
    const companies = ((links ?? []) as unknown as { company_id: string; hero_companies: { company_name: string } | null }[])
        .map(l => ({ id: l.company_id, name: l.hero_companies?.company_name ?? "" }));
    if (companies.length === 0) return NextResponse.json({ companies: [], items: [] });

    const { data: diags } = await sb.from("hero_team_diagnoses").select("id, company_id, name, invite_code, status, created_at")
        .in("company_id", companies.map(c => c.id)).order("created_at", { ascending: false });
    const items = await Promise.all((diags ?? []).map(async d => {
        const { data: parts } = await sb.from("hero_team_participants").select("member_id").eq("diagnosis_id", d.id);
        const ids = (parts ?? []).map(p => p.member_id as string);
        const tested = (await latestHitA(sb, ids)).length;
        return { ...d, participants: ids.length, tested, ready: tested >= GROUP_FLOOR };
    }));
    return NextResponse.json({ companies, items, floor: GROUP_FLOOR });
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const companyId = typeof body?.companyId === "string" ? body.companyId : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 50) : "";
    if (!name) return NextResponse.json({ error: "팀 이름을 써 주세요." }, { status: 400 });
    const sb = createAdminClient();
    if (!(await companyAccess(sb, auth.memberId, companyId, auth.isStaff))) {
        return NextResponse.json({ error: "기업 담당자만 만들 수 있습니다." }, { status: 403 });
    }
    const invite_code = randomBytes(6).toString("base64url");
    const { data, error } = await sb.from("hero_team_diagnoses")
        .insert({ company_id: companyId, name, invite_code, created_by: auth.memberId }).select("id, invite_code").single();
    if (error) {
        console.error("[hero/team POST]", error.message);
        return NextResponse.json({ error: "만들지 못했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...data }, { status: 201 });
}
