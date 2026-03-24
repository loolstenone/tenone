'use client';

import Link from 'next/link';
import {
  Globe, Palette, Megaphone, LineChart, CalendarDays, Users,
  GitBranch, Activity, FileBarChart, BookOpen, Route,
  ChevronRight, BarChart3, Sparkles, Shield
} from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import SmarCommFooter from '@/components/SmarCommFooter';

const FEATURES = [
  {
    section: '진단 · 분석',
    items: [
      { icon: Globe, title: '사이트 GEO/SEO 진단', desc: 'URL 하나로 AI 검색 노출 + 검색 최적화 상태를 실시간 분석' },
      { icon: GitBranch, title: '퍼널 분석', desc: '방문→진단→가입→유료 전환까지 어디서 고객을 잃는지 파악' },
      { icon: Route, title: '사용자 여정', desc: '고객이 SmarComm과 함께한 여정을 타임라인으로 추적' },
      { icon: Activity, title: 'A/B 테스트', desc: '소재, CTA, 이메일 — 데이터로 더 나은 선택' },
    ],
  },
  {
    section: '제작 · 실행',
    items: [
      { icon: Palette, title: '소재 제작', desc: 'AI가 브랜드 가이드 기반으로 카피, 배너, 영상 소재 자동 생성' },
      { icon: Megaphone, title: '광고 집행', desc: '네이버, 카카오, 메타, 구글 — 원클릭 다채널 집행' },
      { icon: CalendarDays, title: '마케팅 캘린더', desc: '시즌 이벤트, 캠페인 일정을 한눈에 관리' },
    ],
  },
  {
    section: '관리 · 성장',
    items: [
      { icon: LineChart, title: '매출 분석', desc: '광고비 vs 매출, ROAS, CPA를 직관적으로 파악' },
      { icon: Users, title: 'CRM', desc: '리드→미팅→진행→계약, 고객 관계를 체계적으로 관리' },
      { icon: FileBarChart, title: '캠페인 보고서', desc: '채널별 성과를 통합 리포트로 한번에' },
      { icon: BookOpen, title: '용어 사전', desc: '마케팅 용어 50개 + 기업 커스텀 용어 추가' },
    ],
  },
];

export default function WorkspacePage() {
  return (
    <>
      <SmarCommHeader />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-[#0A0E1A] px-5 pb-16 pt-28 md:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/60">
              <Sparkles size={14} />
              SmarComm. Workspace
            </div>
            <h1 className="mb-4 text-xl md:text-3xl lg:text-5xl font-bold text-white">
              마케팅의 모든 것,<br />하나의 워크스페이스에서
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed text-white/50">
              진단 · 기획 · 소재 제작 · 광고 집행 · 분석까지<br />
              팀과 함께 사용하는 AI 마케팅 커뮤니케이션 워크스페이스
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sc/signup" className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#0A0E1A] transition-all hover:bg-white/90">
                무료로 시작하기
              </Link>
              <Link href="/sc" className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10">
                무료 진단 먼저 해보기
              </Link>
            </div>
          </div>
        </section>

        {/* 핵심 가치 */}
        <section className="border-b border-border px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: BarChart3, title: '데이터 중심', desc: '감이 아닌 데이터로 마케팅 의사결정을 내립니다' },
                { icon: Sparkles, title: 'AI 자동화', desc: '소재 생성, 최적화, 리포트까지 AI가 자동 처리합니다' },
                { icon: Shield, title: '한국 시장 특화', desc: '네이버, 카카오, 당근 등 국내 채널을 완벽 지원합니다' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                    <item.icon size={22} className="text-text" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold text-text">{item.title}</h3>
                  <p className="text-xs text-text-sub">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-text">워크스페이스에서 할 수 있는 것들</h2>

            {FEATURES.map((section) => (
              <div key={section.section} className="mb-10">
                <h3 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">{section.section}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5 transition-colors hover:bg-surface">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
                        <item.icon size={18} className="text-text" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text">{item.title}</h4>
                        <p className="mt-0.5 text-xs text-text-sub">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-surface px-5 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold text-text">지금 바로 시작하세요</h2>
            <p className="mb-6 text-sm text-text-sub">무료 가입으로 워크스페이스의 모든 기능을 체험할 수 있습니다</p>
            <Link href="/sc/signup" className="inline-flex items-center gap-2 rounded-full bg-text px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-sub">
              무료 가입하기 <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <SmarCommFooter />
    </>
  );
}
