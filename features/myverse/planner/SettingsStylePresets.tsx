"use client";

/**
 * SettingsStylePresets — 스타일 프리셋 갤러리
 *
 * 8개의 프리셋이 (color, radius, system font, user font, theme mode) 5개 토큰을 한 번에 적용한다.
 * - 모바일: 풀 컨트롤 대신 프리셋 카드 갤러리 + "고급 설정" 토글
 * - PC/태블릿: 프리셋 row를 풀 컨트롤 위에 두고 빠른 출발점으로 사용
 *
 * 각 프리셋은 좌측에 mini swatch 3개(배경/액센트/카드 보더)를 보여주고,
 * 우측에 한국어 라벨 + 영문 설명을 표시한다.
 */

import { applyPlannersTheme, applyPlannersFont, applyPlannersUserFont, applyPlannersThemeMode, applyPlannersRadius, type PlannersThemeMode, type PlannersRadius } from "./PlannersThemeProvider";

export type SettingsPreset = {
    key: string;
    label: string;
    desc: string;
    swatch: { bg: string; surface: string; accent: string };
    color: string;
    radius: PlannersRadius;
    font: string;
    userFont: string;
    mode: PlannersThemeMode;
};

export const STYLE_PRESETS: SettingsPreset[] = [
    {
        key: "mono_light",
        label: "Mono Light",
        desc: "기본 · 흰 배경 · 모노 액센트",
        swatch: { bg: "#FAFAF7", surface: "#FFFFFF", accent: "#171717" },
        color: "mono", radius: "soft", font: "sans", userFont: "serif", mode: "light",
    },
    {
        key: "cream_amber",
        label: "Cream Serif",
        desc: "따뜻한 베이지 · 세리프",
        swatch: { bg: "#FAF7F0", surface: "#FFFFFF", accent: "#B45309" },
        color: "amber", radius: "soft", font: "strong-serif", userFont: "serif", mode: "light",
    },
    {
        key: "editorial_burgundy",
        label: "Editorial",
        desc: "에디토리얼 · 와인 · 각진",
        swatch: { bg: "#FFFFFF", surface: "#F8F5F2", accent: "#86198F" },
        color: "plum", radius: "sharp", font: "strong-serif", userFont: "serif", mode: "light",
    },
    {
        key: "slate_navy",
        label: "Slate Pro",
        desc: "직장인 · 네이비 · 압축",
        swatch: { bg: "#F5F5F7", surface: "#FFFFFF", accent: "#1E40AF" },
        color: "navy", radius: "subtle", font: "sans", userFont: "sans", mode: "light",
    },
    {
        key: "black_ink",
        label: "Black Ink",
        desc: "야간 · 다크 · 집중",
        swatch: { bg: "#0E0E0E", surface: "#161616", accent: "#F2EFE8" },
        color: "mono", radius: "soft", font: "strong-serif", userFont: "serif", mode: "dark",
    },
    {
        key: "campus_mint",
        label: "Campus Mint",
        desc: "학생 · 민트 · 둥근",
        swatch: { bg: "#FAFAF7", surface: "#FFFFFF", accent: "#6366F1" },
        color: "teal", radius: "soft", font: "round", userFont: "round", mode: "light",
    },
    {
        key: "campus_blush",
        label: "Campus Blush",
        desc: "크리에이터 · 블러시 · 세리프",
        swatch: { bg: "#FFFFFF", surface: "#FDF7F7", accent: "#BE185D" },
        color: "rose", radius: "soft", font: "round", userFont: "serif", mode: "light",
    },
    {
        key: "designer_mono",
        label: "Designer Mono",
        desc: "디자이너·개발자 · 코드폰트",
        swatch: { bg: "#FAFAF7", surface: "#FFFFFF", accent: "#171717" },
        color: "mono", radius: "soft", font: "mono", userFont: "mono", mode: "light",
    },
    {
        key: "walnut_dark",
        label: "Walnut Dark",
        desc: "짙은 갈색 · 가죽 · 앤틱",
        swatch: { bg: "#161616", surface: "#1A1208", accent: "#D4A062" },
        color: "walnut", radius: "soft", font: "strong-serif", userFont: "serif", mode: "dark",
    },
];

/**
 * 현재 적용된 5개 토큰이 어떤 프리셋과 정확히 일치하는지 찾는다. 일치 없으면 null (= 커스텀).
 */
