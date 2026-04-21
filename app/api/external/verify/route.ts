/**
 * 외부 소스 검증 API
 * POST /api/external/verify
 * Body: { type: 'rss' | 'web' | 'newsletter', url: string }
 * Returns: { ok: boolean, status: number, latencyMs: number, contentLength?: number, sample?: string, error?: string }
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface VerifyRequest {
    type: "rss" | "web" | "newsletter";
    url: string;
}

export async function POST(request: NextRequest) {
    let body: VerifyRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { type, url } = body;
    if (!url || typeof url !== "string") {
        return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
    }

    // newsletter는 mailto: 형식 — 검증은 이메일 주소 파싱만
    if (type === "newsletter") {
        const m = url.match(/^mailto:(.+)$/);
        if (!m) return NextResponse.json({ ok: false, error: "newsletter type은 mailto:email 형식이어야 합니다." });
        const email = m[1];
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return NextResponse.json({
            ok: valid,
            status: valid ? 200 : 400,
            latencyMs: 0,
            sample: valid ? `${email} — Gmail OAuth 연결 필요` : "이메일 형식 오류",
            error: valid ? undefined : "Invalid email",
        });
    }

    // rss / web: HEAD → 실패 시 GET 시도
    const started = Date.now();
    try {
        let res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
        let usedMethod = "HEAD";
        if (!res.ok || res.status === 405) {
            res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(10000) });
            usedMethod = "GET";
        }
        const latencyMs = Date.now() - started;
        const contentType = res.headers.get("content-type") || "";
        let sample = "";
        let contentLength: number | undefined;

        if (usedMethod === "GET" && res.ok) {
            const text = await res.text();
            contentLength = text.length;
            sample = text.substring(0, 200).replace(/\s+/g, " ");
            // RSS 검증: XML/RSS/Atom feed?
            if (type === "rss") {
                const looksLikeFeed = /<(rss|feed|channel)[\s>]/i.test(text);
                if (!looksLikeFeed) {
                    return NextResponse.json({
                        ok: false,
                        status: res.status,
                        latencyMs,
                        contentType,
                        contentLength,
                        sample,
                        error: "RSS/Atom 피드 형식이 아닙니다 (<rss>, <feed>, <channel> 태그 없음)",
                    });
                }
            }
        }

        return NextResponse.json({
            ok: res.ok,
            status: res.status,
            latencyMs,
            contentType,
            contentLength,
            sample,
            method: usedMethod,
        });
    } catch (e) {
        return NextResponse.json({
            ok: false,
            status: 0,
            latencyMs: Date.now() - started,
            error: e instanceof Error ? e.message : String(e),
        });
    }
}
