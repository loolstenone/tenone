"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutTemplate, Sparkles, Maximize, Minimize } from "lucide-react";

export function PlannersUtilityLinks({ className = "" }: { className?: string }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function onChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (e) {
            console.warn("fullscreen toggle failed", e);
        }
    }

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
            <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "전체화면 종료 (Esc)" : "전체화면 모드 (주소창·탭 숨김)"}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-neutral-200 bg-white text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
                {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
            </button>
        </div>
    );
}
