"use client";

// 템플릿 그리드들이 공통으로 쓰는 타입·유틸·컴포넌트.
// TemplatesView.tsx 는 이 모듈에서 import 한다. 외부(DailyView·ProjectNotesTab)는
// TemplatesView 가 re-export 하는 `FrameworkData`·`renderFramework` 만 쓰면 된다.

import type { ReactNode } from "react";

/** 그리드 셀 데이터 — key → value 평면 객체 */
export type FrameworkData = Record<string, string>;

/** 사분면 매트릭스용 4단계 톤 (slate 베이스 + 좌측 1px 액센트) */
export const Q_TONE = {
    primary:   "bg-slate-50 border-l-2 border-slate-900 border-y border-r border-slate-200",   // 핵심 (Star, Do)
    secondary: "bg-white border-l-2 border-slate-600 border-y border-r border-slate-200",      // 주요 (Schedule, Cash Cow)
    tertiary:  "bg-white border-l-2 border-slate-400 border-y border-r border-slate-200",      // 보조 (Question, Delegate)
    muted:     "bg-slate-50/50 border-l-2 border-slate-300 border-y border-r border-slate-200",// 약함 (Dog, Eliminate)
} as const;

export const Q_TEXT = {
    primary:   "text-slate-900",
    secondary: "text-slate-800",
    tertiary:  "text-slate-700",
    muted:     "text-slate-500",
} as const;

export type QToneKey = keyof typeof Q_TONE;

/** 사분면 정의 — 각 quadrant 의 키·라벨·설명·색상 */
export interface QuadrantDef {
    key: string;
    label: string;
    desc: string;
    color: string;
    text: string;
}

/** 셀 textarea 표준 컴포넌트 */
export function CellTextarea({
    cellKey, value, onChange, placeholder = "내용을 입력하세요…",
}: {
    cellKey: string;
    value: string;
    onChange: (key: string, val: string) => void;
    placeholder?: string;
}) {
    return (
        <textarea
            value={value}
            onChange={e => onChange(cellKey, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full mt-1.5 resize-none bg-transparent text-[11px] text-slate-700 placeholder:text-slate-300 placeholder:italic focus:outline-none leading-relaxed font-normal"
        />
    );
}

/**
 * QuadrantGrid — 표준 데카르트 좌표 컨벤션
 *
 * X축: Low ← → High (왼쪽이 -, 오른쪽이 +)
 * Y축: 위가 High (+), 아래가 Low (-)
 *
 * quads 배열 순서 (CSS grid 2x2 row-major):
 *   [0] top-left    = X-, Y+ (Q2)
 *   [1] top-right   = X+, Y+ (Q1)
 *   [2] bottom-left = X-, Y- (Q3)
 *   [3] bottom-right= X+, Y- (Q4)
 *
 * 컨설팅급 디자인: slate 베이스, 1px 좌측 액센트 보더, 미니멀 타이포
 */
export function QuadrantGrid({
    axisX, axisXHigh, axisXLow,
    axisY, axisYHigh, axisYLow,
    quads,
    data, onChange,
}: {
    axisX: string; axisXHigh: string; axisXLow: string;
    axisY: string; axisYHigh: string; axisYLow: string;
    quads: QuadrantDef[];
    data: FrameworkData;
    onChange: (k: string, v: string) => void;
}) {
    return (
        <div className="my-3 select-none">
            {/* 상단 X축 — Low ← X → High (표준 컨벤션) */}
            <div className="flex items-center justify-center mb-3 ml-9">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">{axisXLow}</span>
                <span className="mx-2 text-slate-300">←</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700">{axisX}</span>
                <span className="mx-2 text-slate-300">→</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">{axisXHigh}</span>
            </div>
            <div className="flex gap-2">
                {/* Y축 — 위 High, 아래 Low (표준 컨벤션, transform 기반 회전으로 다국어 일관) */}
                <div className="flex flex-col items-center justify-between shrink-0 w-8 py-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">{axisYHigh}</span>
                    <div className="flex flex-col items-center justify-center flex-1 gap-1">
                        <span className="text-slate-300 leading-none">↑</span>
                        <span className="inline-block -rotate-90 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] font-bold text-slate-700 my-3">{axisY}</span>
                        <span className="text-slate-300 leading-none">↓</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">{axisYLow}</span>
                </div>
                {/* 2x2 그리드 */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                    {quads.map((q) => (
                        <div
                            key={q.key}
                            className={`rounded-md p-3 min-h-32 transition-shadow hover:shadow-sm ${q.color}`}
                        >
                            <p className={`text-[11px] font-bold tracking-wide uppercase ${q.text}`}>{q.label}</p>
                            <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{q.desc}</p>
                            <CellTextarea cellKey={q.key} value={data[q.key] ?? ""} onChange={onChange} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Header chip 등 자주 쓰는 헬퍼들의 자리 (확장용) */
export type GridProps = {
    data: FrameworkData;
    onChange: (key: string, val: string) => void;
};

/** Re-export 헬퍼 — 다른 그리드 파일이 한 줄로 import 하도록 */
export type { ReactNode };
