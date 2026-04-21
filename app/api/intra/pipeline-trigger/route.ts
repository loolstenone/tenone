/**
 * Pipeline Manual Trigger API
 * POST /api/intra/pipeline-trigger  { action: "crawl" | "process" | "newsletter" }
 *
 * Intra 내부 전용. 서버에서 ADMIN_API_KEY로 크롤러 API를 대리 호출.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ACTIONS: Record<string, { url: string; method: string; body?: object }> = {
    crawl: { url: "/api/crawler", method: "POST", body: { action: "crawl" } },
    process: { url: "/api/crawler", method: "POST", body: { action: "process" } },
    opportunity_crawl: { url: "/api/opportunity/crawl", method: "POST", body: { action: "crawl" } },
    opportunity_process: { url: "/api/opportunity/crawl", method: "POST", body: { action: "process" } },
    newsletter: { url: "/api/cron/newsletter-crawl", method: "GET" },
};

export async function POST(request: NextRequest) {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) return NextResponse.json({ error: "ADMIN_API_KEY not set" }, { status: 503 });

    const body = await request.json().catch(() => ({})) as { action?: string };
    const action = body.action;
    if (!action || !ACTIONS[action]) {
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const def = ACTIONS[action];
    const baseUrl = request.nextUrl.origin;

    const res = await fetch(`${baseUrl}${def.url}`, {
        method: def.method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminKey}`,
        },
        ...(def.body ? { body: JSON.stringify(def.body) } : {}),
    });

    const data = await res.json().catch(() => ({ status: res.status }));
    return NextResponse.json({ action, status: res.status, result: data });
}
