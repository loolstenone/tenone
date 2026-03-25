"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSite } from '@/lib/site-context';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { MadLeagueHeader } from '@/components/MadLeagueHeader';
import { MadLeagueFooter } from '@/components/MadLeagueFooter';
import SmarCommHeader from '@/components/SmarCommHeader';
import { getUser } from '@/lib/smarcomm/auth';
import { createClient } from '@/lib/supabase/client';

// --- SmarComm 전용 로그인 컴포넌트 (완전 분리) ---
function SmarCommLoginForm() {
    // SmarComm은 대시보드와 동일한 인증 체크 (getUser + Supabase 직접) 사용
    // useAuth() (TenOne 인증)을 쓰면 대시보드와 판단이 달라져 리다이렉트 루프 발생
    const { login } = useAuth(); // login 함수만 사용 (Supabase 로그인)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // SmarComm Mock auth 체크
        const u = getUser();
        if (u) { window.location.replace('/dashboard'); return; }

        // Supabase 세션 체크 (타임아웃 5초 — 무한 스피너 방지)
        const sb = createClient();
        const timeout = setTimeout(() => setChecking(false), 5000);
        sb.auth.getUser().then(({ data: { user: sbUser } }) => {
            clearTimeout(timeout);
            if (sbUser) {
                // Supabase 세션 있으면 대시보드로. 대시보드에서도 getUser()로 확인하므로 작동함
                window.location.replace('/dashboard');
            } else {
                setChecking(false);
            }
        }).catch(() => { clearTimeout(timeout); setChecking(false); });
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    // 직접 Supabase OAuth (auth-hub 경유 없이)
    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        const sb = createClient();
        // redirect 목적지를 쿠키에 저장 (auth/callback 서버에서 복원)
        const pendingRedirect = searchParams.get('redirect') || '/';
        if (pendingRedirect !== '/') {
            document.cookie = `auth_redirect=${encodeURIComponent(pendingRedirect)};path=/;max-age=300;SameSite=Lax`;
        }
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error } = await sb.auth.signInWithOAuth({
            provider,
            options: { redirectTo },
        });
        if (data?.url) window.location.href = data.url;
        else if (error) setError(`${provider} 로그인 실패: ${error.message}`);
    };
    const handleGoogle = () => handleSocialLogin('google');
    const handleKakao = () => handleSocialLogin('kakao');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            window.location.href = '/dashboard';
        } catch { setError('이메일 또는 비밀번호가 올바르지 않습니다'); }
    };

    return (
        <>
            <SmarCommHeader />
            <main className="flex min-h-screen items-center justify-center px-5 pt-14">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold">로그인</h1>
                        <p className="text-sm text-neutral-500">SmarComm에 오신 것을 환영합니다</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                className="w-full border border-neutral-200 bg-white py-2.5 px-4 text-sm focus:border-neutral-900 focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">비밀번호</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    className="w-full border border-neutral-200 bg-white py-2.5 px-4 pr-10 text-sm focus:border-neutral-900 focus:outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800">→) 로그인</button>
                    </form>
                    <div className="mt-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">또는</span></div>
                        </div>
                        <div className="space-y-2">
                            <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google로 로그인
                            </button>
                            <button onClick={handleKakao} className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD800]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.64 1.74 4.98 4.38 6.36-.18.66-.66 2.4-.76 2.76-.12.48.18.48.36.36.15-.1 2.34-1.56 3.3-2.22.9.12 1.8.24 2.72.24 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="#191919"/></svg>
                                카카오로 로그인
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 text-center text-sm text-neutral-400">
                        계정이 없으신가요? <Link href="/signup" className="font-medium text-neutral-900">회원가입</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

