'use client';

// 프롬프트 관리 — smarcomm_ai_probes의 query를 그룹화해 분석
// 어떤 질문이 가장 잘 노출되는가 / 못 노출되는가

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowUp, ArrowDown, Clock, Layers, ChevronDown, Globe, Sparkles } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

const CATEGORY_LABEL: Record<string, string> = {
  brand_direct: '브랜드 직접',
  product_generic: '제품군 일반',
  use_case: '사용 사례',
  competitor: '경쟁사 비교',
  pricing: '가격 플랜',
  howto: '방법 가이드',
  local: '지역·시장',
};

const PLATFORM_LABEL: Record<string, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  'naver-cue': '네이버 Cue',
  'google-aio': 'Google AIO',
};

const PLATFORM_TONE: Record<string, string> = {
  claude: '#D97757',
  chatgpt: '#10A37F',
  perplexity: '#1FB8CD',
  'naver-cue': '#03C75A',
  'google-aio': '#4285F4',
};

const ACCURACY_TONE: Record<string, string> = {
  exact: '#16A34A',
  partial: '#D97706',
  wrong: '#DC2626',
  absent: '#94A3B8',
};

interface Prompt {
  query: string;
  category: string;
  total: number;
  mentioned: number;
  mentionRate: number;
  platforms: Array<{ platform: string; mentioned: boolean; accuracy: string }>;
  accuracy: { exact: number; partial: number; wrong: number; absent: number };
  lastSeen: string;
}

type Sort = 'rate-desc' | 'rate-asc' | 'recent' | 'total';

