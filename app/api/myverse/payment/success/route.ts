// Toss Payments 성공 콜백
// 브라우저가 successUrl로 리디렉트 → 이 핸들러가 Toss confirm API 호출 → 구독 활성화 → 앱으로 이동

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const paymentKey = url.searchParams.get("paymentKey");
    const orderId = url.searchParams.get("orderId");
    const amountStr = url.searchParams.get("amount");

    if (!paymentKey || !orderId || !amountStr) {
        return NextResponse.redirect(new URL("/myverse/purchase?failed=missing_params", req.url));
    }

    const amount = parseInt(amountStr, 10);
    const admin = createAdminClient();

    // 주문 검증
    const { data: order } = await admin
        .from("myverse_payments")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

    if (!order || order.amount !== amount) {
        return NextResponse.redirect(new URL("/myverse/purchase?failed=order_mismatch", req.url));
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
        console.error("TOSS_SECRET_KEY not configured");
        return NextResponse.redirect(new URL("/myverse/purchase?failed=config", req.url));
    }

    // Toss confirm API 호출
    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const confirmRes = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!confirmRes.ok) {
        const err = await confirmRes.json().catch(() => ({}));
        console.error("Toss confirm failed", err);
        await admin
            .from("myverse_payments")
            .update({ status: "failed", meta: err, updated_at: new Date().toISOString() })
            .eq("order_id", orderId);
        return NextResponse.redirect(new URL(`/myverse/purchase?failed=confirm`, req.url));
    }

    const tossData = await confirmRes.json();

    const startDate = new Date().toISOString().slice(0, 10);
    const endDateObj = new Date();
    endDateObj.setFullYear(endDateObj.getFullYear() + (order.subscription_years || 1));
    const endDate = endDateObj.toISOString().slice(0, 10);

    // 결제 기록 업데이트
    await admin
        .from("myverse_payments")
        .update({
            status: "paid",
            toss_payment_key: paymentKey,
            toss_receipt_url: tossData.receipt?.url ?? null,
            method: tossData.method ?? null,
            paid_at: new Date().toISOString(),
            subscription_starts: startDate,
            subscription_ends: endDate,
            meta: tossData,
            updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

    // 구독 활성화 (SQL 함수 사용)
    await admin.rpc("myverse_activate_subscription", {
        _member_id: order.member_id,
        _years: order.subscription_years || 1,
        _source: "toss",
    });

    return NextResponse.redirect(new URL("/myverse/app?welcome=1", req.url));
}
