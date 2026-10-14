import { NextResponse } from "next/server";
import { paymentClosed } from "@/lib/paid-launch";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function POST(req: Request) {
    const closed = paymentClosed(); // 베타 테스트 기간 — 결제 없음 (lib/paid-launch.ts)
    if (closed) return closed;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const amount = parseInt(String(body.amount ?? 19000), 10);
    const years = parseInt(String(body.years ?? 1), 10);

    if (amount !== 19000 * years) {
        return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const orderId = `pp_${memberId.slice(0, 8)}_${Date.now()}`;

    const admin = createAdminClient();
    const { error } = await admin.from("myverse_payments").insert({
        member_id: memberId,
        order_id: orderId,
        amount,
        status: "pending",
        subscription_years: years,
        source: "toss",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ orderId, amount });
}
