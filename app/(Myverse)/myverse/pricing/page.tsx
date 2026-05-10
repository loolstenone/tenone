import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Bell } from "lucide-react";

export const metadata: Metadata = {
    title: "가격 — 무료로 시작",
    description: "Myverse는 채집·정리가 무료. AI 코치와 외부 자동 임포트는 Phase 2에서 도입됩니다.",
    openGraph: {
        title: "가격 | Myverse",
        description: "무료로 시작, 필요한 만큼 확장.",
    },
};

type Status = "ready" | "beta" | "phase2";
type Feature = { label: string; status: Status };

const STATUS_LABEL: Record<Status, { text: string; cls: string }> = {
    ready:  { text: "제공",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    beta:   { text: "베타",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
    phase2: { text: "Phase 2", cls: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

const FREE_FEATURES: Feature[] = [
    { label: "채집 무제한 (사진·영상·위치·음성·메모)", status: "ready" },
    { label: "9 영역 자동 분류",                          status: "beta" },
    { label: "시간축 (일/주/월/년)",                      status: "ready" },
    { label: "관계 (사람 단위 횡단)",                     status: "beta" },
    { label: "@handle 공개 페이지",                       status: "ready" },
    { label: "데이터 일괄 다운로드·삭제",                 status: "ready" },
    { label: "Instagram·KakaoTalk·Calendar 임포트",       status: "beta" },
];

const PRO_FEATURES: Feature[] = [
    { label: "AI 코치 — 일일 브리핑·주간 리포트", status: "phase2" },
    { label: "교차 인사이트 (영역 간 패턴 분석)",  status: "phase2" },
    { label: "외부 자동 임포트 (Google Photos 등)", status: "phase2" },
    { label: "OCR·STT·Vision 자동 분류",          status: "phase2" },
    { label: "타임캡슐 무제한",                    status: "phase2" },
    { label: "우선 지원",                          status: "phase2" },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen pt-20 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
                        Pricing
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
                        무료로 시작, <br className="sm:hidden" />필요한 만큼 확장
                    </h1>
                    <p className="text-base text-neutral-500 max-w-xl mx-auto">
                        지금은 Phase 1 — 채집·정리·기본 기능을 무료로 제공합니다.
                        Pro는 Phase 2(다음 단계) 출시 시 시작됩니다.
                    </p>
                </div>

                {/* 두 플랜 */}
                <div className="grid md:grid-cols-2 gap-5">
                    {/* Free */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-7">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Free</h2>
                            <p className="text-xs text-neutral-500">현재 운영 중 — 누구나 무료</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-neutral-900">₩0</span>
                            <span className="text-sm text-neutral-500 ml-1">/월</span>
                        </div>
                        <Link
                            href="/myverse/login"
                            className="block w-full py-2.5 text-sm font-semibold text-center border border-neutral-200 hover:border-neutral-400 text-neutral-900 rounded-lg transition-colors mb-7"
                        >
                            무료로 시작
                        </Link>
                        <FeatureList features={FREE_FEATURES} />
                    </div>

                    {/* Pro — Phase 2 */}
                    <div className="relative bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-600 rounded-2xl p-7">
                        <span className="absolute -top-3 left-7 px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-semibold rounded-full uppercase tracking-widest">
                            Phase 2 · 출시 예정
                        </span>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-indigo-900 mb-1 flex items-center gap-1.5">
                                Pro
                                <Sparkles className="h-4 w-4 text-indigo-600" />
                            </h2>
                            <p className="text-xs text-indigo-700">AI 코치·자동 임포트가 도입되는 단계</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-indigo-900">₩9,900</span>
                            <span className="text-sm text-indigo-600 ml-1">/월 (예정)</span>
                        </div>
                        <Link
                            href="/myverse/contact"
                            className="flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-semibold text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors mb-7"
                        >
                            <Bell className="h-3.5 w-3.5" />
                            Pro 출시 알림 받기
                        </Link>
                        <FeatureList features={[...FREE_FEATURES, ...PRO_FEATURES]} />
                    </div>
                </div>

                {/* 상태 범례 */}
                <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-neutral-500">
                    <Legend status="ready" />
                    <Legend status="beta" />
                    <Legend status="phase2" />
                </div>

                {/* FAQ */}
                <div className="mt-16 grid md:grid-cols-2 gap-x-12 gap-y-6">
                    <FaqItem
                        q="지금은 어떤 기능을 쓸 수 있나요?"
                        a="채집·정리·기본 시각화·@handle 공개 페이지가 제공됩니다. 일부 기능은 베타로 작동하며, 안정화 중입니다."
                    />
                    <FaqItem
                        q="Pro는 언제 출시되나요?"
                        a="Phase 2 (다음 단계)에 도입됩니다. 출시 시점에 알림을 받으려면 위 'Pro 출시 알림 받기'를 통해 등록해주세요."
                    />
                    <FaqItem
                        q="결제 없이도 평생 쓸 수 있나요?"
                        a="네. 채집·정리·시각화는 영원히 무료입니다. AI 코칭과 자동 임포트만 Pro에서 제공될 예정입니다."
                    />
                    <FaqItem
                        q="데이터는 누구의 것인가요?"
                        a="100% 사용자의 것. 언제든 일괄 다운로드 또는 영구 삭제가 가능합니다."
                    />
                    <FaqItem
                        q="유니버스 코인(UC)으로 결제 가능한가요?"
                        a="Pro 출시 시점에 결제 건당 최대 10%까지 UC 차감 예정입니다."
                    />
                    <FaqItem
                        q="Pro 가격이 변동될 수 있나요?"
                        a="현재 표시된 ₩9,900/월은 출시 예정 가격입니다. 출시 시점에 최종 확정됩니다."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureList({ features }: { features: Feature[] }) {
    return (
        <ul className="space-y-2.5">
            {features.map(f => {
                const meta = STATUS_LABEL[f.status];
                return (
                    <li key={f.label} className="flex items-start gap-2 text-sm text-neutral-800">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${f.status === "phase2" ? "text-neutral-300" : "text-indigo-600"}`} />
                        <span className="flex-1 leading-relaxed">
                            <span className={f.status === "phase2" ? "text-neutral-500" : ""}>{f.label}</span>
                            <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold rounded border ${meta.cls}`}>
                                {meta.text}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

function Legend({ status }: { status: Status }) {
    const m = STATUS_LABEL[status];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded border ${m.cls}`}>
            {m.text}
        </span>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{q}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{a}</p>
        </div>
    );
}
