// Stripe Checkout 시작 — 사용자가 플랜 선택 → Stripe 결제 URL로 redirect
// POST /api/myverse/billing/checkout  body: { plan: "plus"|"pro"|"family" }
//
// 환경변수:
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_PLUS / STRIPE_PRICE_PRO / STRIPE_PRICE_FAMILY (각 plan의 Stripe Price ID)
//
// Stripe SDK 미설치 — REST API 직접 호출.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const PLAN_TO_ENV: Record<string, string> = {
    plus:   "STRIPE_PRICE_PLUS",
    pro:    "STRIPE_PRICE_PRO",
    family: "STRIPE_PRICE_FAMILY",
};

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || "").toLowerCase();
    const priceEnv = PLAN_TO_ENV[plan];
    if (!priceEnv) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
    const priceId = process.env[priceEnv];
    if (!priceId) return NextResponse.json({ error: "missing_price_id", env: priceEnv }, { status: 500 });

    const admin = createAdminClient();
    const { data: member } = await admin
        .from("members")
        .select("id, email, name, stripe_customer_id")
        .eq("id", memberId)
        .maybeSingle();
    if (!member) return NextResponse.json({ error: "member_not_found" }, { status: 404 });

    const origin = new URL(req.url).origin;
    const successUrl = `${origin}/myverse/purchase?status=success&plan=${plan}`;
    const cancelUrl  = `${origin}/myverse/purchase?status=cancel`;

    // Stripe REST API — Checkout Session 생성
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[member_id]", member.id);
    params.append("metadata[plan]", plan);
    params.append("client_reference_id", member.id);
    if (member.stripe_customer_id) params.append("customer", member.stripe_customer_id);
    else if (member.email) params.append("customer_email", member.email);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error("[stripe checkout] error:", txt);
        return NextResponse.json({ error: "stripe_error", message: txt.slice(0, 200) }, { status: 500 });
    }

    const session = await res.json();
    return NextResponse.json({ url: session.url, session_id: session.id });
}
