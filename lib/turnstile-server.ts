/**
 * Cloudflare Turnstile 서버 검증 — 인증(Supabase Auth) 밖의 공개 폼(뉴스레터 구독·문의)용.
 * Supabase Auth 폼은 Supabase가 토큰을 검증하므로 여기 대상이 아니다.
 *
 * fail-closed: TURNSTILE_SECRET_KEY가 없으면 항상 실패 → 폼이 멈춘다 (봇 스팸 재발 방지).
 * 시크릿: Cloudflare Turnstile 위젯 "Ten:One™" > Secret Key → Vercel env TURNSTILE_SECRET_KEY
 */
import type { NextRequest } from "next/server";

export const CAPTCHA_REQUIRED_ERROR = "보안 확인에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.";

export async function verifyTurnstile(token: unknown, request?: NextRequest): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret || typeof token !== "string" || !token) return false;

    const body = new URLSearchParams({ secret, response: token });
    const ip = request?.headers.get("cf-connecting-ip") ?? request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) body.set("remoteip", ip);

    try {
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body,
            signal: AbortSignal.timeout(5000),
        });
        const data = (await res.json()) as { success?: boolean };
        return data.success === true;
    } catch (e) {
        console.error("[turnstile] verify error:", e);
        return false;
    }
}
