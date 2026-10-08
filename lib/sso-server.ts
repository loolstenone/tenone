/**
 * Ten:One™ Universe One ID — SSO 서버 모듈 (독립 도메인 간 로그인 이어주기)
 *
 * 허브 = auth.tenone.biz (`.tenone.biz` 쿠키). 독립 도메인(rook.co.kr·madleague.net·hero.ne.kr …)은 허브를 거쳐 세션을 넘겨받는다.
 *
 *   로그인 버튼 (사이트, 비로그인)  → 허브 /api/sso/initiate → (허브 세션 있음) 사이트 /api/sso/exchange → 로그인 완료
 *                                                         → (허브 세션 없음) 사이트 /api/sso/return → 로그인 모달
 *   사이트에서 로그인 성공           → 사이트 /api/sso/publish → 허브 /api/sso/adopt → 원래 페이지 (허브에도 로그인 등록)
 *
 * 보안 원칙
 * - access/refresh 토큰을 복사하지 않는다 — Supabase refresh token은 1회용이라 두 도메인이 나눠 쓰면 세션이 끊긴다.
 *   대신 관리자 API generateLink(magiclink, 메일 발송 없음)의 hashed_token으로 받는 쪽 서버가 verifyOtp → **도메인마다 독립 세션**
 * - 브라우저 URL에는 32바이트 무작위 일회용 토큰만. DB에는 그 SHA-256만 저장, 60초 만료, 꺼내는 순간 삭제(1회용)
 * - 토큰은 발급 때 정한 도메인에서만 교환 가능 · origin은 domain-registry 등록 도메인만 · 이동 경로는 safeRedirect(상대 경로)
 * - 세션 확인은 getUser()(서버 검증) — 로그아웃(scope global) 후의 쿠키로는 이어지지 않는다
 * - sso_tokens: RLS on · 정책 없음 · anon/authenticated 권한 없음 → service_role 전용
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllExternalDomains, getCookieDomain } from "@/lib/domain-registry";

export const SSO_HUB_ORIGIN = "https://auth.tenone.biz";
/** 허브에 세션이 없다고 확인된 뒤 이 시간 동안은 다시 묻지 않는다 (로그인 버튼마다 허브 왕복 방지) */
export const SSO_NONE_COOKIE = "t1_sso_none";
export const SSO_NONE_MAX_AGE = 60 * 10;

type Direction = "to_site" | "to_hub";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** SSO 대상이 되는 독립 도메인 origin인지 (https + domain-registry 등록 도메인) */
export function isAllowedSiteOrigin(origin: string | null): origin is string {
    if (!origin) return false;
    try {
        const u = new URL(origin);
        if (u.protocol !== "https:" || u.pathname !== "/" || u.search || u.username) return false;
        return getAllExternalDomains().includes(u.hostname);
    } catch {
        return false;
    }
}

/** 요청 쿠키로 세션을 읽고 응답에 쿠키를 쓰는 서버 클라이언트 (도메인 쿠키 규칙은 auth/confirm과 동일) */
export function ssoSupabase(request: NextRequest, response: NextResponse) {
    const host = request.headers.get("host") || "";
    const cookieDomain = getCookieDomain(host);
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, { ...options, ...(cookieDomain && { domain: cookieDomain }) });
                    });
                },
            },
            auth: { storageKey: "tenone-auth" },
        },
    );
}

/** 로그인된 사용자 → 받는 쪽에서 독립 세션을 만들 일회용 토큰 발급. 실패 시 null */
export async function mintSsoToken(params: {
    userId: string;
    email: string;
    direction: Direction;
    /** 토큰을 교환할 곳의 origin (to_site = 사이트, to_hub = 허브) */
    exchangeOrigin: string;
    /** 교환 후 돌아갈 곳: to_site = 사이트 내 경로, to_hub = 사이트 origin + 경로 */
    returnOrigin: string;
    finalPath: string;
}): Promise<string | null> {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: params.email });
    const otpHash = data?.properties?.hashed_token;
    if (error || !otpHash || data.user?.id !== params.userId) {
        console.error("[sso] generateLink failed:", error?.message ?? "user mismatch");
        return null;
    }

    const token = randomBytes(32).toString("hex");
    // 만료된 토큰 정리 (테이블이 쌓이지 않게)
    await admin.from("sso_tokens").delete().lt("expires_at", new Date().toISOString());
    const { error: insErr } = await admin.from("sso_tokens").insert({
        token: sha256(token),
        otp_hash: otpHash,
        user_id: params.userId,
        direction: params.direction,
        redirect_to: new URL(params.exchangeOrigin).host,
        return_origin: params.returnOrigin,
        final_path: params.finalPath,
    });
    if (insErr) {
        console.error("[sso] token insert failed:", insErr.message);
        return null;
    }
    return token;
}

/** 일회용 토큰 꺼내기 — 삭제와 동시에 읽어 재사용 불가. 만료·방향·도메인 불일치면 null */
export async function consumeSsoToken(token: string | null, direction: Direction, requestHost: string) {
    if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
    const admin = createAdminClient();
    const { data } = await admin
        .from("sso_tokens")
        .delete()
        .eq("token", sha256(token))
        .select("otp_hash, user_id, direction, redirect_to, return_origin, final_path, expires_at")
        .maybeSingle();
    if (!data) return null;
    if (data.direction !== direction) return null;
    if (new Date(data.expires_at) < new Date()) return null;
    if (data.redirect_to !== requestHost.split(":")[0] && data.redirect_to !== requestHost) return null;
    return data as { otp_hash: string; user_id: string; return_origin: string; final_path: string };
}

/** hashed_token으로 이 도메인에 독립 세션 생성 (쿠키는 response에) */
export async function establishSession(request: NextRequest, response: NextResponse, otpHash: string, expectedUserId: string) {
    const sb = ssoSupabase(request, response);
    const { data, error } = await sb.auth.verifyOtp({ token_hash: otpHash, type: "email" });
    if (error || data.user?.id !== expectedUserId) {
        console.error("[sso] verifyOtp failed:", error?.message ?? "user mismatch");
        return false;
    }
    return true;
}

/** 이 요청 호스트가 허브인지 (auth.tenone.biz — 프로덕션 tenone 계열) */
export function isHubHost(request: NextRequest): boolean {
    return (request.headers.get("host") || "").split(":")[0] === new URL(SSO_HUB_ORIGIN).hostname;
}
