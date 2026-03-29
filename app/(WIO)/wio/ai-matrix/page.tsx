'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Brain, BarChart3, Lightbulb, PenTool,
  ShieldCheck, MessageCircle, Filter, Info
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── AI 유형 정의 ── */
const AI_TYPES = [
  { key: 'auto-input', name: '자동입력', icon: PenTool, color: '#534AB7', desc: '데이터를 자동으로 수집하고 입력 필드를 채움' },
  { key: 'auto-analysis', name: '자동분석', icon: BarChart3, color: '#378ADD', desc: '데이터를 분석하여 인사이트와 트렌드를 도출' },
  { key: 'auto-recommend', name: '자동추천', icon: Lightbulb, color: '#1D9E75', desc: '최적의 옵션, 대상, 전략을 추천' },
  { key: 'auto-generate', name: '자동생성', icon: Sparkles, color: '#BA7517', desc: '콘텐츠, 문서, 보고서를 자동 생성' },
  { key: 'auto-verify', name: '자동검증', icon: ShieldCheck, color: '#E24B4A', desc: '규정 준수, 데이터 정합성을 자동 검증' },
  { key: 'nlq', name: '자연어질의', icon: MessageCircle, color: '#D4537E', desc: '자연어로 데이터를 조회하고 명령 실행' },
];

/* ── 트랙 정의 ── */
const TRACKS = [
  { name: 'T1 운영관리', color: '#E24B4A' },
  { name: 'T2 영업마케팅', color: '#534AB7' },
  { name: 'T3 생산물류', color: '#1D9E75' },
  { name: 'T4 R&D', color: '#378ADD' },
  { name: 'T5 재무회계', color: '#BA7517' },
  { name: 'T6 협업소통', color: '#D4537E' },
  { name: 'T7 데이터분석', color: '#7C6AE8' },
];

type MatrixRow = {
  module: string;
  track: string;
  cells: Record<string, string | null>; // AI type key -> feature description or null
};

