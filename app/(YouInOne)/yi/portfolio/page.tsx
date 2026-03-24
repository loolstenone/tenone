"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

const categories = ["전체", "하이재킹", "캠페인", "광고", "네트워킹"];

const portfolios = [
    {
        id: 1,
        title: "Seoul Street Runway",
        category: "하이재킹",
        question: "왜 모델들만 런웨이에 설 수 있나요?",
        desc: "서울패션위크 기간, DDP에서 일반인들이 걸어가는 거리를 런웨이로 만든 이슈 하이재킹 프로젝트. 국적, 나이, 성별 상관없이 누구나 참여 가능. 뉴욕, 밀라노, 파리, 런던 패션위크로 확대 예정.",
        tags: ["서울패션위크", "StreetRunway", "이슈하이재킹"],
        date: "2023.09.09",
        emoji: "👗",
    },
    {
        id: 2,
        title: "The Promise Booth",
        category: "캠페인",
        question: "왜 학교폭력 가해자들은 먼 훗날 피해가 돌아올 것을 모를까요?",
        desc: "학교폭력 가해자는 피해자의 고통에 공감하지 못하고 미래의 결과를 예측하지 못합니다. 셀프 스튜디오 브랜드 포토매틱을 활용해 따돌림이 만드는 빈 공간을 체험하게 하는 캠페인. 2023 부산국제광고제 출품.",
        tags: ["학교폭력", "포토매틱", "사회공헌"],
        date: "2023",
        emoji: "📸",
    },
    {
        id: 3,
        title: "나는 모나미로 나를 쓴다",
        category: "광고",
        question: "왜 모나미는 학용품 이야기만 해야하나요?",
        desc: "학용품 브랜드 모나미를 희망과 회복력의 메시지를 전하는 브랜드로 재포지셔닝. '모나미'와 '모나다'의 언어유희로 불완전한 사람들이 다시 일어나는 이야기를 전달. MONAMI Video Awards 입상, 2022 서울광고제 Finalist.",
        tags: ["광고", "모나미", "브랜딩"],
        date: "2022",
        emoji: "✒️",
    },
    {
        id: 4,
        title: "D.A.M 네트워킹 파티",
        category: "네트워킹",
        question: "왜 기업면접은 항상 딱딱해야 하나요?",
        desc: "마케팅·광고 분야 학생들과 현업 인사담당자를 연결하는 네트워킹 파티. 기업은 경력자를 원하고 학생은 기업 경험이 부족한 미스매치를 해결. 연사 강연, 자유 네트워킹, 인턴십 기회를 제공합니다.",
        tags: ["마케팅", "채용", "네트워킹", "취업"],
        date: "2023",
        emoji: "🤝",
    },
];

export default function YouInOnePortfolioPage() {
    const [filter, setFilter] = useState("전체");

    const filtered = filter === "전체" ? portfolios : portfolios.filter((p) => p.category === filter);

    return (
        <div className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">Portfolio</h1>
                    <p className="text-neutral-600">유인원이 진행한 프로젝트들입니다. 모든 프로젝트는 &ldquo;왜?&rdquo;라는 질문에서 시작합니다.</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                                filter === cat
                                    ? "bg-[#171717] text-white border-[#171717]"
                                    : "border-neutral-300 hover:border-[#E53935] hover:text-[#E53935]"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Portfolio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filtered.map((p) => (
                        <div
                            key={p.id}
                            className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                        >
                            <div className="aspect-video bg-gradient-to-br from-[#171717] to-neutral-700 flex items-center justify-center">
                                <span className="text-5xl md:text-7xl">{p.emoji}</span>
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-[#E53935] font-medium">{p.category}</span>
                                <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-[#E53935] transition-colors">{p.title}</h3>
                                <p className="text-neutral-500 text-sm italic mb-3">&ldquo;{p.question}&rdquo;</p>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">{p.desc}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {p.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-400">{p.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
