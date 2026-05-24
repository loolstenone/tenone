'use client';

import { useEffect, useState } from 'react';
import { Calculator, Database, Shield } from 'lucide-react';

type GradeKey = 'S' | 'A' | 'B' | 'C' | 'D';

type Stats = {
    total: number;
    scored: number;
    avgIndex: number | null;
    avgFindability: number | null;
    avgTrust: number | null;
    avgCitability: number | null;
    gradeDistribution: Record<GradeKey, number>;
    updatedAt: string;
};

const GRADE_META: Record<GradeKey, { label: string; range: string; tone: string }> = {
    S: { label: 'S', range: '95+', tone: 'bg-emerald-500' },
    A: { label: 'A', range: '80~94', tone: 'bg-emerald-400' },
    B: { label: 'B', range: '60~79', tone: 'bg-amber-400' },
    C: { label: 'C', range: '40~59', tone: 'bg-orange-400' },
    D: { label: 'D', range: '~39', tone: 'bg-red-400' },
};

export default function HowWeScoreSection() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/smarcomm/benchmark-stats', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((data: Stats | null) => {
                if (!cancelled && data) setStats(data);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const fmtNumber = (n: number) => n.toLocaleString('ko-KR');
    const gradeTotal = stats ? Object.values(stats.gradeDistribution).reduce((a, b) => a + b, 0) : 0;

    return (
        <section className="border-t border-border bg-white px-5 py-20">
            <div className="mx-auto max-w-5xl">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-[11px] font-medium tracking-[0.2em] uppercase text-text-muted">
                        How We Score
                    </p>
                    <h2 className="mb-3 text-2xl font-bold text-text md:text-3xl">
                        수치로 검증하는 SmarComm Index
                    </h2>
                    <p className="text-sm leading-relaxed text-text-sub">
                        가짜 사례는 없습니다. 산식과 실측 데이터를 그대로 공개합니다.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {/* Card 1 — 산식 투명성 */}
                    <div className="rounded-2xl border border-border bg-surface p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-text">
                                <Calculator size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-text">산식 투명 공개</h3>
                        </div>

                        <p className="mb-4 text-xs leading-relaxed text-text-sub">
                            SmarComm Index = 3개 축의 가중 합산
                        </p>

                        <div className="mb-4 space-y-2">
                            <div className="rounded-lg border border-border bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-text">Findability</span>
                                    <span className="text-xs font-bold text-text">30%</span>
                                </div>
                                <p className="mt-1 text-[10px] text-text-muted">검색 노출 · SEO 기본기 · 속도</p>
                            </div>
                            <div className="rounded-lg border border-border bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-text">Trust</span>
                                    <span className="text-xs font-bold text-text">30%</span>
                                </div>
                                <p className="mt-1 text-[10px] text-text-muted">E-E-A-T · 권위 · 보안</p>
                            </div>
                            <div className="rounded-lg border border-border bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-text">Citability</span>
                                    <span className="text-xs font-bold text-text">40%</span>
                                </div>
                                <p className="mt-1 text-[10px] text-text-muted">AI 5종 멘션률 · 인용 적합도</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {(['S', 'A', 'B', 'C', 'D'] as GradeKey[]).map((g) => (
                                <div key={g} className="flex flex-1 flex-col items-center">
                                    <div className={`mb-1 h-1 w-full rounded-full ${GRADE_META[g].tone}`} />
                                    <span className="text-[10px] font-bold text-text">{g}</span>
                                    <span className="text-[9px] text-text-muted">{GRADE_META[g].range}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2 — 실측 누적 벤치마크 */}
                    <div className="rounded-2xl border border-border bg-[#0A0E1A] p-6 text-white">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                                <Database size={18} />
                            </div>
                            <h3 className="text-sm font-bold">실측 누적 벤치마크</h3>
                        </div>

                        {stats ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-[11px] uppercase tracking-wider text-white/40">누적 분석</p>
                                    <p className="text-3xl font-bold">{fmtNumber(stats.total)}<span className="ml-1 text-sm font-normal text-white/40">건</span></p>
                                </div>

                                {stats.avgIndex !== null && stats.scored > 0 && (
                                    <div className="mb-4 grid grid-cols-4 gap-2">
                                        <Stat label="Index" value={stats.avgIndex} />
                                        <Stat label="F" value={stats.avgFindability} />
                                        <Stat label="T" value={stats.avgTrust} />
                                        <Stat label="C" value={stats.avgCitability} />
                                    </div>
                                )}

                                {gradeTotal > 0 ? (
                                    <div className="mb-3">
                                        <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">등급 분포</p>
                                        <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                                            {(['S', 'A', 'B', 'C', 'D'] as GradeKey[]).map((g) => {
                                                const v = stats.gradeDistribution[g];
                                                const pct = (v / gradeTotal) * 100;
                                                if (pct === 0) return null;
                                                return (
                                                    <div
                                                        key={g}
                                                        className={GRADE_META[g].tone}
                                                        style={{ width: `${pct}%` }}
                                                        title={`${g}: ${v}건`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                                            {(['S', 'A', 'B', 'C', 'D'] as GradeKey[]).map((g) => (
                                                <span key={g}>{g} {stats.gradeDistribution[g]}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <p className="text-[10px] leading-relaxed text-white/30">
                                    분석이 누적될수록 정확도가 향상됩니다. 산업별 벤치마크는 표본이 충분해지면 공개합니다.
                                </p>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div className="h-10 animate-pulse rounded bg-white/5" />
                                <div className="h-16 animate-pulse rounded bg-white/5" />
                                <div className="h-4 animate-pulse rounded bg-white/5" />
                            </div>
                        )}
                    </div>

                    {/* Card 3 — 정직성 원칙 */}
                    <div className="rounded-2xl border border-border bg-surface p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-text">
                                <Shield size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-text">정직성 원칙</h3>
                        </div>

                        <ul className="space-y-3">
                            <li className="rounded-lg border border-border bg-white p-3">
                                <p className="text-xs font-semibold text-text">가짜 사례 0건</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                                    경쟁사가 흔히 쓰는 &ldquo;ROAS 500% 향상&rdquo; 같은 출처 불명 수치는 일절 게재하지 않습니다.
                                </p>
                            </li>
                            <li className="rounded-lg border border-border bg-white p-3">
                                <p className="text-xs font-semibold text-text">측정 불가 시 N/A</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                                    데이터가 부족하면 점수를 만들어내지 않고 그대로 비워둡니다.
                                </p>
                            </li>
                            <li className="rounded-lg border border-border bg-white p-3">
                                <p className="text-xs font-semibold text-text">실측 데이터만 노출</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                                    이 페이지의 평균·분포는 실제 진단 결과를 실시간으로 집계한 값입니다.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Stat({ label, value }: { label: string; value: number | null }) {
    return (
        <div className="rounded-lg bg-white/5 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wider text-white/40">{label}</p>
            <p className="text-base font-bold text-white">{value ?? '—'}</p>
        </div>
    );
}
