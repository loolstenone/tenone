"use client";

import { useEffect } from "react";

/**
 * Server-side redirect()를 prefetch가 따라가다 무한 루프 trigger하는
 * Next.js 16 dev router 버그 회피용 client redirect.
 * 다른 브랜드(SmarComm·WIO)처럼 layout 인증 게이트는 client에서 처리한다.
 */
export function ClientRedirect({ to }: { to: string }) {
    useEffect(() => {
        window.location.replace(to);
    }, [to]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <div className="h-8 w-8 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
        </div>
    );
}
