"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const cities = ["New York", "Paris", "Milan", "London", "Seoul", "Tokyo", "LA", "Toronto"];

const whatWeDo = [
    "전 세계 패션 위크를 네트워크로 연결합니다.",
    "한국 브랜드의 글로벌 진출을 지원합니다.",
    "해외 브랜드의 한국 시장 진출을 돕습니다.",
    "패션 관련 교육, 관광, 정보 서비스를 제공합니다.",
];

const partners = [
    { name: "Designer Academy", desc: "디자이너 아카데미" },
    { name: "Model Academy (MoNTZ)", desc: "모델 아카데미" },
    { name: "SmarComm", desc: "마케팅 & 프로모션" },
    { name: "YouInOne", desc: "마케팅 & 프로모션" },
];

export default function FWNAbout() {
    return (
        <div>
            {/* Hero */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Welcome to FWN</h1>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        Fashion Week Network. 전 세계에서 열리는 패션 위크를 네트워크로 연결하고,
                        글로벌 패션 산업의 교류를 돕습니다.
                    </p>
                </div>
            </section>

            {/* The World is on the Runway */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-4xl">
                    <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-10 text-center">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-sky-400 mb-6">
                            The World is on the Runway
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {cities.map((city) => (
                                <span
                                    key={city}
                                    className="px-4 py-2 bg-[#252525] text-white rounded-full text-sm font-medium"
                                >
                                    {city}
                                </span>
                            ))}
                        </div>
                        <p className="text-neutral-400 text-sm mt-6">
                            365일, 전 세계 어딘가에서 런웨이가 열리고 있습니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-16 px-6 bg-[#1a1a1a]">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-8">What we do</h2>
                    <div className="space-y-4">
                        {whatWeDo.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 bg-[#252525] rounded-lg p-5">
                                <span className="text-[#00C853] font-bold text-lg shrink-0">0{i + 1}</span>
                                <p className="text-neutral-300">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-8">Partners</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {partners.map((p) => (
                            <div key={p.name} className="bg-[#1a1a1a] rounded-lg p-6 border border-neutral-800 hover:border-[#00C853] transition-colors">
                                <h3 className="text-white font-semibold">{p.name}</h3>
                                <p className="text-sm text-neutral-400 mt-1">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Network 등록 CTA */}
            <section className="py-20 px-6 bg-[#1a1a1a]">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-4">네트워크에 참여하세요</h2>
                    <p className="text-neutral-400 mb-8">
                        브랜드, 모델, 포토그래퍼 — FWN 네트워크에 등록하고 글로벌 패션 시장과 연결되세요.
                    </p>
                    <Link
                        href="/fwn/network"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#00C853] text-black font-semibold hover:bg-[#00A844] transition-colors rounded"
                    >
                        네트워크 등록
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
