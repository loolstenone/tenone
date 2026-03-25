"use client";

import { useBumsFilter } from "../layout";
import { Gift } from "lucide-react";

export default function PromotionPage() {
    const { selectedSiteId } = useBumsFilter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">프로모션</h1>
                <p className="text-sm text-neutral-500 mt-1">프로모션과 이벤트를 관리합니다.</p>
            </div>

            <div className="bg-white border border-neutral-100 p-12 text-center">
                <Gift className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-400">준비 중입니다</h2>
                <p className="text-sm text-neutral-400 mt-2">이 기능은 곧 제공됩니다.</p>
            </div>
        </div>
    );
}
