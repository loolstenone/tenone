// AI Brand Journey 카드 — V2.0 § 3-A SSOT-6
// 4지표 (인지·이해·추천·평판) As-Is/To-Be 성적표 + 6 측정 차원

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BrandJourney } from '@/lib/smarcomm/brand-journey';

interface Props {
  journey: BrandJourney;
}

export default function BrandJourneyCard({ journey }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
      {/* 헤더 */}
      <div className="border-b border-border bg-gradient-to-r from-emerald-50/40 to-blue-50/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">AI Brand Journey</span>
              {journey.sentimentSource === 'llm' ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700" title="Sentiment·Reasoning·Attribute는 Claude Haiku 4.5로 실측 분류">
                  🤖 LLM 실측 {journey.analyzedByLlm}건
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700" title="ANTHROPIC_API_KEY 미설정 — Sentiment·Reasoning·Attribute 측정 불가">
                  ⚠ Sentiment LLM 미가용
                </span>
              )}
            </div>
            <h3 className="text-[15px] font-bold text-text">AI 브랜드 성적표 — 인지·이해·추천·평판</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">
              5 AI 플랫폼 × 7카테고리 실측 · 측정 신뢰도 {Math.round(journey.confidence * 100)}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-text">{journey.overallScore}</div>
            <div className="text-[10px] text-text-muted">종합 점수</div>
          </div>
        </div>
      </div>

      {/* 4 지표 As-Is/To-Be 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-b border-border">
        {journey.axes.map((axis) => (
          <AxisCard
            key={axis.axis}
            axis={axis}
            isNA={axis.axis === 'sentiment' && journey.sentimentSource === 'na'}
          />
        ))}
      </div>

      {/* 6 차원 detail 펼침 */}
      <div className="bg-surface/30">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-surface/50"
        >
          <span className="text-xs font-semibold text-text">6 측정 차원 상세 보기</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expanded && (
          <div className="border-t border-border bg-white px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {journey.dimensions.map((d) => (
                <DimensionRow key={d.key} dimension={d} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 출처 푸터 */}
      <div className="border-t border-border bg-surface/40 px-5 py-2.5 text-center space-y-0.5">
        <p className="text-[10px] text-text-muted">
          🔬 출처: AI 응답 실측 · 산식 = 인지·이해·추천·평판 평균 · Sentiment·Reasoning·Attribute는 LLM 분류기로 측정
        </p>
        <p className="text-[10px] text-text-muted">
          🎯 To-Be 목표값(30회·90%·TOP3·85%)은 <strong>SmarComm 표준 기본값</strong> — 업종 백분위 기반 동적 산출 및 워크스페이스 맞춤화는 단계적으로 적용
        </p>
      </div>
    </div>
  );
}

function AxisCard({ axis, isNA = false }: { axis: BrandJourney['axes'][number]; isNA?: boolean }) {
  const gap = axis.toBe - axis.asIs;
  const onTrack = axis.asIs >= axis.toBe;
  const barColor = onTrack ? '#10B981' : axis.asIs >= axis.toBe * 0.5 ? '#F59E0B' : '#DC2626';
  const targetColor = '#6B7280';

  if (isNA) {
    return (
      <div className="px-4 py-4 space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base opacity-60">{axis.icon}</span>
          <span className="text-[11px] font-semibold text-text-sub">{axis.label}</span>
        </div>
        <div className="text-2xl font-bold text-text-muted">N/A</div>
        <p className="text-[10px] text-text-muted leading-snug">
          Anthropic API 키 미설정 — Claude Haiku LLM 분류기가 작동하지 않습니다. 정직 원칙에 따라 휴리스틱 추정 점수는 산입하지 않습니다.
        </p>
        <div className="inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
          🔬 LLM 키 필요
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{axis.icon}</span>
        <span className="text-[11px] font-semibold text-text">{axis.label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold" style={{ color: barColor }}>{axis.asIs}</span>
        <span className="text-[10px] text-text-muted">/ 목표 {axis.toBe}</span>
      </div>
      {/* As-Is bar */}
      <div className="relative h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${Math.min(100, axis.asIs)}%`, background: barColor }}
        />
        {/* To-Be marker */}
        <div
          className="absolute top-[-2px] h-[10px] w-[2px]"
          style={{ left: `${Math.min(100, axis.toBe)}%`, background: targetColor }}
          title={`목표: ${axis.toBe}`}
        />
      </div>
      <div className="text-[10px] text-text-muted truncate" title={axis.rawValue}>
        실측: {axis.rawValue}
      </div>
      <div className={`text-[10px] leading-snug ${onTrack ? 'text-success' : 'text-text-sub'}`}>
        {onTrack ? '✓ ' : '→ '}{axis.actionHint}
      </div>
      {!onTrack && (
        <div className="inline-block rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-medium text-text-muted">
          {axis.recommendedModule === 'airm' ? 'AIRM' :
           axis.recommendedModule === 'assets' ? '자산화' :
           axis.recommendedModule === 'strategy' ? '전략' : '제작'} 으로 +{gap}점
        </div>
      )}
    </div>
  );
}

function DimensionRow({ dimension }: { dimension: BrandJourney['dimensions'][number] }) {
  const isNA = dimension.isNA === true || dimension.score === null;
  const scoreColor = isNA ? '#9CA3AF' : (dimension.score! >= 70 ? '#10B981' : dimension.score! >= 40 ? '#F59E0B' : '#DC2626');

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-text leading-tight">{dimension.label}</span>
        {isNA ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted">N/A</span>
        ) : (
          <span className="text-sm font-bold" style={{ color: scoreColor }}>{dimension.score}</span>
        )}
      </div>
      <p className="text-[11px] text-text-sub leading-relaxed">{dimension.summary}</p>
      {dimension.isNA && dimension.naReason && (
        <p className="mt-1 text-[10px] text-text-muted italic">{dimension.naReason}</p>
      )}
      {dimension.samples && dimension.samples.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {dimension.samples.slice(0, 5).map((sample, i) => (
            <span
              key={i}
              className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-sub border border-border"
              title={sample}
            >
              {sample.length > 30 ? sample.slice(0, 30) + '…' : sample}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
