"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

declare global {
    interface Window {
        TossPayments?: (clientKey: string) => {
            requestPayment: (method: string, params: Record<string, unknown>) => Promise<unknown>;
        };
    }
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // Toss 테스트 키
const PRICE_KRW = 19000;

export function PurchaseView() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ mode: string; subscription_status: string; expires: string | null; is_pdf_buyer: boolean } | null>(null);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        fetch("/api/planners/settings").then(async r => {
            if (r.ok) {
                const d = await r.json();
                if (d.user) {
                    setStatus({
                        mode: d.user.mode,
                        subscription_status: d.user.subscription_status,
                        expires: d.user.subscription_expires_at,
                        is_pdf_buyer: d.user.is_pdf_buyer,
                    });
                }
            }
        });
    }, [isLoading, isAuthenticated]);

    async function handlePay() {
        if (!user || !window.TossPayments) return;
        setLoading(true);
        try {
            const orderRes = await fetch("/api/planners/payment/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: PRICE_KRW, years: 1 }),
            });
            if (!orderRes.ok) throw new Error("주문 생성 실패");
            const { orderId } = await orderRes.json();

            const tp = window.TossPayments(TOSS_CLIENT_KEY);
            await tp.requestPayment("카드", {
                amount: PRICE_KRW,
                orderId,
                orderName: "Planner's Planner AI 1년 구독",
                customerEmail: user.email,
                customerName: user.name || user.email,
                successUrl: `${window.location.origin}/api/planners/payment/success`,
                failUrl: `${window.location.origin}/planners/purchase?failed=1`,
            });
        } catch (e) {
            console.error(e);
            alert(`결제 요청 실패: ${(e as Error).message}`);
            setLoading(false);
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    if (!isAuthenticated) {
        router.replace("/login?redirect=/planners/purchase");
        return null;
    }

    return (
        <>
            <Script src="https://js.tosspayments.com/v1/payment" strategy="afterInteractive" />

            <div className="min-h-screen bg-[#FAFAF7] py-12 md:py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest text-[#0F766E] mb-3">Ten:One™</p>
                        <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 leading-tight">
                            Planner&apos;s Planner AI
                        </h1>
                        <p className="text-neutral-500 mt-3 text-sm">
                            나의 정체성을 세우고 도모(圖謀)하는 1년.
                        </p>
                    </div>

                    {/* 현재 상태 */}
                    {status && status.subscription_status === "active" && (
                        <div className="bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-xl p-5 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="h-4 w-4 text-[#0F766E]" />
                                <p className="text-sm font-semibold text-[#0F766E]">활성 구독</p>
                            </div>
                            {status.expires && (
                                <p className="text-xs text-neutral-600">
                                    만료: {new Date(status.expires).toLocaleDateString('ko-KR')}
                                </p>
                            )}
                            <button
                                onClick={() => router.push("/planners/app")}
                                className="mt-3 text-sm text-[#0F766E] hover:underline"
                            >
                                앱으로 이동 →
                            </button>
                        </div>
                    )}

                    {/* 가격 카드 */}
                    <div className="bg-white border-2 border-[#0F766E] rounded-2xl p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-[#0F766E]" />
                            <p className="text-xs font-semibold text-[#0F766E] uppercase tracking-widest">연간 구독</p>
                        </div>

                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="font-serif text-5xl text-neutral-900">19,000</span>
                            <span className="text-lg text-neutral-500">원 / 연</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {[
                                "능동 AI 브리핑 (아침·점심·저녁 정리)",
                                "Personal Identity · Yearly · Monthly · Weekly · Daily",
                                "Project Book (Vrief 4단계 + GPR 7필드)",
                                "템플릿 109종 (스케줄·노트·프레임워크)",
                                "전체 기록 풀텍스트 검색",
                                "Copy-to-AI (Claude·ChatGPT·Gemini 심층 검증)",
                                "모든 기기 동기화",
                            ].map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                                    <Check className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>

                        {status?.subscription_status !== "active" && (
                            <button
                                onClick={handlePay}
                                disabled={loading}
                                className="w-full py-4 bg-[#0F766E] text-white rounded-xl font-semibold hover:bg-[#0d5e56] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> 처리 중…</> : "1년 구독 시작"}
                            </button>
                        )}

                        <p className="text-xs text-neutral-400 text-center mt-4 leading-relaxed">
                            Toss Payments 보안 결제 · 7일 이내 환불 가능<br />
                            정기결제 아님 (수동 갱신)
                        </p>
                    </div>

                    {/* PDF 구매자 안내 */}
                    <div className="mt-6 bg-white border border-neutral-200 rounded-xl p-5 text-center">
                        <p className="text-sm text-neutral-700 font-medium">종이 플래너'스 플래너 구매자이신가요?</p>
                        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                            Badak Mall에서 2026 플래너를 구매하셨다면 1년 구독을 <strong className="text-[#0F766E]">무료로</strong> 제공해 드립니다.<br />
                            <a href="mailto:lools@tenone.biz?subject=PP AI 구독 무료 활성화 요청" className="text-[#0F766E] hover:underline">
                                lools@tenone.biz로 주문번호와 함께 문의
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
