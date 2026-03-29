'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, LogOut, Settings, Menu, X, KeyRound, ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyTenants, fetchMyMembership, addMember } from '@/lib/supabase/wio';
import {
  CATEGORY_CATALOG, MODULE_CATALOG, ALL_MODULE_KEYS, getModulesByCategory,
  loadOrbiConfig, loadAccordionState, saveAccordionState,
  type OrbiConfig,
} from '@/lib/wio-modules';
import type { WIOTenant, WIOMember } from '@/types/wio';

/* ── Mode detection helpers ── */
type OrbiMode = 'demo' | 'saas' | 'master';
function detectMode(tenant: WIOTenant | null, member: WIOMember | null): OrbiMode {
  if (!tenant || tenant.id === 'demo') return 'demo';
  if (member?.role === 'owner' && tenant.slug === 'tenone') return 'master';
  return 'saas';
}

/* ── Context ── */
interface WIOContext {
  tenant: WIOTenant | null;
  member: WIOMember | null;
  refreshTenant?: () => void;
  orbiConfig: OrbiConfig;
  reloadConfig: () => void;
  mode: OrbiMode;
  isDemo: boolean;
  isMaster: boolean;
}
const WIOCtx = createContext<WIOContext>({ tenant: null, member: null, orbiConfig: { enabledModules: [], categories: [] }, reloadConfig: () => {}, mode: 'demo', isDemo: true, isMaster: false });
export const useWIO = () => useContext(WIOCtx);

/* ── Demo tenant builder ── */
function demoTenant(): WIOTenant {
  return {
    id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi',
    domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter',
    maxMembers: 5, modules: ALL_MODULE_KEYS as any,
    isActive: true, logoUrl: null, ownerId: '', createdAt: '', updatedAt: '',
  } as WIOTenant;
}

