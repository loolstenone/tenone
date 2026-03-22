'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, LineChart, CalendarDays, Users,
  ChevronLeft, ChevronRight, Archive,
  GitBranch, Activity, FileBarChart,
  Route, BarChart3, Bell, Mail,
  MessageSquare, Gauge, Crosshair, Brush,
  Rocket, PieChart, Wrench, ListChecks, Shield,
  Workflow, KanbanSquare, FolderKanban, Zap
} from 'lucide-react';
import { useContext } from 'react';
import { SCSidebarContext } from '@/app/(SmarComm)/sc/dashboard/layout';

const MENU_SECTIONS = [
  {
    title: '',
    items: [
      { href: '/sc/dashboard', label: '대시보드', icon: LayoutDashboard },
    ],
  },
  {
    title: '진단',
    items: [
      { href: '/sc/dashboard/scan', label: '사이트 진단', icon: Crosshair },
      { href: '/sc/dashboard/journey', label: '사용자 여정', icon: Route },
      { href: '/sc/dashboard/funnel', label: '퍼널 분석', icon: GitBranch },
      { href: '/sc/dashboard/cohort', label: '코호트', icon: PieChart },
      { href: '/sc/dashboard/events', label: '이벤트 관리', icon: Activity },
    ],
  },
  {
    title: '기획',
    items: [
      { href: '/sc/dashboard/workflow/projects', label: '프로젝트', icon: FolderKanban },
      { href: '/sc/dashboard/workflow/kanban', label: '칸반 보드', icon: KanbanSquare },
      { href: '/sc/dashboard/calendar', label: '마케팅 캘린더', icon: CalendarDays },
    ],
  },
  {
    title: '제작',
    items: [
      { href: '/sc/dashboard/creative', label: '소재 제작', icon: Brush },
      { href: '/sc/dashboard/workflow/pipeline', label: '콘텐츠 파이프라인', icon: Workflow },
      { href: '/sc/dashboard/archive', label: '소재 아카이브', icon: Archive },
    ],
  },
  {
    title: '실행',
    items: [
      { href: '/sc/dashboard/campaigns', label: '광고 집행', icon: Rocket },
      { href: '/sc/dashboard/abtest', label: 'A/B 테스트', icon: Gauge },
      { href: '/sc/dashboard/crm', label: '고객 관리', icon: Users },
      { href: '/sc/dashboard/crm/push', label: '푸시 메시지', icon: Bell },
      { href: '/sc/dashboard/crm/email', label: '이메일', icon: Mail },
      { href: '/sc/dashboard/crm/kakao', label: '카카오', icon: MessageSquare },
      { href: '/sc/dashboard/workflow/automation', label: '자동화', icon: Zap },
    ],
  },
  {
    title: '결과',
    items: [
      { href: '/sc/dashboard/analytics', label: '매출 분석', icon: LineChart },
      { href: '/sc/dashboard/reports', label: '캠페인 보고서', icon: FileBarChart },
      { href: '/sc/dashboard/data-reports', label: '데이터 리포트', icon: BarChart3 },
    ],
  },
  {
    title: '설정',
    items: [
      { href: '/sc/dashboard/admin', label: '사이트 관리', icon: Shield },
      { href: '/sc/dashboard/workflow', label: '워크플로우 현황', icon: ListChecks },
      { href: '/sc/dashboard/profile', label: '워크스페이스 설정', icon: Wrench },
    ],
  },
];

interface Props {
  companyName: string;
  companyLogo?: string;
}

export default function SmarCommSidebar({ companyName, companyLogo }: Props) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useContext(SCSidebarContext);

  return (
    <>
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-white transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'}`}>
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {companyLogo ? (
              <img src={companyLogo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
            ) : companyName ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-bold text-text-sub">
                {companyName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Link href="/sc/dashboard/profile" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-text-muted/40 text-text-muted hover:border-text hover:text-text" title="로고 설정">
                <span className="text-sm">+</span>
              </Link>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                {companyName ? (
                  <div className="text-[10px] text-text-muted truncate">{companyName}</div>
                ) : (
                  <Link href="/sc/dashboard/profile" className="text-[10px] text-text-muted hover:text-text">로고 설정 →</Link>
                )}
                <div className="text-base font-extrabold text-text tracking-tight leading-tight">Workspace</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {MENU_SECTIONS.map((section, si) => (
          <div key={si} className={section.title ? 'mb-1.5 mt-3' : 'mb-1'}>
            {!collapsed && section.title && (
              <div className="mb-1 px-3 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                {section.title}
              </div>
            )}
            {collapsed && section.title && <div className="mx-auto my-2 h-px w-6 bg-border" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg py-1.5 text-[13px] transition-colors mb-px ${
                    collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                  } ${
                    isActive
                      ? 'bg-surface font-semibold text-text'
                      : 'text-text-sub hover:bg-surface hover:text-text'
                  }`}
                >
                  <Icon size={collapsed ? 17 : 15} className={isActive ? 'text-text' : 'text-text-muted'} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        {collapsed ? (
          <div className="text-center text-[8px] text-text-muted leading-tight">
            <span className="font-light">S</span><span className="font-bold">C</span><span className="font-bold">.</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-[10px] text-text-muted">Powered by</div>
            <div className="text-base font-bold tracking-tight text-text-sub">
              <span className="font-light">Smar</span>Comm<span className="text-text-muted">.</span>
            </div>
          </div>
        )}
      </div>
    </aside>

    <button
      onClick={() => setCollapsed(!collapsed)}
      className={`fixed z-50 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-border bg-white text-text-muted shadow-sm transition-all duration-200 hover:text-text hover:bg-surface hover:w-5 ${
        collapsed ? 'left-[56px]' : 'left-[208px]'
      }`}
      style={{ top: '52px' }}
      title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
    >
      {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
    </button>
    </>
  );
}
