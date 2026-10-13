/**
 * 기업 — 제안 하나
 * GET   /api/hero/offers/:id  → 제안 + 응한 인재(이름·연락처·이력서). 열람 기한(destroy_due) 지나면 비공개 · HIT 검사 내용은 주지 않는다
 * PATCH /api/hero/offers/:id  → { action: 'cancel' } (검토 중일 때) | { action: 'close' } (발송 후 마감)
 *                               | { recipientId, companyStatus?, companyNote? } (응답자 진행 상태)
 * 응하지 않은 인재(sent·viewed·declined)는 수만 보인다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPANY_STATUS } from "@/lib/hero/offers";
import { companyAccess } from "@/lib/hero/offers-server";

type Ctx = { params: Promise<{ id: string }> };

async function loadOffer(id: string, memberId: string, isStaff: boolean) {
    const sb = createAdminClient();
    const { data: offer } = await sb.from("hero_offers")
        .select("*, hero_companies(company_name), hero_jd(id, position_title)").eq("id", id).maybeSingle();
    if (!offer) return { sb, offer: null };
    const ok = await companyAccess(sb, memberId, offer.company_id, isStaff);
    return { sb, offer: ok ? offer : null };
}

export async function GET(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, offer } = await loadOffer(id, auth.memberId, auth.isStaff);
    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: recs } = await sb.from("hero_offer_recipients")
        .select("id, member_id, status, resume_id, talent_message, responded_at, company_status, company_note, destroy_due")
        .eq("offer_id", id);
    const all = recs ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const accepted = all.filter(r => r.status === "accepted");

    const applicants = await Promise.all(accepted.map(async r => {
        const expired = !r.member_id || (!!r.destroy_due && r.destroy_due < today); // 탈퇴(연결 끊김)·열람 기한 경과
        if (expired) return { id: r.id, expired: true, respondedAt: r.responded_at, companyStatus: r.company_status, companyNote: r.company_note };
        const [{ data: m }, { data: resume }] = await Promise.all([
            sb.from("members").select("name, email, phone").eq("id", r.member_id).maybeSingle(),
            r.resume_id ? sb.from("resumes").select("title, content, updated_at").eq("id", r.resume_id).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        return {
            id: r.id, expired: false,
            name: m?.name ?? null, email: m?.email ?? null, phone: m?.phone ?? null,
            message: r.talent_message, respondedAt: r.responded_at, destroyDue: r.destroy_due,
            companyStatus: r.company_status, companyNote: r.company_note,
            resume,
        };
    }));

    return NextResponse.json({
        offer,
        stats: {
            sent: all.length,
            viewed: all.filter(r => r.status !== "sent").length,
            accepted: accepted.length,
            declined: all.filter(r => r.status === "declined").length,
        },
        applicants,
    });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { sb, offer } = await loadOffer(id, auth.memberId, auth.isStaff);
    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();

    if (body?.action === "cancel") {
        if (offer.status !== "requested") return NextResponse.json({ error: "검토 중인 제안만 취소할 수 있습니다." }, { status: 400 });
        await sb.from("hero_offers").update({ status: "canceled", closed_at: now, updated_at: now }).eq("id", id);
        return NextResponse.json({ ok: true });
    }
    if (body?.action === "close") {
        if (offer.status !== "sent") return NextResponse.json({ error: "발송된 제안만 마감할 수 있습니다." }, { status: 400 });
        await sb.from("hero_offers").update({ status: "closed", closed_at: now, updated_at: now }).eq("id", id);
        await sb.from("hero_offer_recipients").update({ status: "expired", updated_at: now }).eq("offer_id", id).in("status", ["sent", "viewed"]);
        return NextResponse.json({ ok: true });
    }

    const recipientId = typeof body?.recipientId === "string" ? body.recipientId : "";
    const patch: Record<string, unknown> = { updated_at: now };
    if (COMPANY_STATUS.some(s => s.v === body?.companyStatus)) patch.company_status = body.companyStatus;
    if (typeof body?.companyNote === "string") patch.company_note = body.companyNote.slice(0, 1000);
    const { data, error } = await sb.from("hero_offer_recipients").update(patch)
        .eq("id", recipientId).eq("offer_id", id).eq("status", "accepted").select("id");
    if (error || !data?.length) return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 400 });
    return NextResponse.json({ ok: true });
}
