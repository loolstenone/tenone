"use client";

import { useState, useCallback } from "react";
import { Lock, Eye, EyeOff, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";

/**
 * 인트라 로그인 / 접근 불가 화면 — 비직원에게 내려가는 유일한 인트라 화면.
 * ⚠️ 인트라 메뉴·목차(IntraSidebar·intra-nav 등)를 import하지 않는다 (기업 보안 — 번들에도 실리지 않게).
 * 로그인 성공 → 새로고침 → 서버(app/intra/layout.tsx)가 직원 여부를 다시 판단.
 */
export function IntraLoginScreen({ noAccess = false }: { noAccess?: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const captcha = useCaptcha();
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
            setSubmitting(true);

            try {
                const sb = createClient();
                // 20초 타임아웃 (cold start 시 10~15초 걸릴 수 있음)
                const signInResult = await Promise.race([
                    sb.auth.signInWithPassword({ email, password, options: { captchaToken: captcha.token } }),
                    new Promise<{ error: { message: string } }>((resolve) =>
                        setTimeout(() => resolve({ error: { message: "timeout" } }), 20000)
                    ),
                ]);

                captcha.reset();
                const authError = signInResult && "error" in signInResult ? signInResult.error : null;

                if (authError) {
                    const msg = authError.message === "timeout"
                        ? "서버 연결에 시간이 걸리고 있습니다. 버튼을 다시 눌러주세요."
                        : "이메일 또는 비밀번호를 확인하세요.";
                    console.error("[Intra Login] error:", authError.message);
                    setError(msg);
                    setSubmitting(false);
                    return;
                }

                // 로그인 성공 → 같은 주소 새로고침 (서버가 직원 여부 판단)
                window.location.href = window.location.pathname;
            } catch (err) {
                console.error("[Intra Login] exception:", err);
                setError("오류가 발생했습니다. 새로고침 후 다시 시도하세요.");
                setSubmitting(false);
            }
        },
        [email, password, captcha],
    );

    const switchAccount = async () => {
        await createClient().auth.signOut({ scope: "local" });
        window.location.reload();
    };

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
                    <h1 className="text-lg font-semibold text-white tracking-tight">Ten:One&trade; Intra</h1>
                    <p className="text-xs text-neutral-500 mt-1">내부 구성원 전용</p>
                </div>

                {/* 접근 불가 메시지 — 로그인했지만 직원이 아님 */}
                {noAccess && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-xs text-red-400">접근 권한이 없습니다. 직원 계정으로 로그인하세요.</p>
                        <button type="button" onClick={switchAccount} className="mt-2 text-[11px] text-neutral-400 underline hover:text-neutral-200">
                            다른 계정으로 로그인
                        </button>
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
                    <CaptchaWidget {...captcha.widgetProps} />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting || !email || !password}
                        className="w-full py-3 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {submitting ? "인증 중..." : "로그인"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/reset-password" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                        비밀번호를 잊으셨나요?
                    </a>
                </div>

                <p className="text-center text-[10px] text-neutral-700 mt-8">
                    Ten:One&trade; Universe Operating System
                </p>
            </div>
        </div>
    );
}
