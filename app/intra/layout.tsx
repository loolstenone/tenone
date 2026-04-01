"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LibraryProvider } from "@/lib/library-context";
import { PointProvider } from "@/lib/point-context";
import { IntraSidebar } from "@/components/IntraSidebar";
import { IntraHeader } from "@/components/IntraHeader";
import { Lock, Eye, EyeOff, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const INTRA_VERIFIED_KEY = "tenone_intra_verified";

type IntraStatus = "loading" | "ok" | "login" | "no-access";

/**
 * 인트라 레이아웃 — auth-context 완전 미사용.
 * 자체적으로 Supabase 세션 확인 → members 권한 체크.
 * 로그인 성공 시 window.location.reload()로 깔끔하게 재시작.
 * sessionStorage 캐시로 새로고침 시 깜박임 방지.
 */
export default function IntraLayout({ children }: { children: React.ReactNode }) {
    // sessionStorage에 검증 캐시가 있으면 즉시 'ok', 없으면 'loading'
    const [status, setStatus] = useState<IntraStatus>(() => {
        if (typeof window !== "undefined") {
            try {
                if (sessionStorage.getItem(INTRA_VERIFIED_KEY) === "1") return "ok";
            } catch { /* ignore */ }
        }
        return "loading";
    });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const verifyStarted = useRef(false);

    // 세션 검증 (마운트 시 1회)
    useEffect(() => {
        // sessionStorage 캐시 히트 → 백그라운드 재검증만
        // 캐시 미스 → 풀 검증
        if (verifyStarted.current) return;
        verifyStarted.current = true;

        const isCached = status === "ok";

        const verify = async () => {
            try {
                const sb = createClient();

                // 1) getSession() — 쿠키/로컬스토리지에서 즉시 읽음 (네트워크 없음, cold start 무관)
                // 미들웨어가 이미 getSession()으로 쿠키를 갱신해두므로 여기서는 빠름
                const { data: sessionData } = await sb.auth.getSession();
                const user = sessionData?.session?.user ?? null;

                if (!user) {
                    console.log("[Intra] No session found, showing login");
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("login");
                    return;
                }

                console.log("[Intra] Session found:", user.email);

                // 2-A) JWT app_metadata에서 빠른 권한 판단 (DB 조회 없음)
                const appMeta = user.app_metadata;
                if (appMeta?.is_staff === true || appMeta?.is_super_admin === true) {
                    console.log("[Intra] JWT fast-path: staff/admin access granted");
                    sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                    setStatus("ok");
                    return;
                }
                // JWT에 roles가 있으면 인트라 접근 가능 역할 확인
                if (appMeta?.roles && Array.isArray(appMeta.roles)) {
                    const canIntra = (appMeta.roles as string[]).some((r: string) =>
                        r.startsWith('staff:') || r.startsWith('super_admin:')
                        || r.startsWith('partner:') || r.startsWith('junior_partner:')
                        || r.startsWith('crew:')
                    );
                    if (canIntra) {
                        console.log("[Intra] JWT fast-path: role-based access granted");
                        sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                        setStatus("ok");
                        return;
                    }
                    // JWT에 roles가 있지만 인트라 권한 없음
                    if (appMeta.roles.length > 0) {
                        console.log("[Intra] JWT: no intra access in roles");
                        sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                        setStatus("no-access");
                        return;
                    }
                }

                // 2-B) JWT에 roles가 없으면 기존 방식 fallback (members 테이블)
                const memberResult = await Promise.race([
                    sb
                        .from("members")
                        .select("account_type,role")
                        .eq("auth_id", user.id)
                        .single(),
                    new Promise<null>((r) => setTimeout(() => r(null), 5000)),
                ]);

                const member =
                    memberResult && typeof memberResult === "object" && "data" in memberResult
                        ? (memberResult as { data: any }).data
                        : null;

                if (member && member.account_type !== "member") {
                    console.log("[Intra] Legacy access granted:", member.account_type);
                    sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                    setStatus("ok");
                } else if (member && member.account_type === "member") {
                    console.log("[Intra] No access: account_type =", member.account_type);
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("no-access");
                } else {
                    console.log("[Intra] Member lookup failed, isCached:", isCached);
                    if (!isCached) {
                        sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                        setStatus("login");
                    }
                }
            } catch (err) {
                console.error("[Intra] verify error:", err);
                if (!isCached) {
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("login");
                }
            }
        };

        verify();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 로그인 핸들러 — signIn만 하고 즉시 페이지 이동. 권한 확인은 verify()가 담당.
    const handleLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            setSubmitting(true);

            try {
                const sb = createClient();

                // 20초 타임아웃 (cold start 시 10~15초 걸릴 수 있음)
                const signInResult = await Promise.race([
                    sb.auth.signInWithPassword({ email, password }),
                    new Promise<{ error: { message: string } }>((resolve) =>
                        setTimeout(() => resolve({ error: { message: 'timeout' } }), 20000)
                    ),
                ]);

                const authError = signInResult && 'error' in signInResult ? signInResult.error : null;

                if (authError) {
                    const msg = authError.message === 'timeout'
                        ? "서버 연결에 시간이 걸리고 있습니다. 버튼을 다시 눌러주세요."
                        : "이메일 또는 비밀번호를 확인하세요.";
                    console.error("[Intra Login] error:", authError.message);
                    setError(msg);
                    setSubmitting(false);
                    return;
                }

                // signIn 성공 → 즉시 페이지 이동 (새 페이지에서 verify()가 권한 확인)
                window.location.href = window.location.pathname;
            } catch (err) {
                console.error("[Intra Login] exception:", err);
                setError("오류가 발생했습니다. 새로고침 후 다시 시도하세요.");
                setSubmitting(false);
            }
        },
        [email, password],
    );

    // auth 이벤트 감지: SIGNED_OUT → 로그인 폼, TOKEN_REFRESHED/SIGNED_IN → JWT fast-path 재시도
    useEffect(() => {
        const sb = createClient();
        const { data: { subscription } } = sb.auth.onAuthStateChange((event: string, session) => {
            if (event === 'SIGNED_OUT') {
                sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                setStatus("login");
            } else if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session?.user) {
                // 토큰 갱신 후 새 JWT에서 is_staff 확인 → race condition 해소
                const appMeta = session.user.app_metadata;
                if (appMeta?.is_staff === true || appMeta?.is_super_admin === true) {
                    sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                    setStatus("ok");
                }
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // ── 로딩 ──
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // ── 로그인 폼 / 접근 불가 ──
    if (status === "login" || status === "no-access") {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* 헤더 */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <a
                                href="/"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                title="홈으로"
                            >
                                <Home className="h-5 w-5 text-neutral-500" />
                            </a>
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10">
                                <Lock className="h-6 w-6 text-neutral-400" />
                            </div>
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight">
                            Ten:One&trade; Intra
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">내부 구성원 전용</p>
                    </div>

                    {/* 접근 불가 메시지 */}
                    {status === "no-access" && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-400 text-center">
                                접근 권한이 없습니다. 직원 계정으로 로그인하세요.
                            </p>
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <form onSubmit={handleLogin} className="space-y-3">
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
                            autoComplete="email"
                        />
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 pr-10"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting || !email || !password}
                            className="w-full py-3 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? "인증 중..." : "로그인"}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-neutral-700 mt-8">
                        Ten:One&trade; Universe Operating System
                    </p>
                </div>
            </div>
        );
    }

    // ── 인트라 콘텐츠 (status === 'ok') ──
    return (
        <LibraryProvider>
            <PointProvider>
                <div className="min-h-screen bg-white text-neutral-900 flex">
                    <IntraSidebar />
                    <div className="flex-1 ml-0 lg:ml-[240px] flex flex-col min-h-screen">
                        <IntraHeader />
                        <main className="flex-1 p-3 pt-14 sm:p-4 sm:pt-14 lg:px-8 lg:py-6 lg:pt-6 bg-white overflow-x-hidden">
                            <div className="w-full max-w-[1200px]">{children}</div>
                        </main>
                        <footer className="border-t border-neutral-100 px-4 lg:px-8 py-4 flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs text-neutral-400">
                                &copy; {new Date().getFullYear()} Ten:One&trade; Intra
                            </p>
                            <p className="text-[10px] sm:text-xs text-neutral-300">
                                Internal Use Only
                            </p>
                        </footer>
                    </div>
                </div>
            </PointProvider>
        </LibraryProvider>
    );
}
