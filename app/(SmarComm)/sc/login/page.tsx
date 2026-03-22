'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import { scLogin } from '@/lib/smarcomm/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState('/sc/dashboard');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (r) setRedirect(r);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = scLogin(email, password);
    if (!success) { setError('이메일 또는 비밀번호가 올바르지 않습니다'); return; }
    router.push(redirect);
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
            {error && <p className="text-xs text-danger">{error}</p>}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">이메일</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">비밀번호</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full rounded-full bg-text py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
              로그인
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            계정이 없으신가요? <Link href="/sc/signup" className="font-medium text-text">회원가입</Link>
          </div>
        </div>
      </main>
    </>
  );
}
