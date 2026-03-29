'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, LogOut, Settings, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyTenants, fetchMyMembership, addMember } from '@/lib/supabase/wio';
import {
  TRACK_CATALOG, MODULE_CATALOG, getModulesByTrack,
  loadOrbiConfig, loadAccordionState, saveAccordionState,
  type OrbiConfig,
} from '@/lib/wio-modules';
import type { WIOTenant, WIOMember } from '@/types/wio';

/* ── Context ── */
interface WIOContext {
  tenant: WIOTenant | null;
  member: WIOMember | null;
  refreshTenant?: () => void;
  orbiConfig: OrbiConfig;
  reloadConfig: () => void;
}
const WIOCtx = createContext<WIOContext>({ tenant: null, member: null, orbiConfig: { enabledModules: [], tracks: [] }, reloadConfig: () => {} });
export const useWIO = () => useContext(WIOCtx);

/* ── Demo tenant builder ── */
function demoTenant(): WIOTenant {
  return {
    id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi',
    domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter',
    maxMembers: 5, modules: MODULE_CATALOG.map(m => m.key) as any,
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
  const [openTracks, setOpenTracks] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orbiConfig, setOrbiConfig] = useState<OrbiConfig>({ enabledModules: [], tracks: [] });

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
    setOpenTracks(saved);
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

        // 직접 Supabase 쿼리 — wio.ts의 별도 인스턴스 대신 같은 클라이언트 사용
        let tenants: WIOTenant[] = [];
        try {
          const { data: tData } = await sb.from('wio_tenants').select('*').eq('is_active', true);
          tenants = (tData || []).map((r: Record<string, unknown>) => {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(r)) {
              result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
            }
            return result as unknown as WIOTenant;
          });
        } catch { /* DB table missing */ }

        if (tenants.length === 0) {
          try {
            const defaultTenantId = 'a0000000-0000-0000-0000-000000000001';
            await sb.from('wio_members').insert({ tenant_id: defaultTenantId, user_id: user.id, display_name: user.email?.split('@')[0] || '사용자', role: 'member' });
            const { data: tData2 } = await sb.from('wio_tenants').select('*').eq('is_active', true);
            tenants = (tData2 || []).map((r: Record<string, unknown>) => {
              const result: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(r)) {
                result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
              }
              return result as unknown as WIOTenant;
            });
          } catch { /* ignore */ }
        }

        if (tenants.length === 0) {
          setTenant(demoTenant());
          setMember({ id: 'demo', displayName: user.email?.split('@')[0] || '사용자', role: 'admin', email: user.email || '' } as any);
          setLoading(false);
          return;
        }

        const t = tenants[0];
        setTenant(t);

        // 같은 sb 클라이언트로 멤버십 조회
        const { data: mData } = await sb.from('wio_members').select('*').eq('tenant_id', t.id).eq('user_id', user.id).single();
        let m: WIOMember | null = mData ? (() => {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(mData as Record<string, unknown>)) {
            result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
          }
          return result as unknown as WIOMember;
        })() : null;

        if (!m) {
          await sb.from('wio_members').insert({ tenant_id: t.id, user_id: user.id, display_name: user.email?.split('@')[0] || '사용자', role: 'member' });
          const { data: mData2 } = await sb.from('wio_members').select('*').eq('tenant_id', t.id).eq('user_id', user.id).single();
          m = mData2 ? (() => {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(mData2 as Record<string, unknown>)) {
              result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
            }
            return result as unknown as WIOMember;
          })() : null;
        }
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

  function toggleTrack(trackId: string) {
    setOpenTracks(prev => {
      const next = prev.includes(trackId) ? prev.filter(t => t !== trackId) : [...prev, trackId];
      saveAccordionState(next);
      return next;
    });
  }

  // Get track display name from config
  function getTrackName(trackId: string): string {
    const tc = orbiConfig.tracks.find(t => t.id === trackId);
    if (tc) return tc.name;
    const cat = TRACK_CATALOG.find(t => t.id === trackId);
    return cat?.name || trackId;
  }

  // Sort tracks by config order
  const sortedTrackIds = (() => {
    if (orbiConfig.tracks.length > 0) {
      return [...orbiConfig.tracks].sort((a, b) => a.order - b.order).map(t => t.id);
    }
    return TRACK_CATALOG.map(t => t.id);
  })();

  // Build active sidebar items: only enabled modules, grouped by track
  // "home" is always included
  const enabledModuleKeys = hasModulesConfigured
    ? [...new Set(['home', ...orbiConfig.enabledModules])]
    : ['home'];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="shrink-0 border-b border-white/5 p-3">
        <Link href="/wio/app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">O</div>
          {(!collapsed || isMobile) && (
            <div className="flex-1">
              <div className="text-xs text-slate-500">{tenant?.name}</div>
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
          /* ── Configured: show modules grouped by track ── */
          sortedTrackIds.map((trackId, ti) => {
            const catTrack = TRACK_CATALOG.find(t => t.id === trackId);
            if (!catTrack) return null;
            const trackModules = getModulesByTrack(trackId).filter(m => enabledModuleKeys.includes(m.key));
            if (trackModules.length === 0) return null;

            const isOpen = openTracks.includes(trackId);
            const TrackIcon = catTrack.icon;
            const trackName = getTrackName(trackId);

            return (
              <div key={trackId} className={ti > 0 ? 'mt-1' : ''}>
                {/* Track header */}
                {(isMobile || !collapsed) ? (
                  <button onClick={() => toggleTrack(trackId)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${isOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}`}>
                    <span className="flex items-center gap-2">
                      <TrackIcon size={15} />
                      {trackName}
                      <span className="text-[9px] font-normal text-slate-600">{trackModules.length}</span>
                    </span>
                    <ChevronRight size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                ) : (
                  collapsed && ti > 0 && <div className="mx-2 mb-1 border-t border-white/5" />
                )}

                {/* Module list */}
                {(isOpen || (!isMobile && collapsed)) && (
                  <div className={!isMobile && !collapsed ? 'ml-2 border-l border-white/5 pl-1' : ''}>
                    {trackModules.map(mod => {
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
            <p className="text-[10px] text-slate-500 truncate">{member?.email || (tenant?.id === 'demo' ? '데모 모드' : member?.role)}</p>
          </div>
        )}
        <Link href="/wio/app/settings"
          className={`flex items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
          <Settings size={15} />{(isMobile || !collapsed) && '설정'}
        </Link>
        {tenant?.id === 'demo' ? (
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
      tenant, member, orbiConfig, reloadConfig,
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
              {tenant?.id === 'demo' ? (
                <Link href="/wio/login" className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">로그인</Link>
              ) : (
                <button onClick={handleLogout} className="text-xs px-3 py-1 border border-slate-700 text-slate-400 rounded-md hover:text-white hover:border-slate-500 transition-colors">로그아웃</button>
              )}
            </div>
          )}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </WIOCtx.Provider>
  );
}
