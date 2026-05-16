'use client';

// 사용자 여정 — Smart-Loop 7단계 데이터 흐름 시각화
// 진단 → AI 응답 → 플래그 → 액션 → 자산화 → 배포 → 인용 추적

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowDown, Sparkles, Activity } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Stage { key: string; label: string; emoji: string; table: string; count: number; status: 'ok' | 'empty' | 'error' }
interface Conversion { from: string; to: string; rate: number }
interface Recent { stage: string; emoji: string; label: string; detail: string; created_at: string }
interface JourneyData { stages: Stage[]; conversions: Conversion[]; recent: Recent[]; generated_at: string }

const RANGE_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

const STAGE_LINKS: Record<string, string> = {
  scan: '/smarcomm/dashboard/reports',
  probe: '/smarcomm/dashboard/geo',
  flag: '/smarcomm/dashboard/airm/flags',
  action: '/smarcomm/dashboard/airm/actions',
  asset: '/smarcomm/dashboard/assets',
  distribution: '/smarcomm/dashboard/assets',
  citation: '/smarcomm/dashboard/assets',
};

const STAGE_HELP: Record<string, string> = {
  scan: '도메인 진단을 실행해 SEO·GEO 점수를 산출합니다',
  probe: '5 AI 플랫폼에 질문해 우리 브랜드 응답을 캡처합니다',
  flag: 'AI 응답에서 부정/오답/혼동 답변을 자동 감지합니다',
  action: '발견된 플래그를 교정할 role별 액션 큐를 만듭니다',
  asset: 'Schema.org Entity를 영구 자산으로 등록합니다',
  distribution: 'Entity를 위키·뉴스·매체에 배포해 권위를 쌓습니다',
  citation: 'AI 응답에서 우리 Entity가 인용되는 빈도를 추적합니다',
};

export default function JourneyPage() {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (days > 0) params.set('days', String(days));
        const res = await fetch(`/api/smarcomm/journey?${params.toString()}`);
        const d = await res.json();
        if (!cancelled) setData(res.ok ? d : null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [days]);

  const maxCount = Math.max(...(data?.stages.map(s => s.count) ?? [0]), 1);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">사용자 여정</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">Smart-Loop 7단계 데이터 흐름 — 진단부터 AI 인용 추적까지</p>
        </div>
        <Link href="/smarcomm/dashboard/scan" className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
          <Sparkles size={13} /> 새 진단 시작
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1 py-1">
          <Calendar size={11} className="ml-2 text-text-muted" />
          {RANGE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setDays(opt.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${days === opt.value ? 'bg-text text-white' : 'text-text-sub hover:text-text'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {data?.generated_at && (
          <span className="ml-auto text-[10px] text-text-muted">
            {new Date(data.generated_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} 갱신
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">불러오는 중…</div>
      ) : !data ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">데이터를 불러올 수 없습니다.</div>
      ) : (
        <>
          {/* Funnel 시각화 */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border bg-surface/40 px-5 py-3">
              <h2 className="text-sm font-bold text-text">데이터 플라이휠 — 단계별 전환</h2>
              <p className="mt-0.5 text-[11px] text-text-muted">각 단계의 데이터가 다음 단계의 인풋이 됩니다. 막대 길이는 누적 카운트, 화살표는 단계 간 전환율.</p>
            </div>
            <div className="p-5 space-y-3">
              {data.stages.map((s, i) => {
                const width = (s.count / maxCount) * 100;
                const conv = i > 0 ? data.conversions[i - 1] : null;
                const isEmpty = s.count === 0;
                return (
                  <div key={s.key}>
                    {conv && (
                      <div className="mb-1.5 flex items-center justify-center text-[10px] text-text-muted gap-1">
                        <ArrowDown size={11} className="opacity-50" />
                        <span>전환율 {conv.rate}%</span>
                      </div>
                    )}
                    <Link href={STAGE_LINKS[s.key] ?? '#'} className="block group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-sm font-semibold ${isEmpty ? 'text-text-muted' : 'text-text'}`}>{s.label}</span>
                            <span className={`text-base font-bold tabular-nums ${isEmpty ? 'text-text-muted' : 'text-text'}`}>
                              {isEmpty ? '—' : s.count.toLocaleString()}
                              <span className="ml-1 text-[10px] font-normal text-text-muted">건</span>
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-surface overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${Math.max(width, isEmpty ? 0 : 4)}%`,
                              background: isEmpty ? '#E2E8F0' : stageColor(i),
                            }}/>
                          </div>
                          <p className="mt-1 text-[10px] text-text-muted">{STAGE_HELP[s.key]}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border bg-surface/20 px-5 py-2.5 text-[10px] text-text-muted">
              ⓘ Smart-Loop 자산화 → AI 인용 → 다음 진단의 baseline. 마지막 두 단계(배포·인용)는 외부 매체 등재 후 누적이 시작됩니다.
            </div>
          </div>

          {/* 최근 활동 피드 */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border bg-surface/40 px-5 py-3 flex items-center gap-2">
              <Activity size={13} className="text-text-muted" />
              <h2 className="text-sm font-bold text-text">최근 활동</h2>
              <span className="text-[10px] text-text-muted">전 단계 통합 ({data.recent.length}건)</span>
            </div>
            {data.recent.length === 0 ? (
              <div className="p-12 text-center text-sm text-text-muted">최근 활동이 없습니다.</div>
            ) : (
              <div className="divide-y divide-border">
                {data.recent.map((r, i) => (
                  <Link key={i} href={STAGE_LINKS[r.stage] ?? '#'} className="flex items-start gap-3 px-5 py-3 hover:bg-surface/30">
                    <span className="text-base shrink-0 mt-0.5">{r.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-text">{r.label}</span>
                        <span className="text-[10px] text-text-muted">{relativeTime(r.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-sub truncate">{r.detail}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function stageColor(i: number): string {
  const palette = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  return palette[i % palette.length];
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
