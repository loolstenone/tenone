/**
 * GA4 Analytics 자동 동기화 Cron
 * GET /api/cron/analytics-sync
 *
 * 트리거: Vercel Cron (매일 03:00 KST = 18:00 UTC 전날)
 * 인증: Authorization: Bearer ${CRON_SECRET}
 *
 * 내부 동작: /api/analytics/sync (POST) 호출 — days=2 (어제 + 그제 재확인)
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
    // Vercel Cron이 자동으로 Authorization 헤더를 붙인다
    const auth = req.headers.get("authorization");
    if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = req.nextUrl.origin;
    try {
        const res = await fetch(`${origin}/api/analytics/sync?days=2`, {
            method: "POST",
            headers: { "x-cron-source": "vercel-cron" },
        });
        const json = await res.json();
        if (!res.ok) {
            return NextResponse.json({ ok: false, error: json.error, upstream: res.status }, { status: 502 });
        }
        const ok = (json.results ?? []).filter((r: { status: string }) => r.status === "ok").length;
        const err = (json.results ?? []).filter((r: { status: string }) => r.status === "error").length;
        return NextResponse.json({
            ok: true,
            triggered_at: new Date().toISOString(),
            brands_synced: ok,
            brands_failed: err,
            ...json,
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
