"use client";

/**
 * 직접 로그아웃 표준 (2026-10-17) — 전 유니버스의 로그아웃 버튼은 이 훅 하나를 쓴다
 *
 * - 회원 전용 화면(서비스 앱·마이 페이지·계정 관리 — lib/private-paths.ts)에서 로그아웃
 *     → 그 서비스의 공개 첫 화면으로 이동 (Planner's 앱 → Planner's 홈). 로그인 창을 띄우지 않는다
 *     → 새로 불러오므로 화면에 있던 개인 데이터가 메모리에 남지 않는다 (공용 PC), 뒤로 가기로 돌아오지 않게 replace
 * - 공개 화면에서 로그아웃 → 그 자리에 둔다
 * - 둘 다 "로그아웃되었습니다" 안내 (components/SignedOutNotice.tsx)
 * - 세션 만료·다른 탭 로그아웃처럼 본인이 누르지 않은 경우는 이 훅을 거치지 않는다
 *     → 화면의 <LoginRequired>가 그 자리에서 로그인 창을 띄워 하던 작업을 이어 간다
 * ❌ 로그아웃 버튼에서 logout() + router.push('/') 직접 호출 (tenone.biz 경로 방식에서 다른 사이트로 튕겨 나간다)
 */
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { domainPrefixMap } from "@/lib/domain-registry";
import { detectSiteId } from "@/lib/site-context";
import { isPrivatePath } from "@/lib/private-paths";

export const SIGNED_OUT_KEY = "t1_signed_out";
export const SIGNED_OUT_EVENT = "t1:signed-out";

// 로그아웃 후 다른 화면으로 떠나는 중 — 그 사이 회원 전용 화면이 로그인 창을 띄우지 않게 (LoginRequired)
let leaving = false;
export function isLeavingAfterSignOut(): boolean {
    return leaving;
}

/** 로그아웃 후 갈 곳 — 회원 전용 화면이면 그 서비스 첫 화면, 아니면 null(그 자리) */
export function destinationAfterSignOut(hostname: string, pathname: string): string | null {
    if (hostname === "account.tenone.biz") return "https://www.tenone.biz/";

    // 브랜드 도메인은 주소창 경로에 브랜드 prefix가 없다 (middleware rewrite) → 내부 경로로 맞춰 판정
    const prefix = domainPrefixMap[hostname] ?? "";
    const internal = prefix && !pathname.startsWith(prefix) ? (pathname === "/" ? prefix : prefix + pathname) : pathname;
    const siteId = detectSiteId(hostname, pathname);
    if (!isPrivatePath(siteId, internal)) return null;

    if (prefix) return "/";
    // tenone.biz·localhost 경로 방식: /planners/app → /planners
    const pathMode = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "tenone.biz" || hostname === "www.tenone.biz";
    const seg = internal.split("/")[1];
    if (pathMode && siteId !== "tenone" && seg) return `/${seg}`;
    return "/";
}

export function useSignOut() {
    const { logout } = useAuth();
    const router = useRouter();
    return useCallback(async () => {
        const destination = destinationAfterSignOut(window.location.hostname, window.location.pathname);
        if (destination) leaving = true;
        await logout();
        try { sessionStorage.setItem(SIGNED_OUT_KEY, "1"); } catch { /* 저장소 막힘 — 안내만 생략 */ }
        if (destination) {
            window.location.replace(destination);
            return;
        }
        window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
        router.refresh();
    }, [logout, router]);
}
