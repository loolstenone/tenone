"use client";

// 모든 lane 페이지의 표준 헤더 — Stitch 디자인 (세션 122)
//   ┌ 인디고 라벨 (Material Symbol + UPPERCASE 영문)
//   ├ Hanken Grotesk h1 (28~32px, medium, tracking-tight)
//   └ 부제 (Inter, 14px, neutral-500)
//
// 사용:
//   <LaneHeader icon="settings" label="SETTINGS" title="설정" subtitle="..." />

import type { ReactNode } from "react";

const ACCENT = "#6366F1";

export function LaneHeader({
    icon,
    label,
    title,
    subtitle,
    actions,
}: {
    icon: string;            // Material Symbol 이름 (auto_awesome, photo_library 등)
    label: string;            // "ASK MYVERSE", "TRACES" 등
    title: string;            // "흔적", "AI 코치" 등
    subtitle?: string;        // 부제
    actions?: ReactNode;      // 우측 버튼 슬롯
}) {
    return (
        <div className="mb-6 flex items-start justify-between gap-3">
            <div>
                <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
                    <span
                        className="material-symbols-outlined text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        {icon}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest">
                        {label}
                    </span>
                </div>
                <h1
                    className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 myverse-dark:text-white leading-tight"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-neutral-500 myverse-dark:text-neutral-400 mt-1.5">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
    );
}
