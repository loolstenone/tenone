"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

interface AuthGateProps {
    children: ReactNode;
    /** 로그인 모달 & 로딩 스피너 악센트 색 (브랜드 컬러) */
    accentColor?: string;
    /** 모달 뒤 배경 클래스 (기본: bg-white). 브랜드 다크 마이페이지는 bg-neutral-950 등 권장. */
    bgClassName?: string;
    /** 모달 기본 탭 (login|signup) */
    defaultTab?: "login" | "signup";
}

/**
 * 브랜드 보호 페이지(마이페이지 등) 로그인 게이트 표준 컴포넌트.
 *
 * 원칙: 비로그인 상태로 접근 시 **`/login` 페이지로 리다이렉트하지 말고**
 * 현재 페이지 위에 `LoginModal`을 팝업한다 (Badak 표준).
 *
 * 사용 예:
 *   export default function MyPage() {
 *     return (
 *       <AuthGate accentColor="#D4D4D4" bgClassName="bg-neutral-950">
 *         <MyPageContent />  // 인증 전제 컴포넌트
 *       </AuthGate>
 *     );
 *   }
 */
export function AuthGate({
    children,
    accentColor = "#171717",
    bgClassName = "bg-white",
    defaultTab = "login",
}: AuthGateProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) setShowLogin(true);
        else if (isAuthenticated) setShowLogin(false);
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${bgClassName}`}>
                <div
                    className="h-6 w-6 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${accentColor}33`, borderTopColor: accentColor }}
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen ${bgClassName}`}>
                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    accentColor={accentColor}
                    defaultTab={defaultTab}
                />
            </div>
        );
    }

    return <>{children}</>;
}
