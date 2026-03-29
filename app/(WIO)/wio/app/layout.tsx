'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderKanban, MessageSquare, Receipt,
  Users, TrendingUp, BookOpen, FileText, Library, BarChart3, Clock,
  ChevronLeft, ChevronRight, LogOut, Settings, Target,
  Trophy, Network, Award, Stamp, Menu, X,
  UserPlus, CalendarCheck, Wallet, Star, GitBranch, MessageCircle,
  ShoppingCart, CreditCard, DollarSign, Landmark, Shield, Scale, FileCheck,
  Megaphone, BarChart2, Globe, Zap, PenTool, Bot, Share2, Layers, PieChart, Eye, Gauge, Activity,
  Handshake, Building, Truck, Package,
  Mail, Send, Calendar, FileStack, Bell, ClipboardList, Cpu, Monitor,
  Lock, ScrollText, Plug, Heart, FileTemplate, Database,
  Microscope, Fingerprint, Code, Rocket, Factory, Cog, CheckSquare, Palette, Image, Warehouse, Map, Link2, HardDrive, Film
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyTenants, fetchMyMembership, addMember } from '@/lib/supabase/wio';
import type { WIOTenant, WIOMember, WIOModule } from '@/types/wio';

const TRACKS = [
  {
    id: 'common', name: '공통', icon: LayoutDashboard,
    modules: [
      { key: 'home', label: '홈', icon: LayoutDashboard, href: '/wio/app' },
      { key: 'talk', label: '소통', icon: MessageSquare, href: '/wio/app/talk' },
      { key: 'approval', label: '결재', icon: Stamp, href: '/wio/app/approval' },
      { key: 'mail', label: '메일', icon: Mail, href: '/wio/app/comm/mail' },
      { key: 'messenger', label: '메신저', icon: Send, href: '/wio/app/comm/messenger' },
      { key: 'calendar', label: '캘린더', icon: Calendar, href: '/wio/app/comm/calendar' },
      { key: 'document', label: '문서', icon: FileStack, href: '/wio/app/comm/document' },
      { key: 'notification', label: '알림', icon: Bell, href: '/wio/app/comm/notification' },
      { key: 'report', label: '리포트', icon: ClipboardList, href: '/wio/app/comm/report' },
      { key: 'ai', label: 'AI', icon: Bot, href: '/wio/app/comm/ai' },
      { key: 'it', label: '전산', icon: Monitor, href: '/wio/app/comm/it' },
    ]
  },
  {
    id: 'hr', name: '인사·조직', icon: Users,
    modules: [
      { key: 'people', label: '인재', icon: Users, href: '/wio/app/people' },
      { key: 'recruit', label: '채용', icon: UserPlus, href: '/wio/app/hr/recruit' },
      { key: 'attendance', label: '근태', icon: CalendarCheck, href: '/wio/app/hr/attendance' },
      { key: 'payroll', label: '급여', icon: Wallet, href: '/wio/app/hr/payroll' },
      { key: 'evaluation', label: '평가', icon: Star, href: '/wio/app/hr/evaluation' },
      { key: 'reward', label: '보상', icon: Award, href: '/wio/app/hr/reward' },
      { key: 'org', label: '조직', icon: GitBranch, href: '/wio/app/hr/org' },
      { key: 'feedback', label: '피드백', icon: MessageCircle, href: '/wio/app/hr/feedback' },
      { key: 'gpr', label: 'GPR', icon: Target, href: '/wio/app/gpr' },
      { key: 'learn', label: '교육', icon: BookOpen, href: '/wio/app/learn' },
    ]
  },
  {
    id: 'business', name: '사업', icon: TrendingUp,
    modules: [
      { key: 'project', label: '프로젝트', icon: FolderKanban, href: '/wio/app/project' },
      { key: 'sales', label: '영업', icon: TrendingUp, href: '/wio/app/sales' },
      { key: 'competition', label: '경연', icon: Trophy, href: '/wio/app/competition' },
      { key: 'networking', label: '네트워킹', icon: Network, href: '/wio/app/networking' },
      { key: 'mkt-strategy', label: '마케팅전략', icon: Megaphone, href: '/wio/app/marketing/strategy' },
      { key: 'mkt-campaign', label: '캠페인', icon: Zap, href: '/wio/app/marketing/campaign' },
      { key: 'mkt-media', label: '매체', icon: Globe, href: '/wio/app/marketing/media' },
      { key: 'mkt-performance', label: '퍼포먼스', icon: BarChart2, href: '/wio/app/marketing/performance' },
      { key: 'mkt-social', label: '소셜', icon: Share2, href: '/wio/app/marketing/social' },
      { key: 'mkt-influencer', label: '인플루언서', icon: Star, href: '/wio/app/marketing/influencer' },
      { key: 'mkt-creative', label: '크리에이티브', icon: PenTool, href: '/wio/app/marketing/creative' },
      { key: 'mkt-automation', label: '자동화', icon: Bot, href: '/wio/app/marketing/automation' },
      { key: 'mkt-datahub', label: '데이터허브', icon: Layers, href: '/wio/app/marketing/data-hub' },
      { key: 'mkt-attribution', label: '어트리뷰션', icon: PieChart, href: '/wio/app/marketing/attribution' },
      { key: 'mkt-mmm', label: '미디어믹스', icon: Gauge, href: '/wio/app/marketing/mmm' },
      { key: 'mkt-abtest', label: 'A/B테스트', icon: Activity, href: '/wio/app/marketing/abtest' },
      { key: 'mkt-sentiment', label: '감성분석', icon: Eye, href: '/wio/app/marketing/sentiment' },
      { key: 'mkt-ops', label: '마케팅운영', icon: Cog, href: '/wio/app/marketing/ops' },
      { key: 'crm-customers', label: '고객관리', icon: Users, href: '/wio/app/crm/customers' },
      { key: 'crm-support', label: '고객지원', icon: MessageCircle, href: '/wio/app/crm/support' },
      { key: 'crm-cx', label: '고객경험', icon: Heart, href: '/wio/app/crm/cx' },
      { key: 'crm-membership', label: '멤버십', icon: Award, href: '/wio/app/crm/membership' },
      { key: 'crm-cdp', label: 'CDP', icon: Database, href: '/wio/app/crm/cdp' },
      { key: 'crm-privacy', label: '개인정보', icon: Shield, href: '/wio/app/crm/privacy' },
    ]
  },
  {
    id: 'support', name: '지원', icon: FileText,
    modules: [
      { key: 'content', label: '콘텐츠', icon: FileText, href: '/wio/app/content' },
      { key: 'wiki', label: '위키', icon: Library, href: '/wio/app/wiki' },
      { key: 'insight', label: '인사이트', icon: BarChart3, href: '/wio/app/insight' },
      { key: 'rnd', label: 'R&D', icon: Microscope, href: '/wio/app/support/rnd' },
      { key: 'patent', label: '특허', icon: Fingerprint, href: '/wio/app/support/patent' },
      { key: 'dev', label: '개발', icon: Code, href: '/wio/app/support/dev' },
      { key: 'deploy', label: '배포', icon: Rocket, href: '/wio/app/support/deploy' },
      { key: 'production', label: '생산', icon: Factory, href: '/wio/app/support/production' },
      { key: 'process', label: '공정', icon: Cog, href: '/wio/app/support/process' },
      { key: 'qc', label: '품질', icon: CheckSquare, href: '/wio/app/support/qc' },
      { key: 'equipment', label: '설비', icon: Cpu, href: '/wio/app/support/equipment' },
      { key: 'design', label: '디자인', icon: Palette, href: '/wio/app/support/design' },
      { key: 'design-asset', label: '디자인자산', icon: Image, href: '/wio/app/support/design-asset' },
      { key: 'warehouse', label: '창고', icon: Warehouse, href: '/wio/app/support/warehouse' },
      { key: 'transport', label: '운송', icon: Truck, href: '/wio/app/support/transport' },
      { key: 'scm', label: '공급망', icon: Link2, href: '/wio/app/support/scm' },
      { key: 'data-platform', label: '데이터플랫폼', icon: HardDrive, href: '/wio/app/support/data-platform' },
      { key: 'dam', label: 'DAM', icon: Film, href: '/wio/app/support/dam' },
    ]
  },
  {
    id: 'finance', name: '재무·법무', icon: Receipt,
    modules: [
      { key: 'finance', label: '재무', icon: Receipt, href: '/wio/app/finance' },
      { key: 'gl', label: '총계정원장', icon: Landmark, href: '/wio/app/finance/gl' },
      { key: 'ap', label: '매입', icon: ShoppingCart, href: '/wio/app/finance/ap' },
      { key: 'ar', label: '매출', icon: CreditCard, href: '/wio/app/finance/ar' },
      { key: 'budget', label: '예산', icon: DollarSign, href: '/wio/app/finance/budget' },
      { key: 'tax', label: '세무', icon: FileCheck, href: '/wio/app/finance/tax' },
      { key: 'asset', label: '자산', icon: Package, href: '/wio/app/finance/asset' },
      { key: 'timesheet', label: '시수', icon: Clock, href: '/wio/app/timesheet' },
      { key: 'certificate', label: '수료증', icon: Award, href: '/wio/app/certificate' },
      { key: 'audit', label: '감사', icon: Shield, href: '/wio/app/finance/audit' },
      { key: 'legal', label: '계약', icon: Scale, href: '/wio/app/finance/legal' },
    ]
  },
  {
    id: 'partner', name: '파트너', icon: Handshake,
    modules: [
      { key: 'partner', label: '파트너관리', icon: Handshake, href: '/wio/app/partner' },
      { key: 'partner-portal', label: '포털', icon: Building, href: '/wio/app/partner/portal' },
      { key: 'vendor', label: '벤더', icon: Truck, href: '/wio/app/partner/vendor' },
      { key: 'freelancer', label: '프리랜서', icon: Users, href: '/wio/app/partner/freelancer' },
    ]
  },
  {
    id: 'system', name: '시스템', icon: Monitor,
    modules: [
      { key: 'sys-users', label: '사용자', icon: Users, href: '/wio/app/system/users' },
      { key: 'sys-roles', label: '역할/권한', icon: Shield, href: '/wio/app/system/roles' },
      { key: 'sys-workflow', label: '워크플로우', icon: GitBranch, href: '/wio/app/system/workflow' },
      { key: 'sys-monitor', label: '모니터링', icon: Activity, href: '/wio/app/system/monitor' },
      { key: 'sys-security', label: '보안', icon: Lock, href: '/wio/app/system/security' },
      { key: 'sys-audit', label: '감사로그', icon: ScrollText, href: '/wio/app/system/audit-log' },
      { key: 'sys-integration', label: '외부연동', icon: Plug, href: '/wio/app/system/integration' },
      { key: 'sys-culture', label: 'Culture', icon: Heart, href: '/wio/app/system/culture' },
      { key: 'sys-template', label: '양식', icon: FileText, href: '/wio/app/system/template' },
    ]
  },
];

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
  const [openTracks, setOpenTracks] = useState<string[]>(['common']);
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
          setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval','mail','messenger','calendar','document','notification','report','ai','it','recruit','attendance','payroll','evaluation','reward','org','feedback','mkt-strategy','mkt-campaign','mkt-media','mkt-performance','mkt-social','mkt-influencer','mkt-creative','mkt-automation','mkt-datahub','mkt-attribution','mkt-mmm','mkt-abtest','mkt-sentiment','mkt-ops','crm-customers','crm-support','crm-cx','crm-membership','crm-cdp','crm-privacy','rnd','patent','dev','deploy','production','process','qc','equipment','design','design-asset','warehouse','transport','scm','data-platform','dam','gl','ap','ar','budget','tax','asset','audit','legal','partner','partner-portal','vendor','freelancer','sys-users','sys-roles','sys-workflow','sys-monitor','sys-security','sys-audit','sys-integration','sys-culture','sys-template'], isActive: true } as any);
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
          setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval','mail','messenger','calendar','document','notification','report','ai','it','recruit','attendance','payroll','evaluation','reward','org','feedback','mkt-strategy','mkt-campaign','mkt-media','mkt-performance','mkt-social','mkt-influencer','mkt-creative','mkt-automation','mkt-datahub','mkt-attribution','mkt-mmm','mkt-abtest','mkt-sentiment','mkt-ops','crm-customers','crm-support','crm-cx','crm-membership','crm-cdp','crm-privacy','rnd','patent','dev','deploy','production','process','qc','equipment','design','design-asset','warehouse','transport','scm','data-platform','dam','gl','ap','ar','budget','tax','asset','audit','legal','partner','partner-portal','vendor','freelancer','sys-users','sys-roles','sys-workflow','sys-monitor','sys-security','sys-audit','sys-integration','sys-culture','sys-template'], isActive: true } as any);
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
        setTenant({ id: 'demo', name: 'Orbi Demo', slug: 'demo', serviceName: 'Orbi', domain: '', primaryColor: '#6366F1', poweredBy: true, plan: 'starter', maxMembers: 5, modules: ['home','project','talk','people','sales','timesheet','learn','content','wiki','insight','gpr','finance','competition','networking','certificate','approval','mail','messenger','calendar','document','notification','report','ai','it','recruit','attendance','payroll','evaluation','reward','org','feedback','mkt-strategy','mkt-campaign','mkt-media','mkt-performance','mkt-social','mkt-influencer','mkt-creative','mkt-automation','mkt-datahub','mkt-attribution','mkt-mmm','mkt-abtest','mkt-sentiment','mkt-ops','crm-customers','crm-support','crm-cx','crm-membership','crm-cdp','crm-privacy','rnd','patent','dev','deploy','production','process','qc','equipment','design','design-asset','warehouse','transport','scm','data-platform','dam','gl','ap','ar','budget','tax','asset','audit','legal','partner','partner-portal','vendor','freelancer','sys-users','sys-roles','sys-workflow','sys-monitor','sys-security','sys-audit','sys-integration','sys-culture','sys-template'], isActive: true } as any);
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

      {/* 모듈 메뉴 — EUS 7-Track 아코디언 */}
      <nav className="flex-1 overflow-y-auto p-2">
        {TRACKS.map((track, ti) => {
          const visibleModules = track.modules.filter(m => activeModules.includes(m.key as WIOModule));
          if (visibleModules.length === 0) return null;
          const hasActiveChild = visibleModules.some(mod => mod.key === 'home' ? (pathname === '/wio/app' || pathname === '/wio/app/') : pathname.startsWith(mod.href));
          const isOpen = openTracks.includes(track.id) || hasActiveChild;
          const TrackIcon = track.icon;
          return (
            <div key={track.id} className={ti > 0 ? 'mt-1' : ''}>
              {/* 트랙 헤더 — 클릭으로 펼침/접힘 */}
              {(isMobile || !collapsed) ? (
                <button onClick={() => setOpenTracks(prev => prev.includes(track.id) ? prev.filter(t => t !== track.id) : [...prev, track.id])}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wider transition-colors ${isOpen ? 'text-white bg-white/[0.04]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}`}>
                  <span className="flex items-center gap-2"><TrackIcon size={14} />{track.name}</span>
                  <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
              ) : (
                collapsed && ti > 0 && <div className="mx-2 mb-1 border-t border-white/5" />
              )}
              {/* 모듈 목록 — 열린 트랙만 표시 */}
              {(isOpen || (!isMobile && collapsed)) && visibleModules.map(mod => {
                const Icon = mod.icon;
                const isActive = mod.key === 'home'
                  ? pathname === '/wio/app' || pathname === '/wio/app/'
                  : pathname.startsWith(`/wio/app/${mod.key}`);
                return (
                  <Link key={mod.key} href={mod.href}
                    className={`flex items-center rounded-lg py-2 text-sm transition-colors mb-0.5 ${(!isMobile && collapsed) ? 'justify-center px-0' : 'gap-2.5 px-3'} ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <Icon size={(!isMobile && collapsed) ? 17 : 15} />
                    {(isMobile || !collapsed) && <span>{mod.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="shrink-0 border-t border-white/5 p-2 space-y-0.5">
        {/* 사용자 정보 */}
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
          {/* 상단 유저바 */}
          {!isMobile && (
            <div className="flex items-center justify-end gap-3 px-6 py-2 border-b border-white/5">
              <span className="text-xs text-slate-500">{member?.displayName || '체험 사용자'}</span>
              {tenant?.id === 'demo' ? (
                <Link href="/wio/login" className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">
                  로그인
                </Link>
              ) : (
                <button onClick={handleLogout} className="text-xs px-3 py-1 border border-slate-700 text-slate-400 rounded-md hover:text-white hover:border-slate-500 transition-colors">
                  로그아웃
                </button>
              )}
            </div>
          )}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </WIOCtx.Provider>
  );
}
