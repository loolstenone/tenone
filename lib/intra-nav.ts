/**
 * Intra 사이드바 네비게이션 데이터 & 유틸리티
 * IntraSidebar + IntraSubTabs 양쪽에서 import
 *
 * 모듈 체계 (5개):
 *  MY        — 개인 워크스페이스 (대시보드, 메신저, Todo, 타임시트, 포인트)
 *  UNIVERSE  — 브랜드/회원 통합 관리 (UMS + 브랜드별)
 *  MARKETING — 캠페인·CRM·콘텐츠 스튜디오·위키
 *  ERP       — HR·GPR·재무·프로젝트·경영관리
 *  INTEL     — Analytics·Mindle·Agent Hub
 */

import {
    LayoutDashboard, FileText, MessageSquareText,
    ChevronDown, ChevronRight,
    FolderKanban, ClipboardList, Clock, Palette,
    Workflow, Calendar, Contact, Globe, FolderOpen,
    Megaphone, TrendingUp, Handshake, Activity, BarChart3, Building2, Tags,
    Share2, Star, Gauge,
    UserCheck, Target, GitBranch, GraduationCap, DollarSign, CreditCard, Receipt,
    Briefcase, CalendarCheck, Wallet, Award, FileCheck, Heart,
    Calculator, CircleDollarSign, FileSpreadsheet,
    Stamp, Settings, Shield, GitMerge,
    Gavel, FileSignature,
    ListTodo, CheckSquare, Inbox,
    BookOpen, Compass, HelpCircle,
    ShoppingCart, CalendarClock, LayoutGrid, MessageCircle, Flame,
    Bot, Users, Home, Menu, X, Radio, Mail, Brain, LineChart, Map, RefreshCw,
    Zap, Layers, PenTool, Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SystemAccess, IntraModule } from "@/types/auth";

export interface SubItem {
    name: string;
    href: string;
    badge?: "soon" | "beta" | "new";
}

export interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: SubItem[];
    staffOnly?: boolean;
    exact?: boolean;
    badge?: "soon" | "beta" | "new";
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

    // ══════════════════════════════════════════════════════════
    //  MY — 개인 워크스페이스
    // ══════════════════════════════════════════════════════════
    {
        name: "MY",
        href: "/intra/workspace",
        icon: Home,
        intraModule: "myverse" as IntraModule,
        sections: [
            {
                items: [
                    { name: "대시보드", href: "/intra/workspace", icon: LayoutDashboard, exact: true },
                    { name: "메신저", href: "/intra/workspace/messenger", icon: MessageSquareText },
                    { name: "Todo", href: "/intra/workspace/todo", icon: ListTodo },
                    { name: "타임시트", href: "/intra/workspace/timesheet", icon: Clock },
                    { name: "받은 문서", href: "/intra/workspace/approval", icon: Inbox, staffOnly: true },
                    { name: "포인트", href: "/intra/workspace/points", icon: Award },
                    { name: "Library", href: "/intra/workspace/library", icon: FolderOpen },
                ],
            },
            {
                label: "커뮤니티",
                items: [
                    { name: "공지사항", href: "/intra/comm/notice", icon: ClipboardList },
                    { name: "자유게시판", href: "/intra/comm/free", icon: FileText },
                    { name: "전체 일정", href: "/intra/comm/calendar", icon: Calendar },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════
    //  UNIVERSE — 브랜드/회원 통합 관리
    // ══════════════════════════════════════════════════════════
    {
        name: "UNIVERSE",
        href: "/intra/ums",
        icon: Globe,
        intraModule: "universe" as IntraModule,
        sections: [
            {
                label: "통합 관리",
                items: [
                    { name: "대시보드", href: "/intra/ums", icon: LayoutDashboard, exact: true },
                    {
                        name: "통합 회원", href: "/intra/ums/members", icon: Users,
                        children: [
                            { name: "전체 회원", href: "/intra/ums/members/list" },
                            { name: "초대", href: "/intra/ums/members/invite" },
                            { name: "게스트", href: "/intra/ums/members/guests" },
                            { name: "개인정보", href: "/intra/ums/members/privacy" },
                        ],
                    },
                    {
                        name: "사이트 관리", href: "/intra/ums/sites", icon: Globe,
                        children: [
                            { name: "사이트 목록", href: "/intra/ums/sites/list" },
                            { name: "게시판", href: "/intra/ums/sites/boards" },
                            { name: "콘텐츠", href: "/intra/ums/sites/content" },
                            { name: "뉴스룸", href: "/intra/ums/sites/newsroom" },
                        ],
                    },
                    {
                        name: "뉴스레터", href: "/intra/ums/newsletter", icon: Mail,
                        children: [
                            { name: "대시보드", href: "/intra/ums/newsletter" },
                            { name: "뉴스레터 관리", href: "/intra/ums/newsletter/issues" },
                            { name: "구독자", href: "/intra/ums/newsletter/subscribers" },
                        ],
                    },
                    {
                        name: "커머스", href: "/intra/ums/commerce", icon: ShoppingCart,
                        children: [
                            { name: "구독", href: "/intra/ums/commerce/subscriptions" },
                            { name: "쇼핑", href: "/intra/ums/commerce/shop" },
                            { name: "예약/이벤트", href: "/intra/ums/commerce/bookings" },
                            { name: "프로모션", href: "/intra/ums/commerce/promotions" },
                            { name: "손익", href: "/intra/ums/commerce/revenue" },
                            { name: "고객문의", href: "/intra/ums/commerce/inquiry" },
                        ],
                    },
                ],
            },
            {
                label: "브랜드별",
                items: [
                    { name: "0gamja", href: "/intra/ums/0gamja", icon: Globe, badge: "soon" },
                    {
                        name: "Badak", href: "/intra/ums/badak", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/badak" },
                            { name: "멤버 관리", href: "/intra/ums/badak/members" },
                            { name: "모임 관리", href: "/intra/ums/badak/groups" },
                            { name: "커뮤니티 관리", href: "/intra/ums/badak/posts" },
                            { name: "니즈 관리", href: "/intra/ums/badak/needs" },
                            { name: "CS/신고", href: "/intra/ums/badak/cs" },
                        ],
                    },
                    {
                        name: "Brand Gravity", href: "/intra/gravity", icon: Brain,
                        children: [
                            { name: "전체 현황", href: "/intra/gravity" },
                            { name: "클라이언트", href: "/intra/gravity/clients" },
                            { name: "콘텐츠 브리프", href: "/intra/gravity/briefs" },
                        ],
                    },
                    { name: "ChangeUp", href: "/intra/ums/changeup", icon: Globe, badge: "soon" },
                    { name: "Domo", href: "/intra/ums/domo", icon: Globe, badge: "soon" },
                    { name: "Evolution School", href: "/intra/evolution-school", icon: BookOpen, badge: "soon" },
                    { name: "FWN", href: "/intra/ums/fwn", icon: Globe, badge: "soon" },
                    {
                        name: "HeRo", href: "/intra/hero/talent", icon: Award,
                        children: [
                            { name: "인재 관리", href: "/intra/hero/talent" },
                            { name: "HIT 이용자", href: "/intra/hero/hit" },
                            { name: "AI 상담", href: "/intra/hero/ai-counseling" },
                            { name: "이력서 이용자", href: "/intra/hero/resume" },
                            { name: "커리어 이용자", href: "/intra/hero/career" },
                        ],
                    },
                    { name: "JAKKA", href: "/intra/ums/jakka", icon: Globe, badge: "soon" },
                    { name: "Korea360", href: "/intra/ums/seoul360", icon: Globe, badge: "soon" },
                    { name: "LUKI", href: "/intra/ums/luki", icon: Globe, badge: "soon" },
                    { name: "Dokdae", href: "/intra/ums/dokdae", icon: Globe, badge: "soon" },
                    { name: "Korea360", href: "/intra/ums/seoul360", icon: Globe, badge: "soon" },
                    { name: "LUKI", href: "/intra/ums/luki", icon: Globe, badge: "soon" },
                    { name: "MAD League", href: "/intra/ums/madleague", icon: Users },
                    { name: "MADLeap", href: "/intra/ums/madleap", icon: Users, badge: "soon" },
                    { name: "Mindle", href: "/intra/ums/mindle", icon: Globe, badge: "soon" },
                    { name: "MoNTZ", href: "/intra/ums/montz", icon: Globe, badge: "soon" },
                    { name: "Mullaesian", href: "/intra/ums/mullaesian", icon: Globe, badge: "soon" },
                    { name: "My Universe", href: "/intra/ums/myverse", icon: Globe, badge: "soon" },
                    { name: "Naming Factory", href: "/intra/ums/namingfactory", icon: Globe, badge: "soon" },
                    { name: "NatureBox", href: "/intra/ums/naturebox", icon: Globe, badge: "soon" },
                    {
                        name: "Planner's", href: "/intra/evolution-school", icon: BookOpen,
                        children: [
                            { name: "Planning", href: "/intra/ums/planners/planning", badge: "soon" },
                            { name: "GPR", href: "/intra/ums/planners/gpr", badge: "soon" },
                            { name: "Programs", href: "/intra/ums/planners/programs", badge: "soon" },
                            { name: "Evolution School", href: "/intra/evolution-school" },
                        ],
                    },
                    { name: "RooK", href: "/intra/ums/rook", icon: Globe, badge: "soon" },
                    { name: "SmarComm", href: "/intra/ums/smarcomm", icon: Globe, badge: "soon" },
                    { name: "Townity", href: "/intra/ums/townity", icon: Globe, badge: "soon" },
                    { name: "Trend Hunter", href: "/intra/ums/trendhunter", icon: Globe, badge: "soon" },
                    {
                        name: "WIO", href: "/intra/ums/commerce/subscriptions", icon: Settings,
                        children: [
                            { name: "구독 관리", href: "/intra/ums/commerce/subscriptions" },
                            { name: "테넌트", href: "/intra/ums/wio/tenants" },
                        ],
                    },
                    { name: "YouInOne", href: "/intra/ums/youinone", icon: Globe, badge: "soon" },
                ],
            },
        ],
        dynamic: true,
    },

    // ══════════════════════════════════════════════════════════
    //  MARKETING — 캠페인 · CRM · 콘텐츠 스튜디오 · 위키
    // ══════════════════════════════════════════════════════════
    {
        name: "MARKETING",
        href: "/intra/marketing",
        icon: Megaphone,
        intraModule: "smarcomm" as IntraModule,
        sections: [
            {
                label: "캠페인 · CRM",
                items: [
                    { name: "캠페인", href: "/intra/marketing/campaigns", icon: Megaphone },
                    { name: "리드", href: "/intra/marketing/leads", icon: TrendingUp },
                    { name: "딜", href: "/intra/marketing/deals", icon: Handshake },
                    { name: "액티비티", href: "/intra/marketing/activities", icon: Activity },
                    { name: "연락처", href: "/intra/marketing/crm/people", icon: Users },
                    { name: "퍼포먼스", href: "/intra/marketing/performance", icon: Gauge },
                    { name: "인플루언서", href: "/intra/marketing/influencers", icon: Star, badge: "soon" },
                    { name: "소셜", href: "/intra/marketing/social", icon: Share2, badge: "soon" },
                ],
            },
            {
                label: "콘텐츠 스튜디오",
                items: [
                    { name: "파이프라인", href: "/intra/studio/workflow/pipeline", icon: Layers },
                    { name: "Kanban", href: "/intra/studio/workflow/kanban", icon: FolderKanban },
                    { name: "스케줄", href: "/intra/studio/schedule", icon: Calendar },
                    { name: "에셋", href: "/intra/studio/assets", icon: FolderOpen },
                    { name: "브랜드 자산", href: "/intra/studio/brands", icon: Palette },
                    { name: "자동화", href: "/intra/studio/workflow/automation", icon: Zap, badge: "soon" },
                ],
            },
            {
                label: "기회",
                items: [
                    { name: "Opportunity", href: "/intra/opportunity", icon: TrendingUp },
                ],
            },
            {
                label: "위키",
                items: [
                    { name: "컬처", href: "/intra/wiki/culture", icon: BookOpen },
                    { name: "온보딩", href: "/intra/wiki/onboarding", icon: Compass },
                    { name: "핸드북", href: "/intra/wiki/handbook", icon: FileText },
                    { name: "FAQ", href: "/intra/wiki/faq", icon: HelpCircle },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════
    //  ERP — HR · GPR · 재무 · 프로젝트 · 경영관리
    // ══════════════════════════════════════════════════════════
    {
        name: "ERP",
        href: "/intra/erp",
        icon: Building2,
        access: "erp-hr" as SystemAccess,
        intraModule: "erp" as IntraModule,
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
                        name: "인재관리", href: "/intra/erp/hr/talent", icon: UserCheck,
                        children: [
                            { name: "Talent Pool", href: "/intra/erp/hr/talent" },
                            { name: "Pipeline", href: "/intra/erp/hr/talent/pipeline" },
                            { name: "Programs", href: "/intra/erp/hr/talent/programs" },
                        ],
                    },
                ],
            },
            {
                label: "프로젝트",
                items: [
                    { name: "프로젝트 관리", href: "/intra/project/management", icon: ClipboardList },
                    { name: "Job 관리", href: "/intra/project/jobs", icon: Briefcase },
                    { name: "Partner Pool", href: "/intra/partner-pool", icon: Users },
                    { name: "프로젝트 손익", href: "/intra/project/financials", icon: BarChart3, badge: "soon" },
                    { name: "입찰관리", href: "/intra/project/management/bidding", icon: Gavel, badge: "soon" },
                    { name: "협력사", href: "/intra/project/management/vendors", icon: Handshake, badge: "soon" },
                ],
            },
            {
                label: "경영관리",
                items: [
                    {
                        name: "경영 계획", href: "/intra/erp/biz/plan", icon: Target, badge: "soon",
                        children: [
                            { name: "연간 경영계획", href: "/intra/erp/biz/plan" },
                            { name: "부문별 계획", href: "/intra/erp/biz/plan/division" },
                        ],
                    },
                    {
                        name: "경영 관리", href: "/intra/erp/biz/manage", icon: ClipboardList, badge: "soon",
                        children: [
                            { name: "월별 추정", href: "/intra/erp/biz/manage" },
                            { name: "실적 확정", href: "/intra/erp/biz/manage/actual" },
                            { name: "Gap 분석", href: "/intra/erp/biz/manage/gap" },
                        ],
                    },
                    {
                        name: "경영 분석", href: "/intra/erp/biz/analysis", icon: BarChart3, badge: "soon",
                        children: [
                            { name: "손익 현황", href: "/intra/erp/biz/analysis" },
                            { name: "부문별 이익률", href: "/intra/erp/biz/analysis/division" },
                            { name: "프로젝트 수익성", href: "/intra/erp/biz/analysis/project" },
                        ],
                    },
                ],
            },
            {
                label: "Finance",
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

    // ══════════════════════════════════════════════════════════
    //  INTEL — Analytics · Mindle · Agent Hub
    // ══════════════════════════════════════════════════════════
    {
        name: "INTEL",
        href: "/intra/analytics",
        icon: Brain,
        intraModule: "universe" as IntraModule,
        sections: [
            {
                label: "Analytics",
                items: [
                    { name: "Universe 전체", href: "/intra/analytics", icon: BarChart3, exact: true },
                    { name: "브랜드별", href: "/intra/analytics/brands", icon: Globe },
                    { name: "크로스 여정", href: "/intra/analytics/journey", icon: Map },
                    { name: "동기화", href: "/intra/analytics/sync", icon: RefreshCw },
                ],
            },
            {
                label: "Mindle",
                items: [
                    { name: "트렌드 카드", href: "/intra/ums/mindle/trends", icon: TrendingUp },
                    { name: "콘텐츠 파이프라인", href: "/intra/ums/mindle/pipeline", icon: Layers },
                    { name: "뉴스레터", href: "/intra/ums/mindle/newsletter", icon: Mail },
                    { name: "RSS 소스", href: "/intra/ums/mindle/sources", icon: Radio },
                ],
            },
            {
                label: "Agent Hub",
                items: [
                    {
                        name: "에이전트 현황", href: "/intra/agent", icon: Bot,
                        children: [
                            { name: "대시보드", href: "/intra/agent" },
                            { name: "에이전트 지시", href: "/intra/ums/agent/comm" },
                            { name: "에이전트 로그", href: "/intra/ums/agent/logs" },
                        ],
                    },
                ],
            },
        ],
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
