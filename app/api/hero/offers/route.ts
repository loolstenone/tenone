/**
 * 기업 — 제안
 * GET  /api/hero/offers?companyId=  → 기업의 제안 목록 + 응답 집계
 * POST /api/hero/offers             → 제안 요청 { companyId, jdId?, offerType, title, message, respondBy, criteria }
 *   status='requested' — 운영자 검토·결제 확인 후 발송 (/api/intra/hero/offers/:id)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandManagerIds, notify } from "@/lib/notify";
import { normalizeCriteria, OFFER_TYPES } from "@/lib/hero/offers";
import { candidateIds, companyAccess, todayPlusDays } from "@/lib/hero/offers-server";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const companyId = req.nextUrl.searchParams.get("companyId") ?? "";
    const sb = createAdminClient();
    if (!(await companyAccess(sb, auth.memberId, companyId, auth.isStaff))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { data: offers } = await sb.from("hero_offers")
        .select("id, offer_type, title, status, target_count, respond_by, review_note, created_at, sent_at")
        .eq("company_id", companyId).order("created_at", { ascending: false });
    const ids = (offers ?? []).map(o => o.id);
    const { data: recs } = ids.length
        ? await sb.from("hero_offer_recipients").select("offer_id, status").in("offer_id", ids)
        : { data: [] as { offer_id: string; status: string }[] };
    const stats: Record<string, { sent: number; accepted: number }> = {};
    for (const r of recs ?? []) {
        stats[r.offer_id] ??= { sent: 0, accepted: 0 };
        stats[r.offer_id].sent++;
        if (r.status === "accepted") stats[r.offer_id].accepted++;
    }
    return NextResponse.json({ items: (offers ?? []).map(o => ({ ...o, stats: stats[o.id] ?? { sent: 0, accepted: 0 } })) });
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const companyId = typeof body?.companyId === "string" ? body.companyId : "";
    const sb = createAdminClient();
    const access = await companyAccess(sb, auth.memberId, companyId, auth.isStaff);
    if (!access) return NextResponse.json({ error: "기업 담당자만 제안할 수 있습니다." }, { status: 403 });

    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 100) : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
    const offerType = OFFER_TYPES.some(t => t.v === body?.offerType) ? body.offerType : "interview";
    if (!title || message.length < 30) return NextResponse.json({ error: "제목과 30자 이상의 제안 내용을 써 주세요." }, { status: 400 });

    const respondBy = typeof body?.respondBy === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.respondBy) ? body.respondBy : todayPlusDays(14);
    if (respondBy < todayPlusDays(3)) return NextResponse.json({ error: "응답 기한은 오늘로부터 3일 이후로 정해 주세요." }, { status: 400 });

    let jdId: string | null = null;
    if (typeof body?.jdId === "string" && body.jdId) {
        const { data: jd } = await sb.from("hero_jd").select("id").eq("id", body.jdId).eq("company_id", companyId).maybeSingle();
        jdId = jd?.id ?? null;
    }

    const criteria = normalizeCriteria(body?.criteria);
    if (criteria.job_functions.length === 0) return NextResponse.json({ error: "직무를 골라 주세요." }, { status: 400 });
    let target = 0;
    try {
        target = (await candidateIds(criteria, companyId, sb)).length;
    } catch {
        return NextResponse.json({ error: "인원을 세지 못했습니다." }, { status: 500 });
    }
    if (target === 0) return NextResponse.json({ error: "조건에 맞는 인재가 없습니다. 조건을 넓혀 보세요." }, { status: 400 });

    const { data, error } = await sb.from("hero_offers").insert({
        company_id: companyId, sender_member_id: auth.memberId, jd_id: jdId,
        offer_type: offerType, title, message, criteria, target_count: target, respond_by: respondBy,
    }).select("id").single();
    if (error) {
        console.error("[hero/offers POST]", error.message);
        return NextResponse.json({ error: "제안을 저장하지 못했습니다." }, { status: 500 });
    }

    await notify(await brandManagerIds("hero"), {
        brandId: "hero", type: "hero_offer_requested",
        title: `인재 제안 검토 요청 — ${access.companyName}`,
        message: title, link: "/intra/hero/offers",
    });
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
