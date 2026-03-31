"use client";

/**
 * Trend Hunter 로고 — 서울남산 EB Bold 스타일 재현
 * T(빨강) r(노랑) e(연두) n(하늘) d(초록) + Hunter(흰/검)
 * "Trend"는 살짝 기울어진 배치, 글자마다 색이 다름
 */

interface TrendHunterLogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "dark" | "light"; // dark=다크배경용(Hunter흰), light=라이트배경용(Hunter검)
    showText?: boolean; // 전체 텍스트 or 축약
}

const trendColors = [
    { char: "T", color: "#E50000" },   // 빨강
    { char: "r", color: "#FFB800" },   // 노랑
    { char: "e", color: "#8BC34A" },   // 연두
    { char: "n", color: "#2196F3" },   // 하늘
    { char: "d", color: "#00C853" },   // 초록
];

const sizeMap = {
    sm: { trend: "text-lg", hunter: "text-lg", gap: "-ml-[1px]", trendRotate: "-rotate-6" },
    md: { trend: "text-2xl", hunter: "text-2xl", gap: "-ml-[2px]", trendRotate: "-rotate-6" },
    lg: { trend: "text-5xl", hunter: "text-5xl", gap: "-ml-[3px]", trendRotate: "-rotate-6" },
};

export function TrendHunterLogo({ size = "sm", variant = "dark", showText = true }: TrendHunterLogoProps) {
    const s = sizeMap[size];
    const hunterColor = variant === "dark" ? "text-white" : "text-black";

    if (!showText) {
        // 축약형: 컬러 T만
        return (
            <span className="inline-flex items-baseline font-black tracking-tighter" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                <span className={`${s.trend} ${s.trendRotate}`} style={{ color: "#E50000" }}>T</span>
                <span className={`${s.trend}`} style={{ color: "#FFB800", marginLeft: "-0.05em" }}>.</span>
                <span className={`${s.hunter} ${hunterColor} font-black`} style={{ marginLeft: "0.05em" }}>H</span>
            </span>
        );
    }

    return (
        <span className="inline-flex flex-col leading-none font-black tracking-tighter" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* Trend — 기울어진 컬러 글자들 */}
            <span className={`inline-flex items-baseline ${s.trend} ${s.trendRotate}`}>
                {trendColors.map((item, i) => (
                    <span
                        key={i}
                        style={{
                            color: item.color,
                            marginLeft: i > 0 ? "-0.03em" : undefined,
                        }}
                    >
                        {item.char}
                    </span>
                ))}
            </span>
            {/* Hunter — 정렬, 흰색/검정 */}
            <span className={`${s.hunter} ${hunterColor} -mt-[0.15em]`}>
                Hunter
            </span>
        </span>
    );
}
