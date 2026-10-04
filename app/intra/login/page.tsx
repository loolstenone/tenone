"use client";

import { useEffect } from "react";

/**
 * 인트라 서버 게이트 대상 페이지 — middleware가 비직원 요청을 여기로 rewrite한다.
 * 로그인·권한없음 UI는 app/intra/layout.tsx가 그린다. 이 페이지 자체는 내용이 없다.
 * layout이 직원으로 판단했는데 서버가 거부한 경우(권한 불일치)만 여기 children으로 렌더된다.
 */
export default function IntraLoginGate() {
    useEffect(() => {
        // 직접 /intra/login으로 들어온 직원은 대시보드로
        if (window.location.pathname === "/intra/login") window.location.replace("/intra");
    }, []);

    return (
        <div className="py-24 text-center text-sm text-neutral-500">
            이 페이지에 접근할 권한이 없습니다. 직원 계정으로 다시 로그인해주세요.
        </div>
    );
}
