"use client";

import { useBumsFilter } from "../layout";
import { BarChart3 } from "lucide-react";

export default function StatsPage() {
    const { selectedSiteId } = useBumsFilter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">통계</h1>
                <p className="text-sm text-neutral-500 mt-1">사이트별 방문자, 게시글, 매출 통계를 분석합니다.</p>
            </div>

            <div className="bg-white border border-neutral-100 p-12 text-center">
                <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-400">준비 중입니다</h2>
                <p className="text-sm text-neutral-400 mt-2">이 기능은 곧 제공됩니다.</p>
            </div>
        </div>
    );
}
