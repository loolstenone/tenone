"use client";

/** 프로그램 화면 공용 로그인 버튼 — /login 이동 없이 현재 페이지 위 LoginModal, 로그인 후 같은 페이지 다시 그림 (§1.2.1 원칙 A) */
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

export function ProgramLoginButton({ accentColor, className, children }: { accentColor: string; className?: string; children: ReactNode }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (open && isAuthenticated) { setOpen(false); router.refresh(); }
    }, [open, isAuthenticated, router]);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className} style={{ background: accentColor }}>{children}</button>
            <LoginModal isOpen={open} onClose={() => setOpen(false)} accentColor={accentColor} />
        </>
    );
}
