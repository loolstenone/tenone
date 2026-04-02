"use client";

import { ReactNode } from "react";
import clsx from "clsx";

/* ────────────────────────────────────────────────
   페이지 헤더
   - 아이콘 없음 / 타이포그래피 기준
   - separator: 하단 구분선 표시 여부 (기본 true)
────────────────────────────────────────────────── */
export function PageHeader({
    title,
    description,
    separator = true,
    children,
}: {
    title: string;
    description?: string;
    separator?: boolean;
    children?: ReactNode;
}) {
    return (
        <div className={clsx(
            "flex items-start justify-between",
            separator ? "border-b border-neutral-100 pb-5 mb-6" : "mb-6"
        )}>
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900 leading-snug">{title}</h1>
                {description && (
                    <p className="text-sm text-neutral-400 mt-0.5">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2 shrink-0 ml-4">{children}</div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────
   스탯 카드
   - 라벨 → 값 순서 (위→아래)
   - 아이콘은 우측 선택 표시
   - href 있으면 클릭 가능
────────────────────────────────────────────────── */
export function StatCard({
    label,
    value,
    sub,
    icon,
    href,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon?: ReactNode;
    href?: string;
}) {
    const inner = (
        <div className="border border-neutral-150 bg-white p-5 group-hover:border-neutral-300 transition-colors">
            <div className="flex items-start justify-between">
                <p className="text-xs text-neutral-400 leading-none">{label}</p>
                {icon && <span className="text-neutral-300 shrink-0">{icon}</span>}
            </div>
            <p className="text-2xl font-semibold text-neutral-900 mt-3 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-neutral-400 mt-1.5">{sub}</p>}
        </div>
    );
    if (href) {
        return (
            <a href={href} className="group block">
                {inner}
            </a>
        );
    }
    return inner;
}

/* ────────────────────────────────────────────────
   카드 (섹션 컨테이너)
────────────────────────────────────────────────── */
export function Card({
    children,
    className,
    padding = true,
}: {
    children: ReactNode;
    className?: string;
    padding?: boolean;
}) {
    return (
        <div className={clsx("border border-neutral-150 bg-white", padding && "p-5", className)}>
            {children}
        </div>
    );
}

/* ────────────────────────────────────────────────
   섹션 타이틀
   - 아이콘 없음 원칙
   - 우측 액션 링크 선택
────────────────────────────────────────────────── */
export function SectionTitle({
    title,
    action,
    actionHref,
    actionOnClick,
}: {
    title: string;
    action?: string;
    actionHref?: string;
    actionOnClick?: () => void;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{title}</h3>
            {action && (actionHref || actionOnClick) && (
                actionHref
                    ? <a href={actionHref} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">{action} →</a>
                    : <button onClick={actionOnClick} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">{action}</button>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────
   탭 네비게이션
────────────────────────────────────────────────── */
export function TabNav({
    tabs,
    active,
    onChange,
}: {
    tabs: { id: string; label: string }[];
    active: string;
    onChange: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-0 border-b border-neutral-100 mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={clsx(
                        "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                        active === tab.id
                            ? "border-neutral-900 text-neutral-900"
                            : "border-transparent text-neutral-400 hover:text-neutral-600"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/* ────────────────────────────────────────────────
   버튼
────────────────────────────────────────────────── */
export function PrimaryButton({
    children,
    onClick,
    href,
    disabled,
    size = "md",
    type = "button",
}: {
    children: ReactNode;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    size?: "sm" | "md";
    type?: "button" | "submit";
}) {
    const cls = clsx(
        "inline-flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium tracking-tight",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
    );
    if (href) return <a href={href} className={cls}>{children}</a>;
    return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function SecondaryButton({
    children,
    onClick,
    size = "md",
    disabled,
}: {
    children: ReactNode;
    onClick?: () => void;
    size?: "sm" | "md";
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "inline-flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors font-medium",
                size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    );
}

/* ────────────────────────────────────────────────
   빈 상태
────────────────────────────────────────────────── */
export function EmptyState({
    title,
    description,
    action,
}: {
    icon?: ReactNode; // 하위 호환 — 사용하지 않음
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-px bg-neutral-200 mb-6" />
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            {description && <p className="text-xs text-neutral-400 mt-1">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* ────────────────────────────────────────────────
   테이블
────────────────────────────────────────────────── */
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-100">
                        {headers.map(h => (
                            <th key={h} className="text-left py-3 px-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

/* ────────────────────────────────────────────────
   배지
────────────────────────────────────────────────── */
export function Badge({
    label,
    variant = "default",
}: {
    label: string;
    variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
    const colors = {
        default: "bg-neutral-100 text-neutral-500",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        danger: "bg-red-50 text-red-600",
        info: "bg-blue-50 text-blue-600",
    };
    return (
        <span className={clsx("inline-flex px-2 py-0.5 text-[11px] font-medium", colors[variant])}>
            {label}
        </span>
    );
}

/* ────────────────────────────────────────────────
   로딩 스피너
────────────────────────────────────────────────── */
export function Spinner() {
    return (
        <div className="flex justify-center py-20">
            <div className="h-5 w-5 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
        </div>
    );
}

/* ────────────────────────────────────────────────
   구분선 (섹션 사이)
────────────────────────────────────────────────── */
export function Divider({ className }: { className?: string }) {
    return <div className={clsx("border-t border-neutral-100", className)} />;
}

/* ────────────────────────────────────────────────
   메트릭 행 (인라인 수치)
   사용: <MetricRow items={[{label, value, color?}]} />
────────────────────────────────────────────────── */
export function MetricRow({
    items,
}: {
    items: { label: string; value: string | number; color?: string }[];
}) {
    return (
        <div className="flex items-center gap-6">
            {items.map((item, i) => (
                <div key={i}>
                    <p className="text-xs text-neutral-400">{item.label}</p>
                    <p className={clsx("text-base font-semibold mt-0.5", item.color ?? "text-neutral-900")}>{item.value}</p>
                </div>
            ))}
        </div>
    );
}
