'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, LineChart, CalendarDays, Users,
  ChevronLeft, ChevronRight, Archive,
  GitBranch, Activity, FileBarChart,
  Route, BarChart3, Bell, Mail,
  MessageSquare, Gauge, Crosshair, Brush,
  Rocket, PieChart, Wrench, ListChecks, Shield, Lightbulb,
  Workflow, KanbanSquare, FolderKanban, Zap,
  Eye, Search, Target, Radar, Globe, BookOpen, Lock
} from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { SidebarContext } from '@/app/dashboard/layout';

// 팩 타입: core=항상 보임, action/crm/experiment/ops/launch=확장팩
type PackType = 'core' | 'action' | 'crm' | 'experiment' | 'ops' | 'launch' | 'setting';

const PACK_LABELS: Record<PackType, { label: string; emoji: string }> = {
  core: { label: '', emoji: '' },
  action: { label: '액션팩', emoji: '🎯' },
  crm: { label: 'CRM팩', emoji: '📱' },
  experiment: { label: '실험팩', emoji: '🧪' },
  ops: { label: '운영팩', emoji: '📋' },
  launch: { label: '집행팩', emoji: '🚀' },
  setting: { label: '', emoji: '' },
};

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  pack?: PackType;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  // ── Core (항상 보임) ──
  {
    title: '',
    items: [
      { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
    ],
  },
  // ── 진단 ──
  {
    title: '진단',
    items: [
      { href: '/dashboard/scan', label: 'GEO & SEO 진단', icon: Crosshair, pack: 'core' },
      { href: '/dashboard/advisor', label: 'AI 어드바이저', icon: Lightbulb, pack: 'action' },
    ],
  },
  // ── 제작 ──
  {
    title: '제작',
    items: [
      { href: '/dashboard/creative', label: 'AI 소재 제작', icon: Brush, pack: 'action' },
    ],
  },
  // ── 설정 ──
  {
    title: '설정',
    items: [
      { href: '/dashboard/profile', label: '워크스페이스', icon: Wrench, pack: 'setting' },
    ],
  },
  // ── 개발중 ──
  {
    title: '개발중',
    items: [
      { href: '/dashboard/funnel', label: '퍼널 분석', icon: GitBranch, pack: 'core' },
      { href: '/dashboard/traffic', label: '트래픽 분석', icon: Globe, pack: 'core' },
      { href: '/dashboard/geo', label: 'AI 가시성', icon: Eye, pack: 'core' },
      { href: '/dashboard/geo/prompts', label: '프롬프트 관리', icon: Search, pack: 'core' },
      { href: '/dashboard/content', label: '콘텐츠', icon: BookOpen, pack: 'action' },
      { href: '/dashboard/archive', label: '소재 아카이브', icon: Archive, pack: 'action' },
      { href: '/dashboard/reports', label: '리포트', icon: FileBarChart, pack: 'core' },
      { href: '/dashboard/workflow/projects', label: '프로젝트', icon: FolderKanban, pack: 'ops' },
      { href: '/dashboard/workflow/kanban', label: '칸반 보드', icon: KanbanSquare, pack: 'ops' },
      { href: '/dashboard/calendar', label: '마케팅 캘린더', icon: CalendarDays, pack: 'ops' },
      { href: '/dashboard/abtest', label: 'A/B 테스트', icon: Gauge, pack: 'experiment' },
      { href: '/dashboard/workflow/automation', label: '자동화', icon: Zap, pack: 'ops' },
      { href: '/dashboard/journey', label: '사용자 여정', icon: Route, pack: 'experiment' },
      { href: '/dashboard/cohort', label: '코호트', icon: PieChart, pack: 'experiment' },
      { href: '/dashboard/events', label: '이벤트 관리', icon: Activity, pack: 'experiment' },
      { href: '/dashboard/crm', label: '고객 관리', icon: Users, pack: 'crm' },
      { href: '/dashboard/crm/kakao', label: '카카오', icon: MessageSquare, pack: 'crm' },
      { href: '/dashboard/crm/email', label: '이메일', icon: Mail, pack: 'crm' },
      { href: '/dashboard/crm/push', label: '푸시', icon: Bell, pack: 'crm' },
      { href: '/dashboard/workflow', label: '워크플로우', icon: ListChecks, pack: 'setting' },
    ],
  },
];

interface Props {
  companyName: string;
  companyLogo?: string;
}

// 사용자 티어 확인 (가격 정책 기반)
type UserTier = 'starter' | 'growth' | 'pro' | 'enterprise';

