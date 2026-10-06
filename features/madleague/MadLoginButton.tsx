"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

/**
 * MADLeague 회원 전용 화면의 로그인 버튼 — /login으로 이동하지 않고 현재 페이지 위에 LoginModal (§1.2.1 원칙 A).
 * 서버 컴포넌트 페이지에서도 쓸 수 있도록 로그인 완료 시 router.refresh()로 같은 페이지를 다시 그린다.
 */
export function MadLoginButton({ className, children }: { className?: string; children: ReactNode }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open && isAuthenticated) {
            setOpen(false);
            router.refresh();
        }
    }, [open, isAuthenticated, router]);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {children}
            </button>
            <LoginModal isOpen={open} onClose={() => setOpen(false)} accentColor="#EC1D25" />
        </>
    );
}

/** 로그인 필요 화면 — 서버 페이지에서 /login 리다이렉트 대신 반환. 진입 즉시 LoginModal, 로그인 후 같은 페이지 새로 그림 */
export function MadLoginGate({ message = "로그인 후 이용할 수 있습니다." }: { message?: string }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (isAuthenticated) router.refresh();
    }, [isAuthenticated, router]);

    return (
        <div className="bg-black text-white min-h-[60vh]">
            <div className="mx-auto max-w-3xl px-6 py-24">
                <p className="text-neutral-400">{message}</p>
                <button type="button" onClick={() => setOpen(true)} className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">
                    로그인
                </button>
            </div>
            <LoginModal isOpen={open && !isLoading && !isAuthenticated} onClose={() => setOpen(false)} accentColor="#EC1D25" />
        </div>
    );
}
