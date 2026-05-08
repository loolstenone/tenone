// Stripe Customer Portal — 사용자가 결제 수단·구독 관리
// POST /api/myverse/billing/portal

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });

    const admin = createAdminClient();
    const { data: member } = await admin
        .from("members")
        .select("stripe_customer_id")
        .eq("id", memberId)
        .maybeSingle();
    if (!member?.stripe_customer_id) {
        return NextResponse.json({ error: "no_customer" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const params = new URLSearchParams();
    params.append("customer", member.stripe_customer_id);
    params.append("return_url", `${origin}/myverse/app/settings`);

    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json({ error: "stripe_error", message: txt.slice(0, 200) }, { status: 500 });
    }

    const session = await res.json();
    return NextResponse.json({ url: session.url });
}
