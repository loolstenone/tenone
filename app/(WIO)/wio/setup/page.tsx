'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Sparkles, CheckCircle2, ChevronDown,
  LayoutGrid, Users, Shield, Settings, Workflow, Rocket
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

const STEPS = [
  {
    num: 1,
    icon: LayoutGrid,
    title: '트랙 설정',
    sub: 'Track Configuration',
    color: '#E24B4A',
    summary: '조직에 필요한 트랙을 선택하고 구성합니다.',
    details: [
      '6개 트랙 중 사용할 트랙 선택 (운영, 사업, 지원, 파트너, 공통, 시스템)',
      '트랙별 활성화할 모듈 선택 (100개 중 필요한 것만)',
      '트랙 간 연동 규칙 설정',
      '커스텀 트랙명/아이콘 지정 가능',
    ],
    estimate: '약 30분',
  },
  {
    num: 2,
    icon: Users,
    title: '인력 배치',
    sub: 'People Assignment',
    color: '#534AB7',
    summary: '조직도를 구성하고 구성원을 배치합니다.',
    details: [
      '조직 구조 설계: 트랙 → 부서 → 팀 → 파트',
      '구성원 일괄 등록 (CSV/엑셀 업로드 지원)',
      '직급/직책 체계 설정',
      '다중 소속 설정 (겸직, TF, 위원회)',
      'AI 자동 추천: 조직 규모 기반 최적 구조 제안',
    ],
    estimate: '약 1시간',
  },
  {
    num: 3,
    icon: Shield,
    title: '권한 설정',
    sub: 'Permission Setup',
    color: '#1D9E75',
    summary: '7 Level + 4 Layer 권한 모델을 적용합니다.',
    details: [
      '역할 템플릿 선택 (표준/금융/제조/서비스 등)',
      '7단계 권한 레벨 배정 (Super Admin ~ External)',
      '모듈별 CRUD 권한 매트릭스 설정',
      '데이터 접근 범위 설정 (자기/팀/부서/전사)',
      'IP 제한, 2FA 정책 설정',
    ],
    estimate: '약 45분',
  },
  {
    num: 4,
    icon: Settings,
    title: '모듈 세팅',
    sub: 'Module Configuration',
    color: '#378ADD',
    summary: '각 모듈의 세부 설정을 구성합니다.',
    details: [
      '3대 자원(인간/시간/돈) 기본 데이터 입력',
      '회계 계정과목 체계 설정',
      'Culture Engine: 미션/비전/핵심가치 등록',
      '양식 템플릿 선택 및 커스터마이징',
      '외부 연동 설정 (메일, 캘린더, 메신저)',
    ],
    estimate: '약 2시간',
  },
  {
    num: 5,
    icon: Workflow,
    title: '워크플로우 설계',
    sub: 'Workflow Design',
    color: '#BA7517',
    summary: '부서를 넘나드는 업무 프로세스를 설계합니다.',
    details: [
      '표준 워크플로우 템플릿 적용 (전자결재, 구매요청, 인사 등)',
      '크로스-트랙 워크플로우 설계 (비주얼 빌더)',
      '트리거/조건 분기/병렬 처리/타임아웃 설정',
      '에스컬레이션 규칙 설정',
      '테스트 실행 및 검증',
    ],
    estimate: '약 1시간',
  },
];

export default function SetupPage() {
  const [expandedStep, setExpandedStep] = useState<number>(1);

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
              <Sparkles size={12} /> 5-Step Setup
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">시스템 세팅 플로우</h1>
            <p className="text-slate-400">5단계로 완성하는 엔터프라이즈 시스템 구축</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = expandedStep === step.num;
                const isComplete = expandedStep > step.num;
                return (
                  <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                    <button
                      onClick={() => setExpandedStep(step.num)}
                      className="flex flex-col items-center gap-2 relative group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: isActive ? `${step.color}20` : isComplete ? `${step.color}10` : 'rgba(255,255,255,0.03)',
                          borderWidth: 2,
                          borderColor: isActive ? step.color : isComplete ? `${step.color}40` : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle2 size={20} style={{ color: step.color }} />
                        ) : (
                          <Icon size={20} style={{ color: isActive ? step.color : '#64748b' }} />
                        )}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {step.title}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 h-0.5 rounded-full" style={{
                        background: expandedStep > step.num ? step.color : 'rgba(255,255,255,0.05)',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Cards */}
          <div className="space-y-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isOpen = expandedStep === step.num;
              return (
                <div
                  key={step.num}
                  className="rounded-xl border overflow-hidden transition-all"
                  style={{
                    borderColor: isOpen ? `${step.color}40` : 'rgba(255,255,255,0.05)',
                    background: isOpen ? `${step.color}05` : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <button
                    onClick={() => setExpandedStep(isOpen ? 0 : step.num)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                      style={{ background: `${step.color}15` }}
                    >
                      <Icon size={22} style={{ color: step.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${step.color}20`, color: step.color }}
                        >
                          STEP {step.num}
                        </span>
                        <h3 className="font-bold text-white">{step.title}</h3>
                        <span className="text-xs text-slate-600 hidden sm:inline">{step.sub}</span>
                      </div>
                      <p className="text-sm text-slate-400">{step.summary}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-600 hidden sm:block">{step.estimate}</span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 border-t" style={{ borderColor: `${step.color}15` }}>
                      <div className="grid gap-3 mt-5 md:grid-cols-2">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                              style={{ background: `${step.color}15`, color: step.color }}
                            >
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{detail}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-slate-600">예상 소요시간: {step.estimate}</span>
                        {step.num < 5 && (
                          <button
                            onClick={() => setExpandedStep(step.num + 1)}
                            className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                            style={{ color: step.color }}
                          >
                            다음 단계 <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Estimate */}
          <div className="mt-10 rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Rocket size={16} className="text-[#534AB7]" />
                전체 세팅 예상 소요
              </h3>
              <span className="text-lg font-bold text-[#9B8FE8]">약 5시간</span>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              {STEPS.map((step) => (
                <div key={step.num} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                  <span className="text-slate-400">{step.title}</span>
                  <span className="text-slate-600">{step.estimate}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3">* AI 자동 추천을 활용하면 50% 이상 단축 가능</p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/wio/app"
              className="inline-flex items-center gap-2 rounded-lg bg-[#534AB7] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#6358C7] transition-colors shadow-lg shadow-[#534AB7]/25"
            >
              무료 체험하기 <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-slate-600 mt-3">신용카드 없이 시작 · 5명까지 무료</p>
          </div>
        </div>
      </div>
    </>
  );
}
