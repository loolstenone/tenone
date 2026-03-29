'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Users, Clock, DollarSign, ChevronDown, ChevronRight,
  Cog, ShieldCheck, Layers, ArrowRightLeft, Sparkles, FileText,
  MessageCircle, Award, Brain, Lock, Eye, Pencil, Trash2, Settings,
  Server, Database, Globe, Shield, Monitor, Smartphone, Palette,
  Accessibility, Zap, Target, BarChart3, Rocket, Calendar, CheckCircle2
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 3대 자원 상세 ── */
const RESOURCE_DETAILS = [
  {
    key: 'human', icon: Users, label: '인간', sub: 'Human Resource Core', color: '#7C6AE8',
    items: [
      { name: '인사 마스터', desc: '사원번호, 성명, 부서, 직급, 직책, 입사일, 계약유형' },
      { name: '조직 소속', desc: '트랙 → 부서 → 팀 → 파트 (다중 소속 허용)' },
      { name: '역량 프로필', desc: '스킬셋, 자격증, 교육이력, 프로젝트 경험' },
      { name: '근태 기록', desc: '출퇴근, 휴가, 초과근무, 재택근무' },
      { name: '성과 기록', desc: 'KPI, 평가 결과, 피드백 이력' },
      { name: '권한 프로필', desc: '시스템 접근 권한, 모듈별 RBAC' },
    ],
  },
  {
    key: 'time', icon: Clock, label: '시간', sub: 'Time Resource Core', color: '#3B9EE8',
    items: [
      { name: '근무 시간', desc: '개인별 근무시간 집계, 초과근무 자동 계산' },
      { name: '프로젝트 타임라인', desc: '프로젝트별 시작/종료/마일스톤' },
      { name: '업무 일정', desc: '개인/팀/부서 캘린더, 회의, 데드라인' },
      { name: 'SLA/납기', desc: '고객 약속 납기, 내부 SLA 추적' },
      { name: '워크플로우 리드타임', desc: '결재·프로세스별 소요시간 분석' },
    ],
  },
  {
    key: 'money', icon: DollarSign, label: '돈', sub: 'Financial Resource Core', color: '#2DC98A',
    items: [
      { name: '회계 원장 (GL)', desc: '계정과목, 분개, 전표, 재무제표' },
      { name: '예산', desc: '부서별/프로젝트별 예산 편성·집행·잔액' },
      { name: '매출/매입', desc: '매출 파이프라인, 매입 관리, 세금계산서' },
      { name: '급여', desc: '급여 계산, 4대보험, 원천징수, 지급' },
      { name: '비용', desc: '경비 청구, 법인카드, 출장비, 복리후생' },
      { name: '자산', desc: '유무형 자산 등록, 감가상각, 재고 평가' },
    ],
  },
];

/* ── Culture Engine ── */
const CULTURE_STEPS = [
  {
    icon: FileText, title: '철학 정의',
    desc: 'Mission, Vision, Core Values, Work Principles, Communication Guidelines를 시스템에 등록합니다.',
    detail: '핵심가치별 관찰 가능한 행동 지표(behavioral_indicators)와 안티패턴(anti_patterns)까지 정의하여 모호함을 제거합니다.',
  },
  {
    icon: Pencil, title: '양식에 녹이기',
    desc: '기안서, 보고서, 제안서, 회의록, 피드백 등 모든 양식에 가치 체크포인트를 내장합니다.',
    detail: '기안서에는 "어떤 핵심가치에 기여하는가" 필수, 보고서는 "결론→근거→제안→리스크" 순서 고정.',
  },
  {
    icon: Cog, title: '프로세스 강제',
    desc: '결재 흐름에 가치 정합성 AI 자동 스코어링. 회의에는 유형별 시스템 강제 사항을 적용합니다.',
    detail: '의사결정 회의: 안건별 찬반 투표 필수. 스탠드업: 3문장 강제 + 15분 타이머.',
  },
  {
    icon: Award, title: '평가에 반영',
    desc: '성과(What) + 가치(How) 동등 평가. 상시 피드백이 분기/연간 평가로 자연스럽게 연결됩니다.',
    detail: '다면 평가(360도): 자기/상사/동료/부하 + AI 추천 기반 Value Champion 선정.',
  },
];

