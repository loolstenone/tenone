"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";

/**
 * HIT 검사는 회원 전용 (2026-10-12 사용자 결정 — 모든 검사는 회원만).
 * a~f 폴더 layout에서 감싼다. 서버는 별도로 requireMember로 막는다 (app/api/hit/{a~f}/session).
 * 비로그인 → 현재 페이지 위 LoginModal (CLAUDE.md §1.2.1)
 */
export default function HitMemberGate({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
            </div>
        );
    }
    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] bg-white">
                <LoginRequired accentColor="#E53935" message="HIT 검사는 회원만 이용할 수 있습니다. 로그인하면 결과가 내 계정에 저장됩니다." />
            </div>
        );
    }
    return <>{children}</>;
}