export default function WIOAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<WIOTenant | null>(null);
  const [member, setMember] = useState<WIOMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orbiConfig, setOrbiConfig] = useState<OrbiConfig>({ enabledModules: [], categories: [] });
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [noWorkspace, setNoWorkspace] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const mode = detectMode(tenant, member);
  const isDemo = mode === 'demo';
  const isMaster = mode === 'master';

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Load orbi config from localStorage
  const reloadConfig = useCallback(() => {
    const cfg = loadOrbiConfig();
    setOrbiConfig(cfg);
  }, []);

  useEffect(() => {
    reloadConfig();
    // Listen for storage changes from settings page
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith('wio-orbi-')) reloadConfig();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [reloadConfig]);

  // Reload config when returning to layout from settings (same tab)
  useEffect(() => { reloadConfig(); }, [pathname, reloadConfig]);

  // Load accordion state
  useEffect(() => {
    const saved = loadAccordionState();
    setOpenCategories(saved);
  }, []);

  // Init tenant
  useEffect(() => {
    const init = async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
          setTenant(demoTenant());
          setMember({ id: 'demo', displayName: '체험 사용자', role: 'member', email: '' } as any);
          setLoading(false);
          return;
        }

        // 내가 소속된 테넌트만 조회 (wio_members → wio_tenants 조인)
        const { data: myMemberships } = await sb.from('wio_members').select('tenant_id').eq('user_id', user.id);

        let tenants: WIOTenant[] = [];
        if (myMemberships && myMemberships.length > 0) {
          const tenantIds = myMemberships.map((m: any) => m.tenant_id);
          const { data: tData } = await sb.from('wio_tenants').select('*').in('id', tenantIds).eq('is_active', true);
          tenants = (tData || []).map((r: Record<string, unknown>) => {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(r)) {
              result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
            }
            return result as unknown as WIOTenant;
          });
        }

        // 소속 워크스페이스 없음 → 온보딩 상태
        if (tenants.length === 0) {
          setNoWorkspace(true);
          setAuthUser(user);
          setLoading(false);
          return;
        }

        // 선택된 테넌트 (멀티테넌트 시)
        const selectedId = typeof window !== 'undefined' ? localStorage.getItem('wio-selected-tenant') : null;
        const t = (selectedId ? tenants.find(tt => tt.id === selectedId) : null) || tenants[0];
        setTenant(t);

        // 멤버십 조회
        const { data: mData } = await sb.from('wio_members').select('*').eq('tenant_id', t.id).eq('user_id', user.id).single();
        let m: WIOMember | null = mData ? (() => {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(mData as Record<string, unknown>)) {
            result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
          }
          return result as unknown as WIOMember;
        })() : null;
        setMember(m);
        setLoading(false);
      } catch {
        setTenant(demoTenant());
        setMember({ id: 'demo', displayName: '체험 사용자', role: 'member', email: '' } as any);
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Orbi 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 온보딩: 워크스페이스 없는 로그인 사용자
  if (noWorkspace && authUser) {
    const handleCreateWorkspace = async () => {
      if (!newWsName.trim()) return;
      setOnboardingLoading(true);
      try {
        const sb = createClient();
        const slug = newWsName.trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
        const { data: newTenant } = await sb.from('wio_tenants').insert({
          name: newWsName.trim(), slug, service_name: newWsName.trim() + ' Office',
          plan: 'free', max_members: 5, modules: ['home','project','talk','people','gpr'],
          is_active: true, primary_color: '#6366F1', powered_by: true,
        }).select().single();
        if (newTenant) {
          await sb.from('wio_members').insert({ tenant_id: newTenant.id, user_id: authUser.id, display_name: authUser.email?.split('@')[0] || '사용자', role: 'owner' });
          window.location.reload();
        }
      } catch { /* ignore */ }
      setOnboardingLoading(false);
    };
    const handleJoinByCode = async () => {
      if (!inviteCode.trim()) return;
      setOnboardingLoading(true);
      try {
        const sb = createClient();
        const { data: t } = await sb.from('wio_tenants').select('id,name').eq('slug', inviteCode.trim().toLowerCase()).single();
        if (t) {
          await sb.from('wio_members').insert({ tenant_id: t.id, user_id: authUser.id, display_name: authUser.email?.split('@')[0] || '사용자', role: 'member' });
          window.location.reload();
        }
      } catch { /* ignore */ }
      setOnboardingLoading(false);
    };
    const handleGoDemo = () => {
      setNoWorkspace(false);
      setTenant(demoTenant());
      setMember({ id: 'demo', displayName: authUser.email?.split('@')[0] || '사용자', role: 'member', email: authUser.email || '' } as any);
    };

    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-4">
              <Settings className="h-7 w-7 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">워크스페이스가 없습니다</h2>
            <p className="text-sm text-slate-500">{authUser.email}으로 로그인됨</p>
          </div>
          <div className="space-y-4">
            {/* 새 워크스페이스 만들기 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">새 워크스페이스 만들기</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="회사/팀 이름" value={newWsName} onChange={e => setNewWsName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                <button onClick={handleCreateWorkspace} disabled={onboardingLoading || !newWsName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition-colors">
                  {onboardingLoading ? '...' : '만들기'}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2">Free 플랜 (5명, 기본 모듈)</p>
            </div>
            {/* 초대 코드 입력 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">초대 코드로 합류</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="워크스페이스 코드 (slug)" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                <button onClick={handleJoinByCode} disabled={onboardingLoading || !inviteCode.trim()}
                  className="px-4 py-2 border border-indigo-500/30 text-indigo-400 text-sm rounded-lg hover:bg-indigo-500/10 disabled:opacity-30 transition-colors">
                  {onboardingLoading ? '...' : '합류'}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2">관리자에게 코드를 받으세요</p>
            </div>
            {/* 데모 */}
            <button onClick={handleGoDemo} className="w-full py-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
              데모 둘러보기 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Settings className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">접근 권한이 없습니다</h2>
          <p className="text-slate-400 text-sm mb-6">Orbi는 등록된 구성원만 사용할 수 있습니다.<br />관리자에게 초대를 요청하세요.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/')} className="px-5 py-2.5 text-sm bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">홈으로</button>
            <button onClick={() => router.push('/wio')} className="px-5 py-2.5 text-sm border border-slate-700 text-slate-300 rounded-lg hover:border-slate-500 transition-colors">Orbi 소개</button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarWidth = isMobile ? 0 : (collapsed ? 56 : 220);
  const hasModulesConfigured = orbiConfig.enabledModules.length > 0;

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push('/wio');
  };

  function toggleCategory(categoryId: string) {
    setOpenCategories(prev => {
      const next = prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId];
      saveAccordionState(next);
      return next;
    });
  }

  // Get category display name from config
  function getCategoryName(categoryId: string): string {
    const cc = orbiConfig.categories.find(c => c.id === categoryId);
    if (cc) return cc.name;
    const cat = CATEGORY_CATALOG.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  }

  // Sort categories by config order
  const sortedCategoryIds = (() => {
    if (orbiConfig.categories.length > 0) {
      return [...orbiConfig.categories].sort((a, b) => a.order - b.order).map(c => c.id);
    }
    return CATEGORY_CATALOG.map(c => c.id);
  })();

  // Build active sidebar items: only enabled modules, grouped by track
  // "home" is always included
  const enabledModuleKeys = hasModulesConfigured
    ? [...new Set(['home', ...orbiConfig.enabledModules])]
    : ['home'];

  const SidebarContent = () => (
    <>
      {/* Logo + Mode Badge */}
      <div className="shrink-0 border-b border-white/5 p-3">
        <Link href="/wio/app" className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white ${isMaster ? 'bg-amber-600' : 'bg-indigo-600'}`}>O</div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 truncate">{isMaster ? 'Ten:One\u2122' : tenant?.name}</span>
                {isDemo && <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">DEMO</span>}
                {isMaster && <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-0.5"><KeyRound size={8} />MASTER</span>}
                {!isDemo && !isMaster && (
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                    tenant?.plan === 'pro' ? 'bg-violet-500/15 text-violet-400 border-violet-500/20' :
                    tenant?.plan === 'enterprise' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                    tenant?.plan === 'growth' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                    'bg-slate-500/15 text-slate-400 border-slate-500/20'
                  }`}>{(tenant?.plan || 'starter').toUpperCase()}</span>
                )}
              </div>
              <div className="text-sm font-bold">{tenant?.serviceName || 'Orbi'}</div>
            </div>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          )}
        </Link>
      </div>

      {/* Module menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        {!hasModulesConfigured ? (
          /* ── No modules configured: show setup prompt ── */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {(!collapsed || isMobile) ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 mb-3">
                  <Settings size={22} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">시스템 세팅이</p>
                <p className="text-sm font-semibold text-slate-300 mb-4">필요합니다</p>
                <Link href="/wio/app/settings"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors">
                  설정 시작 <ChevronRight size={14} />
                </Link>
              </>
            ) : (
              <Link href="/wio/app/settings" className="p-2 text-indigo-400 hover:text-white transition">
                <Settings size={18} />
              </Link>
            )}
          </div>
        ) : (
          /* ── Configured: show modules grouped by category ── */
          sortedCategoryIds.map((categoryId, ci) => {
            const catDef = CATEGORY_CATALOG.find(c => c.id === categoryId);
            if (!catDef) return null;
            const categoryModules = getModulesByCategory(categoryId).filter(m => enabledModuleKeys.includes(m.key));
            if (categoryModules.length === 0) return null;

            const isOpen = openCategories.includes(categoryId);
            const CatIcon = catDef.icon;
            const categoryName = getCategoryName(categoryId);

            return (
              <div key={categoryId} className={ci > 0 ? 'mt-1' : ''}>
                {/* Category header */}
                {(isMobile || !collapsed) ? (
                  <button onClick={() => toggleCategory(categoryId)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${isOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}`}>
                    <span className="flex items-center gap-2">
                      <CatIcon size={15} />
                      {categoryName}
                      <span className="text-[9px] font-normal text-slate-600">{categoryModules.length}</span>
                    </span>
                    <ChevronRight size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                ) : (
                  collapsed && ci > 0 && <div className="mx-2 mb-1 border-t border-white/5" />
                )}

                {/* Module list */}
                {(isOpen || (!isMobile && collapsed)) && (
                  <div className={!isMobile && !collapsed ? 'ml-2 border-l border-white/5 pl-1' : ''}>
                    {categoryModules.map(mod => {
                      const Icon = mod.icon;
                      const isActive = mod.key === 'home'
                        ? pathname === '/wio/app' || pathname === '/wio/app/'
                        : pathname.startsWith(mod.href);
                      return (
                        <Link key={mod.key} href={mod.href}
                          className={`flex items-center rounded-lg py-2 text-sm transition-colors mb-0.5 ${
                            (!isMobile && collapsed) ? 'justify-center px-0' : 'gap-2.5 px-3'
                          } ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                          <Icon size={(!isMobile && collapsed) ? 17 : 15} />
                          {(isMobile || !collapsed) && <span>{mod.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/5 p-2 space-y-0.5">
        {(isMobile || !collapsed) && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-slate-300 truncate">{member?.displayName || '체험 사용자'}</p>
            <p className="text-[10px] text-slate-500 truncate">{(member as any)?.email || (isDemo ? '데모 모드' : isMaster ? '마스터 관리자' : member?.role)}</p>
          </div>
        )}
        {isMaster && (
          <Link href="/wio/app/admin"
            className={`flex items-center rounded-lg py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
            <KeyRound size={15} />{(isMobile || !collapsed) && '관리자'}
          </Link>
        )}
        <Link href="/wio/app/settings"
          className={`flex items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
          <Settings size={15} />{(isMobile || !collapsed) && '설정'}
        </Link>
        {isDemo ? (
          <Link href="/wio/login"
            className={`flex items-center rounded-lg py-2 text-sm text-indigo-400 hover:text-white hover:bg-indigo-600/10 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
            <LogOut size={15} />{(isMobile || !collapsed) && '로그인'}
          </Link>
        ) : (
          <button onClick={handleLogout}
            className={`flex w-full items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
            <LogOut size={15} />{(isMobile || !collapsed) && '로그아웃'}
          </button>
        )}
      </div>
    </>
  );

  return (
    <WIOCtx.Provider value={{
      tenant, member, orbiConfig, reloadConfig, mode, isDemo, isMaster,
      refreshTenant: async () => {
        if (tenant) {
          const { fetchTenant } = await import('@/lib/supabase/wio');
          const t = await fetchTenant(tenant.id);
          if (t) setTenant(t);
        }
      },
    }}>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Mobile header */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-white/5 bg-[#0F0F23] px-4">
            <button onClick={() => setMobileOpen(true)} className="p-1 text-slate-400 hover:text-white"><Menu size={20} /></button>
            <span className="text-sm font-bold">{tenant?.serviceName || 'Orbi'}</span>
            <div className="w-6" />
          </header>
        )}

        {/* Mobile overlay sidebar */}
        {isMobile && (
          <>
            {mobileOpen && <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setMobileOpen(false)} />}
            <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#0F0F23] transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <SidebarContent />
            </aside>
          </>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <>
            <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#0F0F23] transition-all duration-200 ${collapsed ? 'w-14' : 'w-[220px]'}`}>
              <SidebarContent />
            </aside>
            <button onClick={() => setCollapsed(!collapsed)}
              className="fixed z-50 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-white/10 bg-[#0F0F23] text-slate-500 hover:text-white transition-all"
              style={{ left: `${collapsed ? 56 : 220}px`, top: '52px' }}>
              {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
            </button>
          </>
        )}

        {/* Main */}
        <main className="min-h-screen transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px`, paddingTop: isMobile ? '48px' : '0' }}>
          {!isMobile && (
            <div className="flex items-center justify-end gap-3 px-6 py-2 border-b border-white/5">
              <span className="text-xs text-slate-500">{member?.displayName || '체험 사용자'}</span>
              {isDemo ? (
                <Link href="/wio/login" className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">로그인</Link>
              ) : (
                <button onClick={handleLogout} className="text-xs px-3 py-1 border border-slate-700 text-slate-400 rounded-md hover:text-white hover:border-slate-500 transition-colors">로그아웃</button>
              )}
            </div>
          )}
          {/* Demo floating banner */}
          {isDemo && !demoBannerDismissed && (
            <div className="sticky top-0 z-30 mx-4 md:mx-6 mt-2">
              <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 flex items-center gap-3 shadow-lg shadow-indigo-500/20">
                <span className="text-sm">&#x1F3AF;</span>
                <p className="flex-1 text-sm text-white/90">데모 버전입니다 &mdash; 실제 데이터가 아닌 샘플 데이터입니다</p>
                <Link href="/wio/pricing" className="shrink-0 flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80 transition-colors">
                  구독하기 <ExternalLink size={13} />
                </Link>
                <button onClick={() => setDemoBannerDismissed(true)} className="shrink-0 p-1 text-white/60 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </WIOCtx.Provider>
  );
}
