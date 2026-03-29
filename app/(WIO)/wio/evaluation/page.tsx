'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Target, Users, BarChart3, MessageCircle,
  Award, TrendingUp, ChevronRight, Star, Trophy, Gift, Heart,
  Zap, Bell, ArrowUpRight
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── Evaluation Cycle ── */
const EVAL_CYCLE = [
  { step: '상시 피드백', desc: '동료 간 실시간 피드백 교환', color: '#534AB7', icon: MessageCircle },
  { step: '분기 체크인', desc: '목표 진척 + 역량 대화', color: '#378ADD', icon: Target },
  { step: '연간 종합', desc: '성과(What) + 가치(How) 종합 평가', color: '#1D9E75', icon: BarChart3 },
  { step: '보상 결정', desc: '연봉/인센티브/승진 반영', color: '#BA7517', icon: Award },
  { step: '성장 계획', desc: '개인 역량 개발 계획 수립', color: '#D4537E', icon: TrendingUp },
];

/* ── Goal Cascading ── */
const GOAL_CASCADE = [
  { level: '기업 미션', width: '20%', color: '#E24B4A', desc: '존재 이유와 궁극적 방향' },
  { level: '전사 목표', width: '30%', color: '#534AB7', desc: '연간 전략 목표 (3~5개)' },
  { level: '트랙 목표', width: '45%', color: '#1D9E75', desc: '트랙별 핵심 성과 지표' },
  { level: '부서 목표', width: '60%', color: '#378ADD', desc: '부서 KPI + 프로젝트 목표' },
  { level: '팀 목표', width: '75%', color: '#BA7517', desc: '팀 단위 실행 과제' },
  { level: '개인 목표', width: '90%', color: '#D4537E', desc: '개인 KPI + 역량 목표' },
];

/* ── 360도 다면평가 ── */
const MULTI_EVAL = [
  { type: '자기 평가', weight: 10, color: '#534AB7', desc: '자기 성찰 + 성과 근거 제시' },
  { type: '상향 평가', weight: 25, color: '#E24B4A', desc: '직속 상사의 성과/역량 평가' },
  { type: '동료 평가', weight: 30, color: '#1D9E75', desc: '협업 빈도 기반 AI 추천 평가자' },
  { type: '하향 평가', weight: 25, color: '#378ADD', desc: '리더십/코칭 역량 평가' },
  { type: '외부 평가', weight: 10, color: '#BA7517', desc: '고객/파트너 만족도 반영' },
];

/* ── 피드백 넛지 ── */
const NUDGES = [
  { trigger: '프로젝트 완료 시', message: '프로젝트가 마감되었습니다. 함께한 팀원에게 피드백을 남겨주세요.', icon: Target },
  { trigger: '월말 미발송 시', message: '이번 달 아직 피드백을 보내지 않았습니다. 동료에게 한마디 남겨보세요.', icon: Bell },
  { trigger: '평가 2주 전', message: '분기 평가가 2주 남았습니다. 상시 피드백을 미리 정리해보세요.', icon: Star },
  { trigger: '신규 입사 30일 후', message: '새로 합류한 동료의 첫 달이 지났습니다. 환영 피드백을 보내주세요.', icon: Heart },
];

/* ── 보상 등급 ── */
const REWARD_GRADES = [
  { grade: 'S', label: '탁월', ratio: '~5%', multiplier: '200%', color: '#E24B4A' },
  { grade: 'A', label: '우수', ratio: '~15%', multiplier: '150%', color: '#534AB7' },
  { grade: 'B+', label: '기대 이상', ratio: '~25%', multiplier: '120%', color: '#1D9E75' },
  { grade: 'B', label: '기대 충족', ratio: '~40%', multiplier: '100%', color: '#378ADD' },
  { grade: 'C', label: '개선 필요', ratio: '~15%', multiplier: '50%', color: '#BA7517' },
];

/* ── Recognition Programs ── */
const RECOGNITION = [
  { name: 'Spot Award', desc: '즉시 인정 + 포인트 지급', icon: Zap, color: '#E24B4A' },
  { name: 'Value Champion', desc: '분기별 핵심가치 실천 MVP', icon: Trophy, color: '#534AB7' },
  { name: 'Peer Thanks', desc: '동료 감사 카드 + 포인트', icon: Heart, color: '#D4537E' },
  { name: 'Innovation Award', desc: '혁신 아이디어/프로젝트 시상', icon: Star, color: '#1D9E75' },
  { name: 'Milestone Gift', desc: '근속 / 자격증 / 목표 달성 축하', icon: Gift, color: '#BA7517' },
];

