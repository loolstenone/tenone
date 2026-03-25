'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronDown, PanelRightOpen, PanelRightClose } from 'lucide-react';
import SmarCommSidebar from '@/components/SmarCommSidebar';
import SCRightPanel from '@/components/smarcomm/RightPanel';
import { getSCUser, scLogout } from '@/lib/smarcomm/auth';
import { createClient } from '@/lib/supabase/client';
import { WorkflowProvider } from '@/lib/smarcomm/workflow-context';

export const SCSidebarContext = createContext({
  collapsed: false,
  setCollapsed: (v: boolean) => {},
  mobileExpanded: false,
  setMobileExpanded: (v: boolean) => {},
  rightOpen: false,
  setRightOpen: (v: boolean) => {},
});

export default function SCDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [rightOpen, setRightOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024; // lg 이상이면 열림, 미만이면 닫힘
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const u = getSCUser();

    // SC 자체 인증이 있으면 바로 진입
    if (u) {
      setUser(u);
    } else {
      // Supabase 브라우저 클라이언트로 세션 체크
      const sb = createClient();
      sb.auth.getSession().then(({ data }: any) => {
        if (data?.session?.user) {
          setUser({ email: data.session.user.email || '' });
          setReady(true);
        } else {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }).catch(() => {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      });
      return;
    }

    const savedCompany = localStorage.getItem('sc_company');
    if (savedCompany) {
      const parsed = JSON.parse(savedCompany);
      setCompanyName(parsed.name || '');
      setCompanyLogo(parsed.logo || '');
    }

    setReady(true);
  }, [router]);

  // 페이지 이동 시 모바일 사이드바 접기
  useEffect(() => {
    setMobileExpanded(false);
  }, [children]);

  // 화면 크기 변경 시 우측 패널 자동 전환
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setRightOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!ready) return null;

  const desktopSidebarW = collapsed ? 56 : 208;
  const mobileSidebarW = 56;
  const initial = user?.email?.charAt(0).toUpperCase() || '?';
  const handleLogout = () => { scLogout(); window.location.href = '/'; };

  return (
    <SCSidebarContext.Provider value={{ collapsed, setCollapsed, mobileExpanded, setMobileExpanded, rightOpen, setRightOpen }}>
    <WorkflowProvider>
      <SmarCommSidebar companyName={companyName} companyLogo={companyLogo} />

      {/* 좌측 사이드바 오버레이 */}
      {mobileExpanded && (
        <div className="fixed inset-0 z-35 bg-black/30 lg:hidden" onClick={() => setMobileExpanded(false)} />
      )}

      {/* 우측 패널 오버레이 (좁은 화면에서만) */}
      {rightOpen && (
        <div className="fixed inset-0 z-35 bg-black/30 lg:hidden" onClick={() => setRightOpen(false)} />
      )}

      {/* 탑바 */}
      <div
        className="fixed top-0 right-0 z-30 flex h-12 items-center justify-end gap-2 border-b border-border bg-white/80 px-4 backdrop-blur-sm transition-all duration-200 sm:px-5"
        style={{ left: `${mobileSidebarW}px` }}
      >
        {/* 우측 패널 토글 */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text transition-colors"
          title={rightOpen ? '패널 닫기' : '패널 열기'}
        >
          {rightOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-surface">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-text text-[10px] font-bold text-white">{initial}</div>
            <span className="hidden text-xs text-text-sub max-w-[120px] truncate sm:inline">{user?.email}</span>
            <ChevronDown size={11} className="text-text-muted" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-white py-1.5 shadow-lg z-50">
              <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>워크스페이스 설정</Link>
              <Link href="/" className="block px-4 py-2 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>SmarComm 홈</Link>
              <div className="my-1 border-t border-border" />
              <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-surface hover:text-text">
                <LogOut size={13} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main
        className="sc-main min-h-screen bg-surface pt-12 transition-all duration-200"
        style={{ marginLeft: `${mobileSidebarW}px` }}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>

      {/* 우측 패널 (오버레이) */}
      <SCRightPanel open={rightOpen} onClose={() => setRightOpen(false)} />

      {/* 데스크탑 레이아웃 마진 */}
      <style>{`
        @media (min-width: 1024px) {
          .sc-main { margin-left: ${desktopSidebarW}px !important; ${rightOpen ? 'margin-right: 288px !important;' : ''} }
          [class*="z-30"][class*="h-12"] { left: ${desktopSidebarW}px !important; ${rightOpen ? 'right: 288px !important;' : ''} }
        }
      `}</style>
    </WorkflowProvider>
    </SCSidebarContext.Provider>
  );
}
