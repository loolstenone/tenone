'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  KeyRound, Building2, Users, Bot, Activity, Plus,
  RefreshCw, Eye, ToggleLeft, ToggleRight, ArrowRight,
  Shield, TrendingUp, BarChart3, Clock,
} from 'lucide-react';
import { useWIO } from '../layout';
import { createClient } from '@/lib/supabase/client';

/* ── Mock data for initial development ── */
const MOCK_TENANTS = [
  { id: 't1', name: 'Ten:One', slug: 'tenone', plan: 'enterprise', memberCount: 28, isActive: true, createdAt: '2024-06-01' },
  { id: 't2', name: '스타트업코리아', slug: 'startup-kr', plan: 'pro', memberCount: 45, isActive: true, createdAt: '2024-09-15' },
  { id: 't3', name: '뷰티브랜드X', slug: 'beauty-x', plan: 'growth', memberCount: 12, isActive: true, createdAt: '2024-11-20' },
  { id: 't4', name: 'HR테크솔루션', slug: 'hrtech', plan: 'starter', memberCount: 5, isActive: true, createdAt: '2025-01-10' },
  { id: 't5', name: '크리에이티브랩', slug: 'creative-lab', plan: 'pro', memberCount: 22, isActive: false, createdAt: '2024-08-05' },
];

const MOCK_AGENTS = [
  { id: 'a1', name: 'Badak', description: 'HR/네트워킹 에이전트', isActive: true, messageCount: 1247 },
  { id: 'a2', name: 'RooK', description: 'AI 크리에이터 에이전트', isActive: true, messageCount: 893 },
  { id: 'a3', name: 'LUKI', description: 'AI 그룹 매니저', isActive: true, messageCount: 2105 },
  { id: 'a4', name: 'SmarComm', description: '마케팅 커뮤니케이션', isActive: false, messageCount: 456 },
];

const MOCK_RECENT_SIGNUPS = [
  { name: '디지털에이전시Y', plan: 'starter', date: '2025-03-25' },
  { name: '푸드테크Z', plan: 'growth', date: '2025-03-22' },
  { name: '에듀플랫폼', plan: 'starter', date: '2025-03-18' },
];

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-slate-500/10 text-slate-400',
  growth: 'bg-emerald-500/10 text-emerald-400',
  pro: 'bg-violet-500/10 text-violet-400',
  enterprise: 'bg-amber-500/10 text-amber-400',
};

