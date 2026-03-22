'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import { scSignup } from '@/lib/smarcomm/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [lastScan, setLastScan] = useState<{ url: string; score: number } | null>(null);
  const router = useRouter();

  // 가입 직전 스캔 데이터 불러오기
  useEffect(() => {
    const scanLog = JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
    if (scanLog.length > 0) {
      const latest = scanLog[scanLog.length - 1];
      setLastScan(latest);
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
    const success = scSignup(email, password);
    if (!success) { setError('이미 가입된 이메일입니다'); return; }
    router.push('/sc/dashboard');
  };

  const inputClass = "w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none";

  return (
    <>
      <SmarCommHeader />
      <main className="flex min-h-screen items-center justify-center px-5 pt-14">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-text">회원가입</h1>
            <p className="text-sm text-text-sub">이메일만으로 간편하게 가입하세요</p>
          </div>

          {/* 직전 스캔 정보 표시 */}
          {lastScan && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <CheckCircle2 size={16} className="shrink-0 text-success" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text-muted">방금 분석한 사이트</div>
                <div className="text-sm font-medium text-text truncate">{lastScan.url.replace(/^https?:\/\//, '')}</div>
              </div>
              <div className="text-sm font-bold text-text-sub">{lastScan.score}점</div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            {error && <p className="text-xs text-danger">{error}</p>}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">이메일</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">비밀번호</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-sub">비밀번호 확인</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className={`${inputClass} ${passwordConfirm && password !== passwordConfirm ? 'border-danger' : passwordConfirm && password === passwordConfirm ? 'border-success' : ''}`}
                />
              </div>
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1 text-xs text-danger">비밀번호가 일치하지 않습니다</p>
              )}
              {passwordConfirm && password === passwordConfirm && (
                <p className="mt-1 text-xs text-success">비밀번호가 일치합니다</p>
              )}
            </div>
            <button type="submit" className="w-full rounded-full bg-text py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
              {lastScan ? '가입하고 정식 보고서 확인' : '가입하기'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-text-muted">
            이미 계정이 있으신가요? <Link href="/sc/login" className="font-medium text-text">로그인</Link>
          </div>
        </div>
      </main>
    </>
  );
}
