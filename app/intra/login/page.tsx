"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 인트라 서버 게이트 대상 페이지 — middleware가 비직원 요청을 여기로 rewrite한다.
 * 로그인·권한없음 UI는 app/intra/layout.tsx가 그린다. 이 페이지 자체는 내용이 없다.
 * layout이 직원으로 판단했는데 서버가 거부한 경우(권한 불일치)만 여기 children으로 렌더된다.
 *
 * 대표 사례: 다른 브랜드 사이트에서 로그아웃(전체 세션 폐기) → 이 브라우저의 인트라 쿠키에는
 * 만료된 JWT가 남아 layout의 getSession()(로컬 읽기)은 "직원"으로 보지만 서버(getUser)는 거부.
 * → 서버 기준으로 세션을 다시 확인하고, 무효면 로컬 세션을 지워 layout이 로그인 화면을 그리게 한다.
 */
export default function IntraLoginGate() {
    useEffect(() => {
        // 직접 /intra/login으로 들어온 직원은 대시보드로
        if (window.location.pathname === "/intra/login") {
            window.location.replace("/intra");
            return;
        }
        const sb = createClient();
        sb.auth.getUser().then((res: { data: { user: unknown }; error: unknown }) => {
            // 세션 무효 → 로컬 세션 정리 → layout의 SIGNED_OUT 처리로 로그인 폼 표시
            if (res.error || !res.data.user) sb.auth.signOut({ scope: "local" });
        });
    }, []);

    return (
        <div className="py-24 text-center text-sm text-neutral-500">
            이 페이지에 접근할 권한이 없습니다. 직원 계정으로 다시 로그인해주세요.
        </div>
    );
}
