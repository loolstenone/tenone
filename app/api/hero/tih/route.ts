import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const sb = createAdminClient();

        if (!body.contactEmail || !body.contactCompany || !body.contactName) {
            return NextResponse.json({ error: "필수 항목 누락 (기업명, 담당자명, 이메일)" }, { status: 400 });
        }

        const { error } = await sb.from("hero_tih_responses").upsert({
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
        }, { onConflict: "email" });

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
