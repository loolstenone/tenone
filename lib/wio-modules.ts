/**
 * WIO Module Catalog — Single source of truth
 * Based on EUS (Enterprise Unified System) v1.0
 * 7 Tracks + 지주사/개인 모듈 포함
 * Used by: Settings page (catalog), Sidebar (active modules), types
 */

import {
  LayoutDashboard, FolderKanban, MessageSquare, Receipt,
  Users, TrendingUp, BookOpen, FileText, Library, BarChart3, Clock,
  Target, Trophy, Network, Award, Stamp,
  UserPlus, CalendarCheck, Wallet, Star, GitBranch, MessageCircle,
  ShoppingCart, CreditCard, DollarSign, Landmark, Shield, Scale, FileCheck,
  Megaphone, BarChart2, Globe, Zap, PenTool, Bot, Share2, Layers, PieChart, Eye, Gauge, Activity,
  Handshake, Building, Truck, Package,
  Send, Calendar, FileStack, Bell, ClipboardList, Cpu, Monitor,
  Lock, ScrollText, Plug, Heart, Database,
  Microscope, Fingerprint, Code, Rocket, Factory, Cog, CheckSquare, Palette, Image, Warehouse, Link2, HardDrive, Film,
  Vote, ListChecks, Briefcase, ChartLine, Boxes, Compass,
  Medal, Lightbulb, ShieldCheck,
  Settings, House, User, ClipboardCheck, Kanban, ReceiptText,
  BadgeDollarSign, CalendarRange,
  type LucideIcon,
} from 'lucide-react';

/* ── Category 정의 (EUS 7 Tracks + 지주사 + 개인) ── */
export interface WIOCategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
}

export const CATEGORY_CATALOG: WIOCategoryDef[] = [
  { id: 'track6-common',  name: 'Track 6 공통 (전 직원)', icon: LayoutDashboard, description: '전사 공통 도구 — 협업, 커뮤니케이션, 전자결재' },
  { id: 'track1-ops',     name: 'Track 1 운영·관리',      icon: Briefcase,       description: '경영전략, 인사, 재무, 법무' },
  { id: 'track2-biz',     name: 'Track 2 사업',           icon: TrendingUp,      description: '마케팅, 영업, CRM, 사업개발' },
  { id: 'track3-prod',    name: 'Track 3 생산',           icon: Factory,         description: '생산, 구매조달, 재고, 물류, 품질' },
  { id: 'track4-support', name: 'Track 4 지원',           icon: Code,            description: '개발, 디자인, R&D, 데이터, 콘텐츠' },
  { id: 'track5-partner', name: 'Track 5 파트너',         icon: Handshake,       description: '파트너, 벤더, 프리랜서' },
  { id: 'track7-system',  name: 'Track 7 시스템 관리',    icon: Monitor,         description: '시스템 설정, 보안, 데이터 거버넌스' },
  { id: 'my',             name: '개인 (My)',              icon: User,            description: '개인 대시보드, 근태, 평가, 업무, 결재' },
  { id: 'holding',        name: '지주사',                 icon: Building,        description: '지주사 전용 — 브랜드/자회사 관리' },
];

/* ── Module 정의 ── */
export interface WIOModuleDef {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  category: string;
  description: string;
}

