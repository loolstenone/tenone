"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
    LayoutDashboard, User, Users, BookOpen, FileText, MessageSquareText,
    LogOut, Home, ChevronDown, ChevronRight, Menu, X as XIcon,
    // Project
    FolderKanban, ClipboardList, Clock, UserPlus, Palette, Plus,
    Workflow, Calendar, Contact, Globe, FolderOpen,
    Megaphone, TrendingUp, Handshake, Activity, BarChart3, Building2, Tags, Upload,
    // ERP - HR
    UserCheck, Target, GitBranch, GraduationCap, DollarSign, CreditCard, Receipt,
    Briefcase, CalendarCheck, Wallet, Award, FileCheck, Heart,
    // ERP - Finance
    Calculator, CircleDollarSign, FileSpreadsheet,
    // ERP - Approval & Settings
    Stamp, Settings, Shield, GitMerge,
    // ERP - Business
    FolderGit2, PackageCheck, FileSignature, ClipboardCheck, Factory, Gavel,
    // Todo & Myverse
    ListTodo, CheckSquare, Inbox,
    // Wiki
    Compass, HelpCircle,
    // BUMS
    ShoppingCart, Gift, CalendarClock, LayoutGrid, PenSquare, MessageCircle,
} from "lucide-react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { SystemAccess, IntraModule } from "@/types/auth";

interface SubItem {
    name: string;
    href: string;
}

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: SubItem[];
    staffOnly?: boolean; // staff만 표시
}

interface MenuSection {
    label?: string;
    items: MenuItem[];
}

interface NavModule {
    name: string;
    href: string;
    icon: LucideIcon;
    access?: SystemAccess;
    intraModule?: IntraModule; // People 유형 기반 접근 제어
    sections: MenuSection[];
    dynamic?: boolean; // 경로에 따라 동적 메뉴 생성
}

