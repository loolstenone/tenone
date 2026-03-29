'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { WIOTenant } from '@/types/wio';

export default function WIOLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Multi-tenant selection
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string; plan: string; serviceName: string }[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const sb = createClient();
    await sb.auth.signOut();
    const { data: authData, error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false); return; }

    // Check how many tenants this user belongs to
    try {
      const userId = authData.user?.id;
      if (userId) {
        const { data: memberData } = await sb.from('wio_members').select('tenant_id').eq('user_id', userId);
        if (memberData && memberData.length > 1) {
          // Fetch tenant details for selection
          const tenantIds = memberData.map((m: any) => m.tenant_id);
          const { data: tData } = await sb.from('wio_tenants').select('*').in('id', tenantIds).eq('is_active', true);
          if (tData && tData.length > 1) {
            const mapped = tData.map((r: any) => ({
              id: r.id, name: r.name, slug: r.slug,
              plan: r.plan || 'starter', serviceName: r.service_name || r.name,
            }));
            setTenants(mapped);
            setShowTenantSelector(true);
            setLoading(false);
            return;
          }
        }
      }
    } catch { /* proceed to single tenant */ }

    router.push('/wio/app');
  };

  const handleSelectTenant = (tenantId: string) => {
    // Store selected tenant in localStorage for the layout to pick up
    if (typeof window !== 'undefined') {
      localStorage.setItem('wio-selected-tenant', tenantId);
    }
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

  // Tenant selector UI
  if (showTenantSelector) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/wio" className="text-3xl font-black tracking-tight">
              <span className="text-indigo-400">W</span><span className="text-white">IO</span>
            </Link>
            <p className="text-slate-500 text-sm mt-1">Work In One</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white mb-1">워크스페이스 선택</h2>
            <p className="text-xs text-slate-500">{tenants.length}개의 워크스페이스에 소속되어 있습니다</p>
          </div>

          <div className="space-y-2">
            {tenants.map(t => (
              <button key={t.id} onClick={() => handleSelectTenant(t.id)}
                className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] transition-all text-left group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 font-bold text-sm shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.serviceName} &middot; {t.plan.toUpperCase()}</div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => { setShowTenantSelector(false); setTenants([]); }}
              className="text-xs text-slate-600 hover:text-slate-400">다른 계정으로 로그인</button>
          </div>
        </div>
      </div>
    );
  }

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
