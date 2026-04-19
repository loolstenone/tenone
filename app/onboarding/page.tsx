"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, AtSign, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<"form" | "verify">("form");
    const [handle, setHandle] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showCPw, setShowCPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [handleChecking, setHandleChecking] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

    // 현재 세션에서 이메일/핸들 프리필
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.replace("/"); return; }

            const { data: member } = await supabase
                .from("members")
                .select("email, handle, onboarding_completed")
                .eq("auth_id", session.user.id)
                .single();

            if (member?.onboarding_completed) { router.replace("/"); return; }

            setEmail(member?.email || session.user.email || "");
            setHandle(member?.handle || "");
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function checkHandle(value: string) {
        const cleaned = value.replace(/[^a-z0-9_.-]/gi, "").toLowerCase();
        setHandle(cleaned);
        if (cleaned.length < 3) { setHandleAvailable(null); return; }

        setHandleChecking(true);
        const { data: { session } } = await supabase.auth.getSession();
        const { data } = await supabase
            .from("members")
            .select("id")
            .eq("handle", cleaned)
            .neq("auth_id", session?.user.id ?? "")
            .maybeSingle();
        setHandleAvailable(!data);
        setHandleChecking(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (handle.length < 3) { setError("핸들은 3자 이상이어야 합니다."); return; }
        if (handleAvailable === false) { setError("이미 사용 중인 핸들입니다."); return; }
        if (password.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
        if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return; }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { setError("세션이 만료되었습니다. 다시 로그인해주세요."); return; }

            // 1. Supabase Auth에 이메일 + 비밀번호 연결
            const { error: updateErr } = await supabase.auth.updateUser({ email, password });
            if (updateErr) { setError(updateErr.message); return; }

            // 2. members 테이블에 핸들 + 온보딩 완료 저장
            await supabase
                .from("members")
                .update({ handle, email, onboarding_completed: true })
                .eq("auth_id", session.user.id);

            // 이메일 변경이 있으면 인증 메일 발송됨 → verify 단계
            const currentEmail = session.user.email || "";
            if (email !== currentEmail) {
                setStep("verify");
            } else {
                router.replace("/");
            }
        } finally {
            setLoading(false);
        }
    }

    if (step === "verify") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-7 w-7 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        <span className="font-medium text-gray-700">{email}</span>로<br />
                        인증 메일을 발송했습니다.<br />
                        링크를 클릭하면 가입이 완료됩니다.
                    </p>
                    <button
                        onClick={() => router.replace("/")}
                        className="text-sm text-amber-600 hover:underline"
                    >
                        나중에 인증하기 (홈으로)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Universe 계정 설정</h1>
                    <p className="text-sm text-gray-500 mt-1">소셜 로그인 외 다른 방법도 등록해두세요</p>
                </div>

                {/* 로그인 방법 안내 카드 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm">
                    <p className="font-semibold text-amber-800 mb-2">✓ 설정 완료 후 3가지 방법으로 로그인 가능합니다</p>
                    <ul className="space-y-1 text-amber-700">
                        <li>• 소셜 로그인 (Google / Kakao)</li>
                        <li>• 이메일 + 비밀번호</li>
                        <li>• 핸들(ID) + 비밀번호</li>
                    </ul>
                    <p className="mt-3 text-amber-700 font-medium border-t border-amber-200 pt-3">
                        🔒 Google·Kakao 계정을 삭제해도 이메일 또는 핸들로 언제든지 로그인할 수 있습니다.
                    </p>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

                    {/* 핸들 */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            나만의 핸들 (Universe ID)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                            <input
                                type="text"
                                value={handle}
                                onChange={e => checkHandle(e.target.value)}
                                placeholder="myhandle"
                                maxLength={30}
                                className="w-full pl-7 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                            {handle.length >= 3 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                                    {handleChecking ? (
                                        <span className="text-gray-400">확인 중</span>
                                    ) : handleAvailable === true ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : handleAvailable === false ? (
                                        <AlertCircle className="h-4 w-4 text-rose-500" />
                                    ) : null}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">영문, 숫자, 밑줄(_), 점(.), 하이픈(-) 사용 가능 · 3~30자</p>
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">비밀번호</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="8자 이상"
                                required
                                minLength={8}
                                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                            <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">비밀번호 확인</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showCPw ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호 재입력"
                                required
                                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                            <button type="button" onClick={() => setShowCPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && (
                            <p className={`text-xs mt-1 ${password === confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                                {password === confirmPassword ? "✓ 일치합니다" : "비밀번호가 일치하지 않습니다"}
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || handleAvailable === false}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                        {loading ? "처리 중..." : "설정 완료"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.replace("/")}
                        className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        나중에 설정하기
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400 mt-4">
                    설정하지 않아도 소셜 로그인은 계속 사용할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
