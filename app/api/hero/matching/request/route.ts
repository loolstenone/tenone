/**
 * POST /api/hero/matching/request
 *
 * 매칭 의뢰 접수 (유료 수익 전환점)
 *
 * - side='talent'  → 인재가 자기에게 추천된 회사 상세를 받고 싶을 때
 * - side='company' → 기업이 추천된 영웅 상세를 받고 싶을 때
 *
 * 요청 접수 → hero_matching_requests 테이블에 기록 → 운영진에게 알림
 * (결제 PG 연동은 사업 시작 시점에 추가)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { side, memberId, companyId } = body as {
            side: "talent" | "company";
            memberId: string;
            companyId?: string;
        };

        if (!side || !memberId) {
            return NextResponse.json({ error: "side와 memberId가 필요합니다" }, { status: 400 });
        }
        if (side === "company" && !companyId) {
            return NextResponse.json({ error: "기업 요청은 companyId가 필요합니다" }, { status: 400 });
        }

        const sb = createAdminClient();

        const { data, error } = await sb
            .from("hero_matching_requests")
            .insert({
                side,
                member_id: memberId,
                company_id: companyId ?? null,
                status: "pending",
                tenant_id: "tenone",
            })
            .select("id")
            .single();

        if (error) {
            console.error("[hero/matching/request]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
