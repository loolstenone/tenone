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

// PEN_PROFILES은 HandNote의 PEN_PRESETS와 1:1 대응한다.
// sizeMultiplier: 1.0 — HandNote가 user-set size를 직접 전달하므로 추가 배율 없음
// cap.taperStart/End: 0 — 확정 스트로크(strokeToPath)와 라이브 렌더 시각 일치
// opacity, thinning, smoothing, streamline — HandNote PEN_PRESETS 기준값 (2026-05-05 동기화)
const PEN_PROFILES: Record<PenKind, PenProfile> = {
    pen: {
        sizeMultiplier: 1.0,
        thinning: 0.50,
        smoothing: 0.60,
        streamline: 0.50,
        simulatePressure: true,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 1.00,
    },
    pencil: {
        sizeMultiplier: 1.0,
        thinning: 0.35,
        smoothing: 0.25,    // 거친 느낌
        streamline: 0.15,
        simulatePressure: true,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 0.72,
    },
    fountain: {
        sizeMultiplier: 1.0,
        thinning: 0.80,    // 압력에 민감
        smoothing: 0.70,
        streamline: 0.70,
        simulatePressure: true,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 1.00,
    },
    marker: {
        sizeMultiplier: 1.0,
        thinning: 0.10,    // 거의 일정한 두께
        smoothing: 0.50,
        streamline: 0.40,
        simulatePressure: false,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 1.00,
    },
    highlighter: {
        sizeMultiplier: 1.0,
        thinning: 0.00,
        smoothing: 0.40,
        streamline: 0.30,
        simulatePressure: false,
        cap: { taperStart: 0, taperEnd: 0 },
        fixedColor: "#fde047",  // amber-300
        defaultOpacity: 0.32,
    },
    brush: {
        sizeMultiplier: 1.0,
        thinning: 0.92,    // 매우 압력 민감
        smoothing: 0.70,
        streamline: 0.60,
        simulatePressure: true,
        cap: { taperStart: 0, taperEnd: 0 },
        defaultOpacity: 0.90,
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