const SORT_OPTIONS: { value: Sort; label: string; icon: typeof ArrowUp }[] = [
  { value: 'rate-desc', label: '노출률 높은 순', icon: ArrowDown },
  { value: 'rate-asc', label: '노출률 낮은 순', icon: ArrowUp },
  { value: 'total', label: '응답 많은 순', icon: Layers },
  { value: 'recent', label: '최근 순', icon: Clock },
];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [domain, setDomain] = useState<string>('');
  const [sort, setSort] = useState<Sort>('rate-asc');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/smarcomm/scans?limit=200');
        const d = await res.json();
        const list = Array.from(new Set((d.scans ?? []).map((s: { domain: string }) => s.domain))) as string[];
        setDomains(list);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort });
        if (category !== 'all') params.set('category', category);
        if (domain) params.set('domain', domain);
        const res = await fetch(`/api/smarcomm/prompts?${params.toString()}`);
        const d = await res.json();
        if (!cancelled) {
          setPrompts(d.prompts ?? []);
          setCategories(d.categories ?? {});
        }
      } catch {
        if (!cancelled) { setPrompts([]); setCategories({}); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category, domain, sort]);

  const filtered = search.trim()
    ? prompts.filter(p => p.query.toLowerCase().includes(search.toLowerCase()))
    : prompts;

  const avgRate = prompts.length > 0 ? Math.round(prompts.reduce((s, p) => s + p.mentionRate, 0) / prompts.length) : 0;
  const weakCount = prompts.filter(p => p.mentionRate === 0).length;
  const strongCount = prompts.filter(p => p.mentionRate >= 60).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">프롬프트 관리</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">진단 시 AI에 던진 질문들을 모아 어떤 프롬프트가 잘/못 노출되는지 분석합니다</p>
        </div>
        <Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
          <Sparkles size={13} /> 새 진단 시작
        </Link>
      </div>

      {/* KPI */}
      {prompts.length > 0 && (
        <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="고유 프롬프트" value={prompts.length} sub="모든 도메인·카테고리 합산" color="#0EA5E9" />
          <Kpi label="평균 노출률" value={`${avgRate}%`} sub="모든 프롬프트 평균" color="#16A34A" />
          <Kpi label="강한 프롬프트" value={strongCount} sub="60% 이상 노출" color="#10B981" />
          <Kpi label="약한 프롬프트" value={weakCount} sub="0% 노출 — 우선 보강 대상" color="#DC2626" />
        </div>
      )}

      {/* 필터 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="search" placeholder="질문 검색" value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-text" />
        </div>
        <div className="relative">
          <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-full border border-border bg-white pl-8 pr-7 py-1.5 text-xs text-text focus:outline-none focus:border-text appearance-none">
            <option value="">전체 도메인</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-text focus:outline-none focus:border-text">
          <option value="all">전체 카테고리 ({prompts.length})</option>
          {Object.entries(categories).map(([cat, n]) => (
            <option key={cat} value={cat}>{CATEGORY_LABEL[cat] ?? cat} ({n})</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setSort(opt.value)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${sort === opt.value ? 'bg-text text-white' : 'text-text-sub hover:text-text'}`}>
                <Icon size={10} /> {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">불러오는 중…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">
          조건에 맞는 프롬프트가 없습니다.
          {prompts.length === 0 && (
            <div className="mt-3"><Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1 text-xs text-text underline-offset-2 hover:underline"><Sparkles size={11}/> 먼저 진단 실행하기</Link></div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white divide-y divide-border">
          {filtered.map((p, i) => {
            const isExpanded = expanded === p.query;
            const rateColor = p.mentionRate >= 60 ? '#16A34A' : p.mentionRate >= 30 ? '#D97706' : '#DC2626';
            return (
              <div key={p.query + i} className="px-5 py-4">
                <button onClick={() => setExpanded(isExpanded ? null : p.query)} className="w-full text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl tabular-nums" style={{ background: `${rateColor}15` }}>
                      <span className="text-base font-bold leading-none" style={{ color: rateColor }}>{p.mentionRate}%</span>
                      <span className="text-[9px] text-text-muted mt-0.5">{p.mentioned}/{p.total}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-sub">{CATEGORY_LABEL[p.category] ?? p.category}</span>
                        <span className="text-[10px] text-text-muted ml-auto">{relativeTime(p.lastSeen)}</span>
                      </div>
                      <p className="text-sm font-medium text-text italic">&quot;{p.query}&quot;</p>
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        {p.platforms.map((pf, pi) => {
                          const tone = PLATFORM_TONE[pf.platform] || '#94A3B8';
                          const accTone = ACCURACY_TONE[pf.accuracy] || '#94A3B8';
                          return (
                            <span key={pi}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ background: pf.mentioned ? `${tone}12` : '#F8FAFC', border: `1px solid ${pf.mentioned ? tone : '#E2E8F0'}` }}
                              title={`${PLATFORM_LABEL[pf.platform] || pf.platform}: ${pf.mentioned ? '언급' : '미언급'} · ${pf.accuracy}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: pf.mentioned ? accTone : '#CBD5E1' }} />
                              <span style={{ color: pf.mentioned ? tone : '#94A3B8' }}>{PLATFORM_LABEL[pf.platform] || pf.platform}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <ChevronDown size={14} className={`shrink-0 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 rounded-xl bg-surface/30 px-4 py-3 text-xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <Bucket label="정확" value={p.accuracy.exact} color={ACCURACY_TONE.exact} />
                      <Bucket label="부분" value={p.accuracy.partial} color={ACCURACY_TONE.partial} />
                      <Bucket label="오답" value={p.accuracy.wrong} color={ACCURACY_TONE.wrong} />
                      <Bucket label="미언급" value={p.accuracy.absent} color={ACCURACY_TONE.absent} />
                    </div>
                    {p.mentionRate < 30 && (
                      <p className="text-[11px] text-amber-700">
                        ⚠ 이 질문에 대해 우리 브랜드가 거의 노출되지 않습니다. FAQ·HowTo 콘텐츠 보강 + Schema 등록을 우선 검토하세요.
                      </p>
                    )}
                    {p.accuracy.wrong > 0 && (
                      <p className="text-[11px] text-rose-700">
                        🚩 오답 {p.accuracy.wrong}건 감지 — AIRM 워크플로우에서 교정 액션 확인 권장.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, sub, color }: { label: string; value: number | string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 text-[11px] font-semibold text-text-sub">{label}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="mt-1 text-[10px] text-text-muted">{sub}</div>
    </div>
  );
}

function Bucket({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2">
      <div className="text-[10px] text-text-muted">{label}</div>
      <div className="text-base font-bold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}일 전`;
  return `${Math.floor(d / 30)}달 전`;
}
