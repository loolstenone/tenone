/**
 * Intra 사이드바 네비게이션 데이터 & 유틸리티
 * IntraSidebar + IntraSubTabs 양쪽에서 import
 */

import {
    LayoutDashboard, FileText, MessageSquareText,
    LogOut, ChevronDown, ChevronRight,
    FolderKanban, ClipboardList, Clock, UserPlus, Palette,
    Workflow, Calendar, Contact, Globe, FolderOpen,
    Megaphone, TrendingUp, Handshake, Activity, BarChart3, Building2, Tags, Upload,
    Share2, Star, Gauge,
    UserCheck, Target, GitBranch, GraduationCap, DollarSign, CreditCard, Receipt,
    Briefcase, CalendarCheck, Wallet, Award, FileCheck, Heart,
    Calculator, CircleDollarSign, FileSpreadsheet,
    Stamp, Settings, Shield, GitMerge,
    FolderGit2, PackageCheck, FileSignature, ClipboardCheck, Factory, Gavel,
    ListTodo, CheckSquare, Inbox,
    BookOpen, Compass, HelpCircle,
    ShoppingCart, Gift, CalendarClock, LayoutGrid, PenSquare, MessageCircle, Flame,
    Bot, Users, Home, Menu, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SystemAccess, IntraModule } from "@/types/auth";

export interface SubItem {
    name: string;
    href: string;
}

export interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: SubItem[];
    staffOnly?: boolean;
}

export interface MenuSection {
    label?: string;
    items: MenuItem[];
}

export interface NavModule {
    name: string;
    href: string;
    icon: LucideIcon;
    access?: SystemAccess;
    intraModule?: IntraModule;
    sections: MenuSection[];
    dynamic?: boolean;
}

export const modules: NavModule[] = [
    {
        name: "Myverse", href: "/intra/myverse", icon: Inbox, intraModule: "myverse" as IntraModule,
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
        name: "Townity", href: "/intra/comm", icon: MessageSquareText, intraModule: "townity" as IntraModule,
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
        name: "Project", href: "/intra/project", icon: FolderKanban, intraModule: "project" as IntraModule,
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
        name: "HeRo", href: "/intra/hero/hit", icon: Award, intraModule: "hero" as IntraModule,
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
        name: "Evolution School", href: "/intra/evolution-school", icon: GraduationCap, intraModule: "evolution" as IntraModule,
        sections: [
            {
                items: [
                    { name: "전체 과정", href: "/intra/evolution-school", icon: GraduationCap },
                ],
            },
        ],
    },
    {
        name: "SmarComm.", href: "/intra/studio", icon: Megaphone, intraModule: "smarcomm" as IntraModule,
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
                    { name: "Performance", href: "/intra/marketing/performance", icon: Gauge, staffOnly: true },
                    { name: "Influencers", href: "/intra/marketing/influencers", icon: Star, staffOnly: true },
                    { name: "Social", href: "/intra/marketing/social", icon: Share2, staffOnly: true },
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
        name: "Wiki", href: "/intra/wiki", icon: BookOpen, intraModule: "wiki" as IntraModule,
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
        name: "ERP", href: "/intra/erp", icon: Building2, access: "erp-hr", intraModule: "erp" as IntraModule,
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
                    { name: "결재라인 설정", href: "/intra/erp/settings/approval-line", icon: GitMerge },
                    { name: "권한 설정", href: "/intra/erp/settings/permissions", icon: Shield },
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
        name: "Universe", href: "/intra/universe", icon: Globe, intraModule: "universe" as IntraModule,
        sections: [
            {
                items: [
                    { name: "대시보드", href: "/intra/universe", icon: LayoutDashboard },
                ],
            },
            {
                label: "MEMBERS",
                items: [
                    { name: "통합 회원", href: "/intra/universe/members", icon: Users },
                    { name: "게스트 관리", href: "/intra/universe/guests", icon: UserPlus },
                    { name: "개인정보", href: "/intra/universe/privacy", icon: Shield },
                ],
            },
            {
                label: "SITES",
                items: [
                    { name: "사이트 관리", href: "/intra/bums/sites", icon: Globe },
                    { name: "게시판 관리", href: "/intra/bums/boards", icon: LayoutGrid },
                    { name: "콘텐츠 관리", href: "/intra/bums/content", icon: PenSquare },
                    { name: "뉴스레터", href: "/intra/bums/newsletter", icon: MessageSquareText },
                    { name: "트렌드 관리", href: "/intra/mindle", icon: Flame },
                ],
            },
            {
                label: "COMMERCE",
                items: [
                    { name: "구독 관리", href: "/intra/universe/subscriptions", icon: CreditCard },
                    { name: "쇼핑 관리", href: "/intra/bums/shop", icon: ShoppingCart },
                    { name: "예약/이벤트", href: "/intra/universe/bookings", icon: Calendar },
                    { name: "프로모션", href: "/intra/bums/promotion", icon: Gift },
                ],
            },
            {
                label: "OPERATIONS",
                items: [
                    { name: "손익 관리", href: "/intra/universe/revenue", icon: TrendingUp },
                    { name: "통계", href: "/intra/bums/stats", icon: BarChart3 },
                    { name: "고객문의", href: "/intra/bums/inquiry", icon: MessageCircle },
                    { name: "라이브러리", href: "/intra/bums/library", icon: FolderOpen },
                ],
            },
            {
                label: "EDUCATION",
                items: [
                    { name: "교육 관리", href: "/intra/universe/education", icon: GraduationCap },
                ],
            },
        ],
        dynamic: true,
    },
    {
        name: "Agent", href: "/intra/agent", icon: Bot, intraModule: "agent" as IntraModule,
        sections: [],
    },
];

// ── 서브 탭 감지 ──────────────────────────────────────────────

/**
 * 현재 pathname에 해당하는 children 탭 목록 반환.
 * 부모 href가 가장 긴 항목을 우선 (prefix 충돌 방지).
 */
export function findSubItems(pathname: string): SubItem[] | null {
    let best: { children: SubItem[]; len: number } | null = null;

    for (const mod of modules) {
        for (const section of mod.sections) {
            for (const item of section.items) {
                if (!item.children) continue;

                const isParent = pathname === item.href;
                const isChild = item.children.some(
                    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                );

                if (isParent || isChild) {
                    const len = item.href.length;
                    if (!best || len > best.len) {
                        best = { children: item.children, len };
                    }
                }
            }
        }
    }

    return best?.children ?? null;
}

/**
 * 탭 목록 중 현재 pathname에 해당하는 active 탭 href (가장 긴 prefix 우선).
 */
export function getActiveSubHref(pathname: string, children: SubItem[]): string | null {
    let best: { href: string; len: number } | null = null;

    for (const child of children) {
        const match = pathname === child.href || pathname.startsWith(child.href + "/");
        if (match) {
            if (!best || child.href.length > best.len) {
                best = { href: child.href, len: child.href.length };
            }
        }
    }

    return best?.href ?? null;
}
