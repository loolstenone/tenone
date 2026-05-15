'use client';

// V2.0 § 3-C AIRM ① 발견된 플래그 전체 목록

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import {
  FLAG_TYPE_META,
  FLAG_STATUS_META,
  SEVERITY_META,
  type FlagType,
  type FlagStatus,
  type FlagSeverity,
} from '@/lib/smarcomm/airm';

interface FlagRow {
  id: string;
  platform: string;
  query: string;
  response_excerpt: string;
  flag_type: FlagType;
  severity: FlagSeverity;
  confidence: number;
  status: FlagStatus;
  notes: string | null;
  detected_at: string;
  action_count: number;
}

interface Source {
  id: string;
  url: string;
  title: string | null;
  snippet: string | null;
  source_type: string | null;
  relevance_score: number | null;
  fetched_at: string;
}

export default function FlagsListPage() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FlagStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<FlagSeverity | 'all'>('all');

  const fetchFlags = async () => {
    setLoading(true);
    const tenantId = localStorage.getItem('smarcomm_company') || 'tenone-demo';
    const params = new URLSearchParams({ tenant_id: tenantId, limit: '200' });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (severityFilter !== 'all') params.set('severity', severityFilter);
    const res = await fetch(`/api/smarcomm/airm/flags?${params.toString()}`);
    const data = await res.json();
    setFlags(data.flags ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); /* eslint-disable-next-line */ }, [statusFilter, severityFilter]);

  const updateStatus = async (id: string, status: FlagStatus) => {
    await fetch('/api/smarcomm/airm/flags', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchFlags();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/smarcomm/dashboard/airm" className="inline-flex items-center gap-1 text-xs text-text-sub hover:text-text"><ArrowLeft size={12} /> AIRM 허브</Link>
        <PageTopBar />
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-text">발견된 플래그</h1>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted" title="scan 시 AI Probe 응답 자동 분석 — sentiment LLM·factComparison wrong·brand_direct 미언급 등 5 유형 트리거">
            🔬 출처: AI Probe 자동 (LLM 분류)
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">scan 실행 시 자동 감지 · 사용자 입력 불필요. 출처 추적 — "출처 조회" 버튼으로 외부 검색 API 조회 (SERPER_API_KEY 설정 필요).</p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div>
          <div className="text-[10px] text-text-muted mb-1 px-1">상태</div>
          <div className="flex gap-1 flex-wrap">
            <FilterChip selected={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="전체" />
            {(Object.keys(FLAG_STATUS_META) as FlagStatus[]).map(s => (
              <FilterChip key={s} selected={statusFilter === s} onClick={() => setStatusFilter(s)} label={FLAG_STATUS_META[s].label} color={FLAG_STATUS_META[s].color} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted mb-1 px-1">심각도</div>
          <div className="flex gap-1 flex-wrap">
            <FilterChip selected={severityFilter === 'all'} onClick={() => setSeverityFilter('all')} label="전체" />
            {(Object.keys(SEVERITY_META) as FlagSeverity[]).map(s => (
              <FilterChip key={s} selected={severityFilter === s} onClick={() => setSeverityFilter(s)} label={SEVERITY_META[s].label} color={SEVERITY_META[s].color} />
            ))}
          </div>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : flags.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-text-muted">
          조건에 맞는 플래그가 없습니다.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
          {flags.map(f => <FlagRow key={f.id} flag={f} onUpdate={updateStatus} />)}
        </div>
      )}
    </div>
  );
}

function FilterChip({ selected, onClick, label, color }: { selected: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${selected ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}
      style={selected && color ? { background: color } : {}}
    >
      {label}
    </button>
  );
}

const SOURCE_TYPE_LABEL: Record<string, string> = {
  wiki: '위키', official: '공식', news: '뉴스', forum: '포럼', blog: '블로그', other: '기타',
};

function FlagRow({ flag, onUpdate }: { flag: FlagRow; onUpdate: (id: string, status: FlagStatus) => void }) {
  const meta = FLAG_TYPE_META[flag.flag_type];
  const sMeta = SEVERITY_META[flag.severity];
  const stMeta = FLAG_STATUS_META[flag.status];
  const [expanded, setExpanded] = useState(false);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesStatus, setSourcesStatus] = useState<string | null>(null);

  const fetchSources = async () => {
    setSourcesLoading(true);
    const res = await fetch(`/api/smarcomm/airm/flags/${flag.id}/sources`, { method: 'POST' });
    const data = await res.json();
    setSourcesStatus(data.status ?? 'ok');
    setSources(data.sources ?? []);
    setSourcesLoading(false);
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-sm font-semibold text-text">{meta.label}</span>
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: `${sMeta.color}15`, color: sMeta.color }}>{sMeta.label}</span>
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${stMeta.color}15`, color: stMeta.color }}>{stMeta.label}</span>
            <span className="text-[10px] text-text-muted ml-auto">{flag.platform} · {new Date(flag.detected_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <p className="text-xs text-text font-medium italic">"{flag.query}"</p>
          {flag.notes && <p className="mt-1 text-[11px] text-text-sub">{flag.notes}</p>}
          {expanded && (
            <p className="mt-2 rounded-lg bg-surface/50 p-2 text-[11px] text-text-sub line-clamp-6 whitespace-pre-wrap">{flag.response_excerpt}</p>
          )}

          {/* 출처 섹션 */}
          {sourcesStatus === 'api_key_missing' && (
            <div className="mt-2 rounded-lg border border-border bg-surface/30 px-3 py-2 text-[11px] text-text-muted">
              🔌 외부 검색 API 미연결 — <code className="text-[10px]">SERPER_API_KEY</code> 설정 필요
            </div>
          )}
          {sourcesStatus === 'search_error' && (
            <div className="mt-2 rounded-lg border border-border bg-surface/30 px-3 py-2 text-[11px] text-text-muted">
              ⚠ 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {sources && sources.length > 0 && (
            <div className="mt-2 rounded-lg border border-border bg-surface/30 divide-y divide-border overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                🔍 AI 학습 추정 출처 ({sources.length}건)
              </div>
              {sources.map(s => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 hover:bg-surface/60 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 rounded px-1 py-0.5 text-[9px] font-medium bg-surface text-text-muted shrink-0">
                      {SOURCE_TYPE_LABEL[s.source_type ?? ''] ?? '기타'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-text truncate">{s.title ?? s.url}</p>
                      {s.snippet && <p className="mt-0.5 text-[10px] text-text-sub line-clamp-2">{s.snippet}</p>}
                    </div>
                    {s.relevance_score != null && (
                      <span className="shrink-0 text-[9px] text-text-muted">{Math.round(s.relevance_score * 100)}%</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
          {sources && sources.length === 0 && sourcesStatus === 'ok' && (
            <div className="mt-2 rounded-lg border border-border bg-surface/30 px-3 py-2 text-[11px] text-text-muted">
              검색 결과가 없습니다.
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
            <button onClick={() => setExpanded(!expanded)} className="text-text-sub hover:text-text inline-flex items-center gap-0.5">
              <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? '응답 숨기기' : '응답 보기'}
            </button>
            <button
              onClick={fetchSources}
              disabled={sourcesLoading}
              className="text-text-sub hover:text-text inline-flex items-center gap-0.5 disabled:opacity-50"
            >
              {sourcesLoading ? '조회 중…' : sources !== null ? '출처 새로고침' : '출처 조회'}
            </button>
            {flag.action_count > 0 && (
              <Link href={`/smarcomm/dashboard/airm/actions?flag_id=${flag.id}`} className="text-accent hover:underline">
                권장 액션 {flag.action_count}건 →
              </Link>
            )}
            <div className="ml-auto flex gap-1">
              {(['in_review', 'in_action', 'verified_fixed', 'wont_fix'] as FlagStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onUpdate(flag.id, s)}
                  disabled={flag.status === s}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${flag.status === s ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}
                >
                  {FLAG_STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