/* ── 매트릭스 데이터 (20 모듈) ── */
const MATRIX_DATA: MatrixRow[] = [
  { module: 'HR-REC 채용관리', track: 'T1 운영관리', cells: { 'auto-input': '이력서 파싱', 'auto-analysis': '지원자 적합도 분석', 'auto-recommend': '인재 추천', 'auto-generate': '공고 자동 생성', 'auto-verify': '자격요건 검증', 'nlq': '채용 현황 질의' } },
  { module: 'HR-ATT 근태관리', track: 'T1 운영관리', cells: { 'auto-input': 'GPS 자동 출퇴근', 'auto-analysis': '이상 근태 패턴', 'auto-recommend': null, 'auto-generate': '근태 리포트', 'auto-verify': '초과근무 규정 체크', 'nlq': '근태 현황 질의' } },
  { module: 'HR-PAY 급여정산', track: 'T1 운영관리', cells: { 'auto-input': '시수 자동 집계', 'auto-analysis': '급여 추이 분석', 'auto-recommend': null, 'auto-generate': '급여명세서 생성', 'auto-verify': '4대보험/세금 검증', 'nlq': '급여 내역 질의' } },
  { module: 'HR-EVL 평가보상', track: 'T1 운영관리', cells: { 'auto-input': null, 'auto-analysis': '성과 트렌드 분석', 'auto-recommend': '평가자 추천', 'auto-generate': '평가 요약 생성', 'auto-verify': '보정 로직 검증', 'nlq': '평가 결과 질의' } },
  { module: 'ORG 조직관리', track: 'T1 운영관리', cells: { 'auto-input': '발령 자동 반영', 'auto-analysis': '조직 구조 분석', 'auto-recommend': '최적 조직 추천', 'auto-generate': '조직도 생성', 'auto-verify': null, 'nlq': '조직 현황 질의' } },
  { module: 'SAL-PIP 영업파이프라인', track: 'T2 영업마케팅', cells: { 'auto-input': '명함 OCR', 'auto-analysis': '전환율 분석', 'auto-recommend': '딜 우선순위 추천', 'auto-generate': '영업 보고서', 'auto-verify': '할인율 규정 체크', 'nlq': '매출 현황 질의' } },
  { module: 'CRM 고객관리', track: 'T2 영업마케팅', cells: { 'auto-input': '고객 정보 자동 수집', 'auto-analysis': '고객 세그먼트 분석', 'auto-recommend': '이탈 방지 추천', 'auto-generate': null, 'auto-verify': '개인정보 규정 체크', 'nlq': '고객 데이터 질의' } },
  { module: 'MKT-CMP 캠페인', track: 'T2 영업마케팅', cells: { 'auto-input': '성과 자동 수집', 'auto-analysis': '캠페인 ROI 분석', 'auto-recommend': '채널/타겟 추천', 'auto-generate': '캠페인 카피 생성', 'auto-verify': '예산 초과 검증', 'nlq': '캠페인 성과 질의' } },
  { module: 'MKT-CRT 콘텐츠', track: 'T2 영업마케팅', cells: { 'auto-input': null, 'auto-analysis': '콘텐츠 성과 분석', 'auto-recommend': '주제/포맷 추천', 'auto-generate': '블로그/SNS 생성', 'auto-verify': '브랜드 가이드 체크', 'nlq': '콘텐츠 성과 질의' } },
  { module: 'QOT 견적관리', track: 'T2 영업마케팅', cells: { 'auto-input': '단가표 자동 적용', 'auto-analysis': '견적 경쟁력 분석', 'auto-recommend': '최적 가격 추천', 'auto-generate': '견적서 자동 생성', 'auto-verify': '마진율 검증', 'nlq': '견적 이력 질의' } },
  { module: 'PRD-PLN 생산계획', track: 'T3 생산물류', cells: { 'auto-input': '수요 자동 반영', 'auto-analysis': '생산능력 분석', 'auto-recommend': '최적 생산 일정', 'auto-generate': '생산 지시서', 'auto-verify': '자재 가용성 검증', 'nlq': '생산 현황 질의' } },
  { module: 'MES 제조실행', track: 'T3 생산물류', cells: { 'auto-input': 'IoT 센서 수집', 'auto-analysis': '불량률 분석', 'auto-recommend': '공정 최적화', 'auto-generate': '생산 실적 보고서', 'auto-verify': '품질 기준 검증', 'nlq': '생산 실적 질의' } },
  { module: 'WMS 창고관리', track: 'T3 생산물류', cells: { 'auto-input': '바코드/RFID 입고', 'auto-analysis': '재고 회전율 분석', 'auto-recommend': '적정 재고 추천', 'auto-generate': null, 'auto-verify': '재고 정합성 체크', 'nlq': '재고 현황 질의' } },
  { module: 'QC 품질관리', track: 'T3 생산물류', cells: { 'auto-input': '검사 데이터 자동 수집', 'auto-analysis': '품질 트렌드 분석', 'auto-recommend': null, 'auto-generate': '품질 성적서', 'auto-verify': 'ISO 기준 자동 검증', 'nlq': '품질 현황 질의' } },
  { module: 'R&D-PRJ 연구개발', track: 'T4 R&D', cells: { 'auto-input': '특허/논문 수집', 'auto-analysis': '기술 트렌드 분석', 'auto-recommend': '연구 주제 추천', 'auto-generate': '연구 보고서', 'auto-verify': null, 'nlq': 'R&D 현황 질의' } },
  { module: 'PLM 제품수명관리', track: 'T4 R&D', cells: { 'auto-input': 'BOM 자동 생성', 'auto-analysis': '제품 원가 분석', 'auto-recommend': '대체 자재 추천', 'auto-generate': '기술 문서 생성', 'auto-verify': '규격 적합 검증', 'nlq': '제품 정보 질의' } },
  { module: 'FIN-GL 총계정원장', track: 'T5 재무회계', cells: { 'auto-input': '전표 자동 분개', 'auto-analysis': '재무 비율 분석', 'auto-recommend': null, 'auto-generate': '재무제표 생성', 'auto-verify': '차대 균형 검증', 'nlq': '재무 현황 질의' } },
  { module: 'FIN-AP 매입관리', track: 'T5 재무회계', cells: { 'auto-input': '세금계산서 OCR', 'auto-analysis': '매입 추이 분석', 'auto-recommend': '결제 우선순위', 'auto-generate': '지급 예정표', 'auto-verify': '3-Way Matching', 'nlq': '매입 현황 질의' } },
  { module: 'COM-APR 전자결재', track: 'T6 협업소통', cells: { 'auto-input': '양식 자동 채움', 'auto-analysis': '결재 소요 분석', 'auto-recommend': '결재선 추천', 'auto-generate': '기안 초안 생성', 'auto-verify': '규정/한도 검증', 'nlq': '결재 현황 질의' } },
  { module: 'DTA-RPT 리포팅', track: 'T7 데이터분석', cells: { 'auto-input': '다중 소스 자동 수집', 'auto-analysis': '이상치 탐지', 'auto-recommend': '대시보드 추천', 'auto-generate': '보고서 자동 생성', 'auto-verify': '데이터 정합성 체크', 'nlq': '데이터 자유 질의' } },
];

