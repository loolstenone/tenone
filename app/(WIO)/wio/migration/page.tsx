'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, ArrowRight, Check, AlertTriangle,
  Zap, Layers, RefreshCw, Clock, Shield, Database,
  CheckCircle2, FileCheck, Users, HardDrive, ChevronRight
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 3가지 전환 방식 ── */
const MIGRATION_TYPES = [
  {
    key: 'bigbang',
    name: '빅뱅 전환',
    nameEn: 'Big Bang',
    icon: Zap,
    color: '#E24B4A',
    desc: '기존 시스템을 한 번에 WIO로 교체',
    pros: ['전환 기간 최소화', '운영 일원화 즉시', '이중 운영 비용 없음'],
    cons: ['리스크 높음 (장애 시 전체 영향)', '전 직원 동시 교육 필요', '롤백 어려움'],
    fit: '소규모 조직, 기존 시스템 노후',
    risk: 'HIGH',
    duration: '1~2개월',
  },
  {
    key: 'phased',
    name: '순차 전환',
    nameEn: 'Phased',
    icon: Layers,
    color: '#1D9E75',
    desc: '트랙/모듈 단위로 순차적으로 전환',
    pros: ['리스크 분산', '단계별 학습 가능', '문제 조기 발견 및 수정'],
    cons: ['전환 기간 장기 (4~6개월)', '기존/신규 시스템 병행 운영', '인터페이스 구간 발생'],
    fit: '중대규모 조직, 안정성 중시',
    risk: 'LOW',
    duration: '4~6개월',
  },
  {
    key: 'parallel',
    name: '병행 전환',
    nameEn: 'Parallel Run',
    icon: RefreshCw,
    color: '#378ADD',
    desc: '기존 시스템과 WIO를 동시 운영 후 전환',
    pros: ['가장 안전한 방식', '데이터 정합성 검증 가능', '언제든 롤백 가능'],
    cons: ['이중 운영 비용 발생', '직원 피로도 높음', '데이터 동기화 관리 필요'],
    fit: '대기업, 규제 산업, 미션 크리티컬',
    risk: 'LOWEST',
    duration: '6~8개월',
  },
];

/* ── 순차 전환 6단계 ── */
const PHASED_STAGES = [
  { month: 'M1', name: '진단/설계', desc: '현행 시스템 분석, 데이터 매핑, 전환 계획 수립', color: '#534AB7', icon: FileCheck },
  { month: 'M2', name: 'T1 운영관리', desc: 'HR/조직/근태/급여 우선 이관 (핵심 인프라)', color: '#E24B4A', icon: Users },
  { month: 'M3', name: 'T5+T6 재무/협업', desc: '결재/경비/회계 + 사내 소통/문서', color: '#BA7517', icon: Database },
  { month: 'M4', name: 'T2 영업마케팅', desc: 'CRM/영업/마케팅 이관, 고객 데이터 정제', color: '#534AB7', icon: Users },
  { month: 'M5', name: 'T3+T4 생산/R&D', desc: '생산/물류/품질/연구개발 (해당 시)', color: '#1D9E75', icon: HardDrive },
  { month: 'M6', name: '안정화/최적화', desc: '전체 연동 테스트, 교육 마무리, Go-Live', color: '#378ADD', icon: CheckCircle2 },
];

/* ── 데이터 이관 체크리스트 ── */
const CHECKLIST = [
  { category: '사전 준비', items: ['현행 데이터 인벤토리 작성', '데이터 품질 점검 (중복/누락/오류)', '매핑 테이블 정의 (Old → WIO)', '이관 우선순위 결정'] },
  { category: '마스터 데이터', items: ['조직/부서/직급 코드 이관', '직원 정보 이관 (개인정보 암호화)', '고객/거래처 마스터 이관', '상품/자재 마스터 이관'] },
  { category: '트랜잭션 데이터', items: ['최근 2년 거래 이력 이관', '미결 건 (진행 중 프로젝트/주문) 처리 방안', '회계 잔액 마이그레이션', '시수/근태 이력 이관'] },
  { category: '검증/마무리', items: ['건수/금액 대사 (Old vs WIO)', '핵심 보고서 동일성 검증', '권한/롤 매핑 확인', '롤백 플랜 마련 및 테스트'] },
];

