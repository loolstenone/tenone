'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronDown, PanelRight } from 'lucide-react';
import SmarCommSidebar from '@/components/SmarCommSidebar';
import { getSCUser, scLogout } from '@/lib/smarcomm/auth';
import { WorkflowProvider } from '@/lib/smarcomm/workflow-context';

export const SCSidebarContext = createContext({ collapsed: false, setCollapsed: (v: boolean) => {} });

export default function SCDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const u = getSCUser();
    if (!u) { router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    setUser(u);

    const savedCompany = localStorage.getItem('sc_company');
    if (savedCompany) {
      const parsed = JSON.parse(savedCompany);
      setCompanyName(parsed.name || '');
      setCompanyLogo(parsed.logo || '');
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  const sidebarWidth = collapsed ? 56 : 208;
  const initial = user?.email?.charAt(0).toUpperCase() || '?';
  const handleLogout = () => { scLogout(); window.location.href = '/sc'; };

  return (
    <SCSidebarContext.Provider value={{ collapsed, setCollapsed }}>
    <WorkflowProvider>
      <SmarCommSidebar companyName={companyName} companyLogo={companyLogo} />

      <div
        className="fixed top-0 z-30 flex h-12 items-center justify-end gap-3 border-b border-border bg-white/80 px-5 backdrop-blur-sm transition-all duration-200"
        style={{ left: `${sidebarWidth}px`, right: '0' }}
      >
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-surface">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-text text-[10px] font-bold text-white">{initial}</div>
            <span className="text-xs text-text-sub max-w-[120px] truncate">{user?.email}</span>
            <ChevronDown size={11} className="text-text-muted" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-white py-1.5 shadow-lg">
              <Link href="/sc/dashboard/profile" className="block px-4 py-2 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>워크스페이스 설정</Link>
              <Link href="/sc" className="block px-4 py-2 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>SmarComm 홈</Link>
              <div className="my-1 border-t border-border" />
              <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-surface hover:text-text">
                <LogOut size={13} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="min-h-screen bg-surface pt-12 transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px` }}>
        <div className="p-6">{children}</div>
      </main>
    </WorkflowProvider>
    </SCSidebarContext.Provider>
  );
}
