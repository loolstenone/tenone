/**
 * WIO Module Catalog — Single source of truth
 * All 87+ modules with track, icon, description, href
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
  type LucideIcon,
} from 'lucide-react';

/* ── Track 정의 ── */
export interface WIOTrackDef {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const TRACK_CATALOG: WIOTrackDef[] = [
  { id: 'common',  name: '공통',       icon: LayoutDashboard },
  { id: 'hr',      name: '인사·조직',  icon: Users },
  { id: 'business', name: '사업',      icon: TrendingUp },
  { id: 'support', name: '지원',       icon: FileText },
  { id: 'finance', name: '재무·법무',  icon: Receipt },
  { id: 'partner', name: '파트너',     icon: Handshake },
  { id: 'system',  name: '시스템',     icon: Monitor },
];

/* ── Module 정의 ── */
export interface WIOModuleDef {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  track: string;
  description: string;
}

export const MODULE_CATALOG: WIOModuleDef[] = [
  // ─── 공통 (Common) ───
  { key: 'home',         label: '홈',       icon: LayoutDashboard, href: '/wio/app',                   track: 'common', description: '대시보드 홈 화면' },
  { key: 'talk',         label: '소통',     icon: MessageSquare,   href: '/wio/app/talk',              track: 'common', description: '게시판, 공지, 토론' },
  { key: 'approval',     label: '결재',     icon: Stamp,           href: '/wio/app/approval',          track: 'common', description: '전자 결재, 품의서' },
  { key: 'mail',         label: '메일',     icon: Mail,            href: '/wio/app/comm/mail',         track: 'common', description: '이메일 송수신' },
  { key: 'messenger',    label: '메신저',   icon: Send,            href: '/wio/app/comm/messenger',    track: 'common', description: '실시간 채팅' },
  { key: 'calendar',     label: '캘린더',   icon: Calendar,        href: '/wio/app/comm/calendar',     track: 'common', description: '일정 관리' },
  { key: 'document',     label: '문서',     icon: FileStack,       href: '/wio/app/comm/document',     track: 'common', description: '문서 작성, 공유, 협업' },
  { key: 'notification', label: '알림',     icon: Bell,            href: '/wio/app/comm/notification', track: 'common', description: '알림 센터, 구독 설정' },
  { key: 'report',       label: '리포트',   icon: ClipboardList,   href: '/wio/app/comm/report',       track: 'common', description: '업무 리포트, 보고서' },
  { key: 'ai',           label: 'AI',       icon: Bot,             href: '/wio/app/comm/ai',           track: 'common', description: 'AI 어시스턴트, 자동화' },
  { key: 'it',           label: '전산',     icon: Monitor,         href: '/wio/app/comm/it',           track: 'common', description: 'IT 자산, 장비 관리' },

  // ─── 인사·조직 (HR) ───
  { key: 'people',       label: '인재',     icon: Users,           href: '/wio/app/people',            track: 'hr', description: '직원 프로필, 역량 관리' },
  { key: 'recruit',      label: '채용',     icon: UserPlus,        href: '/wio/app/hr/recruit',        track: 'hr', description: '채용 공고, 지원자 파이프라인' },
  { key: 'attendance',   label: '근태',     icon: CalendarCheck,   href: '/wio/app/hr/attendance',     track: 'hr', description: '출퇴근, 휴가, 근무 기록' },
  { key: 'payroll',      label: '급여',     icon: Wallet,          href: '/wio/app/hr/payroll',        track: 'hr', description: '급여 명세, 4대보험' },
  { key: 'evaluation',   label: '평가',     icon: Star,            href: '/wio/app/hr/evaluation',     track: 'hr', description: '성과 평가, 리뷰 사이클' },
  { key: 'reward',       label: '보상',     icon: Award,           href: '/wio/app/hr/reward',         track: 'hr', description: '보상 체계, 인센티브' },
  { key: 'org',          label: '조직',     icon: GitBranch,       href: '/wio/app/hr/org',            track: 'hr', description: '조직도, 부서/팀 관리' },
  { key: 'feedback',     label: '피드백',   icon: MessageCircle,   href: '/wio/app/hr/feedback',       track: 'hr', description: '동료 피드백, 1:1 면담' },
  { key: 'gpr',          label: 'GPR',      icon: Target,          href: '/wio/app/gpr',               track: 'hr', description: '목표 설정, OKR 관리' },
  { key: 'learn',        label: '교육',     icon: BookOpen,        href: '/wio/app/learn',             track: 'hr', description: '교육 과정, 학습 관리' },

  // ─── 사업 (Business) ───
  { key: 'project',         label: '프로젝트',     icon: FolderKanban, href: '/wio/app/project',               track: 'business', description: '프로젝트 생성, 진행 관리' },
  { key: 'sales',           label: '영업',         icon: TrendingUp,   href: '/wio/app/sales',                track: 'business', description: '영업 파이프라인, 딜 관리' },
  { key: 'competition',     label: '경연',         icon: Trophy,       href: '/wio/app/competition',          track: 'business', description: '공모전, 경연대회 관리' },
  { key: 'networking',      label: '네트워킹',     icon: Network,      href: '/wio/app/networking',           track: 'business', description: '인맥 관리, 미팅 네트워크' },
  { key: 'mkt-strategy',    label: '마케팅전략',   icon: Megaphone,    href: '/wio/app/marketing/strategy',   track: 'business', description: '마케팅 전략 수립, 플랜' },
  { key: 'mkt-campaign',    label: '캠페인',       icon: Zap,          href: '/wio/app/marketing/campaign',   track: 'business', description: '캠페인 기획, 실행, 분석' },
  { key: 'mkt-media',       label: '매체',         icon: Globe,        href: '/wio/app/marketing/media',      track: 'business', description: '매체 계획, 광고 집행' },
  { key: 'mkt-performance', label: '퍼포먼스',     icon: BarChart2,    href: '/wio/app/marketing/performance',track: 'business', description: 'ROI, ROAS 성과 분석' },
  { key: 'mkt-social',      label: '소셜',         icon: Share2,       href: '/wio/app/marketing/social',     track: 'business', description: 'SNS 채널 관리, 콘텐츠' },
  { key: 'mkt-influencer',  label: '인플루언서',   icon: Star,         href: '/wio/app/marketing/influencer', track: 'business', description: '인플루언서 매칭, 캠페인' },
  { key: 'mkt-creative',    label: '크리에이티브', icon: PenTool,      href: '/wio/app/marketing/creative',   track: 'business', description: '크리에이티브 에셋 관리' },
  { key: 'mkt-automation',  label: '자동화',       icon: Bot,          href: '/wio/app/marketing/automation', track: 'business', description: '마케팅 자동화 워크플로우' },
  { key: 'mkt-datahub',     label: '데이터허브',   icon: Layers,       href: '/wio/app/marketing/data-hub',   track: 'business', description: '마케팅 데이터 통합 허브' },
  { key: 'mkt-attribution', label: '어트리뷰션',   icon: PieChart,     href: '/wio/app/marketing/attribution',track: 'business', description: '전환 기여도 분석' },
  { key: 'mkt-mmm',         label: '미디어믹스',   icon: Gauge,        href: '/wio/app/marketing/mmm',        track: 'business', description: '미디어 믹스 모델링' },
  { key: 'mkt-abtest',      label: 'A/B테스트',    icon: Activity,     href: '/wio/app/marketing/abtest',     track: 'business', description: 'A/B 테스트 실험, 결과 분석' },
  { key: 'mkt-sentiment',   label: '감성분석',     icon: Eye,          href: '/wio/app/marketing/sentiment',  track: 'business', description: '고객 감성, 브랜드 인식 분석' },
  { key: 'mkt-ops',         label: '마케팅운영',   icon: Cog,          href: '/wio/app/marketing/ops',        track: 'business', description: '마케팅 운영, 예산 관리' },
  { key: 'crm-customers',   label: '고객관리',     icon: Users,        href: '/wio/app/crm/customers',        track: 'business', description: '고객 DB, 세그먼트 관리' },
  { key: 'crm-support',     label: '고객지원',     icon: MessageCircle,href: '/wio/app/crm/support',          track: 'business', description: '고객 문의, 티켓 관리' },
  { key: 'crm-cx',          label: '고객경험',     icon: Heart,        href: '/wio/app/crm/cx',               track: 'business', description: '고객 여정, 만족도 관리' },
  { key: 'crm-membership',  label: '멤버십',       icon: Award,        href: '/wio/app/crm/membership',       track: 'business', description: '멤버십 등급, 혜택 관리' },
  { key: 'crm-cdp',         label: 'CDP',          icon: Database,     href: '/wio/app/crm/cdp',              track: 'business', description: '고객 데이터 플랫폼' },
  { key: 'crm-privacy',     label: '개인정보',     icon: Shield,       href: '/wio/app/crm/privacy',          track: 'business', description: '개인정보 처리, 동의 관리' },

  // ─── 지원 (Support) ───
  { key: 'content',        label: '콘텐츠',       icon: FileText,    href: '/wio/app/content',                track: 'support', description: '콘텐츠 생산, 발행 관리' },
  { key: 'wiki',           label: '위키',         icon: Library,     href: '/wio/app/wiki',                   track: 'support', description: '사내 위키, 지식 베이스' },
  { key: 'insight',        label: '인사이트',     icon: BarChart3,   href: '/wio/app/insight',                track: 'support', description: '데이터 분석, 인사이트 대시보드' },
  { key: 'rnd',            label: 'R&D',          icon: Microscope,  href: '/wio/app/support/rnd',            track: 'support', description: '연구개발, 실험 관리' },
  { key: 'patent',         label: '특허',         icon: Fingerprint, href: '/wio/app/support/patent',         track: 'support', description: '특허 출원, 지적재산 관리' },
  { key: 'dev',            label: '개발',         icon: Code,        href: '/wio/app/support/dev',            track: 'support', description: '개발 이슈, 코드 리뷰' },
  { key: 'deploy',         label: '배포',         icon: Rocket,      href: '/wio/app/support/deploy',         track: 'support', description: '배포 파이프라인, 릴리즈' },
  { key: 'production',     label: '생산',         icon: Factory,     href: '/wio/app/support/production',     track: 'support', description: '생산 계획, 작업 지시' },
  { key: 'process',        label: '공정',         icon: Cog,         href: '/wio/app/support/process',        track: 'support', description: '공정 설계, BOM 관리' },
  { key: 'qc',             label: '품질',         icon: CheckSquare, href: '/wio/app/support/qc',             track: 'support', description: '품질 검사, 불량 관리' },
  { key: 'equipment',      label: '설비',         icon: Cpu,         href: '/wio/app/support/equipment',      track: 'support', description: '설비 유지보수, 점검 이력' },
  { key: 'design',         label: '디자인',       icon: Palette,     href: '/wio/app/support/design',         track: 'support', description: '디자인 프로젝트, 리뷰' },
  { key: 'design-asset',   label: '디자인자산',   icon: Image,       href: '/wio/app/support/design-asset',   track: 'support', description: 'UI 키트, 브랜드 가이드라인' },
  { key: 'warehouse',      label: '창고',         icon: Warehouse,   href: '/wio/app/support/warehouse',      track: 'support', description: '재고 관리, 입출고' },
  { key: 'transport',      label: '운송',         icon: Truck,       href: '/wio/app/support/transport',      track: 'support', description: '배송 추적, 물류 관리' },
  { key: 'scm',            label: '공급망',       icon: Link2,       href: '/wio/app/support/scm',            track: 'support', description: '공급망 관리, 발주' },
  { key: 'data-platform',  label: '데이터플랫폼', icon: HardDrive,   href: '/wio/app/support/data-platform',  track: 'support', description: '데이터 파이프라인, ETL' },
  { key: 'dam',            label: 'DAM',          icon: Film,        href: '/wio/app/support/dam',            track: 'support', description: '디지털 자산 관리' },

  // ─── 재무·법무 (Finance) ───
  { key: 'finance',     label: '재무',       icon: Receipt,      href: '/wio/app/finance',            track: 'finance', description: '재무 대시보드, 현금 흐름' },
  { key: 'gl',          label: '총계정원장', icon: Landmark,     href: '/wio/app/finance/gl',         track: 'finance', description: '총계정원장, 분개장' },
  { key: 'ap',          label: '매입',       icon: ShoppingCart,  href: '/wio/app/finance/ap',         track: 'finance', description: '매입 관리, 지급 처리' },
  { key: 'ar',          label: '매출',       icon: CreditCard,    href: '/wio/app/finance/ar',         track: 'finance', description: '매출 관리, 수금 처리' },
  { key: 'budget',      label: '예산',       icon: DollarSign,    href: '/wio/app/finance/budget',     track: 'finance', description: '예산 편성, 집행 관리' },
  { key: 'tax',         label: '세무',       icon: FileCheck,     href: '/wio/app/finance/tax',        track: 'finance', description: '세금 신고, 증빙 관리' },
  { key: 'asset',       label: '자산',       icon: Package,       href: '/wio/app/finance/asset',      track: 'finance', description: '고정자산, 감가상각' },
  { key: 'timesheet',   label: '시수',       icon: Clock,         href: '/wio/app/timesheet',          track: 'finance', description: '근무 시수, 프로젝트 투입 기록' },
  { key: 'certificate', label: '수료증',     icon: Award,         href: '/wio/app/certificate',        track: 'finance', description: '수료증 발급, 이력 관리' },
  { key: 'audit',       label: '감사',       icon: Shield,        href: '/wio/app/finance/audit',      track: 'finance', description: '내부 감사, 컴플라이언스' },
  { key: 'legal',       label: '계약',       icon: Scale,         href: '/wio/app/finance/legal',      track: 'finance', description: '계약서 관리, 법률 검토' },

  // ─── 파트너 (Partner) ───
  { key: 'partner',        label: '파트너관리', icon: Handshake, href: '/wio/app/partner',         track: 'partner', description: '파트너사 관리, 협력 현황' },
  { key: 'partner-portal', label: '포털',       icon: Building,  href: '/wio/app/partner/portal',  track: 'partner', description: '파트너 전용 포털' },
  { key: 'vendor',         label: '벤더',       icon: Truck,     href: '/wio/app/partner/vendor',  track: 'partner', description: '벤더 평가, 조달 관리' },
  { key: 'freelancer',     label: '프리랜서',   icon: Users,     href: '/wio/app/partner/freelancer', track: 'partner', description: '프리랜서 풀, 계약 관리' },

  // ─── 시스템 (System) ───
  { key: 'sys-users',       label: '사용자',     icon: Users,      href: '/wio/app/system/users',       track: 'system', description: '사용자 계정, 프로필 관리' },
  { key: 'sys-roles',       label: '역할/권한',  icon: Shield,     href: '/wio/app/system/roles',       track: 'system', description: '역할 정의, 권한 매트릭스' },
  { key: 'sys-workflow',    label: '워크플로우',  icon: GitBranch,  href: '/wio/app/system/workflow',     track: 'system', description: '업무 자동화 워크플로우' },
  { key: 'sys-monitor',     label: '모니터링',   icon: Activity,   href: '/wio/app/system/monitor',     track: 'system', description: '시스템 상태, 성능 모니터링' },
  { key: 'sys-security',    label: '보안',       icon: Lock,       href: '/wio/app/system/security',    track: 'system', description: '보안 설정, 접근 로그' },
  { key: 'sys-audit',       label: '감사로그',   icon: ScrollText, href: '/wio/app/system/audit-log',   track: 'system', description: '감사 로그, 변경 이력' },
  { key: 'sys-integration', label: '외부연동',   icon: Plug,       href: '/wio/app/system/integration', track: 'system', description: '외부 서비스 연동, API 키' },
  { key: 'sys-culture',     label: 'Culture',    icon: Heart,      href: '/wio/app/system/culture',     track: 'system', description: '조직 문화, 핵심 가치' },
  { key: 'sys-template',    label: '양식',       icon: FileText,   href: '/wio/app/system/template',    track: 'system', description: '문서 양식, 템플릿 관리' },
];

/* ── Helper: 모든 module key 목록 ── */
export const ALL_MODULE_KEYS = MODULE_CATALOG.map(m => m.key);

/* ── Helper: track별 모듈 조회 ── */
export function getModulesByTrack(trackId: string): WIOModuleDef[] {
  return MODULE_CATALOG.filter(m => m.track === trackId);
}

/* ── Helper: key로 모듈 조회 ── */
export function getModule(key: string): WIOModuleDef | undefined {
  return MODULE_CATALOG.find(m => m.key === key);
}

/* ── localStorage keys ── */
const STORAGE_KEY_MODULES = 'wio-orbi-enabled-modules';
const STORAGE_KEY_TRACKS = 'wio-orbi-track-config';
const STORAGE_KEY_ACCORDION = 'wio-orbi-accordion-state';

export interface TrackConfig {
  id: string;
  name: string;       // customized name
  order: number;
  enabled: boolean;
}

export interface OrbiConfig {
  enabledModules: string[];
  tracks: TrackConfig[];
}

/* ── Default config: 홈 only ── */
function defaultTrackConfigs(): TrackConfig[] {
  return TRACK_CATALOG.map((t, i) => ({
    id: t.id,
    name: t.name,
    order: i,
    enabled: true,
  }));
}

/* ── Load config from localStorage ── */
export function loadOrbiConfig(): OrbiConfig {
  if (typeof window === 'undefined') return { enabledModules: [], tracks: defaultTrackConfigs() };
  try {
    const mods = localStorage.getItem(STORAGE_KEY_MODULES);
    const tracks = localStorage.getItem(STORAGE_KEY_TRACKS);
    return {
      enabledModules: mods ? JSON.parse(mods) : [],
      tracks: tracks ? JSON.parse(tracks) : defaultTrackConfigs(),
    };
  } catch {
    return { enabledModules: [], tracks: defaultTrackConfigs() };
  }
}

/* ── Save config to localStorage ── */
export function saveOrbiConfig(config: OrbiConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(config.enabledModules));
  localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(config.tracks));
}

/* ── Accordion state ── */
export function loadAccordionState(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const v = localStorage.getItem(STORAGE_KEY_ACCORDION);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}

export function saveAccordionState(openTracks: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACCORDION, JSON.stringify(openTracks));
}
