'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Check, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, updatePassword, resetPassword } = useAuth();

  // 두 가지 모드: 이메일 입력(요청) / 새 비밀번호 입력(재설정)
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 상태면 비밀번호 변경 모드
  useEffect(() => {
    if (isAuthenticated) setMode('reset');
  }, [isAuthenticated]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('이메일을 입력해주세요'); return; }
    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);
    if (result.success) {
      setSuccess('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.');
    } else {
      setError(result.error || '요청에 실패했습니다');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);
    if (result.success) {
      setSuccess('비밀번호가 변경되었습니다. 3초 후 이동합니다.');
      setTimeout(() => router.push('/'), 3000);
    } else {
      setError(result.error || '비밀번호 변경에 실패했습니다');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <KeyRound className="mx-auto mb-3 h-10 w-10 text-white/60" />
          <h1 className="text-xl font-bold text-white">
            {mode === 'request' ? '비밀번호 찾기' : '새 비밀번호 설정'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {mode === 'request'
              ? '가입한 이메일을 입력하면 재설정 링크를 보내드립니다'
              : '새로운 비밀번호를 입력해주세요'}
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
        {success && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400 flex items-center gap-2">
            <Check size={16} /> {success}
          </div>
        )}

        {mode === 'request' && !success && (
          <form onSubmit={handleRequest} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              autoComplete="email"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '재설정 이메일 보내기'}
            </button>
          </form>
        )}

        {mode === 'reset' && !success && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="새 비밀번호 (6자 이상)"
                autoComplete="new-password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 pr-10 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
            />
            {password && (
              <div className="space-y-1 text-xs">
                <p className={password.length >= 6 ? 'text-emerald-400' : 'text-neutral-500'}>
                  {password.length >= 6 ? '✓' : '○'} 6자 이상
                </p>
                <p className={password === passwordConfirm && passwordConfirm ? 'text-emerald-400' : 'text-neutral-500'}>
                  {password === passwordConfirm && passwordConfirm ? '✓' : '○'} 비밀번호 일치
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-neutral-500 hover:text-white transition-colors">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
