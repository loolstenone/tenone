'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderKanban, MessageSquare, Receipt,
  Users, TrendingUp, BookOpen, FileText, Library, BarChart3, Clock,
  ChevronLeft, ChevronRight, LogOut, Settings
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyTenants, fetchMyMembership, addMember } from '@/lib/supabase/wio';
import type { WIOTenant, WIOMember, WIOModule } from '@/types/wio';

const MODULE_ICONS: Record<string, any> = {
  home: LayoutDashboard, project: FolderKanban, talk: MessageSquare,
  finance: Receipt, people: Users, sales: TrendingUp, timesheet: Clock,
  learn: BookOpen, content: FileText, wiki: Library, insight: BarChart3,
};

const MODULE_LABELS: Record<string, string> = {
  home: '홈', project: '프로젝트', talk: '소통',
  finance: '재무', people: '인재', sales: '영업', timesheet: '시수',
  learn: '교육', content: '콘텐츠', wiki: '위키', insight: '인사이트',
};

interface WIOContext { tenant: WIOTenant | null; member: WIOMember | null; }
const WIOCtx = createContext<WIOContext>({ tenant: null, member: null });
export const useWIO = () => useContext(WIOCtx);

export default function WIOAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [tenant, setTenant] = useState<WIOTenant | null>(null);
  const [member, setMember] = useState<WIOMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    const init = async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { router.push('/wio/login'); return; }

        let tenants = await fetchMyTenants();

        // 테넌트가 없으면 텐원 기본 테넌트에 멤버로 자동 등록
        if (tenants.length === 0) {
          const defaultTenantId = 'a0000000-0000-0000-0000-000000000001';
          await addMember(defaultTenantId, user.id, user.email?.split('@')[0] || '사용자', 'member');
          tenants = await fetchMyTenants();
          if (tenants.length === 0) { router.push('/wio'); return; }
        }

        const t = tenants[0];
        setTenant(t);

        let m = await fetchMyMembership(t.id);
        // 멤버십 없으면 자동 등록
        if (!m) {
          await addMember(t.id, user.id, user.email?.split('@')[0] || '사용자', 'member');
          m = await fetchMyMembership(t.id);
        }
        setMember(m);
        setLoading(false);
      } catch {
        // DB 오류 시 로그인 페이지로
        router.push('/wio/login');
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">WIO 로딩 중...</p>
        </div>
      </div>
    );
  }

  const activeModules = (tenant?.modules || ['home', 'project', 'talk']) as WIOModule[];
  const sidebarWidth = collapsed ? 56 : 220;

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.href = '/wio';
  };

  return (
    <WIOCtx.Provider value={{ tenant, member }}>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* 사이드바 */}
        <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#0F0F23] transition-all duration-200 ${collapsed ? 'w-14' : 'w-[220px]'}`}>
          {/* 로고 */}
          <div className="shrink-0 border-b border-white/5 p-3">
            <Link href="/wio/app" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">W</div>
              {!collapsed && (
                <div>
                  <div className="text-xs text-slate-500">{tenant?.name}</div>
                  <div className="text-sm font-bold">{tenant?.serviceName || 'WIO'}</div>
                </div>
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
                  className={`flex items-center rounded-lg py-2 text-sm transition-colors mb-0.5 ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                  <Icon size={collapsed ? 17 : 15} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* 하단 */}
          <div className="shrink-0 border-t border-white/5 p-2 space-y-0.5">
            <Link href="/wio/app/settings"
              className={`flex items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${collapsed ? 'justify-center' : 'gap-2.5 px-3'}`}>
              <Settings size={15} />{!collapsed && '설정'}
            </Link>
            <button onClick={handleLogout}
              className={`flex w-full items-center rounded-lg py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 ${collapsed ? 'justify-center' : 'gap-2.5 px-3'}`}>
              <LogOut size={15} />{!collapsed && '로그아웃'}
            </button>
          </div>
        </aside>

        {/* 접기/펼치기 */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="fixed z-50 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-white/10 bg-[#0F0F23] text-slate-500 hover:text-white transition-all"
          style={{ left: `${sidebarWidth}px`, top: '52px' }}>
          {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>

        {/* 메인 */}
        <main className="min-h-screen transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px` }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </WIOCtx.Provider>
  );
}
