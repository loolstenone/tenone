"use client";

import { Lock, TrendingUp } from "lucide-react";
import {
    computeMediaMatrix,
    MEDIA_LABELS,
    OPT_LABELS,
    type ScanForMatrix,
    type MatrixCell,
    type MediaType,
    type OptType,
    type MeasuredAs,
} from "@/lib/smarcomm/media-matrix";

// ── 점수 색상 ────────────────────────────────────────────────
function scoreColor(score: number | null): string {
    if (score === null) return "#9CA3AF";
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#3B82F6";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
}

function scoreBg(score: number | null): string {
    if (score === null) return "#F3F4F6";
    if (score >= 80) return "#ECFDF5";
    if (score >= 60) return "#EFF6FF";
    if (score >= 40) return "#FFFBEB";
    return "#FEF2F2";
}

const MEASURED_LABEL: Record<MeasuredAs, { text: string; color: string }> = {
    measured:    { text: "측정됨", color: "#10B981" },
    inferred:    { text: "추론",   color: "#6366F1" },
    unavailable: { text: "미측정", color: "#9CA3AF" },
};

// ── 셀 컴포넌트 ───────────────────────────────────────────────
function MatrixCellCard({ cell }: { cell: MatrixCell }) {
    const isUnavailable = cell.measuredAs === "unavailable";
    const color = scoreColor(cell.score);
    const bg    = scoreBg(cell.score);
    const mLabel = MEASURED_LABEL[cell.measuredAs];
    const topChecks = cell.checks.slice(0, 3);

    return (
        <div
            className="rounded-xl border p-3 flex flex-col gap-2 h-full"
            style={{ borderColor: isUnavailable ? "#E5E7EB" : color + "40", background: bg }}
        >
            {/* 점수 + measuredAs */}
            <div className="flex items-center justify-between">
                <span
                    className="text-[20px] font-black leading-none"
                    style={{ color: isUnavailable ? "#9CA3AF" : color }}
                >
                    {cell.score !== null ? cell.score : "—"}
                </span>
                <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: mLabel.color, background: mLabel.color + "18" }}
                >
                    {mLabel.text}
                </span>
            </div>

            {/* 설명 */}
            <p className="text-[10px] text-neutral-500 leading-snug">{cell.description}</p>

            {/* 체크 목록 or 잠금 */}
            {isUnavailable ? (
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-auto">
                    <Lock size={10} className="shrink-0" />
                    <span className="leading-tight">{cell.unavailableReason ?? "외부 도구 필요"}</span>
                </div>
            ) : (
                <ul className="space-y-0.5 mt-auto">
                    {topChecks.map(c => (
                        <li key={c.name} className="flex items-center gap-1">
                            <span
                                className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                                style={{
                                    background:
                                        c.status === "pass"    ? "#10B981" :
                                        c.status === "warning" ? "#F59E0B" : "#EF4444",
                                }}
                            />
                            <span className="text-[10px] text-neutral-600 truncate">{c.name}</span>
                        </li>
                    ))}
                    {cell.checks.length > 3 && (
                        <li className="text-[9px] text-neutral-400">+{cell.checks.length - 3}개 더</li>
                    )}
                </ul>
            )}
        </div>
    );
}

// ── 채널 행 평균 점수 배지 ────────────────────────────────────
function RowAvgBadge({ cells }: { cells: MatrixCell[] }) {
    const valid = cells.filter(c => c.score !== null);
    if (!valid.length) return <span className="text-[11px] text-neutral-400">—</span>;
    const avg = Math.round(valid.reduce((s, c) => s + (c.score ?? 0), 0) / valid.length);
    return (
        <span className="text-[11px] font-bold" style={{ color: scoreColor(avg) }}>
            {avg}
        </span>
    );
}

// ── 컬럼 평균 점수 배지 ────────────────────────────────────────
function ColAvgBadge({ cells }: { cells: MatrixCell[] }) {
    const valid = cells.filter(c => c.score !== null);
    if (!valid.length) return <span className="text-[11px] text-neutral-400">—</span>;
    const avg = Math.round(valid.reduce((s, c) => s + (c.score ?? 0), 0) / valid.length);
    return (
        <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: scoreColor(avg), background: scoreBg(avg) }}
        >
            <TrendingUp size={9} />
            avg {avg}
        </span>
    );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
const MEDIA_TYPES: MediaType[] = ["owned", "earned", "paid"];
const OPT_TYPES: OptType[] = ["seo", "geo", "aeo"];

