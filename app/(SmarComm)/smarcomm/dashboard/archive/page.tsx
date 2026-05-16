'use client';

// 소재 아카이브 — smarcomm_creatives 실 데이터 기반
// AI 소재 제작에서 생성한 카피·배너·영상을 영구 저장·관리

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Type, Image as ImageIcon, Video, Plus, Copy, Check, Trash2, Filter, Archive as ArchiveIcon, Sparkles, ChevronDown } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

type CreativeType = 'text' | 'banner' | 'video';
type CreativeStatus = 'draft' | 'active' | 'archived';

interface Creative {
  id: string;
  type: CreativeType;
  channel: string | null;
  status: CreativeStatus;
  title: string;
  body: string | null;
  cta: string | null;
  hashtags: string[] | null;
  image_prompt: string | null;
  duration: string | null;
  source_prompt: string | null;
  source_context: string | null;
  generated_by: string;
  created_at: string;
}

interface Stats { total: number; byType: Record<string, number>; byStatus: Record<string, number>; byChannel: Record<string, number> }

const TYPE_META: Record<CreativeType, { label: string; icon: typeof Type; color: string }> = {
  text: { label: '텍스트 카피', icon: Type, color: '#3B82F6' },
  banner: { label: '배너/이미지', icon: ImageIcon, color: '#F59E0B' },
  video: { label: '영상', icon: Video, color: '#A855F7' },
};

const STATUS_META: Record<CreativeStatus, { label: string; tone: string }> = {
  draft: { label: '초안', tone: 'text-text-muted' },
  active: { label: '사용 중', tone: 'text-emerald-700' },
  archived: { label: '보관', tone: 'text-slate-500' },
};

