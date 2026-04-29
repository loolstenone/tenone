"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Planners/app] error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">오류</p>
            <h1 className="font-serif text-3xl text-neutral-900 mb-3">앱 오류가 발생했습니다</h1>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                잠시 후 다시 시도해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={reset}
                    className="inline-block bg-[#0F766E] text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    다시 시도
                </button>
                <Link
                    href="/planners/app"
                    className="inline-block border border-neutral-200 text-neutral-700 text-sm font-medium px-6 py-3 rounded-lg hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                >
                    앱 홈으로
                </Link>
            </div>
        </div>
    );
}
