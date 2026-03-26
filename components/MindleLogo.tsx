"use client";

/**
 * Mindle 로고 — 민들레 홀씨 컨셉
 * M은 민들레 노란색, indle은 부드러운 화이트
 * 작은 홀씨 아이콘(✦)이 떠가는 느낌
 */

interface MindleLogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "dark" | "light";
}

const sizeMap = {
    sm: { text: "text-xl", icon: "text-xs" },
    md: { text: "text-3xl", icon: "text-sm" },
    lg: { text: "text-5xl", icon: "text-lg" },
};

export function MindleLogo({ size = "sm", variant = "dark" }: MindleLogoProps) {
    const s = sizeMap[size];
    const baseColor = variant === "dark" ? "text-white" : "text-neutral-900";

    return (
        <span className={`inline-flex items-baseline font-bold tracking-tight ${s.text}`}>
            <span className="text-[#F5C518]">M</span>
            <span className={baseColor}>indle</span>
            <span className="text-[#F5C518]/60 ml-0.5 -translate-y-[0.3em] inline-block" style={{ fontSize: "0.4em" }}>✦</span>
        </span>
    );
}
