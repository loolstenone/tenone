"use client";

import { useBumsFilter } from "../layout";
import { ShoppingCart } from "lucide-react";

export default function ShopPage() {
    const { selectedSiteId } = useBumsFilter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">쇼핑 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">상품, 주문, 결제를 관리합니다.</p>
            </div>

            <div className="bg-white border border-neutral-100 p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-400">준비 중입니다</h2>
                <p className="text-sm text-neutral-400 mt-2">이 기능은 곧 제공됩니다.</p>
            </div>
        </div>
    );
}
