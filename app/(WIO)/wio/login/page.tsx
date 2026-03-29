'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function WIOLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const sb = createClient();
    // 기존 세션 해지 후 새 로그인
    await sb.auth.signOut();
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false); return; }
    router.push('/wio/app');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); setLoading(false); return; }
    const sb = createClient();
    const { error: err } = await sb.auth.signUp({
      email, password,
      options: { data: { display_name: name || email.split('@')[0] } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess('가입 완료! 이메일을 확인해주세요.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/wio" className="text-3xl font-black tracking-tight">
            <span className="text-indigo-400">W</span><span className="text-white">IO</span>
          </Link>
          <p className="text-slate-500 text-sm mt-1">Work In One</p>
        </div>

        {/* 탭 */}
        <div className="flex mb-6 border-b border-white/10">
          <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>
            로그인
          </button>
          <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>
            회원가입
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-emerald-400 text-sm mb-4">{success}</p>
            <button onClick={() => { setMode('login'); setSuccess(''); }}
              className="text-sm text-indigo-400 hover:underline">로그인하기</button>
          </div>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="이름"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none" />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="이메일" required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none" />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="비밀번호" required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none" />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/wio" className="text-xs text-slate-600 hover:text-slate-400">WIO 홈으로</Link>
        </div>
      </div>
    </div>
  );
}
