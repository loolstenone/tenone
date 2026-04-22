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
    Zap, Layers, PenTool, Eye, Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SystemAccess, IntraModule } from "@/types/auth";

/** 사용자 역할 (OR 조건) — 명시되면 해당 role 중 하나를 가진 사용자만 볼 수 있음 */
export type VisibleRole = "staff" | "manager" | "super_admin" | "member" | "leader" | "subscriber" | "purchaser" | "approved_member";

export interface SubItem {
    name: string;
    href: string;
    badge?: "soon" | "beta" | "new";
    /** 표시 가능 role (OR). 미지정 시 인트라 접근자 전체에게 표시. */
    roles?: VisibleRole[];
}

export interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: SubItem[];
    staffOnly?: boolean;
    exact?: boolean;
    badge?: "soon" | "beta" | "new";
    /** 표시 가능 role (OR). 미지정 시 인트라 접근자 전체에게 표시. */
    roles?: VisibleRole[];
}

export interface MenuSection {
    label?: string;
    items: MenuItem[];
}

export interface NavModule {
    name: string;
    /** 사이드바 모듈 헤더 아래 표시되는 한 줄 설명 */
    tagline?: string;
    href: string;
    icon: LucideIcon;
    access?: SystemAccess;
    intraModule?: IntraModule;
    sections: MenuSection[];
    dynamic?: boolean;
    /** 표시 가능 role (OR). 미지정 시 인트라 접근자 전체에게 표시. */
    roles?: VisibleRole[];
}

/**
 * 사이드바 아이템/모듈이 현재 사용자에게 표시 가능한지 판정.
 * roles가 undefined이면 인트라 모든 사용자에게 표시.
 * roles가 명시됐으면 userRoles와 하나라도 교집합이 있어야 표시.
 */
export function canSeeByRole(itemRoles: VisibleRole[] | undefined, userRoles: string[]): boolean {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.some(r => userRoles.includes(r));
}

