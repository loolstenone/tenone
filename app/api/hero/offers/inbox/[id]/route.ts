/**
 * 인재 — 받은 제안 하나
 * GET  /api/hero/offers/inbox/:id  → 제안 상세 (처음 열면 viewed) + 내 이력서 목록
 * POST /api/hero/offers/inbox/:id  → { action: 'accept' | 'decline' | 'withdraw', resumeId?, message?, consent? }
 *   HIT 검사 내용은 기업에 제공하지 않는다 (이력서·연락처만)
 *   accept = 제3자 제공 동의(제17조) 필수 — 받는 자·목적·항목·기간을 provision_consent에 기록
 *   withdraw = 동의 철회 → 기업 열람 즉시 중단
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/api-guard";
import { notify } from "@/lib/notify";
import { COMPANY_VIEW_DAYS, PROVISION_CONSENT_VERSION, provisionConsentText } from "@/lib/hero/offers";
import { todayPlusDays } from "@/lib/hero/offers-server";

type Ctx = { params: Promise<{ id: string }> };

async function loadOwn(id: string, memberId: string) {
    const sb = createAdminClient();
    const { data } = await sb.from("hero_offer_recipients")
        .select("*, hero_offers(id, company_id, sender_member_id, offer_type, title, message, respond_by, status, sent_at, hero_companies(company_name, industry, size_category, employee_count, founded_year), hero_jd(id, position_title, summary, employment_type, experience_range))")
        .eq("id", id).maybeSingle();
    if (!data || data.member_id !== memberId) return { sb, row: null };
    return { sb, row: data };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, row } = await loadOwn(id, auth.memberId);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (row.status === "sent") {
        await sb.from("hero_offer_recipients").update({ status: "viewed", viewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
        row.status = "viewed";
    }
    const { data: resumes } = await sb.from("resumes").select("id, title, is_primary, updated_at")
        .eq("member_id", auth.memberId).order("updated_at", { ascending: false });
    return NextResponse.json({ item: row, resumes: resumes ?? [] });
}

export async function POST(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;
    const { sb, row } = await loadOwn(id, auth.memberId);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const offer = row.hero_offers as { id: string; sender_member_id: string | null; title: string; respond_by: string | null; status: string; hero_companies: { company_name: string } | null };
    const now = new Date().toISOString();

    if (action === "withdraw") {
        if (row.status !== "accepted") return NextResponse.json({ error: "응한 제안만 철회할 수 있습니다." }, { status: 400 });
        await sb.from("hero_offer_recipients").update({
            status: "declined", resume_id: null, share_hit: false, responded_at: now, updated_at: now,
            provision_consent: { ...(row.provision_consent ?? {}), withdrawn_at: now },
        }).eq("id", id);
        return NextResponse.json({ ok: true });
    }

    if (offer.status !== "sent") return NextResponse.json({ error: "마감된 제안입니다." }, { status: 400 });
    if (offer.respond_by && offer.respond_by < now.slice(0, 10)) return NextResponse.json({ error: "응답 기한이 지났습니다." }, { status: 400 });
    if (row.status === "accepted" || row.status === "declined") return NextResponse.json({ error: "이미 응답한 제안입니다." }, { status: 400 });

    if (action === "decline") {
        await sb.from("hero_offer_recipients").update({ status: "declined", responded_at: now, updated_at: now }).eq("id", id);
        return NextResponse.json({ ok: true });
    }

    if (action !== "accept") return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    if (body?.consent !== true) return NextResponse.json({ error: "정보 제공에 동의해야 응할 수 있습니다." }, { status: 400 });
    const resumeId = typeof body?.resumeId === "string" ? body.resumeId : "";
    const { data: resume } = await sb.from("resumes").select("id").eq("id", resumeId).eq("member_id", auth.memberId).maybeSingle();
    if (!resume) return NextResponse.json({ error: "제출할 이력서를 골라 주세요." }, { status: 400 });

    const companyName = offer.hero_companies?.company_name ?? "기업";
    const consentText = provisionConsentText(companyName);
    const message = typeof body?.message === "string" ? body.message.slice(0, 1000) : null;

    const { error } = await sb.from("hero_offer_recipients").update({
        status: "accepted",
        resume_id: resume.id,
        share_hit: false,
        talent_message: message,
        provision_consent: { ...consentText, version: PROVISION_CONSENT_VERSION, agreed_at: now },
        responded_at: now,
        destroy_due: todayPlusDays(COMPANY_VIEW_DAYS),
        updated_at: now,
    }).eq("id", id);
    if (error) {
        console.error("[hero/offers/respond]", error.message);
        return NextResponse.json({ error: "응답을 저장하지 못했습니다." }, { status: 500 });
    }

    await notify([offer.sender_member_id], {
        brandId: "hero",
        type: "hero_offer_accepted",
        title: `'${offer.title}' 제안에 새 응답이 왔습니다`,
        message: "이력서를 확인해 보세요.",
        link: `/hero/company/offers/${offer.id}`,
    });
    return NextResponse.json({ ok: true });
}
