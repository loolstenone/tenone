"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

function LoginGate() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [modalOpen, setModalOpen] = useState(false);

    const redirectTo = searchParams.get("redirect") || "/myverse/app";

    useEffect(() => {
        if (isLoading) return;
        if (isAuthenticated) {
            router.replace(redirectTo);
        } else {
            setModalOpen(true);
        }
    }, [isLoading, isAuthenticated, redirectTo, router]);

    // 로그인 완료 후 isAuthenticated 변경 → 앱으로 이동
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.replace(redirectTo);
        }
    }, [isAuthenticated, isLoading, redirectTo, router]);

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <LoginModal
                isOpen={modalOpen}
                onClose={() => {
                    // 모달 닫기 → 랜딩으로
                    router.replace("/myverse");
                }}
                accentColor="#6366F1"
            />
        </div>
    );
}

export default function MyverseLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            </div>
        }>
            <LoginGate />
        </Suspense>
    );
}
