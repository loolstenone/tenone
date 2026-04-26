"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    LayoutTemplate, Search, Loader2, X, FileText, Calendar, BookOpen,
    ChevronRight, Heart, Copy, Check,
} from "lucide-react";
import { isSpecialTemplate as isSpecial, exportFrameworkText as exportFwText, tplDataKey } from "@/lib/planners/templates";
import {
    Q_TONE, Q_TEXT, CellTextarea, QuadrantGrid as SharedQuadrantGrid,
    type FrameworkData as SharedFrameworkData,
    type QuadrantDef as SharedQuadrantDef,
} from "./template-grids/_shared";

interface Template {
    id: string;
    key: string;
    category: string;
    subcategory: string | null;
    label: string;
    description: string | null;
    body_md: string;
}

export type FrameworkData = SharedFrameworkData;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; bar: string }> = {
    framework: {
        label: "FrameWorkBook",
        icon: <BookOpen className="h-3 w-3" />,
        color: "text-slate-800",
        bg: "bg-slate-50 border-slate-200",
        bar: "bg-slate-700",
    },
    schedule: {
        label: "Schedule",
        icon: <Calendar className="h-3 w-3" />,
        color: "text-slate-900",
        bg: "bg-slate-50 border-slate-300",
        bar: "bg-slate-900",
    },
    note: {
        label: "Note",
        icon: <FileText className="h-3 w-3" />,
        color: "text-stone-800",
        bg: "bg-stone-50 border-stone-200",
        bar: "bg-stone-700",
    },
};

// CellTextarea, QuadrantGrid, QuadrantDef, Q_TONE, Q_TEXT 는 ./template-grids/_shared 에서 import 사용
type QuadrantDef = SharedQuadrantDef;
const QuadrantGrid = SharedQuadrantGrid;

// ── 특수 프레임워크 렌더러 ────────────────────────────────────────────
function SwotGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 표준 SWOT: 세로축=Helpful↔Harmful, 가로축=Internal↔External
    // top-left=S(Internal,Helpful), top-right=O(External,Helpful)
    // bottom-left=W(Internal,Harmful), bottom-right=T(External,Harmful)
    const cells = [
        { key: "s", label: "Strengths",     sub: "내부 · 긍정", tone: "primary"   as const },
        { key: "o", label: "Opportunities", sub: "외부 · 긍정", tone: "secondary" as const },
        { key: "w", label: "Weaknesses",    sub: "내부 · 부정", tone: "tertiary"  as const },
        { key: "t", label: "Threats",       sub: "외부 · 부정", tone: "muted"     as const },
    ];
    return (
        <div className="my-3 select-none">
            <div className="flex items-center justify-center mb-3">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Internal</span>
                <span className="mx-2 text-slate-300">↔</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">External</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {cells.map(q => (
                    <div key={q.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[q.tone]} transition-shadow hover:shadow-sm`}>
                        <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[q.tone]}`}>{q.label}</p>
                        <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{q.sub}</p>
                        <CellTextarea cellKey={q.key} value={data[q.key] ?? ""} onChange={onChange} />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center mt-2.5 gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Helpful</span>
                <span className="text-slate-300">↑↓</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Harmful</span>
            </div>
        </div>
    );
}

function FourPGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "product",   label: "Product",   sub: "제품·서비스",       tone: "primary"   as const },
        { key: "price",     label: "Price",     sub: "가격·수익 모델",    tone: "secondary" as const },
        { key: "place",     label: "Place",     sub: "유통·접근",         tone: "tertiary"  as const },
        { key: "promotion", label: "Promotion", sub: "프로모션·커뮤니케이션", tone: "muted" as const },
    ];
    return (
        <div className="my-3 grid grid-cols-2 gap-2">
            {cells.map(q => (
                <div key={q.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[q.tone]} transition-shadow hover:shadow-sm`}>
                    <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[q.tone]}`}>{q.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{q.sub}</p>
                    <CellTextarea cellKey={q.key} value={data[q.key] ?? ""} onChange={onChange} />
                </div>
            ))}
        </div>
    );
}

// Q_TONE · Q_TEXT 는 ./template-grids/_shared 에서 import 사용

function AnsoffGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 표준 Ansoff: X축=시장(Existing→New), Y축=제품(New→Existing 위가 Existing)
    // 통상 Existing이 보수적/저위험, New가 공격적/고위험
    // 배열 순서 [top-left=X-Y+, top-right=X+Y+, bottom-left=X-Y-, bottom-right=X+Y-]
    return (
        <QuadrantGrid
            axisX="시장 (Markets)" axisXLow="기존" axisXHigh="신규"
            axisY="제품 (Products)" axisYHigh="기존" axisYLow="신규"
            quads={[
                // top-left: 기존 시장 × 기존 제품 = Market Penetration
                { key: "penetration", label: "Market Penetration", desc: "시장 침투 · 기존×기존", color: Q_TONE.primary, text: Q_TEXT.primary },
                // top-right: 신규 시장 × 기존 제품 = Market Development
                { key: "market_dev", label: "Market Development", desc: "시장 개발 · 신시장×기존제품", color: Q_TONE.secondary, text: Q_TEXT.secondary },
                // bottom-left: 기존 시장 × 신제품 = Product Development
                { key: "product_dev", label: "Product Development", desc: "제품 개발 · 기존시장×신제품", color: Q_TONE.tertiary, text: Q_TEXT.tertiary },
                // bottom-right: 신규 시장 × 신제품 = Diversification
                { key: "diversification", label: "Diversification", desc: "다각화 · 신시장×신제품 (고위험)", color: Q_TONE.muted, text: Q_TEXT.muted },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

function BcgGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 표준 BCG: X축=시장 점유율 (Low→High), Y축=시장 성장률 (Low→High, 위가 High)
    // [top-left=X-Y+, top-right=X+Y+, bottom-left=X-Y-, bottom-right=X+Y-]
    return (
        <QuadrantGrid
            axisX="Market Share" axisXLow="Low" axisXHigh="High"
            axisY="Market Growth" axisYHigh="High" axisYLow="Low"
            quads={[
                // top-left: Low Share × High Growth = Question Mark
                { key: "question", label: "Question Mark", desc: "저점유 · 고성장 (투자 검토)", color: Q_TONE.tertiary, text: Q_TEXT.tertiary },
                // top-right: High Share × High Growth = Star
                { key: "star", label: "Star", desc: "고점유 · 고성장 (전략 자산)", color: Q_TONE.primary, text: Q_TEXT.primary },
                // bottom-left: Low Share × Low Growth = Dog
                { key: "dog", label: "Dog", desc: "저점유 · 저성장 (철수 검토)", color: Q_TONE.muted, text: Q_TEXT.muted },
                // bottom-right: High Share × Low Growth = Cash Cow
                { key: "cow", label: "Cash Cow", desc: "고점유 · 저성장 (현금 창출)", color: Q_TONE.secondary, text: Q_TEXT.secondary },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

function NineBoxGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 표준 9-Box: X축=Performance (Low→High), Y축=Potential (Low→High, 위가 High)
    const perf = ["Low", "Mid", "High"];      // X axis 좌→우
    const pot = ["High", "Mid", "Low"];       // Y axis 위→아래 (위가 High)
    // 의미 강도 분류: primary(우상단 영역) / secondary(중심 라인) / tertiary(나머지) / muted(좌하단)
    const LABELS: Record<string, { label: string; tone: keyof typeof Q_TONE }> = {
        "High-Low":  { label: "Enigma",                tone: "tertiary" },   // top-left  Low Perf, High Pot
        "High-Mid":  { label: "High Potential",        tone: "secondary" },  // top-mid
        "High-High": { label: "Star",                  tone: "primary" },    // top-right High Perf, High Pot
        "Mid-Low":   { label: "Inconsistent Player",   tone: "muted" },
        "Mid-Mid":   { label: "Core Player",           tone: "secondary" },
        "Mid-High":  { label: "High Performer",        tone: "primary" },
        "Low-Low":   { label: "Under Performer",       tone: "muted" },      // bottom-left
        "Low-Mid":   { label: "Average Performer",     tone: "tertiary" },
        "Low-High":  { label: "Trusted Professional",  tone: "secondary" },  // bottom-right High Perf, Low Pot
    };
    return (
        <div className="my-3 select-none">
            {/* X축 상단 라벨 */}
            <div className="flex items-center justify-center mb-3 ml-16">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Low</span>
                <span className="mx-2 text-slate-300">←</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700">Performance</span>
                <span className="mx-2 text-slate-300">→</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">High</span>
            </div>
            <div className="flex gap-2">
                {/* Y축 — Potential High↑ Low↓ */}
                <div className="flex flex-col items-center justify-between shrink-0 w-7 py-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">High</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-700 inline-block -rotate-90 whitespace-nowrap">Potential</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">Low</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                    {pot.map(p => perf.map(pf => {
                        const k = `${p}-${pf}`;
                        const info = LABELS[k] ?? { label: k, tone: "tertiary" as const };
                        return (
                            <div key={k} className={`rounded-md p-2 min-h-24 ${Q_TONE[info.tone]}`}>
                                <p className={`text-[10px] font-bold tracking-wide uppercase leading-tight ${Q_TEXT[info.tone]}`}>{info.label}</p>
                                <textarea
                                    value={data[k] ?? ""}
                                    onChange={e => onChange(k, e.target.value)}
                                    placeholder="이름/메모…"
                                    rows={2}
                                    className="w-full mt-1.5 resize-none bg-transparent text-[10px] text-slate-700 placeholder:text-slate-300 placeholder:italic focus:outline-none leading-relaxed"
                                />
                            </div>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}

function EmpathyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const top = [
        { key: "says", label: "Say", sub: "말하는 것", emoji: "", color: "bg-slate-50 border border-slate-200", text: "text-slate-800" },
        { key: "thinks", label: "Think", sub: "생각하는 것", emoji: "", color: "bg-slate-50 border border-slate-200", text: "text-slate-800" },
        { key: "does", label: "Do", sub: "행동하는 것", emoji: "", color: "bg-slate-50 border border-slate-300", text: "text-slate-900" },
        { key: "feels", label: "Feel", sub: "느끼는 것", emoji: "", color: "bg-slate-50 border border-slate-200", text: "text-stone-700" },
    ];
    const bottom = [
        { key: "pains", label: "Pain", sub: "고통·두려움", emoji: "", color: "bg-stone-50 border border-stone-300", text: "text-stone-800" },
        { key: "gains", label: "Gain", sub: "바라는 것·이득", emoji: "", color: "bg-stone-50 border border-stone-200", text: "text-stone-800" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
                {top.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 min-h-24 ${c.color}`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{c.sub}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {bottom.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 min-h-20 ${c.color}`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{c.sub}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeanCanvasGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-1">
            {/* 상단 5열 */}
            <div className="grid grid-cols-5 gap-1">
                {/* Col 1: Problem + Existing Alt */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-stone-50 border border-stone-300 min-h-24">
                        <p className="text-[10px] font-bold text-stone-800">Problem</p>
                        <p className="text-[9px] text-neutral-400">문제</p>
                        <CellTextarea cellKey="problem" value={data["problem"] ?? ""} onChange={onChange} placeholder="Top 3 problems…" />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-stone-700">Existing Alt.</p>
                        <p className="text-[9px] text-neutral-400">기존 대안</p>
                        <CellTextarea cellKey="existing_alternatives" value={data["existing_alternatives"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 2: Solution + Key Metrics */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-300 min-h-24">
                        <p className="text-[10px] font-bold text-slate-900">Solution</p>
                        <p className="text-[9px] text-neutral-400">솔루션</p>
                        <CellTextarea cellKey="solution" value={data["solution"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-700">Key Metrics</p>
                        <p className="text-[9px] text-neutral-400">핵심 지표</p>
                        <CellTextarea cellKey="key_metrics" value={data["key_metrics"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 3: UVP + High-Level Concept (center, tall) */}
                <div className="rounded-lg p-2 bg-stone-50 border border-stone-200 flex flex-col">
                    <p className="text-[10px] font-bold text-stone-800">UVP</p>
                    <p className="text-[9px] text-neutral-400">고유 가치 제안</p>
                    <CellTextarea cellKey="uvp" value={data["uvp"] ?? ""} onChange={onChange} placeholder="Single clear, compelling message…" />
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-stone-600">High-Level Concept</p>
                        <CellTextarea cellKey="high_level_concept" value={data["high_level_concept"] ?? ""} onChange={onChange} placeholder="X for Y…" />
                    </div>
                </div>
                {/* Col 4: Unfair Advantage + Channels */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-24">
                        <p className="text-[10px] font-bold text-slate-800">Unfair Adv.</p>
                        <p className="text-[9px] text-neutral-400">경쟁 우위</p>
                        <CellTextarea cellKey="unfair_advantage" value={data["unfair_advantage"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-600">Channels</p>
                        <p className="text-[9px] text-neutral-400">채널</p>
                        <CellTextarea cellKey="channels" value={data["channels"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 5: Customer Segments + Early Adopters */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-24">
                        <p className="text-[10px] font-bold text-slate-800">Customer Seg.</p>
                        <p className="text-[9px] text-neutral-400">고객 세그먼트</p>
                        <CellTextarea cellKey="customer_segments" value={data["customer_segments"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-600">Early Adopters</p>
                        <p className="text-[9px] text-neutral-400">초기 사용자</p>
                        <CellTextarea cellKey="early_adopters" value={data["early_adopters"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
            {/* 하단 2열 */}
            <div className="grid grid-cols-2 gap-1">
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-16">
                    <p className="text-[10px] font-bold text-neutral-600">Cost Structure</p>
                    <p className="text-[9px] text-neutral-400">비용 구조</p>
                    <CellTextarea cellKey="cost_structure" value={data["cost_structure"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-300 min-h-16">
                    <p className="text-[10px] font-bold text-slate-800">Revenue Streams</p>
                    <p className="text-[9px] text-neutral-400">수익 흐름</p>
                    <CellTextarea cellKey="revenue_streams" value={data["revenue_streams"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

function MandalartGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // Spatial positions: t0→(0,0) t1→(0,1) t2→(0,2) t3→(1,0) center→(1,1) t4→(1,2) t5→(2,0) t6→(2,1) t7→(2,2)
    // Inner cell positions within each 3×3 block follow the same spatial layout
    const themeLayout = ["t0", "t1", "t2", "t3", null, "t4", "t5", "t6", "t7"] as const;

    function innerLayout(ti: number) {
        // Returns 9 cell keys in spatial order; center = the theme itself
        return [0, 1, 2, 3, null, 4, 5, 6, 7].map(ai =>
            ai === null ? `t${ti}` : `t${ti}_${ai}`
        );
    }

    const cellBase = "rounded border text-[9px] font-semibold leading-tight p-1 flex flex-col";
    const actionCell = "bg-white border-neutral-200 text-neutral-600";
    const themeCell = "bg-stone-50 border-stone-300 text-slate-900 font-bold";
    const goalCell = "bg-slate-900 border-slate-900 text-white font-extrabold";

    return (
        <div className="my-2 overflow-x-auto">
            <div className="grid grid-cols-3 gap-1 min-w-[420px]">
                {themeLayout.map((themeKey) => {
                    const isCenter = themeKey === null;

                    if (isCenter) {
                        // Center block: goal + 8 themes
                        return (
                            <div key="center" className="grid grid-cols-3 gap-0.5">
                                {themeLayout.map((tk, innerIdx) => {
                                    const isGoal = tk === null;
                                    return (
                                        <div key={innerIdx} className={`${cellBase} min-h-12 ${isGoal ? goalCell : themeCell}`}>
                                            <span className="text-[8px] opacity-70">{isGoal ? "목표" : `테마${innerIdx < 4 ? innerIdx + 1 : innerIdx}`}</span>
                                            <textarea
                                                value={isGoal ? (data["goal"] ?? "") : (data[tk!] ?? "")}
                                                onChange={e => onChange(isGoal ? "goal" : tk!, e.target.value)}
                                                placeholder={isGoal ? "핵심 목표" : `테마 ${innerIdx}`}
                                                rows={2}
                                                className="flex-1 w-full resize-none bg-transparent placeholder:opacity-30 focus:outline-none text-[9px] leading-tight mt-0.5"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }

                    const ti = parseInt(themeKey.replace("t", ""), 10);
                    const cells = innerLayout(ti);
                    const themeLabel = `테마 ${ti + 1}`;

                    return (
                        <div key={themeKey} className="grid grid-cols-3 gap-0.5">
                            {cells.map((cellKey, pos) => {
                                const isThemeCenter = cellKey === themeKey;
                                return (
                                    <div key={pos} className={`${cellBase} min-h-12 ${isThemeCenter ? themeCell : actionCell}`}>
                                        {isThemeCenter && <span className="text-[8px] opacity-60">{themeLabel}</span>}
                                        <textarea
                                            value={data[cellKey] ?? ""}
                                            onChange={e => onChange(cellKey, e.target.value)}
                                            placeholder={isThemeCenter ? "테마" : "실행"}
                                            rows={2}
                                            className="flex-1 w-full resize-none bg-transparent placeholder:opacity-25 focus:outline-none text-[9px] leading-tight mt-0.5"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-neutral-400 mt-2 text-center">중앙 블록에 핵심 목표 + 8테마 → 각 블록에 테마별 실행 8개</p>
        </div>
    );
}

function EisenhowerGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 표준 Eisenhower: X축=중요도 (Low→High), Y축=긴급도 (Low→High, 위가 High)
    // [top-left=X-Y+, top-right=X+Y+, bottom-left=X-Y-, bottom-right=X+Y-]
    return (
        <QuadrantGrid
            axisX="중요도 (Importance)" axisXLow="Low" axisXHigh="High"
            axisY="긴급도 (Urgency)" axisYHigh="High" axisYLow="Low"
            quads={[
                // top-left: 비중요 × 긴급 = Delegate
                { key: "delegate", label: "Delegate", desc: "위임 · 비중요·긴급", color: Q_TONE.tertiary, text: Q_TEXT.tertiary },
                // top-right: 중요 × 긴급 = Do
                { key: "do_now", label: "Do", desc: "즉시 실행 · 중요·긴급", color: Q_TONE.primary, text: Q_TEXT.primary },
                // bottom-left: 비중요 × 비긴급 = Eliminate
                { key: "eliminate", label: "Eliminate", desc: "제거 · 비중요·비긴급", color: Q_TONE.muted, text: Q_TEXT.muted },
                // bottom-right: 중요 × 비긴급 = Schedule
                { key: "schedule_it", label: "Schedule", desc: "계획 · 중요·비긴급", color: Q_TONE.secondary, text: Q_TEXT.secondary },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

function PestGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "political",     label: "Political",     sub: "정치·법률·규제",   tone: "primary"   as const },
        { key: "economic",      label: "Economic",      sub: "경제·금리·환율",   tone: "secondary" as const },
        { key: "social",        label: "Social",        sub: "사회·문화·인구",   tone: "tertiary"  as const },
        { key: "technological", label: "Technological", sub: "기술·혁신",         tone: "muted"     as const },
    ];
    return (
        <div className="my-3 grid grid-cols-2 gap-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[c.tone]} transition-shadow hover:shadow-sm`}>
                    <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[c.tone]}`}>{c.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                </div>
            ))}
        </div>
    );
}

function MoscowGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // 우선순위 4단계 — 의미 강도에 따라 톤 그라데이션
    const cells = [
        { key: "must",   label: "Must have",   sub: "반드시 포함 · 핵심 요건",  tone: "primary"   as const },
        { key: "should", label: "Should have", sub: "가능하면 포함 · 권장",      tone: "secondary" as const },
        { key: "could",  label: "Could have",  sub: "있으면 좋음 · 옵션",        tone: "tertiary"  as const },
        { key: "wont",   label: "Won't have",  sub: "이번엔 제외 · 차기 검토",  tone: "muted"     as const },
    ];
    return (
        <div className="my-3 space-y-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-md p-3 ${Q_TONE[c.tone]} transition-shadow hover:shadow-sm`}>
                    <div className="flex items-baseline justify-between">
                        <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[c.tone]}`}>{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider">{c.sub}</p>
                    </div>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="항목들을 줄바꿈으로 나열…" />
                </div>
            ))}
        </div>
    );
}

function QuadrantBlankGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const axisX = data["q_axis_x"] ?? "";
    const axisY = data["q_axis_y"] ?? "";
    // 표준 데카르트 좌표: 1사분면=X+Y+ (오른쪽 위), 2사분면=X-Y+ (왼쪽 위),
    //                    3사분면=X-Y- (왼쪽 아래), 4사분면=X+Y- (오른쪽 아래)
    return (
        <div className="my-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">X축 라벨</span>
                    <input
                        type="text"
                        value={axisX}
                        onChange={e => onChange("q_axis_x", e.target.value)}
                        placeholder="예: 중요도, 비용, 난이도…"
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                    />
                </label>
                <label className="block">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Y축 라벨</span>
                    <input
                        type="text"
                        value={axisY}
                        onChange={e => onChange("q_axis_y", e.target.value)}
                        placeholder="예: 긴급도, 가치, 노력…"
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                    />
                </label>
            </div>
            <QuadrantGrid
                axisX={axisX || "X축"} axisXLow="Low" axisXHigh="High"
                axisY={axisY || "Y축"} axisYHigh="High" axisYLow="Low"
                quads={[
                    // top-left: 2사분면 (X-, Y+)
                    { key: "q2", label: "Quadrant II", desc: "X−, Y+ · 좌상", color: Q_TONE.secondary, text: Q_TEXT.secondary },
                    // top-right: 1사분면 (X+, Y+)
                    { key: "q1", label: "Quadrant I", desc: "X+, Y+ · 우상", color: Q_TONE.primary, text: Q_TEXT.primary },
                    // bottom-left: 3사분면 (X-, Y-)
                    { key: "q3", label: "Quadrant III", desc: "X−, Y− · 좌하", color: Q_TONE.muted, text: Q_TEXT.muted },
                    // bottom-right: 4사분면 (X+, Y-)
                    { key: "q4", label: "Quadrant IV", desc: "X+, Y− · 우하", color: Q_TONE.tertiary, text: Q_TEXT.tertiary },
                ]}
                data={data}
                onChange={onChange}
            />
        </div>
    );
}

function BmcGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const block = "rounded-lg p-2 border flex flex-col";
    const head = "text-[10px] font-bold";
    const sub = "text-[9px] text-neutral-400";
    return (
        <div className="my-2 space-y-1 overflow-x-auto">
            {/* 상단 5열 */}
            <div className="grid grid-cols-5 gap-1 min-w-[520px]">
                <div className={`${block} bg-slate-50 border-slate-200 min-h-48`}>
                    <p className={`${head} text-slate-800`}>Key Partners</p>
                    <p className={sub}>핵심 파트너</p>
                    <CellTextarea cellKey="bmc_key_partners" value={data["bmc_key_partners"] ?? ""} onChange={onChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`${block} bg-slate-50 border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-800`}>Key Activities</p>
                        <p className={sub}>핵심 활동</p>
                        <CellTextarea cellKey="bmc_key_activities" value={data["bmc_key_activities"] ?? ""} onChange={onChange} />
                    </div>
                    <div className={`${block} bg-white border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-600`}>Key Resources</p>
                        <p className={sub}>핵심 자원</p>
                        <CellTextarea cellKey="bmc_key_resources" value={data["bmc_key_resources"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                <div className={`${block} bg-stone-50 border-stone-300 min-h-48`}>
                    <p className={`${head} text-stone-800`}>Value Propositions</p>
                    <p className={sub}>가치 제안</p>
                    <CellTextarea cellKey="bmc_value_propositions" value={data["bmc_value_propositions"] ?? ""} onChange={onChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`${block} bg-slate-50 border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-stone-700`}>Customer Relationships</p>
                        <p className={sub}>고객 관계</p>
                        <CellTextarea cellKey="bmc_customer_relationships" value={data["bmc_customer_relationships"] ?? ""} onChange={onChange} />
                    </div>
                    <div className={`${block} bg-white border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-700`}>Channels</p>
                        <p className={sub}>채널</p>
                        <CellTextarea cellKey="bmc_channels" value={data["bmc_channels"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                <div className={`${block} bg-slate-50 border-slate-300 min-h-48`}>
                    <p className={`${head} text-slate-900`}>Customer Segments</p>
                    <p className={sub}>고객 세그먼트</p>
                    <CellTextarea cellKey="bmc_customer_segments" value={data["bmc_customer_segments"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* 하단 2열 */}
            <div className="grid grid-cols-2 gap-1 min-w-[520px]">
                <div className={`${block} bg-neutral-100 border-neutral-200 min-h-16`}>
                    <p className={`${head} text-neutral-600`}>Cost Structure</p>
                    <p className={sub}>비용 구조</p>
                    <CellTextarea cellKey="bmc_cost_structure" value={data["bmc_cost_structure"] ?? ""} onChange={onChange} />
                </div>
                <div className={`${block} bg-slate-50 border-slate-300 min-h-16`}>
                    <p className={`${head} text-slate-800`}>Revenue Streams</p>
                    <p className={sub}>수익 흐름</p>
                    <CellTextarea cellKey="bmc_revenue_streams" value={data["bmc_revenue_streams"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

function VpcGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 grid md:grid-cols-2 gap-3">
            {/* 좌: Value Map (사각형) */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-700">
                <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Value Map · 가치 제안 맵</p>
                <div className="space-y-2">
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-900">Products &amp; Services</p>
                        <p className="text-[9px] text-neutral-400">제품·서비스</p>
                        <CellTextarea cellKey="vpc_products" value={data["vpc_products"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-800">Gain Creators</p>
                        <p className="text-[9px] text-neutral-400">이득 창출</p>
                        <CellTextarea cellKey="vpc_gain_creators" value={data["vpc_gain_creators"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200">
                        <p className="text-[10px] font-bold text-stone-700">Pain Relievers</p>
                        <p className="text-[9px] text-neutral-400">고통 해소</p>
                        <CellTextarea cellKey="vpc_pain_relievers" value={data["vpc_pain_relievers"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
            {/* 우: Customer Profile (원형 느낌) */}
            <div className="rounded-full p-3 bg-stone-50 border-2 border-stone-400 md:rounded-xl">
                <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Customer Profile · 고객 프로필</p>
                <div className="space-y-2">
                    <div className="rounded-lg p-2 bg-white border border-stone-200">
                        <p className="text-[10px] font-bold text-stone-800">Customer Jobs</p>
                        <p className="text-[9px] text-neutral-400">고객 과업</p>
                        <CellTextarea cellKey="vpc_customer_jobs" value={data["vpc_customer_jobs"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-800">Gains</p>
                        <p className="text-[9px] text-neutral-400">이득·기대</p>
                        <CellTextarea cellKey="vpc_gains" value={data["vpc_gains"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200">
                        <p className="text-[10px] font-bold text-stone-700">Pains</p>
                        <p className="text-[9px] text-neutral-400">고통·장애물</p>
                        <CellTextarea cellKey="vpc_pains" value={data["vpc_pains"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function OkrGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const krKeys = ["okr_kr1", "okr_kr2", "okr_kr3", "okr_kr4", "okr_kr5"];
    return (
        <div className="my-2 space-y-2">
            {/* Objective */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Objective · 목표</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">큰 방향. 정성적·영감적. "~를 달성한다"</p>
                <textarea
                    value={data["okr_objective"] ?? ""}
                    onChange={e => onChange("okr_objective", e.target.value)}
                    placeholder="예: 고객이 첫 접속 15분 안에 가치를 느끼게 한다"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none p-2 rounded border border-stone-200 leading-relaxed"
                />
            </div>
            {/* Key Results */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-300">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-2">Key Results · 핵심 결과 (측정 가능)</p>
                <div className="space-y-1.5">
                    {krKeys.map((k, i) => (
                        <div key={k} className="flex items-start gap-2">
                            <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-slate-200 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                                {i + 1}
                            </span>
                            <input
                                type="text"
                                value={data[k] ?? ""}
                                onChange={e => onChange(k, e.target.value)}
                                placeholder={i < 3 ? "예: 주간 활성 사용자 1만 → 3만 달성" : "(선택) 추가 KR"}
                                className="flex-1 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-700"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Initiatives */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Initiatives · 실행 계획</p>
                <CellTextarea cellKey="okr_initiatives" value={data["okr_initiatives"] ?? ""} onChange={onChange} placeholder="- 각 KR을 달성할 구체적 행동…" />
            </div>
        </div>
    );
}

function PersonaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-3">
            {/* 프로필 헤더 */}
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-14 h-14 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center text-2xl">
                        
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <input
                            type="text"
                            value={data["persona_name"] ?? ""}
                            onChange={e => onChange("persona_name", e.target.value)}
                            placeholder="이름 (예: 김개발)"
                            className="w-full px-2 py-1 text-sm font-bold bg-white/70 border border-slate-200 rounded focus:outline-none focus:border-slate-700"
                        />
                        <div className="grid grid-cols-3 gap-1">
                            <input type="text" value={data["persona_age"] ?? ""} onChange={e => onChange("persona_age", e.target.value)} placeholder="나이" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                            <input type="text" value={data["persona_occupation"] ?? ""} onChange={e => onChange("persona_occupation", e.target.value)} placeholder="직업" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                            <input type="text" value={data["persona_location"] ?? ""} onChange={e => onChange("persona_location", e.target.value)} placeholder="지역" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                        </div>
                        <input
                            type="text"
                            value={data["persona_bio"] ?? ""}
                            onChange={e => onChange("persona_bio", e.target.value)}
                            placeholder="한줄 소개"
                            className="w-full px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            {/* 4분면 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-24">
                    <p className="text-xs font-bold text-slate-900">Goals · 목표</p>
                    <CellTextarea cellKey="persona_goals" value={data["persona_goals"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-24">
                    <p className="text-xs font-bold text-stone-700">Frustrations · 좌절</p>
                    <CellTextarea cellKey="persona_frustrations" value={data["persona_frustrations"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-24">
                    <p className="text-xs font-bold text-stone-800">Motivations · 동기</p>
                    <CellTextarea cellKey="persona_motivations" value={data["persona_motivations"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-24">
                    <p className="text-xs font-bold text-slate-800">Behaviors · 행동</p>
                    <CellTextarea cellKey="persona_behaviors" value={data["persona_behaviors"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* Quote */}
            <div className="rounded-xl p-3 bg-neutral-50 border-l-4 border-neutral-400">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">대표 발언 (Quote)</p>
                <textarea
                    value={data["persona_quote"] ?? ""}
                    onChange={e => onChange("persona_quote", e.target.value)}
                    placeholder='예: "그냥 빠르게 쓰고 싶어요. 설정이 너무 많으면 지쳐요."'
                    rows={2}
                    className="w-full mt-1 resize-none bg-transparent text-xs italic text-neutral-700 placeholder:text-neutral-400 focus:outline-none leading-relaxed"
                />
            </div>
        </div>
    );
}

function JtbdGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* JTBD 한 문장 */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">JTBD Statement · 한 문장 정의</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">"[상황]일 때, 나는 [동기]하고 싶다, 그래서 [결과]를 얻고 싶다"</p>
                <textarea
                    value={data["jtbd_statement"] ?? ""}
                    onChange={e => onChange("jtbd_statement", e.target.value)}
                    placeholder="예: 출근길에 집중할 음악이 필요할 때, 고르느라 시간 쓰지 않고 시작하고 싶다"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none p-2 rounded border border-slate-200 leading-relaxed"
                />
            </div>
            {/* 3단 구조 */}
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-28">
                    <p className="text-xs font-bold text-slate-800">Situation</p>
                    <p className="text-[10px] text-neutral-500">언제·어디서·왜</p>
                    <CellTextarea cellKey="jtbd_situation" value={data["jtbd_situation"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-28">
                    <p className="text-xs font-bold text-stone-800">Motivation</p>
                    <p className="text-[10px] text-neutral-500">무엇을 하고 싶나</p>
                    <CellTextarea cellKey="jtbd_motivation" value={data["jtbd_motivation"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-28">
                    <p className="text-xs font-bold text-slate-900">Outcome</p>
                    <p className="text-[10px] text-neutral-500">어떤 결과를 원하나</p>
                    <CellTextarea cellKey="jtbd_outcome" value={data["jtbd_outcome"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* 장벽 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-20">
                    <p className="text-xs font-bold text-stone-700">Anxieties · 불안</p>
                    <CellTextarea cellKey="jtbd_anxieties" value={data["jtbd_anxieties"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-20">
                    <p className="text-xs font-bold text-neutral-600">Habits · 기존 대안</p>
                    <CellTextarea cellKey="jtbd_habits" value={data["jtbd_habits"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

type RiceItem = { name: string; reach: number; impact: number; confidence: number; effort: number };

function RiceGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const items: RiceItem[] = (() => {
        try { return data["rice_items"] ? JSON.parse(data["rice_items"]) : []; }
        catch { return []; }
    })();
    const ensureMin = items.length === 0 ? [{ name: "", reach: 0, impact: 1, confidence: 100, effort: 1 }] : items;

    const save = (next: RiceItem[]) => onChange("rice_items", JSON.stringify(next));
    const update = (idx: number, patch: Partial<RiceItem>) => {
        const next = [...ensureMin];
        next[idx] = { ...next[idx], ...patch };
        save(next);
    };
    const add = () => save([...ensureMin, { name: "", reach: 0, impact: 1, confidence: 100, effort: 1 }]);
    const remove = (idx: number) => save(ensureMin.filter((_, i) => i !== idx));

    const score = (it: RiceItem) => it.effort > 0 ? (it.reach * it.impact * it.confidence / 100) / it.effort : 0;
    const sorted = [...ensureMin].map((it, i) => ({ it, i, s: score(it) })).sort((a, b) => b.s - a.s);

    return (
        <div className="my-2 space-y-2">
            <div className="text-[10px] text-neutral-500 leading-relaxed px-1">
                <strong>Score = (Reach × Impact × Confidence%) ÷ Effort</strong> · Impact 1~3(미미·보통·대박), Confidence 0~100%, Effort 인-월(PM)
            </div>
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left w-8">#</th>
                            <th className="px-2 py-2 text-left">항목</th>
                            <th className="px-2 py-2 text-center w-16">Reach</th>
                            <th className="px-2 py-2 text-center w-16">Impact</th>
                            <th className="px-2 py-2 text-center w-20">Conf %</th>
                            <th className="px-2 py-2 text-center w-16">Effort</th>
                            <th className="px-2 py-2 text-right w-20">Score</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ensureMin.map((it, idx) => {
                            const s = score(it);
                            const rank = sorted.findIndex(x => x.i === idx) + 1;
                            const isTop = rank === 1 && s > 0;
                            return (
                                <tr key={idx} className={`border-t border-neutral-100 ${isTop ? "bg-slate-50" : ""}`}>
                                    <td className="px-2 py-1.5 text-neutral-400 text-[10px]">{isTop ? <span className="text-slate-900 font-bold">★</span> : rank}</td>
                                    <td className="px-2 py-1.5">
                                        <input type="text" value={it.name} onChange={e => update(idx, { name: e.target.value })}
                                            placeholder="기능·아이디어"
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0} value={it.reach} onChange={e => update(idx, { reach: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <select value={it.impact} onChange={e => update(idx, { impact: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                                            <option value={0.25}>0.25</option><option value={0.5}>0.5</option>
                                            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0} max={100} value={it.confidence} onChange={e => update(idx, { confidence: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0.5} step={0.5} value={it.effort} onChange={e => update(idx, { effort: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className={`px-2 py-1.5 text-right font-mono font-bold ${isTop ? "text-slate-900" : s > 0 ? "text-neutral-700" : "text-neutral-300"}`}>
                                        {s > 0 ? s.toFixed(1) : "—"}
                                    </td>
                                    <td className="px-1 text-center">
                                        {ensureMin.length > 1 && (
                                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 항목 추가
            </button>
        </div>
    );
}

function FiveW1HGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "who", label: "Who", sub: "누가", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "what", label: "What", sub: "무엇을", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "when", label: "When", sub: "언제", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "where", label: "Where", sub: "어디서", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "why", label: "Why", sub: "왜", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
        { key: "how", label: "How", sub: "어떻게", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 grid grid-cols-3 gap-1.5">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-28`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <p className="text-[10px] text-neutral-400">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                </div>
            ))}
        </div>
    );
}

function FiveWhyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const whys = [1, 2, 3, 4, 5];
    return (
        <div className="my-2 space-y-2">
            {/* Problem */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-300">
                <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Problem · 문제 정의</p>
                <textarea value={data["why_problem"] ?? ""} onChange={e => onChange("why_problem", e.target.value)}
                    placeholder="무엇이 일어났나?" rows={2}
                    className="w-full mt-1.5 resize-none bg-white/60 text-xs p-2 rounded border border-slate-200 focus:outline-none leading-relaxed" />
            </div>
            {/* 5 Whys ladder */}
            <div className="space-y-1.5">
                {whys.map((n, i) => {
                    const key = `why_${n}`;
                    const prev = i === 0 ? data["why_problem"] : data[`why_${n - 1}`];
                    const hasPrev = (prev ?? "").trim().length > 0;
                    return (
                        <div key={key} className="flex items-start gap-2">
                            <div className="shrink-0 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${hasPrev ? "bg-slate-200 text-slate-900 border-2 border-slate-700" : "bg-neutral-100 text-neutral-400 border border-neutral-200"}`}>
                                    Why<br/>{n}
                                </div>
                                {n < 5 && <div className={`w-px flex-1 ${hasPrev ? "bg-slate-400" : "bg-neutral-200"} my-1`} style={{ minHeight: 12 }} />}
                            </div>
                            <div className={`flex-1 rounded-lg p-2 border ${hasPrev ? "bg-stone-50 border-stone-200" : "bg-neutral-50 border-neutral-200"}`}>
                                <p className="text-[10px] text-neutral-500">왜 그럴까?</p>
                                <textarea value={data[key] ?? ""} onChange={e => onChange(key, e.target.value)}
                                    placeholder={hasPrev ? `${n}번째 '왜'에 대한 답…` : "이전 단계를 먼저 채워주세요"}
                                    disabled={!hasPrev} rows={2}
                                    className="w-full mt-0.5 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed disabled:opacity-50" />
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Root + Countermeasure */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Root Cause · 근본 원인</p>
                    <CellTextarea cellKey="why_root" value={data["why_root"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300">
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Countermeasure · 대응책</p>
                    <CellTextarea cellKey="why_countermeasure" value={data["why_countermeasure"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

function IkigaiGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 4대 원 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-stone-700">LOVE · 좋아하는 것</p>
                    <CellTextarea cellKey="ikigai_love" value={data["ikigai_love"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-slate-800">GOOD AT · 잘하는 것</p>
                    <CellTextarea cellKey="ikigai_good" value={data["ikigai_good"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-2xl p-3 bg-stone-50 border-2 border-stone-300">
                    <p className="text-xs font-bold text-stone-800">WORLD NEEDS · 세상이 필요로 하는 것</p>
                    <CellTextarea cellKey="ikigai_needs" value={data["ikigai_needs"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-700">
                    <p className="text-xs font-bold text-slate-900">PAID FOR · 돈이 되는 것</p>
                    <CellTextarea cellKey="ikigai_paid" value={data["ikigai_paid"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* 교집합 4개 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-stone-700">Passion · Love × Good at</p>
                    <CellTextarea cellKey="ikigai_passion" value={data["ikigai_passion"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-2 bg-slate-50 border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-800">Mission · Love × Needs</p>
                    <CellTextarea cellKey="ikigai_mission" value={data["ikigai_mission"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-800">Profession · Good at × Paid</p>
                    <CellTextarea cellKey="ikigai_profession" value={data["ikigai_profession"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-300">
                    <p className="text-[10px] font-bold text-slate-900">Vocation · Needs × Paid</p>
                    <CellTextarea cellKey="ikigai_vocation" value={data["ikigai_vocation"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* Core */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-700">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider text-center">IKIGAI · 삶의 이유 (4가지 교집합)</p>
                <textarea value={data["ikigai_core"] ?? ""} onChange={e => onChange("ikigai_core", e.target.value)}
                    placeholder="4가지가 겹치는 지점. 내가 존재하는 이유."
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-sm p-2 rounded border border-stone-300 focus:outline-none text-center font-medium leading-relaxed" />
            </div>
        </div>
    );
}

function Porter5Grid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cellClass = "rounded-lg p-2.5 border min-h-20";
    return (
        <div className="my-2 grid grid-cols-3 gap-2">
            <div />
            <div className={`${cellClass} bg-slate-50 border-slate-200`}>
                <p className="text-[10px] font-bold text-slate-800">New Entrants</p>
                <p className="text-[9px] text-neutral-400">신규 진입</p>
                <CellTextarea cellKey="p5_new_entrants" value={data["p5_new_entrants"] ?? ""} onChange={onChange} />
            </div>
            <div />

            <div className={`${cellClass} bg-slate-50 border-slate-200`}>
                <p className="text-[10px] font-bold text-slate-800">Suppliers</p>
                <p className="text-[9px] text-neutral-400">공급자 협상력</p>
                <CellTextarea cellKey="p5_suppliers" value={data["p5_suppliers"] ?? ""} onChange={onChange} />
            </div>
            <div className={`${cellClass} bg-slate-100 border-2 border-slate-700`}>
                <p className="text-[10px] font-bold text-slate-900">Rivalry</p>
                <p className="text-[9px] text-neutral-500">기존 경쟁</p>
                <CellTextarea cellKey="p5_rivalry" value={data["p5_rivalry"] ?? ""} onChange={onChange} />
            </div>
            <div className={`${cellClass} bg-slate-50 border-slate-300`}>
                <p className="text-[10px] font-bold text-slate-900">Buyers </p>
                <p className="text-[9px] text-neutral-400">구매자 협상력</p>
                <CellTextarea cellKey="p5_buyers" value={data["p5_buyers"] ?? ""} onChange={onChange} />
            </div>

            <div />
            <div className={`${cellClass} bg-stone-50 border-stone-200`}>
                <p className="text-[10px] font-bold text-stone-800">Substitutes</p>
                <p className="text-[9px] text-neutral-400">대체재</p>
                <CellTextarea cellKey="p5_substitutes" value={data["p5_substitutes"] ?? ""} onChange={onChange} />
            </div>
            <div />
        </div>
    );
}

function ScamperGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "scamper_s", letter: "S", label: "Substitute", sub: "무엇으로 대체할까?", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
        { key: "scamper_c", letter: "C", label: "Combine", sub: "무엇과 결합할까?", color: "bg-stone-50 border-stone-200", text: "text-stone-700" },
        { key: "scamper_a", letter: "A", label: "Adapt", sub: "무엇에 응용할까?", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "scamper_m", letter: "M", label: "Modify", sub: "변형·확대·축소?", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "scamper_p", letter: "P", label: "Put to other use", sub: "다른 용도는?", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "scamper_e", letter: "E", label: "Eliminate", sub: "무엇을 제거할까?", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "scamper_r", letter: "R", label: "Reverse", sub: "역발상·재배치?", color: "bg-neutral-100 border-neutral-200", text: "text-neutral-700" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color} flex items-start gap-3`}>
                    <div className={`shrink-0 w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center font-bold ${c.text}`}>
                        {c.letter}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500">{c.sub}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function KanoGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "kano_attractive", label: "Attractive · 감동 품질", sub: "있으면 매우 만족, 없어도 불만 아님", emoji: "", color: "bg-slate-50 border-slate-400", text: "text-slate-900" },
        { key: "kano_performance", label: "One-dimensional · 성과 품질", sub: "많을수록 만족, 적을수록 불만", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-800" },
        { key: "kano_must", label: "Must-be · 당연한 품질", sub: "있으면 당연, 없으면 극도 불만", emoji: "", color: "bg-stone-50 border-stone-300", text: "text-stone-800" },
        { key: "kano_indifferent", label: "Indifferent · 무관심", sub: "있어도 없어도 상관없음", emoji: "", color: "bg-neutral-100 border-neutral-300", text: "text-neutral-600" },
        { key: "kano_reverse", label: "Reverse · 역품질", sub: "있을수록 불만, 없을수록 만족", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color}`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <p className="text-[10px] text-neutral-500">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="해당하는 기능·속성을 줄바꿈으로 나열…" />
                </div>
            ))}
        </div>
    );
}

type ParetoItem = { name: string; value: number };
function ParetoGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const items: ParetoItem[] = (() => {
        try { return data["pareto_items"] ? JSON.parse(data["pareto_items"]) : []; }
        catch { return []; }
    })();
    const ensureMin = items.length === 0 ? [{ name: "", value: 0 }] : items;
    const save = (next: ParetoItem[]) => onChange("pareto_items", JSON.stringify(next));
    const update = (idx: number, patch: Partial<ParetoItem>) => {
        const next = [...ensureMin]; next[idx] = { ...next[idx], ...patch }; save(next);
    };
    const add = () => save([...ensureMin, { name: "", value: 0 }]);
    const remove = (idx: number) => save(ensureMin.filter((_, i) => i !== idx));

    const sorted = [...ensureMin].filter(x => x.value > 0).sort((a, b) => b.value - a.value);
    const total = sorted.reduce((s, x) => s + x.value, 0) || 1;
    const maxVal = sorted[0]?.value || 1;

    let cum = 0;
    const rows = sorted.map((it) => {
        cum += it.value;
        return { ...it, pct: it.value / total * 100, cumPct: cum / total * 100, barPct: it.value / maxVal * 100 };
    });

    return (
        <div className="my-2 space-y-3">
            <div className="text-[10px] text-neutral-500 px-1">
                <strong>80/20 파레토</strong> · 상위 20% 항목이 80%의 결과를 만든다
            </div>
            {/* 입력 테이블 */}
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="flex-1">항목</span>
                    <span className="w-24 text-right">값</span>
                    <span className="w-6"></span>
                </div>
                {ensureMin.map((it, idx) => (
                    <div key={idx} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <input type="text" value={it.name} onChange={e => update(idx, { name: e.target.value })}
                            placeholder="항목명"
                            className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        <input type="number" min={0} value={it.value} onChange={e => update(idx, { value: +e.target.value })}
                            className="w-24 px-2 py-1 text-xs text-right bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {ensureMin.length > 1 && (
                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 항목 추가
            </button>
            {/* 시각화 */}
            {rows.length > 0 && (
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2">시각화 (내림차순 + 누적%)</p>
                    {rows.map((r, i) => {
                        const isVital = r.cumPct <= 80;
                        return (
                            <div key={i} className="space-y-0.5">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="w-4 text-neutral-400">{i + 1}</span>
                                    <span className="flex-1 truncate font-medium">{r.name}</span>
                                    <span className={`tabular-nums ${isVital ? "text-slate-900 font-bold" : "text-neutral-500"}`}>{r.pct.toFixed(1)}%</span>
                                    <span className="w-14 text-right text-neutral-400 tabular-nums">누적 {r.cumPct.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isVital ? "bg-slate-900" : "bg-neutral-400"}`} style={{ width: `${r.barPct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-[10px] text-slate-700 mt-2 pt-2 border-t border-neutral-200">
                        <strong>Vital Few (누적 80% 이내)</strong> — 여기에 집중하세요.
                    </p>
                </div>
            )}
        </div>
    );
}

function FishboneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const bones = [
        { key: "fish_people", label: "People · 사람", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "fish_process", label: "Process · 프로세스", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "fish_technology", label: "Technology · 기술", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "fish_environment", label: "Environment · 환경", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-800" },
        { key: "fish_materials", label: "Materials · 자원", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "fish_measurement", label: "Measurement · 측정", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* Problem head */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400 relative">
                <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Problem · 문제 (물고기 머리)</p>
                        <textarea value={data["fish_problem"] ?? ""} onChange={e => onChange("fish_problem", e.target.value)}
                            placeholder="해결하려는 문제를 한 문장으로…"
                            rows={1}
                            className="w-full mt-1 resize-none bg-white/60 text-sm p-1.5 rounded border border-slate-200 focus:outline-none" />
                    </div>
                </div>
            </div>
            {/* 6 bones */}
            <div className="grid grid-cols-2 gap-2">
                {bones.map(b => (
                    <div key={b.key} className={`rounded-lg p-3 border ${b.color} min-h-24`}>
                        <p className={`text-xs font-bold ${b.text}`}>{b.label}</p>
                        <CellTextarea cellKey={b.key} value={data[b.key] ?? ""} onChange={onChange} placeholder="원인들을 줄바꿈으로…" />
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-neutral-400 text-center">각 카테고리별로 "왜?"를 여러 번 물어 하위 원인을 내려가보세요.</p>
        </div>
    );
}

type JourneyStage = { stage: string; action: string; thought: string; emotion: string; opportunity: string };
function JourneyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: JourneyStage[] = [
        { stage: "Awareness · 인지", action: "", thought: "", emotion: "", opportunity: "" },
        { stage: "Consideration · 고려", action: "", thought: "", emotion: "", opportunity: "" },
        { stage: "Purchase · 구매", action: "", thought: "", emotion: "", opportunity: "" },
        { stage: "Retention · 유지", action: "", thought: "", emotion: "", opportunity: "" },
        { stage: "Advocacy · 추천", action: "", thought: "", emotion: "", opportunity: "" },
    ];
    const stages: JourneyStage[] = (() => {
        try {
            const parsed = data["journey_stages"] ? JSON.parse(data["journey_stages"]) : null;
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: JourneyStage[]) => onChange("journey_stages", JSON.stringify(next));
    const update = (idx: number, patch: Partial<JourneyStage>) => {
        const next = [...stages]; next[idx] = { ...next[idx], ...patch }; save(next);
    };
    const add = () => save([...stages, { stage: "새 단계", action: "", thought: "", emotion: "", opportunity: "" }]);
    const remove = (idx: number) => save(stages.filter((_, i) => i !== idx));

    return (
        <div className="my-2 space-y-3">
            {/* Persona */}
            <div className="rounded-lg p-3 bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Persona · 대상 고객</p>
                <input type="text" value={data["journey_persona"] ?? ""} onChange={e => onChange("journey_persona", e.target.value)}
                    placeholder="여정을 그릴 고객의 프로필"
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-700" />
            </div>
            {/* Stage table */}
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs" style={{ minWidth: 640 }}>
                    <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left w-40">단계</th>
                            <th className="px-2 py-2 text-left">행동</th>
                            <th className="px-2 py-2 text-left">생각</th>
                            <th className="px-2 py-2 text-center w-16">감정</th>
                            <th className="px-2 py-2 text-left">개선 기회</th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stages.map((s, idx) => (
                            <tr key={idx} className="border-t border-neutral-100 align-top">
                                <td className="px-2 py-2">
                                    <input type="text" value={s.stage} onChange={e => update(idx, { stage: e.target.value })}
                                        className="w-full px-1.5 py-1 text-xs font-semibold bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.action} onChange={e => update(idx, { action: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.thought} onChange={e => update(idx, { thought: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <input type="text" value={s.emotion} onChange={e => update(idx, { emotion: e.target.value })}
                                        className="w-full px-1 py-1 text-center text-base bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.opportunity} onChange={e => update(idx, { opportunity: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:border-slate-700" />
                                </td>
                                <td className="px-1 py-2 text-center">
                                    {stages.length > 1 && (
                                        <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 단계 추가
            </button>
        </div>
    );
}

function KptGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "kpt_keep", label: "Keep", sub: "잘한 것 · 계속할 것", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "kpt_problem", label: "Problem", sub: "문제 · 개선할 것", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
        { key: "kpt_try", label: "Try", sub: "새로 시도할 것", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
    ];
    return (
        <div className="my-2 grid md:grid-cols-3 gap-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-40`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <p className="text-[10px] text-neutral-500">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="항목을 줄바꿈으로 나열…" />
                </div>
            ))}
        </div>
    );
}

function OodaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "ooda_observe", label: "Observe", sub: "관찰 · 무엇이 일어나고 있나", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "ooda_orient", label: "Orient", sub: "방향 설정 · 맥락·가정 점검", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "ooda_decide", label: "Decide", sub: "결정 · 어떻게 움직일까", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "ooda_act", label: "Act", sub: "실행 · 그리고 다시 관찰", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className="flex items-start gap-2">
                    <div className="shrink-0 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>
                            {i + 1}
                        </div>
                        {i < 3 && <div className="w-px flex-1 bg-neutral-300 my-1" style={{ minHeight: 20 }} />}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 border ${s.color}`}>
                        <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                        <p className="text-[10px] text-neutral-500">{s.sub}</p>
                        <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} />
                    </div>
                </div>
            ))}
            <p className="text-[10px] text-neutral-400 text-center pt-1">⟳ 반복되는 루프 — Act 후 다시 Observe로</p>
        </div>
    );
}

function CornellGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 rounded-lg border-2 border-neutral-300 overflow-hidden bg-white">
            {/* Top: Cue (left) + Notes (right) */}
            <div className="grid grid-cols-[1fr_2fr]">
                <div className="border-r border-neutral-300 bg-stone-50 p-3">
                    <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Cue</p>
                    <p className="text-[9px] text-neutral-500">핵심 키워드 · 질문</p>
                    <textarea value={data["cornell_cue"] ?? ""} onChange={e => onChange("cornell_cue", e.target.value)}
                        placeholder="핵심 키워드들…" rows={10}
                        className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                </div>
                <div className="bg-white p-3">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Notes</p>
                    <p className="text-[9px] text-neutral-500">수업·강의·독서 내용</p>
                    <textarea value={data["cornell_notes"] ?? ""} onChange={e => onChange("cornell_notes", e.target.value)}
                        placeholder="본 내용을 자유롭게…" rows={10}
                        className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                </div>
            </div>
            {/* Bottom: Summary */}
            <div className="border-t-2 border-neutral-300 bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Summary</p>
                <p className="text-[9px] text-neutral-500">요약 · 종합 — 내 언어로 다시 쓰기</p>
                <textarea value={data["cornell_summary"] ?? ""} onChange={e => onChange("cornell_summary", e.target.value)}
                    placeholder="오늘 배운 것을 한 단락으로 요약…" rows={4}
                    className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

type DmCriterion = { name: string; weight: number };
type DmOption = { name: string; scores: number[] };
function DecisionMatrixGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT = { criteria: [{ name: "기준 1", weight: 3 }, { name: "기준 2", weight: 2 }], options: [{ name: "옵션 A", scores: [0, 0] }, { name: "옵션 B", scores: [0, 0] }] };
    const parsed: { criteria: DmCriterion[]; options: DmOption[] } = (() => {
        try {
            const p = data["dm_options"] ? JSON.parse(data["dm_options"]) : null;
            return p && Array.isArray(p.criteria) && Array.isArray(p.options) ? p : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: typeof parsed) => onChange("dm_options", JSON.stringify(next));

    const updateCriterion = (i: number, patch: Partial<DmCriterion>) => {
        const next = { ...parsed, criteria: [...parsed.criteria] };
        next.criteria[i] = { ...next.criteria[i], ...patch };
        save(next);
    };
    const updateOption = (i: number, patch: Partial<DmOption>) => {
        const next = { ...parsed, options: [...parsed.options] };
        next.options[i] = { ...next.options[i], ...patch };
        save(next);
    };
    const updateScore = (optIdx: number, crIdx: number, val: number) => {
        const next = { ...parsed, options: [...parsed.options] };
        const scores = [...(next.options[optIdx].scores || [])];
        while (scores.length < parsed.criteria.length) scores.push(0);
        scores[crIdx] = val;
        next.options[optIdx] = { ...next.options[optIdx], scores };
        save(next);
    };
    const addCriterion = () => save({ ...parsed, criteria: [...parsed.criteria, { name: "새 기준", weight: 1 }], options: parsed.options.map(o => ({ ...o, scores: [...o.scores, 0] })) });
    const removeCriterion = (i: number) => save({ ...parsed, criteria: parsed.criteria.filter((_, x) => x !== i), options: parsed.options.map(o => ({ ...o, scores: o.scores.filter((_, x) => x !== i) })) });
    const addOption = () => save({ ...parsed, options: [...parsed.options, { name: "새 옵션", scores: parsed.criteria.map(() => 0) }] });
    const removeOption = (i: number) => save({ ...parsed, options: parsed.options.filter((_, x) => x !== i) });

    const totals = parsed.options.map(op => op.scores.reduce((s, v, i) => s + (v * (parsed.criteria[i]?.weight ?? 1)), 0));
    const maxTotal = Math.max(...totals, 1);
    const rank = (i: number) => [...totals].map((t, idx) => ({ t, idx })).sort((a, b) => b.t - a.t).findIndex(x => x.idx === i) + 1;

    return (
        <div className="my-2 space-y-2">
            <p className="text-[10px] text-neutral-500 px-1">
                <strong>기준 가중치 × 옵션 점수</strong> — 점수는 1~5 (높을수록 유리). 총점 = Σ(점수 × 가중치)
            </p>
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-[10px] text-neutral-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left">옵션 ↓ / 기준 →</th>
                            {parsed.criteria.map((c, i) => (
                                <th key={i} className="px-2 py-2 text-center">
                                    <input type="text" value={c.name} onChange={e => updateCriterion(i, { name: e.target.value })}
                                        className="w-24 text-center font-semibold bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-500 focus:outline-none" />
                                    <div className="flex items-center gap-1 justify-center mt-1 text-[9px] text-neutral-400 normal-case">
                                        w
                                        <input type="number" min={1} max={9} value={c.weight} onChange={e => updateCriterion(i, { weight: +e.target.value })}
                                            className="w-8 text-center px-1 py-0.5 bg-white border border-neutral-200 rounded text-xs" />
                                        {parsed.criteria.length > 1 && (
                                            <button onClick={() => removeCriterion(i)} className="text-neutral-300 hover:text-slate-700 text-xs">×</button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-2 py-2 text-right w-20">총점</th>
                            <th className="w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsed.options.map((op, oi) => {
                            const r = rank(oi);
                            const isTop = r === 1 && totals[oi] > 0;
                            return (
                                <tr key={oi} className={`border-t border-neutral-100 ${isTop ? "bg-slate-50" : ""}`}>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-neutral-400 shrink-0">{isTop ? <span className="text-slate-900 font-bold">★</span> : r}</span>
                                            <input type="text" value={op.name} onChange={e => updateOption(oi, { name: e.target.value })}
                                                className="flex-1 px-1 py-1 text-xs font-medium bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                        </div>
                                    </td>
                                    {parsed.criteria.map((_, ci) => (
                                        <td key={ci} className="px-2 py-2 text-center">
                                            <select value={op.scores[ci] ?? 0} onChange={e => updateScore(oi, ci, +e.target.value)}
                                                className="w-14 px-1 py-1 text-center text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                                                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </td>
                                    ))}
                                    <td className={`px-2 py-2 text-right font-mono font-bold ${isTop ? "text-slate-900" : "text-neutral-700"}`}>
                                        {totals[oi]}
                                        {totals[oi] > 0 && (
                                            <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mt-1">
                                                <div className={`h-full ${isTop ? "bg-slate-900" : "bg-neutral-400"}`} style={{ width: `${totals[oi] / maxTotal * 100}%` }} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-1 text-center">
                                        {parsed.options.length > 1 && (
                                            <button onClick={() => removeOption(oi)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2">
                <button onClick={addOption} className="flex-1 py-1.5 border border-dashed border-neutral-300 rounded-lg text-[11px] text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 옵션</button>
                <button onClick={addCriterion} className="flex-1 py-1.5 border border-dashed border-neutral-300 rounded-lg text-[11px] text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 기준</button>
            </div>
        </div>
    );
}

function FeynmanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "feynman_concept", label: "Concept", sub: "가르치려는 주제를 한 줄로", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "feynman_teach", label: "Teach", sub: "6살에게 설명하듯 쉽게", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "feynman_gaps", label: "Gaps", sub: "막힌 곳·애매한 곳 찾기", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
        { key: "feynman_simplify", label: "Simplify", sub: "비유·예시로 다시 쓰기", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className={`rounded-lg p-3 border ${s.color}`}>
                    <div className="flex items-start gap-2">
                        <div className={`shrink-0 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>{i + 1}</div>
                        <div className="flex-1">
                            <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                            <p className="text-[10px] text-neutral-500">{s.sub}</p>
                            <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function LabeledInput({ label, valKey, data, onChange, placeholder, type = "text" }: {
    label: string; valKey: string; data: FrameworkData; onChange: (k: string, v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
            <input type={type} value={data[valKey] ?? ""} onChange={e => onChange(valKey, e.target.value)}
                placeholder={placeholder}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-[#0F766E]" />
        </label>
    );
}

function LabeledBox({ label, sub, valKey, data, onChange, placeholder, color = "bg-neutral-50 border-neutral-200", textColor = "text-neutral-700" }: {
    label: string; sub?: string; valKey: string; data: FrameworkData; onChange: (k: string, v: string) => void; placeholder?: string; color?: string; textColor?: string;
}) {
    return (
        <div className={`rounded-lg p-3 border ${color}`}>
            <p className={`text-xs font-bold ${textColor}`}>{label}</p>
            {sub && <p className="text-[10px] text-neutral-500">{sub}</p>}
            <CellTextarea cellKey={valKey} value={data[valKey] ?? ""} onChange={onChange} placeholder={placeholder} />
        </div>
    );
}

function OneOnOneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="With · 상대" valKey="oto_with" data={data} onChange={onChange} placeholder="이름" />
                <LabeledInput label="일시" valKey="oto_date" data={data} onChange={onChange} placeholder="YYYY-MM-DD" />
            </div>
            <LabeledBox label="Updates · 진행 상황" valKey="oto_updates" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Feedback · 피드백" valKey="oto_feedback" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Blockers · 고민·장애물" valKey="oto_blockers" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Next · 다음 목표·액션" valKey="oto_next" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
        </div>
    );
}

function MeetingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <LabeledInput label="제목" valKey="mtg_title" data={data} onChange={onChange} />
                <LabeledInput label="일시" valKey="mtg_date" data={data} onChange={onChange} />
                <LabeledInput label="참석자" valKey="mtg_attendees" data={data} onChange={onChange} placeholder="이름1, 이름2…" />
                <LabeledInput label="안건" valKey="mtg_agenda" data={data} onChange={onChange} placeholder="핵심 주제" />
            </div>
            <LabeledBox label="Discussion · 논의 내용" valKey="mtg_discussion" data={data} onChange={onChange} />
            <LabeledBox label="Decisions · 결정 사항" valKey="mtg_decisions" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="- 결정 1&#10;- 결정 2" />
            <LabeledBox label="Action Items · 액션 아이템" valKey="mtg_actions" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="- [담당자] 액션 (마감일)" />
        </div>
    );
}

function InterviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <LabeledInput label="인터뷰이" valKey="itv_name" data={data} onChange={onChange} />
                    <LabeledInput label="역할·직업" valKey="itv_role" data={data} onChange={onChange} />
                    <LabeledInput label="일시" valKey="itv_date" data={data} onChange={onChange} />
                </div>
            </div>
            <LabeledBox label="Goals · 목표·하고 있는 것" valKey="itv_goals" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Pains · 문제·불편" valKey="itv_pains" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Insights · 핵심 인사이트" valKey="itv_insights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <div className="rounded-lg p-3 bg-white border-l-4 border-neutral-400">
                <p className="text-xs font-bold text-neutral-600">Quotes · 인상 깊은 인용문</p>
                <textarea value={data["itv_quotes"] ?? ""} onChange={e => onChange("itv_quotes", e.target.value)}
                    placeholder='"그대로 따라 적어보세요…"' rows={3}
                    className="w-full mt-1 resize-none bg-transparent text-xs italic text-neutral-700 placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Surprises · 예상 밖의 발견" valKey="itv_surprises" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function AarGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "aar_planned", label: "계획된 것은 무엇이었나?", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "aar_actual", label: "실제로 일어난 일은?", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "aar_diff", label: "왜 차이가 났나?", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "aar_lessons", label: "배운 것 · 다음에 할 것", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className={`rounded-lg p-3 border ${s.color}`}>
                    <div className="flex items-start gap-2">
                        <div className={`shrink-0 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>{i + 1}</div>
                        <div className="flex-1">
                            <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                            <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

type BsIdea = { text: string; starred?: boolean };
function BrainstormGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const ideas: BsIdea[] = (() => {
        try { return data["bs_ideas"] ? JSON.parse(data["bs_ideas"]) : []; }
        catch { return []; }
    })();
    const ensureMin = ideas.length === 0 ? [{ text: "" }] : ideas;
    const save = (next: BsIdea[]) => onChange("bs_ideas", JSON.stringify(next));
    const update = (i: number, patch: Partial<BsIdea>) => {
        const next = [...ensureMin]; next[i] = { ...next[i], ...patch }; save(next);
    };
    const add = () => save([...ensureMin, { text: "" }]);
    const remove = (i: number) => save(ensureMin.filter((_, x) => x !== i));
    const toggleStar = (i: number) => update(i, { starred: !ensureMin[i].starred });

    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <LabeledInput label="주제 · Topic" valKey="bs_topic" data={data} onChange={onChange} placeholder="무엇에 대해 아이디어를 낼까?" />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Ideas · 떠오르는 대로</p>
                <div className="divide-y divide-neutral-100">
                    {ensureMin.map((idea, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                            <button onClick={() => toggleStar(i)} className={`shrink-0 w-6 h-6 rounded flex items-center justify-center ${idea.starred ? "text-slate-700" : "text-neutral-300 hover:text-slate-500"}`}>
                                {idea.starred ? "" : ""}
                            </button>
                            <input type="text" value={idea.text} onChange={e => update(i, { text: e.target.value })}
                                placeholder="아이디어…"
                                className="flex-1 px-1 py-1 text-xs bg-transparent border-b border-transparent focus:outline-none focus:border-neutral-300" />
                            {ensureMin.length > 1 && (
                                <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={add} className="w-full py-2 border-t border-neutral-100 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-[#0F766E]">+ 아이디어 추가</button>
            </div>
            <LabeledBox label="Criteria · 선정 기준" valKey="bs_criteria" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Chosen · 최종 선택" valKey="bs_chosen" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" />
        </div>
    );
}

function DecisionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="결정 일자" valKey="dl_date" data={data} onChange={onChange} placeholder="YYYY-MM-DD" />
                <LabeledInput label="결정자" valKey="dl_decider" data={data} onChange={onChange} />
            </div>
            <LabeledBox label="Decision · 결정 내용" valKey="dl_decision" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" placeholder="무엇을 결정했나" />
            <LabeledBox label="Context · 배경·맥락" valKey="dl_context" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Alternatives · 대안·기각한 것" valKey="dl_alternatives" data={data} onChange={onChange} color="bg-neutral-100 border-neutral-300" textColor="text-neutral-600" />
            <div className="grid md:grid-cols-2 gap-2">
                <LabeledBox label="Expected · 기대 결과" valKey="dl_expected" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
                <LabeledBox label="Actual · 실제 결과" valKey="dl_actual" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="나중에 돌아와 기록" />
            </div>
        </div>
    );
}

function EmotionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const moods = ["", "", "", "", "", "", "", "", "", ""];
    const intensity = parseInt(data["emo_intensity"] ?? "3", 10);
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-2">오늘의 기분</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {moods.map(m => (
                        <button key={m} onClick={() => onChange("emo_mood", m)}
                            className={`w-9 h-9 rounded-full text-lg transition-all ${data["emo_mood"] === m ? "bg-white ring-2 ring-slate-700 scale-110" : "bg-white/50 hover:bg-white hover:scale-105"}`}>
                            {m}
                        </button>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] text-neutral-500 mb-1">강도</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => onChange("emo_intensity", String(n))}
                                className={`flex-1 py-1 text-xs rounded ${intensity >= n ? "bg-slate-900 text-white font-bold" : "bg-white border border-slate-200 text-neutral-400"}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <LabeledBox label="Trigger · 계기" valKey="emo_trigger" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="무슨 일이 있었나?" />
            <LabeledBox label="Body · 몸의 신호" valKey="emo_body" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="어깨가 무겁다, 가슴이 두근거린다…" />
            <LabeledBox label="Thought · 떠오른 생각" valKey="emo_thought" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 다시 본다면" valKey="emo_reflection" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function GratitudeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-4 bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center mb-3">오늘 감사한 일 세 가지</p>
                <div className="space-y-2">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="flex items-start gap-2">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">{n}</div>
                            <textarea value={data[`grat_${n}`] ?? ""} onChange={e => onChange(`grat_${n}`, e.target.value)}
                                placeholder={`감사한 일 ${n}`} rows={2}
                                className="flex-1 resize-none bg-white/60 text-xs p-2 rounded border border-stone-200 focus:outline-none focus:border-slate-700 leading-relaxed" />
                        </div>
                    ))}
                </div>
            </div>
            <LabeledBox label="Highlight · 오늘의 하이라이트" valKey="grat_highlight" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Tomorrow · 내일 기대하는 것" valKey="grat_tomorrow" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function ReadingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex gap-3 items-start">
                    <div className="shrink-0 w-12 h-16 bg-white border-2 border-stone-400 rounded flex items-center justify-center text-xl"></div>
                    <div className="flex-1 space-y-1.5">
                        <input type="text" value={data["read_title"] ?? ""} onChange={e => onChange("read_title", e.target.value)}
                            placeholder="책·아티클 제목"
                            className="w-full px-2 py-1 text-sm font-bold bg-white/70 border border-stone-200 rounded focus:outline-none focus:border-slate-700" />
                        <div className="grid grid-cols-2 gap-1.5">
                            <input type="text" value={data["read_author"] ?? ""} onChange={e => onChange("read_author", e.target.value)}
                                placeholder="저자"
                                className="px-2 py-1 text-xs bg-white/70 border border-stone-200 rounded focus:outline-none" />
                            <input type="text" value={data["read_date"] ?? ""} onChange={e => onChange("read_date", e.target.value)}
                                placeholder="읽은 날짜"
                                className="px-2 py-1 text-xs bg-white/70 border border-stone-200 rounded focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>
            <LabeledBox label="Summary · 한 줄 요약" valKey="read_summary" data={data} onChange={onChange} />
            <LabeledBox label="Highlights · 밑줄 친 문장들" valKey="read_highlights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Takeaways · 핵심 교훈 (3가지)" valKey="read_takeaways" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="1.&#10;2.&#10;3." />
            <LabeledBox label="Action · 실천에 옮길 것" valKey="read_action" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function StandupGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "su_yesterday", label: "Yesterday · 어제 한 일", emoji: "", color: "bg-neutral-50 border-neutral-200", text: "text-neutral-600" },
        { key: "su_today", label: "Today · 오늘 할 일", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "su_blockers", label: "Blockers · 장애물·도움 필요", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 grid md:grid-cols-3 gap-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-36`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="- 항목…" />
                </div>
            ))}
        </div>
    );
}

function WeeklyJournalGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="wj_week" data={data} onChange={onChange} placeholder="예: 2026년 W17" />
            <LabeledBox label="Events · 있었던 일" valKey="wj_events" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Feelings · 느낀 감정" valKey="wj_feelings" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Insights · 배움·인사이트" valKey="wj_insights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Next Week Intention · 다음 주 의도" valKey="wj_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
        </div>
    );
}

function ZettelkastenGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                    <div className="shrink-0 w-16">
                        <p className="text-[9px] text-neutral-500 font-semibold">ZETTEL ID</p>
                        <input type="text" value={data["zet_id"] ?? ""} onChange={e => onChange("zet_id", e.target.value)}
                            placeholder="202604251"
                            className="w-full mt-0.5 px-1 py-1 text-xs font-mono bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                    <div>
                        <p className="text-[9px] text-neutral-500 font-semibold">TITLE</p>
                        <input type="text" value={data["zet_title"] ?? ""} onChange={e => onChange("zet_title", e.target.value)}
                            placeholder="제목 (원자적 아이디어 하나)"
                            className="w-full mt-0.5 px-2 py-1 text-sm font-semibold bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                </div>
            </div>
            <LabeledBox label="Content · 내용" valKey="zet_content" data={data} onChange={onChange} placeholder="자신의 언어로, 문장 단위로…" />
            <div className="grid grid-cols-2 gap-2">
                <LabeledBox label="Source · 출처" valKey="zet_source" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
                <LabeledBox label="Tags · 태그" valKey="zet_tags" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="#tag1 #tag2" />
            </div>
            <LabeledBox label="Links · 연결된 Zettel" valKey="zet_links" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="[[202604111]] ..." />
        </div>
    );
}

function MindmapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400 text-center">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Central Topic · 중심 주제</p>
                <input type="text" value={data["mind_central"] ?? ""} onChange={e => onChange("mind_central", e.target.value)}
                    placeholder="마인드맵의 가운데 (한 단어·한 구절)"
                    className="w-full mt-2 px-3 py-2 text-sm font-bold text-center bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Outline · 계층 구조 (Tab으로 들여쓰기)</p>
                <textarea value={data["mind_outline"] ?? ""} onChange={e => onChange("mind_outline", e.target.value)}
                    placeholder={"- 1차 가지\n  - 2차 가지\n    - 3차 가지\n- 또 다른 1차 가지"}
                    rows={14}
                    className="w-full resize-none px-3 py-2 text-xs font-mono placeholder:text-neutral-300 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

type TbBlock = { start: string; end: string; task: string; category: string };
function TimeBlockGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: TbBlock[] = [
        { start: "09:00", end: "10:00", task: "", category: "집중" },
        { start: "10:00", end: "11:00", task: "", category: "집중" },
        { start: "13:00", end: "14:00", task: "", category: "협업" },
        { start: "15:00", end: "16:00", task: "", category: "행정" },
    ];
    const blocks: TbBlock[] = (() => {
        try { const p = data["tb_blocks"] ? JSON.parse(data["tb_blocks"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: TbBlock[]) => onChange("tb_blocks", JSON.stringify(next));
    const update = (i: number, patch: Partial<TbBlock>) => { const n = [...blocks]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...blocks, { start: "", end: "", task: "", category: "" }]);
    const remove = (i: number) => save(blocks.filter((_, x) => x !== i));
    const CATEGORIES = ["집중", "협업", "행정", "학습", "휴식", "식사"];
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="tb_date" data={data} onChange={onChange} placeholder="YYYY-MM-DD" />
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="w-32">시작 ~ 종료</span>
                    <span className="w-24">카테고리</span>
                    <span className="flex-1">할 일</span>
                    <span className="w-6"></span>
                </div>
                {blocks.map((b, i) => (
                    <div key={i} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <div className="w-32 flex items-center gap-1">
                            <input type="text" value={b.start} onChange={e => update(i, { start: e.target.value })}
                                placeholder="09:00" className="w-14 px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                            <span className="text-neutral-300 text-xs">~</span>
                            <input type="text" value={b.end} onChange={e => update(i, { end: e.target.value })}
                                placeholder="10:00" className="w-14 px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        </div>
                        <select value={b.category} onChange={e => update(i, { category: e.target.value })}
                            className="w-24 px-1 py-1 text-[11px] bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                            <option value="">–</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="text" value={b.task} onChange={e => update(i, { task: e.target.value })}
                            placeholder="할 일" className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {blocks.length > 1 && (
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 블록 추가</button>
        </div>
    );
}

function DailyDesignGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="dd_date" data={data} onChange={onChange} />
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Intention · 오늘의 의도</p>
                <textarea value={data["dd_intention"] ?? ""} onChange={e => onChange("dd_intention", e.target.value)}
                    placeholder="오늘은 어떤 사람으로 살고 싶은가?"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs p-2 rounded border border-stone-200 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Top 3 · 핵심 우선순위" valKey="dd_priorities" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="1.&#10;2.&#10;3." />
            <LabeledBox label="Schedule · 일정" valKey="dd_schedule" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 저녁 회고" valKey="dd_reflection" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="오늘 한 일, 배운 것, 느낀 것…" />
        </div>
    );
}

type DwSession = { start: string; duration: number; task: string; result: string; distractions: string };
function DeepWorkGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: DwSession[] = [{ start: "09:00", duration: 90, task: "", result: "", distractions: "" }];
    const ss: DwSession[] = (() => {
        try { const p = data["dw_sessions"] ? JSON.parse(data["dw_sessions"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: DwSession[]) => onChange("dw_sessions", JSON.stringify(next));
    const update = (i: number, patch: Partial<DwSession>) => { const n = [...ss]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...ss, { start: "", duration: 60, task: "", result: "", distractions: "" }]);
    const remove = (i: number) => save(ss.filter((_, x) => x !== i));
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="dw_date" data={data} onChange={onChange} />
            {ss.map((s, i) => (
                <div key={i} className="rounded-lg p-3 bg-slate-50 border border-slate-300 space-y-2 relative">
                    {ss.length > 1 && (
                        <button onClick={() => remove(i)} className="absolute top-2 right-2 w-5 h-5 rounded text-slate-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                    )}
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Session {i + 1}</p>
                    <div className="flex gap-2 items-center">
                        <div>
                            <span className="text-[9px] text-neutral-500">시작</span>
                            <input type="text" value={s.start} onChange={e => update(i, { start: e.target.value })}
                                placeholder="09:00" className="w-16 ml-1 px-2 py-1 text-xs text-center bg-white border border-slate-200 rounded focus:outline-none" />
                        </div>
                        <div>
                            <span className="text-[9px] text-neutral-500">분</span>
                            <input type="number" value={s.duration} onChange={e => update(i, { duration: +e.target.value })}
                                className="w-14 ml-1 px-2 py-1 text-xs text-center bg-white border border-slate-200 rounded focus:outline-none" />
                        </div>
                    </div>
                    <input type="text" value={s.task} onChange={e => update(i, { task: e.target.value })}
                        placeholder="과업 — 무엇에 집중했나"
                        className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded focus:outline-none" />
                    <textarea value={s.result} onChange={e => update(i, { result: e.target.value })}
                        placeholder="결과 — 무엇을 완성했나" rows={2}
                        className="w-full resize-none px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none leading-relaxed" />
                    <textarea value={s.distractions} onChange={e => update(i, { distractions: e.target.value })}
                        placeholder="방해 요소 — 무엇이 흐름을 끊었나" rows={1}
                        className="w-full resize-none px-2 py-1.5 text-[11px] bg-white/60 border border-slate-200 rounded focus:outline-none text-stone-700 leading-relaxed" />
                </div>
            ))}
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400">+ 세션 추가</button>
        </div>
    );
}

type PomSession = { task: string; completed: number; notes: string };
function PomodoroGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: PomSession[] = [{ task: "", completed: 0, notes: "" }];
    const ss: PomSession[] = (() => {
        try { const p = data["pom_sessions"] ? JSON.parse(data["pom_sessions"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: PomSession[]) => onChange("pom_sessions", JSON.stringify(next));
    const update = (i: number, patch: Partial<PomSession>) => { const n = [...ss]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...ss, { task: "", completed: 0, notes: "" }]);
    const remove = (i: number) => save(ss.filter((_, x) => x !== i));
    const totalTomatoes = ss.reduce((s, x) => s + x.completed, 0);
    return (
        <div className="my-2 space-y-2">
            <div className="flex items-center justify-between">
                <LabeledInput label="Date · 날짜" valKey="pom_date" data={data} onChange={onChange} />
                <div className="ml-3 shrink-0 text-right">
                    <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">총 </p>
                    <p className="text-xl font-bold text-slate-700">{totalTomatoes}</p>
                </div>
            </div>
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="flex-1">과업</span>
                    <span className="w-40">완료</span>
                    <span className="w-40">메모</span>
                    <span className="w-6"></span>
                </div>
                {ss.map((s, i) => (
                    <div key={i} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <input type="text" value={s.task} onChange={e => update(i, { task: e.target.value })}
                            placeholder="과업" className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        <div className="w-40 flex items-center gap-1">
                            <button onClick={() => update(i, { completed: Math.max(0, s.completed - 1) })} className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-xs">−</button>
                            <span className="flex-1 text-center text-sm">
                                {s.completed > 0 ? "".repeat(Math.min(s.completed, 8)) + (s.completed > 8 ? `+${s.completed - 8}` : "") : <span className="text-neutral-300">–</span>}
                            </span>
                            <button onClick={() => update(i, { completed: s.completed + 1 })} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-xs">+</button>
                        </div>
                        <input type="text" value={s.notes} onChange={e => update(i, { notes: e.target.value })}
                            placeholder="메모" className="w-40 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {ss.length > 1 && (
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 과업 추가</button>
        </div>
    );
}

type HabitEntry = { name: string; days: boolean[] };
function HabitTrackerGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: HabitEntry[] = [
        { name: "", days: [false, false, false, false, false, false, false] },
        { name: "", days: [false, false, false, false, false, false, false] },
    ];
    const habits: HabitEntry[] = (() => {
        try {
            const p = data["ht_habits"] ? JSON.parse(data["ht_habits"]) : null;
            return Array.isArray(p) && p.length > 0 ? p.map(h => ({ ...h, days: (h.days || []).concat(Array(7).fill(false)).slice(0, 7) })) : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: HabitEntry[]) => onChange("ht_habits", JSON.stringify(next));
    const update = (i: number, patch: Partial<HabitEntry>) => { const n = [...habits]; n[i] = { ...n[i], ...patch }; save(n); };
    const toggle = (i: number, d: number) => { const days = [...habits[i].days]; days[d] = !days[d]; update(i, { days }); };
    const add = () => save([...habits, { name: "", days: [false, false, false, false, false, false, false] }]);
    const remove = (i: number) => save(habits.filter((_, x) => x !== i));
    const DOW = ["월", "화", "수", "목", "금", "토", "일"];
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="ht_week" data={data} onChange={onChange} placeholder="예: 2026년 W17" />
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-[10px] text-neutral-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left">습관</th>
                            {DOW.map(d => <th key={d} className="px-1 py-2 w-10 text-center">{d}</th>)}
                            <th className="px-2 py-2 w-12 text-center">달성</th>
                            <th className="w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((h, i) => {
                            const done = h.days.filter(Boolean).length;
                            return (
                                <tr key={i} className="border-t border-neutral-100">
                                    <td className="px-2 py-1">
                                        <input type="text" value={h.name} onChange={e => update(i, { name: e.target.value })}
                                            placeholder="예: 아침 명상 10분"
                                            className="w-full px-1 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    {h.days.map((d, di) => (
                                        <td key={di} className="px-1 py-1 text-center">
                                            <button onClick={() => toggle(i, di)} className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${d ? "bg-slate-900 text-white scale-105" : "bg-neutral-100 text-neutral-300 hover:bg-neutral-200"}`}>
                                                {d ? "" : ""}
                                            </button>
                                        </td>
                                    ))}
                                    <td className={`px-2 py-1 text-center font-mono font-bold ${done === 7 ? "text-slate-900" : done >= 4 ? "text-stone-600" : "text-neutral-400"}`}>
                                        {done}/7
                                    </td>
                                    <td className="px-1 text-center">
                                        {habits.length > 1 && (
                                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 습관 추가</button>
        </div>
    );
}

type EnergyPoint = { hour: number; level: number };
function EnergyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 ~ 22
    const levels: EnergyPoint[] = (() => {
        try {
            const p = data["em_levels"] ? JSON.parse(data["em_levels"]) : null;
            if (!Array.isArray(p)) return HOURS.map(h => ({ hour: h, level: 0 }));
            return HOURS.map(h => p.find((x: EnergyPoint) => x.hour === h) ?? { hour: h, level: 0 });
        } catch { return HOURS.map(h => ({ hour: h, level: 0 })); }
    })();
    const save = (next: EnergyPoint[]) => onChange("em_levels", JSON.stringify(next));
    const setLevel = (hour: number, level: number) => {
        const next = levels.map(l => l.hour === hour ? { ...l, level } : l);
        save(next);
    };
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="em_date" data={data} onChange={onChange} />
            <div className="rounded-lg p-3 bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2">시간대별 에너지 (0~5, 클릭해서 조정)</p>
                <div className="flex gap-0.5 items-end h-32">
                    {levels.map(l => (
                        <div key={l.hour} className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex-1 w-full flex flex-col justify-end">
                                {[5, 4, 3, 2, 1].map(n => (
                                    <button key={n} onClick={() => setLevel(l.hour, n === l.level ? 0 : n)}
                                        className={`h-4 border-t border-white transition-all ${
                                            l.level >= n
                                                ? n >= 4 ? "bg-slate-900" : n >= 2 ? "bg-slate-500" : "bg-slate-300"
                                                : "bg-neutral-100 hover:bg-neutral-200"
                                        }`} />
                                ))}
                            </div>
                            <span className="text-[8px] text-neutral-400 tabular-nums">{String(l.hour).padStart(2,"0")}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <LabeledBox label="Peaks · 피크 시간" valKey="em_peaks" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
                <LabeledBox label="Lows · 저점 시간" valKey="em_lows" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            </div>
            <LabeledBox label="Patterns · 패턴 메모" valKey="em_notes" data={data} onChange={onChange} />
        </div>
    );
}

function WeeklyReviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="wr_week" data={data} onChange={onChange} />
            <LabeledBox label="Wins · 이번 주 승리" valKey="wr_wins" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" />
            <LabeledBox label="Lessons · 배운 것" valKey="wr_lessons" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Blockers · 장애물" valKey="wr_blockers" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Next Week · 다음 주" valKey="wr_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function WeeklyWinGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="ww_week" data={data} onChange={onChange} />
            <div className="rounded-xl p-4 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center">이번 주 가장 큰 WIN</p>
                <textarea value={data["ww_biggest"] ?? ""} onChange={e => onChange("ww_biggest", e.target.value)}
                    placeholder="자랑스러운 단 하나의 성취"
                    rows={3}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-stone-300 focus:outline-none text-center leading-relaxed" />
            </div>
            <LabeledBox label="Other Wins · 다른 성취들" valKey="ww_other" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Celebrate · 어떻게 축하할까" valKey="ww_celebrate" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
        </div>
    );
}

function MonthlyThemeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Month · 월" valKey="mt_month" data={data} onChange={onChange} placeholder="예: 2026년 5월" />
            <div className="rounded-xl p-4 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider text-center">이번 달 테마</p>
                <textarea value={data["mt_theme"] ?? ""} onChange={e => onChange("mt_theme", e.target.value)}
                    placeholder="한 문장으로 — 예: '깊이 있는 집중의 달'"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-slate-300 focus:outline-none text-center leading-relaxed" />
            </div>
            <LabeledBox label="Focus · 핵심 포커스" valKey="mt_focus" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Wins · 기대하는 WIN" valKey="mt_wins" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Habits · 만들 습관" valKey="mt_habits" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 월말 회고" valKey="mt_reflection" data={data} onChange={onChange} placeholder="월말에 돌아와 기록" />
        </div>
    );
}

function QuarterlyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Quarter · 분기" valKey="q_quarter" data={data} onChange={onChange} placeholder="예: 2026 Q2" />
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">분기 목표</p>
                <textarea value={data["q_goal"] ?? ""} onChange={e => onChange("q_goal", e.target.value)}
                    placeholder="3개월 뒤 달성하고 싶은 한 가지"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <div className="grid md:grid-cols-3 gap-2">
                {[
                    { key: "q_m1", label: "Month 1", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
                    { key: "q_m2", label: "Month 2", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
                    { key: "q_m3", label: "Month 3", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
                ].map(m => (
                    <div key={m.key} className={`rounded-lg p-3 border ${m.color} min-h-28`}>
                        <p className={`text-xs font-bold ${m.text}`}>{m.label}</p>
                        <CellTextarea cellKey={m.key} value={data[m.key] ?? ""} onChange={onChange} placeholder="이 달의 포커스·행동…" />
                    </div>
                ))}
            </div>
            <LabeledBox label="Quarter Review · 분기 회고" valKey="q_review" data={data} onChange={onChange} placeholder="분기 끝에 돌아와 기록" />
        </div>
    );
}

type YrMonth = { focus: string; goal: string };
function YearPlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const MONTHS_LBL = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const EMPTY: YrMonth = { focus: "", goal: "" };
    const months: YrMonth[] = (() => {
        try {
            const p = data["yr_months"] ? JSON.parse(data["yr_months"]) : null;
            if (!Array.isArray(p)) return Array(12).fill(null).map(() => ({ ...EMPTY }));
            return Array(12).fill(null).map((_, i) => p[i] ?? { ...EMPTY });
        } catch { return Array(12).fill(null).map(() => ({ ...EMPTY })); }
    })();
    const save = (next: YrMonth[]) => onChange("yr_months", JSON.stringify(next));
    const update = (i: number, patch: Partial<YrMonth>) => { const n = [...months]; n[i] = { ...n[i], ...patch }; save(n); };

    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Year · 연도" valKey="yr_year" data={data} onChange={onChange} placeholder="2026" />
                <LabeledInput label="Theme · 올해 테마" valKey="yr_theme" data={data} onChange={onChange} placeholder="한 문장으로" />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                {MONTHS_LBL.map((lbl, i) => {
                    const quarter = Math.floor(i / 3);
                    const qColors = ["bg-slate-50 border-slate-300", "bg-stone-50 border-stone-200", "bg-slate-50 border-slate-200", "bg-slate-50 border-slate-200"];
                    return (
                        <div key={i} className={`rounded-lg p-2 border ${qColors[quarter]} min-h-24`}>
                            <p className="text-[10px] font-bold text-neutral-600">{lbl}</p>
                            <input type="text" value={months[i].focus} onChange={e => update(i, { focus: e.target.value })}
                                placeholder="포커스"
                                className="w-full mt-1 px-1 py-1 text-[10px] font-medium bg-white/60 border border-neutral-200 rounded focus:outline-none" />
                            <textarea value={months[i].goal} onChange={e => update(i, { goal: e.target.value })}
                                placeholder="목표" rows={2}
                                className="w-full mt-1 resize-none px-1 py-1 text-[10px] bg-transparent border border-transparent rounded focus:outline-none focus:bg-white/60 focus:border-neutral-200 leading-tight" />
                        </div>
                    );
                })}
            </div>
            <LabeledBox label="Milestones · 핵심 마일스톤" valKey="yr_milestones" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-800" placeholder="연중 꼭 달성할 것들" />
        </div>
    );
}

function FiveYearGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "fy_now", label: "Now · 현재", badge: "0Y", color: "bg-neutral-50 border-neutral-200", text: "text-neutral-600", strong: false },
        { key: "fy_y1",  label: "1년 후",    badge: "+1Y", color: "bg-slate-50 border-slate-300", text: "text-slate-900", strong: false },
        { key: "fy_y2",  label: "2년 후",    badge: "+2Y", color: "bg-slate-50 border-slate-200", text: "text-slate-800", strong: false },
        { key: "fy_y3",  label: "3년 후",    badge: "+3Y", color: "bg-slate-50 border-slate-200", text: "text-slate-800", strong: false },
        { key: "fy_y5",  label: "5년 후 · 비전", badge: "+5Y", color: "bg-stone-50 border-stone-400", text: "text-stone-800", strong: true },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className="flex items-start gap-2">
                    <div className="shrink-0 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold tracking-wider ${s.strong ? "border-slate-700 text-slate-900" : "border-slate-300 text-slate-500"}`}>
                            {s.badge}
                        </div>
                        {i < 4 && <div className="w-px flex-1 bg-neutral-300 my-1" style={{ minHeight: 24 }} />}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 border ${s.color}`}>
                        <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                        <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} placeholder={i === 4 ? "어떤 모습·삶으로 살고 있을까" : "그때 나는 무엇을 하고 있을까"} />
                    </div>
                </div>
            ))}
            <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700 mt-3">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">지켜야 할 원칙</p>
                <CellTextarea cellKey="fy_principles" value={data["fy_principles"] ?? ""} onChange={onChange} placeholder="5년의 여정에서 타협하지 않을 가치" />
            </div>
        </div>
    );
}

function MovingAverageGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">90-Day Experiment</p>
                <input type="text" value={data["ma_experiment"] ?? ""} onChange={e => onChange("ma_experiment", e.target.value)}
                    placeholder="실험 제목 — 예: '아침 운동 90일 실험'"
                    className="w-full mt-2 px-2 py-1.5 text-sm font-bold bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>
            <LabeledBox label="Hypothesis · 가설" valKey="ma_hypothesis" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="If ~ then ~" />
            <div className="grid md:grid-cols-3 gap-2">
                <LabeledBox label="Baseline · 시작점" valKey="ma_baseline" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" />
                <LabeledBox label="Metric · 측정 지표" valKey="ma_metric" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
                <LabeledBox label="Target · 90일 목표" valKey="ma_target" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            </div>
            <LabeledBox label="Check-ins · 30/60/90일" valKey="ma_checkins" data={data} onChange={onChange} placeholder="Day 30:&#10;Day 60:&#10;Day 90:" />
            <LabeledBox label="Result · 결과" valKey="ma_result" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" placeholder="실험 종료 후 기록" />
        </div>
    );
}

function ReversePlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center">Goal · 최종 목표</p>
                <textarea value={data["rp_goal"] ?? ""} onChange={e => onChange("rp_goal", e.target.value)}
                    placeholder="무엇을 달성했을 때 '성공'인가"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-bold p-2 rounded border border-stone-300 focus:outline-none text-center leading-relaxed" />
                <input type="text" value={data["rp_deadline"] ?? ""} onChange={e => onChange("rp_deadline", e.target.value)}
                    placeholder="마감일 (YYYY-MM-DD)"
                    className="w-full mt-2 px-2 py-1 text-xs text-center bg-white/60 border border-stone-200 rounded focus:outline-none" />
            </div>
            <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-400" />
                <div className="space-y-2">
                    <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-700 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Milestones · 거꾸로 마일스톤</p>
                        <CellTextarea cellKey="rp_milestones" value={data["rp_milestones"] ?? ""} onChange={onChange} placeholder="마감 1주 전에는…&#10;1개월 전에는…&#10;3개월 전에는…&#10;오늘부터는…" />
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Today · 오늘 시작할 일</p>
                        <CellTextarea cellKey="rp_now" value={data["rp_now"] ?? ""} onChange={onChange} placeholder="가장 먼저 취할 작은 행동" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SprintGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <div className="grid grid-cols-3 gap-2">
                    <LabeledInput label="Sprint #" valKey="sp_number" data={data} onChange={onChange} placeholder="25" />
                    <LabeledInput label="Start · 시작일" valKey="sp_start" data={data} onChange={onChange} />
                    <LabeledInput label="End · 종료일" valKey="sp_end" data={data} onChange={onChange} />
                </div>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Sprint Goal</p>
                <textarea value={data["sp_goal"] ?? ""} onChange={e => onChange("sp_goal", e.target.value)}
                    placeholder="이번 스프린트에서 가장 중요한 한 가지"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-bold p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Commitments · 끝낼 것" valKey="sp_commitments" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="- [ ] 항목 1&#10;- [ ] 항목 2" />
            <LabeledBox label="Stretch · 여유 있으면" valKey="sp_stretch" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Retro · 스프린트 회고" valKey="sp_retro" data={data} onChange={onChange} placeholder="스프린트 끝에 돌아와 기록 (무엇이 잘 됐나 / 안 됐나 / 바꿀 것)" />
        </div>
    );
}

function getFrameworkBilingualName(tpl: Template): string | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("empathy") || l.includes("공감")) return "Empathy Map";
    if (k.includes("lean") || l.includes("린 캔버스")) return "Lean Canvas";
    if (k.includes("mandalart") || l.includes("만다라")) return "Mandalart";
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return "Eisenhower Matrix";
    if (k.includes("pest")) return "PEST Analysis";
    if (k.includes("moscow")) return "MoSCoW Prioritization";
    if (k === "quadrant") return "Quadrant Matrix";
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return "Business Model Canvas";
    if (k === "vpc" || l.includes("value proposition")) return "Value Proposition Canvas";
    if (k === "okr") return "Objectives & Key Results";
    if (k.includes("persona") || l.includes("페르소나")) return "User Persona";
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return "Jobs-to-be-Done";
    if (k === "rice") return "RICE Prioritization";
    if (k === "5w1h") return "5W1H";
    if (k === "5why") return "5 Whys";
    if (k.includes("ikigai")) return "Ikigai";
    if (k.includes("porter")) return "Porter's Five Forces";
    if (k.includes("scamper")) return "SCAMPER";
    if (k === "kano") return "Kano Model";
    if (k.includes("pareto") || l.includes("80/20")) return "Pareto Principle (80/20)";
    if (k.includes("fishbone") || l.includes("피쉬본")) return "Fishbone (Ishikawa)";
    if (k.includes("journey") || l.includes("여정 지도")) return "Customer Journey Map";
    if (k.includes("retrospective") || l.includes("kpt")) return "KPT Retrospective";
    if (k === "ooda") return "OODA Loop";
    if (k.includes("cornell") || l.includes("코넬")) return "Cornell Notes";
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return "Decision Matrix";
    if (k.includes("feynman") || l.includes("파인만")) return "Feynman Technique";
    if (k === "1on1") return "1:1 Meeting Log";
    if (k === "meeting") return "Meeting Minutes";
    if (k === "interview") return "User Interview";
    if (k === "after_action") return "After Action Review";
    if (k === "brainstorm") return "Brainstorming";
    if (k === "decision_log") return "Decision Log";
    if (k === "emotion_log") return "Emotion Log";
    if (k === "gratitude") return "Gratitude Journal";
    if (k === "reading") return "Reading Notes";
    if (k === "standup") return "Daily Standup";
    if (k === "weekly_journal") return "Weekly Journal";
    if (k === "zettelkasten") return "Zettelkasten";
    if (k === "mindmap_outline") return "Mind Map Outline";
    if (k === "time_block") return "Time Blocking";
    if (k === "daily_design") return "Daily Design";
    if (k === "deep_work") return "Deep Work Sessions";
    if (k === "pomodoro") return "Pomodoro Tracker";
    if (k === "habit_tracker") return "Habit Tracker";
    if (k === "energy_map") return "Energy Map";
    if (k === "weekly_review") return "Weekly Review";
    if (k === "weekly_win") return "Weekly Wins";
    if (k === "monthly_theme") return "Monthly Theme";
    if (k === "quarterly") return "Quarterly Plan";
    if (k === "year_plan") return "Year Plan (12-Month Map)";
    if (k === "five_year") return "5-Year Vision";
    if (k === "moving_average") return "90-Day Experiment";
    if (k === "reverse_plan") return "Reverse Planning";
    if (k === "sprint") return "Sprint (2-Week)";
    if (k.includes("bcg") || l.includes("bcg")) return "BCG Matrix";
    if (k.includes("ansoff") || l.includes("ansoff")) return "Ansoff Matrix";
    if (k.includes("swot") || l.includes("swot")) return "SWOT Analysis";
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return "4P Marketing Mix";
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return "9-Box Grid";
    return null;
}

function renderSpecial(
    tpl: Template,
    data: FrameworkData,
    onChange: (key: string, val: string) => void,
): React.ReactNode | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("bcg") || l.includes("bcg")) return <BcgGrid data={data} onChange={onChange} />;
    if (k.includes("swot") || l.includes("swot")) return <SwotGrid data={data} onChange={onChange} />;
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return <FourPGrid data={data} onChange={onChange} />;
    if (k.includes("ansoff") || l.includes("ansoff")) return <AnsoffGrid data={data} onChange={onChange} />;
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return <NineBoxGrid data={data} onChange={onChange} />;
    if (k.includes("empathy") || l.includes("공감")) return <EmpathyMapGrid data={data} onChange={onChange} />;
    if (k.includes("lean") || l.includes("린 캔버스")) return <LeanCanvasGrid data={data} onChange={onChange} />;
    if (k.includes("mandalart") || l.includes("만다라")) return <MandalartGrid data={data} onChange={onChange} />;
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return <EisenhowerGrid data={data} onChange={onChange} />;
    if (k.includes("pest") || l.includes("pest 분석")) return <PestGrid data={data} onChange={onChange} />;
    if (k.includes("moscow") || l.includes("moscow")) return <MoscowGrid data={data} onChange={onChange} />;
    if (k === "quadrant" || l.includes("4분면 매트릭스")) return <QuadrantBlankGrid data={data} onChange={onChange} />;
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return <BmcGrid data={data} onChange={onChange} />;
    if (k === "vpc" || l.includes("value proposition canvas")) return <VpcGrid data={data} onChange={onChange} />;
    if (k === "okr" || l === "okr") return <OkrGrid data={data} onChange={onChange} />;
    if (k.includes("persona") || l.includes("페르소나")) return <PersonaGrid data={data} onChange={onChange} />;
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return <JtbdGrid data={data} onChange={onChange} />;
    if (k === "rice") return <RiceGrid data={data} onChange={onChange} />;
    if (k === "5w1h") return <FiveW1HGrid data={data} onChange={onChange} />;
    if (k === "5why") return <FiveWhyGrid data={data} onChange={onChange} />;
    if (k.includes("ikigai") || l.includes("이키가이")) return <IkigaiGrid data={data} onChange={onChange} />;
    if (k.includes("porter")) return <Porter5Grid data={data} onChange={onChange} />;
    if (k.includes("scamper")) return <ScamperGrid data={data} onChange={onChange} />;
    if (k === "kano") return <KanoGrid data={data} onChange={onChange} />;
    if (k.includes("pareto") || l.includes("파레토") || l.includes("80/20")) return <ParetoGrid data={data} onChange={onChange} />;
    if (k.includes("fishbone") || l.includes("피쉬본")) return <FishboneGrid data={data} onChange={onChange} />;
    if (k.includes("journey") || l.includes("여정 지도")) return <JourneyMapGrid data={data} onChange={onChange} />;
    if (k.includes("retrospective") || l.includes("kpt")) return <KptGrid data={data} onChange={onChange} />;
    if (k === "ooda") return <OodaGrid data={data} onChange={onChange} />;
    if (k.includes("cornell") || l.includes("코넬")) return <CornellGrid data={data} onChange={onChange} />;
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return <DecisionMatrixGrid data={data} onChange={onChange} />;
    if (k.includes("feynman") || l.includes("파인만")) return <FeynmanGrid data={data} onChange={onChange} />;
    if (k === "1on1") return <OneOnOneGrid data={data} onChange={onChange} />;
    if (k === "meeting") return <MeetingGrid data={data} onChange={onChange} />;
    if (k === "interview") return <InterviewGrid data={data} onChange={onChange} />;
    if (k === "after_action") return <AarGrid data={data} onChange={onChange} />;
    if (k === "brainstorm") return <BrainstormGrid data={data} onChange={onChange} />;
    if (k === "decision_log") return <DecisionLogGrid data={data} onChange={onChange} />;
    if (k === "emotion_log") return <EmotionLogGrid data={data} onChange={onChange} />;
    if (k === "gratitude") return <GratitudeGrid data={data} onChange={onChange} />;
    if (k === "reading") return <ReadingGrid data={data} onChange={onChange} />;
    if (k === "standup") return <StandupGrid data={data} onChange={onChange} />;
    if (k === "weekly_journal") return <WeeklyJournalGrid data={data} onChange={onChange} />;
    if (k === "zettelkasten") return <ZettelkastenGrid data={data} onChange={onChange} />;
    if (k === "mindmap_outline") return <MindmapGrid data={data} onChange={onChange} />;
    if (k === "time_block") return <TimeBlockGrid data={data} onChange={onChange} />;
    if (k === "daily_design") return <DailyDesignGrid data={data} onChange={onChange} />;
    if (k === "deep_work") return <DeepWorkGrid data={data} onChange={onChange} />;
    if (k === "pomodoro") return <PomodoroGrid data={data} onChange={onChange} />;
    if (k === "habit_tracker") return <HabitTrackerGrid data={data} onChange={onChange} />;
    if (k === "energy_map") return <EnergyMapGrid data={data} onChange={onChange} />;
    if (k === "weekly_review") return <WeeklyReviewGrid data={data} onChange={onChange} />;
    if (k === "weekly_win") return <WeeklyWinGrid data={data} onChange={onChange} />;
    if (k === "monthly_theme") return <MonthlyThemeGrid data={data} onChange={onChange} />;
    if (k === "quarterly") return <QuarterlyGrid data={data} onChange={onChange} />;
    if (k === "year_plan") return <YearPlanGrid data={data} onChange={onChange} />;
    if (k === "five_year") return <FiveYearGrid data={data} onChange={onChange} />;
    if (k === "moving_average") return <MovingAverageGrid data={data} onChange={onChange} />;
    if (k === "reverse_plan") return <ReversePlanGrid data={data} onChange={onChange} />;
    if (k === "sprint") return <SprintGrid data={data} onChange={onChange} />;
    return null;
}

export function renderFramework(
    key: string,
    label: string,
    data: FrameworkData,
    onChange: (k: string, v: string) => void,
): React.ReactNode | null {
    return renderSpecial(
        { key, label, id: '', category: '', subcategory: null, description: null, body_md: '' },
        data,
        onChange,
    );
}

const isSpecialTemplate = isSpecial;

// ── 마크다운 렌더러 ──────────────────────────────────────────────────
function renderMd(md: string): React.ReactNode {
    const lines = md.split("\n");
    const nodes: React.ReactNode[] = [];
    let i = 0;

    function inlineRender(text: string): React.ReactNode {
        const parts: React.ReactNode[] = [];
        let rest = text;
        let key = 0;
        while (rest.length > 0) {
            const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
            const italicMatch = rest.match(/^(.*?)_(.+?)_(.*)/s);
            if (boldMatch && (!italicMatch || boldMatch[1].length <= italicMatch[1].length)) {
                if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
                parts.push(<strong key={key++} className="font-semibold text-neutral-900">{boldMatch[2]}</strong>);
                rest = boldMatch[3];
            } else if (italicMatch) {
                if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
                parts.push(<em key={key++} className="italic text-neutral-700">{italicMatch[2]}</em>);
                rest = italicMatch[3];
            } else {
                parts.push(<span key={key++}>{rest}</span>);
                rest = "";
            }
        }
        return parts.length === 1 ? parts[0] : <>{parts}</>;
    }

    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith("### ")) {
            nodes.push(<h3 key={i} className="text-xs font-semibold text-neutral-700 mt-4 mb-1 uppercase tracking-wider">{line.slice(4)}</h3>);
            i++; continue;
        }
        if (line.startsWith("## ")) {
            nodes.push(<h2 key={i} className="text-sm font-semibold text-neutral-800 mt-5 mb-2 border-b border-neutral-100 pb-1">{line.slice(3)}</h2>);
            i++; continue;
        }
        if (line.startsWith("# ")) {
            nodes.push(<h1 key={i} className="font-serif text-base text-neutral-900 mt-5 mb-2">{line.slice(2)}</h1>);
            i++; continue;
        }
        if (line.match(/^[-*]{3,}$/)) {
            nodes.push(<hr key={i} className="border-neutral-200 my-3" />);
            i++; continue;
        }
        if (line.startsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
            const rows = tableLines.filter(l => !l.match(/^\|[-| :]+\|$/));
            nodes.push(
                <div key={i} className="overflow-x-auto my-3">
                    <table className="w-full text-xs border-collapse">
                        <tbody>
                            {rows.map((r, ri) => {
                                const cells = r.split("|").slice(1, -1).map(c => c.trim());
                                return (
                                    <tr key={ri} className={ri === 0 ? "bg-neutral-50" : "border-t border-neutral-100"}>
                                        {cells.map((c, ci) => (
                                            ri === 0
                                                ? <th key={ci} className="text-left px-2 py-1 font-medium text-neutral-600">{c}</th>
                                                : <td key={ci} className="px-2 py-1 text-neutral-700">{inlineRender(c)}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }
        if (line.match(/^- \[[ x]\] /)) {
            const items: React.ReactNode[] = [];
            while (i < lines.length && lines[i].match(/^- \[[ x]\] /)) {
                const checked = lines[i][3] === "x";
                const text = lines[i].slice(6);
                items.push(
                    <li key={i} className="flex items-start gap-2 py-0.5">
                        <span className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[9px] font-bold ${checked ? "bg-[#0F766E] border-[#0F766E] text-white" : "border-neutral-300"}`}>
                            {checked && ""}
                        </span>
                        <span className={`text-xs leading-snug ${checked ? "line-through text-neutral-400" : "text-neutral-700"}`}>{inlineRender(text)}</span>
                    </li>
                );
                i++;
            }
            nodes.push(<ul key={`chk-${i}`} className="space-y-0.5 my-2">{items}</ul>);
            continue;
        }
        if (line.match(/^[-*] /) || line.match(/^\d+\. /)) {
            const items: React.ReactNode[] = [];
            const isOrdered = line.match(/^\d+\. /);
            while (i < lines.length && (lines[i].match(/^[-*] /) || lines[i].match(/^\d+\. /))) {
                const text = lines[i].replace(/^[-*] /, "").replace(/^\d+\. /, "");
                items.push(<li key={i} className="text-xs text-neutral-700 leading-snug py-0.5 pl-1">{inlineRender(text)}</li>);
                i++;
            }
            const cls = "my-2 space-y-0.5 " + (isOrdered ? "list-decimal list-inside" : "list-disc list-inside");
            nodes.push(isOrdered ? <ol key={`ol-${i}`} className={cls}>{items}</ol> : <ul key={`ul-${i}`} className={cls}>{items}</ul>);
            continue;
        }
        if (line.startsWith("    ") || line.startsWith("\t")) {
            nodes.push(
                <div key={i} className="ml-4 pl-3 border-l-2 border-neutral-200 py-0.5">
                    <span className="text-xs text-neutral-400">{inlineRender(line.trim())}</span>
                </div>
            );
            i++; continue;
        }
        if (line.trim() === "") {
            nodes.push(<div key={i} className="h-2" />);
            i++; continue;
        }
        nodes.push(<p key={i} className="text-xs text-neutral-700 leading-relaxed">{inlineRender(line)}</p>);
        i++;
    }
    return <>{nodes}</>;
}

// ── localStorage 키 ──────────────────────────────────────────────────
const FAV_KEY = "planners_tpl_favorites";
const dataKey = tplDataKey;

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
const VALID_CATS = ["all", "framework", "schedule", "note", "favorites"] as const;
type CatType = typeof VALID_CATS[number];

export function TemplatesView() {
    const searchParams = useSearchParams();
    const initialCat = (() => {
        const c = searchParams.get("category");
        return (VALID_CATS as readonly string[]).includes(c ?? "") ? (c as CatType) : "all";
    })();

    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [cat, setCat] = useState<CatType>(initialCat);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Template | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);
    const [tplData, setTplData] = useState<FrameworkData>({});

    useEffect(() => {
        try {
            const raw = localStorage.getItem(FAV_KEY);
            if (raw) setFavorites(new Set(JSON.parse(raw)));
        } catch { /* noop */ }
    }, []);

    // 템플릿 선택 시 데이터 초기화 (Templates 페이지는 저장고 — 데이터 저장 없음)
    useEffect(() => {
        setTplData({});
    }, [selected?.id]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/templates`);
            if (res.ok) {
                const d = await res.json();
                setTemplates(d.templates || []);
            }
            setLoading(false);
        })();
    }, []);

    function toggleFavorite(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch { /* noop */ }
            return next;
        });
    }

    const handleCellChange = useCallback((key: string, val: string) => {
        if (!selected) return;
        setTplData(prev => ({ ...prev, [key]: val }));
    }, [selected]);

    async function copyToClipboard() {
        if (!selected) return;
        const text = isSpecialTemplate(selected)
            ? exportFwText(selected, tplData)
            : selected.body_md;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* noop */ }
    }

    const filtered = useMemo(() => {
        let list = templates;
        if (cat === "favorites") list = list.filter(t => favorites.has(t.id));
        else if (cat !== "all") list = list.filter(t => t.category === cat);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(t =>
                t.label.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q) ||
                (t.subcategory ?? "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [templates, cat, query, favorites]);

    const counts = useMemo(() => {
        const c = { all: templates.length, framework: 0, schedule: 0, note: 0, favorites: 0 };
        templates.forEach(t => {
            if (t.category === "framework") c.framework++;
            else if (t.category === "schedule") c.schedule++;
            else if (t.category === "note") c.note++;
            if (favorites.has(t.id)) c.favorites++;
        });
        return c;
    }, [templates, favorites]);

    const grouped = useMemo(() => {
        const groups: Record<string, Template[]> = {};
        filtered.forEach(t => {
            const key = t.category;
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filtered]);

    const TABS = [
        { id: "all" as const, label: "전체" },
        { id: "framework" as const, label: "FrameWorkBook" },
        { id: "schedule" as const, label: "Schedule" },
        { id: "note" as const, label: "Note" },
        { id: "favorites" as const, label: "즐겨찾기" },
    ];

    const hasData = Object.values(tplData).some(v => v.trim());

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-2">
                <LayoutTemplate className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">Templates</h1>
            </div>
            <p className="text-sm text-neutral-500 mb-8">
                기획자의 사고 틀. Schedule · Note · FrameWorkBook. 프레임워크는 바로 채워 쓸 수 있습니다.
            </p>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름·설명 검색"
                    className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0F766E]"
                />
            </div>

            {/* 탭 필터 */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {TABS.map(tab => {
                    const meta = tab.id !== "all" && tab.id !== "favorites" ? CATEGORY_META[tab.id] : null;
                    const isActive = cat === tab.id;
                    const isFav = tab.id === "favorites";
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setCat(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                                isActive
                                    ? isFav
                                        ? "bg-slate-900 text-white"
                                        : "bg-[#0F766E] text-white"
                                    : isFav
                                        ? "bg-white border border-neutral-200 text-slate-700 hover:bg-slate-50"
                                        : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                            }`}
                        >
                            {isFav && <Heart className="h-3 w-3" fill={isActive ? "currentColor" : "none"} />}
                            {meta && <span className="opacity-70">{meta.icon}</span>}
                            {tab.label}
                            {counts[tab.id] > 0 && (
                                <span className="opacity-60">({counts[tab.id]})</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                    {cat === "favorites"
                        ? <><Heart className="h-8 w-8 mx-auto mb-3 text-neutral-200" />즐겨찾기한 템플릿이 없습니다.<br /><span className="text-xs">카드의 하트를 눌러 저장하세요.</span></>
                        : query ? `"${query}"에 대한 템플릿이 없습니다.` : "등록된 템플릿이 없습니다."
                    }
                </div>
            ) : cat === "all" ? (
                <div className="space-y-8">
                    {["framework", "schedule", "note"].map(catKey => {
                        const items = grouped[catKey];
                        if (!items?.length) return null;
                        const meta = CATEGORY_META[catKey];
                        return (
                            <div key={catKey}>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 w-fit ${meta.bg}`}>
                                    <span className={meta.color}>{meta.icon}</span>
                                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                                    <span className={`text-[10px] opacity-60 ${meta.color}`}>{items.length}개</span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map(tpl => (
                                        <TemplateCard
                                            key={tpl.id}
                                            tpl={tpl}
                                            isFavorite={favorites.has(tpl.id)}
                                            onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                                            onClick={() => setSelected(tpl)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(tpl => (
                        <TemplateCard
                            key={tpl.id}
                            tpl={tpl}
                            isFavorite={favorites.has(tpl.id)}
                            onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                            onClick={() => setSelected(tpl)}
                        />
                    ))}
                </div>
            )}

            {/* 모달 */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between gap-4 shrink-0">
                            <div className="min-w-0">
                                {(() => {
                                    const meta = CATEGORY_META[selected.category];
                                    return (
                                        <div className={`flex items-center gap-1.5 mb-2 w-fit px-2 py-1 rounded border text-[10px] font-medium ${meta?.bg} ${meta?.color}`}>
                                            {meta?.icon}
                                            {meta?.label || selected.category}
                                            {selected.subcategory && (
                                                <><ChevronRight className="h-2.5 w-2.5 opacity-50" /><span className="opacity-70">{selected.subcategory}</span></>
                                            )}
                                        </div>
                                    );
                                })()}
                                <h3 className="font-serif text-xl text-neutral-900 leading-tight">{selected.label}</h3>
                                {(() => {
                                    const en = getFrameworkBilingualName(selected);
                                    return en && en !== selected.label
                                        ? <p className="text-xs text-neutral-400 font-medium mt-0.5">{en}</p>
                                        : null;
                                })()}
                                {selected.description && (
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{selected.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={(e) => toggleFavorite(selected.id, e)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        favorites.has(selected.id)
                                            ? "text-slate-700 bg-slate-100 hover:bg-slate-200"
                                            : "text-neutral-400 hover:bg-neutral-100 hover:text-slate-700"
                                    }`}
                                    title="즐겨찾기"
                                >
                                    <Heart className="h-4 w-4" fill={favorites.has(selected.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {(() => {
                                const special = renderSpecial(selected, tplData, handleCellChange);
                                if (special) {
                                    return (
                                        <div>
                                            {special}
                                            {selected.body_md.trim() && (
                                                <details className="mt-4 border-t border-neutral-100 pt-4">
                                                    <summary className="text-[10px] text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-600 select-none">
                                                        작성 가이드 보기
                                                    </summary>
                                                    <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                                                        {renderMd(selected.body_md)}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-neutral-50 rounded-lg p-5 min-h-32">
                                        {renderMd(selected.body_md)}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 푸터 */}
                        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between shrink-0">
                            <span className="text-[11px] text-neutral-400">
                                {isSpecialTemplate(selected)
                                    ? hasData ? "연습용 입력입니다. 여기서 입력한 내용은 저장되지 않습니다." : "각 셀을 클릭해 바로 입력하세요."
                                    : 'Daily · 프로젝트 노트에서 "템플릿 삽입"으로 사용하세요.'
                                }
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3 text-[#0F766E]" /> : <Copy className="h-3 w-3" />}
                                {copied ? "복사됨" : hasData ? "내용 복사" : "마크다운 복사"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 템플릿 카드 ──────────────────────────────────────────────────────
function TemplateCard({
    tpl, isFavorite, onToggleFavorite, onClick,
}: {
    tpl: Template;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onClick: () => void;
}) {
    const meta = CATEGORY_META[tpl.category];
    const isSpecial = isSpecialTemplate(tpl);

    const previewLines = tpl.body_md
        .split("\n")
        .filter(l => l.trim() && !l.match(/^#{1,3} /) && !l.match(/^[-*]{3,}$/) && !l.startsWith("|"))
        .slice(0, 3)
        .map(l => l.replace(/^[-*\d.[\]x ]+/, "").replace(/\*\*/g, "").replace(/_/g, "").trim())
        .filter(Boolean);

    return (
        <div className="group relative bg-white border border-neutral-200 rounded-xl hover:border-[#0F766E]/40 hover:shadow-sm transition-all overflow-hidden cursor-pointer">
            <div className={`h-1 w-full ${meta?.bar ?? "bg-neutral-300"}`} />

            <button
                onClick={onToggleFavorite}
                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                    isFavorite
                        ? "text-slate-700 bg-slate-100 opacity-100"
                        : "text-neutral-300 bg-white/80 opacity-0 group-hover:opacity-100"
                }`}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
                <Heart className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <div className="p-4" onClick={onClick}>
                <div className="flex items-center gap-1.5 mb-2.5">
                    <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${meta?.bg} ${meta?.color}`}>
                        {meta?.icon}
                        {meta?.label || tpl.category}
                    </span>
                    {tpl.subcategory && (
                        <span className="text-[9px] text-neutral-400 truncate">{tpl.subcategory}</span>
                    )}
                    {isSpecial && (
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            채울 수 있음
                        </span>
                    )}
                </div>

                <h4 className="font-semibold text-neutral-900 text-sm leading-snug mb-2 group-hover:text-[#0F766E] transition-colors pr-6">
                    {tpl.label}
                </h4>

                {tpl.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-3">
                        {tpl.description}
                    </p>
                )}

                {previewLines.length > 0 && !isSpecial && (
                    <div className="bg-neutral-50 rounded-md px-3 py-2 space-y-0.5">
                        {previewLines.map((l, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                                <span className="text-[10px] text-neutral-400 truncate">{l}</span>
                            </div>
                        ))}
                    </div>
                )}

                {isSpecial && (
                    <div className="bg-slate-50 rounded-md px-3 py-2 flex items-center gap-2">
                        <div className="grid grid-cols-2 gap-0.5 shrink-0">
                            {[0,1,2,3].map(n => <div key={n} className="w-3 h-3 rounded-sm bg-slate-300" />)}
                        </div>
                        <span className="text-[10px] text-slate-500">클릭해서 바로 채우기</span>
                    </div>
                )}
            </div>
        </div>
    );
}
