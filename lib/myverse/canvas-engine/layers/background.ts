// PP Canvas Engine — 배경 템플릿 레이어
//
// CSS 스타일을 반환해 캔버스 컨테이너의 background-image로 적용.
// 템플릿은 viewport 줌과 무관하게 캔버스 좌표 24px 격자 기준.

import type { BackgroundTemplate } from "../types";

export interface BackgroundStyle {
    backgroundImage: string;
    backgroundSize: string;
    backgroundColor?: string;
}

export function getBackgroundStyle(template: BackgroundTemplate, zoom = 1): BackgroundStyle | null {
    if (template === "blank") return null;
    const size = 24 * zoom;
    switch (template) {
        case "dots":
            return {
                backgroundImage: "radial-gradient(circle, #c4c4c4 1px, transparent 1px)",
                backgroundSize: `${size}px ${size}px`,
            };
        case "grid":
            return {
                backgroundImage:
                    "linear-gradient(to right, #e0e0e0 1px, transparent 1px)," +
                    "linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
                backgroundSize: `${size}px ${size}px`,
            };
        case "lines":
            return {
                backgroundImage: `linear-gradient(transparent ${size - 1}px, #d4d4d4 ${size - 1}px, #d4d4d4 ${size}px)`,
                backgroundSize: `100% ${size}px`,
            };
    }
}

/** 템플릿 라벨 (UI 표시용) */
export function getBackgroundLabel(template: BackgroundTemplate): string {
    return ({
        blank: "없음",
        dots: "점 격자",
        grid: "모눈",
        lines: "줄",
    } as const)[template];
}

export const BACKGROUND_TEMPLATES: BackgroundTemplate[] = ["blank", "dots", "grid", "lines"];
