"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categories = [
    {
        name: "인물 사진",
        slug: "portrait",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    },
    {
        name: "스튜디오",
        slug: "studio",
        image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=400&fit=crop",
    },
    {
        name: "스포츠",
        slug: "sports",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop",
    },
    {
        name: "항공 사진",
        slug: "aerial",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    },
    {
        name: "겨울",
        slug: "winter",
        image: "https://images.unsplash.com/photo-1457269449834-928af64c684d?w=600&h=400&fit=crop",
    },
    {
        name: "바다",
        slug: "ocean",
        image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop",
    },
    {
        name: "그림자",
        slug: "shadow",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
    },
    {
        name: "콘서트",
        slug: "concert",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    },
];

const uglyWords = [
    { letter: "U", word: "nique" },
    { letter: "G", word: "lory" },
    { letter: "L", word: "ovely" },
    { letter: "Y", word: "ou" },
];

export default function MoNTZHome() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const scrollDown = () => {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    };

    return (
        <div>
            {/* 히어로 섹션 — 전체화면 어두운 건축물 배경 + UGLY 아크로스틱 */}
            <section className="relative h-screen flex items-center overflow-hidden">
                {/* 배경 이미지 */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')",
                    }}
                />
                <div className="absolute inset-0 bg-black/60" />

                {/* UGLY 텍스트 */}
                <div className="relative z-10 px-8 md:px-16 lg:px-24">
                    <div className="space-y-2">
                        {uglyWords.map((item, i) => (
                            <div
                                key={item.letter}
                                className={`transition-all duration-700 ${
                                    visible
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-8"
                                }`}
                                style={{ transitionDelay: `${i * 150 + 300}ms` }}
                            >
                                <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                                    {item.letter}
                                </span>
                                <span className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-300">
                                    {item.word}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 스크롤 화살표 */}
                <button
                    onClick={scrollDown}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
                >
                    <ChevronDown className="h-8 w-8" />
                </button>
            </section>

            {/* 포트폴리오 그리드 — 2열 카테고리 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {categories.map((cat, i) => (
                            <Link
                                key={cat.slug}
                                href={`/mtz`}
                                className="group block"
                            >
                                <div className="overflow-hidden">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-3 text-center text-sm text-neutral-700 underline underline-offset-4 decoration-neutral-300 group-hover:decoration-neutral-900 transition-colors">
                                    {cat.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
