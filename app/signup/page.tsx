"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { validatePassword } from '@/lib/auth-data';
import { UserPlus, Eye, EyeOff, User, Building2 } from 'lucide-react';
import Link from 'next/link';

type AccountKind = 'personal' | 'business';

export default function SignupPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();
    const [accountKind, setAccountKind] = useState<AccountKind>('personal');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace('/');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || isAuthenticated) {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) { setError(pwCheck.error!); return; }

        setIsSubmitting(true);
        setTimeout(() => {
            const result = register(name, email, password);
            if (result.success) { router.push('/profile'); }
            else { setError(result.error || '회원가입에 실패했습니다.'); setIsSubmitting(false); }
        }, 500);
    };

    const inputClass = "w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors";

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white tracking-wider">
                        Ten<span className="text-indigo-500">:</span>One™
                    </h1>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">회원가입</h2>
                        <p className="text-sm text-zinc-400 mt-1">Ten:One™ Universe에 참여하세요</p>
                    </div>

                    {/* 개인 / 기업 선택 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button type="button" onClick={() => setAccountKind('personal')}
                            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                accountKind === 'personal'
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}>
                            <User className="h-4 w-4" /> 개인
                        </button>
                        <button type="button" onClick={() => setAccountKind('business')}
                            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                accountKind === 'business'
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}>
                            <Building2 className="h-4 w-4" /> 기업
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {accountKind === 'business' && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">회사명</label>
                                <input value={company} onChange={e => setCompany(e.target.value)} required placeholder="주식회사 텐원"
                                    className={inputClass} />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                                {accountKind === 'business' ? '담당자명' : '이름'}
                            </label>
                            <input value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동"
                                className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                                {accountKind === 'business' ? '업무용 이메일' : '이메일'}
                            </label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder={accountKind === 'business' ? 'name@company.com' : 'you@example.com'}
                                className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">비밀번호</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="영문+숫자+특수문자 8자 이상"
                                    className={inputClass + " pr-12"} />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(prev => !prev); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">비밀번호 확인</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="비밀번호 재입력"
                                className={inputClass} />
                        </div>

                        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}

                        <button type="submit" disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><UserPlus className="h-4 w-4" /> {accountKind === 'business' ? '기업 가입하기' : '가입하기'}</>}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-sm text-zinc-500">
                            이미 계정이 있으신가요? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">로그인</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
