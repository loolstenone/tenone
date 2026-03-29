'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, BarChart3, TrendingUp, Brain, Lightbulb,
  Database, Users, Shield, Eye, Search, AlertTriangle, Target,
  Layers, ArrowRight, ChevronRight, Cpu, LineChart
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 4-Level Analytics ── */
const ANALYTICS_LEVELS = [
  {
    level: 1,
    name: '기술 분석',
    sub: 'Descriptive',
    question: '무슨 일이 일어났는가?',
    color: '#E24B4A',
    icon: BarChart3,
    examples: ['KPI 대시보드', '매출/비용 추이', '방문자 통계', '상시 리포트'],
    tools: ['BI 대시보드', '자동 리포트', '시각화 엔진'],
  },
  {
    level: 2,
    name: '진단 분석',
    sub: 'Diagnostic',
    question: '왜 일어났는가?',
    color: '#534AB7',
    icon: Search,
    examples: ['매출 하락 원인 분석', '이탈 고객 세그먼트', '캠페인 성과 분해', '상관관계 분석'],
    tools: ['드릴다운 분석', '코호트 분석', '퍼널 분석'],
  },
  {
    level: 3,
    name: '예측 분석',
    sub: 'Predictive',
    question: '앞으로 무슨 일이 일어날 것인가?',
    color: '#1D9E75',
    icon: TrendingUp,
    examples: ['수요 예측', '이탈 확률 예측', '매출 전망', 'LTV 예측'],
    tools: ['ML 모델', '시계열 예측', '확률 모델링'],
  },
  {
    level: 4,
    name: '처방 분석',
    sub: 'Prescriptive',
    question: '무엇을 해야 하는가?',
    color: '#378ADD',
    icon: Lightbulb,
    examples: ['최적 가격 추천', '캠페인 예산 배분', '인력 배치 최적화', '재고 발주 추천'],
    tools: ['최적화 엔진', 'AI 추천', '시뮬레이션'],
  },
];

/* ── CDO Office ── */
const CDO_STRUCTURE = [
  {
    role: 'CDO (Chief Data Officer)',
    color: '#E24B4A',
    desc: '데이터 전략 총괄',
    reports: [
      { title: '데이터 거버넌스 팀', tasks: ['데이터 카탈로그', '품질 관리', '접근 정책', '컴플라이언스'] },
      { title: '데이터 엔지니어링 팀', tasks: ['파이프라인', '인프라', '데이터 레이크', 'ETL/ELT'] },
      { title: '데이터 분석 팀', tasks: ['BI 리포팅', '애드혹 분석', 'A/B 테스트', '인사이트 보고'] },
      { title: 'AI/ML 팀', tasks: ['모델 개발', '학습 파이프라인', '배포/모니터링', 'MLOps'] },
    ],
  },
];

/* ── AI/ML Capabilities ── */
const AI_CAPABILITIES = [
  {
    name: '자동 인사이트',
    icon: Lightbulb,
    color: '#E24B4A',
    desc: '데이터 변화를 자동 감지하고 자연어로 인사이트를 생성합니다.',
    examples: ['이번 주 매출이 전주 대비 15% 하락했습니다. 주요 원인은...', '고객 세그먼트 A의 재구매율이 급증했습니다.'],
  },
  {
    name: '이상 탐지',
    icon: AlertTriangle,
    color: '#BA7517',
    desc: '정상 패턴을 학습하고 이상치를 실시간으로 감지합니다.',
    examples: ['비정상적인 비용 집행 패턴 감지', '서버 응답시간 이상 징후', '매출 급락/급등 알림'],
  },
  {
    name: '예측 모델',
    icon: TrendingUp,
    color: '#1D9E75',
    desc: '과거 데이터를 기반으로 미래를 예측합니다.',
    examples: ['다음 분기 매출 전망', '고객 이탈 확률 스코어링', '수요 예측 기반 재고 최적화'],
  },
  {
    name: 'AI 추천',
    icon: Target,
    color: '#378ADD',
    desc: '데이터 기반으로 최적의 행동을 추천합니다.',
    examples: ['캠페인 예산 최적 배분', '개인화 콘텐츠 추천', '가격 최적화 시뮬레이션'],
  },
];