export default function ArchivePage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<CreativeType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CreativeStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/smarcomm/creatives?${params.toString()}`);
      const d = await res.json();
      if (!res.ok) { setError(d.error || '불러올 수 없습니다.'); setCreatives([]); setStats(null); }
      else { setError(null); setCreatives(d.creatives ?? []); setStats(d.stats ?? null); }
    } catch {
      setError('네트워크 오류'); setCreatives([]); setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, search]);

  const handleStatusChange = async (id: string, status: CreativeStatus) => {
    await fetch('/api/smarcomm/creatives', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 소재를 삭제합니까? 되돌릴 수 없습니다.')) return;
    await fetch(`/api/smarcomm/creatives?id=${id}`, { method: 'DELETE' });
    load();
  };

  const handleCopy = (c: Creative) => {
    const text = [c.title, c.body, c.cta, (c.hashtags ?? []).map(h => `#${h}`).join(' ')].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const channels = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byChannel).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">소재 아카이브</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">AI 소재 제작에서 만든 모든 카피·배너·영상을 영구 보관합니다</p>
        </div>
        <Link href="/smarcomm/dashboard/creative" className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
          <Plus size={13} /> 새 소재 만들기
        </Link>
      </div>

      {/* KPI */}
      {stats && stats.total > 0 && (
        <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={<ArchiveIcon size={14}/>} label="전체 소재" value={stats.total} sub="DB 영속 저장" color="#0EA5E9" />
          <Kpi icon={<Type size={14}/>} label="텍스트 카피" value={stats.byType.text || 0} sub={`${pct(stats.byType.text, stats.total)}%`} color={TYPE_META.text.color} />
          <Kpi icon={<ImageIcon size={14}/>} label="배너·이미지" value={stats.byType.banner || 0} sub={`${pct(stats.byType.banner, stats.total)}%`} color={TYPE_META.banner.color} />
          <Kpi icon={<Video size={14}/>} label="영상" value={stats.byType.video || 0} sub={`${pct(stats.byType.video, stats.total)}%`} color={TYPE_META.video.color} />
        </div>
      )}

      {/* 필터 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="search" placeholder="제목 검색" value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-text" />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          <Filter size={11} className="ml-2 text-text-muted" />
          {(['all', 'text', 'banner', 'video'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${typeFilter === t ? 'bg-text text-white' : 'text-text-sub hover:text-text'}`}>
              {t === 'all' ? '전체' : TYPE_META[t].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          {(['all', 'draft', 'active', 'archived'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusFilter === s ? 'bg-text text-white' : 'text-text-sub hover:text-text'}`}>
              {s === 'all' ? '전체 상태' : STATUS_META[s].label}
            </button>
          ))}
        </div>
        {channels.length > 0 && (
          <div className="text-[10px] text-text-muted">
            채널: {channels.slice(0, 5).map(([c, n]) => `${c}(${n})`).join(' · ')}
          </div>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ {error}</div>}

      {/* 목록 */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">불러오는 중…</div>
      ) : creatives.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">
          저장된 소재가 없습니다.
          <div className="mt-3">
            <Link href="/smarcomm/dashboard/creative" className="inline-flex items-center gap-1 text-xs text-text underline-offset-2 hover:underline">
              <Sparkles size={11}/> AI 소재 제작에서 만들기
            </Link>
          </div>
          <p className="mt-3 text-[10px] text-text-muted">AI 소재 제작에서 생성하면 이곳에 자동 저장됩니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white divide-y divide-border">
          {creatives.map(c => {
            const meta = TYPE_META[c.type];
            const Icon = meta.icon;
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${meta.color}15`, color: meta.color }}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-text truncate">{c.title}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_META[c.status].tone} bg-surface`}>{STATUS_META[c.status].label}</span>
                      {c.channel && <span className="text-[10px] text-text-muted">{c.channel}</span>}
                      <span className="text-[10px] text-text-muted ml-auto">{relativeTime(c.created_at)}</span>
                    </div>
                    {c.body && <p className={`text-xs text-text-sub ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>{c.body}</p>}
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 text-[11px]">
                        {c.cta && <div><b className="text-text">CTA:</b> <span className="text-text-sub">{c.cta}</span></div>}
                        {c.hashtags && c.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.hashtags.map((h, i) => <span key={i} className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-text-sub">#{h}</span>)}
                          </div>
                        )}
                        {c.image_prompt && <div><b className="text-text">Image prompt:</b> <code className="text-[10px] text-text-muted">{c.image_prompt}</code></div>}
                        {c.duration && <div><b className="text-text">Duration:</b> <span className="text-text-sub">{c.duration}</span></div>}
                        {c.source_prompt && (
                          <div className="mt-2 rounded-lg bg-surface/50 px-3 py-2 text-[10px] text-text-muted">
                            <b className="text-text-sub">생성 프롬프트:</b> {c.source_prompt}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="inline-flex items-center gap-0.5 text-[11px] text-text-sub hover:text-text">
                        <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? '접기' : '자세히'}
                      </button>
                      <button onClick={() => handleCopy(c)} className="inline-flex items-center gap-0.5 text-[11px] text-text-sub hover:text-text">
                        {copiedId === c.id ? <><Check size={11}/> 복사됨</> : <><Copy size={11}/> 복사</>}
                      </button>
                      <div className="ml-auto flex items-center gap-1">
                        {(['draft', 'active', 'archived'] as const).map(s => (
                          <button key={s} onClick={() => handleStatusChange(c.id, s)} disabled={c.status === s}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === s ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                            {STATUS_META[s].label}
                          </button>
                        ))}
                        <button onClick={() => handleDelete(c.id)} className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-text-muted hover:text-danger hover:bg-danger/10" title="삭제">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${color}15`, color }}>{icon}</span>
        <span className="text-[11px] font-semibold text-text-sub">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-[10px] text-text-muted">{sub}</div>
    </div>
  );
}

function pct(n: number | undefined, total: number): number {
  if (!n || total === 0) return 0;
  return Math.round((n / total) * 100);
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
