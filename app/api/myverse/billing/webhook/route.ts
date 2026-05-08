// Stripe 웹훅 — 구독 상태 동기화
// POST /api/myverse/billing/webhook
//
// 환경변수: STRIPE_WEBHOOK_SECRET
// Stripe CLI 또는 Dashboard에서 endpoint 등록 후 secret을 .env에 추가.
//
// 처리 이벤트:
//   checkout.session.completed       — customer_id 저장
//   customer.subscription.created    — 구독 생성
//   customer.subscription.updated    — 상태 갱신
//   customer.subscription.deleted    — 취소
//   invoice.paid                     — 결제 성공 로그
//   invoice.payment_failed           — 결제 실패

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface StripeEvent {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
}

function verifySig(payload: string, sigHeader: string, secret: string): boolean {
    // Stripe-Signature: t=...,v1=...,v0=...
    const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, p) => {
        const [k, v] = p.split("=");
        acc[k] = v;
        return acc;
    }, {});
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) return false;
    const signed = `${t}.${payload}`;
    const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
    } catch { return false; }
}

function planFromPriceId(priceId: string): string {
    if (priceId === process.env.STRIPE_PRICE_PLUS) return "plus";
    if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
    if (priceId === process.env.STRIPE_PRICE_FAMILY) return "family";
    return "plus";
}

export async function POST(req: Request) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

    const payload = await req.text();
    if (!verifySig(payload, sig, secret)) {
        return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }

    const event = JSON.parse(payload) as StripeEvent;
    const admin = createAdminClient();

    // Idempotency
    const { data: seen } = await admin.from("myverse_stripe_events").select("id, processed").eq("id", event.id).maybeSingle();
    if (seen?.processed) return NextResponse.json({ received: true, idempotent: true });
    if (!seen) await admin.from("myverse_stripe_events").insert({ id: event.id, type: event.type, payload: event });

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const s = event.data.object as { customer?: string; client_reference_id?: string; metadata?: Record<string, string> };
                const memberId = s.client_reference_id || s.metadata?.member_id;
                if (memberId && s.customer) {
                    await admin.from("members").update({ stripe_customer_id: s.customer }).eq("id", memberId);
                }
                break;
            }
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as {
                    id: string; customer: string; status: string;
                    current_period_start: number; current_period_end: number;
                    cancel_at_period_end: boolean;
                    items: { data: { price: { id: string } }[] };
                };
                const priceId = sub.items.data[0]?.price?.id ?? "";
                const plan = planFromPriceId(priceId);
                const { data: m } = await admin.from("members").select("id").eq("stripe_customer_id", sub.customer).maybeSingle();
                if (m) {
                    await admin.from("myverse_subscriptions").upsert({
                        member_id: m.id,
                        stripe_subscription_id: sub.id,
                        stripe_customer_id: sub.customer,
                        plan,
                        status: sub.status,
                        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: sub.cancel_at_period_end,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: "stripe_subscription_id" });
                }
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as { id: string };
                await admin.from("myverse_subscriptions")
                    .update({ status: "canceled", canceled_at: new Date().toISOString() })
                    .eq("stripe_subscription_id", sub.id);
                break;
            }
            // invoice.paid / invoice.payment_failed — 로그만 (subscription.updated가 상태 동기화)
        }

        await admin.from("myverse_stripe_events").update({ processed: true }).eq("id", event.id);
    } catch (e) {
        console.error("[stripe webhook] handler error:", (e as Error).message);
        return NextResponse.json({ error: "handler_error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
