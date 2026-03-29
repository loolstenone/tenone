"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LibraryProvider } from "@/lib/library-context";
import { PointProvider } from "@/lib/point-context";
import { IntraSidebar } from "@/components/IntraSidebar";
import { IntraHeader } from "@/components/IntraHeader";
import { ShieldAlert, Lock, Eye, EyeOff, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function IntraLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const sb = createClient();
            // 새 로그인 (기존 세션 자동 교체, signOut 하지 않음)
            localStorage.removeItem('tenone-auth-user');
            const { error: authError } = await sb.auth.signInWithPassword({ email, password });
            if (authError) {
                setError("인증 실패. 이메일과 비밀번호를 확인하세요.");
                setSubmitting(false);
                return;
            }
            // 완전한 페이지 리로드로 auth-context 초기화부터 다시
            window.location.replace('/intra');
        } catch { setError("오류가 발생했습니다."); setSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <a href="/" className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors" title="홈으로">
                            <Home className="h-5 w-5 text-neutral-500" />
                        </a>
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10">
                            <Lock className="h-6 w-6 text-neutral-400" />
                        </div>
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Ten:One™ Intra</h1>
                    <p className="text-xs text-neutral-500 mt-1">내부 구성원 전용</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-3">
                    <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20" />
                    <div className="relative">
                        <input type={showPw ? "text" : "password"} placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 pr-10" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button type="submit" disabled={submitting || !email || !password}
                        className="w-full py-3 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        {submitting ? "인증 중..." : "로그인"}
                    </button>
                </form>
                <p className="text-center text-[10px] text-neutral-700 mt-8">Ten:One™ Universe Operating System</p>
            </div>
        </div>
    );
}

export default function IntraLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, canAccessIntra } = useAuth();
    const router = useRouter();

    if (isLoading) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated || !canAccessIntra) {
        return <IntraLoginForm />;
    }

    return (
        <LibraryProvider>
        <PointProvider>
            <div className="min-h-screen bg-white text-neutral-900 flex">
                {/* Dark sidebar */}
                <IntraSidebar />

                {/* Main content */}
                <div className="flex-1 ml-0 lg:ml-[240px] flex flex-col min-h-screen">
                    <IntraHeader />
                    <main className="flex-1 p-3 pt-14 sm:p-4 sm:pt-14 lg:px-8 lg:py-6 lg:pt-6 bg-white">
                        <div className="max-w-[1200px]">
                            {children}
                        </div>
                    </main>
                    <footer className="border-t border-neutral-100 px-4 lg:px-8 py-4 flex items-center justify-between">
                        <p className="text-[10px] sm:text-xs text-neutral-400">© {new Date().getFullYear()} Ten:One™ Intra</p>
                        <p className="text-[10px] sm:text-xs text-neutral-300">Internal Use Only</p>
                    </footer>
                </div>
            </div>
        </PointProvider>
        </LibraryProvider>
    );
}
