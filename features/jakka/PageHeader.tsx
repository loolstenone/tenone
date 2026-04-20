import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    backHref?: string;
    action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, backHref, action }: PageHeaderProps) {
    return (
        <header className="border-b border-neutral-200 bg-white">
            {backHref && (
                <div className="px-5 pt-5">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        돌아가기
                    </Link>
                </div>
            )}
            <div className="px-5 pt-4 pb-7 flex items-end justify-between gap-4">
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-1.5">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-[28px] font-black tracking-tight leading-none mb-2 text-neutral-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[13px] text-neutral-700 leading-relaxed max-w-prose">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </header>
    );
}
