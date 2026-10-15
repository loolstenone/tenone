// Toss Payments 성공 콜백
// 브라우저가 successUrl로 리디렉트 → 이 핸들러가 Toss confirm API 호출 → 구독 활성화 → 앱으로 이동

import { NextResponse } from "next/server";
import { paymentClosed } from "@/lib/paid-launch";
import { createAdminClient } from "@/lib/supabase/admin";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export async function GET(req: Request) {
    const closed = paymentClosed(); // 베타 테스트 기간 — 결제 없음 (lib/paid-launch.ts)
    if (closed) return closed;
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
        .select("order_id, amount, status")
        .eq("order_id", orderId)
        .maybeSingle();

    if (!order || order.amount !== amount) {
        return NextResponse.redirect(new URL("/myverse/purchase?failed=order_mismatch", req.url));
    }
    // 새로고침·뒤로가기로 다시 들어온 경우 — 다시 승인 요청하지 않는다 (토스가 거절 → 결제 완료 기록을 실패로 덮던 문제)
    if (order.status === "paid") return NextResponse.redirect(new URL("/myverse/app?welcome=1", req.url));
    if (order.status !== "pending") return NextResponse.redirect(new URL("/myverse/purchase?failed=order_state", req.url));

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
            "Idempotency-Key": orderId,
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!confirmRes.ok) {
        const err = await confirmRes.json().catch(() => ({}));
        console.error("Toss confirm failed", err);
        // 대기 중인 주문만 실패로 — 동시에 들어온 다른 요청이 이미 완료했으면 건드리지 않는다
        await admin
            .from("myverse_payments")
            .update({ status: "failed", meta: err, updated_at: new Date().toISOString() })
            .eq("order_id", orderId)
            .eq("status", "pending");
        return NextResponse.redirect(new URL(`/myverse/purchase?failed=confirm`, req.url));
    }

    const tossData = await confirmRes.json();

    // 결제 기록 + 구독 활성화를 DB 함수 한 번에 — 대기 중인 주문일 때만, 같은 주문은 한 번만 (sql/intra-live-roles-and-approval-authority.sql)
    const { data: result, error } = await admin.rpc("myverse_complete_toss_payment", {
        p_order_id: orderId,
        p_payment_key: paymentKey,
        p_receipt_url: tossData.receipt?.url ?? null,
        p_method: tossData.method ?? null,
        p_meta: tossData,
    });
    if (error || (result !== "paid" && result !== "already_paid")) {
        console.error("[myverse/payment] 결제 완료 처리 실패:", error?.message ?? result, orderId);
        return NextResponse.redirect(new URL("/myverse/purchase?failed=complete", req.url));
    }

    return NextResponse.redirect(new URL("/myverse/app?welcome=1", req.url));
}
