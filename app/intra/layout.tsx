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

                // 1) getUser — 3초 타임아웃
                const userResult = await Promise.race([
                    sb.auth.getUser(),
                    new Promise<null>((r) => setTimeout(() => r(null), 3000)),
                ]);

                const user =
                    userResult && typeof userResult === "object" && "data" in userResult
                        ? (userResult as { data: { user: any } }).data?.user
                        : null;

                if (!user) {
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("login");
                    return;
                }

                // 2) members 권한 확인 — 3초 타임아웃
                const memberResult = await Promise.race([
                    sb
                        .from("members")
                        .select("account_type,role")
                        .eq("auth_id", user.id)
                        .single(),
                    new Promise<null>((r) => setTimeout(() => r(null), 3000)),
                ]);

                const member =
                    memberResult && typeof memberResult === "object" && "data" in memberResult
                        ? (memberResult as { data: any }).data
                        : null;

                if (member && member.account_type !== "member") {
                    sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                    setStatus("ok");
                } else if (member && member.account_type === "member") {
                    // 로그인은 됐지만 일반 회원 → 접근 불가
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("no-access");
                } else {
                    // member 조회 실패 (타임아웃 등)
                    // 캐시가 있었으면 유지, 없었으면 로그인 폼
                    if (!isCached) {
                        sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                        setStatus("login");
                    }
                }
            } catch {
                if (!isCached) {
                    sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                    setStatus("login");
                }
            }
        };

        verify();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 로그인 핸들러 — Supabase 직접 호출, 성공 시 reload
    const handleLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            setSubmitting(true);

            try {
                const sb = createClient();
                const { data, error: authError } = await sb.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError || !data.session) {
                    setError("인증 실패. 이메일과 비밀번호를 확인하세요.");
                    setSubmitting(false);
                    return;
                }

                // 권한 확인
                const { data: member } = await sb
                    .from("members")
                    .select("account_type,role")
                    .eq("auth_id", data.user.id)
                    .single();

                if (member && member.account_type !== "member") {
                    // 검증 캐시 저장 후 페이지 리로드 — 모든 race condition 제거
                    sessionStorage.setItem(INTRA_VERIFIED_KEY, "1");
                    window.location.reload();
                    return; // reload 후 더 이상 실행 안 함
                } else {
                    setError("접근 권한이 없습니다. 직원 계정으로 로그인하세요.");
                    setSubmitting(false);
                }
            } catch {
                setError("오류가 발생했습니다.");
                setSubmitting(false);
            }
        },
        [email, password],
    );

    // 로그아웃 핸들러 (IntraHeader/IntraSidebar에서 auth-context logout 사용 시
    // sessionStorage도 같이 클리어되도록 storage 이벤트 감지)
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            // auth-context가 localStorage에서 유저 정보를 삭제하면 → 로그인 폼으로
            if (e.key === "tenone_auth_user" && !e.newValue) {
                sessionStorage.removeItem(INTRA_VERIFIED_KEY);
                setStatus("login");
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
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
                        <main className="flex-1 p-3 pt-14 sm:p-4 sm:pt-14 lg:px-8 lg:py-6 lg:pt-6 bg-white">
                            <div className="max-w-[1200px]">{children}</div>
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
