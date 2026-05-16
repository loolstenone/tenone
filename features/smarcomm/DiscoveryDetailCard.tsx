// Discovery Sub-Engine Detail — V2.1 § 3-A SSOT-7
// AI SOV 매트릭스 + 인용 출처 + 할루시네이션 분리

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';
import type { DiscoveryDetail, SourceCategory, HallucinationCategory } from '@/lib/smarcomm/diagnostics-v21';

const SOURCE_META: Record<SourceCategory, { label: string; icon: string }> = {
  news:      { label: '뉴스',         icon: '📰' },
  wiki:      { label: '위키',         icon: '📚' },
  academic:  { label: '학술',         icon: '🎓' },
  official:  { label: '공식',         icon: '🏢' },
  blog:      { label: '블로그',       icon: '✍️' },
  review:    { label: '리뷰',         icon: '⭐' },
  directory: { label: '디렉토리',     icon: '📂' },
  forum:     { label: '커뮤니티',     icon: '💬' },
  social:    { label: '소셜',         icon: '📱' },
  unknown:   { label: '판단 불가',   icon: '❔' },
};

const TRUST_COLOR: Record<'high' | 'medium' | 'low', string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#9CA3AF',
};

const TRUST_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

const HALLUCINATION_META: Record<HallucinationCategory, { label: string; icon: string }> = {
  price:     { label: '가격',     icon: '💰' },
  location:  { label: '위치',     icon: '📍' },
  spec:      { label: '스펙',     icon: '⚙️' },
  founded:   { label: '설립연도', icon: '📅' },
  features:  { label: '기능',     icon: '🎯' },
  strengths: { label: '강점',     icon: '⭐' },
  category:  { label: '업종',     icon: '🏷️' },
  other:     { label: '기타',     icon: '❔' },
};

const SEVERITY_COLOR = { critical: '#DC2626', high: '#EA580C', medium: '#F59E0B' };

const PLATFORM_LABEL: Record<string, string> = {
  'claude': 'Claude',
  'chatgpt': 'ChatGPT',
  'perplexity': 'Perplexity',
  'naver-cue': '네이버 Cue',
  'google-aio': 'Google AI Overview',
};

const CATEGORY_LABEL: Record<string, string> = {
  brand_direct: '브랜드 직접',
  product_generic: '제품군 일반',
  use_case: '사용 사례',
  competitor: '경쟁사 비교',
  pricing: '가격·플랜',
  howto: '방법·가이드',
  local: '지역·시장',
};

interface Props {
  detail: DiscoveryDetail;
}

export default function DiscoveryDetailCard({ detail }: Props) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Discovery — GEO & SEO 진단</span>
      </div>

      <SovMatrix sov={detail.sov} />
      <SourceMapping sources={detail.sources} />
      <HallucinationFindings hallucinations={detail.hallucinations} />
    </div>
  );
}