const CULTURE_DASHBOARD = [
  { metric: '가치 언급 빈도', method: '기안서/보고서에서 핵심가치 태그 사용 빈도' },
  { metric: '양식 준수율', method: '양식 구조 준수 비율 (AI 자동 판정)' },
  { metric: '회의 효율성', method: '의사결정 회의의 결정 전환율, 평균 소요시간' },
  { metric: '피드백 활성도', method: '동료 간 피드백 교환 빈도, 가치 기반 피드백 비율' },
  { metric: '온보딩 완주율', method: '문화 학습 프로그램 완료율' },
  { metric: '가치 정합 스코어', method: 'AI 분석 의사결정 가치 정합도 평균' },
];

/* ── 워크플로우 엔진 ── */
const WF_COMPONENTS = [
  { name: '트리거', desc: '문서 작성, 상태 변경, 일정 도래, 외부 웹훅', color: '#E24B4A' },
  { name: '스텝', desc: '입력, 승인, 알림, 데이터 변환', color: '#534AB7' },
  { name: '담당자 규칙', desc: '고정 / 조직장 자동 / 라운드로빈', color: '#1D9E75' },
  { name: '조건 분기', desc: '금액, 유형, 등급에 따라 다른 경로', color: '#378ADD' },
  { name: '병렬 처리', desc: '동시에 여러 조직에서 병렬 작업', color: '#BA7517' },
  { name: '타임아웃', desc: '미처리 시 에스컬레이션', color: '#D4537E' },
  { name: '후속 액션', desc: '데이터 업데이트, 다음 워크플로우, API 호출', color: '#639922' },
];

/* ── 권한 모델 ── */
const PERMISSION_LEVELS = [
  { level: 0, name: 'Super Admin', desc: '시스템 전체', color: '#E24B4A' },
  { level: 1, name: 'Track Admin', desc: '트랙 내 전체', color: '#534AB7' },
  { level: 2, name: 'Org Admin', desc: '소속 조직 내 전체', color: '#1D9E75' },
  { level: 3, name: 'Team Lead', desc: '팀 내 관리 + 하위 열람', color: '#378ADD' },
  { level: 4, name: 'Member', desc: '자기 업무 + 팀 공유 데이터', color: '#BA7517' },
  { level: 5, name: 'Viewer', desc: '읽기 전용', color: '#888780' },
  { level: 6, name: 'External', desc: '파트너, 제한적 접근', color: '#D4537E' },
];

const PERMISSION_LAYERS = [
  { layer: 1, name: '시스템 권한', desc: '시스템 관리 메뉴, 전역 설정 변경', icon: Settings },
  { layer: 2, name: '모듈 권한', desc: '특정 모듈의 CRUD', icon: Layers },
  { layer: 3, name: '데이터 권한', desc: '볼 수 있는 데이터 범위 (자기/팀/부서/전사)', icon: Eye },
  { layer: 4, name: '기능 권한', desc: '모듈 내 세부 기능 접근', icon: Lock },
];

/* ── 크로스-트랙 워크플로우 예시 ── */
const CROSS_TRACK_EXAMPLES = [
  {
    title: '신제품 출시',
    color: '#534AB7',
    steps: [
      '사업부 기획안', '임원 승인', 'R&D 프로토타입 + 디자인 패키지 + 재무 예산 (병렬)',
      '생산 양산계획', '물류 유통준비', '마케팅 런칭', '영업 판매개시',
    ],
  },
  {
    title: '대규모 구매',
    color: '#1D9E75',
    steps: [
      '구매요청', '3사 견적비교',
      '조건 분기: 1억 미만(팀장) / 1~5억(본부장+재무) / 5억 이상(CFO+법무+이사회)',
      '발주', '입고확인', '회계전표', '대금지급',
    ],
  },
  {
    title: '직원 온보딩',
    color: '#378ADD',
    steps: [
      'HR 입사확정', '총무 좌석/장비 + 전산 계정생성 + HR 교육등록 + 팀장 멘토지정 (자동 병렬)',
      'HR 온보딩 완료확인', '전사 알림',
    ],
  },
];