// --- TenOne / MADLeague 로그인 폼 ---
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const { login, loginWithGoogle, loginWithKakao, isAuthenticated, isLoading, user } = useAuth();
    const { site, siteId, isMadLeague } = useSite();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const canIntraAccess = user?.accountType && user.accountType !== 'member';
            const defaultRedirect = isMadLeague ? '/ml' : canIntraAccess ? '/intra' : '/';
            const autoRedirect = redirectTo !== '/' ? redirectTo : defaultRedirect;
            router.replace(autoRedirect);
        }
    }, [isLoading, isAuthenticated, router, redirectTo, user, isMadLeague]);

    if (isLoading || isAuthenticated) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isMadLeague ? 'bg-[#212121]' : 'bg-white'}`}>
                <div className={`h-8 w-8 border-2 rounded-full animate-spin ${isMadLeague ? 'border-neutral-600 border-t-red-500' : 'border-neutral-200 border-t-neutral-900'}`} />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                const canIntra = result.user?.accountType && result.user.accountType !== 'member';
                const defaultDest = isMadLeague ? '/ml' : canIntra ? '/intra' : '/';
                const dest = redirectTo !== '/' ? redirectTo : defaultDest;
                router.push(dest);
            } else {
                setError(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
                setIsSubmitting(false);
            }
        } catch { setError('로그인 중 오류가 발생했습니다.'); setIsSubmitting(false); }
    };

    // MADLeague 디자인
    if (isMadLeague) {
        return (
            <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2">
                            <span className="bg-[#D32F2F] text-white font-black text-xl px-2 py-0.5">MAD</span>
                            <span className="text-white font-bold text-xl tracking-wider">LEAGUE</span>
                        </div>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">로그인</h2>
                            <p className="text-sm text-neutral-400 mt-1">MAD League 계정에 로그인하세요</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">이메일</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com" required
                                    className="w-full bg-neutral-700 border border-neutral-600 text-white px-4 py-3 text-sm rounded focus:border-red-500 focus:outline-none placeholder:text-neutral-500" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">비밀번호</label>
                                <div className="relative">
                                    <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                                        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                        className="w-full bg-neutral-700 border border-neutral-600 text-white px-4 py-3 pr-12 text-sm rounded focus:border-red-500 focus:outline-none placeholder:text-neutral-500" />
                                    <button type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(prev => !prev); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400">{error}</div>
                            )}

                            <button type="submit" disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-[#D32F2F] px-4 py-3 text-sm font-medium text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isSubmitting ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (<><LogIn className="h-4 w-4" /> 로그인</>)}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-neutral-700 space-y-3">
                            <p className="text-xs text-neutral-500 text-center">또는 소셜 계정으로 로그인</p>
                            <button onClick={loginWithGoogle} type="button"
                                className="w-full flex items-center justify-center gap-3 bg-white px-4 py-3 text-sm font-medium text-neutral-700 rounded hover:bg-neutral-100 transition-colors">
                                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google로 로그인
                            </button>
                            <button onClick={loginWithKakao} type="button"
                                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] rounded hover:bg-[#F5DC00] transition-colors">
                                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.794 5.11 4.504 6.46-.163.6-.593 2.178-.68 2.514-.107.42.155.414.326.301.134-.089 2.13-1.45 3.003-2.042.27.038.546.058.826.076h.042C15.523 18 20 14.537 20 10.309 20 6.081 15.523 3 12 3z" fill="#191919"/></svg>
                                카카오로 로그인
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-neutral-400">
                                계정이 없으신가요? <Link href="/signup" className="text-[#D32F2F] font-medium hover:underline">회원가입</Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-neutral-600 mt-8">&copy; {new Date().getFullYear()} MAD League. Powered by Ten:One™</p>
                </div>
            </div>
        );
    }

    // TenOne 기본 디자인
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-xl md:text-3xl font-bold tracking-wider">Ten:One™</h1>
                </div>

                <div className="border border-neutral-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">로그인</h2>
                        <p className="text-sm text-neutral-500 mt-1">계정에 로그인하세요</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com" required
                                className="w-full border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호</label>
                            <div className="relative">
                                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full border border-neutral-200 px-4 py-3 pr-12 text-sm focus:border-neutral-900 focus:outline-none" />
                                <button type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(prev => !prev); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors">
                                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                        )}

                        <button type="submit" disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (<><LogIn className="h-4 w-4" /> 로그인</>)}
                        </button>
                    </form>

                    {(site?.authMethods?.google || site?.authMethods?.kakao) && (
                    <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
                        <p className="text-xs text-neutral-400 text-center">또는 소셜 계정으로 로그인</p>
                        {site?.authMethods?.google && (
                        <button onClick={loginWithGoogle} type="button"
                            className="w-full flex items-center justify-center gap-3 border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Google로 로그인
                        </button>
                        )}
                        {site?.authMethods?.kakao && (
                            <button onClick={loginWithKakao} type="button"
                                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] hover:bg-[#F5DC00] transition-colors">
                                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.794 5.11 4.504 6.46-.163.6-.593 2.178-.68 2.514-.107.42.155.414.326.301.134-.089 2.13-1.45 3.003-2.042.27.038.546.058.826.076h.042C15.523 18 20 14.537 20 10.309 20 6.081 15.523 3 12 3z" fill="#191919"/></svg>
                                카카오로 로그인
                            </button>
                        )}
                    </div>
                    )}

                    <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-500">
                            계정이 없으신가요? <Link href="/signup" className="text-neutral-900 font-medium hover:underline">회원가입</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-neutral-400 mt-8">&copy; {new Date().getFullYear()} Ten:One™ Universe.</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const { isMadLeague } = useSite();
    const [isSmarComm, setIsSmarComm] = useState<boolean | null>(null);

    useEffect(() => {
        setIsSmarComm(typeof window !== 'undefined' && window.location.hostname.includes('smarcomm'));
    }, []);

    // 도메인 감지 전 — 중립 로딩 (깜빡임 방지)
    if (isSmarComm === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    // SmarComm 도메인 → SmarComm 전용 UI (PublicHeader/Footer 없음)
    if (isSmarComm) {
        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>}>
                <SmarCommLoginForm />
            </Suspense>
        );
    }

    // TenOne / MADLeague
    return (
        <div className={`min-h-screen flex flex-col ${isMadLeague ? 'bg-[#212121]' : 'bg-white'}`}>
            {isMadLeague ? <MadLeagueHeader /> : <PublicHeader />}
            <main className="flex-1 pt-16">
                <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>}>
                    <LoginForm />
                </Suspense>
            </main>
            {isMadLeague ? <MadLeagueFooter /> : <PublicFooter />}
        </div>
    );
}
