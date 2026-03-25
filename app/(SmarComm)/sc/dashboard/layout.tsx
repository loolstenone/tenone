'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import DashboardSidebar from '@/components/smarcomm/DashboardSidebar';
import ContextPanel from '@/components/smarcomm/ContextPanel';
import { getUser, logout } from '@/lib/smarcomm/auth';
import { createClient } from '@/lib/supabase/client';
import { WorkflowProvider } from '@/lib/smarcomm/workflow-context';

export const SidebarContext = createContext({ collapsed: false, setCollapsed: (v: boolean) => {} });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [favorites, setFavorites] = useState<{ path: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // 1) SmarComm Mock 인증 체크
      const u = getUser();
      if (u) {
        if (!cancelled) { setUser(u); initDashboard(); }
        return;
      }

      // 2) Supabase 세션 체크 (getUser로 서버 검증 — 리프레시에서도 유지)
      try {
        const sb = createClient();
        // getUser()는 서버에 토큰을 검증하므로 리프레시에서도 안정적
        const { data: { user: sbUser } } = await sb.auth.getUser();
        if (cancelled) return;

        if (sbUser) {
          setUser({ email: sbUser.email || '' });
          initDashboard();
        } else {
          // getUser 실패 시 getSession fallback (토큰 만료 등)
          const { data: sessionData } = await sb.auth.getSession();
          if (cancelled) return;
          if (sessionData?.session?.user) {
            setUser({ email: sessionData.session.user.email || '' });
            initDashboard();
          } else {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
          }
        }
      } catch {
        if (!cancelled) {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  const initDashboard = () => {
    const savedCompany = localStorage.getItem('smarcomm_company');
    if (savedCompany) {
      const parsed = JSON.parse(savedCompany);
      setCompanyName(parsed.name || '');
      setCompanyLogo(parsed.logo || '');
    }

    const loadFavs = () => {
      try {
        const favPaths: string[] = JSON.parse(localStorage.getItem('smarcomm_favorites') || '[]');
        const nameMap: Record<string, string> = {
          '/dashboard': '대시보드', '/dashboard/funnel': '퍼널 분석', '/dashboard/scan': 'GEO & SEO 진단',
          '/dashboard/traffic': '트래픽 분석', '/dashboard/analytics': '매출 분석', '/dashboard/reports': '캠페인 보고서',
          '/dashboard/data-reports': '데이터 리포트', '/dashboard/geo': '가시성 개요', '/dashboard/geo/competitors': '경쟁사 리서치',
          '/dashboard/geo/prompts': '프롬프트 리서치', '/dashboard/geo/brand': '브랜드 실적', '/dashboard/geo/tracking': '프롬프트 추적',
          '/dashboard/creative': 'AI 소재 제작', '/dashboard/content': '콘텐츠', '/dashboard/advisor': 'AI 어드바이저',
          '/dashboard/crm': '고객 관리', '/dashboard/crm/kakao': '카카오', '/dashboard/crm/email': '이메일',
          '/dashboard/crm/push': '푸시', '/dashboard/abtest': 'A/B 테스트', '/dashboard/journey': '사용자 여정',
          '/dashboard/cohort': '코호트', '/dashboard/events': '이벤트 관리', '/dashboard/workflow/projects': '프로젝트',
          '/dashboard/workflow/kanban': '칸반 보드', '/dashboard/calendar': '캘린더', '/dashboard/workflow/pipeline': '파이프라인',
          '/dashboard/archive': '아카이브', '/dashboard/campaigns': '광고 집행', '/dashboard/workflow/automation': '자동화',
          '/dashboard/admin': '사이트 관리', '/dashboard/profile': '워크스페이스',
        };
        setFavorites(favPaths.slice(0, 10).map(p => ({ path: p, label: nameMap[p] || p.split('/').pop() || '' })));
      } catch {}
    };
    window.addEventListener('favorites-changed', loadFavs);
    loadFavs();
    setReady(true);
  };

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-400">Workspace 로딩 중...</p>
      </div>
    </div>
  );

  const sidebarWidth = collapsed ? 56 : 224;
  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  const handleLogout = async () => {
    logout(); // SmarComm Mock auth 클리어
    try { const sb = createClient(); await sb.auth.signOut(); } catch {} // Supabase 세션 클리어
    window.location.href = '/';
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
    <WorkflowProvider>
      <DashboardSidebar companyName={companyName} companyLogo={companyLogo} />

      {/* 상단 바 */}
      <div
        className="fixed top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-white/80 px-5 backdrop-blur-sm transition-all duration-200"
        style={{ left: `${sidebarWidth}px`, right: 0 }}
      >
        {/* 즐겨찾기 바로가기 (드래그 스크롤) */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
          {favorites.length > 0 && (
            <>
              <span className="shrink-0 text-[10px] text-text-muted">바로가기:</span>
              <div className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  const el = e.currentTarget;
                  const startX = e.pageX - el.scrollLeft;
                  const onMove = (ev: MouseEvent) => { el.scrollLeft = startX - ev.pageX; };
                  const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}>
                <div className="flex gap-1.5 py-1">
                  {favorites.map(fav => (
                    <Link key={fav.path} href={fav.path}
                      className="shrink-0 flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors">
                      <Star size={10} className="text-warning fill-warning" />
                      {fav.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 프로필 */}
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-surface">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-text text-[10px] font-bold text-white">{initial}</div>
            <span className="text-xs text-text-sub max-w-[120px] truncate">{user?.email}</span>
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

      {/* 메인 콘텐츠 (우측 사이드바 영향) */}
      <main className="min-h-screen bg-surface pt-12 transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px`, marginRight: contextOpen ? '288px' : '0' }}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* 우측 컨텍스트 패널 — 상단 바 아래에 위치 */}
      <ContextPanel isOpen={contextOpen} onClose={() => setContextOpen(false)} />

      {/* 우측 사이드바 접기/펼치기 화살표 + 알림 배지 */}
      <button
        onClick={() => setContextOpen(!contextOpen)}
        className="fixed z-50 flex items-center justify-center rounded-l-md border border-r-0 border-border bg-white text-text-muted shadow-sm transition-all duration-200 hover:text-text hover:bg-surface"
        style={{ top: '56px', right: contextOpen ? '288px' : '0', width: contextOpen ? '16px' : '28px', height: contextOpen ? '28px' : '28px' }}
        title={contextOpen ? '패널 접기' : '패널 펼치기'}
      >
        {contextOpen ? (
          <ChevronRight size={10} />
        ) : (
          <ChevronLeft size={12} />
        )}
        {/* 알림 배지 (닫혀있을 때만) */}
        {!contextOpen && (
          <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white">2</span>
        )}
      </button>

    </WorkflowProvider>
    </SidebarContext.Provider>
  );
}
