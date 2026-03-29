'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Users, Plus, Search, Shield,
  ToggleLeft, ToggleRight, Eye, Save, Package,
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';
import { TRACK_CATALOG, getModulesByTrack, ALL_MODULE_KEYS } from '@/lib/wio-modules';

type ViewMode = 'list' | 'detail' | 'create';

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter', price: '4.9만원/월', maxMembers: 20 },
  { value: 'growth', label: 'Growth', price: '14.9만원/월', maxMembers: 100 },
  { value: 'pro', label: 'Pro', price: '39.9만원/월', maxMembers: 999 },
  { value: 'enterprise', label: 'Enterprise', price: '협의', maxMembers: 9999 },
];

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-slate-500/10 text-slate-400',
  growth: 'bg-emerald-500/10 text-emerald-400',
  pro: 'bg-violet-500/10 text-violet-400',
  enterprise: 'bg-amber-500/10 text-amber-400',
};

interface TenantData {
  id: string;
  name: string;
  slug: string;
  serviceName: string;
  domain: string;
  plan: string;
  maxMembers: number;
  memberCount: number;
  isActive: boolean;
  modules: string[];
  createdAt: string;
  members?: { id: string; displayName: string; role: string; email: string; isActive: boolean }[];
}

const MOCK_TENANTS: TenantData[] = [
  { id: 't1', name: 'Ten:One', slug: 'tenone', serviceName: 'Orbi', domain: 'tenone.biz', plan: 'enterprise', maxMembers: 9999, memberCount: 28, isActive: true, modules: ALL_MODULE_KEYS, createdAt: '2024-06-01',
    members: [
      { id: 'm1', displayName: '텐원', role: 'owner', email: 'admin@tenone.biz', isActive: true },
      { id: 'm2', displayName: '김민수', role: 'admin', email: 'minsu@tenone.biz', isActive: true },
      { id: 'm3', displayName: '이서연', role: 'manager', email: 'seoyeon@tenone.biz', isActive: true },
      { id: 'm4', displayName: '박지호', role: 'member', email: 'jiho@tenone.biz', isActive: true },
    ]},
  { id: 't2', name: '스타트업코리아', slug: 'startup-kr', serviceName: 'WorkHub', domain: '', plan: 'pro', maxMembers: 100, memberCount: 45, isActive: true, modules: ['home', 'talk', 'project', 'people', 'gpr', 'sales', 'calendar'], createdAt: '2024-09-15',
    members: [
      { id: 'm5', displayName: '최영진', role: 'owner', email: 'yj@startup.kr', isActive: true },
      { id: 'm6', displayName: '한지원', role: 'admin', email: 'jw@startup.kr', isActive: true },
    ]},
  { id: 't3', name: '뷰티브랜드X', slug: 'beauty-x', serviceName: 'BeautyOps', domain: '', plan: 'growth', maxMembers: 50, memberCount: 12, isActive: true, modules: ['home', 'talk', 'project', 'mkt-campaign', 'mkt-social', 'content'], createdAt: '2024-11-20', members: [] },
  { id: 't4', name: 'HR테크솔루션', slug: 'hrtech', serviceName: 'HRDesk', domain: '', plan: 'starter', maxMembers: 20, memberCount: 5, isActive: true, modules: ['home', 'people', 'recruit', 'attendance', 'payroll'], createdAt: '2025-01-10', members: [] },
];

