"use client";

import { ReactNode } from "react";
import clsx from "clsx";

/* ── 페이지 헤더 ── */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
                {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}

/* ── 스탯 카드 ── */
export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: ReactNode }) {
    return (
        <div className="border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">{label}</span>
                {icon && <span className="text-neutral-400">{icon}</span>}
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
        </div>
    );
}

/* ── 카드 (섹션 컨테이너) ── */
export function Card({ children, className, padding = true }: { children: ReactNode; className?: string; padding?: boolean }) {
    return (
        <div className={clsx("border border-neutral-200 bg-white", padding && "p-5", className)}>
            {children}
        </div>
    );
}

/* ── 섹션 타이틀 ── */
export function SectionTitle({ title, action, actionHref }: { title: string; action?: string; actionHref?: string }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
            {action && actionHref && (
                <a href={actionHref} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">{action} →</a>
            )}
        </div>
    );
}

/* ── 탭 네비게이션 ── */
export function TabNav({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: ReactNode }[]; active: string; onChange: (id: string) => void }) {
    return (
        <div className="flex items-center gap-1 border-b border-neutral-200 mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                        active === tab.id
                            ? "border-neutral-900 text-neutral-900"
                            : "border-transparent text-neutral-400 hover:text-neutral-600"
                    )}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/* ── 기본 버튼 ── */
export function PrimaryButton({ children, onClick, href, disabled, size = "md" }: { children: ReactNode; onClick?: () => void; href?: string; disabled?: boolean; size?: "sm" | "md" }) {
    const cls = clsx(
        "inline-flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        disabled && "opacity-50 cursor-not-allowed"
    );
    if (href) return <a href={href} className={cls}>{children}</a>;
    return <button onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function SecondaryButton({ children, onClick, size = "md" }: { children: ReactNode; onClick?: () => void; size?: "sm" | "md" }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "inline-flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors font-medium",
                size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
            )}
        >
            {children}
        </button>
    );
}

/* ── 빈 상태 ── */
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {icon && <div className="text-neutral-300 mb-4">{icon}</div>}
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            {description && <p className="text-xs text-neutral-400 mt-1">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* ── 테이블 ── */
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-200">
                        {headers.map(h => (
                            <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

/* ── 뱃지 ── */
export function Badge({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
    const colors = {
        default: "bg-neutral-100 text-neutral-600",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
        info: "bg-blue-50 text-blue-700",
    };
    return <span className={clsx("inline-flex px-2 py-0.5 text-[11px] font-medium", colors[variant])}>{label}</span>;
}

/* ── 로딩 스피너 ── */
export function Spinner() {
    return (
        <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
        </div>
    );
}
