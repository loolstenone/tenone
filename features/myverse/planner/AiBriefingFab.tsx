"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AiBriefingFab() {
    return (
        <Link
            href="/myverse/app/ask"
            title="Ask Myverse"
            aria-label="Ask Myverse로 이동"
            className="hidden md:flex fixed bottom-[5.25rem] right-5 z-[8500] w-12 h-12 rounded-full shadow-lg items-center justify-center bg-white text-[var(--pp-accent)] border border-[var(--pp-accent)]/30 hover:border-[var(--pp-accent)] hover:scale-105 transition-all"
        >
            <Sparkles className="h-5 w-5" />
        </Link>
    );
}