/* ── Part 13: 기술 아키텍처 ── */
const TECH_STACK = [
  { layer: 'Frontend', color: '#534AB7', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript (strict)', 'Tailwind CSS v4'] },
  { layer: 'Backend', color: '#1D9E75', items: ['Supabase (PostgreSQL)', 'Edge Functions', 'Realtime Subscriptions', 'Row Level Security'] },
  { layer: 'AI/ML', color: '#E24B4A', items: ['Claude API (Anthropic)', 'OpenAI Embeddings', 'Supabase pgvector', 'Custom ML Pipeline'] },
  { layer: 'Infra', color: '#378ADD', items: ['Google Cloud Run', 'Cloud SQL (failover)', 'Cloud CDN', 'Cloud Armor (WAF)'] },
  { layer: 'DevOps', color: '#BA7517', items: ['GitHub Actions (CI/CD)', 'Docker (Standalone)', 'Terraform (IaC)', 'Sentry (Monitoring)'] },
];

/* ── Part 14: 보안 설계 ── */
const SECURITY_LAYERS = [
  {
    layer: 1, name: '네트워크 보안', color: '#E24B4A', icon: Globe,
    items: ['Cloud Armor WAF', 'DDoS 방어', 'SSL/TLS 1.3', 'VPC 격리'],
  },
  {
    layer: 2, name: '애플리케이션 보안', color: '#534AB7', icon: Monitor,
    items: ['OWASP Top 10 대응', 'CSRF/XSS 방어', 'Rate Limiting', 'Input Validation'],
  },
  {
    layer: 3, name: '데이터 보안', color: '#1D9E75', icon: Database,
    items: ['AES-256 암호화 (저장)', 'TLS 1.3 (전송)', 'RLS (행 수준 보안)', '가명/익명 처리'],
  },
  {
    layer: 4, name: '운영 보안', color: '#378ADD', icon: ShieldCheck,
    items: ['2FA 필수', 'RBAC 7 Level', '감사 로그 전수 기록', '보안 감사 (연 1회)'],
  },
];

/* ── Part 15: UI/UX 원칙 ── */
const UX_PRINCIPLES = [
  { num: 1, title: '일관성 (Consistency)', desc: '모든 모듈이 동일한 레이아웃, 네비게이션, 인터랙션 패턴을 공유합니다.', icon: Layers },
  { num: 2, title: '최소 입력 (Minimal Input)', desc: 'AI가 80%를 채우고, 사용자는 확인/수정만 합니다. 자동완성, 추천, 프리셋 적극 활용.', icon: Zap },
  { num: 3, title: '접근성 (Accessibility)', desc: 'WCAG 2.1 AA 준수. 키보드 네비게이션, 스크린리더, 고대비 모드 지원.', icon: Accessibility },
  { num: 4, title: '모바일 우선 (Mobile First)', desc: '모든 화면이 모바일에서 먼저 설계되고, 데스크톱으로 확장됩니다.', icon: Smartphone },
  { num: 5, title: '맥락적 도움 (Contextual Help)', desc: '매 화면에 인라인 가이드, 툴팁, AI 어시스턴트가 함께합니다.', icon: Brain },
];

/* ── Part 16: 개발 로드맵 ── */
const DEV_ROADMAP = [
  {
    phase: 'Phase 1', name: '코어 인프라', period: 'M1~M3', color: '#E24B4A',
    items: ['인증/권한 시스템', '조직 관리', '3대 자원 코어', 'Culture Engine 기초'],
  },
  {
    phase: 'Phase 2', name: '핵심 모듈', period: 'M4~M6', color: '#534AB7',
    items: ['전자결재', 'HR 모듈 (채용~평가)', '회계/재무', '워크플로우 엔진'],
  },
  {
    phase: 'Phase 3', name: '사업 모듈', period: 'M7~M9', color: '#1D9E75',
    items: ['CRM/영업', '마케팅 자동화', '매체 데이터 허브', 'AI 분석 엔진'],
  },
  {
    phase: 'Phase 4', name: '고도화', period: 'M10~M12', color: '#378ADD',
    items: ['AI 코칭 고도화', '멀티테넌시 완성', '외부 연동 마켓플레이스', '엔터프라이즈 기능'],
  },
];

/* ── Part 17: 핵심 성공 지표 ── */
const SUCCESS_KPIS = [
  { category: '도입/확산', kpis: [{ name: '활성 사용률', target: '80%+', desc: '월간 활성 사용자/전체 사용자' }, { name: '모듈 활용도', target: '5개+', desc: '조직 평균 활성 모듈 수' }] },
  { category: '효율성', kpis: [{ name: '프로세스 단축', target: '40%+', desc: '워크플로우 평균 리드타임 감소' }, { name: '수작업 감소', target: '60%+', desc: 'AI 자동화로 대체된 수작업 비율' }] },
  { category: '품질', kpis: [{ name: '시스템 가동률', target: '99.9%', desc: 'SLA 기준' }, { name: '사용자 만족도', target: 'NPS 50+', desc: '분기별 설문' }] },
  { category: '비즈니스', kpis: [{ name: 'MRR 성장률', target: '15%+/월', desc: '월 반복 매출 성장' }, { name: '고객 유지율', target: '95%+', desc: '연간 갱신율' }] },
];

export default function FrameworkPage() {
  const [expandedResource, setExpandedResource] = useState<string | null>('human');

  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6">
            <ArrowLeft size={14} /> WIO
          </Link>

          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 px-4 py-1.5 text-xs text-[#9B8FE8] font-medium">
              <Sparkles size={12} /> EUS Architecture
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Framework</h1>
            <p className="text-slate-400">3대 자원 · Culture Engine · 워크플로우 엔진 · 권한 모델</p>
          </div>

          {/* ═══════ 3대 자원 상세 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">3대 자원 관리 체계</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              모든 모듈이 공유하는 코어 데이터 레이어. 인간·시간·돈 각각의 데이터 항목을 표준화하여 모듈 간 데이터 흐름을 보장합니다.
            </p>
            <div className="space-y-3">
              {RESOURCE_DETAILS.map((r) => {
                const Icon = r.icon;
                const isOpen = expandedResource === r.key;
                return (
                  <div key={r.key} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                      onClick={() => setExpandedResource(isOpen ? null : r.key)}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: `${r.color}15` }}>
                        <Icon size={20} style={{ color: r.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{r.label} <span className="text-xs font-normal text-slate-500 ml-1">{r.sub}</span></h3>
                        <p className="text-xs text-slate-600">{r.items.length}개 데이터 항목</p>
                      </div>
                      <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 border-t border-white/5">
                        <div className="grid gap-3 mt-4 md:grid-cols-2">
                          {r.items.map((item) => (
                            <div key={item.name} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
                              <div>
                                <div className="text-sm font-medium text-white">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ Culture Engine ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#D4537E]" />
              <h2 className="text-2xl font-bold">Culture Engine</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              기업 문화는 포스터나 슬로건이 아니라, 일상 업무의 양식·프로세스·결재 흐름·피드백 구조 안에 녹아 있어야 합니다.
            </p>

            {/* 4단계 */}
            <div className="grid gap-4 md:grid-cols-2 mb-10">
              {CULTURE_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4537E]/10">
                        <Icon size={18} className="text-[#D4537E]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600">STEP {String(i + 1).padStart(2, '0')}</span>
                        <h3 className="font-bold text-white text-sm">{s.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{s.desc}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Culture Dashboard */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-[#D4537E]" />
                Culture Dashboard — 문화 건강도 측정
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {CULTURE_DASHBOARD.map((d) => (
                  <div key={d.metric} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4537E] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium text-white">{d.metric}</span>
                      <span className="text-slate-500 ml-2">{d.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ 워크플로우 엔진 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">워크플로우 엔진</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              부서를 넘나드는 업무 프로세스를 비주얼하게 설계하고 자동 실행합니다.
            </p>

            {/* 구성요소 */}
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 mb-10">
              {WF_COMPONENTS.map((c) => (
                <div key={c.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4" style={{ borderLeftWidth: 3, borderLeftColor: c.color }}>
                  <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* 크로스-트랙 예시 */}
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-[#1D9E75]" />
              크로스-트랙 워크플로우 예시
            </h3>
            <div className="space-y-4">
              {CROSS_TRACK_EXAMPLES.map((ex) => (
                <div key={ex.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: ex.color }} />
                    {ex.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {ex.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-slate-300">
                          {step}
                        </span>
                        {i < ex.steps.length - 1 && <ChevronRight size={12} className="text-slate-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ 권한 모델 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">권한 모델</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              6 Level 계층 + 4 Layer 권한 모델로 세밀한 접근 제어를 구현합니다.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 6 Level */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#378ADD]" />
                  7 Level 권한 계층
                </h3>
                <div className="space-y-2">
                  {PERMISSION_LEVELS.map((p) => (
                    <div key={p.level} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${p.color}15`, color: p.color }}>
                        L{p.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{p.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Layer */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Layers size={16} className="text-[#378ADD]" />
                  4 Layer 권한 모델
                </h3>
                <div className="space-y-4">
                  {PERMISSION_LAYERS.map((l) => {
                    const Icon = l.icon;
                    return (
                      <div key={l.layer} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#378ADD]/10 shrink-0">
                          <Icon size={16} className="text-[#378ADD]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Layer {l.layer}: {l.name}</div>
                          <div className="text-xs text-slate-500">{l.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ AI 코칭 ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#BA7517]" />
              <h2 className="text-2xl font-bold">AI 코칭</h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={16} className="text-[#BA7517]" />
                <h3 className="font-bold text-white">문서 작성 시 실시간 가이드</h3>
              </div>
              <div className="space-y-3">
                {[
                  { ai: '핵심 요약이 3줄 초과합니다.', rule: '원칙: "결론 먼저, 한 줄로"' },
                  { ai: '고객 가치가 불명확합니다.', rule: '"고객에게 어떤 변화를 만드는가?" 관점에서 보완하세요.' },
                  { ai: '비용 대비 효과 분석이 누락되었습니다.', rule: '투자 대비 기대 수익을 추가하세요.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-[#BA7517]/5 border border-[#BA7517]/10 px-4 py-3">
                    <Sparkles size={14} className="text-[#BA7517] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-sm text-white font-medium">{item.ai}</span>
                      <span className="text-xs text-slate-500 ml-2">{item.rule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ Part 13: 기술 아키텍처 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">기술 아키텍처</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              검증된 오픈소스 + 클라우드 네이티브 스택으로 구축합니다.
            </p>
            <div className="space-y-3">
              {TECH_STACK.map((layer) => (
                <div key={layer.layer} className="rounded-xl border border-white/5 bg-white/[0.02] p-5" style={{ borderLeftWidth: 3, borderLeftColor: layer.color }}>
                  <h3 className="text-sm font-bold text-white mb-3">{layer.layer}</h3>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <span key={item} className="text-xs px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Server size={16} className="text-[#9B8FE8]" />
                <span className="text-sm font-bold text-white">아키텍처 원칙</span>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {['서버리스 우선 (Serverless First)', '이벤트 드리븐 (Event Driven)', '멀티테넌트 (brand_id 기반 RLS)'].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7]" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ Part 14: 보안 설계 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#E24B4A]" />
              <h2 className="text-2xl font-bold">보안 설계</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              네트워크부터 운영까지, 4개 레이어의 다층 보안 방어 체계.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {SECURITY_LAYERS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <div key={sec.layer} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${sec.color}10` }}>
                        <Icon size={18} style={{ color: sec.color }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${sec.color}20`, color: sec.color }}>
                          Layer {sec.layer}
                        </span>
                        <h3 className="text-sm font-bold text-white">{sec.name}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {sec.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                          <Shield size={10} style={{ color: sec.color }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ Part 15: UI/UX 설계 원칙 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">UI/UX 설계 원칙</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {UX_PRINCIPLES.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.num} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1D9E75]/10">
                        <Icon size={18} className="text-[#1D9E75]" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1D9E75]/20 text-[#1D9E75]">
                        {String(p.num).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ Part 16: 개발 로드맵 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">개발 로드맵</h2>
            </div>
            <div className="space-y-4">
              {DEV_ROADMAP.map((phase) => (
                <div key={phase.phase} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Rocket size={16} style={{ color: phase.color }} />
                      <span className="text-sm font-bold text-white">{phase.phase}: {phase.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${phase.color}15`, color: phase.color }}>
                      <Calendar size={10} className="inline mr-1" />{phase.period}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-4">
                    {phase.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 size={12} style={{ color: phase.color }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ Part 17: 핵심 성공 지표 ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#BA7517]" />
              <h2 className="text-2xl font-bold">핵심 성공 지표 (KPI)</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {SUCCESS_KPIS.map((cat) => (
                <div key={cat.category} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Target size={14} className="text-[#BA7517]" />
                    {cat.category}
                  </h3>
                  <div className="space-y-3">
                    {cat.kpis.map((kpi) => (
                      <div key={kpi.name} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-medium">{kpi.name}</div>
                          <div className="text-xs text-slate-600">{kpi.desc}</div>
                        </div>
                        <span className="text-sm font-bold text-[#BA7517] shrink-0 ml-4">{kpi.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Back to WIO */}
          <div className="text-center">
            <Link href="/wio" className="inline-flex items-center gap-2 text-sm text-[#9B8FE8] hover:text-white transition-colors">
              <ArrowLeft size={14} /> WIO 홈으로
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
