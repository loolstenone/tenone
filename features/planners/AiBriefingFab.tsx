"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AiBriefingFab() {
    return (
        <Link
            href="/planners/app/ai-briefing"
            title="AI 브리핑"
            aria-label="AI 브리핑으로 이동"
            className="hidden md:flex fixed bottom-[5.25rem] right-5 z-[8500] w-12 h-12 rounded-full shadow-lg items-center justify-center bg-white text-[#0F766E] border border-[#0F766E]/30 hover:border-[#0F766E] hover:scale-105 transition-all"
        >
            <Sparkles className="h-5 w-5" />
        </Link>
    );
}
