/**
 * 로그인/가입 복귀 원칙 헬퍼
 *
 * 브랜드 사이트에서 로그인/가입을 시작하면, 완료 후 **해당 브랜드 사이트의 원래 페이지로 복귀**해야 한다.
 * 이 헬퍼를 통해 `/login` 링크·`router.push('/login')` 전부에 `?redirect={현재경로}` 파라미터를 일관되게 부여한다.
 *
 * 사용 예:
 *   const pathname = usePathname();
 *   <Link href={loginHref(pathname)}>로그인</Link>
 *   router.push(loginHref(pathname));
 *   router.push(loginHref(pathname, 'signup'));
 */

type Tab = "login" | "signup";

export function loginHref(
    pathname: string | null | undefined,
    tab?: Tab,
): string {
    const safePath =
        pathname &&
        pathname !== "/" &&
        !pathname.startsWith("/login") &&
        !pathname.startsWith("/signup") &&
        !pathname.startsWith("/auth") &&
        !pathname.startsWith("/reset-password")
            ? pathname
            : null;

    const params = new URLSearchParams();
    if (safePath) params.set("redirect", safePath);
    if (tab === "signup") params.set("tab", "signup");

    const q = params.toString();
    return q ? `/login?${q}` : "/login";
}

/**
 * 브라우저 전역 경로로부터 /login 경로 생성 (client-only).
 * 훅 없이 쓸 수 있어 `useEffect` 안의 `router.push` 에 편리하다.
 * SSR에서 호출되면 안전하게 `/login` 반환.
 */
export function currentLoginHref(tab?: Tab): string {
    if (typeof window === "undefined") return "/login";
    return loginHref(window.location.pathname, tab);
}

/** signup 페이지로 보낼 때 사용 (로그인 링크와 동일 규약) */
export function signupHref(
    pathname: string | null | undefined,
): string {
    const safePath =
        pathname &&
        pathname !== "/" &&
        !pathname.startsWith("/login") &&
        !pathname.startsWith("/signup") &&
        !pathname.startsWith("/auth") &&
        !pathname.startsWith("/reset-password")
            ? pathname
            : null;

    if (!safePath) return "/signup";
    return `/signup?redirect=${encodeURIComponent(safePath)}`;
}
