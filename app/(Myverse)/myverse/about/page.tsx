import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "About — Myverse",
    description: "나를 운영하는 OS. 디지털 흔적이 자동으로 정리되고, 내가 소유하고, AI가 패턴을 읽어주는 Personal OS.",
    openGraph: {
        title: "About | Myverse",
        description: "나를 운영하는 OS.",
    },
};

const PRINCIPLES = [
    {
        title: "운영한다",
        desc: "사진·메모·일정·관계가 자동으로 9 영역에 정리되는 시스템. 의식적으로 분류하지 않아도 하루치만큼 쌓인다.",
    },
    {
        title: "소유한다",
        desc: "내 데이터, 내 OS, 내 결정. 서비스가 사라져도 기록은 남는다. 일괄 다운로드·영구 삭제가 항상 1탭 거리.",
    },
    {
        title: "성장한다",
        desc: "AI가 패턴을 보여주고, 나는 더 잘 살 수 있도록. 모든 분석은 사용자 동의 위에서 단계적으로 도입된다.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-20 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
                        About
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-5 leading-tight">
                        나를 운영하는 OS
                    </h1>
                    <p className="text-base text-neutral-500 leading-relaxed">
                        Myverse는 흩어진 디지털 흔적을 하나로 모아 자동 정리하고, 사용자가 100% 소유하는 Personal OS입니다.
                    </p>
                </div>

                {/* 3원칙 */}
                <div className="space-y-7 mb-16">
                    {PRINCIPLES.map((p, i) => (
                        <div key={p.title} className="flex gap-5">
                            <span className="text-2xl font-bold text-indigo-600 shrink-0 w-8">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 mb-1.5">
                                    {p.title}
                                </h2>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {p.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 더 알아보기 */}
                <div className="border-t border-neutral-200 pt-10">
                    <p className="text-sm text-neutral-500 mb-4">더 깊이 알아보기</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <DeepLink href="/myverse/philosophy" title="철학" desc="다섯 번의 전환 — 어둠에서 빛으로" />
                        <DeepLink href="/myverse/service" title="서비스" desc="4개의 탭 · 9 영역" />
                        <DeepLink href="/myverse/technology" title="기술" desc="Universal Record · 파서 구조" />
                        <DeepLink href="/myverse/roadmap" title="로드맵" desc="Phase 1~4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeepLink({ href, title, desc }: { href: string; title: string; desc: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
        >
            <div>
                <div className="text-sm font-semibold text-neutral-900 mb-0.5">{title}</div>
                <div className="text-xs text-neutral-500">{desc}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}
