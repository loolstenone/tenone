'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, ArrowRight, ChevronRight, Factory,
  Users, Megaphone, FileCheck, Package, CreditCard, BarChart3,
  UserPlus, GraduationCap, Target
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 노드 타입 ── */
type FlowNode = {
  code: string;
  name: string;
  desc: string;
  color: string;
  track: string;
};

type FlowDef = {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Factory;
  color: string;
  nodes: FlowNode[];
};

/* ── 4가지 E2E 흐름 ── */
const FLOWS: FlowDef[] = [
  {
    key: 'order-settlement',
    title: '수주 → 정산',
    subtitle: '영업 기회부터 대금 회수까지',
    icon: Package,
    color: '#534AB7',
    nodes: [
      { code: 'SAL-PIP', name: '영업파이프라인', desc: '리드 발굴, 기회 관리', color: '#534AB7', track: 'T2' },
      { code: 'QOT', name: '견적관리', desc: '견적 작성, 승인, 발송', color: '#534AB7', track: 'T2' },
      { code: 'ORD', name: '수주관리', desc: '주문 접수, 계약 확정', color: '#534AB7', track: 'T2' },
      { code: 'PRD-PLN', name: '생산계획', desc: '자재 확인, 일정 수립', color: '#1D9E75', track: 'T3' },
      { code: 'MES', name: '제조실행', desc: '작업 지시, 생산 실적', color: '#1D9E75', track: 'T3' },
      { code: 'QC', name: '품질관리', desc: '검사, 합격 판정', color: '#1D9E75', track: 'T3' },
      { code: 'WMS', name: '창고관리', desc: '완제품 입고, 출하', color: '#1D9E75', track: 'T3' },
      { code: 'TMS', name: '배송관리', desc: '배차, 운송, 수령 확인', color: '#1D9E75', track: 'T3' },
      { code: 'FIN-AR', name: '매출채권', desc: '세금계산서, 수금 관리', color: '#BA7517', track: 'T5' },
      { code: 'GL', name: '총계정원장', desc: '매출 인식, 수익 확정', color: '#BA7517', track: 'T5' },
      { code: 'CRM', name: '고객관리', desc: '만족도 조사, 재구매 관리', color: '#534AB7', track: 'T2' },
    ],
  },
  {
    key: 'hire-retire',
    title: '채용 → 퇴직',
    subtitle: '인재 확보부터 이직까지 전 생애주기',
    icon: Users,
    color: '#E24B4A',
    nodes: [
      { code: 'HR-REC', name: '채용관리', desc: '공고, 지원자 추적, 면접', color: '#E24B4A', track: 'T1' },
      { code: 'ONB', name: '온보딩', desc: '입사 서류, 환경 세팅', color: '#E24B4A', track: 'T1' },
      { code: 'ORG', name: '조직관리', desc: '부서 배치, 직급 부여', color: '#E24B4A', track: 'T1' },
      { code: 'WRK', name: '근태관리', desc: '출퇴근, 휴가, 초과근무', color: '#E24B4A', track: 'T1' },
      { code: 'EDU', name: '교육훈련', desc: '필수 교육, 역량 개발', color: '#378ADD', track: 'T4' },
      { code: 'FBK', name: '피드백', desc: '상시 피드백, 1:1 면담', color: '#D4537E', track: 'T6' },
      { code: 'EVL', name: '평가', desc: '분기/연간 성과 평가', color: '#E24B4A', track: 'T1' },
      { code: 'REW', name: '보상', desc: '인센티브, 승진 결정', color: '#E24B4A', track: 'T1' },
      { code: 'INC', name: '연봉협상', desc: '연봉 조정, 계약 갱신', color: '#E24B4A', track: 'T1' },
      { code: 'PAY', name: '급여정산', desc: '급여 계산, 이체 실행', color: '#BA7517', track: 'T5' },
      { code: 'OFF', name: '퇴직처리', desc: '퇴직금 정산, 증명서 발급', color: '#BA7517', track: 'T5' },
    ],
  },
  {
    key: 'campaign-roi',
    title: '캠페인 → ROI',
    subtitle: '마케팅 전략 수립부터 성과 측정까지',
    icon: Megaphone,
    color: '#1D9E75',
    nodes: [
      { code: 'MKT-STR', name: '마케팅전략', desc: '시장 분석, 타겟 정의', color: '#1D9E75', track: 'T2' },
      { code: 'CMP', name: '캠페인기획', desc: '채널 선정, 예산 배분', color: '#1D9E75', track: 'T2' },
      { code: 'CRT', name: '콘텐츠제작', desc: '카피, 디자인, 영상', color: '#1D9E75', track: 'T2' },
      { code: 'MDI', name: '매체집행', desc: '광고 게재, 배포', color: '#1D9E75', track: 'T2' },
      { code: 'PFM', name: '성과수집', desc: '클릭, 전환, 도달 수집', color: '#7C6AE8', track: 'T7' },
      { code: 'DTA', name: '데이터분석', desc: '성과 대시보드, 트렌드', color: '#7C6AE8', track: 'T7' },
      { code: 'ATR', name: '기여도분석', desc: '멀티터치 어트리뷰션', color: '#7C6AE8', track: 'T7' },
      { code: 'MMM', name: '마케팅믹스', desc: '채널별 ROI 최적화', color: '#7C6AE8', track: 'T7' },
      { code: 'OPS', name: '운영최적화', desc: 'A/B 테스트, 자동화', color: '#1D9E75', track: 'T2' },
      { code: 'FIN-AP', name: '매입정산', desc: '매체비 정산, 대행 수수료', color: '#BA7517', track: 'T5' },
    ],
  },
  {
    key: 'approval-settlement',
    title: '기안 → 정산',
    subtitle: '전자결재 기안부터 회계 처리까지',
    icon: FileCheck,
    color: '#378ADD',
    nodes: [
      { code: 'COM-APR', name: '전자결재', desc: '기안 작성, 첨부 파일', color: '#378ADD', track: 'T6' },
      { code: 'RULE', name: 'Rule Engine', desc: '결재선 자동 결정', color: '#378ADD', track: 'T6' },
      { code: 'APV-1', name: '1차 승인', desc: '팀장/부서장 승인', color: '#378ADD', track: 'T6' },
      { code: 'APV-2', name: '2차 승인', desc: '본부장/대표 승인', color: '#378ADD', track: 'T6' },
      { code: 'TRG', name: '후속 트리거', desc: '자동 발주/계약/공문 생성', color: '#D4537E', track: 'T6' },
      { code: 'FIN-AP', name: '매입정산', desc: '비용 처리, 증빙 매칭', color: '#BA7517', track: 'T5' },
      { code: 'GL', name: '총계정원장', desc: '비용 인식, 결산 반영', color: '#BA7517', track: 'T5' },
    ],
  },
];

