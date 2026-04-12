import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyNewApplication } from "@/lib/gravity/notify";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.json();

    const {
        companyName, contactName, email, phone,
        serviceType, industry, productName,
        competitors, painContext, budget, message,
    } = body;

    if (!companyName || !contactName || !email) {
        return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const { error } = await supabase
        .from("bg_apply_requests")
        .insert({
            company_name: companyName,
            contact_name: contactName,
            email,
            phone: phone || null,
            service_type: serviceType,
            industry: industry || null,
            product_name: productName || null,
            competitors: competitors || null,
            pain_context: painContext || null,
            budget: budget || null,
            message: message || null,
            status: "new",
        });

    if (error) {
        console.error("[gravity/apply] DB insert error:", error);
        // DB 실패해도 200 반환 (이메일 백업 알림 예정)
        return NextResponse.json({ ok: true, warn: "db_error" });
    }

    // 그래비티 에이전트 → 메신저 알림
    notifyNewApplication(companyName, productName || "미지정").catch(() => {});

    return NextResponse.json({ ok: true });
}
