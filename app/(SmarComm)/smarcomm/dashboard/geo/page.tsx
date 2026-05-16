'use client';

// AI 가시성 — smarcomm_ai_probes 실측 데이터 기반
// 5 플랫폼 × 7 카테고리 노출률, accuracy 분포, 최근 응답

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Sparkles, Calendar, Globe, ShieldCheck } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

const PLATFORMS = ['claude', 'chatgpt', 'perplexity', 'naver-cue', 'google-aio'] as const;
const PLATFORM_LABEL: Record<typeof PLATFORMS[number], string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  'naver-cue': '네이버 Cue',
  'google-aio': 'Google AIO',
};
const PLATFORM_TONE: Record<typeof PLATFORMS[number], string> = {
  claude: '#D97757',
  chatgpt: '#10A37F',
  perplexity: '#1FB8CD',
  'naver-cue': '#03C75A',
  'google-aio': '#4285F4',
};

const CATEGORIES = ['brand_direct', 'product_generic', 'use_case', 'competitor', 'pricing', 'howto', 'local'] as const;
const CATEGORY_LABEL: Record<typeof CATEGORIES[number], string> = {
  brand_direct: '브랜드 직접',
  product_generic: '제품군 일반',
  use_case: '사용 사례',
  competitor: '경쟁사 비교',
  pricing: '가격 플랜',
  howto: '방법 가이드',
  local: '지역·시장',
};

const ACCURACY_LABEL: Record<string, { label: string; color: string }> = {
  exact:   { label: '정확',   color: '#16A34A' },
  partial: { label: '부분',   color: '#D97706' },
  wrong:   { label: '오답',   color: '#DC2626' },
  absent:  { label: '미언급', color: '#94A3B8' },
};

interface Bucket { total: number; mentioned: number; rate: number }
interface PlatformBucket extends Bucket { platform: string; skipped: boolean }
interface CategoryBucket extends Bucket { category: string }
interface MatrixCell extends Bucket { platform: string; category: string }
interface RecentProbe {
  id: string; scan_id: string; platform: string; category: string; query: string;
  mentioned: boolean; position: number | null; accuracy: string; created_at: string;
}
interface VisibilityData {
  total: number;
  mentionRate: number;
  platformBreakdown: PlatformBucket[];
  categoryBreakdown: CategoryBucket[];
  accuracyDist: Record<string, number>;
  matrix: MatrixCell[];
  recent: RecentProbe[];
}

const RANGE_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

