'use client';

// V2.0 § 3-B Smart-Data Hub — ⑥ 모니터링 (Real-time Tracker)
// 두 최근 진단 간 AI 답변 변화 diff 실시간 추적

import { useEffect, useState } from 'react';
import { Search, Activity, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Snapshot {
  platform: string;
  category: string;
  query: string;
  mentioned: boolean;
  position: number | null;
  accuracy: string;
  sentiment?: string | null;
  response_excerpt: string;
  measured_at: string;
}

interface Diff {
  platform: string;
  query: string;
  before: Snapshot | null;
  after: Snapshot;
  diff_type: 'improved' | 'degraded' | 'unchanged' | 'sentiment_flip' | 'fact_corrected' | 'fact_introduced' | 'new_appearance' | 'disappeared';
  summary: string;
}

const DIFF_META: Record<Diff['diff_type'], { label: string; color: string; icon: string }> = {
  improved:         { label: '개선',          color: '#10B981', icon: '📈' },
  degraded:         { label: '악화',          color: '#DC2626', icon: '📉' },
  unchanged:        { label: '변화 없음',     color: '#6B7280', icon: '➡️' },
  sentiment_flip:   { label: 'Sentiment 전환', color: '#A855F7', icon: '🔄' },
  fact_corrected:   { label: '사실 교정',     color: '#10B981', icon: '✅' },
  fact_introduced:  { label: '사실 오류 등장', color: '#DC2626', icon: '⚠️' },
  new_appearance:   { label: '신규 등장',     color: '#3B82F6', icon: '🌟' },
  disappeared:      { label: '사라짐',        color: '#DC2626', icon: '👻' },
};

const PLATFORM_LABEL: Record<string, string> = {
  'claude': 'Claude',
  'chatgpt': 'ChatGPT',
  'perplexity': 'Perplexity',
  'naver-cue': '네이버 Cue',
  'google-aio': 'Google AI Overview',
};

export default function AiTrackerPage() {
  const [domain, setDomain] = useState('smarcomm.biz');
  const [input, setInput] = useState('smarcomm.biz');
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [before, setBefore] = useState<{ short_id: string; at: string } | null>(null);
  const [after, setAfter] = useState<{ short_id: string; at: string } | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Diff['diff_type'] | 'all' | 'changes'>('changes');

  const fetchTracker = async (dom: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/smarcomm/ai-tracker?domain=${encodeURIComponent(dom)}`);
      const data = await res.json();
      setDiffs(data.diffs ?? []);
      setBefore(data.before ?? null);
      setAfter(data.after ?? null);
      setScanCount(data.scanCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTracker(domain); /* eslint-disable-next-line */ }, []);

  const filtered = diffs.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'changes') return d.diff_type !== 'unchanged';
    return d.diff_type === filter;
  });

  // 통계
  const counts = {
    improved: diffs.filter(d => d.diff_type === 'improved' || d.diff_type === 'fact_corrected' || d.diff_type === 'new_appearance').length,
    degraded: diffs.filter(d => d.diff_type === 'degraded' || d.diff_type === 'fact_introduced' || d.diff_type === 'disappeared').length,
    sentiment: diffs.filter(d => d.diff_type === 'sentiment_flip').length,
    unchanged: diffs.filter(d => d.diff_type === 'unchanged').length,
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-text">⑥ 모니터링 — AI Tracker</h1>
          <GuideHelpButton />
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">Real-time</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">최근 두 진단 간 AI 답변 변화 추적 — 정기 재진단(주간) 시 자동 diff 산출</p>
      </div>

      {/* 도메인 검색 */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setDomain(input); fetchTracker(input); } }}
            placeholder="추적할 도메인"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-text focus:border-text focus:outline-none"
          />
        </div>
        <button
          onClick={() => { setDomain(input); fetchTracker(input); }}
          className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub"
        >
          추적
        </button>
      </div>

      {scanCount > 0 && (
        <>
          {/* 진단 비교 헤더 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <div className="text-[10px] text-text-muted mb-0.5">이전 진단 (Before)</div>
              <div className="text-xs font-semibold text-text">
                {before ? new Date(before.at).toLocaleString('ko-KR') : '없음 (첫 진단)'}
              </div>
              {before && <div className="text-[10px] text-text-muted font-mono">{before.short_id}</div>}
            </div>
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <div className="text-[10px] text-text-muted mb-0.5">최신 진단 (After)</div>
              <div className="text-xs font-semibold text-text">
                {after ? new Date(after.at).toLocaleString('ko-KR') : '없음'}
              </div>
              {after && <div className="text-[10px] text-text-muted font-mono">{after.short_id}</div>}
            </div>
          </div>

          {/* 변화 통계 */}
          <div className="mb-6 grid grid-cols-4 gap-2">
            <StatCard label="개선" value={counts.improved} color="#10B981" icon={<ArrowUpRight size={14} />} />
            <StatCard label="악화" value={counts.degraded} color="#DC2626" icon={<ArrowDownRight size={14} />} />
            <StatCard label="Sentiment 전환" value={counts.sentiment} color="#A855F7" icon={<Activity size={14} />} />
            <StatCard label="변화 없음" value={counts.unchanged} color="#6B7280" icon={<EyeOff size={14} />} />
          </div>
        </>
      )}

      {/* 필터 */}
      <div className="mb-4 flex gap-1.5 flex-wrap">
        <Chip selected={filter === 'changes'} onClick={() => setFilter('changes')} label={`변화만 (${diffs.length - counts.unchanged})`} />
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')} label={`전체 (${diffs.length})`} />
        {(Object.keys(DIFF_META) as Array<Diff['diff_type']>).map(k => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)} label={`${DIFF_META[k].icon} ${DIFF_META[k].label}`} color={DIFF_META[k].color} />
        ))}
      </div>

      {/* 본문 */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : scanCount === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-text-muted">
          "{domain}" 진단 이력이 없습니다.
        </div>
      ) : scanCount === 1 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <p className="text-sm font-medium text-text">진단 1회만 있습니다</p>
          <p className="mt-1 text-xs text-text-muted">변화를 추적하려면 최소 2회 진단 필요. 정기 재진단(주간)을 활성화하세요.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-text-muted">
          조건에 맞는 변화 이벤트가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d, i) => <DiffCard key={i} diff={d} />)}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      <div className="flex items-center gap-1 text-[10px] text-text-muted">
        <span style={{ color }}>{icon}</span> {label}
      </div>
      <div className="mt-0.5 text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function Chip({ selected, onClick, label, color }: { selected: boolean; onClick: () => void; label: string; color?: string }) {
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

function DiffCard({ diff }: { diff: Diff }) {
  const meta = DIFF_META[diff.diff_type];
  return (
    <div className="rounded-xl border border-border bg-white p-3" style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}>
      <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-base">{meta.icon}</span>
        <span className="text-xs font-semibold text-text">{meta.label}</span>
        <span className="text-[10px] text-text-muted">{PLATFORM_LABEL[diff.platform] ?? diff.platform}</span>
        <span className="text-[10px] text-text-muted">·</span>
        <span className="text-[10px] text-text-sub italic line-clamp-1 flex-1">"{diff.query}"</span>
      </div>
      <p className="text-[11px] text-text-sub mb-1.5">{diff.summary}</p>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-md bg-surface/50 p-2 border border-border">
          <div className="text-text-muted mb-0.5 inline-flex items-center gap-0.5"><Eye size={9} /> Before</div>
          {diff.before ? (
            <div className="space-y-0.5 text-text-sub">
              <div>언급: {diff.before.mentioned ? `✓ 위 ${diff.before.position ?? '-'}` : '✗'}</div>
              <div>정확도: {diff.before.accuracy} · sentiment: {diff.before.sentiment ?? '-'}</div>
              <p className="line-clamp-2 italic mt-1">{diff.before.response_excerpt.slice(0, 100)}</p>
            </div>
          ) : <div className="text-text-muted">첫 진단 — 비교 대상 없음</div>}
        </div>
        <div className="rounded-md bg-surface/50 p-2 border border-border">
          <div className="text-text-muted mb-0.5 inline-flex items-center gap-0.5"><Eye size={9} /> After</div>
          <div className="space-y-0.5 text-text-sub">
            <div>언급: {diff.after.mentioned ? `✓ 위 ${diff.after.position ?? '-'}` : '✗'}</div>
            <div>정확도: {diff.after.accuracy} · sentiment: {diff.after.sentiment ?? '-'}</div>
            <p className="line-clamp-2 italic mt-1">{diff.after.response_excerpt.slice(0, 100)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
