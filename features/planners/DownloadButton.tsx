"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

/** 자료실 내려받기 — 로그인 회원만 (비로그인은 현재 페이지 위 LoginModal, §1.2.1 원칙 A) */
export function DownloadButton({ fileId, label = "받기" }: { fileId: string; label?: string }) {
    const { isAuthenticated } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onClick() {
        if (!isAuthenticated) { setLoginOpen(true); return; }
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/planners-library/${fileId}/download`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body.url) throw new Error(body.error ?? "내려받지 못했습니다.");
            window.location.href = body.url;
        } catch (e) {
            setError(e instanceof Error ? e.message : "내려받지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={onClick}
                disabled={busy}
                className="inline-flex items-center gap-1.5 bg-[#0F766E] px-3 py-1.5 text-sm font-bold text-white hover:bg-[#134E4A] disabled:opacity-60"
            >
                <Download className="h-4 w-4" /> {busy ? "여는 중" : label}
            </button>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#0F766E" />
        </>
    );
}
