"use client";

// 한국어 / English 토글 — Settings 또는 헤더에 임베드

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/myverse/i18n";

export function LocaleToggle({ compact = false }: { compact?: boolean }) {
    const [locale, setLocale] = useLocale();

    if (compact) {
        return (
            <button
                onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
                title="언어 / Language"
                className="p-1.5 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors inline-flex items-center gap-1"
            >
                <Languages className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase">{locale}</span>
            </button>
        );
    }

    return (
        <div className="inline-flex items-center bg-neutral-100 rounded-lg p-0.5">
            <button
                onClick={() => setLocale("ko")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    locale === "ko" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
            >
                한국어
            </button>
            <button
                onClick={() => setLocale("en")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    locale === "en" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
            >
                English
            </button>
        </div>
    );
}
