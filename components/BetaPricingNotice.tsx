import { BETA_PRICING_NOTICE, PAID_LAUNCH } from "@/lib/paid-launch";

/** 요금제·구매 화면 상단 베타 안내 — 유료화(PAID_LAUNCH) 후 자동으로 사라진다 */
export function BetaPricingNotice({ className = "" }: { className?: string }) {
    if (PAID_LAUNCH) return null;
    return (
        <div role="note" className={`rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`}>
            <span className="mr-2 font-semibold">베타 테스트</span>
            {BETA_PRICING_NOTICE}
        </div>
    );
}