export default function E2EFlowsPage() {
  const [activeTab, setActiveTab] = useState(FLOWS[0].key);
  const activeFlow = FLOWS.find(f => f.key === activeTab)!;

  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6">
            <ArrowLeft size={14} /> WIO
          </Link>

          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 px-4 py-1.5 text-xs text-[#9B8FE8] font-medium">
              <Sparkles size={12} /> End-to-End Flows
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">E2E 데이터 흐름도</h1>
            <p className="text-lg text-slate-400">시작부터 끝까지, 모듈 간 데이터가 끊김 없이 흐릅니다</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {FLOWS.map(flow => {
              const Icon = flow.icon;
              const isActive = activeTab === flow.key;
              return (
                <button
                  key={flow.key}
                  onClick={() => setActiveTab(flow.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive ? `${flow.color}15` : 'rgba(255,255,255,0.02)',
                    borderWidth: 1,
                    borderColor: isActive ? `${flow.color}40` : 'rgba(255,255,255,0.05)',
                    color: isActive ? flow.color : '#94a3b8',
                  }}
                >
                  <Icon size={16} />
                  {flow.title}
                </button>
              );
            })}
          </div>

          {/* Flow Description */}
          <section className="mb-10">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                {(() => { const Icon = activeFlow.icon; return <Icon size={20} style={{ color: activeFlow.color }} />; })()}
                <h2 className="text-2xl font-bold text-white">{activeFlow.title}</h2>
              </div>
              <p className="text-slate-400">{activeFlow.subtitle}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                <BarChart3 size={12} /> {activeFlow.nodes.length}개 모듈 연결 &middot; 트랙 간 자동 데이터 전달
              </div>
            </div>
          </section>

          {/* Flow Diagram */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full" style={{ background: activeFlow.color }} />
              <h2 className="text-2xl font-bold">데이터 흐름</h2>
            </div>

            {/* Desktop: Horizontal Node-Arrow */}
            <div className="hidden lg:block">
              <div className="flex flex-wrap items-center gap-1">
                {activeFlow.nodes.map((node, i) => (
                  <div key={node.code} className="flex items-center">
                    <div
                      className="rounded-xl border bg-white/[0.02] p-4 w-[130px] transition-all hover:scale-105 hover:bg-white/[0.04] cursor-default"
                      style={{ borderColor: `${node.color}30` }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${node.color}20`, color: node.color }}>
                          {node.track}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mb-0.5">{node.code}</div>
                      <div className="text-[11px] text-slate-300 font-medium">{node.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">{node.desc}</div>
                    </div>
                    {i < activeFlow.nodes.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600 mx-0.5 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical */}
            <div className="lg:hidden space-y-2">
              {activeFlow.nodes.map((node, i) => (
                <div key={node.code}>
                  <div
                    className="rounded-xl border bg-white/[0.02] p-4 transition-all"
                    style={{ borderColor: `${node.color}30`, borderLeftWidth: 3, borderLeftColor: node.color }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{node.code}</span>
                        <span className="text-xs text-slate-300">{node.name}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${node.color}20`, color: node.color }}>
                        {node.track}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{node.desc}</div>
                  </div>
                  {i < activeFlow.nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight size={14} className="text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Track Legend */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">현재 흐름의 트랙 구성</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(activeFlow.nodes.map(n => n.track))).map(track => {
                const node = activeFlow.nodes.find(n => n.track === track)!;
                const count = activeFlow.nodes.filter(n => n.track === track).length;
                return (
                  <div key={track} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-sm" style={{ background: node.color }} />
                      <span className="text-sm font-bold text-white">{track}</span>
                    </div>
                    <span className="text-xs text-slate-500">{count}개 모듈 참여</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Key Insight */}
          <section className="mb-16">
            <div className="rounded-2xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-8">
              <h3 className="text-lg font-bold text-white mb-3">WIO의 핵심 가치</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-black text-[#9B8FE8] mb-1">Zero</div>
                  <div className="text-sm text-slate-400">수작업 데이터 이관</div>
                  <div className="text-xs text-slate-600 mt-1">모듈 간 API로 자동 전달. 엑셀 복붙 제로</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#1D9E75] mb-1">Real-time</div>
                  <div className="text-sm text-slate-400">실시간 현황 파악</div>
                  <div className="text-xs text-slate-600 mt-1">어느 단계에서든 현재 상태를 즉시 확인</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#E24B4A] mb-1">Traceable</div>
                  <div className="text-sm text-slate-400">완전한 추적 가능성</div>
                  <div className="text-xs text-slate-600 mt-1">시작부터 끝까지 모든 변경 이력 기록</div>
                </div>
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
