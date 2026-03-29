'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Palette, Factory, Monitor, ShoppingCart,
  Check, ArrowRight, Layers, Workflow, Star, Plug
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 프리셋 데이터 ── */
type Preset = {
  key: string;
  name: string;
  nameEn: string;
  icon: typeof Factory;
  color: string;
  desc: string;
  tracks: { name: string; detail: string; color: string }[];
  keyModules: string[];
  workflows: string[];
  specials: string[];
};

const PRESETS: Preset[] = [
  {
    key: 'agency',
    name: '에이전시',
    nameEn: 'Agency',
    icon: Palette,
    color: '#534AB7',
    desc: '마케팅/광고/디자인 에이전시를 위한 프리셋. 프로젝트 기반 업무, 클라이언트 관리, 시수 정산에 최적화.',
    tracks: [
      { name: 'T1 운영관리', detail: '조직/근태/급여 기본', color: '#E24B4A' },
      { name: 'T2 영업마케팅', detail: '마케팅 풀 세트', color: '#534AB7' },
      { name: 'T5 재무회계', detail: '프로젝트 수익성 관리', color: '#BA7517' },
    ],
    keyModules: ['프로젝트 관리', '시수(Timesheet)', '캠페인 관리', '콘텐츠 제작', '클라이언트 CRM', '견적/계약'],
    workflows: ['리드 → 제안 → 수주 → 프로젝트 → 시수 → 정산', '콘텐츠 기획 → 제작 → 리뷰 → 발행 → 성과'],
    specials: ['시수 기반 프로젝트 수익성 자동 산출', 'AI 콘텐츠 생성 (카피/디자인 초안)', '클라이언트별 대시보드'],
  },
  {
    key: 'manufacturing',
    name: '제조업',
    nameEn: 'Manufacturing',
    icon: Factory,
    color: '#1D9E75',
    desc: '생산 계획부터 출하까지 제조 전 공정 관리. MES/QC/WMS 풀 세트로 스마트 팩토리 구현.',
    tracks: [
      { name: 'T1 운영관리', detail: 'HR/조직 풀 세트', color: '#E24B4A' },
      { name: 'T2 영업마케팅', detail: '영업/견적/수주', color: '#534AB7' },
      { name: 'T3 생산물류', detail: '생산 풀 세트', color: '#1D9E75' },
      { name: 'T4 R&D', detail: 'PLM/기술관리', color: '#378ADD' },
      { name: 'T5 재무회계', detail: '원가/정산/결산', color: '#BA7517' },
    ],
    keyModules: ['생산계획(MRP)', 'MES', '품질관리(QC)', '창고관리(WMS)', '배송관리(TMS)', 'BOM/PLM'],
    workflows: ['수주 → 생산계획 → 자재 투입 → 생산 → 품질검사 → 출하', '자재 발주 → 입고 → 재고 → 생산 투입'],
    specials: ['IoT 센서 연동 실시간 생산 모니터링', 'AI 불량 예측 및 품질 이상 탐지', '자재 소요량 자동 산출(MRP)'],
  },
  {
    key: 'it',
    name: 'IT기업',
    nameEn: 'IT Company',
    icon: Monitor,
    color: '#378ADD',
    desc: '소프트웨어 개발사/IT 서비스 기업에 최적화. Jira/GitHub 연동, 스프린트 관리, 개발자 시수 추적.',
    tracks: [
      { name: 'T1 운영관리', detail: 'HR/조직 기본', color: '#E24B4A' },
      { name: 'T2 영업마케팅', detail: 'CRM/영업 기본', color: '#534AB7' },
      { name: 'T4 R&D', detail: '개발 풀 세트', color: '#378ADD' },
    ],
    keyModules: ['프로젝트(스프린트)', '이슈 트래커', 'CI/CD 대시보드', '코드 리뷰', '시수 관리', '기술 문서(Wiki)'],
    workflows: ['백로그 → 스프린트 → 개발 → 코드리뷰 → QA → 배포', '버그 리포트 → 이슈 생성 → 할당 → 수정 → 검증'],
    specials: ['Jira / GitHub / GitLab 양방향 연동', 'AI 코드 리뷰 요약 및 이슈 자동 분류', '개발자 워크로드 히트맵'],
  },
  {
    key: 'retail',
    name: '유통',
    nameEn: 'Retail / Distribution',
    icon: ShoppingCart,
    color: '#BA7517',
    desc: '도소매/유통업을 위한 프리셋. 영업/CRM/물류 중심에 멤버십 관리까지.',
    tracks: [
      { name: 'T1 운영관리', detail: 'HR/조직 기본', color: '#E24B4A' },
      { name: 'T2 영업마케팅', detail: '영업 + CRM 풀 세트', color: '#534AB7' },
      { name: 'T3 생산물류', detail: '물류 중심', color: '#1D9E75' },
    ],
    keyModules: ['영업 파이프라인', '고객 CRM', '멤버십/로열티', '주문관리', '창고관리(WMS)', '배송관리(TMS)'],
    workflows: ['고객 유입 → 주문 → 재고 확인 → 출고 → 배송 → 정산', '멤버십 가입 → 구매 이력 → 등급 산정 → 타겟 캠페인'],
    specials: ['고객 세그먼트 AI 자동 분류', '멤버십 등급/혜택 자동 관리', '재고 최적화 및 수요 예측 AI'],
  },
];

