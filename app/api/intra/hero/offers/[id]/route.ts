/**
 * 인트라 — 인재 제안 검토
 * POST /api/intra/hero/offers/:id  { action: 'approve', paid: true, note? } | { action: 'reject', note }
 *   approve: 발송 스위치(HERO_OFFERS_LIVE) 켜져 있어야 함 · 결제 확인 필수 · 지금 시점 조건으로 수신자를 다시 뽑아 발송 + 알림
 *   reject:  반려 사유(note)는 기업 화면에 보인다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { normalizeCriteria, OFFER_TYPES, labelOf } from "@/lib/hero/offers";
import { candidateIds, offersLive } from "@/lib/hero/offers-server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const reviewer = auth.kind === "user" ? auth.memberId : null;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : "";
    const sb = createAdminClient();

    const { data: offer } = await sb.from("hero_offers").select("*, hero_companies(company_name)").eq("id", id).maybeSingle();
    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (offer.status !== "requested") return NextResponse.json({ error: "검토 중인 제안이 아닙니다." }, { status: 400 });
    const now = new Date().toISOString();

    if (body?.action === "reject") {
        if (!note) return NextResponse.json({ error: "반려 사유를 써 주세요. 기업에 보입니다." }, { status: 400 });
        await sb.from("hero_offers").update({ status: "rejected", review_note: note, reviewed_by: reviewer, reviewed_at: now, updated_at: now }).eq("id", id);
        await notify([offer.sender_member_id], {
            brandId: "hero", type: "hero_offer_rejected",
            title: `'${offer.title}' 제안이 반려되었습니다`, message: note, link: `/hero/search-light/people?company=${offer.company_id}`,
        });
        return NextResponse.json({ ok: true });
    }

    if (body?.action !== "approve") return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    if (!offersLive()) {
        return NextResponse.json({ error: "발송이 꺼져 있습니다. 유료직업소개사업 등록·통신판매업 신고 후 HERO_OFFERS_LIVE=true로 켭니다." }, { status: 409 });
    }
    if (body?.paid !== true) return NextResponse.json({ error: "결제 확인 후 발송할 수 있습니다." }, { status: 400 });

    let ids: string[] = [];
    try {
        ids = await candidateIds(normalizeCriteria(offer.criteria), offer.company_id, sb);
    } catch {
        return NextResponse.json({ error: "수신자를 뽑지 못했습니다." }, { status: 500 });
    }
    if (ids.length === 0) return NextResponse.json({ error: "지금 조건에 맞는 인재가 없습니다." }, { status: 400 });

    const { data: inserted, error } = await sb.from("hero_offer_recipients")
        .upsert(ids.map(member_id => ({ offer_id: id, member_id })), { onConflict: "offer_id,member_id", ignoreDuplicates: true })
        .select("id, member_id");
    if (error) {
        console.error("[intra/hero/offers approve]", error.message);
        return NextResponse.json({ error: "발송하지 못했습니다." }, { status: 500 });
    }
    await sb.from("hero_offers").update({
        status: "sent", paid_at: now, sent_at: now, reviewed_by: reviewer, reviewed_at: now,
        review_note: note || null, target_count: ids.length, updated_at: now,
    }).eq("id", id);

    // 알림은 수신자별 링크가 달라 한 명씩 (서비스 알림 — 본인이 켠 '제안 받기'에 따른 것)
    const company = (offer.hero_companies as { company_name: string } | null)?.company_name ?? "기업";
    const kind = labelOf(OFFER_TYPES, offer.offer_type);
    await Promise.all((inserted ?? []).map(r => notify([r.member_id], {
        brandId: "hero", type: "hero_offer_received",
        title: `${company}에서 ${kind}이 왔습니다`,
        message: offer.title,
        link: `/hero/offers/${r.id}`,
    })));
    await notify([offer.sender_member_id], {
        brandId: "hero", type: "hero_offer_sent",
        title: `'${offer.title}' 제안이 발송되었습니다`,
        message: `${ids.length}명에게 보냈습니다.`, link: `/hero/company/offers/${id}`,
    });
    return NextResponse.json({ ok: true, sent: ids.length });
}
