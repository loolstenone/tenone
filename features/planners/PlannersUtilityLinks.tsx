"use client";

import Link from "next/link";
import { LayoutTemplate, Sparkles } from "lucide-react";

export function PlannersUtilityLinks({ className = "" }: { className?: string }) {
    return (
        <div className={`hidden sm:flex items-center gap-2 ${className}`}>
            <Link
                href="/planners/app/templates"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
                <LayoutTemplate className="h-3 w-3" />
                템플릿
            </Link>
            <Link
                href="/planners/app/ai-briefing"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
                <Sparkles className="h-3 w-3" />
                AI 브리핑
            </Link>
        </div>
    );
}
