/**
 * HeRo 기업 서비스 신청 — 팀 진단 · 인재 풀 리포트 · 헤드헌팅
 * POST /api/hero/business-requests  { service, company, contact, phone?, role?, detail{}, consent }
 * 로그인 회원만 (이메일 = 계정 이메일) · 개인정보 수집 동의 필수 · 운영 담당에게 알림
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandManagerIds, notify } from "@/lib/notify";
import { BUSINESS_SERVICES, type BusinessServiceKey } from "@/lib/hero/business-services";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const service = BUSINESS_SERVICES[body?.service as BusinessServiceKey];
    if (!service) return NextResponse.json({ error: "서비스를 찾을 수 없습니다." }, { status: 400 });
    if (body?.consent !== true) return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });

    const company = str(body?.company, 100);
    const contact = str(body?.contact, 50);
    if (!company || !contact) return NextResponse.json({ error: "회사명과 담당자 이름을 써 주세요." }, { status: 400 });

    const raw = (body?.detail && typeof body.detail === "object" ? body.detail : {}) as Record<string, unknown>;
    const detail: Record<string, string> = {};
    for (const f of service.fields) detail[f.key] = str(raw[f.key], f.type === "textarea" ? 2000 : 200);

    const { error } = await createAdminClient().from("hero_business_inquiries").insert({
        member_id: auth.memberId,
        service: service.key,
        company,
        contact,
        email: auth.email,
        phone: str(body?.phone, 30) || null,
        role: str(body?.role, 50) || null,
        message: str(body?.message, 2000) || null,
        detail,
        brand_id: "hero",
    });
    if (error) {
        console.error("[hero/business-requests]", error.message);
        return NextResponse.json({ error: "신청을 저장하지 못했습니다." }, { status: 500 });
    }

    await notify(await brandManagerIds("hero"), {
        brandId: "hero", type: "hero_business_request",
        title: `${service.label} 신청 — ${company}`,
        message: contact, link: "/intra/hero/business-requests",
    });
    return NextResponse.json({ ok: true }, { status: 201 });
}
