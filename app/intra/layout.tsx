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
            localStorage.removeItem('tenone-auth-user');
            const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });
            if (authError || !data.session) {
                setError("인증 실패. 이메일과 비밀번호를 확인하세요.");
                setSubmitting(false);
                return;
            }
            // 세션이 쿠키에 확실히 저장될 때까지 대기
            await sb.auth.getSession();
            await new Promise(r => setTimeout(r, 1000));
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
    const { isAuthenticated, isLoading, canAccessIntra, user } = useAuth();
    const router = useRouter();
    const [intraVerified, setIntraVerified] = useState<boolean | null>(null);

    // auth-context와 별도로 직접 DB 확인
    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { setIntraVerified(false); return; }

        // auth-context가 canAccessIntra를 true로 판단하면 바로 통과
        if (canAccessIntra) { setIntraVerified(true); return; }

        // canAccessIntra가 false여도 DB에서 직접 확인 (타이밍 이슈 대응)
        const verify = async () => {
            try {
                const sb = createClient();
                const { data: { user: authUser } } = await sb.auth.getUser();
                if (!authUser) { setIntraVerified(false); return; }
                const { data: member } = await sb.from('members')
                    .select('account_type,role')
                    .eq('auth_id', authUser.id)
                    .single();
                if (member && member.account_type !== 'member') {
                    setIntraVerified(true);
                } else {
                    setIntraVerified(false);
                }
            } catch { setIntraVerified(false); }
        };
        verify();
    }, [isLoading, isAuthenticated, canAccessIntra]);

    if (isLoading || intraVerified === null) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        </div>
    );

    if (!intraVerified) {
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
