'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Users, Clock, DollarSign, Building2, Briefcase, Wrench,
  Handshake, MessageSquare, Settings, Zap, Brain, Shield, LayoutGrid,
  ChevronRight, Sparkles, Target, BarChart3, BookOpen
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 3대 자원 ── */
const RESOURCES = [
  {
    key: 'human', icon: Users, label: '인간', sub: 'Human',
    color: '#7C6AE8', items: ['인사관리', '조직설계', '역량진단', '성과평가', '교육/성장', '다면평가'],
    desc: '채용부터 퇴직까지, 구성원의 전 생애주기를 하나의 시스템에서 관리합니다.',
  },
  {
    key: 'time', icon: Clock, label: '시간', sub: 'Time',
    color: '#3B9EE8', items: ['일정관리', '프로젝트', 'SLA 추적', '워크플로우', '근태관리', '타임시트'],
    desc: '모든 업무의 시간을 추적하고, 프로세스 병목을 찾아 효율을 극대화합니다.',
  },
  {
    key: 'money', icon: DollarSign, label: '돈', sub: 'Money',
    color: '#2DC98A', items: ['회계원장', '예산관리', '매출/매입', '급여정산', '비용관리', '자산관리'],
    desc: '전표 하나부터 연간 예산까지, 기업의 재무 흐름을 완전 자동화합니다.',
  },
];

/* ── 6개 트랙 ── */
const TRACKS = [
  {
    num: 1, icon: Building2, name: '운영·관리', sub: 'Operations',
    modules: 17, orgs: 'HR, Finance, Legal, Audit, 총무',
    desc: '인사·재무·회계·법무·감사 — 기업 운영의 기반',
    color: '#E24B4A',
  },
  {
    num: 2, icon: Briefcase, name: '사업', sub: 'Business',
    modules: 24, orgs: 'Marketing, Sales, CRM, BD',
    desc: '마케팅·영업·CRM·사업개발 — 매출과 성장의 엔진',
    color: '#534AB7',
  },
  {
    num: 3, icon: Wrench, name: '지원', sub: 'Support',
    modules: 15, orgs: 'R&D, Dev, Design, Production',
    desc: '연구·개발·디자인·제작·물류 — 제품과 서비스의 실행',
    color: '#1D9E75',
  },
  {
    num: 4, icon: Handshake, name: '파트너', sub: 'Partners',
    modules: 4, orgs: '협력사, 프리랜서, 벤더, 어드바이저',
    desc: '외부 파트너·공급업체·프리랜서를 하나의 체계로 관리',
    color: '#BA7517',
  },
  {
    num: 5, icon: MessageSquare, name: '공통', sub: 'Common Platform',
    modules: 17, orgs: '메일, 메신저, 결재, AI, BI',
    desc: '소통·협업·결재·AI — 모든 트랙이 공유하는 플랫폼',
    color: '#378ADD',
  },
  {
    num: 6, icon: Settings, name: '시스템 관리', sub: 'System Admin',
    modules: 13, orgs: '권한, 보안, Culture Engine',
    desc: '사용자·권한·보안·문화엔진 — 시스템의 두뇌',
    color: '#D4537E',
  },
];

/* ── 핵심 수치 ── */
const STATS = [
  { value: '100+', label: '모듈', icon: LayoutGrid },
  { value: '6', label: '트랙', icon: Target },
  { value: '3', label: '자원 관리', icon: BarChart3 },
  { value: '∞', label: '문화 내재화', icon: BookOpen },
];

/* ── 가격 ── */
const PRICING = [
  { tier: 'Free', price: '0원', per: '/월', users: '5명', features: ['기본 모듈', '3대 자원 대시보드', '커뮤니티 지원'], highlight: false },
  { tier: 'Starter', price: '4.9만원', per: '/월', users: '20명', features: ['전 트랙 기본 모듈', '워크플로우 5개', '이메일 지원'], highlight: false },
  { tier: 'Pro', price: '14.9만원', per: '/월', users: '100명', features: ['전 모듈', '무제한 워크플로우', 'Culture Engine', 'AI 어시스턴트'], highlight: true },
  { tier: 'Business', price: '39.9만원', per: '/월', users: '무제한', features: ['전 모듈 + 커스텀', '전용 서버', '전담 매니저', 'SLA 99.9%'], highlight: false },
  { tier: 'Enterprise', price: '협의', per: '', users: '무제한', features: ['온프레미스/하이브리드', '전용 개발', '24/7 지원', '보안 감사'], highlight: false },
];