export const modules: NavModule[] = [

    // ══════════════════════════════════════════════════════════
    //  MY — 개인 워크스페이스
    // ══════════════════════════════════════════════════════════
    {
        name: "My",
        tagline: "내 일 · 내 일정 · 내 포인트",
        href: "/intra/workspace",
        icon: Home,
        intraModule: "myverse" as IntraModule,
        // 인트라 접근자 전체 (staff / manager / super_admin)
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
                label: "커뮤니티 · 지식",
                items: [
                    { name: "공지사항", href: "/intra/comm/notice", icon: ClipboardList },
                    { name: "자유게시판", href: "/intra/comm/free", icon: FileText },
                    { name: "전체 일정", href: "/intra/comm/calendar", icon: Calendar },
                    { name: "Wiki ↗", href: "https://wiki.tenone.biz", icon: BookOpen },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════
    //  UNIVERSE — 브랜드/회원 통합 관리
    // ══════════════════════════════════════════════════════════
    {
        name: "Universe",
        tagline: "브랜드 · 회원 · 유니버스 운영",
        href: "/intra/ums",
        icon: Globe,
        intraModule: "universe" as IntraModule,
        roles: ["staff", "manager", "super_admin"],
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
                            { name: "발신자 관리", href: "/intra/ums/email/senders" },
                            { name: "이메일 사용량", href: "/intra/ums/email/usage" },
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
                    {
                        name: "Universe Coin", href: "/intra/ums/uc", icon: Coins,
                        children: [
                            { name: "잔액 현황", href: "/intra/ums/uc" },
                            { name: "거래 내역", href: "/intra/ums/uc/transactions" },
                        ],
                    },
                    { name: "CS 통합", href: "/intra/ums/cs", icon: MessageCircle },
                    {
                        name: "Agent 관리", href: "/intra/ums/agents", icon: Bot,
                        children: [
                            { name: "에이전트 프로파일", href: "/intra/ums/agents" },
                            { name: "시스템 프롬프트", href: "/intra/ums/agents/prompts" },
                            { name: "도구·지식 참조", href: "/intra/ums/agents/tools" },
                        ],
                    },
                    {
                        name: "외부 리소스", href: "/intra/ums/external", icon: Share2,
                        children: [
                            { name: "개요", href: "/intra/ums/external" },
                            { name: "개발 환경", href: "/intra/ums/external/dev-env" },
                            { name: "외부 API", href: "/intra/ums/external/apis" },
                            { name: "크롤링·RSS·뉴스레터", href: "/intra/ums/external/sources" },
                        ],
                    },
                    {
                        name: "Standard 관리", href: "/intra/ums/standard", icon: Shield,
                        children: [
                            { name: "개요", href: "/intra/ums/standard" },
                            { name: "회원", href: "/intra/ums/standard/members" },
                            { name: "Universe Coin", href: "/intra/ums/standard/uc" },
                            { name: "산업군/직무군", href: "/intra/ums/standard/taxonomies" },
                            { name: "News Letter", href: "/intra/ums/standard/newsletter" },
                            { name: "Capability 정의", href: "/intra/ums/standard/capabilities" },
                            { name: "권한 체계", href: "/intra/ums/standard/roles" },
                            { name: "약관·개인정보", href: "/intra/ums/standard/privacy" },
                            { name: "사이트·도메인", href: "/intra/ums/standard/sites" },
                            { name: "접근 모델", href: "/intra/ums/standard/access-model" },
                            { name: "WIO 요금제·기능", href: "/intra/ums/standard/wio-plans" },
                            { name: "테넌트", href: "/intra/ums/standard/tenants" },
                            { name: "개발 규칙 8원칙", href: "/intra/ums/standard/dev-rules" },
                            { name: "이메일 템플릿", href: "/intra/ums/standard/mail-templates" },
                        ],
                    },
                ],
            },
            {
                label: "브랜드별 (알파벳순)",
                items: [
                    // 브랜드명 영문 통일 (canonical + English only)
                    {
                        name: "0gamja", href: "/intra/ums/0gamja", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/0gamja" },
                            { name: "회원 관리", href: "/intra/ums/0gamja/members", badge: "soon" },
                            { name: "커뮤니티", href: "/intra/ums/0gamja/community", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/0gamja/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "Badak", href: "/intra/ums/badak", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/badak" },
                            { name: "멤버 관리", href: "/intra/ums/badak/members" },
                            { name: "모임 관리", href: "/intra/ums/badak/groups" },
                            { name: "커뮤니티 관리", href: "/intra/ums/badak/posts" },
                            { name: "스토리 관리", href: "/intra/ums/badak/stories" },
                            { name: "니즈 관리", href: "/intra/ums/badak/needs" },
                            { name: "바닥장 심사", href: "/intra/ums/badak/applications" },
                            { name: "CS/신고", href: "/intra/ums/badak/cs" },
                        ],
                    },
                    {
                        name: "Brand Gravity™", href: "/intra/gravity", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/gravity" },
                            { name: "클라이언트", href: "/intra/gravity/clients" },
                            { name: "손익 관리", href: "/intra/gravity/revenue" },
                            { name: "콘텐츠 브리프", href: "/intra/gravity/briefs" },
                            { name: "고객 문의", href: "/intra/gravity/cs" },
                        ],
                    },
                    {
                        name: "ChangeUp", href: "/intra/ums/changeup", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/changeup" },
                            { name: "회원 관리", href: "/intra/ums/changeup/members", badge: "soon" },
                            { name: "주문 관리", href: "/intra/ums/changeup/orders", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/changeup/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "Dokdae", href: "/intra/ums/dokdae", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/dokdae" },
                            { name: "기록 관리", href: "/intra/ums/dokdae/records", badge: "soon" },
                        ],
                    },
                    {
                        name: "Domo", href: "/intra/ums/domo", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/domo" },
                            { name: "회원 관리", href: "/intra/ums/domo/members" },
                            { name: "심사 관리", href: "/intra/ums/domo/applications" },
                            { name: "모임 관리", href: "/intra/ums/domo/meetups" },
                            { name: "고객 문의", href: "/intra/ums/domo/cs" },
                        ],
                    },
                    {
                        name: "FWN", href: "/intra/ums/fwn", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/fwn" },
                            { name: "회원 관리", href: "/intra/ums/fwn/members", badge: "soon" },
                            { name: "커뮤니티", href: "/intra/ums/fwn/community", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/fwn/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "HeRo", href: "/intra/hero", icon: Globe,
                        children: [
                            // ── 공통 ──
                            { name: "대시보드", href: "/intra/hero" },
                            { name: "인재 풀", href: "/intra/hero/talent" },
                            // ── 기업 (Phase 1) ──
                            { name: "기업 풀", href: "/intra/hero/companies" },
                            { name: "TIH 요청", href: "/intra/hero/search-light" },
                            // ── 검사 (HIT) ──
                            { name: "HIT 현황", href: "/intra/hero/hit" },
                            // ── 보조 ──
                            { name: "AI 상담", href: "/intra/hero/ai-counseling" },
                            { name: "이력서", href: "/intra/hero/resume" },
                            { name: "커리어", href: "/intra/hero/career" },
                            // ── 공통 (마지막) ──
                            { name: "고객 문의", href: "/intra/hero/cs" },
                        ],
                    },
                    {
                        name: "JAKKA", href: "/intra/ums/jakka", icon: Globe,
                        children: [
                            // ── 공통 탭 ──
                            { name: "대시보드", href: "/intra/ums/jakka" },
                            { name: "회원 관리", href: "/intra/ums/jakka/members" },
                            // ── 브랜드 특화 ──
                            { name: "판매자 심사", href: "/intra/ums/jakka/sellers" },
                            { name: "마켓 관리", href: "/intra/ums/jakka/market" },
                            { name: "쇼케이스 관리", href: "/intra/ums/jakka/showcases" },
                            { name: "광고 관리", href: "/intra/ums/jakka/notices" },
                            // ── 공통 탭 (마지막) ──
                            { name: "고객 문의", href: "/intra/ums/jakka/cs" },
                        ],
                    },
                    {
                        name: "Korea360", href: "/intra/ums/korea360", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/korea360" },
                            { name: "콘텐츠 관리", href: "/intra/ums/korea360/content", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/korea360/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "LUKI", href: "/intra/ums/luki", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/luki" },
                            { name: "회원 관리", href: "/intra/ums/luki/members", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/luki/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "MAD League", href: "/intra/ums/madleague", icon: Globe,
                        children: [
                            // ── 공통 탭 ──
                            { name: "대시보드", href: "/intra/ums/madleague" },
                            { name: "회원 관리", href: "/intra/ums/madleague/members" },
                            // ── 브랜드 특화 ──
                            { name: "심사 관리", href: "/intra/ums/madleague/applications" },
                            { name: "콘텐츠 관리", href: "/intra/ums/madleague/articles" },
                            // ── 공통 탭 (마지막) ──
                            { name: "고객 문의", href: "/intra/ums/madleague/cs" },
                        ],
                    },
                    {
                        name: "MADLeap", href: "/intra/ums/madleap", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/madleap" },
                            { name: "회원 관리", href: "/intra/ums/madleap/members" },
                            { name: "심사 관리", href: "/intra/ums/madleap/applications" },
                            { name: "교육 관리", href: "/intra/ums/madleap/courses", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/madleap/cs" },
                        ],
                    },
                    {
                        name: "Mindle", href: "/intra/ums/mindle", icon: Globe,
                        children: [
                            // ── 공통 탭 ──
                            { name: "대시보드", href: "/intra/ums/mindle" },
                            { name: "회원 관리", href: "/intra/ums/mindle/members" },
                            { name: "손익 관리", href: "/intra/ums/mindle/revenue" },
                            // ── 브랜드 특화 ──
                            { name: "콘텐츠 관리", href: "/intra/ums/mindle/content" },
                            // ── 공통 탭 (마지막) ──
                            { name: "고객 문의", href: "/intra/ums/mindle/cs" },
                        ],
                    },
                    {
                        name: "MoNTZ", href: "/intra/ums/montz", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/montz" },
                            { name: "창작자 관리", href: "/intra/ums/montz/members" },
                            { name: "포트폴리오", href: "/intra/ums/montz/portfolio", badge: "soon" },
                            { name: "오디션 관리", href: "/intra/ums/montz/auditions" },
                            { name: "고객 문의", href: "/intra/ums/montz/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "Mullaesian", href: "/intra/ums/mullaesian", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/mullaesian" },
                            { name: "회원 관리", href: "/intra/ums/mullaesian/members", badge: "soon" },
                            { name: "쇼케이스", href: "/intra/ums/mullaesian/showcase", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/mullaesian/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "My Universe", href: "/intra/ums/myverse", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/myverse" },
                            { name: "회원 관리", href: "/intra/ums/myverse/members", badge: "soon" },
                            { name: "손익 관리", href: "/intra/ums/myverse/revenue", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/myverse/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "Naming Factory", href: "/intra/ums/namingfactory", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/namingfactory" },
                            { name: "회원 관리", href: "/intra/ums/namingfactory/members", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/namingfactory/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "NatureBox", href: "/intra/ums/naturebox", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/naturebox" },
                            { name: "회원 관리", href: "/intra/ums/naturebox/members", badge: "soon" },
                            { name: "주문 관리", href: "/intra/ums/naturebox/orders", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/naturebox/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "Planner's", href: "/intra/ums/planners", icon: Globe,
                        children: [
                            { name: "Planning", href: "/intra/ums/planners/planning", badge: "soon" },
                            { name: "GPR", href: "/intra/ums/planners/gpr", badge: "soon" },
                            { name: "Programs", href: "/intra/ums/planners/programs", badge: "soon" },
                            { name: "Evolution School", href: "/intra/evolution-school" },
                        ],
                    },
                    {
                        name: "RooK", href: "/intra/ums/rook", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/rook" },
                            { name: "회원 관리", href: "/intra/ums/rook/members" },
                            { name: "커뮤니티", href: "/intra/ums/rook/community" },
                            { name: "고객 문의", href: "/intra/ums/rook/cs" },
                        ],
                    },
                    {
                        name: "Seoul/360°", href: "/intra/ums/seoul360", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/seoul360" },
                            { name: "콘텐츠 관리", href: "/intra/ums/seoul360/content", badge: "soon" },
                            { name: "쇼케이스", href: "/intra/ums/seoul360/showcase", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/seoul360/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "SmarComm.", href: "/intra/ums/smarcomm", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/smarcomm" },
                            { name: "회원 관리", href: "/intra/ums/smarcomm/members" },
                            { name: "손익 관리", href: "/intra/ums/smarcomm/revenue" },
                            { name: "고객 문의", href: "/intra/ums/smarcomm/cs" },
                        ],
                    },
                    {
                        name: "Townity", href: "/intra/ums/townity", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/townity" },
                            { name: "회원 관리", href: "/intra/ums/townity/members" },
                            { name: "모임 관리", href: "/intra/ums/townity/meetups" },
                            { name: "커뮤니티", href: "/intra/ums/townity/community" },
                            { name: "고객 문의", href: "/intra/ums/townity/cs" },
                        ],
                    },
                    {
                        name: "Trend Hunter", href: "/intra/ums/trendhunter", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/trendhunter" },
                            { name: "회원 관리", href: "/intra/ums/trendhunter/members", badge: "soon" },
                            { name: "콘텐츠 관리", href: "/intra/ums/trendhunter/content", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/trendhunter/cs", badge: "soon" },
                        ],
                    },
                    {
                        name: "WIO", href: "/intra/ums/wio/tenants", icon: Globe,
                        children: [
                            { name: "테넌트", href: "/intra/ums/wio/tenants" },
                            { name: "WIO 구독자", href: "/intra/ums/wio/subscriptions" },
                        ],
                    },
                    {
                        name: "YouInOne", href: "/intra/ums/youinone", icon: Globe,
                        children: [
                            { name: "대시보드", href: "/intra/ums/youinone" },
                            { name: "회원 관리", href: "/intra/ums/youinone/members" },
                            { name: "심사 관리", href: "/intra/ums/youinone/applications" },
                            { name: "손익 관리", href: "/intra/ums/youinone/revenue", badge: "soon" },
                            { name: "고객 문의", href: "/intra/ums/youinone/cs" },
                        ],
                    },
                ],
            },
        ],
        dynamic: true,
    },

    // ══════════════════════════════════════════════════════════
    //  MARKETING — 캠페인 · CRM · 콘텐츠 스튜디오 · 위키
    // ══════════════════════════════════════════════════════════
    {
        name: "Marketing",
        tagline: "캠페인 · CRM · 콘텐츠",
        href: "/intra/marketing",
        icon: Megaphone,
        intraModule: "smarcomm" as IntraModule,
        roles: ["staff", "manager", "super_admin"],
        sections: [
            {
                items: [
                    {
                        name: "캠페인 · CRM", href: "/intra/marketing/campaigns", icon: Megaphone,
                        children: [
                            { name: "캠페인", href: "/intra/marketing/campaigns" },
                            { name: "리드", href: "/intra/marketing/leads" },
                            { name: "딜", href: "/intra/marketing/deals" },
                            { name: "액티비티", href: "/intra/marketing/activities" },
                            { name: "연락처", href: "/intra/marketing/crm/people" },
                            { name: "세그먼트", href: "/intra/marketing/crm/segments" },
                            { name: "브로드캐스트", href: "/intra/marketing/crm/broadcast" },
                            { name: "퍼포먼스", href: "/intra/marketing/performance" },
                            { name: "인플루언서", href: "/intra/marketing/influencers", badge: "soon" },
                            { name: "소셜", href: "/intra/marketing/social", badge: "soon" },
                        ],
                    },
                    {
                        name: "콘텐츠 스튜디오", href: "/intra/studio/workflow/pipeline", icon: Palette,
                        children: [
                            { name: "파이프라인", href: "/intra/studio/workflow/pipeline" },
                            { name: "Kanban", href: "/intra/studio/workflow/kanban" },
                            { name: "스케줄", href: "/intra/studio/schedule" },
                            { name: "에셋", href: "/intra/studio/assets" },
                            { name: "브랜드 자산", href: "/intra/studio/brands" },
                            { name: "자동화", href: "/intra/studio/workflow/automation", badge: "soon" },
                        ],
                    },
                    // Opportunity는 ERP > 프로젝트 · Intelligence > Whole See로 분산 배치 (2026-04-21)
                    // Wiki는 My > 커뮤니티·지식으로 이동 (2026-04-21) · 외부 wiki.tenone.biz SSOT
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════
    //  ERP — HR · GPR · 재무 · 프로젝트 · 경영관리
    // ══════════════════════════════════════════════════════════
    {
        name: "ERP",
        tagline: "사람 · 돈 · 시간 · 프로젝트",
        href: "/intra/erp",
        icon: Building2,
        access: "erp-hr" as SystemAccess,
        intraModule: "erp" as IntraModule,
        roles: ["manager", "super_admin"],
        sections: [
            {
                items: [
                    { name: "BI Dashboard", href: "/intra/erp/bi", icon: BarChart3, exact: true },
                    {
                        name: "전자결재", href: "/intra/erp/approval", icon: Stamp,
                        children: [
                            { name: "결재 대기", href: "/intra/erp/approval" },
                            { name: "결재 진행", href: "/intra/erp/approval/progress" },
                            { name: "결재 완료", href: "/intra/erp/approval/completed" },
                            { name: "기안", href: "/intra/erp/approval/draft" },
                            { name: "품의", href: "/intra/erp/approval/draft/expenditure" },
                            { name: "보고", href: "/intra/erp/approval/draft/report" },
                        ],
                    },
                    {
                        name: "GPR", href: "/intra/erp/gpr", icon: Target,
                        children: [
                            { name: "전사 현황", href: "/intra/erp/gpr" },
                            { name: "목표 캐스케이드", href: "/intra/erp/gpr/cascade" },
                            { name: "평가", href: "/intra/erp/gpr/evaluation" },
                            { name: "인센티브", href: "/intra/erp/gpr/incentive" },
                        ],
                    },
                    {
                        name: "HR", href: "/intra/erp/hr/people", icon: Users,
                        children: [
                            { name: "전체 구성원", href: "/intra/erp/hr/people" },
                            { name: "직원 관리", href: "/intra/erp/hr/staff" },
                            { name: "조직도", href: "/intra/erp/hr/people/org" },
                            { name: "구성원 등록", href: "/intra/erp/hr/staff/register" },
                            { name: "권한위임", href: "/intra/erp/hr/people/delegation" },
                            { name: "근태관리", href: "/intra/erp/hr/attendance" },
                            { name: "급여관리", href: "/intra/erp/hr/payroll" },
                            { name: "포인트관리", href: "/intra/erp/hr/points" },
                            { name: "교육관리", href: "/intra/erp/hr/education" },
                            { name: "제증명서", href: "/intra/erp/hr/certificates" },
                            { name: "가족관리", href: "/intra/erp/hr/family" },
                            { name: "인재관리 · Talent Pool", href: "/intra/erp/hr/talent" },
                            { name: "인재관리 · Pipeline", href: "/intra/erp/hr/talent/pipeline" },
                            { name: "인재관리 · Programs", href: "/intra/erp/hr/talent/programs" },
                        ],
                    },
                    {
                        name: "프로젝트", href: "/intra/project/management", icon: ClipboardList,
                        children: [
                            { name: "프로젝트 관리", href: "/intra/project/management" },
                            { name: "Job 관리", href: "/intra/project/jobs" },
                            { name: "Partner Pool", href: "/intra/partner-pool" },
                            { name: "수주 파이프라인 (Opportunity)", href: "/intra/opportunity" },
                            { name: "프로젝트 손익", href: "/intra/project/financials", badge: "soon" },
                            { name: "입찰관리", href: "/intra/project/management/bidding", badge: "soon" },
                            { name: "협력사", href: "/intra/project/management/vendors", badge: "soon" },
                        ],
                    },
                    {
                        name: "경영관리", href: "/intra/erp/biz/plan", icon: Target, badge: "soon",
                        children: [
                            { name: "연간 경영계획", href: "/intra/erp/biz/plan" },
                            { name: "부문별 계획", href: "/intra/erp/biz/plan/division" },
                            { name: "월별 추정", href: "/intra/erp/biz/manage" },
                            { name: "실적 확정", href: "/intra/erp/biz/manage/actual" },
                            { name: "Gap 분석", href: "/intra/erp/biz/manage/gap" },
                            { name: "손익 현황", href: "/intra/erp/biz/analysis" },
                            { name: "부문별 이익률", href: "/intra/erp/biz/analysis/division" },
                            { name: "프로젝트 수익성", href: "/intra/erp/biz/analysis/project" },
                        ],
                    },
                    {
                        name: "Finance", href: "/intra/erp/finance/expenses", icon: CircleDollarSign,
                        children: [
                            { name: "경비처리", href: "/intra/erp/finance/expenses" },
                            { name: "경비품의서", href: "/intra/erp/finance/expenses/request" },
                            { name: "법인카드", href: "/intra/erp/finance/card" },
                            { name: "경리리포트", href: "/intra/erp/finance/reports" },
                            { name: "청구관리", href: "/intra/erp/finance/billing" },
                            { name: "지급관리", href: "/intra/erp/finance/billing/payment" },
                        ],
                    },
                    {
                        name: "운영설정", href: "/intra/erp/settings/approval-line", icon: Settings,
                        children: [
                            { name: "결재라인 설정", href: "/intra/erp/settings/approval-line" },
                            { name: "권한 설정", href: "/intra/erp/settings/permissions" },
                            { name: "HR · 직급/직책 관리", href: "/intra/erp/settings/hr" },
                            { name: "HR · 부서 관리", href: "/intra/erp/settings/hr/departments" },
                            { name: "HR · 근무형태 설정", href: "/intra/erp/settings/hr/work-type" },
                            { name: "Finance · 계정과목", href: "/intra/erp/settings/finance" },
                            { name: "Finance · 예산 설정", href: "/intra/erp/settings/finance/budget" },
                            { name: "Finance · 결산 설정", href: "/intra/erp/settings/finance/closing" },
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
        name: "Intelligence",
        tagline: "관측 · 정보 발굴 · AI 지휘",
        href: "/intra/intel",
        icon: Brain,
        intraModule: "universe" as IntraModule,
        roles: ["manager", "super_admin"],
        sections: [
            {
                items: [
                    { name: "Intelligence 대시보드", href: "/intra/intel", icon: LayoutDashboard, exact: true },
                    { name: "데이터 헬스", href: "/intra/intel/pipeline-health", icon: Activity },
                    {
                        name: "타겟 행동 데이터",
                        href: "/intra/analytics",
                        icon: BarChart3,
                        children: [
                            { name: "Universe 전체", href: "/intra/analytics" },
                            { name: "브랜드별", href: "/intra/analytics/brands" },
                            { name: "크로스 여정", href: "/intra/analytics/journey" },
                            { name: "동기화", href: "/intra/analytics/sync" },
                        ],
                    },
                    {
                        name: "정보 발굴 (Whole See)",
                        href: "/intra/intel/wholesee/trends",
                        icon: TrendingUp,
                        children: [
                            { name: "트렌드 카드", href: "/intra/intel/wholesee/trends" },
                            { name: "콘텐츠 파이프라인", href: "/intra/intel/wholesee/pipeline" },
                            { name: "뉴스레터 수집 현황", href: "/intra/intel/wholesee/newsletter" },
                            { name: "크롤러 상태", href: "/intra/intel/wholesee/crawling" },
                            { name: "기회 수집 (Opportunity)", href: "/intra/intel/wholesee/opportunities" },
                            { name: "소스 관리 (편집 →)", href: "/intra/intel/wholesee/sources" },
                        ],
                    },
                    {
                        name: "Agent Team",
                        href: "/intra/agent",
                        icon: Bot,
                        children: [
                            { name: "에이전트 현황 (대시보드)", href: "/intra/agent" },
                            { name: "에이전트 지시", href: "/intra/agent/comm" },
                            { name: "에이전트 로그", href: "/intra/agent/logs" },
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