export function MediaChannelMatrix({ scan }: { scan: ScanForMatrix }) {
    const matrix = computeMediaMatrix(scan);

    return (
        <div className="w-full">
            {/* 범례 */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {Object.entries(MEASURED_LABEL).map(([key, v]) => (
                    <span key={key} className="flex items-center gap-1 text-[10px]">
                        <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: v.color }}
                        />
                        <span className="text-neutral-500">{v.text}</span>
                    </span>
                ))}
                <span className="ml-auto text-[10px] text-neutral-400">점수 0~100</span>
            </div>

            {/* 테이블: 헤더(OPT) + 행(MEDIA) */}
            <div className="overflow-x-auto">
                <div style={{ minWidth: 560 }}>
                    {/* 헤더 행 */}
                    <div className="grid grid-cols-[120px_1fr_1fr_1fr_52px] gap-2 mb-2">
                        <div />
                        {OPT_TYPES.map(opt => (
                            <div key={opt} className="text-center">
                                <p className="text-[13px] font-black text-neutral-900">{OPT_LABELS[opt].ko}</p>
                                <p className="text-[10px] text-neutral-400">{OPT_LABELS[opt].desc}</p>
                            </div>
                        ))}
                        <div className="text-center">
                            <p className="text-[10px] text-neutral-400">채널<br />평균</p>
                        </div>
                    </div>

                    {/* 데이터 행 */}
                    {MEDIA_TYPES.map(media => {
                        const row = matrix[media];
                        const rowCells = OPT_TYPES.map(o => row[o]);
                        return (
                            <div
                                key={media}
                                className="grid grid-cols-[120px_1fr_1fr_1fr_52px] gap-2 mb-2 items-stretch"
                            >
                                {/* 채널 라벨 */}
                                <div className="flex flex-col justify-center pr-2">
                                    <p className="text-[13px] font-black text-neutral-900">
                                        {MEDIA_LABELS[media].ko}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
                                        {MEDIA_LABELS[media].desc}
                                    </p>
                                </div>

                                {/* 3 셀 */}
                                {OPT_TYPES.map(opt => (
                                    <MatrixCellCard key={opt} cell={row[opt]} />
                                ))}

                                {/* 행 평균 */}
                                <div className="flex items-center justify-center">
                                    <RowAvgBadge cells={rowCells} />
                                </div>
                            </div>
                        );
                    })}

                    {/* 컬럼 평균 행 */}
                    <div className="grid grid-cols-[120px_1fr_1fr_1fr_52px] gap-2 mt-1">
                        <div className="text-right pr-2">
                            <span className="text-[10px] text-neutral-400">최적화<br />평균</span>
                        </div>
                        {OPT_TYPES.map(opt => {
                            const colCells = MEDIA_TYPES.map(m => matrix[m][opt]);
                            return (
                                <div key={opt} className="flex justify-center">
                                    <ColAvgBadge cells={colCells} />
                                </div>
                            );
                        })}
                        <div />
                    </div>
                </div>
            </div>

            {/* 인사이트 요약 */}
            <MatrixInsights matrix={matrix} />
        </div>
    );
}

// ── 핵심 인사이트 ─────────────────────────────────────────────
function MatrixInsights({ matrix }: { matrix: ReturnType<typeof computeMediaMatrix> }) {
    type CellRef = { media: MediaType; opt: OptType; cell: MatrixCell };
    const allCells: CellRef[] = MEDIA_TYPES.flatMap(m =>
        OPT_TYPES.map(o => ({ media: m, opt: o, cell: matrix[m][o] }))
    );

    const measured  = allCells.filter(c => c.cell.score !== null);
    const strongest = measured.sort((a, b) => (b.cell.score ?? 0) - (a.cell.score ?? 0)).slice(0, 1)[0];
    const weakest   = measured.sort((a, b) => (a.cell.score ?? 0) - (b.cell.score ?? 0)).slice(0, 1)[0];

    if (!strongest || !weakest) return null;

    return (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">매트릭스 인사이트</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                    <span className="text-[16px]">💪</span>
                    <div>
                        <p className="text-[11px] font-bold text-neutral-700">
                            가장 강한 셀 — {MEDIA_LABELS[strongest.media].ko} × {OPT_LABELS[strongest.opt].ko}
                        </p>
                        <p className="text-[10px] text-neutral-500">{strongest.cell.description}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-[16px]">⚡</span>
                    <div>
                        <p className="text-[11px] font-bold text-neutral-700">
                            개선 우선 — {MEDIA_LABELS[weakest.media].ko} × {OPT_LABELS[weakest.opt].ko}
                        </p>
                        <p className="text-[10px] text-neutral-500">{weakest.cell.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
