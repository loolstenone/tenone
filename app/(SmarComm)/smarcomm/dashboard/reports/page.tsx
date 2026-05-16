'use client';

// 진단 리포트 히스토리 — smarcomm_scans 실 데이터 기반

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Globe, ExternalLink, Filter, Calendar, History, Sparkles } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

interface ScanRow {
  short_id: string;
  url: string;
  domain: string;
  industry: string | null;
  smarcomm_index: number;
  findability_score: number;
  trust_score: number;
  citability_score: number;
  performance_score: number | null;
  grade: Grade;
  pages_analyzed: number | null;
  favicon_url: string | null;
  created_at: string;
}

interface DomainSummary {
  domain: string;
  scans: number;
  latest_index: number;
  avg_index: number;
  latest_at: string;
}

const GRADE_COLOR: Record<Grade, string> = {
  S: '#059669',
  A: '#16A34A',
  B: '#D97706',
  C: '#EA580C',
  D: '#DC2626',
};

const RANGE_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

const GRADE_OPTIONS: (Grade | 'all')[] = ['all', 'S', 'A', 'B', 'C', 'D'];

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<Grade | 'all'>('all');
  const [days, setDays] = useState(0);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (grade !== 'all') params.set('grade', grade);
        if (days > 0) params.set('days', String(days));
        if (search.trim()) params.set('search', search.trim());
        if (domainFilter) params.set('domain', domainFilter);
        const res = await fetch(`/api/smarcomm/scans?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || '리포트를 불러올 수 없습니다.');
          setScans([]); setDomains([]);
        } else {
          setError(null);
          setScans(data.scans ?? []);
          setDomains(data.domains ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError('네트워크 오류로 리포트를 불러올 수 없습니다.');
          setScans([]); setDomains([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [grade, days, search, domainFilter]);

  const scansByDomain = useMemo(() => {
    const map: Record<string, ScanRow[]> = {};
    for (const s of scans) {
      (map[s.domain] ??= []).push(s);
    }
    return map;
  }, [scans]);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text">진단 리포트</h1>
            <GuideHelpButton />
          </div>
          <p className="mt-1 text-xs text-text-muted">과거에 진행한 모든 진단 결과를 도메인별로 정리합니다</p>
        </div>
        <Link
          href="/smarcomm/dashboard/scan"
          className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub"
        >
          <Sparkles size={13} /> 새 진단 시작
        </Link>
      </div>

      {/* 필터 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="도메인 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-text"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          <Filter size={11} className="ml-2 text-text-muted" />
          {GRADE_OPTIONS.map(g => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                grade === g ? 'bg-text text-white' : 'text-text-sub hover:text-text'
              }`}
            >
              {g === 'all' ? '전체' : g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          <Calendar size={11} className="ml-2 text-text-muted" />
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                days === opt.value ? 'bg-text text-white' : 'text-text-sub hover:text-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {domainFilter && (
          <button
            onClick={() => setDomainFilter(null)}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700"
          >
            🌐 {domainFilter}
            <span className="ml-1 text-blue-500">×</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ {error}</div>
      )}

      {/* 도메인 요약 카드 — domainFilter가 없을 때만 */}
      {!domainFilter && domains.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">도메인별 요약</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {domains.map(d => (
              <button
                key={d.domain}
                onClick={() => setDomainFilter(d.domain)}
                className="text-left rounded-2xl border border-border bg-white p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe size={13} className="shrink-0 text-text-muted" />
                    <span className="text-sm font-semibold text-text truncate">{d.domain}</span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: gradeFor(d.latest_index) }}>{d.latest_index}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>{d.scans}회 진단 · 평균 {d.avg_index}</span>
                  <span>{relativeTime(d.latest_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 스캔 목록 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <History size={11} className="inline mr-1 -mt-px" />
            진단 이력 ({scans.length}건)
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">불러오는 중…</div>
        ) : scans.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">
            조건에 맞는 진단 결과가 없습니다.
            <div className="mt-3">
              <Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1 text-xs text-text underline-offset-2 hover:underline">
                <Sparkles size={11} /> 첫 진단 시작하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(scansByDomain).map(([domain, list]) => (
              <div key={domain}>
                <div className="mb-2 px-1 flex items-center gap-2">
                  <Globe size={11} className="text-text-muted" />
                  <span className="text-xs font-semibold text-text">{domain}</span>
                  <span className="text-[10px] text-text-muted">({list.length}건)</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-white divide-y divide-border">
                  {list.map(s => (
                    <Link
                      key={s.short_id}
                      href={`/smarcomm/report/${s.short_id}`}
                      className="block px-5 py-4 hover:bg-surface/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white tabular-nums"
                            style={{ background: GRADE_COLOR[s.grade] }}
                          >
                            {s.grade}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-text tabular-nums">{s.smarcomm_index}점</span>
                              <span className="text-[11px] text-text-muted">
                                F {s.findability_score} · T {s.trust_score} · C {s.citability_score}
                                {s.performance_score != null && ` · PageSpeed ${s.performance_score}`}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-text-muted flex items-center gap-2 flex-wrap">
                              <span>{new Date(s.created_at).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              {s.pages_analyzed && s.pages_analyzed > 1 && <span>· {s.pages_analyzed}페이지 분석</span>}
                              {s.industry && <span>· {s.industry}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-text-sub">
                          보고서 보기 <ArrowRight size={12} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function gradeFor(score: number): string {
  if (score >= 95) return GRADE_COLOR.S;
  if (score >= 80) return GRADE_COLOR.A;
  if (score >= 60) return GRADE_COLOR.B;
  if (score >= 40) return GRADE_COLOR.C;
  return GRADE_COLOR.D;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}달 전`;
  return `${Math.floor(month / 12)}년 전`;
}