const modules: NavModule[] = [
    {
        name: "Myverse", href: "/intra/myverse", icon: Inbox, intraModule: 'myverse' as IntraModule,
        sections: [
            {
                items: [
                    { name: "Dashboard", href: "/intra/myverse", icon: LayoutDashboard },
                    { name: "메신저", href: "/intra/myverse/messenger", icon: MessageSquareText },
                    { name: "Todo", href: "/intra/myverse/todo", icon: ListTodo },
                    { name: "타임시트 입력", href: "/intra/myverse/timesheet", icon: Clock },
                    { name: "결재", href: "/intra/myverse/approval", icon: Stamp, staffOnly: true },
                    { name: "GPR", href: "/intra/myverse/gpr", icon: Target, staffOnly: true },
                    { name: "근태", href: "/intra/myverse/attendance", icon: CalendarCheck, staffOnly: true },
                    { name: "급여", href: "/intra/myverse/payroll", icon: Wallet, staffOnly: true },
                    { name: "경비", href: "/intra/myverse/expenses", icon: CreditCard, staffOnly: true },
                    { name: "포인트", href: "/intra/myverse/points", icon: Award },
                    { name: "Library", href: "/intra/myverse/library", icon: FolderOpen },
                ],
            },
        ],
    },
    {
        name: "Townity", href: "/intra/comm", icon: MessageSquareText, intraModule: 'townity' as IntraModule,
        sections: [
            {
                items: [
                    { name: "공지사항", href: "/intra/comm/notice", icon: ClipboardList },
                    { name: "자유게시판", href: "/intra/comm/free", icon: FileText },
                    { name: "전체 일정", href: "/intra/comm/calendar", icon: Calendar },
                ],
            },
        ],
    },
    {
        name: "Project", href: "/intra/project", icon: FolderKanban, intraModule: 'project' as IntraModule,
        sections: [
            {
                items: [
                    { name: "프로젝트 관리", href: "/intra/project/management", icon: ClipboardList },
                    { name: "Job 관리", href: "/intra/project/jobs", icon: Briefcase },
                    { name: "타임시트", href: "/intra/project/timesheet", icon: Clock },
                    { name: "Partner Pool", href: "/intra/partner-pool", icon: Users },
                ],
            },
        ],
    },
    {
        name: "HeRo", href: "/intra/hero/hit", icon: Award, intraModule: 'hero' as IntraModule,
        sections: [
            {
                items: [
                    {
                        name: "HIT 검사", href: "/intra/hero/hit", icon: Target,
                        children: [
                            { name: "검사 실시", href: "/intra/hero/hit" },
                            { name: "결과 리포트", href: "/intra/hero/hit/report" },
                        ],
                    },
                    {
                        name: "이력서", href: "/intra/hero/resume", icon: FileText,
                        children: [
                            { name: "이력서 작성", href: "/intra/hero/resume" },
                            { name: "AI 컨설팅", href: "/intra/hero/resume/consulting" },
                        ],
                    },
                    {
                        name: "커리어 개발", href: "/intra/hero/career", icon: TrendingUp,
                        children: [
                            { name: "역량 진단", href: "/intra/hero/career" },
                            { name: "성장 로드맵", href: "/intra/hero/career/roadmap" },
                            { name: "멘토 매칭", href: "/intra/hero/career/mentor" },
                        ],
                    },
                    { name: "퍼스널 브랜딩", href: "/intra/hero/branding", icon: Award },
                ],
            },
        ],
    },
    {
        name: "Evolution School", href: "/intra/evolution-school", icon: GraduationCap, intraModule: 'evolution' as IntraModule,
        sections: [
            {
                items: [
                    { name: "전체 과정", href: "/intra/evolution-school", icon: GraduationCap },
                ],
            },
        ],
    },
    {
        name: "SmarComm.", href: "/intra/studio", icon: Megaphone, intraModule: 'smarcomm' as IntraModule,
        sections: [
            {
                label: "STUDIO",
                items: [
                    {
                        name: "Workflow", href: "/intra/studio/workflow", icon: Workflow,
                        children: [
                            { name: "Pipeline", href: "/intra/studio/workflow/pipeline" },
                            { name: "Kanban", href: "/intra/studio/workflow/kanban" },
                            { name: "Automation", href: "/intra/studio/workflow/automation" },
                        ],
                    },
                    { name: "Schedule", href: "/intra/studio/schedule", icon: Calendar },
                    { name: "Assets", href: "/intra/studio/assets", icon: FolderOpen },
                    { name: "Brands", href: "/intra/studio/brands", icon: Palette },
                    { name: "Universe", href: "/intra/studio/universe", icon: Globe },
                ],
            },
            {
                label: "MARKETING",
                items: [
                    { name: "Campaigns", href: "/intra/marketing/campaigns", icon: Megaphone, staffOnly: true },
                    { name: "Leads", href: "/intra/marketing/leads", icon: TrendingUp, staffOnly: true },
                    { name: "Deals", href: "/intra/marketing/deals", icon: Handshake, staffOnly: true },
                    { name: "Activities", href: "/intra/marketing/activities", icon: Activity },
                    { name: "Contacts", href: "/intra/marketing/crm/people", icon: Contact, staffOnly: true },
                    { name: "Analytics", href: "/intra/marketing/analytics", icon: BarChart3, staffOnly: true },
                ],
            },
            {
                label: "OPPORTUNITY",
                items: [
                    { name: "Opportunity", href: "/intra/opportunity", icon: TrendingUp },
                ],
            },
        ],
    },
    {
        name: "Wiki", href: "/intra/wiki", icon: BookOpen, intraModule: 'wiki' as IntraModule,
        sections: [
            {
                label: "문화 · 안내",
                items: [
                    { name: "Culture", href: "/intra/wiki/culture", icon: BookOpen },
                    { name: "Onboarding", href: "/intra/wiki/onboarding", icon: Compass },
                    { name: "Handbook", href: "/intra/wiki/handbook", icon: FileText },
                    { name: "FAQ", href: "/intra/wiki/faq", icon: HelpCircle },
                ],
            },
            {
                label: "지식 공유",
                items: [
                    { name: "Library", href: "/intra/wiki/library", icon: FolderOpen },
                ],
            },
        ],
    },
    {
        name: "ERP", href: "/intra/erp", icon: Building2, access: "erp-hr", intraModule: 'erp' as IntraModule,
        sections: [
            {
                items: [
                    { name: "BI Dashboard", href: "/intra/erp/bi", icon: BarChart3 },
                ],
            },
            {
                label: "전자결재",
                items: [
                    {
                        name: "결재함", href: "/intra/erp/approval", icon: Stamp,
                        children: [
                            { name: "결재 대기", href: "/intra/erp/approval" },
                            { name: "결재 진행", href: "/intra/erp/approval/progress" },
                            { name: "결재 완료", href: "/intra/erp/approval/completed" },
                        ],
                    },
                    {
                        name: "기안하기", href: "/intra/erp/approval/draft", icon: FileSignature,
                        children: [
                            { name: "기안", href: "/intra/erp/approval/draft" },
                            { name: "품의", href: "/intra/erp/approval/draft/expenditure" },
                            { name: "보고", href: "/intra/erp/approval/draft/report" },
                        ],
                    },
                ],
            },
            {
                label: "GPR",
                items: [
                    {
                        name: "GPR", href: "/intra/erp/gpr", icon: Target,
                        children: [
                            { name: "전사 현황", href: "/intra/erp/gpr" },
                            { name: "목표 캐스케이드", href: "/intra/erp/gpr/cascade" },
                            { name: "평가", href: "/intra/erp/gpr/evaluation" },
                            { name: "인센티브", href: "/intra/erp/gpr/incentive" },
                        ],
                    },
                ],
            },
            {
                label: "HR",
                items: [
                    {
                        name: "People", href: "/intra/erp/hr/people", icon: Users,
                        children: [
                            { name: "전체 구성원", href: "/intra/erp/hr/people" },
                            { name: "직원 관리", href: "/intra/erp/hr/staff" },
                            { name: "조직도", href: "/intra/erp/hr/people/org" },
                            { name: "구성원 등록", href: "/intra/erp/hr/staff/register" },
                            { name: "MADLeague 동아리", href: "/intra/erp/hr/people/clubs" },
                            { name: "권한위임", href: "/intra/erp/hr/people/delegation" },
                        ],
                    },
                    { name: "근태관리", href: "/intra/erp/hr/attendance", icon: CalendarCheck },
                    { name: "급여관리", href: "/intra/erp/hr/payroll", icon: Wallet },
                    { name: "포인트관리", href: "/intra/erp/hr/points", icon: Award },
                    { name: "교육관리", href: "/intra/erp/hr/education", icon: GraduationCap },
                    { name: "제증명서", href: "/intra/erp/hr/certificates", icon: FileCheck },
                    { name: "가족관리", href: "/intra/erp/hr/family", icon: Heart },
                    {
                        name: "인재관리", href: "/intra/erp/hr/talent", icon: Users,
                        children: [
                            { name: "Talent Pool", href: "/intra/erp/hr/talent" },
                            { name: "Pipeline", href: "/intra/erp/hr/talent/pipeline" },
                            { name: "Programs", href: "/intra/erp/hr/talent/programs" },
                        ],
                    },
                ],
            },
            {
                label: "PROJECT",
                items: [
                    { name: "프로젝트 손익", href: "/intra/project/financials", icon: BarChart3 },
                    { name: "입찰관리", href: "/intra/project/management/bidding", icon: Gavel },
                    { name: "협력사", href: "/intra/project/management/vendors", icon: Handshake },
                    { name: "투입인원단가", href: "/intra/erp/project/rates", icon: DollarSign },
                ],
            },
            {
                label: "경영관리",
                items: [
                    {
                        name: "경영 계획", href: "/intra/erp/biz/plan", icon: Target,
                        children: [
                            { name: "연간 경영계획", href: "/intra/erp/biz/plan" },
                            { name: "부문별 계획", href: "/intra/erp/biz/plan/division" },
                        ],
                    },
                    {
                        name: "경영 관리", href: "/intra/erp/biz/manage", icon: ClipboardList,
                        children: [
                            { name: "월별 추정", href: "/intra/erp/biz/manage" },
                            { name: "실적 확정", href: "/intra/erp/biz/manage/actual" },
                            { name: "Gap 분석", href: "/intra/erp/biz/manage/gap" },
                        ],
                    },
                    {
                        name: "경영 분석", href: "/intra/erp/biz/analysis", icon: BarChart3,
                        children: [
                            { name: "손익 현황", href: "/intra/erp/biz/analysis" },
                            { name: "부문별 이익률", href: "/intra/erp/biz/analysis/division" },
                            { name: "프로젝트 수익성", href: "/intra/erp/biz/analysis/project" },
                            { name: "비용 분석", href: "/intra/erp/biz/analysis/cost" },
                        ],
                    },
                ],
            },
            {
                label: "FINANCE",
                items: [
                    {
                        name: "경비관리", href: "/intra/erp/finance/expenses", icon: CreditCard,
                        children: [
                            { name: "경비처리", href: "/intra/erp/finance/expenses" },
                            { name: "경비품의서", href: "/intra/erp/finance/expenses/request" },
                        ],
                    },
                    { name: "법인카드", href: "/intra/erp/finance/card", icon: Wallet },
                    { name: "경리리포트", href: "/intra/erp/finance/reports", icon: FileSpreadsheet },
                    {
                        name: "청구/지급", href: "/intra/erp/finance/billing", icon: CircleDollarSign,
                        children: [
                            { name: "청구관리", href: "/intra/erp/finance/billing" },
                            { name: "지급관리", href: "/intra/erp/finance/billing/payment" },
                        ],
                    },
                ],
            },
            {
                label: "운영설정",
                items: [
                    {
                        name: "결재라인 설정", href: "/intra/erp/settings/approval-line", icon: GitMerge,
                    },
                    {
                        name: "권한 설정", href: "/intra/erp/settings/permissions", icon: Shield,
                    },
                    {
                        name: "HR 설정", href: "/intra/erp/settings/hr", icon: Settings,
                        children: [
                            { name: "직급/직책 관리", href: "/intra/erp/settings/hr" },
                            { name: "부서 관리", href: "/intra/erp/settings/hr/departments" },
                            { name: "근무형태 설정", href: "/intra/erp/settings/hr/work-type" },
                        ],
                    },
                    {
                        name: "Finance 설정", href: "/intra/erp/settings/finance", icon: Settings,
                        children: [
                            { name: "계정과목 관리", href: "/intra/erp/settings/finance" },
                            { name: "예산 설정", href: "/intra/erp/settings/finance/budget" },
                            { name: "결산 설정", href: "/intra/erp/settings/finance/closing" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: "BUMS", href: "/intra/bums", icon: FileText, intraModule: 'bums' as IntraModule,
        sections: [
            {
                items: [
                    { name: "대시보드", href: "/intra/bums/dashboard", icon: LayoutDashboard },
                    { name: "통계", href: "/intra/bums/stats", icon: BarChart3 },
                    { name: "고객 관리", href: "/intra/bums/customers", icon: Users },
                    { name: "고객문의", href: "/intra/bums/inquiry", icon: MessageCircle },
                    { name: "쇼핑 관리", href: "/intra/bums/shop", icon: ShoppingCart },
                    { name: "예약 관리", href: "/intra/bums/reservations", icon: CalendarClock },
                    { name: "프로모션", href: "/intra/bums/promotion", icon: Gift },
                    { name: "마케팅 관리", href: "/intra/bums/marketing", icon: Megaphone },
                    { name: "사이트 관리", href: "/intra/bums/sites", icon: Globe },
                    { name: "게시판 관리", href: "/intra/bums/boards", icon: LayoutGrid },
                    { name: "콘텐츠 관리", href: "/intra/bums/content", icon: PenSquare },
                    { name: "뉴스레터 관리", href: "/intra/bums/newsletter", icon: MessageSquareText },
                    { name: "전체 일정 관리", href: "/intra/bums/schedule", icon: Calendar },
                    { name: "라이브러리 관리", href: "/intra/bums/library", icon: FolderOpen },
                ],
            },
        ],
        dynamic: true, // 사이트 진입 시 동적 메뉴 생성
    },
];

export function IntraSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isStaff, hasAccess, hasModuleAccess, logout } = useAuth();
    const getSiteById = (_id: string): any => null;
    const getBoardsBySite = (_id: string): any[] => [];
    const getPostsByBoard = (_id: string): any[] => [];
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [mobileOpen, setMobileOpen] = useState(false);

    // BUMS 사이트 진입 감지 — /intra/bums/sites/{siteId}/... 경로에서 siteId 추출
    const siteMatch = pathname.match(/^\/intra\/bums\/sites\/([^/]+)/);
    const activeSiteId = siteMatch ? siteMatch[1] : null;
    const activeSite = activeSiteId ? getSiteById(activeSiteId) : null;
    const siteBoards = activeSiteId ? getBoardsBySite(activeSiteId) : [];

    // 경로 변경 시 모바일 사이드바 닫기
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Auto-expand active module and items
    useEffect(() => {
        const newModules = new Set<string>();
        const newItems = new Set<string>();

        for (const mod of modules) {
            // Myverse는 다양한 경로를 포함 — href 매칭 + 하위 메뉴 href 매칭
            let isModuleActive = pathname.startsWith(mod.href);
            for (const section of mod.sections) {
                for (const item of section.items) {
                    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
                        isModuleActive = true;
                    }
                    if (item.children) {
                        const isChildActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
                        if (isChildActive) {
                            isModuleActive = true;
                            newItems.add(item.name);
                        }
                    }
                }
            }
            if (isModuleActive) newModules.add(mod.name);
        }

        // BUMS 사이트 진입 시 콘텐츠 메뉴 자동 펼침
        if (activeSiteId && (pathname.includes('/content') || pathname.includes('/boards/'))) {
            newItems.add(`site-content-${activeSiteId}`);
        }

        setExpandedModules(newModules);
        setExpandedItems(newItems);
    }, [pathname]);

    const toggleModule = (name: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleItem = (name: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + '/');
    };

    // Filter modules by access (SystemAccess + IntraModule)
    const visibleModules = modules.filter(mod => {
        // People 유형 기반 제어 (intraModule)
        if (mod.intraModule && !hasModuleAccess(mod.intraModule)) return false;
        // SystemAccess 기반 세부 제어 (ERP/Project)
        if (mod.access && !hasAccess(mod.access)) return false;
        return true;
    });

    return (
        <>
        {/* 모바일 햄버거 버튼 */}
        <button onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-neutral-900 text-white rounded-md shadow-lg">
            <Menu className="h-5 w-5" />
        </button>

        {/* 모바일 오버레이 */}
        {mobileOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-[55]" onClick={() => setMobileOpen(false)} />
        )}

        <aside className={clsx(
            "fixed left-0 top-0 bottom-0 w-[240px] bg-neutral-900 text-white flex flex-col z-[60] transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Logo */}
            <div className="px-5 h-14 flex items-center border-b border-neutral-800 shrink-0">
                <Link href="/intra" className="text-lg font-bold tracking-wider text-white hover:opacity-80 transition-opacity">
                    TEN<span className="font-light">:</span>ONE<span className="text-[8px] align-super">™</span>
                </Link>
                <span className="ml-2 text-[9px] tracking-widest text-neutral-500 uppercase">Intra</span>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 text-neutral-400 hover:text-white">
                    <XIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Modules */}
            <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                {visibleModules.map(mod => {
                    const isModuleActive = pathname.startsWith(mod.href);
                    const isExpanded = expandedModules.has(mod.name);
                    const hasSections = mod.sections.length > 0;

                    return (
                        <div key={mod.name}>
                            {/* Module header */}
                            <button
                                onClick={() => {
                                    if (hasSections) toggleModule(mod.name);
                                    else router.push(mod.href);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-all",
                                    isModuleActive
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                                )}>
                                <mod.icon className={clsx("h-4 w-4 shrink-0", isModuleActive ? "text-white" : "text-neutral-500")} />
                                <span className="flex-1 text-left">{mod.name}</span>
                                {hasSections && (
                                    isExpanded
                                        ? <ChevronDown className="h-3 w-3 text-neutral-500" />
                                        : <ChevronRight className="h-3 w-3 text-neutral-500" />
                                )}
                            </button>

                            {/* Expanded sub-menu */}
                            {isExpanded && hasSections && (
                                <div className="ml-3 pl-3 border-l border-neutral-800 mt-1 space-y-1">
                                    {mod.sections.map((section, sIdx) => (
                                        <div key={sIdx}>
                                            {section.label && (
                                                <p className="text-[9px] tracking-widest text-neutral-600 uppercase px-3 pt-3 pb-1">
                                                    {section.label}
                                                </p>
                                            )}
                                            {section.items.filter(item => !item.staffOnly || isStaff).map(item => (
                                                <div key={item.name}>
                                                    {item.children ? (
                                                        <>
                                                            <button
                                                                onClick={() => toggleItem(item.name)}
                                                                className={clsx(
                                                                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                                    isActive(item.href)
                                                                        ? "text-white font-medium"
                                                                        : "text-neutral-500 hover:text-white"
                                                                )}>
                                                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="flex-1 text-left">{item.name}</span>
                                                                {expandedItems.has(item.name)
                                                                    ? <ChevronDown className="h-2.5 w-2.5 text-neutral-600" />
                                                                    : <ChevronRight className="h-2.5 w-2.5 text-neutral-600" />
                                                                }
                                                            </button>
                                                            {expandedItems.has(item.name) && (
                                                                <div className="ml-5 space-y-0.5 mt-0.5">
                                                                    {item.children.map(child => (
                                                                        <Link key={child.href} href={child.href}
                                                                            className={clsx(
                                                                                "block px-3 py-1 text-[11px] rounded transition-all",
                                                                                isActive(child.href, true)
                                                                                    ? "text-white bg-white/10"
                                                                                    : "text-neutral-500 hover:text-neutral-300"
                                                                            )}>
                                                                            {child.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Link href={item.href}
                                                            className={clsx(
                                                                "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                                isActive(item.href)
                                                                    ? "text-white font-medium bg-white/5"
                                                                    : "text-neutral-500 hover:text-white"
                                                            )}>
                                                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                                                            {item.name}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                    {/* 동적 사이트 관리 메뉴 (BUMS 사이트 진입 시) */}
                                    {mod.dynamic && activeSite && activeSiteId && (
                                        <div className="mt-2 pt-2 border-t border-neutral-800">
                                            <p className="text-[9px] tracking-widest text-neutral-600 uppercase px-3 pt-1 pb-1">
                                                {activeSite.name}
                                            </p>
                                            {/* 대시보드 */}
                                            <Link href={`/intra/bums/sites/${activeSiteId}`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}`, true)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}>
                                                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                                                대시보드
                                            </Link>
                                            {/* 콘텐츠 */}
                                            <button
                                                onClick={() => toggleItem(`site-content-${activeSiteId}`)}
                                                className={clsx(
                                                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    pathname.includes('/content') || pathname.includes('/boards/')
                                                        ? "text-white font-medium"
                                                        : "text-neutral-500 hover:text-white"
                                                )}>
                                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                                <span className="flex-1 text-left">콘텐츠</span>
                                                <span className="text-[10px] text-neutral-600 mr-1">
                                                    {siteBoards.reduce((s, b) => s + getPostsByBoard(b.id).length, 0)}
                                                </span>
                                                {expandedItems.has(`site-content-${activeSiteId}`)
                                                    ? <ChevronDown className="h-2.5 w-2.5 text-neutral-600" />
                                                    : <ChevronRight className="h-2.5 w-2.5 text-neutral-600" />
                                                }
                                            </button>
                                            {expandedItems.has(`site-content-${activeSiteId}`) && (
                                                <div className="ml-5 space-y-0.5 mt-0.5">
                                                    <Link href={`/intra/bums/sites/${activeSiteId}/content`}
                                                        className={clsx(
                                                            "block px-3 py-1 text-[11px] rounded transition-all",
                                                            isActive(`/intra/bums/sites/${activeSiteId}/content`, true)
                                                                ? "text-white bg-white/10"
                                                                : "text-neutral-500 hover:text-neutral-300"
                                                        )}>
                                                        전체 게시물
                                                    </Link>
                                                    {siteBoards.map(board => (
                                                        <Link key={board.id} href={`/intra/bums/sites/${activeSiteId}/boards/${board.id}`}
                                                            className={clsx(
                                                                "flex items-center justify-between px-3 py-1 text-[11px] rounded transition-all",
                                                                isActive(`/intra/bums/sites/${activeSiteId}/boards/${board.id}`)
                                                                    ? "text-white bg-white/10"
                                                                    : "text-neutral-500 hover:text-neutral-300"
                                                            )}>
                                                            <span className="truncate">{board.name}</span>
                                                            <span className="text-[10px] text-neutral-600">{getPostsByBoard(board.id).length}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                            {/* 통계 */}
                                            <Link href={`/intra/bums/sites/${activeSiteId}/analytics`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}/analytics`)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}>
                                                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                                                통계
                                            </Link>
                                            {/* 설정 */}
                                            <Link href={`/intra/bums/sites/${activeSiteId}/settings`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}/settings`)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}>
                                                <Settings className="h-3.5 w-3.5 shrink-0" />
                                                설정
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-neutral-800 shrink-0">
                <Link href="/"
                    className="flex items-center gap-3 px-6 py-2.5 text-xs text-neutral-500 hover:text-white transition-colors">
                    ←]
                </Link>
                {user && (
                    <div className="px-4 py-3 flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-neutral-700 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                            {user.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-neutral-200 truncate">{user.name}</p>
                            <p className="text-[9px] text-neutral-500 truncate">{user.role}</p>
                        </div>
                        <button onClick={() => { router.push('/'); setTimeout(() => logout(), 100); }}
                            className="p-1 text-neutral-600 hover:text-white transition-colors shrink-0" title="로그아웃">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
        </>
    );
}
