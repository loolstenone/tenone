"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    accentColor?: string;
    defaultTab?: "login" | "signup";
}

export function LoginModal({ isOpen, onClose, accentColor = "#171717", defaultTab = "login" }: LoginModalProps) {
    const { login, register, isAuthenticated } = useAuth();
    const [tab, setTab] = useState<"login" | "signup">(defaultTab);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { if (isAuthenticated && isOpen) onClose(); }, [isAuthenticated, isOpen, onClose]);
    useEffect(() => { if (isOpen) setTab(defaultTab); }, [isOpen, defaultTab]);
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const resetForm = () => { setName(""); setEmail(""); setPassword(""); setPasswordConfirm(""); setError(""); setShowPassword(false); };
    const switchTab = (t: "login" | "signup") => { resetForm(); setTab(t); };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const result = await login(email, password);
            if (!result.success) setError(result.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
        } catch { setError("로그인 중 오류가 발생했습니다."); }
        setIsSubmitting(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) { setError("이름을 입력해주세요"); return; }
        if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다"); return; }
        if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다"); return; }
        setIsSubmitting(true);
        try {
            const result = await register(name, email, password, true);
            if (!result.success) setError(result.error || "회원가입에 실패했습니다.");
        } catch { setError("회원가입 중 오류가 발생했습니다."); }
        setIsSubmitting(false);
    };

    const handleSocialLogin = async (provider: "google" | "kakao") => {
        const sb = createClient();
        const redirectTo = `${window.location.origin}/auth/callback`;
        document.cookie = `auth_redirect=${encodeURIComponent(window.location.pathname)};path=/;max-age=300;SameSite=Lax`;
        const { data, error: oauthError } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (data?.url) window.location.href = data.url;
        else if (oauthError) setError(`${provider} 실패: ${oauthError.message}`);
    };

    if (!isOpen || typeof window === 'undefined') return null;

    const inputClass = "w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <div className="flex gap-4">
                        <button onClick={() => switchTab("login")}
                            className={`text-lg font-bold transition-colors ${tab === "login" ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-500"}`}>
                            로그인
                        </button>
                        <button onClick={() => switchTab("signup")}
                            className={`text-lg font-bold transition-colors ${tab === "signup" ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-500"}`}>
                            회원가입
                        </button>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <p className="text-sm text-neutral-500 mb-5">
                        {tab === "login" ? "계정에 로그인하세요" : "Ten:One™ Universe에 가입하세요"}
                    </p>

                    {/* 소셜 로그인 */}
                    <div className="space-y-2.5 mb-5">
                        <button onClick={() => handleSocialLogin("google")}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Google로 {tab === "login" ? "로그인" : "가입"}
                        </button>
                        <button onClick={() => handleSocialLogin("kakao")}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-900 transition-colors"
                            style={{ backgroundColor: "#FEE500" }}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24l-1.1 4.06c-.1.36.3.65.62.45l4.84-3.2c.42.04.85.06 1.28.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="#3C1E1E"/></svg>
                            카카오로 {tab === "login" ? "로그인" : "가입"}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs text-neutral-400">또는 이메일로</span>
                        <div className="flex-1 h-px bg-neutral-200" />
                    </div>

                    {/* 로그인 폼 */}
                    {tab === "login" && (
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} className={inputClass + " pr-10"} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: accentColor }}>
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><LogIn className="w-4 h-4" /> 로그인</>}
                            </button>
                        </form>
                    )}

                    {/* 가입 폼 */}
                    {tab === "signup" && (
                        <form onSubmit={handleSignup} className="space-y-3">
                            <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                            <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPassword(e.target.value)} className={inputClass + " pr-10"} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                                className={`${inputClass} ${passwordConfirm && password !== passwordConfirm ? 'border-red-400' : ''}`} required />
                            {passwordConfirm && password !== passwordConfirm && <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>}
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: accentColor }}>
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><UserPlus className="w-4 h-4" /> 가입하기</>}
                            </button>
                        </form>
                    )}

                    {/* 탭 전환 링크 */}
                    <p className="text-center text-sm text-neutral-500 mt-4">
                        {tab === "login" ? (
                            <>계정이 없으신가요? <button onClick={() => switchTab("signup")} className="font-semibold text-neutral-900 hover:underline">회원가입</button></>
                        ) : (
                            <>이미 계정이 있으신가요? <button onClick={() => switchTab("login")} className="font-semibold text-neutral-900 hover:underline">로그인</button></>
                        )}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}