export default function GeoVisibilityPage() {
  const [data, setData] = useState<VisibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState<string>('');
  const [domains, setDomains] = useState<string[]>([]);
  const [days, setDays] = useState(0);

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
        const params = new URLSearchParams({ limit: '500' });
        if (domain) params.set('domain', domain);
        if (days > 0) params.set('days', String(days));
        const res = await fetch(`/api/smarcomm/ai-visibility?${params.toString()}`);
        const d = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(d.error || '데이터를 불러올 수 없습니다.'); setData(null); }
        else { setError(null); setData(d); }
      } catch {
        if (!cancelled) { setError('네트워크 오류'); setData(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [domain, days]);

  const matrixCell = (pf: string, cat: string) =>
    data?.matrix.find(m => m.platform === pf && m.category === cat) ?? { total: 0, mentioned: 0, rate: 0 };

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">AI 가시성</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">5 AI 플랫폼에서 우리 브랜드가 언급되는 비율을 카테고리별로 추적합니다</p>
        </div>
        <Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
          <Sparkles size={13} /> 새 진단 시작
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-full border border-border bg-white pl-8 pr-7 py-1.5 text-xs text-text focus:outline-none focus:border-text appearance-none">
            <option value="">전체 도메인</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          <Calendar size={11} className="ml-2 text-text-muted" />
          {RANGE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setDays(opt.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${days === opt.value ? 'bg-text text-white' : 'text-text-sub hover:text-text'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ {error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">불러오는 중…</div>
      ) : !data || data.total === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">
          AI 응답 데이터가 없습니다. 먼저 진단을 실행해주세요.
          <div className="mt-3"><Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1 text-xs text-text underline-offset-2 hover:underline"><Sparkles size={11}/> 진단 시작</Link></div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={<Bot size={14}/>} label="총 응답 수집" value={`${data.total}건`} sub={domain ? domain : '전체 도메인'} color="#0EA5E9" />
            <KpiCard icon={<ShieldCheck size={14}/>} label="평균 언급률" value={`${data.mentionRate}%`} sub={`${data.total}건 중 ${Math.round(data.mentionRate * data.total / 100)}건 언급`} color="#16A34A" />
            <KpiCard icon={<span className="text-base">✓</span>} label="정확 응답" value={`${data.accuracyDist.exact || 0}`} sub={`${pct(data.accuracyDist.exact, data.total)}% — 우리 정보 정확`} color="#16A34A" />
            <KpiCard icon={<span className="text-base">⚠</span>} label="오답·미언급" value={`${(data.accuracyDist.wrong || 0) + (data.accuracyDist.absent || 0)}`} sub="교정 필요" color="#DC2626" />
          </div>

          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border bg-surface/40 px-5 py-3">
              <h2 className="text-sm font-bold text-text">플랫폼 × 카테고리 노출 매트릭스</h2>
              <p className="mt-0.5 text-[11px] text-text-muted">셀 색상이 진할수록 언급률이 높습니다. 0%는 빈 셀(회색)로 표시.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase text-text-muted">카테고리 / 플랫폼</th>
                    {PLATFORMS.map(pf => (
                      <th key={pf} className="px-3 py-2 text-center font-semibold text-text" style={{ minWidth: 90 }}>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLATFORM_TONE[pf] }}/>
                          {PLATFORM_LABEL[pf]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => (
                    <tr key={cat} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-text-sub">{CATEGORY_LABEL[cat]}</td>
                      {PLATFORMS.map(pf => {
                        const cell = matrixCell(pf, cat);
                        const isEmpty = cell.total === 0;
                        const tone = PLATFORM_TONE[pf];
                        const alpha = isEmpty ? 0.04 : 0.10 + (cell.rate / 100) * 0.50;
                        const textColor = !isEmpty && cell.rate >= 60 ? tone : '#475569';
                        return (
                          <td key={pf} className="px-2 py-2 text-center">
                            <div className="rounded-md px-2 py-1.5 tabular-nums" style={{ background: hexA(tone, alpha) }}>
                              <div className="text-[13px] font-semibold" style={{ color: isEmpty ? '#94A3B8' : textColor }}>
                                {isEmpty ? '—' : `${cell.rate}%`}
                              </div>
                              {!isEmpty && <div className="text-[9px] text-text-muted">{cell.mentioned}/{cell.total}</div>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BreakdownCard title="플랫폼별 노출률" items={data.platformBreakdown.map(p => ({ label: PLATFORM_LABEL[p.platform as keyof typeof PLATFORM_LABEL], total: p.total, mentioned: p.mentioned, rate: p.rate, skipped: p.skipped, color: PLATFORM_TONE[p.platform as keyof typeof PLATFORM_TONE] }))} />
            <BreakdownCard title="카테고리별 노출률" items={data.categoryBreakdown.map(c => ({ label: CATEGORY_LABEL[c.category as keyof typeof CATEGORY_LABEL], total: c.total, mentioned: c.mentioned, rate: c.rate, color: '#3B82F6' }))} />
          </div>

          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border bg-surface/40 px-5 py-3">
              <h2 className="text-sm font-bold text-text">최근 AI 응답 ({data.recent.length}건)</h2>
              <p className="mt-0.5 text-[11px] text-text-muted">진단 시 캡처된 5 AI 플랫폼의 실제 응답을 시간순으로 표시</p>
            </div>
            <div className="divide-y divide-border">
              {data.recent.map(p => {
                const acc = ACCURACY_LABEL[p.accuracy] ?? ACCURACY_LABEL.absent;
                const tone = PLATFORM_TONE[p.platform as keyof typeof PLATFORM_TONE] || '#94A3B8';
                return (
                  <div key={p.id} className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: tone }}/>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-text">{PLATFORM_LABEL[p.platform as keyof typeof PLATFORM_LABEL] || p.platform}</span>
                          <span className="text-[10px] text-text-muted">{CATEGORY_LABEL[p.category as keyof typeof CATEGORY_LABEL] || p.category}</span>
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${acc.color}15`, color: acc.color }}>{acc.label}</span>
                          {p.position && <span className="text-[10px] text-text-muted">{p.position}위</span>}
                        </div>
                        <p className="mt-1 text-xs text-text-sub italic line-clamp-1">&quot;{p.query}&quot;</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-text-muted">{relativeTime(p.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${color}15`, color }}>{icon}</span>
        <span className="text-[11px] font-semibold text-text-sub">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] text-text-muted">{sub}</div>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: Array<{ label: string; total: number; mentioned: number; rate: number; skipped?: boolean; color: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="border-b border-border bg-surface/40 px-5 py-3">
        <h3 className="text-sm font-bold text-text">{title}</h3>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((it, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={`font-medium ${it.skipped ? 'text-text-muted/60' : 'text-text-sub'}`}>{it.label}</span>
              <span className={`tabular-nums ${it.skipped ? 'text-text-muted/60' : 'text-text-muted'}`}>
                {it.skipped ? '데이터 없음' : `${it.mentioned}/${it.total} · ${it.rate}%`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${it.rate}%`, background: it.color, opacity: it.skipped ? 0.2 : 0.85 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function pct(n: number | undefined, total: number): number {
  if (!n || total === 0) return 0;
  return Math.round((n / total) * 100);
}

function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
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
