"use client";

import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { crossSiteHref } from "@/lib/cross-site";

/**
 * 다른 브랜드·TenOne 페이지로 가는 링크. 서버 렌더는 상대 경로, 마운트 후 현재 도메인에 맞는 주소로 바꾼다
 * (hydration 불일치 방지). 로그인 상태면 다른 독립 도메인으로 갈 때 One ID 로그인도 함께 넘어간다.
 * 결과가 같은 사이트 경로면 Next Link(클라이언트 이동), 다른 사이트 주소면 일반 <a>.
 */
export function CrossSiteLink({ href, children, ...rest }: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
    const { isAuthenticated } = useAuth();
    const [resolved, setResolved] = useState(href);
    useEffect(() => { setResolved(crossSiteHref(href, { loggedIn: isAuthenticated })); }, [href, isAuthenticated]);
    return resolved.startsWith("/")
        ? <Link href={resolved} {...rest}>{children}</Link>
        : <a href={resolved} {...rest}>{children}</a>;
}
