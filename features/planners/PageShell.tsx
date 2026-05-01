"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 모든 PP AI 앱 페이지의 컨테이너 SSOT.
 * 폭(max-w-6xl) · 좌우 패딩(px-4 md:px-10) · 상하 패딩(py-6 md:py-12) 통일.
 */
export function PageShell({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`pp-view max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 ${className}`}>
            {children}
        </div>
    );
}

const STATE_LABEL = {
    today: "오늘",
    this_week: "이번 주",
    this_month: "이번 달",
    this_year: "올해",
} as const;

export type PageHeaderState = keyof typeof STATE_LABEL;

interface PageHeaderProps {
    icon?: ReactNode;
    title: ReactNode;
    /** 타이틀 우측에 밑줄 스타일로 표시되는 상태 */
    state?: PageHeaderState | null;
    subtitle?: ReactNode;
    /** 좌측 화살표 (시간뷰 이전 이동) */
    onPrev?: () => void;
    /** 우측 화살표 (시간뷰 다음 이동) */
    onNext?: () => void;
    /** 헤더 우측 슬롯 (액션 버튼·서브링크 등) */
    right?: ReactNode;
    className?: string;
}

/**
 * 모든 PP AI 앱 페이지의 헤더 SSOT.
 * - 타이틀: font-serif text-2xl md:text-3xl text-neutral-900
 * - 상태배지: 텍스트 + 밑줄 (chip 박스 아님)
 * - prev/next 화살표는 시간뷰(Daily/Weekly/Monthly/Yearly)에서만 사용
 */
export function PageHeader({
    icon,
    title,
    state,
    subtitle,
    onPrev,
    onNext,
    right,
    className = "",
}: PageHeaderProps) {
    return (
        <div className={`mb-6 md:mb-8 ${className}`}>
            <div className="flex items-center gap-2 flex-wrap">
                {onPrev && (
                    <button
                        type="button"
                        onClick={onPrev}
                        className="p-1 rounded hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] text-neutral-400 transition-colors"
                        aria-label="이전"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}
                {icon && <span className="text-[#0F766E] shrink-0 inline-flex items-center">{icon}</span>}
                <h1
                    className={`font-serif text-2xl md:text-3xl text-neutral-900 planners-dark:text-neutral-100 whitespace-nowrap ${
                        state ? "underline decoration-[#0F766E] decoration-2 underline-offset-[6px]" : ""
                    }`}
                    title={state ? STATE_LABEL[state] : undefined}
                >
                    {title}
                </h1>
                {onNext && (
                    <button
                        type="button"
                        onClick={onNext}
                        className="p-1 rounded hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] text-neutral-400 transition-colors"
                        aria-label="다음"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
                {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
            </div>
            {subtitle && (
                <div className="text-sm text-neutral-500 planners-dark:text-neutral-400 mt-1">
                    {subtitle}
                </div>
            )}
        </div>
    );
}