/* ── 승진 기준 ── */
const PROMOTION_CRITERIA = [
  { criteria: '성과 등급', desc: '최근 2년 평균 B+ 이상' },
  { criteria: '가치 실천', desc: '360도 가치 평가 평균 3.5/5.0 이상' },
  { criteria: '리더십', desc: '하향 평가 리더십 점수 4.0/5.0 이상 (관리직)' },
  { criteria: '역량 인증', desc: '직급별 필수 역량 포트폴리오 충족' },
  { criteria: '조직 기여', desc: '멘토링, 교육, 사내 프로젝트 참여 실적' },
];

export default function EvaluationPage() {
  const [activeEvalType, setActiveEvalType] = useState<string | null>(null);

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
              <Sparkles size={12} /> Evaluation & Reward
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">평가 &middot; 보상 체계</h1>
            <p className="text-lg text-slate-400">성과(What) + 가치(How) 동등 평가</p>
          </div>

          {/* ═══════ Hero Statement ═══════ */}
          <section className="mb-20">
            <div className="rounded-2xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">What + How</h2>
                  <p className="text-slate-400 leading-relaxed">
                    무엇을 달성했는가(성과)와 어떻게 달성했는가(가치)를
                    동등한 비중으로 평가합니다.
                    결과만 좋으면 되는 것이 아니라,
                    조직의 핵심가치에 부합하는 방식으로 성과를 낸 사람을
                    인정하고 보상합니다.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="rounded-xl bg-[#534AB7]/10 border border-[#534AB7]/30 p-5 text-center">
                      <div className="text-3xl font-black text-[#9B8FE8] mb-1">50%</div>
                      <div className="text-sm text-white font-medium">성과 (What)</div>
                      <div className="text-xs text-slate-500 mt-1">KPI 달성률</div>
                    </div>
                    <div className="rounded-xl bg-[#D4537E]/10 border border-[#D4537E]/30 p-5 text-center">
                      <div className="text-3xl font-black text-[#D4537E] mb-1">50%</div>
                      <div className="text-sm text-white font-medium">가치 (How)</div>
                      <div className="text-xs text-slate-500 mt-1">핵심가치 실천</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ Evaluation Cycle ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">평가 사이클</h2>
            </div>
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {EVAL_CYCLE.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="flex items-center flex-1">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                          <Icon size={16} style={{ color: item.color }} />
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${item.color}20`, color: item.color }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{item.step}</h3>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    {i < EVAL_CYCLE.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600 mx-1 shrink-0 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ Goal Cascading ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#E24B4A]" />
              <h2 className="text-2xl font-bold">Goal Cascading</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              기업 미션에서 개인 목표까지, 위에서 아래로 자연스럽게 흘러내리는 목표 체계.
              모든 개인의 목표가 조직의 방향과 정렬됩니다.
            </p>
            <div className="flex flex-col items-center space-y-2">
              {GOAL_CASCADE.map((item) => (
                <div
                  key={item.level}
                  className="rounded-lg border border-white/5 bg-white/[0.02] px-6 py-3 text-center transition-all hover:scale-[1.02]"
                  style={{ width: item.width, minWidth: '200px', borderLeftWidth: 3, borderLeftColor: item.color }}
                >
                  <div className="text-sm font-bold text-white">{item.level}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <ArrowUpRight size={12} /> 정렬(Alignment): 아래에서 위로 기여
              </div>
            </div>
          </section>

          {/* ═══════ 360도 다면평가 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">360도 다면평가</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              단일 상사 평가가 아닌, 다양한 시각에서의 종합적 평가.
              AI가 협업 빈도를 분석하여 최적의 평가자를 추천합니다.
            </p>

            <div className="grid gap-4 md:grid-cols-5">
              {MULTI_EVAL.map((item) => {
                const isActive = activeEvalType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setActiveEvalType(isActive ? null : item.type)}
                    className="rounded-xl border bg-white/[0.02] p-5 text-left transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: isActive ? `${item.color}50` : 'rgba(255,255,255,0.05)',
                      background: isActive ? `${item.color}08` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Users size={16} style={{ color: item.color }} />
                      <span className="text-xl font-black" style={{ color: item.color }}>{item.weight}%</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.type}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Weight Bar */}
            <div className="mt-6 rounded-lg overflow-hidden flex h-3">
              {MULTI_EVAL.map((item) => (
                <div
                  key={item.type}
                  className="transition-all"
                  style={{
                    width: `${item.weight}%`,
                    background: item.color,
                    opacity: activeEvalType && activeEvalType !== item.type ? 0.2 : 1,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {MULTI_EVAL.map((item) => (
                <span key={item.type} className="text-[10px] text-slate-600" style={{ width: `${item.weight}%`, textAlign: 'center' }}>
                  {item.type}
                </span>
              ))}
            </div>
          </section>

          {/* ═══════ 피드백 넛지 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">피드백 넛지 시스템</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              피드백을 잊지 않도록 시스템이 자연스럽게 안내합니다.
              강제가 아닌, 적절한 타이밍의 부드러운 알림.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {NUDGES.map((nudge) => {
                const Icon = nudge.icon;
                return (
                  <div key={nudge.trigger} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#378ADD]/10">
                        <Icon size={14} className="text-[#378ADD]" />
                      </div>
                      <span className="text-xs font-medium text-[#378ADD]">{nudge.trigger}</span>
                    </div>
                    <div className="rounded-lg bg-[#378ADD]/5 border border-[#378ADD]/10 px-4 py-3">
                      <p className="text-sm text-slate-300">{nudge.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ 보상 체계 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#BA7517]" />
              <h2 className="text-2xl font-bold">보상 체계</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              고정 보상(기본급) + 변동 보상(성과급) + 비금전 보상(인정/성장)의 3축 구조.
            </p>

            {/* 등급별 보상 배수 */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#BA7517]" />
                  등급별 성과급 배수
                </h3>
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-600 border-b border-white/5">
                      <th className="text-left px-6 py-2.5 font-medium">등급</th>
                      <th className="text-left py-2.5 font-medium">명칭</th>
                      <th className="text-left py-2.5 font-medium">비율</th>
                      <th className="text-left py-2.5 font-medium">성과급 배수</th>
                      <th className="text-left py-2.5 font-medium">시각화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REWARD_GRADES.map((g) => (
                      <tr key={g.grade} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-3">
                          <span className="text-lg font-black" style={{ color: g.color }}>{g.grade}</span>
                        </td>
                        <td className="py-3 text-white font-medium">{g.label}</td>
                        <td className="py-3 text-slate-400">{g.ratio}</td>
                        <td className="py-3 font-bold" style={{ color: g.color }}>{g.multiplier}</td>
                        <td className="py-3 pr-6">
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden" style={{ width: '100%' }}>
                            <div className="h-full rounded-full" style={{ width: g.multiplier, background: g.color }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {REWARD_GRADES.map((g) => (
                  <div key={g.grade} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black" style={{ color: g.color }}>{g.grade}</span>
                        <span className="text-sm text-white font-medium">{g.label}</span>
                      </div>
                      <span className="font-bold" style={{ color: g.color }}>{g.multiplier}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: g.multiplier, background: g.color }} />
                    </div>
                    <div className="text-xs text-slate-600 mt-1">구성비: {g.ratio}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognition Programs */}
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-[#BA7517]" />
              인정 프로그램 (비금전 보상)
            </h3>
            <div className="grid gap-3 md:grid-cols-5">
              {RECOGNITION.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                    <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${r.color}15` }}>
                      <Icon size={18} style={{ color: r.color }} />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{r.name}</h4>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ 승진 기준 ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#D4537E]" />
              <h2 className="text-2xl font-bold">승진 기준</h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <p className="text-sm text-slate-400 mb-6">
                성과 등급만으로 승진하지 않습니다. 가치 실천, 리더십, 역량, 조직 기여를 종합적으로 검증합니다.
              </p>
              <div className="space-y-3">
                {PROMOTION_CRITERIA.map((item, i) => (
                  <div key={item.criteria} className="flex items-start gap-4 rounded-lg bg-white/[0.02] px-5 py-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold bg-[#D4537E]/10 text-[#D4537E] shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{item.criteria}</span>
                      <span className="text-xs text-slate-500 ml-2">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
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
