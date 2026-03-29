"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function DaminPage() {
  const { isAuthenticated, isLoading, canAccessIntra } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && canAccessIntra) {
      router.replace("/intra");
    }
  }, [isLoading, isAuthenticated, canAccessIntra, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const sb = createClient();
      const { error: authError } = await sb.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("인증 실패. 이메일과 비밀번호를 확인하세요.");
      } else {
        router.replace("/intra");
      }
    } catch {
      setError("오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  const handleOAuth = async (provider: "google" | "kakao") => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/intra` },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 mb-4">
            <Shield className="h-6 w-6 text-neutral-400" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Ten:One™</h1>
          <p className="text-xs text-neutral-500 mt-1">내부 구성원 전용</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full py-3 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock size={14} />
            {submitting ? "인증 중..." : "로그인"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-neutral-600">또는</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* OAuth */}
        <div className="space-y-2">
          <button
            onClick={() => handleOAuth("google")}
            className="w-full py-2.5 border border-white/10 rounded-lg text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
          >
            Google 계정으로 로그인
          </button>
          <button
            onClick={() => handleOAuth("kakao")}
            className="w-full py-2.5 border border-white/10 rounded-lg text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
          >
            카카오 계정으로 로그인
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-neutral-700 mt-8">
          Ten:One™ Universe Operating System
        </p>
      </div>
    </div>
  );
}