export default function DataPage() {
  const [activeLevel, setActiveLevel] = useState<number>(1);

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
              <Sparkles size={12} /> Data & AI
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">데이터 &middot; 분석 &middot; AI</h1>
            <p className="text-lg text-slate-400">데이터가 전략이 되는 조직</p>
          </div>

          {/* ═══════ 4-Level Analytics ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">4단계 분석 체계</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              기술 분석에서 처방 분석까지, 데이터 성숙도에 따른 4단계 분석 프레임워크.
            </p>

            {/* Level Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {ANALYTICS_LEVELS.map((lvl) => {
                const Icon = lvl.icon;
                const isActive = activeLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    onClick={() => setActiveLevel(lvl.level)}
                    className="rounded-lg p-3 text-left transition-all"
                    style={{
                      background: isActive ? `${lvl.color}15` : 'rgba(255,255,255,0.02)',
                      borderWidth: 1,
                      borderColor: isActive ? `${lvl.color}40` : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon size={16} style={{ color: lvl.color }} className="mb-2" />
                    <div className="text-xs font-bold text-white hidden sm:block">{lvl.name}</div>
                    <div className="text-[10px] text-slate-500 hidden sm:block">{lvl.sub}</div>
                    <div className="text-xs font-bold sm:hidden" style={{ color: lvl.color }}>L{lvl.level}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Level Detail */}
            {ANALYTICS_LEVELS.map((lvl) => {
              if (activeLevel !== lvl.level) return null;
              const Icon = lvl.icon;
              return (
                <div
                  key={lvl.level}
                  className="rounded-xl border p-6 md:p-8"
                  style={{ borderColor: `${lvl.color}30`, background: `${lvl.color}05` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${lvl.color}15` }}>
                      <Icon size={24} style={{ color: lvl.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Level {lvl.level}: {lvl.name}</h3>
                      <p className="text-sm font-medium" style={{ color: lvl.color }}>{lvl.question}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">활용 사례</h4>
                      <div className="space-y-2">
                        {lvl.examples.map((ex) => (
                          <div key={ex} className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lvl.color }} />
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">주요 도구</h4>
                      <div className="space-y-2">
                        {lvl.tools.map((tool) => (
                          <div key={tool} className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lvl.color }} />
                            {tool}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Level Flow */}
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              {ANALYTICS_LEVELS.map((lvl, i) => (
                <div key={lvl.level} className="flex items-center gap-2">
                  <div className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: `${lvl.color}15`, color: lvl.color }}>
                    L{lvl.level} {lvl.name}
                  </div>
                  {i < ANALYTICS_LEVELS.length - 1 && <ArrowRight size={12} className="text-slate-600" />}
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ CDO Office ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#E24B4A]" />
              <h2 className="text-2xl font-bold">데이터 전략 조직</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              데이터 중심 조직을 만들기 위한 CDO(Chief Data Officer) Office 구조.
            </p>

            {CDO_STRUCTURE.map((cdo) => (
              <div key={cdo.role} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                {/* CDO Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-lg px-4 py-2" style={{ background: `${cdo.color}15` }}>
                    <Users size={16} style={{ color: cdo.color }} />
                    <span className="text-sm font-bold text-white">{cdo.role}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{cdo.desc}</p>
                </div>

                {/* Teams */}
                <div className="grid gap-4 md:grid-cols-4">
                  {cdo.reports.map((team, i) => {
                    const colors = ['#534AB7', '#1D9E75', '#378ADD', '#BA7517'];
                    const c = colors[i % colors.length];
                    return (
                      <div key={team.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <h4 className="text-sm font-bold text-white mb-3" style={{ borderLeftWidth: 3, borderLeftColor: c, paddingLeft: 8 }}>
                          {team.title}
                        </h4>
                        <div className="space-y-1.5">
                          {team.tasks.map((task) => (
                            <div key={task} className="flex items-center gap-2 text-xs text-slate-500">
                              <div className="w-1 h-1 rounded-full" style={{ background: c }} />
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* ═══════ AI/ML Capabilities ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">AI/ML 역량</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              WIO에 내장된 AI/ML 엔진이 데이터를 자동으로 분석하고 인사이트를 생성합니다.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {AI_CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cap.color}15` }}>
                        <Icon size={20} style={{ color: cap.color }} />
                      </div>
                      <h3 className="text-base font-bold text-white">{cap.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{cap.desc}</p>
                    <div className="space-y-2">
                      {cap.examples.map((ex) => (
                        <div key={ex} className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                          <Brain size={12} style={{ color: cap.color }} className="mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-400">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Back */}
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