export const MODULE_CATALOG: WIOModuleDef[] = [
  // ═══════════════════════════════════════════════════
  // Track 6 — 공통 (전 직원)
  // ═══════════════════════════════════════════════════
  { key: 'home',         label: '홈',           icon: LayoutDashboard, href: '/wio/app',                   category: 'track6-common', description: '대시보드 홈 화면' },
  { key: 'talk',         label: '게시판',       icon: MessageSquare,   href: '/wio/app/talk',              category: 'track6-common', description: '게시판, 공지, 토론' },
  { key: 'messenger',    label: '메신저',       icon: Send,            href: '/wio/app/comm/messenger',    category: 'track6-common', description: '실시간 채팅' },
  { key: 'calendar',     label: '캘린더',       icon: Calendar,        href: '/wio/app/comm/calendar',     category: 'track6-common', description: '일정 관리' },
  { key: 'document',     label: '문서',         icon: FileStack,       href: '/wio/app/comm/document',     category: 'track6-common', description: '문서 작성, 공유, 협업' },
  { key: 'notification', label: '알림',         icon: Bell,            href: '/wio/app/comm/notification', category: 'track6-common', description: '알림 센터, 구독 설정' },
  { key: 'report',       label: '리포트',       icon: ClipboardList,   href: '/wio/app/comm/report',       category: 'track6-common', description: '업무 리포트, 보고서' },
  { key: 'ai',           label: 'AI',           icon: Bot,             href: '/wio/app/comm/ai',           category: 'track6-common', description: 'AI 어시스턴트, 자동화' },
  { key: 'it',           label: '전산',         icon: Monitor,         href: '/wio/app/comm/it',           category: 'track6-common', description: 'IT 자산, 장비 관리' },
  { key: 'survey',       label: '설문조사',     icon: ListChecks,      href: '/wio/app/survey',            category: 'track6-common', description: '설문 생성, 응답 수집, 결과 분석' },
  { key: 'vote',         label: '투표',         icon: Vote,            href: '/wio/app/vote',              category: 'track6-common', description: '찬반/선택/순위 투표' },
  { key: 'COM-PRJ',      label: '프로젝트협업', icon: FolderKanban,    href: '/wio/app/project',           category: 'track6-common', description: '프로젝트 생성, 진행 관리, 협업' },
  { key: 'COM-APR',      label: '전자결재',     icon: Stamp,           href: '/wio/app/approval',          category: 'track6-common', description: '전자 결재, 품의서, 결재라인' },
  { key: 'wiki',         label: '위키',         icon: Library,         href: '/wio/app/wiki',              category: 'track6-common', description: '사내 위키, 지식 베이스' },
  { key: 'work-calendar', label: '업무 캘린더', icon: CalendarRange,   href: '/wio/app/comm/work-calendar', category: 'track6-common', description: '업무 일정 관리 + 상향 집계' },

  // ═══════════════════════════════════════════════════
  // Track 1 — 운영·관리 (경영전략 + 인사 + 재무 + 법무)
  // ═══════════════════════════════════════════════════
  // ── 경영전략 ──
  { key: 'STR-PLN',      label: '경영기획',       icon: Compass,         href: '/wio/app/strategy/planning',   category: 'track1-ops', description: '사업 계획, 전략 수립, 경영 분석' },
  { key: 'STR-KPI',      label: '전사목표관리',   icon: Target,          href: '/wio/app/strategy/kpi',        category: 'track1-ops', description: 'KPI, OKR, BSC 전사 목표 관리' },
  { key: 'STR-ADJ',      label: '사업조정',       icon: GitBranch,       href: '/wio/app/strategy/adjustment', category: 'track1-ops', description: '사업부 간 조정, 자원 재배분' },
  { key: 'gpr',          label: 'GPR',            icon: Target,          href: '/wio/app/gpr',                 category: 'track1-ops', description: '목표 설정, 성과 리뷰, OKR 관리' },

  // ── 인사 (HR) ──
  { key: 'people',       label: '인재',           icon: Users,           href: '/wio/app/people',              category: 'track1-ops', description: '직원 프로필, 역량 관리' },
  { key: 'recruit',      label: '채용',           icon: UserPlus,        href: '/wio/app/hr/recruit',          category: 'track1-ops', description: '채용 공고, 지원자 파이프라인' },
  { key: 'attendance',   label: '근태',           icon: CalendarCheck,   href: '/wio/app/hr/attendance',       category: 'track1-ops', description: '출퇴근, 휴가, 근무 기록' },
  { key: 'payroll',      label: '급여',           icon: Wallet,          href: '/wio/app/hr/payroll',          category: 'track1-ops', description: '급여 명세, 4대보험' },
  { key: 'evaluation',   label: '평가',           icon: Star,            href: '/wio/app/hr/evaluation',       category: 'track1-ops', description: '성과 평가, 리뷰 사이클' },
  { key: 'reward',       label: '보상',           icon: Award,           href: '/wio/app/hr/reward',           category: 'track1-ops', description: '보상 체계, 복리후생' },
  { key: 'HR-INC',       label: '인센티브·성과급', icon: BadgeDollarSign, href: '/wio/app/hr/incentive',        category: 'track1-ops', description: '인센티브 정책, 성과급 산정' },
  { key: 'HR-RCG',       label: '인정/포상',      icon: Medal,           href: '/wio/app/hr/recognition',      category: 'track1-ops', description: '동료 인정, 포상 프로그램' },
  { key: 'org',          label: '조직',           icon: GitBranch,       href: '/wio/app/hr/org',              category: 'track1-ops', description: '조직도, 부서/팀 관리' },
  { key: 'HR-WRK',       label: '업무관리',       icon: ClipboardCheck,  href: '/wio/app/hr/work',             category: 'track1-ops', description: '업무 할당, 진행 추적, 업무 이관' },
  { key: 'learn',        label: '교육',           icon: BookOpen,        href: '/wio/app/learn',               category: 'track1-ops', description: '교육 과정, 학습 관리' },

  // ── 재무 (Finance) ──
  { key: 'finance',      label: '재무',           icon: Receipt,         href: '/wio/app/finance',             category: 'track1-ops', description: '재무 대시보드, 현금 흐름' },
  { key: 'gl',           label: '총계정원장',     icon: Landmark,        href: '/wio/app/finance/gl',          category: 'track1-ops', description: '총계정원장, 분개장' },
  { key: 'ap',           label: '매입',           icon: ShoppingCart,    href: '/wio/app/finance/ap',          category: 'track1-ops', description: '매입 관리, 지급 처리' },
  { key: 'ar',           label: '매출',           icon: CreditCard,      href: '/wio/app/finance/ar',          category: 'track1-ops', description: '매출 관리, 수금 처리' },
  { key: 'budget',       label: '예산',           icon: DollarSign,      href: '/wio/app/finance/budget',      category: 'track1-ops', description: '예산 편성, 집행 관리' },
  { key: 'tax',          label: '세무',           icon: FileCheck,       href: '/wio/app/finance/tax',         category: 'track1-ops', description: '세금 신고, 증빙 관리' },
  { key: 'asset',        label: '자산',           icon: Package,         href: '/wio/app/finance/asset',       category: 'track1-ops', description: '고정자산, 감가상각' },
  { key: 'timesheet',    label: '시수',           icon: Clock,           href: '/wio/app/timesheet',           category: 'track1-ops', description: '근무 시수, 프로젝트 투입 기록' },
  { key: 'certificate',  label: '수료증',         icon: Award,           href: '/wio/app/certificate',         category: 'track1-ops', description: '수료증 발급, 이력 관리' },
  { key: 'audit',        label: '감사',           icon: Shield,          href: '/wio/app/finance/audit',       category: 'track1-ops', description: '내부 감사, 컴플라이언스' },

  // ── 법무 (Legal) ──
  { key: 'legal',        label: '계약',           icon: Scale,           href: '/wio/app/finance/legal',       category: 'track1-ops', description: '계약서 관리, 법률 검토' },
  { key: 'LEG-COM',      label: '법규준수',       icon: ShieldCheck,     href: '/wio/app/legal/compliance',    category: 'track1-ops', description: '컴플라이언스, 규정 준수 체크리스트' },

  // ═══════════════════════════════════════════════════
  // Track 2 — 사업 (마케팅 + 영업 + CRM + BD)
  // ═══════════════════════════════════════════════════
  // ── 마케팅 ──
  { key: 'mkt-strategy',    label: '마케팅전략',   icon: Megaphone,    href: '/wio/app/marketing/strategy',    category: 'track2-biz', description: '마케팅 전략 수립, 플랜' },
  { key: 'mkt-campaign',    label: '캠페인',       icon: Zap,          href: '/wio/app/marketing/campaign',    category: 'track2-biz', description: '캠페인 기획, 실행, 분석' },
  { key: 'mkt-media',       label: '매체',         icon: Globe,        href: '/wio/app/marketing/media',       category: 'track2-biz', description: '매체 계획, 광고 집행' },
  { key: 'mkt-performance', label: '퍼포먼스',     icon: BarChart2,    href: '/wio/app/marketing/performance', category: 'track2-biz', description: 'ROI, ROAS 성과 분석' },
  { key: 'mkt-social',      label: '소셜',         icon: Share2,       href: '/wio/app/marketing/social',      category: 'track2-biz', description: 'SNS 채널 관리, 콘텐츠' },
  { key: 'mkt-influencer',  label: '인플루언서',   icon: Star,         href: '/wio/app/marketing/influencer',  category: 'track2-biz', description: '인플루언서 매칭, 캠페인' },
  { key: 'mkt-creative',    label: '크리에이티브', icon: PenTool,      href: '/wio/app/marketing/creative',    category: 'track2-biz', description: '크리에이티브 에셋 관리' },
  { key: 'mkt-automation',  label: '자동화',       icon: Bot,          href: '/wio/app/marketing/automation',  category: 'track2-biz', description: '마케팅 자동화 워크플로우' },
  { key: 'mkt-datahub',     label: '데이터허브',   icon: Layers,       href: '/wio/app/marketing/data-hub',    category: 'track2-biz', description: '마케팅 데이터 통합 허브' },
  { key: 'mkt-attribution', label: '어트리뷰션',   icon: PieChart,     href: '/wio/app/marketing/attribution', category: 'track2-biz', description: '전환 기여도 분석' },
  { key: 'mkt-mmm',         label: '미디어믹스',   icon: Gauge,        href: '/wio/app/marketing/mmm',         category: 'track2-biz', description: '미디어 믹스 모델링' },
  { key: 'mkt-abtest',      label: 'A/B테스트',    icon: Activity,     href: '/wio/app/marketing/abtest',      category: 'track2-biz', description: 'A/B 테스트 실험, 결과 분석' },
  { key: 'mkt-sentiment',   label: '감성분석',     icon: Eye,          href: '/wio/app/marketing/sentiment',   category: 'track2-biz', description: '고객 감성, 브랜드 인식 분석' },
  { key: 'mkt-ops',         label: '마케팅운영',   icon: Cog,          href: '/wio/app/marketing/ops',         category: 'track2-biz', description: '마케팅 운영, 예산 관리' },
  { key: 'MKT-CNT',         label: '콘텐츠관리',   icon: FileText,     href: '/wio/app/marketing/content',     category: 'track2-biz', description: '마케팅 콘텐츠 제작, 일정 관리' },
  { key: 'MKT-INT',         label: '마케팅연동허브', icon: Plug,        href: '/wio/app/marketing/integration', category: 'track2-biz', description: '외부 광고/분석 플랫폼 연동' },
  { key: 'MKT-ANL',         label: '마케팅분석',   icon: ChartLine,    href: '/wio/app/marketing/analytics',   category: 'track2-biz', description: '마케팅 KPI 대시보드, 리포트' },
  { key: 'MKT-BRD',         label: '브랜드관리',   icon: Palette,      href: '/wio/app/marketing/brand',       category: 'track2-biz', description: '브랜드 가이드라인, 자산 관리' },

  // ── 영업 (Sales) ──
  { key: 'sales',           label: '영업',         icon: TrendingUp,   href: '/wio/app/sales',                 category: 'track2-biz', description: '영업 대시보드' },
  { key: 'SAL-PIP',         label: '영업파이프라인', icon: Kanban,      href: '/wio/app/sales/pipeline',        category: 'track2-biz', description: '리드→기회→딜 파이프라인' },
  { key: 'SAL-QOT',         label: '견적관리',     icon: ReceiptText,  href: '/wio/app/sales/quote',           category: 'track2-biz', description: '견적서 작성, 발송, 이력' },
  { key: 'SAL-ORD',         label: '수주관리',     icon: ClipboardList, href: '/wio/app/sales/order',           category: 'track2-biz', description: '수주 확정, 계약 연결' },

  // ── CRM / 고객 ──
  { key: 'CRM-CST',         label: '고객관리',     icon: Users,        href: '/wio/app/crm/customers',         category: 'track2-biz', description: '고객 DB, 세그먼트, 고객 360' },
  { key: 'crm-support',     label: '고객지원',     icon: MessageCircle, href: '/wio/app/crm/support',          category: 'track2-biz', description: '고객 문의, 티켓 관리' },
  { key: 'crm-cx',          label: '고객경험',     icon: Heart,        href: '/wio/app/crm/cx',                category: 'track2-biz', description: '고객 여정, 만족도 관리' },
  { key: 'crm-membership',  label: '멤버십',       icon: Award,        href: '/wio/app/crm/membership',        category: 'track2-biz', description: '멤버십 등급, 혜택 관리' },
  { key: 'crm-cdp',         label: 'CDP',          icon: Database,     href: '/wio/app/crm/cdp',               category: 'track2-biz', description: '고객 데이터 플랫폼' },
  { key: 'crm-privacy',     label: '개인정보',     icon: Shield,       href: '/wio/app/crm/privacy',           category: 'track2-biz', description: '개인정보 처리, 동의 관리' },

  // ── 사업개발 (BD) ──
  { key: 'BD-PRJ',          label: '신사업기획',   icon: Lightbulb,    href: '/wio/app/bd/project',            category: 'track2-biz', description: '신사업 아이디어, 타당성 검토, 추진' },
  { key: 'competition',     label: '경연',         icon: Trophy,       href: '/wio/app/competition',           category: 'track2-biz', description: '공모전, 경연대회 관리' },
  { key: 'networking',      label: '네트워킹',     icon: Network,      href: '/wio/app/networking',            category: 'track2-biz', description: '인맥 관리, 미팅 네트워크' },

  // ═══════════════════════════════════════════════════
  // Track 3 — 생산 (구매조달 + 재고 + 생산 + 물류 + 품질)
  // ═══════════════════════════════════════════════════
  { key: 'PRD-PRC',       label: '구매조달',     icon: ShoppingCart,  href: '/wio/app/production/procurement', category: 'track3-prod', description: '발주, 구매 요청, 공급업체 관리' },
  { key: 'PRD-INV',       label: '재고관리',     icon: Boxes,         href: '/wio/app/production/inventory',  category: 'track3-prod', description: '재고 현황, 입출고, 안전재고' },
  { key: 'production',    label: '생산',         icon: Factory,       href: '/wio/app/support/production',    category: 'track3-prod', description: '생산 계획, 작업 지시' },
  { key: 'process',       label: '공정',         icon: Cog,           href: '/wio/app/support/process',       category: 'track3-prod', description: '공정 설계, BOM 관리' },
  { key: 'qc',            label: '품질',         icon: CheckSquare,   href: '/wio/app/support/qc',            category: 'track3-prod', description: '품질 검사, 불량 관리' },
  { key: 'equipment',     label: '설비',         icon: Cpu,           href: '/wio/app/support/equipment',     category: 'track3-prod', description: '설비 유지보수, 점검 이력' },
  { key: 'warehouse',     label: '창고',         icon: Warehouse,     href: '/wio/app/support/warehouse',     category: 'track3-prod', description: '재고 관리, 입출고' },
  { key: 'transport',     label: '운송',         icon: Truck,         href: '/wio/app/support/transport',     category: 'track3-prod', description: '배송 추적, 물류 관리' },
  { key: 'scm',           label: '공급망',       icon: Link2,         href: '/wio/app/support/scm',           category: 'track3-prod', description: '공급망 관리, SCM' },

  // ═══════════════════════════════════════════════════
  // Track 4 — 지원 (개발 + 디자인 + R&D + 데이터 + 콘텐츠)
  // ═══════════════════════════════════════════════════
  // ── 개발 ──
  { key: 'dev',            label: '개발',         icon: Code,          href: '/wio/app/support/dev',            category: 'track4-support', description: '개발 이슈, 코드 리뷰' },
  { key: 'deploy',         label: '배포',         icon: Rocket,        href: '/wio/app/support/deploy',         category: 'track4-support', description: '배포 파이프라인, 릴리즈' },

  // ── 디자인 ──
  { key: 'design',         label: '디자인',       icon: Palette,       href: '/wio/app/support/design',         category: 'track4-support', description: '디자인 프로젝트, 리뷰' },
  { key: 'design-asset',   label: '디자인자산',   icon: Image,         href: '/wio/app/support/design-asset',   category: 'track4-support', description: 'UI 키트, 브랜드 가이드라인' },

  // ── R&D ──
  { key: 'rnd',            label: 'R&D',          icon: Microscope,    href: '/wio/app/support/rnd',            category: 'track4-support', description: '연구개발, 실험 관리' },
  { key: 'patent',         label: '특허',         icon: Fingerprint,   href: '/wio/app/support/patent',         category: 'track4-support', description: '특허 출원, 지적재산 관리' },

  // ── 데이터/분석 ──
  { key: 'insight',        label: '인사이트',     icon: BarChart3,     href: '/wio/app/insight',                category: 'track4-support', description: '데이터 분석, 인사이트 대시보드' },
  { key: 'data-platform',  label: '데이터플랫폼', icon: HardDrive,     href: '/wio/app/support/data-platform',  category: 'track4-support', description: '데이터 파이프라인, ETL' },
  { key: 'DAT-BI',         label: 'BI대시보드',   icon: BarChart3,     href: '/wio/app/data/bi',                category: 'track4-support', description: '경영 대시보드, 시각화, 리포트' },
  { key: 'DAT-AI',         label: 'AI분석엔진',   icon: Bot,           href: '/wio/app/data/ai-engine',         category: 'track4-support', description: 'AI 기반 예측, 추천, 자동 분석' },
  { key: 'DAT-ANL',        label: '전략분석',     icon: ChartLine,     href: '/wio/app/data/analytics',         category: 'track4-support', description: '전략 리서치, 시장/경쟁 분석' },

  // ── 콘텐츠 ──
  { key: 'content',        label: '콘텐츠',       icon: FileText,      href: '/wio/app/content',                category: 'track4-support', description: '콘텐츠 생산, 발행 관리' },
  { key: 'CNT-HUB',        label: '콘텐츠허브',   icon: Film,          href: '/wio/app/content/hub',            category: 'track4-support', description: '콘텐츠 통합 라이브러리, DAM' },
  { key: 'dam',            label: 'DAM',          icon: Film,          href: '/wio/app/support/dam',            category: 'track4-support', description: '디지털 자산 관리' },

  // ═══════════════════════════════════════════════════
  // Track 5 — 파트너
  // ═══════════════════════════════════════════════════
  { key: 'partner',        label: '파트너관리',   icon: Handshake,     href: '/wio/app/partner',                category: 'track5-partner', description: '파트너사 관리, 협력 현황' },
  { key: 'partner-portal', label: '포털',         icon: Building,      href: '/wio/app/partner/portal',         category: 'track5-partner', description: '파트너 전용 포털' },
  { key: 'vendor',         label: '벤더',         icon: Truck,         href: '/wio/app/partner/vendor',         category: 'track5-partner', description: '벤더 평가, 조달 관리' },
  { key: 'freelancer',     label: '프리랜서',     icon: Users,         href: '/wio/app/partner/freelancer',     category: 'track5-partner', description: '프리랜서 풀, 계약 관리' },

  // ═══════════════════════════════════════════════════
  // Track 7 — 시스템 관리
  // ═══════════════════════════════════════════════════
  { key: 'SYS-ORG',        label: '조직설정',     icon: GitBranch,     href: '/wio/app/system/org',             category: 'track7-system', description: '조직 구조, 부서/팀 트리 관리' },
  { key: 'SYS-MOD',        label: '모듈관리',     icon: Boxes,         href: '/wio/app/system/modules',         category: 'track7-system', description: '모듈 활성화/비활성화, 권한 배정' },
  { key: 'SYS-CFG',        label: '시스템설정',   icon: Settings,      href: '/wio/app/system/config',          category: 'track7-system', description: '전역 설정, 환경 변수, 정책' },
  { key: 'sys-users',      label: '사용자',       icon: Users,         href: '/wio/app/system/users',           category: 'track7-system', description: '사용자 계정, 프로필 관리' },
  { key: 'sys-roles',      label: '역할/권한',    icon: Shield,        href: '/wio/app/system/roles',           category: 'track7-system', description: '역할 정의, 권한 매트릭스' },
  { key: 'sys-workflow',   label: '워크플로우',   icon: GitBranch,     href: '/wio/app/system/workflow',         category: 'track7-system', description: '업무 자동화 워크플로우' },
  { key: 'sys-monitor',    label: '모니터링',     icon: Activity,      href: '/wio/app/system/monitor',         category: 'track7-system', description: '시스템 상태, 성능 모니터링' },
  { key: 'sys-security',   label: '보안',         icon: Lock,          href: '/wio/app/system/security',        category: 'track7-system', description: '보안 설정, 접근 로그' },
  { key: 'sys-audit',      label: '감사로그',     icon: ScrollText,    href: '/wio/app/system/audit-log',       category: 'track7-system', description: '감사 로그, 변경 이력' },
  { key: 'sys-integration',label: '외부연동',     icon: Plug,          href: '/wio/app/system/integration',     category: 'track7-system', description: '외부 서비스 연동, API 키' },
  { key: 'sys-culture',    label: 'Culture',      icon: Heart,         href: '/wio/app/system/culture',         category: 'track7-system', description: '조직 문화, 핵심 가치' },
  { key: 'sys-template',   label: '양식',         icon: FileText,      href: '/wio/app/system/template',        category: 'track7-system', description: '문서 양식, 템플릿 관리' },
  { key: 'DAT-GOV',        label: '데이터거버넌스', icon: Database,     href: '/wio/app/system/data-governance', category: 'track7-system', description: '데이터 정책, 품질 관리, 접근 통제' },

  // ═══════════════════════════════════════════════════
  // 개인 (My) — 전 직원 자동 제공
  // ═══════════════════════════════════════════════════
  { key: 'MY-HOME',        label: 'My 홈',        icon: House,         href: '/wio/app/my',                    category: 'my', description: '개인 대시보드, 오늘의 할 일' },
  { key: 'MY-HR',          label: 'My 인사',      icon: User,          href: '/wio/app/my/hr',                 category: 'my', description: '급여명세, 근태현황, 증명서 발급' },
  { key: 'MY-EVL',         label: 'My 평가',      icon: Star,          href: '/wio/app/my/evaluation',         category: 'my', description: '내 평가, 피드백, 성과 리뷰' },
  { key: 'MY-WRK',         label: 'My 업무',      icon: ClipboardCheck, href: '/wio/app/my/work',              category: 'my', description: '내 업무 목록, 진행 현황' },
  { key: 'MY-APR',         label: 'My 결재',      icon: Stamp,         href: '/wio/app/my/approval',           category: 'my', description: '내 결재 요청, 승인 대기' },

  // ═══════════════════════════════════════════════════
  // 지주사 (Holding) — TenOne 전용
  // ═══════════════════════════════════════════════════
  { key: 'HLD-MKI',        label: '지주사 시장정보', icon: Globe,       href: '/wio/app/holding/market-intel',  category: 'holding', description: '시장 동향, 경쟁사 분석, 산업 리서치' },
  { key: 'HLD-MDB',        label: '지주사 대시보드', icon: BarChart3,   href: '/wio/app/holding/dashboard',     category: 'holding', description: '자회사/브랜드 종합 경영 현황' },
  { key: 'HLD-MBH',        label: '브랜드 허브',    icon: Building,     href: '/wio/app/holding/brand-hub',     category: 'holding', description: '브랜드별 성과, KPI, 자원 배분' },
];