// ─── 1. AI SOV 매트릭스 ───
function SovMatrix({ sov }: { sov: DiscoveryDetail['sov'] }) {
  const [expanded, setExpanded] = useState(false);
  const platforms = sov.byPlatform.map(p => p.platform);
  const categories = sov.byCategory.map(c => c.category);
  // V2.1 § 1.10 — 활성 플랫폼이 1~2개면 매트릭스 신뢰도 낮음
  const lowConfidence = platforms.length < 3;

  const cellColor = (sovPct: number, total: number) => {
    if (total === 0) return '#F3F4F6';
    if (sovPct >= 70) return '#10B981';
    if (sovPct >= 40) return '#3B82F6';
    if (sovPct >= 20) return '#F59E0B';
    if (sovPct > 0) return '#EA580C';
    return '#FCA5A5';
  };

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-blue-50/40 to-white px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
            🤖 AI SOV 매트릭스 (Share of Voice)
            {lowConfidence && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700" title={`활성 플랫폼 ${platforms.length}개 — 5플랫폼 표본 부족, 신뢰도 낮음`}>
                ⚠ 활성 {platforms.length}/5 플랫폼만 측정
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-[11px] text-text-muted">5 AI 플랫폼 × 7 카테고리에서 브랜드 언급 점유율</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text">{sov.overallSov}<span className="text-xs text-text-muted">%</span></div>
          <div className="text-[10px] text-text-muted">{lowConfidence ? '제한적 평균' : '전체 평균 SOV'}</div>
        </div>
      </div>

      {/* 매트릭스 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface/40">
              <th className="px-3 py-2 text-left font-medium text-text-muted">카테고리 \ 플랫폼</th>
              {platforms.map(p => (
                <th key={p} className="px-2 py-2 text-center font-medium text-text-muted whitespace-nowrap">{PLATFORM_LABEL[p] ?? p}</th>
              ))}
              <th className="px-2 py-2 text-center font-semibold text-text">평균</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const catCells = sov.cells.filter(c => c.category === cat);
              const catAvg = sov.byCategory.find(c => c.category === cat)?.avgSov ?? 0;
              return (
                <tr key={cat} className="border-b border-border last:border-0 hover:bg-surface/30">
                  <td className="px-3 py-1.5 text-text">{CATEGORY_LABEL[cat] ?? cat}</td>
                  {platforms.map(p => {
                    const cell = catCells.find(c => c.platform === p);
                    if (!cell || cell.total === 0) {
                      return <td key={p} className="px-2 py-1.5 text-center text-text-muted">—</td>;
                    }
                    return (
                      <td key={p} className="px-2 py-1.5 text-center">
                        <span
                          className="inline-flex h-7 w-12 items-center justify-center rounded-md text-[10px] font-semibold text-white"
                          style={{ background: cellColor(cell.sovPct, cell.total) }}
                          title={`${cell.mentioned}/${cell.total} 언급`}
                        >
                          {cell.sovPct}%
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center font-bold text-text">{catAvg}%</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border bg-surface/40">
              <td className="px-3 py-2 text-[11px] font-bold text-text">플랫폼 평균</td>
              {platforms.map(p => {
                const avg = sov.byPlatform.find(b => b.platform === p)?.avgSov ?? 0;
                return <td key={p} className="px-2 py-2 text-center text-[11px] font-bold text-text">{avg}%</td>;
              })}
              <td className="px-2 py-2 text-center text-sm font-bold text-text">{sov.overallSov}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-surface/30 px-5 py-2.5 text-center">
        <p className="text-[10px] text-text-muted">
          🔬 산식: SOV = 언급된 질문 / 전체 질문 × 100 · 색: ≥70% 녹·40~70 파·20~40 노·&lt;20 주
        </p>
      </div>
    </div>
  );
}

// ─── 2. 인용 출처 맵핑 ───
function SourceMapping({ sources }: { sources: DiscoveryDetail['sources'] }) {
  const [expanded, setExpanded] = useState(false);
  const top = expanded ? sources.sources : sources.sources.slice(0, 10);

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-emerald-50/40 to-white px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
            📚 인용 출처 맵핑
            {sources.classifierSource === 'llm' ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700" title="Claude Haiku LLM 분류 실측">🤖 LLM</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700" title="ANTHROPIC_API_KEY 미설정 — 카테고리 unknown 표시">⚠ LLM 미가용</span>
            )}
          </h3>
          <p className="mt-0.5 text-[11px] text-text-muted">AI가 응답에서 인용한 신뢰 소스 도메인 추출 + LLM 의미 분류</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text">{sources.uniqueDomains}</div>
          <div className="text-[10px] text-text-muted">고유 도메인</div>
        </div>
      </div>

      {/* 카테고리별 누적 */}
      <div className="border-b border-border px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(sources.byCategory) as [SourceCategory, number][])
            .filter(([, n]) => n > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const meta = SOURCE_META[cat];
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-text"
                >
                  {meta.icon} {meta.label} {count}
                </span>
              );
            })}
        </div>
      </div>

      {/* 도메인 목록 */}
      {sources.sources.length === 0 ? (
        <div className="p-6 text-center text-xs text-text-muted">AI 응답에 인용 URL이 없습니다.</div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {top.map(s => {
              const meta = SOURCE_META[s.category];
              const trustColor = TRUST_COLOR[s.trust];
              return (
                <div key={s.domain} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-surface/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-text truncate">{s.domain}</span>
                        <span className="text-[9px] text-text-muted">{meta.label}</span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                          style={{ background: `${trustColor}15`, color: trustColor }}
                          title={`LLM 평가 신뢰도: ${TRUST_LABEL[s.trust]}`}
                        >
                          {TRUST_LABEL[s.trust]}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted truncate" title={s.classifierReason}>
                        {s.platforms.length} 플랫폼 · {s.queries.length} 질의 · {s.classifierReason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-text">{s.mentionCount}</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text">
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          {sources.sources.length > 10 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full border-t border-border bg-surface/30 px-5 py-2 text-[11px] text-text-sub hover:bg-surface flex items-center justify-center gap-1"
            >
              {expanded ? <><ChevronUp size={11} /> 접기</> : <><ChevronDown size={11} /> +{sources.sources.length - 10}개 더 보기</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── 3. 할루시네이션 분리 ───
function HallucinationFindings({ hallucinations }: { hallucinations: DiscoveryDetail['hallucinations'] }) {
  const [expanded, setExpanded] = useState(false);

  if (hallucinations.findings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 px-5 py-4 flex items-center gap-3">
        <span className="text-lg">✅</span>
        <div>
          <h3 className="text-sm font-bold text-text">할루시네이션 진단 — 양호</h3>
          <p className="mt-0.5 text-[11px] text-text-sub">AI 응답에서 사실 오류(wrong)가 검출되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  const top = expanded ? hallucinations.findings : hallucinations.findings.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-rose-50/40 to-white px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-danger" /> 할루시네이션 진단
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700" title="Claude Haiku LLM의 의미 비교로 wrong 판정">🤖 LLM 의미 분류</span>
          </h3>
          <p className="mt-0.5 text-[11px] text-text-muted">사이트 사실 vs AI 응답을 LLM이 의미적으로 비교 (휴리스틱 폐기)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-danger">{hallucinations.findings.length}</div>
          <div className="text-[10px] text-text-muted">오류율 {hallucinations.errorRate}%</div>
        </div>
      </div>

      {/* 카테고리별·심각도별 누적 */}
      <div className="border-b border-border px-5 py-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(hallucinations.byCategory) as [HallucinationCategory, number][])
            .filter(([, n]) => n > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const meta = HALLUCINATION_META[cat];
              return (
                <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                  {meta.icon} {meta.label} {count}
                </span>
              );
            })}
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">Critical {hallucinations.bySeverity.critical}</span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">High {hallucinations.bySeverity.high}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Medium {hallucinations.bySeverity.medium}</span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {top.map((f, i) => {
          const meta = HALLUCINATION_META[f.category];
          return (
            <div key={i} className="px-5 py-3" style={{ borderLeftWidth: 3, borderLeftColor: SEVERITY_COLOR[f.severity] }}>
              <div className="mb-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-base">{meta.icon}</span>
                <span className="text-xs font-semibold text-text">{meta.label}</span>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ background: SEVERITY_COLOR[f.severity] }}>
                  {f.severity}
                </span>
                <span className="text-[10px] text-text-muted ml-auto">{PLATFORM_LABEL[f.platform] ?? f.platform}</span>
              </div>
              <p className="text-[11px] text-text-sub italic mb-1">"{f.query}"</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded bg-emerald-50 p-1.5 border border-emerald-200">
                  <span className="text-emerald-700 font-medium">사이트 (정답)</span>
                  <p className="text-text mt-0.5 line-clamp-2">{f.siteValue}</p>
                </div>
                <div className="rounded bg-rose-50 p-1.5 border border-rose-200">
                  <span className="text-rose-700 font-medium">AI 답변 (오류)</span>
                  <p className="text-text mt-0.5 line-clamp-2">{f.aiValue}</p>
                </div>
              </div>
              {f.reason && (
                <p className="mt-1.5 text-[10px] text-text-muted italic">🤖 LLM 판정: {f.reason}</p>
              )}
            </div>
          );
        })}
      </div>

      {hallucinations.findings.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border-t border-border bg-surface/30 px-5 py-2 text-[11px] text-text-sub hover:bg-surface flex items-center justify-center gap-1"
        >
          {expanded ? <><ChevronUp size={11} /> 접기</> : <><ChevronDown size={11} /> +{hallucinations.findings.length - 5}건 더 보기</>}
        </button>
      )}

      <div className="border-t border-border bg-rose-50/20 px-5 py-2.5">
        <p className="text-[10px] text-rose-700">
          💡 모든 wrong 발견은 AIRM 워크플로우에 자동 등록되어 교정 액션 큐로 들어갑니다.
        </p>
      </div>
    </div>
  );
}