export default function PresetsPage() {
  const [activePreset, setActivePreset] = useState<string | null>(null);

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
              <Sparkles size={12} /> Industry Presets
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">업종별 프리셋</h1>
            <p className="text-lg text-slate-400">업종에 맞는 트랙과 모듈이 사전 구성되어 있습니다. 선택하면 바로 시작.</p>
          </div>

          {/* Preset Cards */}
          <div className="space-y-6">
            {PRESETS.map(preset => {
              const Icon = preset.icon;
              const isExpanded = activePreset === preset.key;
              return (
                <div
                  key={preset.key}
                  className="rounded-2xl border transition-all"
                  style={{
                    borderColor: isExpanded ? `${preset.color}40` : 'rgba(255,255,255,0.05)',
                    background: isExpanded ? `${preset.color}05` : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setActivePreset(isExpanded ? null : preset.key)}
                    className="w-full text-left p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${preset.color}15` }}>
                          <Icon size={24} style={{ color: preset.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{preset.name}</h3>
                            <span className="text-sm text-slate-500">{preset.nameEn}</span>
                          </div>
                          <p className="text-sm text-slate-400 max-w-xl">{preset.desc}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {preset.tracks.map(t => (
                              <span key={t.name} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${t.color}15`, color: t.color }}>
                                {t.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-slate-500 transition-transform shrink-0 mt-1"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-white/5">
                      <div className="grid md:grid-cols-2 gap-6 pt-6">
                        {/* Active Tracks */}
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            <Layers size={14} style={{ color: preset.color }} /> 활성 트랙
                          </h4>
                          <div className="space-y-2">
                            {preset.tracks.map(t => (
                              <div key={t.name} className="rounded-lg bg-white/[0.03] px-4 py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
                                  <span className="text-sm text-white font-medium">{t.name}</span>
                                </div>
                                <span className="text-xs text-slate-500">{t.detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Modules */}
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            <Star size={14} style={{ color: preset.color }} /> 핵심 모듈
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {preset.keyModules.map(m => (
                              <div key={m} className="flex items-center gap-2 text-sm text-slate-400">
                                <Check size={12} style={{ color: preset.color }} className="shrink-0" />
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Workflows */}
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            <Workflow size={14} style={{ color: preset.color }} /> 주요 워크플로우
                          </h4>
                          <div className="space-y-2">
                            {preset.workflows.map((w, i) => (
                              <div key={i} className="rounded-lg bg-white/[0.03] px-4 py-3 text-xs text-slate-400 leading-relaxed font-mono">
                                {w}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special Features */}
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            <Plug size={14} style={{ color: preset.color }} /> 특화 기능
                          </h4>
                          <div className="space-y-2">
                            {preset.specials.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                <Sparkles size={12} style={{ color: preset.color }} className="shrink-0 mt-0.5" />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-8 text-center">
                        <Link
                          href="/wio/contact"
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                          style={{ background: preset.color }}
                        >
                          이 프리셋으로 시작 <ArrowRight size={16} />
                        </Link>
                        <p className="text-xs text-slate-600 mt-2">30일 무료 체험 포함</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Note */}
          <section className="mt-16">
            <div className="rounded-2xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-8 text-center">
              <h3 className="text-lg font-bold text-white mb-2">프리셋은 시작점일 뿐</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                프리셋으로 빠르게 시작하고, 필요에 따라 트랙과 모듈을 자유롭게 추가/제거하세요.
                WIO는 레고처럼 조립할 수 있습니다.
              </p>
              <div className="mt-4">
                <Link href="/wio/solutions" className="inline-flex items-center gap-1 text-sm text-[#9B8FE8] hover:text-white transition-colors">
                  전체 모듈 카탈로그 보기 <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Back */}
          <div className="text-center mt-12">
            <Link href="/wio" className="inline-flex items-center gap-2 text-sm text-[#9B8FE8] hover:text-white transition-colors">
              <ArrowLeft size={14} /> WIO 홈으로
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