export function matchPreset(
    color: string,
    radius: PlannersRadius,
    font: string,
    userFont: string,
    mode: PlannersThemeMode,
): string | null {
    for (const p of STYLE_PRESETS) {
        if (p.color === color && p.radius === radius && p.font === font && p.userFont === userFont && p.mode === mode) {
            return p.key;
        }
    }
    return null;
}

interface Props {
    activePresetKey: string | null;
    onApply: (preset: SettingsPreset) => void;
    /** 모바일에서 컴팩트 카드(2열 그리드) 표시 여부 */
    mobile?: boolean;
}

export function SettingsStylePresets({ activePresetKey, onApply, mobile = false }: Props) {
    return (
        <div className={mobile ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3"}>
            {STYLE_PRESETS.map((p) => {
                const active = activePresetKey === p.key;
                return (
                    <button
                        key={p.key}
                        onClick={() => {
                            onApply(p);
                            // 즉시 시각 적용
                            applyPlannersTheme(p.color);
                            applyPlannersRadius(p.radius);
                            applyPlannersFont(p.font);
                            applyPlannersUserFont(p.userFont);
                            applyPlannersThemeMode(p.mode);
                        }}
                        className="group flex flex-col items-stretch gap-2 p-3 rounded-lg text-left transition-all"
                        style={{
                            border: `2px solid ${active ? "var(--pp-ink)" : "var(--pp-line)"}`,
                            backgroundColor: active ? "var(--pp-surface-alt)" : "var(--pp-surface)",
                        }}
                    >
                        {/* Mini visualization — 실제 플래너 느낌의 미니 UI */}
                        <div
                            className="relative h-24 rounded-md overflow-hidden"
                            style={{ backgroundColor: p.swatch.bg, border: "1px solid rgba(0,0,0,0.08)" }}
                        >
                            {/* 카드 서피스 */}
                            <div
                                className="absolute left-2.5 top-2.5 right-8 bottom-2.5 overflow-hidden flex flex-col"
                                style={{
                                    backgroundColor: p.swatch.surface,
                                    border: `1px solid rgba(${p.mode === "dark" ? "255,255,255" : "0,0,0"},0.08)`,
                                    borderRadius: p.radius === "sharp" ? "2px" : p.radius === "subtle" ? "4px" : "6px",
                                }}
                            >
                                {/* 액센트 헤더 스트립 */}
                                <div style={{ height: "4px", backgroundColor: p.swatch.accent, flexShrink: 0 }} />
                                <div className="flex-1 px-2 py-1.5 flex flex-col justify-between">
                                    {/* 날짜/타이틀 행 */}
                                    <div className="flex items-center gap-1.5">
                                        <div style={{ height: "8px", width: "8px", borderRadius: "2px", backgroundColor: p.swatch.accent, opacity: 0.85, flexShrink: 0 }} />
                                        <div style={{ height: "2.5px", width: "45%", borderRadius: "1px", backgroundColor: p.swatch.accent, opacity: 0.6 }} />
                                    </div>
                                    {/* 구분선 */}
                                    <div style={{ height: "1px", backgroundColor: p.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }} />
                                    {/* 태스크 라인 3개 */}
                                    {([80, 62, 72] as number[]).map((w, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div style={{ height: "5px", width: "5px", borderRadius: "1px", border: `1.5px solid rgba(${p.mode === "dark" ? "255,255,255" : "0,0,0"},0.18)`, flexShrink: 0 }} />
                                            <div style={{ height: "2px", width: `${w}%`, borderRadius: "1px", backgroundColor: p.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.11)" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 액센트 도트 */}
                            <div
                                className="absolute right-2.5 top-2.5 h-3.5 w-3.5 rounded-full shadow-sm"
                                style={{ backgroundColor: p.swatch.accent }}
                            />
                            {/* 다크모드 힌트 */}
                            {p.mode === "dark" && (
                                <div className="absolute right-2.5 bottom-2.5 text-[9px] leading-none" style={{ color: "rgba(255,255,255,0.35)" }}>◗</div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p
                                className="text-xs font-semibold truncate"
                                style={{ color: active ? "var(--pp-ink)" : "var(--pp-ink-2)" }}
                            >
                                {p.label}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: "var(--pp-ink-4)" }}>{p.desc}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
