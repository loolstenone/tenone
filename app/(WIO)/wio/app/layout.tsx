'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderKanban, MessageSquare, Receipt,
  Users, TrendingUp, BookOpen, FileText, Library, BarChart3, Clock,
  ChevronLeft, ChevronRight, LogOut, Settings, Target,
  Trophy, Network, Award, Stamp, Menu, X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyTenants, fetchMyMembership, addMember } from '@/lib/supabase/wio';
import type { WIOTenant, WIOMember, WIOModule } from '@/types/wio';

const MODULE_ICONS: Record<string, any> = {
  home: LayoutDashboard, project: FolderKanban, talk: MessageSquare,
  finance: Receipt, people: Users, sales: TrendingUp, timesheet: Clock,
  learn: BookOpen, content: FileText, wiki: Library, insight: BarChart3, gpr: Target,
  competition: Trophy, networking: Network, certificate: Award, approval: Stamp,
};

const MODULE_LABELS: Record<string, string> = {
  home: '홈', project: '프로젝트', talk: '소통',
  finance: '재무', people: '인재', sales: '영업', timesheet: '시수',
  learn: '교육', content: '콘텐츠', wiki: '위키', insight: '인사이트', gpr: 'GPR',
  competition: '경연', networking: '네트워킹', certificate: '수료증', approval: '결재',
};

interface WIOContext { tenant: WIOTenant | null; member: WIOMember | null; refreshTenant?: () => void; }
const WIOCtx = createContext<WIOContext>({ tenant: null, member: null });
export const useWIO = () => useContext(WIOCtx);

export default function WIOAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<WIOTenant | null>(null);
  const [member, setMember] = useState<WIOMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 모바일 감지
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 경로 변경 시 모바일 사이드바 닫기
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const init = async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
          // 비로그인 → Orbi 데모 모드
          setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval'], isActive: true } as any);
          setMember({ id: 'demo', displayName: '체험 사용자', role: 'member', email: '' } as any);
          setLoading(false);
          return;
        }

        let tenants: WIOTenant[] = [];
        try { tenants = await fetchMyTenants(); } catch { /* DB 테이블 미존재 */ }

        if (tenants.length === 0) {
          try {
            const defaultTenantId = 'a0000000-0000-0000-0000-000000000001';
            await addMember(defaultTenantId, user.id, user.email?.split('@')[0] || '사용자', 'member');
            tenants = await fetchMyTenants();
          } catch { /* 실패해도 무시 */ }
        }

        if (tenants.length === 0) {
          // 테넌트에 소속되지 않은 사용자 → Orbi 데모로 fallback
          setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval'], isActive: true } as any);
          setMember({ id: 'demo', displayName: user.email?.split('@')[0] || '사용자', role: 'admin', email: user.email || '' } as any);
          setLoading(false);
          return;
        }

        const t = tenants[0];
        setTenant(t);

        let m = await fetchMyMembership(t.id);
        if (!m) {
          await addMember(t.id, user.id, user.email?.split('@')[0] || '사용자', 'member');
          m = await fetchMyMembership(t.id);
        }
        setMember(m);
        setLoading(false);
      } catch {
        // 에러 시 데모 fallback
        setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval'], isActive: true } as any);
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

  // 접근 권한 없음
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
            <button onClick={() => router.push('/')} className="px-5 py-2.5 text-sm bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              홈으로
            </button>
            <button onClick={() => router.push('/wio')} className="px-5 py-2.5 text-sm border border-slate-700 text-slate-300 rounded-lg hover:border-slate-500 transition-colors">
              Orbi 소개
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeModules = (tenant?.modules || ['home', 'project', 'talk', 'finance', 'people', 'sales', 'timesheet', 'content', 'wiki', 'insight']) as WIOModule[];
  const sidebarWidth = isMobile ? 0 : (collapsed ? 56 : 220);

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push('/wio');
  };

  const SidebarContent = () => (
    <>
      {/* 로고 */}
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

      {/* 모듈 메뉴 */}
      <nav className="flex-1 overflow-y-auto p-2">
        {activeModules.map(mod => {
          const Icon = MODULE_ICONS[mod] || LayoutDashboard;
          const label = MODULE_LABELS[mod] || mod;
          const href = `/wio/app/${mod === 'home' ? '' : mod}`;
          const isActive = mod === 'home' ? pathname === '/wio/app' || pathname === '/wio/app/' : pathname.startsWith(`/wio/app/${mod}`);
          return (
            <Link key={mod} href={href}
              className={`flex items-center rounded-lg py-2 text-sm transition-colors mb-0.5 ${(!isMobile && collapsed) ? 'justify-center px-0' : 'gap-2.5 px-3'} ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={(!isMobile && collapsed) ? 17 : 15} />
              {(isMobile || !collapsed) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="shrink-0 border-t border-white/5 p-2 space-y-0.5">
        <Link href="/wio/app/settings"
          className={`flex items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
          <Settings size={15} />{(isMobile || !collapsed) && '설정'}
        </Link>
        <button onClick={handleLogout}
          className={`flex w-full items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${(!isMobile && collapsed) ? 'justify-center' : 'gap-2.5 px-3'}`}>
          <LogOut size={15} />{(isMobile || !collapsed) && '로그아웃'}
        </button>
      </div>
    </>
  );

  return (
    <WIOCtx.Provider value={{ tenant, member, refreshTenant: async () => { if (tenant) { const { fetchTenant } = await import('@/lib/supabase/wio'); const t = await fetchTenant(tenant.id); if (t) setTenant(t); } } }}>
      <div className="min-h-screen bg-slate-950 text-white">

        {/* 모바일 헤더 */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-white/5 bg-[#0F0F23] px-4">
            <button onClick={() => setMobileOpen(true)} className="p-1 text-slate-400 hover:text-white">
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold">{tenant?.serviceName || 'Orbi'}</span>
            <div className="w-6" /> {/* spacer */}
          </header>
        )}

        {/* 모바일 오버레이 사이드바 */}
        {isMobile && (
          <>
            {mobileOpen && (
              <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setMobileOpen(false)} />
            )}
            <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#0F0F23] transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <SidebarContent />
            </aside>
          </>
        )}

        {/* 데스크톱 사이드바 */}
        {!isMobile && (
          <>
            <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#0F0F23] transition-all duration-200 ${collapsed ? 'w-14' : 'w-[220px]'}`}>
              <SidebarContent />
            </aside>

            {/* 접기/펼치기 */}
            <button onClick={() => setCollapsed(!collapsed)}
              className="fixed z-50 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-white/10 bg-[#0F0F23] text-slate-500 hover:text-white transition-all"
              style={{ left: `${collapsed ? 56 : 220}px`, top: '52px' }}>
              {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
            </button>
          </>
        )}

        {/* 메인 */}
        <main className="min-h-screen transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px`, paddingTop: isMobile ? '48px' : '0' }}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </WIOCtx.Provider>
  );
}
