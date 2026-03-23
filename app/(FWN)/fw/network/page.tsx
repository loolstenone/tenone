"use client";

import { ArrowRight } from "lucide-react";

const networks = [
    { emoji: "🏷️", name: "브랜드 네트워크", desc: "패션 브랜드의 글로벌 진출과 교류를 위한 네트워크입니다." },
    { emoji: "👤", name: "모델 네트워크", desc: "모델 에이전시 및 프리랜서 모델을 위한 네트워크입니다." },
    { emoji: "📸", name: "포토그래퍼 네트워크", desc: "패션 포토그래퍼를 위한 촬영 기회와 네트워크입니다." },
];

export default function FWNNetwork() {
    return (
        <div>
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">네트워크 등록</h1>
                    <p className="text-neutral-400 mb-12">
                        FWN 네트워크에 등록하고 글로벌 패션 산업과 연결되세요.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {networks.map((n) => (
                            <div
                                key={n.name}
                                className="bg-[#1a1a1a] rounded-xl border border-neutral-800 p-8 text-center hover:border-[#00C853] transition-colors group"
                            >
                                <span className="text-5xl block mb-4">{n.emoji}</span>
                                <h3 className="text-xl font-bold text-white mb-3">{n.name}</h3>
                                <p className="text-sm text-neutral-400 mb-6">{n.desc}</p>
                                <button className="inline-flex items-center gap-2 px-6 py-2 bg-[#00C853] text-black font-semibold hover:bg-[#00A844] transition-colors rounded text-sm">
                                    등록하기
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