export default function WIOHome() {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  return (
    <>
      <WIOMarketingHeader />

      {/* ═══════ Hero ═══════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#534AB7]/15 via-[#0F0F23]/80 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#534AB7]/5 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 px-5 py-2 text-xs text-[#9B8FE8] font-medium">
            <Sparkles size={14} /> Enterprise Unified System
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.15] mb-5">
            <span className="text-[#9B8FE8]">WIO</span> — Enterprise<br />Unified System
          </h1>
          <p className="text-xl md:text-2xl font-light text-slate-300 tracking-wide mb-4">
            인간 · 시간 · 돈
          </p>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            기업의 3대 자원을 하나의 플랫폼에서 관리합니다.<br className="hidden md:block" />
            100개 모듈, 6개 트랙, 기업 문화까지 내재화.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/wio/app" className="flex items-center gap-2 rounded-lg bg-[#534AB7] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#6358C7] transition-colors shadow-lg shadow-[#534AB7]/25">
              무료 시작 <ArrowRight size={16} />
            </Link>
            <Link href="/wio/solutions" className="flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
              데모 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ 3대 자원 ═══════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Core Resources</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">3대 자원 관리 체계</h2>
            <p className="text-slate-400">모든 모듈이 공유하는 코어 데이터 레이어</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {RESOURCES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.key} className="rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-[#534AB7]/30 transition-all group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${r.color}15` }}>
                      <Icon size={24} style={{ color: r.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{r.label}</h3>
                      <p className="text-xs text-slate-500">{r.sub}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{r.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {r.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1 h-1 rounded-full" style={{ background: r.color }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ 6개 트랙 ═══════ */}
      <section className="py-24 px-6 bg-white/[0.015]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">6 Tracks</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">조직 중심 트랙 구조</h2>
            <p className="text-slate-400">기업의 모든 부서가 자기 트랙에서 최적화된 모듈을 사용합니다</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((t) => {
              const Icon = t.icon;
              const isHovered = hoveredTrack === t.num;
              return (
                <div
                  key={t.num}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all cursor-default hover:scale-[1.02]"
                  style={{ borderColor: isHovered ? `${t.color}40` : undefined }}
                  onMouseEnter={() => setHoveredTrack(t.num)}
                  onMouseLeave={() => setHoveredTrack(null)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold" style={{ background: `${t.color}15`, color: t.color }}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${t.color}20`, color: t.color }}>T{t.num}</span>
                        <h3 className="font-bold text-white truncate">{t.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-600">{t.sub}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{t.desc}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{t.orgs}</span>
                    <span className="font-bold" style={{ color: t.color }}>{t.modules}개 모듈</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href="/wio/solutions" className="inline-flex items-center gap-2 text-sm text-[#9B8FE8] hover:text-white transition-colors">
              전체 모듈 카탈로그 보기 <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ 핵심 수치 ═══════ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <Icon size={20} className="mx-auto mb-3 text-[#534AB7]" />
                  <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ WIO 원칙 ═══════ */}
      <section className="py-24 px-6 bg-white/[0.015]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">WIO 원칙</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-8">
              <Brain size={28} className="text-[#9B8FE8] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">&ldquo;입력을 없앤다&rdquo;</h3>
              <p className="text-slate-400 leading-relaxed">
                매체 API 자동 수집, 근태 자동 기록, 전표 자동 생성, AI 문서 초안.
                시스템이 데이터를 모으고, AI가 80%를 채웁니다.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
              <Zap size={28} className="text-[#2DC98A] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">&ldquo;사람은 20%의 판단만&rdquo;</h3>
              <p className="text-slate-400 leading-relaxed">
                전략 방향 결정, 최종 승인, 크리에이티브 메시지, 핵심 가치 판단.
                사람은 정말 중요한 의사결정에만 집중합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Culture Engine 미리보기 ═══════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Culture Engine</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">기업 문화를 시스템에 녹이다</h2>
            <p className="text-slate-400">포스터가 아니라, 일하는 구조 안에 철학을 내재화합니다</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: '01', title: '철학 정의', desc: 'Mission, Vision, Core Values를 시스템에 등록', color: '#E24B4A' },
              { step: '02', title: '양식에 녹이기', desc: '기안서·보고서·피드백 양식에 가치 체크포인트 내장', color: '#534AB7' },
              { step: '03', title: '프로세스 강제', desc: '결재 흐름에 가치 정합성 AI 자동 스코어링', color: '#1D9E75' },
              { step: '04', title: '평가에 반영', desc: '성과(What) + 가치(How) 동등 평가, 상시 피드백', color: '#378ADD' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="text-3xl font-extralight mb-2" style={{ color: `${s.color}30` }}>{s.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/wio/framework" className="inline-flex items-center gap-2 text-sm text-[#9B8FE8] hover:text-white transition-colors">
              Framework 상세 보기 <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ Pricing ═══════ */}
      <section className="py-24 px-6 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">합리적인 가격</h2>
            <p className="text-slate-400">규모에 맞는 플랜을 선택하세요</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {PRICING.map((p) => (
              <div
                key={p.tier}
                className={`rounded-2xl border p-6 transition-all ${
                  p.highlight
                    ? 'border-[#534AB7]/50 bg-[#534AB7]/10 scale-[1.02]'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                {p.highlight && (
                  <div className="text-[10px] font-bold text-[#9B8FE8] uppercase tracking-wider mb-2">추천</div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{p.tier}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-slate-600">{p.per}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{p.users}</p>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-[#534AB7] mt-1.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#534AB7]/10 to-transparent">
        <div className="mx-auto max-w-lg text-center">
          <Shield size={32} className="mx-auto mb-4 text-[#9B8FE8]" />
          <h2 className="text-2xl font-bold mb-3">지금 시작하세요</h2>
          <p className="text-sm text-slate-400 mb-6">기업의 3대 자원을 하나로 통합하는 여정, WIO와 함께.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/wio/app" className="inline-flex items-center gap-2 rounded-lg bg-[#534AB7] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#6358C7] transition-colors shadow-lg shadow-[#534AB7]/25">
              무료 시작 <ArrowRight size={16} />
            </Link>
            <Link href="/wio/contact" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
              상담 신청
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <div className="text-sm font-bold"><span className="text-[#9B8FE8]">W</span>IO <span className="text-slate-600">Enterprise Unified System</span></div>
            <div className="text-xs text-slate-600 mt-1">Powered by <a href="https://tenone.biz" className="hover:text-slate-400">Ten:One&trade;</a></div>
          </div>
          <div className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Ten:One&trade; Universe</div>
        </div>
      </footer>
    </>
  );
}
