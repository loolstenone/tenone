"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { validatePassword } from '@/lib/auth-data';
import { UserPlus, Eye, EyeOff, User, Building2, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useSite } from '@/lib/site-context';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import SmarCommHeader from '@/components/SmarCommHeader';
import { createClient } from '@/lib/supabase/client';

// --- SmarComm 전용 회원가입 컴포넌트 ---
function SmarCommSignupForm() {
    const { register, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastScan, setLastScan] = useState<{ url: string; score: number } | null>(null);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading) {
            try {
                const scanLog = JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
                if (scanLog.length > 0) setLastScan(scanLog[scanLog.length - 1]);
            } catch {}
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return; }
        if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return; }
        if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
        setIsSubmitting(true);
        try {
            const result = await register(email.split('@')[0], email, password, false);
            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || '회원가입에 실패했습니다');
                setIsSubmitting(false);
            }
        } catch { setError('회원가입 중 오류가 발생했습니다'); setIsSubmitting(false); }
    };

    // 직접 Supabase OAuth (auth-hub 경유 없이)
    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        const sb = createClient();
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error: oauthError } = await sb.auth.signInWithOAuth({
            provider,
            options: { redirectTo },
        });
        if (data?.url) window.location.href = data.url;
        else if (oauthError) setError(`${provider} 가입 실패: ${oauthError.message}`);
    };
    const handleGoogle = () => handleSocialLogin('google');
    const handleKakao = () => handleSocialLogin('kakao');

    const inputClass = "w-full border border-neutral-200 bg-white py-2.5 px-4 text-sm focus:border-neutral-900 focus:outline-none";

    return (
        <>
            <SmarCommHeader />
            <main className="flex min-h-screen items-center justify-center px-5 pt-14">
                <div className="w-full max-w-sm">
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-2xl font-bold">회원가입</h1>
                        <p className="text-sm text-neutral-500">이메일만으로 간편하게 가입하세요</p>
                    </div>

                    {lastScan && (
                        <div className="mb-5 flex items-center gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3">
                            <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-neutral-400">방금 분석한 사이트</div>
                                <div className="text-sm font-medium text-neutral-900 truncate">{lastScan.url.replace(/^https?:\/\//, '')}</div>
                            </div>
                            <div className="text-sm font-bold text-neutral-500">{lastScan.score}점</div>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-3">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">비밀번호</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6자 이상" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">비밀번호 확인</label>
                            <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="비밀번호 재입력"
                                className={`${inputClass} ${passwordConfirm && password !== passwordConfirm ? 'border-red-400' : passwordConfirm && password === passwordConfirm ? 'border-green-400' : ''}`} />
                            {passwordConfirm && password !== passwordConfirm && <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다</p>}
                            {passwordConfirm && password === passwordConfirm && <p className="mt-1 text-xs text-green-600">비밀번호가 일치합니다</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting}
                            className="w-full bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
                            {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (lastScan ? '가입하고 정식 보고서 확인' : '가입하기')}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">또는</span></div>
                        </div>
                        <div className="space-y-2">
                            <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google로 가입
                            </button>
                            <button onClick={handleKakao} className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD800]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.64 1.74 4.98 4.38 6.36-.18.66-.66 2.4-.76 2.76-.12.48.18.48.36.36.15-.1 2.34-1.56 3.3-2.22.9.12 1.8.24 2.72.24 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="#191919"/></svg>
                                카카오로 가입
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 text-center text-sm text-neutral-400">
                        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-neutral-900">로그인</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

type AccountKind = 'personal' | 'business';

const quotes = [
    "본질에 집중하라. 나머지는 따라온다.",
    "어설픈 완벽주의는 일을 출발시키지 못한다.",
    "실현되지 않으면 아이디어가 아니다.",
    "길바닥 동전은 먼저 줍는 사람이 임자다.",
    "빠르게 실패하고, 더 빠르게 배워라.",
    "약한 연결고리가 강력한 기회를 만든다.",
    "먼저 움직이는 사람이 판을 바꾼다.",
    "끝까지 해내는 사람이 결국 이긴다.",
];

const specialties = [
    { id: 'planning', label: '기획/전략' },
    { id: 'design', label: '디자인' },
    { id: 'development', label: '개발' },
    { id: 'marketing', label: '마케팅/광고' },
    { id: 'content', label: '콘텐츠/미디어' },
    { id: 'communication', label: '커뮤니케이션/PR' },
    { id: 'business', label: '경영/비즈니스' },
    { id: 'hr', label: 'HR/조직관리' },
    { id: 'data', label: '데이터/AI' },
    { id: 'other', label: '기타' },
];

const wantToDo = [
    { id: 'project', label: '프로젝트 참여', desc: '텐원의 프로젝트에 함께하고 싶어요' },
    { id: 'brand', label: '브랜드 운영', desc: '유니버스 안에서 브랜드를 만들거나 합류' },
    { id: 'networking', label: '네트워킹', desc: '다양한 분야의 사람들과 연결' },
    { id: 'learning', label: '방법론 학습', desc: 'VRIEF, GPR 등 텐원의 프레임워크 배우기' },
    { id: 'mentoring', label: '멘토링/코칭', desc: '경험을 공유하거나 배우고 싶어요' },
    { id: 'investing', label: '투자/후원', desc: '텐원의 비전에 투자하고 싶어요' },
];

const inputClass = "w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400 bg-white";
const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

// 도메인 감지 래퍼 (Hooks 순서 충돌 방지)
export default function SignupPageRouter() {
    const [isSmarComm, setIsSmarComm] = useState<boolean | null>(null);
    useEffect(() => {
        setIsSmarComm(typeof window !== 'undefined' && window.location.hostname.includes('smarcomm'));
    }, []);

    if (isSmarComm === null) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;
    }
    if (isSmarComm) {
        return <SmarCommSignupForm />;
    }
    return <TenOneSignupPage />;
}

function TenOneSignupPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace('/');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || isAuthenticated) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>;
    }

    // Supabase OAuth
    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        const sb = createClient();
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error: oauthError } = await sb.auth.signInWithOAuth({
            provider,
            options: { redirectTo },
        });
        if (data?.url) window.location.href = data.url;
        else if (oauthError) setError(`${provider} 가입 실패: ${oauthError.message}`);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('이름을 입력해주세요'); return; }
        if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return; }
        if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return; }
        if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
        setIsSubmitting(true);
        try {
            const result = await register(name, email, password, true);
            if (result.success) { router.push('/'); }
            else { setError(result.error || '회원가입에 실패했습니다'); setIsSubmitting(false); }
        } catch { setError('회원가입 중 오류가 발생했습니다'); setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicHeader />
            <div className="flex-1 flex items-center justify-center px-5 py-16 mt-16">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link href="/" className="text-xl md:text-3xl font-bold tracking-wider hover:opacity-80 transition-opacity">Ten:One™</Link>
                        <p className="text-sm text-neutral-500 mt-2 italic">&ldquo;{randomQuote}&rdquo;</p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold">회원가입</h2>
                        <p className="text-sm text-neutral-500 mt-1">Ten:One™ Universe에 가입하세요</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">이름</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">비밀번호</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="6자 이상" className={inputClass + " pr-12"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900">
                                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500">비밀번호 확인</label>
                            <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required
                                placeholder="비밀번호 재입력"
                                className={`${inputClass} ${passwordConfirm && password !== passwordConfirm ? 'border-red-400' : passwordConfirm && password === passwordConfirm ? 'border-green-400' : ''}`} />
                            {passwordConfirm && password !== passwordConfirm && <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting}
                            className="w-full bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
                            {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : '가입하기'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">또는 소셜 계정으로 가입</span></div>
                        </div>
                        <div className="space-y-2">
                            <button onClick={() => handleSocialLogin('google')} type="button"
                                className="w-full flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google로 가입
                            </button>
                            <button onClick={() => handleSocialLogin('kakao')} type="button"
                                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD800]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.64 1.74 4.98 4.38 6.36-.18.66-.66 2.4-.76 2.76-.12.48.18.48.36.36.15-.1 2.34-1.56 3.3-2.22.9.12 1.8.24 2.72.24 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="#191919"/></svg>
                                카카오로 가입
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 text-center text-sm text-neutral-400">
                        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-neutral-900">로그인</Link>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
