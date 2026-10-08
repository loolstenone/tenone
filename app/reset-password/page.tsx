'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSite } from '@/lib/site-context';
import { createClient } from '@/lib/supabase/client';
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from '@/components/CaptchaWidget';
import { Eye, EyeOff, Check, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, updatePassword } = useAuth();
  const { siteId } = useSite();
  const captcha = useCaptcha();

  // 두 가지 모드: 이메일 입력(요청) / 새 비밀번호 입력(재설정)
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);

  // 이메일 링크 클릭 시 ?code=XXX (PKCE)를 세션으로 교환 → reset 모드 전환
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setIsExchanging(true);
      const sb = createClient();
      sb.auth.exchangeCodeForSession(code).then(({ error: exchErr }: { error: { message: string } | null }) => {
        if (exchErr) {
          setError(`재설정 링크가 유효하지 않거나 만료되었습니다: ${exchErr.message}`);
        } else {
          setMode('reset');
          // URL에서 code 제거 (새로고침 시 재사용 방지)
          window.history.replaceState({}, '', window.location.pathname);
        }
        setIsExchanging(false);
      });
    }
  }, []);

  // 로그인 상태면 비밀번호 변경 모드
  useEffect(() => {
    if (isAuthenticated) setMode('reset');
  }, [isAuthenticated]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('이메일을 입력해주세요'); return; }
    if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
    setIsSubmitting(true);
    // 로그인 도움 — 소셜 가입이면 가입 방식 안내, 이메일 가입이면 재설정 링크를 그 메일함으로만 (/api/auth/login-help)
    const res = await fetch('/api/auth/login-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), captchaToken: captcha.token, site: siteId }),
    }).catch(() => null);
    captcha.reset();
    setIsSubmitting(false);
    const data = await res?.json().catch(() => null) as { error?: string } | null;
    if (res?.ok) {
      setSuccess('입력한 이메일로 안내를 보냈습니다. 메일이 오지 않으면 스팸함을 확인하거나, 다른 이메일 또는 Google·카카오 로그인으로 시도해 보세요.');
    } else {
      setError(data?.error || '요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
            {mode === 'request' ? '로그인 도움' : '새 비밀번호 설정'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {mode === 'request'
              ? '가입할 때 쓴 이메일을 입력하면, 그 메일함으로 로그인 방법을 안내해 드립니다'
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
            <CaptchaWidget {...captcha.widgetProps} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '안내 메일 받기'}
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