export default function MigrationPage() {
  const [selectedType, setSelectedType] = useState('phased');

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
              <Sparkles size={12} /> Migration Strategy
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">마이그레이션 전략</h1>
            <p className="text-lg text-slate-400">기존 시스템에서 WIO로, 안전하고 체계적인 전환</p>
          </div>

          {/* ═══════ 3가지 전환 방식 비교 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">전환 방식 비교</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {MIGRATION_TYPES.map(type => {
                const Icon = type.icon;
                const isActive = selectedType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className="rounded-2xl border p-6 text-left transition-all hover:scale-[1.01]"
                    style={{
                      borderColor: isActive ? `${type.color}50` : 'rgba(255,255,255,0.05)',
                      background: isActive ? `${type.color}08` : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${type.color}15` }}>
                        <Icon size={20} style={{ color: type.color }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{type.name}</h3>
                        <span className="text-xs text-slate-500">{type.nameEn}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{type.desc}</p>

                    <div className="flex items-center gap-3 mb-4 text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} /> {type.duration}
                      </span>
                      <span className="flex items-center gap-1" style={{
                        color: type.risk === 'HIGH' ? '#E24B4A' : type.risk === 'LOWEST' ? '#1D9E75' : '#BA7517',
                      }}>
                        <Shield size={12} /> 리스크: {type.risk}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-slate-600 uppercase mb-1.5">장점</div>
                      <div className="space-y-1">
                        {type.pros.map(p => (
                          <div key={p} className="flex items-start gap-1.5 text-xs text-slate-400">
                            <Check size={10} className="shrink-0 mt-0.5" style={{ color: type.color }} /> {p}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-slate-600 uppercase mb-1.5">단점</div>
                      <div className="space-y-1">
                        {type.cons.map(c => (
                          <div key={c} className="flex items-start gap-1.5 text-xs text-slate-500">
                            <AlertTriangle size={10} className="shrink-0 mt-0.5 text-slate-600" /> {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">적합:</span> {type.fit}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D9E75] mb-1">
                <Check size={14} /> WIO 권장: 순차 전환 (Phased)
              </div>
              <p className="text-xs text-slate-400">
                대부분의 기업에 순차 전환을 권장합니다. 리스크를 최소화하면서도 빠른 가치 실현이 가능합니다.
              </p>
            </div>
          </section>

          {/* ═══════ 순차 전환 6단계 타임라인 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">순차 전환 6단계</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              M1(진단) → M6(안정화)까지 6개월 로드맵. 각 단계를 완료한 후 다음 단계로 넘어갑니다.
            </p>

            {/* Timeline */}
            <div className="space-y-4">
              {PHASED_STAGES.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.month} className="flex items-stretch gap-4">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center w-12 shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stage.color}15` }}>
                        <Icon size={18} style={{ color: stage.color }} />
                      </div>
                      {i < PHASED_STAGES.length - 1 && (
                        <div className="flex-1 w-px bg-white/10 my-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: `${stage.color}20`, color: stage.color }}>
                          {stage.month}
                        </span>
                        <h3 className="text-sm font-bold text-white">{stage.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ 데이터 이관 체크리스트 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">데이터 이관 체크리스트</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {CHECKLIST.map(group => (
                <div key={group.category} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Database size={14} className="text-[#378ADD]" />
                    {group.category}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-sm text-slate-400">
                        <div className="w-4 h-4 rounded border border-white/10 bg-white/[0.03] shrink-0 mt-0.5 flex items-center justify-center">
                          <Check size={10} className="text-transparent" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ 무료 마이그레이션 상담 CTA ═══════ */}
          <section className="mb-16">
            <div className="rounded-2xl border border-[#534AB7]/30 bg-gradient-to-br from-[#534AB7]/10 to-[#378ADD]/10 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#534AB7]/15 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={28} className="text-[#9B8FE8]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">무료 마이그레이션 상담</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                현재 사용 중인 시스템과 조직 규모를 알려주시면,
                최적의 전환 방식과 일정을 제안드립니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/wio/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#534AB7] text-white text-sm font-semibold hover:bg-[#4a42a5] transition-colors"
                >
                  상담 신청하기 <ArrowRight size={16} />
                </Link>
                <Link
                  href="/wio/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  가격 먼저 보기
                </Link>
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