/* ── Helper: 모든 module key 목록 ── */
export const ALL_MODULE_KEYS = MODULE_CATALOG.map(m => m.key);

/* ── Helper: category별 모듈 조회 ── */
export function getModulesByCategory(categoryId: string): WIOModuleDef[] {
  return MODULE_CATALOG.filter(m => m.category === categoryId);
}

/* ── Helper: key로 모듈 조회 ── */
export function getModule(key: string): WIOModuleDef | undefined {
  return MODULE_CATALOG.find(m => m.key === key);
}

/* ── localStorage keys ── */
const STORAGE_KEY_MODULES = 'wio-orbi-enabled-modules';
const STORAGE_KEY_CATEGORIES = 'wio-orbi-category-config';
const STORAGE_KEY_ACCORDION = 'wio-orbi-accordion-state';

export interface CategoryConfig {
  id: string;
  name: string;       // customized name
  order: number;
  enabled: boolean;
}

export interface OrbiConfig {
  enabledModules: string[];
  categories: CategoryConfig[];
}

/* ── Default config ── */
function defaultCategoryConfigs(): CategoryConfig[] {
  return CATEGORY_CATALOG.map((c, i) => ({
    id: c.id,
    name: c.name,
    order: i,
    enabled: true,
  }));
}

/* ── Load config from localStorage ── */
export function loadOrbiConfig(): OrbiConfig {
  if (typeof window === 'undefined') return { enabledModules: [], categories: defaultCategoryConfigs() };
  try {
    const mods = localStorage.getItem(STORAGE_KEY_MODULES);
    const cats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    // Also try legacy key for migration
    const legacyTracks = !cats ? localStorage.getItem('wio-orbi-track-config') : null;
    return {
      enabledModules: mods ? JSON.parse(mods) : [],
      categories: cats ? JSON.parse(cats) : (legacyTracks ? JSON.parse(legacyTracks) : defaultCategoryConfigs()),
    };
  } catch {
    return { enabledModules: [], categories: defaultCategoryConfigs() };
  }
}

/* ── Save config to localStorage ── */
export function saveOrbiConfig(config: OrbiConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(config.enabledModules));
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(config.categories));
}

/* ── Accordion state ── */
export function loadAccordionState(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const v = localStorage.getItem(STORAGE_KEY_ACCORDION);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}

export function saveAccordionState(openCategories: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACCORDION, JSON.stringify(openCategories));
}

/* ── Backward compat aliases (deprecated, will remove) ── */
export const TRACK_CATALOG = CATEGORY_CATALOG;
export const getModulesByTrack = getModulesByCategory;
export type TrackConfig = CategoryConfig;
