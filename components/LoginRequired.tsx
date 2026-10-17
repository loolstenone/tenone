"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { isLeavingAfterSignOut } from "@/lib/sign-out";

/**
 * 로그인이 필요한 화면 표준 (CLAUDE.md §1.2.1 원칙 A) — 현재 페이지 위에 LoginModal을 바로 띄운다.
 * 모달은 X·바깥 클릭·Esc로 닫을 수 있고, 닫으면 이 안내와 [로그인] 버튼이 남아 다시 열 수 있다.
 * ❌ `<LoginModal isOpen onClose={() => {}} />` (닫히지 않는 모달) 쓰지 않는다 — 사용자가 갇힌다 (2026-10-08)
 */
function readableOn(hex: string): string {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return "#fff";
    const n = parseInt(m[1], 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6 ? "#111" : "#fff";
}

export function LoginRequired({ accentColor = "#171717", defaultTab = "login", message = "로그인이 필요한 페이지입니다." }: {
    accentColor?: string;
    defaultTab?: "login" | "signup";
    message?: string;
}) {
    const [open, setOpen] = useState(true);
    const { pendingSignup } = useAuth();
    // 직접 로그아웃하고 서비스 첫 화면으로 떠나는 중이면 로그인 창을 띄우지 않는다 (lib/sign-out.ts)
    if (isLeavingAfterSignOut()) return <div className="min-h-[60vh]" />;
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-neutral-500">{message}</p>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor, color: readableOn(accentColor) }}
            >
                <LogIn className="h-4 w-4" /> 로그인
            </button>
            {/* 회원가입 화면(소셜 첫 로그인)이 떠 있으면 로그인 창을 겹쳐 띄우지 않는다 */}
            <LoginModal isOpen={open && !pendingSignup} onClose={() => setOpen(false)} accentColor={accentColor} defaultTab={defaultTab} />
        </div>
    );
}