function getUserTier(): UserTier {
  if (typeof window === 'undefined') return 'enterprise';
  try {
    const user = localStorage.getItem('smarcomm_user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.email === 'admin@smarcomm.com') return 'enterprise';
    }
    const tier = localStorage.getItem('smarcomm_tier');
    if (tier) return tier as UserTier;
  } catch {}
  return 'starter';
}

// 팩별 필요 티어
// Starter: Core + AI 가시성
// Growth: + 액션팩 + CRM팩
// Pro: + 실험팩 + 운영팩
// Enterprise: + 집행팩
const PACK_TIER: Record<string, UserTier> = {
  core: 'starter',
  action: 'growth',
  crm: 'growth',
  experiment: 'pro',
  ops: 'pro',
  launch: 'enterprise',
  setting: 'starter',
};

function isMasterUser(): boolean {
  return getUserTier() === 'enterprise';
}

export default function DashboardSidebar({ companyName, companyLogo }: Props) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  // 현재 개발 단계: 모든 메뉴 잠금 해제 (프로덕션에서 getUserTier() 활성화)
  const [userTier] = useState<UserTier>('enterprise');

  const TIER_ORDER: UserTier[] = ['starter', 'growth', 'pro', 'enterprise'];
  const userTierIndex = TIER_ORDER.indexOf(userTier);

  return (
    <>
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-white transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'}`}>
      {/* 상단: 로고 + Workspace + 접기 */}
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
              <Link href="/dashboard/profile" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-text-muted/40 text-text-muted hover:border-text hover:text-text" title="로고 설정">
                <span className="text-sm">+</span>
              </Link>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                {companyName ? (
                  <div className="text-[10px] text-text-muted truncate">{companyName}</div>
                ) : (
                  <Link href="/dashboard/profile" className="text-[10px] text-text-muted hover:text-text">로고 설정 →</Link>
                )}
                <div className="text-base font-extrabold text-text tracking-tight leading-tight">Workspace</div>
              </div>
            )}
          </div>

          {/* 상단 영역에서 접기 버튼 제거 — 바깥에 별도 배치 */}
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {MENU_SECTIONS.map((section, si) => {
          const packInfo = section.items[0]?.pack ? PACK_LABELS[section.items[0].pack] : null;
          const packType = section.items[0]?.pack || 'core';
          const requiredTier = PACK_TIER[packType] || 'starter';
          const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);
          const isPackSection = userTierIndex < requiredTierIndex;
          return (
            <div key={si} className={section.title ? 'mb-1.5 mt-3' : 'mb-1'}>
              {!collapsed && section.title && (
                <div className="mb-1 px-3 flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{section.title}</span>
                  {isPackSection && packInfo && <span className="text-[8px]">{packInfo.emoji}</span>}
                </div>
              )}
              {collapsed && section.title && <div className="mx-auto my-2 h-px w-6 bg-border" />}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isLocked = isPackSection;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg py-1.5 text-sm transition-colors mb-px ${
                      collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                    } ${
                      isActive
                        ? 'bg-surface font-semibold text-text'
                        : isLocked
                          ? 'text-text-muted/60 hover:bg-surface hover:text-text-sub'
                          : 'text-text-sub hover:bg-surface hover:text-text'
                    }`}
                  >
                    <Icon size={collapsed ? 17 : 15} className={isActive ? 'text-text' : isLocked ? 'text-text-muted/40' : 'text-text-muted'} />
                    {!collapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {!collapsed && isLocked && (
                      <Lock size={10} className="shrink-0 text-text-muted/30" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* 하단: ⓒ SmarComm / Powered by Ten:One™ */}
      <div className="shrink-0 border-t border-border px-3 py-3">
        {collapsed ? (
          <div className="text-center text-[8px] text-text-muted leading-tight">
            <span className="font-light">S</span><span className="font-bold">C</span><span className="font-bold">.</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm font-semibold text-text-sub">ⓒ <span className="font-light">Smar</span>Comm</div>
            <div className="text-[10px] text-text-muted">Powered by <a href="https://tenone.biz" target="_blank" rel="noopener noreferrer" className="hover:text-text-sub transition-colors">Ten:One™</a></div>
          </div>
        )}
      </div>
    </aside>

    {/* 접기/펼치기 버튼 — 사이드바 바깥 오른쪽, 기업명 바로 아래 높이 */}
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={`fixed z-50 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-border bg-white text-text-muted shadow-sm transition-all duration-200 hover:text-text hover:bg-surface hover:w-5 ${
        collapsed ? 'left-[56px]' : 'left-[224px]'
      }`}
      style={{ top: '52px' }}
      title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
    >
      {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
    </button>
    </>
  );
}
