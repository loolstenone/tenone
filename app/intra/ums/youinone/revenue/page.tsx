"use client";

import { Construction } from "lucide-react";

export default function YouInOneRevenuePage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">손익 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">YouInOne 시수 · 정산 현황</p>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center border border-neutral-200 rounded-lg">
                <Construction className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-sm text-neutral-400">WIO 타임시트 · 정산 연동 준비 중</p>
                <p className="text-xs text-neutral-300 mt-2">크루 시수 기록 · 월별 정산 · 지급 내역</p>
            </div>
        </div>
    );
}
