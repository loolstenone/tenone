"use client";

import Link from "next/link";
import { LayoutTemplate, Sparkles } from "lucide-react";

/**
 * 메인 네비에서 빠진 Templates / AI Briefing 을 본문 상단 서브 메뉴 링크로 제공.
 * Index / Today(DailyView) / Project 등 주요 본문 상단에 배치.
 */
export function PlannersUtilityLinks({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Link
                href="/planners/app/templates"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
                <LayoutTemplate className="h-3 w-3" />
                Templates
            </Link>
            <Link
                href="/planners/app/ai-briefing"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
                <Sparkles className="h-3 w-3" />
                AI Briefing
            </Link>
        </div>
    );
}
