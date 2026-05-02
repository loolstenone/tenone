// PP Canvas Engine — 자유 그리기 레이어
//
// perfect-freehand로 stroke point 시퀀스를 SVG path / 채워진 폴리곤으로 변환.
// 펜 종류별 시각 차이는 stroke 옵션 (size·thinning·smoothing·streamline·simulatePressure) 조합으로 결정.
//
// HandNote에서 추출한 핵심 로직 — 외부 인터페이스만 정리.

import { getStroke } from "perfect-freehand";
import type { StrokeElement, PenKind } from "../types";

// ─── 펜 종류별 perfect-freehand 옵션 ────────────────────────────────────────

interface PenProfile {
    /** perfect-freehand size 곱셈 계수 — 같은 size 입력에도 펜마다 두께 다르게 */
    sizeMultiplier: number;
    /** 0~1, 압력에 따른 두께 변동 */
    thinning: number;
    /** 0~1, 부드러움 (높을수록 매끈) */
    smoothing: number;
    /** 0~1, 손 떨림 보정 (높을수록 더 안정) */
    streamline: number;
    /** 압력 미지원 시 가짜 압력 시뮬레이션 — 마우스 사용자에게도 자연스러운 변화 */
    simulatePressure: boolean;
    /** 캡(끝) 모양 */
    cap: { taperStart: number; taperEnd: number };
    /** 색상 강제 (형광펜 등) — undefined면 입력 색 사용 */
    fixedColor?: string;
    /** 기본 불투명도 */
    defaultOpacity: number;
}

const PEN_PROFILES: Record<PenKind, PenProfile> = {
    pen: {
        sizeMultiplier: 1,
        thinning: 0.4,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: true,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 1,
    },
    pencil: {
        sizeMultiplier: 0.7,
        thinning: 0.7,
        smoothing: 0.3,    // 거친 느낌
        streamline: 0.3,
        simulatePressure: true,
        cap: { taperStart: 5, taperEnd: 5 },
        defaultOpacity: 0.8,
    },
    fountain: {
        sizeMultiplier: 1.1,
        thinning: 0.55,    // 압력에 민감
        smoothing: 0.65,   // 매끄러움
        streamline: 0.6,
        simulatePressure: true,
        cap: { taperStart: 8, taperEnd: 12 },  // 끝이 가늘어짐
        defaultOpacity: 1,
    },
    marker: {
        sizeMultiplier: 1.5,
        thinning: 0.1,     // 거의 일정한 두께
        smoothing: 0.5,
        streamline: 0.4,
        simulatePressure: false,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 1,
    },
    highlighter: {
        sizeMultiplier: 3.5,  // 매우 두꺼움
        thinning: 0,
        smoothing: 0.3,
        streamline: 0.2,
        simulatePressure: false,
        cap: { taperStart: 0, taperEnd: 0 },
        fixedColor: "#fde047",  // amber-300
        defaultOpacity: 0.35,
    },
    brush: {
        sizeMultiplier: 1.8,
        thinning: 0.8,     // 매우 압력 민감
        smoothing: 0.7,
        streamline: 0.5,
        simulatePressure: true,
        cap: { taperStart: 15, taperEnd: 20 },
        defaultOpacity: 0.95,
    },
};

// ─── 변환 함수 ──────────────────────────────────────────────────────────────

/** StrokeElement → 채워진 폴리곤 outline (SVG path 'd' attribute) */
export function strokeToPath(stroke: StrokeElement): string {
    const profile = PEN_PROFILES[stroke.pen];
    const outline = getStroke(stroke.points, {
        size: stroke.size * profile.sizeMultiplier,
        thinning: profile.thinning,
        smoothing: profile.smoothing,
        streamline: stroke.streamline ?? profile.streamline,
        simulatePressure: profile.simulatePressure,
        start: { taper: profile.cap.taperStart, cap: true },
        end: { taper: profile.cap.taperEnd, cap: true },
    });
    return outlineToSvgPath(outline);
}

/** 펜 종류의 시각 속성 (색상·불투명도)을 stroke 데이터에 반영해 반환 */
export function resolveStrokeStyle(stroke: StrokeElement): { fillColor: string; opacity: number } {
    const profile = PEN_PROFILES[stroke.pen];
    return {
        fillColor: profile.fixedColor ?? stroke.color,
        opacity: stroke.opacity / 100 * profile.defaultOpacity,
    };
}

/** 펜 프로파일 조회 (UI 미리보기 등에서 사용) */
export function getPenProfile(pen: PenKind): PenProfile {
    return PEN_PROFILES[pen];
}

// ─── 내부 도우미 ─────────────────────────────────────────────────────────────

function outlineToSvgPath(outline: number[][]): string {
    if (outline.length === 0) return "";
    const d = outline.reduce(
        (acc, [x, y], i, arr) => {
            if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
            const next = arr[(i + 1) % arr.length];
            return acc + ` Q ${x.toFixed(2)} ${y.toFixed(2)} ${((x + next[0]) / 2).toFixed(2)} ${((y + next[1]) / 2).toFixed(2)}`;
        },
        "",
    );
    return d + " Z";
}
