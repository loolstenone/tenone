import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from "@/lib/turnstile-server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 비회원 공개 폼 — 봇 차단 (점검 축3 H-6)
        if (!(await verifyTurnstile(body.captchaToken, req))) {
            return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
        }
        const sb = createAdminClient();

        if (!body.contactEmail || !body.contactCompany || !body.contactName) {
            return NextResponse.json({ error: "필수 항목 누락 (기업명, 담당자명, 이메일)" }, { status: 400 });
        }

        // insert만 — 담당자 이메일로 upsert하면 다른 사람이 그 기업 응답을 덮어쓸 수 있다 (점검 축3 H-6)
        const { error } = await sb.from("hero_tih_responses").insert({
            company: body.contactCompany,
            contact_name: body.contactName,
            email: body.contactEmail,
            responses: {
                s0: body.s0,
                s1: body.s1,
                s2: body.s2,
                s3: body.s3,
                s4: body.s4,
                s5: body.s5,
                s6: body.s6,
            },
            status: "pending",
            brand_id: "hero",
        });

        if (error?.code === "23505") {
            return NextResponse.json(
                { error: "이미 이 이메일로 접수된 TIH가 있습니다. 내용 수정은 HeRo 팀에 문의해 주세요." },
                { status: 409 },
            );
        }
        if (error) {
            console.error("[hero/tih] supabase error:", JSON.stringify(error));
            throw error;
        }
        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e: any) {
        console.error("[hero/tih] catch:", e?.message, e?.code, e?.details);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