export default function AIMatrixPage() {
  const [filterAI, setFilterAI] = useState<string | null>(null);
  const [filterTrack, setFilterTrack] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const filteredData = MATRIX_DATA.filter(row => {
    if (filterTrack && row.track !== filterTrack) return false;
    if (filterAI) {
      return row.cells[filterAI] !== null;
    }
    return true;
  });

  const totalCells = MATRIX_DATA.length * AI_TYPES.length;
  const filledCells = MATRIX_DATA.reduce((acc, row) => acc + Object.values(row.cells).filter(v => v !== null).length, 0);
  const coveragePercent = Math.round((filledCells / totalCells) * 100);

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
              <Brain size={12} /> AI &times; Module Matrix
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">AI &times; 모듈 매트릭스</h1>
            <p className="text-lg text-slate-400">6가지 AI 역량이 20개 핵심 모듈에 어떻게 적용되는지 한눈에</p>
          </div>

          {/* Stats */}
          <section className="mb-12">
            <div className="rounded-2xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-[#9B8FE8]">{coveragePercent}%</div>
                  <div className="text-sm text-slate-400 mt-1">전체 AI 적용률</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">{AI_TYPES.length}</div>
                  <div className="text-sm text-slate-400 mt-1">AI 유형</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">{MATRIX_DATA.length}</div>
                  <div className="text-sm text-slate-400 mt-1">핵심 모듈</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-[#1D9E75]">{filledCells}</div>
                  <div className="text-sm text-slate-400 mt-1">AI 적용 기능</div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Types Legend */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">6가지 AI 역량</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {AI_TYPES.map(ai => {
                const Icon = ai.icon;
                const isActive = filterAI === ai.key;
                return (
                  <button
                    key={ai.key}
                    onClick={() => setFilterAI(isActive ? null : ai.key)}
                    className="rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: isActive ? `${ai.color}60` : 'rgba(255,255,255,0.05)',
                      background: isActive ? `${ai.color}10` : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${ai.color}15` }}>
                      <Icon size={16} style={{ color: ai.color }} />
                    </div>
                    <div className="text-sm font-bold text-white">{ai.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">{ai.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Track Filter */}
          <section className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 mr-1">트랙:</span>
              <button
                onClick={() => setFilterTrack(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!filterTrack ? 'bg-[#534AB7] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                전체
              </button>
              {TRACKS.map(t => (
                <button
                  key={t.name}
                  onClick={() => setFilterTrack(filterTrack === t.name ? null : t.name)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: filterTrack === t.name ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                    color: filterTrack === t.name ? t.color : '#94a3b8',
                    border: filterTrack === t.name ? `1px solid ${t.color}40` : '1px solid transparent',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* Matrix Grid */}
          <section className="mb-16">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium w-[200px] sticky left-0 bg-[#0a0a0f]">모듈</th>
                    {AI_TYPES.map(ai => {
                      const Icon = ai.icon;
                      return (
                        <th key={ai.key} className="text-center px-2 py-3 text-xs font-medium" style={{ color: ai.color }}>
                          <div className="flex flex-col items-center gap-1">
                            <Icon size={14} />
                            <span>{ai.name}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => {
                    const trackInfo = TRACKS.find(t => t.name === row.track);
                    return (
                      <tr key={row.module} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 sticky left-0 bg-[#0a0a0f]">
                          <div className="text-sm font-medium text-white">{row.module}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: trackInfo?.color || '#666' }}>{row.track}</div>
                        </td>
                        {AI_TYPES.map(ai => {
                          const feature = row.cells[ai.key];
                          const cellKey = `${row.module}-${ai.key}`;
                          return (
                            <td key={ai.key} className="text-center px-2 py-2.5 relative">
                              {feature ? (
                                <div
                                  className="relative inline-block"
                                  onMouseEnter={() => setHoveredCell(cellKey)}
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  <span className="text-base cursor-default" style={{ color: ai.color }}>&#10003;</span>
                                  {hoveredCell === cellKey && (
                                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-slate-800 border border-white/10 p-3 text-left shadow-xl pointer-events-none">
                                      <div className="text-[10px] font-bold mb-1" style={{ color: ai.color }}>{ai.name}</div>
                                      <div className="text-xs text-slate-300">{feature}</div>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-white/10 rotate-45 -mt-1" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-700">&mdash;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
              <Info size={12} /> 셀 위에 마우스를 올리면 구체적인 AI 기능을 확인할 수 있습니다
            </div>
          </section>

          {/* Per-AI Coverage */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">AI 유형별 적용률</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {AI_TYPES.map(ai => {
                const Icon = ai.icon;
                const applied = MATRIX_DATA.filter(r => r.cells[ai.key] !== null).length;
                const pct = Math.round((applied / MATRIX_DATA.length) * 100);
                return (
                  <div key={ai.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ai.color}15` }}>
                          <Icon size={14} style={{ color: ai.color }} />
                        </div>
                        <span className="text-sm font-bold text-white">{ai.name}</span>
                      </div>
                      <span className="text-lg font-black" style={{ color: ai.color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ai.color }} />
                    </div>
                    <div className="text-xs text-slate-600 mt-2">{applied}/{MATRIX_DATA.length} 모듈 적용</div>
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
