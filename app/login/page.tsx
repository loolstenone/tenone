"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogIn, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const { login, isAuthenticated, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, redirectTo]);

    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        setTimeout(() => {
            const result = login(email, password);
            if (result.success) {
                router.push(redirectTo);
            } else {
                setError(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
                setIsSubmitting(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white tracking-wider">
                        Ten<span className="text-indigo-500">:</span>One™
                    </h1>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">Sign In</h2>
                        <p className="text-sm text-zinc-400 mt-1">Enter your credentials to access the Office</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@tenone.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(prev => !prev); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-sm text-zinc-500">
                            계정이 없으신가요? <a href="/signup" className="text-indigo-400 hover:text-indigo-300">회원가입</a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-zinc-600 mt-8">
                    &copy; 2025 Ten:One™ Universe. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