export default function AdminPage() {
  const { tenant, member, isMaster } = useWIO();
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '', plan: 'starter', adminEmail: '' });

  // Try to fetch real data from Supabase
  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data: tData } = await sb.from('wio_tenants').select('*');
        if (tData && tData.length > 0) {
          const mapped = tData.map((r: any) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            plan: r.plan || 'starter',
            memberCount: 0,
            isActive: r.is_active,
            createdAt: r.created_at,
          }));
          setTenants(mapped);
        }
      } catch { /* use mock */ }

      try {
        const sb = createClient();
        const { data: aData } = await sb.from('agent_profiles').select('*');
        if (aData && aData.length > 0) {
          const mapped = aData.map((r: any) => ({
            id: r.id,
            name: r.name || r.display_name,
            description: r.description || r.system_prompt?.slice(0, 40) || '-',
            isActive: r.is_active ?? true,
            messageCount: 0,
          }));
          setAgents(mapped);
        }
      } catch { /* use mock */ }
    })();
  }, []);

  if (!isMaster) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 mb-4">마스터 관리자만 접근할 수 있습니다.</p>
        <Link href="/wio/app" className="text-sm text-indigo-400 hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.isActive).length;
  const totalMembers = tenants.reduce((sum, t) => sum + t.memberCount, 0);
  const activeAgents = agents.filter(a => a.isActive).length;

  function toggleTenantActive(id: string) {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  }

  function toggleAgentActive(id: string) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }

  function handleCreateTenant() {
    if (!newTenant.name || !newTenant.slug) return;
    setTenants(prev => [...prev, {
      id: `t-${Date.now()}`,
      name: newTenant.name,
      slug: newTenant.slug,
      plan: newTenant.plan,
      memberCount: 1,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    }]);
    setNewTenant({ name: '', slug: '', plan: 'starter', adminEmail: '' });
    setShowNewTenantModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound size={20} className="text-amber-400" />
            <h1 className="text-xl font-bold">마스터 관리자</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">WIO 전체 시스템 관리 대시보드</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: Building2, label: '전체 테넌트', value: totalTenants, sub: `${activeTenants} 활성`, color: 'text-indigo-400' },
          { icon: Users, label: '전체 사용자', value: totalMembers, sub: '등록 사용자', color: 'text-emerald-400' },
          { icon: Bot, label: '에이전트', value: agents.length, sub: `${activeAgents} 활성`, color: 'text-violet-400' },
          { icon: TrendingUp, label: '월 활성 사용자', value: Math.round(totalMembers * 0.72), sub: '최근 30일', color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-slate-500">{s.label}</span></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 테넌트 관리 */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Building2 size={15} className="text-indigo-400" /> 테넌트 관리
            </span>
            <div className="flex items-center gap-2">
              <Link href="/wio/app/admin/tenants" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                상세 관리 <ArrowRight size={12} />
              </Link>
              <button onClick={() => setShowNewTenantModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition-colors">
                <Plus size={12} /> 새 테넌트
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/5">
                  <th className="text-left px-5 py-2.5 font-medium">테넌트</th>
                  <th className="text-left px-3 py-2.5 font-medium">플랜</th>
                  <th className="text-right px-3 py-2.5 font-medium">멤버</th>
                  <th className="text-center px-3 py-2.5 font-medium">상태</th>
                  <th className="text-left px-3 py-2.5 font-medium">생성일</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[10px] text-slate-600">{t.slug}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_COLORS[t.plan] || PLAN_COLORS.starter}`}>
                        {t.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right px-3 py-3 text-slate-400">{t.memberCount}</td>
                    <td className="text-center px-3 py-3">
                      <button onClick={() => toggleTenantActive(t.id)} className="transition-colors">
                        {t.isActive
                          ? <ToggleRight size={20} className="text-emerald-400" />
                          : <ToggleLeft size={20} className="text-slate-600" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{t.createdAt}</td>
                    <td className="px-3 py-3">
                      <Link href={`/wio/app/admin/tenants?id=${t.id}`} className="p-1 text-slate-600 hover:text-white transition-colors">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* 최근 가입 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Clock size={15} className="text-emerald-400" /> 최근 가입 테넌트
              </span>
            </div>
            <div className="p-3 space-y-1">
              {MOCK_RECENT_SIGNUPS.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="text-sm">{s.name}</div>
                    <div className="text-[10px] text-slate-600">{s.date}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[s.plan]}`}>{s.plan.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 데모 관리 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 size={15} className="text-amber-400" /> 데모 관리
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">이번 달 데모 접속</span>
                <span className="font-bold text-white">347회</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">전환율</span>
                <span className="font-bold text-emerald-400">12.4%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">평균 체류 시간</span>
                <span className="font-bold text-white">8분 32초</span>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-white/10 rounded-lg hover:text-white hover:border-white/20 transition-colors">
                <RefreshCw size={12} /> 데모 데이터 리셋
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 에이전트 현황 */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Bot size={15} className="text-violet-400" /> 에이전트 현황
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map(a => (
            <div key={a.id} className={`rounded-xl border p-4 transition-all ${a.isActive ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{a.name}</span>
                <button onClick={() => toggleAgentActive(a.id)} className="transition-colors">
                  {a.isActive
                    ? <ToggleRight size={18} className="text-emerald-400" />
                    : <ToggleLeft size={18} className="text-slate-600" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">{a.description}</p>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Activity size={11} />
                <span>메시지 {a.messageCount.toLocaleString()}건</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Tenant Modal */}
      {showNewTenantModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowNewTenantModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F23] p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={18} className="text-indigo-400" /> 새 테넌트 생성</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">조직 이름</label>
                  <input value={newTenant.name} onChange={e => setNewTenant(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="예: 스타트업코리아" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Slug</label>
                  <input value={newTenant.slug} onChange={e => setNewTenant(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="예: startup-kr" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">플랜</label>
                  <select value={newTenant.plan} onChange={e => setNewTenant(p => ({ ...p, plan: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                    <option value="starter" className="bg-[#0F0F23]">Starter (4.9만원/월)</option>
                    <option value="growth" className="bg-[#0F0F23]">Growth (14.9만원/월)</option>
                    <option value="pro" className="bg-[#0F0F23]">Pro (39.9만원/월)</option>
                    <option value="enterprise" className="bg-[#0F0F23]">Enterprise (협의)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">관리자 이메일</label>
                  <input value={newTenant.adminEmail} onChange={e => setNewTenant(p => ({ ...p, adminEmail: e.target.value }))}
                    type="email" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="admin@example.com" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowNewTenantModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-white/10 rounded-lg hover:text-white transition-colors">취소</button>
                <button onClick={handleCreateTenant} disabled={!newTenant.name || !newTenant.slug}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">생성</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
