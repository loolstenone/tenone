"use client";

import { useState, useEffect } from "react";

/**
 * Mindle 로고 — 영문 Mindle ↔ 한글 마인들 페이드 교차
 * M/마 는 노란색(#F5C518), 나머지는 흰색/검정
 */

interface MindleLogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "dark" | "light";
    /** 애니메이션 비활성화 (Footer 등 정적 사용 시) */
    animate?: boolean;
}

const sizeMap = {
    sm: { text: "text-xl", height: "h-7" },
    md: { text: "text-3xl", height: "h-9" },
    lg: { text: "text-5xl", height: "h-14" },
};

export function MindleLogo({ size = "sm", variant = "dark", animate = true }: MindleLogoProps) {
    const [showKorean, setShowKorean] = useState(false);
    const s = sizeMap[size];
    const baseColor = variant === "dark" ? "text-white" : "text-neutral-900";

    useEffect(() => {
        if (!animate) return;
        const interval = setInterval(() => {
            setShowKorean(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, [animate]);

    if (!animate) {
        return (
            <span className={`inline-flex items-baseline font-bold tracking-tight ${s.text}`}>
                <span className="text-[#F5C518]">M</span>
                <span className={baseColor}>indle</span>
            </span>
        );
    }

    return (
        <span className={`relative inline-flex items-baseline font-bold tracking-tight ${s.text} ${s.height}`}>
            {/* 영문: Mindle */}
            <span
                className={`transition-opacity duration-700 ${showKorean ? "opacity-0" : "opacity-100"}`}
            >
                <span className="text-[#F5C518]">M</span>
                <span className={baseColor}>indle</span>
            </span>

            {/* 한글: 마인들 — 절대 위치로 겹침 */}
            <span
                className={`absolute left-0 top-0 transition-opacity duration-700 ${showKorean ? "opacity-100" : "opacity-0"}`}
            >
                <span className="text-[#F5C518]">마</span>
                <span className={baseColor}>인들</span>
            </span>
        </span>
    );
}
