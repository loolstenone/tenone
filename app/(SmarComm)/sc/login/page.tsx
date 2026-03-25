'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirect, setRedirect] = useState('/sc/dashboard');
  const { login, loginWithGoogle, loginWithKakao, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    // SmarComm 내부 경로만 허용, 외부 경로는 무시
    if (r && r.startsWith('/sc/')) {
      setRedirect(r);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // SmarComm 대시보드로 (middleware가 /dashboard → /sc/dashboard로 rewrite)
      window.location.href = '/dashboard';
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.tenone.biz';
      const returnDomain = window.location.hostname;
      const state = crypto.randomUUID();
      sessionStorage.setItem('auth_state', state);
      window.location.href = `${authDomain}/auth-hub/login?provider=google&returnDomain=${encodeURIComponent(returnDomain)}&returnPath=${encodeURIComponent('/dashboard')}&state=${state}`;
    } catch { setError('Google 로그인에 실패했습니다'); }
  };

  const handleKakao = async () => {
    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.tenone.biz';
      const returnDomain = window.location.hostname;
      const state = crypto.randomUUID();
      sessionStorage.setItem('auth_state', state);
      window.location.href = `${authDomain}/auth-hub/login?provider=kakao&returnDomain=${encodeURIComponent(returnDomain)}&returnPath=${encodeURIComponent('/dashboard')}&state=${state}`;
    } catch { setError('카카오 로그인에 실패했습니다'); }
  };

  return (
    <>
      <SmarCommHeader />
      <main className="flex min-h-screen items-center justify-center px-5 pt-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-text">로그인</h1>
            <p className="text-sm text-text-sub">SmarComm에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">이메일</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">비밀번호</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
              {isSubmitting ? '로그인 중...' : '→) 로그인'}
            </button>
          </form>

          {/* 소셜 로그인 */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">또는 소셜 계정으로 로그인</span></div>
            </div>
            <div className="space-y-2">
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google로 로그인
              </button>
              <button onClick={handleKakao}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD800] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.64 1.74 4.98 4.38 6.36-.18.66-.66 2.4-.76 2.76-.12.48.18.48.36.36.15-.1 2.34-1.56 3.3-2.22.9.12 1.8.24 2.72.24 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="#191919"/></svg>
                카카오로 로그인
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-neutral-400">
            계정이 없으신가요? <Link href="/sc/signup" className="font-medium text-neutral-900">회원가입</Link>
          </div>
        </div>
      </main>
    </>
  );
}