export default function TenantManagementPage() {
  const { isMaster } = useWIO();
  const searchParams = useSearchParams();
  const [tenants, setTenants] = useState<TenantData[]>(MOCK_TENANTS);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Create form
  const [form, setForm] = useState({
    name: '', slug: '', serviceName: '', domain: '', plan: 'starter', maxMembers: 20, modules: ['home'] as string[], adminEmail: '',
  });

  // Deep link: ?id=xxx
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const t = tenants.find(t => t.id === id);
      if (t) { setSelectedTenant(t); setViewMode('detail'); }
    }
  }, [searchParams, tenants]);

  // Try loading real data
  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data } = await sb.from('wio_tenants').select('*');
        if (data && data.length > 0) {
          const mapped: TenantData[] = data.map((r: any) => ({
            id: r.id, name: r.name, slug: r.slug, serviceName: r.service_name || r.name,
            domain: r.domain || '', plan: r.plan || 'starter', maxMembers: r.max_members || 5,
            memberCount: 0, isActive: r.is_active, modules: r.modules || ['home'],
            createdAt: r.created_at, members: [],
          }));
          setTenants(mapped);
        }
      } catch { /* use mock */ }
    })();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!isMaster) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">접근 권한이 없습니다</h2>
        <Link href="/wio/app" className="text-sm text-indigo-400 hover:underline">홈으로</Link>
      </div>
    );
  }

  const filtered = search
    ? tenants.filter(t => t.name.includes(search) || t.slug.includes(search))
    : tenants;

  function handleCreate() {
    if (!form.name || !form.slug) return;
    const newT: TenantData = {
      id: `t-${Date.now()}`, name: form.name, slug: form.slug,
      serviceName: form.serviceName || form.name, domain: form.domain,
      plan: form.plan, maxMembers: form.maxMembers,
      memberCount: 1, isActive: true, modules: form.modules,
      createdAt: new Date().toISOString().split('T')[0], members: [],
    };
    setTenants(prev => [...prev, newT]);
    setForm({ name: '', slug: '', serviceName: '', domain: '', plan: 'starter', maxMembers: 20, modules: ['home'], adminEmail: '' });
    setViewMode('list');
    showToast('테넌트가 생성되었습니다');
  }

  function toggleModuleInForm(key: string) {
    if (key === 'home') return;
    setForm(prev => ({
      ...prev,
      modules: prev.modules.includes(key)
        ? prev.modules.filter(k => k !== key)
        : [...prev.modules, key],
    }));
  }

  // ── LIST VIEW ──
  if (viewMode === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/wio/app/admin" className="p-1 text-slate-500 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
              <h1 className="text-xl font-bold">테넌트 관리</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-7">총 {tenants.length}개 테넌트</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..."
                className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none w-48" />
            </div>
            <button onClick={() => setViewMode('create')}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition-colors">
              <Plus size={12} /> 테넌트 생성
            </button>
          </div>
        </div>

        {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">{toast}</div>}

        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[t.plan]}`}>{t.plan.toUpperCase()}</span>
                    {!t.isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">정지됨</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t.serviceName} &middot; {t.slug} {t.domain && <>&middot; {t.domain}</>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium">{t.memberCount}명</div>
                  <div className="text-[10px] text-slate-600">/ {t.maxMembers}명</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setSelectedTenant(t); setViewMode('detail'); }}
                    className="p-2 text-slate-500 hover:text-white transition-colors"><Eye size={15} /></button>
                  <button onClick={() => setTenants(prev => prev.map(x => x.id === t.id ? { ...x, isActive: !x.isActive } : x))}
                    className="transition-colors">
                    {t.isActive ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-slate-600" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (viewMode === 'detail' && selectedTenant) {
    const t = selectedTenant;
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => { setViewMode('list'); setSelectedTenant(null); }}
            className="p-1 text-slate-500 hover:text-white transition-colors"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">{t.name}</h1>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_COLORS[t.plan]}`}>{t.plan.toUpperCase()}</span>
        </div>

        {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">{toast}</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 기본 정보 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Building2 size={15} className="text-indigo-400" /> 기본 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-500">Slug</span><div className="font-medium">{t.slug}</div></div>
              <div><span className="text-xs text-slate-500">서비스명</span><div className="font-medium">{t.serviceName}</div></div>
              <div><span className="text-xs text-slate-500">도메인</span><div className="font-medium">{t.domain || '-'}</div></div>
              <div><span className="text-xs text-slate-500">생성일</span><div className="font-medium">{t.createdAt}</div></div>
              <div><span className="text-xs text-slate-500">플랜</span><div className="font-medium">{t.plan.toUpperCase()}</div></div>
              <div><span className="text-xs text-slate-500">최대 멤버</span><div className="font-medium">{t.maxMembers}명</div></div>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Users size={15} className="text-emerald-400" /> 멤버 ({t.members?.length || 0}명)</h3>
            {t.members && t.members.length > 0 ? (
              <div className="space-y-1">
                {t.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors">
                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">{m.displayName.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.displayName}</div>
                      <div className="text-[10px] text-slate-600">{m.email}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${m.role === 'owner' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>{m.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">멤버 정보를 불러올 수 없습니다</p>
            )}
          </div>

          {/* 모듈 설정 */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Package size={15} className="text-violet-400" /> 활성 모듈 ({t.modules.length}개)</h3>
            <div className="flex flex-wrap gap-1.5">
              {t.modules.map(key => (
                <span key={key} className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{key}</span>
              ))}
            </div>
          </div>

          {/* 사용량 */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold mb-3">사용량</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-500">멤버</span>
                <div className="mt-1">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (t.memberCount / t.maxMembers) * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">{t.memberCount} / {t.maxMembers}</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">스토리지</span>
                <div className="mt-1">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '23%' }} />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">2.3GB / 10GB</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">API 호출</span>
                <div className="mt-1">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">4,500 / 10,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CREATE VIEW ──
  if (viewMode === 'create') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setViewMode('list')} className="p-1 text-slate-500 hover:text-white transition-colors"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">새 테넌트 생성</h1>
        </div>

        <div className="max-w-2xl space-y-5">
          {/* 기본 정보 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-semibold">기본 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">조직 이름 *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Slug *</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">서비스명</label>
                <input value={form.serviceName} onChange={e => setForm(p => ({ ...p, serviceName: e.target.value }))} placeholder="Orbi"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">도메인</label>
                <input value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} placeholder="example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 플랜 선택 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-semibold">플랜 선택</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {PLAN_OPTIONS.map(p => (
                <button key={p.value} onClick={() => setForm(prev => ({ ...prev, plan: p.value, maxMembers: p.maxMembers }))}
                  className={`rounded-xl border p-3 text-left transition-all ${form.plan === p.value ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-xs text-slate-500">{p.price}</div>
                  <div className="text-[10px] text-slate-600 mt-1">최대 {p.maxMembers}명</div>
                </button>
              ))}
            </div>
          </div>

          {/* 초기 모듈 선택 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">초기 모듈 ({form.modules.length}개 선택)</h3>
              <button onClick={() => setForm(p => ({ ...p, modules: [...ALL_MODULE_KEYS] }))}
                className="text-xs text-indigo-400 hover:text-indigo-300">전체 선택</button>
            </div>
            {TRACK_CATALOG.map(track => {
              const mods = getModulesByTrack(track.id);
              const TrackIcon = track.icon;
              return (
                <div key={track.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrackIcon size={13} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">{track.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {mods.map(m => {
                      const on = form.modules.includes(m.key);
                      return (
                        <button key={m.key} onClick={() => toggleModuleInForm(m.key)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                            on ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-white/[0.02] text-slate-600 border-white/5 hover:border-white/10'
                          } ${m.key === 'home' ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 관리자 이메일 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
            <h3 className="text-sm font-semibold">초기 관리자</h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">관리자 이메일</label>
              <input value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                type="email" placeholder="admin@example.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setViewMode('list')}
              className="px-5 py-2.5 text-sm text-slate-400 border border-white/10 rounded-lg hover:text-white transition-colors">취소</button>
            <button onClick={handleCreate} disabled={!form.name || !form.slug}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
              <Save size={14} /> 테넌트 생성
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
