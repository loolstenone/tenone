/**
 * WIO Module Catalog — Single source of truth
 * All 100+ modules with category, icon, description, href
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
  Mail, Send, Calendar, FileStack, Bell, ClipboardList, Cpu, Monitor,
  Lock, ScrollText, Plug, Heart, Database,
  Microscope, Fingerprint, Code, Rocket, Factory, Cog, CheckSquare, Palette, Image, Warehouse, Link2, HardDrive, Film,
  Vote, ListChecks,
  type LucideIcon,
} from 'lucide-react';

/* ── Category 정의 (모듈 기능 분류) ── */
export interface WIOCategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const CATEGORY_CATALOG: WIOCategoryDef[] = [
  { id: 'common',    name: '공통',       icon: LayoutDashboard },
  { id: 'hr',        name: '인사',       icon: Users },
  { id: 'finance',   name: '재무',       icon: Receipt },
  { id: 'marketing', name: '마케팅',     icon: Megaphone },
  { id: 'customer',  name: '고객',       icon: Heart },
  { id: 'project',   name: '프로젝트',   icon: FolderKanban },
  { id: 'support',   name: '지원',       icon: FileText },
  { id: 'partner',   name: '파트너',     icon: Handshake },
  { id: 'system',    name: '시스템',     icon: Monitor },
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
  // ─── 공통 (Common) ───
  { key: 'home',         label: '홈',       icon: LayoutDashboard, href: '/wio/app',                   category: 'common', description: '대시보드 홈 화면' },
  { key: 'talk',         label: '게시판',   icon: MessageSquare,   href: '/wio/app/talk',              category: 'common', description: '게시판, 공지, 토론' },
  { key: 'messenger',    label: '메신저',   icon: Send,            href: '/wio/app/comm/messenger',    category: 'common', description: '실시간 채팅' },
  { key: 'calendar',     label: '캘린더',   icon: Calendar,        href: '/wio/app/comm/calendar',     category: 'common', description: '일정 관리' },
  { key: 'document',     label: '문서',     icon: FileStack,       href: '/wio/app/comm/document',     category: 'common', description: '문서 작성, 공유, 협업' },
  { key: 'notification', label: '알림',     icon: Bell,            href: '/wio/app/comm/notification', category: 'common', description: '알림 센터, 구독 설정' },
  { key: 'report',       label: '리포트',   icon: ClipboardList,   href: '/wio/app/comm/report',       category: 'common', description: '업무 리포트, 보고서' },
  { key: 'ai',           label: 'AI',       icon: Bot,             href: '/wio/app/comm/ai',           category: 'common', description: 'AI 어시스턴트, 자동화' },
  { key: 'it',           label: '전산',     icon: Monitor,         href: '/wio/app/comm/it',           category: 'common', description: 'IT 자산, 장비 관리' },
  { key: 'survey',       label: '설문조사', icon: ListChecks,      href: '/wio/app/survey',            category: 'common', description: '설문 생성, 응답 수집, 결과 분석' },
  { key: 'vote',         label: '투표',     icon: Vote,            href: '/wio/app/vote',              category: 'common', description: '찬반/선택/순위 투표' },
  { key: 'approval',     label: '결재',     icon: Stamp,           href: '/wio/app/approval',          category: 'common', description: '전자 결재, 품의서' },

  // ─── 인사 (HR) ───
  { key: 'people',       label: '인재',     icon: Users,           href: '/wio/app/people',            category: 'hr', description: '직원 프로필, 역량 관리' },
  { key: 'recruit',      label: '채용',     icon: UserPlus,        href: '/wio/app/hr/recruit',        category: 'hr', description: '채용 공고, 지원자 파이프라인' },
  { key: 'attendance',   label: '근태',     icon: CalendarCheck,   href: '/wio/app/hr/attendance',     category: 'hr', description: '출퇴근, 휴가, 근무 기록' },
  { key: 'payroll',      label: '급여',     icon: Wallet,          href: '/wio/app/hr/payroll',        category: 'hr', description: '급여 명세, 4대보험' },
  { key: 'evaluation',   label: '평가',     icon: Star,            href: '/wio/app/hr/evaluation',     category: 'hr', description: '성과 평가, 리뷰 사이클' },
  { key: 'reward',       label: '보상',     icon: Award,           href: '/wio/app/hr/reward',         category: 'hr', description: '보상 체계, 인센티브' },
  { key: 'org',          label: '조직',     icon: GitBranch,       href: '/wio/app/hr/org',            category: 'hr', description: '조직도, 부서/팀 관리' },
  { key: 'feedback',     label: '피드백',   icon: MessageCircle,   href: '/wio/app/hr/feedback',       category: 'hr', description: '동료 피드백, 1:1 면담' },
  { key: 'gpr',          label: 'GPR',      icon: Target,          href: '/wio/app/gpr',               category: 'hr', description: '목표 설정, OKR 관리' },
  { key: 'learn',        label: '교육',     icon: BookOpen,        href: '/wio/app/learn',             category: 'hr', description: '교육 과정, 학습 관리' },

  // ─── 재무 (Finance) ───
  { key: 'finance',     label: '재무',       icon: Receipt,      href: '/wio/app/finance',            category: 'finance', description: '재무 대시보드, 현금 흐름' },
  { key: 'gl',          label: '총계정원장', icon: Landmark,     href: '/wio/app/finance/gl',         category: 'finance', description: '총계정원장, 분개장' },
  { key: 'ap',          label: '매입',       icon: ShoppingCart,  href: '/wio/app/finance/ap',         category: 'finance', description: '매입 관리, 지급 처리' },
  { key: 'ar',          label: '매출',       icon: CreditCard,    href: '/wio/app/finance/ar',         category: 'finance', description: '매출 관리, 수금 처리' },
  { key: 'budget',      label: '예산',       icon: DollarSign,    href: '/wio/app/finance/budget',     category: 'finance', description: '예산 편성, 집행 관리' },
  { key: 'tax',         label: '세무',       icon: FileCheck,     href: '/wio/app/finance/tax',        category: 'finance', description: '세금 신고, 증빙 관리' },
  { key: 'asset',       label: '자산',       icon: Package,       href: '/wio/app/finance/asset',      category: 'finance', description: '고정자산, 감가상각' },
  { key: 'timesheet',   label: '시수',       icon: Clock,         href: '/wio/app/timesheet',          category: 'finance', description: '근무 시수, 프로젝트 투입 기록' },
  { key: 'certificate', label: '수료증',     icon: Award,         href: '/wio/app/certificate',        category: 'finance', description: '수료증 발급, 이력 관리' },
  { key: 'audit',       label: '감사',       icon: Shield,        href: '/wio/app/finance/audit',      category: 'finance', description: '내부 감사, 컴플라이언스' },
  { key: 'legal',       label: '계약',       icon: Scale,         href: '/wio/app/finance/legal',      category: 'finance', description: '계약서 관리, 법률 검토' },

  // ─── 마케팅 (Marketing) ───
  { key: 'mkt-strategy',    label: '마케팅전략',   icon: Megaphone,    href: '/wio/app/marketing/strategy',   category: 'marketing', description: '마케팅 전략 수립, 플랜' },
  { key: 'mkt-campaign',    label: '캠페인',       icon: Zap,          href: '/wio/app/marketing/campaign',   category: 'marketing', description: '캠페인 기획, 실행, 분석' },
  { key: 'mkt-media',       label: '매체',         icon: Globe,        href: '/wio/app/marketing/media',      category: 'marketing', description: '매체 계획, 광고 집행' },
  { key: 'mkt-performance', label: '퍼포먼스',     icon: BarChart2,    href: '/wio/app/marketing/performance',category: 'marketing', description: 'ROI, ROAS 성과 분석' },
  { key: 'mkt-social',      label: '소셜',         icon: Share2,       href: '/wio/app/marketing/social',     category: 'marketing', description: 'SNS 채널 관리, 콘텐츠' },
  { key: 'mkt-influencer',  label: '인플루언서',   icon: Star,         href: '/wio/app/marketing/influencer', category: 'marketing', description: '인플루언서 매칭, 캠페인' },
  { key: 'mkt-creative',    label: '크리에이티브', icon: PenTool,      href: '/wio/app/marketing/creative',   category: 'marketing', description: '크리에이티브 에셋 관리' },
  { key: 'mkt-automation',  label: '자동화',       icon: Bot,          href: '/wio/app/marketing/automation', category: 'marketing', description: '마케팅 자동화 워크플로우' },
  { key: 'mkt-datahub',     label: '데이터허브',   icon: Layers,       href: '/wio/app/marketing/data-hub',   category: 'marketing', description: '마케팅 데이터 통합 허브' },
  { key: 'mkt-attribution', label: '어트리뷰션',   icon: PieChart,     href: '/wio/app/marketing/attribution',category: 'marketing', description: '전환 기여도 분석' },
  { key: 'mkt-mmm',         label: '미디어믹스',   icon: Gauge,        href: '/wio/app/marketing/mmm',        category: 'marketing', description: '미디어 믹스 모델링' },
  { key: 'mkt-abtest',      label: 'A/B테스트',    icon: Activity,     href: '/wio/app/marketing/abtest',     category: 'marketing', description: 'A/B 테스트 실험, 결과 분석' },
  { key: 'mkt-sentiment',   label: '감성분석',     icon: Eye,          href: '/wio/app/marketing/sentiment',  category: 'marketing', description: '고객 감성, 브랜드 인식 분석' },
  { key: 'mkt-ops',         label: '마케팅운영',   icon: Cog,          href: '/wio/app/marketing/ops',        category: 'marketing', description: '마케팅 운영, 예산 관리' },

  // ─── 고객 (Customer) ───
  { key: 'crm-customers',   label: '고객관리',     icon: Users,        href: '/wio/app/crm/customers',        category: 'customer', description: '고객 DB, 세그먼트 관리' },
  { key: 'crm-support',     label: '고객지원',     icon: MessageCircle,href: '/wio/app/crm/support',          category: 'customer', description: '고객 문의, 티켓 관리' },
  { key: 'crm-cx',          label: '고객경험',     icon: Heart,        href: '/wio/app/crm/cx',               category: 'customer', description: '고객 여정, 만족도 관리' },
  { key: 'crm-membership',  label: '멤버십',       icon: Award,        href: '/wio/app/crm/membership',       category: 'customer', description: '멤버십 등급, 혜택 관리' },
  { key: 'crm-cdp',         label: 'CDP',          icon: Database,     href: '/wio/app/crm/cdp',              category: 'customer', description: '고객 데이터 플랫폼' },
  { key: 'crm-privacy',     label: '개인정보',     icon: Shield,       href: '/wio/app/crm/privacy',          category: 'customer', description: '개인정보 처리, 동의 관리' },

  // ─── 프로젝트 (Project) ───
  { key: 'project',         label: '프로젝트',     icon: FolderKanban, href: '/wio/app/project',               category: 'project', description: '프로젝트 생성, 진행 관리' },
  { key: 'sales',           label: '영업',         icon: TrendingUp,   href: '/wio/app/sales',                category: 'project', description: '영업 파이프라인, 딜 관리' },
  { key: 'competition',     label: '경연',         icon: Trophy,       href: '/wio/app/competition',          category: 'project', description: '공모전, 경연대회 관리' },
  { key: 'networking',      label: '네트워킹',     icon: Network,      href: '/wio/app/networking',           category: 'project', description: '인맥 관리, 미팅 네트워크' },

  // ─── 지원 (Support) ───
  { key: 'content',        label: '콘텐츠',       icon: FileText,    href: '/wio/app/content',                category: 'support', description: '콘텐츠 생산, 발행 관리' },
  { key: 'wiki',           label: '위키',         icon: Library,     href: '/wio/app/wiki',                   category: 'support', description: '사내 위키, 지식 베이스' },
  { key: 'insight',        label: '인사이트',     icon: BarChart3,   href: '/wio/app/insight',                category: 'support', description: '데이터 분석, 인사이트 대시보드' },
  { key: 'rnd',            label: 'R&D',          icon: Microscope,  href: '/wio/app/support/rnd',            category: 'support', description: '연구개발, 실험 관리' },
  { key: 'patent',         label: '특허',         icon: Fingerprint, href: '/wio/app/support/patent',         category: 'support', description: '특허 출원, 지적재산 관리' },
  { key: 'dev',            label: '개발',         icon: Code,        href: '/wio/app/support/dev',            category: 'support', description: '개발 이슈, 코드 리뷰' },
  { key: 'deploy',         label: '배포',         icon: Rocket,      href: '/wio/app/support/deploy',         category: 'support', description: '배포 파이프라인, 릴리즈' },
  { key: 'production',     label: '생산',         icon: Factory,     href: '/wio/app/support/production',     category: 'support', description: '생산 계획, 작업 지시' },
  { key: 'process',        label: '공정',         icon: Cog,         href: '/wio/app/support/process',        category: 'support', description: '공정 설계, BOM 관리' },
  { key: 'qc',             label: '품질',         icon: CheckSquare, href: '/wio/app/support/qc',             category: 'support', description: '품질 검사, 불량 관리' },
  { key: 'equipment',      label: '설비',         icon: Cpu,         href: '/wio/app/support/equipment',      category: 'support', description: '설비 유지보수, 점검 이력' },
  { key: 'design',         label: '디자인',       icon: Palette,     href: '/wio/app/support/design',         category: 'support', description: '디자인 프로젝트, 리뷰' },
  { key: 'design-asset',   label: '디자인자산',   icon: Image,       href: '/wio/app/support/design-asset',   category: 'support', description: 'UI 키트, 브랜드 가이드라인' },
  { key: 'warehouse',      label: '창고',         icon: Warehouse,   href: '/wio/app/support/warehouse',      category: 'support', description: '재고 관리, 입출고' },
  { key: 'transport',      label: '운송',         icon: Truck,       href: '/wio/app/support/transport',      category: 'support', description: '배송 추적, 물류 관리' },
  { key: 'scm',            label: '공급망',       icon: Link2,       href: '/wio/app/support/scm',            category: 'support', description: '공급망 관리, 발주' },
  { key: 'data-platform',  label: '데이터플랫폼', icon: HardDrive,   href: '/wio/app/support/data-platform',  category: 'support', description: '데이터 파이프라인, ETL' },
  { key: 'dam',            label: 'DAM',          icon: Film,        href: '/wio/app/support/dam',            category: 'support', description: '디지털 자산 관리' },

  // ─── 파트너 (Partner) ───
  { key: 'partner',        label: '파트너관리', icon: Handshake, href: '/wio/app/partner',         category: 'partner', description: '파트너사 관리, 협력 현황' },
  { key: 'partner-portal', label: '포털',       icon: Building,  href: '/wio/app/partner/portal',  category: 'partner', description: '파트너 전용 포털' },
  { key: 'vendor',         label: '벤더',       icon: Truck,     href: '/wio/app/partner/vendor',  category: 'partner', description: '벤더 평가, 조달 관리' },
  { key: 'freelancer',     label: '프리랜서',   icon: Users,     href: '/wio/app/partner/freelancer', category: 'partner', description: '프리랜서 풀, 계약 관리' },

  // ─── 시스템 (System) ───
  { key: 'sys-users',       label: '사용자',     icon: Users,      href: '/wio/app/system/users',       category: 'system', description: '사용자 계정, 프로필 관리' },
  { key: 'sys-roles',       label: '역할/권한',  icon: Shield,     href: '/wio/app/system/roles',       category: 'system', description: '역할 정의, 권한 매트릭스' },
  { key: 'sys-workflow',    label: '워크플로우',  icon: GitBranch,  href: '/wio/app/system/workflow',     category: 'system', description: '업무 자동화 워크플로우' },
  { key: 'sys-monitor',     label: '모니터링',   icon: Activity,   href: '/wio/app/system/monitor',     category: 'system', description: '시스템 상태, 성능 모니터링' },
  { key: 'sys-security',    label: '보안',       icon: Lock,       href: '/wio/app/system/security',    category: 'system', description: '보안 설정, 접근 로그' },
  { key: 'sys-audit',       label: '감사로그',   icon: ScrollText, href: '/wio/app/system/audit-log',   category: 'system', description: '감사 로그, 변경 이력' },
  { key: 'sys-integration', label: '외부연동',   icon: Plug,       href: '/wio/app/system/integration', category: 'system', description: '외부 서비스 연동, API 키' },
  { key: 'sys-culture',     label: 'Culture',    icon: Heart,      href: '/wio/app/system/culture',     category: 'system', description: '조직 문화, 핵심 가치' },
  { key: 'sys-template',    label: '양식',       icon: FileText,   href: '/wio/app/system/template',    category: 'system', description: '문서 양식, 템플릿 관리' },
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
