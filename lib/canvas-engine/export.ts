// PP Canvas Engine — PNG / SVG 내보내기
//
// exportToSVGString: CanvasDocument → SVG 문자열 (파일 저장 또는 PNG 변환 중간 단계)
// exportToPNG:       SVG → offscreen canvas → PNG data URL

import type { CanvasDocument, CanvasElement, TextElement, ImageElement } from "./types";
import { strokeToPath, resolveStrokeStyle } from "./layers/strokes";
import { shapeToRender } from "./layers/shapes";

// ─── XML 이스케이프 ────────────────────────────────────────────────────────────

function esc(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ─── 단일 엘리먼트 → SVG 문자열 ──────────────────────────────────────────────

function elementToSVG(el: CanvasElement): string {
    const opacity = el.opacity / 100;
    const rot     = el.rotation ?? 0;
    const deg     = (rot * 180) / Math.PI;

    if (el.type === "stroke") {
        const d = strokeToPath(el);
        if (!d) return "";
        const { fillColor, opacity: o } = resolveStrokeStyle(el);
        return `<path d="${d}" fill="${fillColor}" opacity="${o}" />`;
    }

    if (el.type === "text") {
        const te = el as TextElement;
        if (!te.text) return "";
        const lh         = te.fontSize * 1.4;
        const anchorMap: Record<string, string> = { left: "start", center: "middle", right: "end" };
        const anchor     = anchorMap[te.align] ?? "start";
        const tspans     = te.text.split("\n").map((line, i) =>
            `<tspan x="${te.x}" y="${te.y + te.fontSize + i * lh}">${esc(line || " ")}</tspan>`
        ).join("");
        const fw    = te.bold   ? "bold"   : "normal";
        const fs    = te.italic ? "italic" : "normal";
        const inner = `<text opacity="${opacity}" font-size="${te.fontSize}" font-family="${esc(te.fontFamily)}" font-weight="${fw}" font-style="${fs}" fill="${te.color}" text-anchor="${anchor}">${tspans}</text>`;
        if (rot === 0) return inner;
        return `<g transform="rotate(${deg} ${te.x} ${te.y + te.fontSize / 2})">${inner}</g>`;
    }

    if (el.type === "image") {
        const ie = el as ImageElement;
        const inner = `<image href="${ie.src}" x="${ie.x}" y="${ie.y}" width="${ie.width}" height="${ie.height}" opacity="${opacity}" preserveAspectRatio="xMidYMid meet" />`;
        if (rot === 0) return inner;
        const cx = ie.x + ie.width / 2;
        const cy = ie.y + ie.height / 2;
        return `<g transform="rotate(${deg} ${cx} ${cy})">${inner}</g>`;
    }

    const rd = shapeToRender(el);
    if (!rd) return "";
    const dash  = rd.dashArray ? ` stroke-dasharray="${rd.dashArray}"` : "";
    const fill  = rd.fillColor ?? "none";
    let content = `<path d="${rd.path}" />`;
    if (rd.extras?.startHead) content += `<path d="${rd.extras.startHead}" fill="${rd.strokeColor}" stroke="none" />`;
    if (rd.extras?.endHead)   content += `<path d="${rd.extras.endHead}"   fill="${rd.strokeColor}" stroke="none" />`;
    const shape = `<g stroke="${rd.strokeColor}" stroke-width="${rd.strokeWidth}"${dash} fill="${fill}" stroke-linecap="round" stroke-linejoin="round">${content}</g>`;

    if (el.type === "line" || el.type === "arrow" || rot === 0) return shape;
    const e = el as Extract<CanvasElement, { width: number; height: number }>;
    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;
    return `<g transform="rotate(${deg} ${cx} ${cy})">${shape}</g>`;
}

// ─── 전체 문서 bbox (내보내기 영역 자동 계산) ────────────────────────────────

export interface ExportBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** 모든 엘리먼트를 감싸는 최소 영역. 엘리먼트 없으면 기본 A4 비율 반환. */
export function computeExportBounds(doc: CanvasDocument, padding = 32): ExportBounds {
    const els = doc.elements;
    if (els.length === 0) return { x: 0, y: 0, width: 800, height: 600 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const el of els) {
        let x = el.x, y = el.y, w = 0, h = 0;
        if (el.type === "stroke") {
            for (const [px, py] of el.points) {
                if (px < minX) minX = px;
                if (py < minY) minY = py;
                if (px > maxX) maxX = px;
                if (py > maxY) maxY = py;
            }
            continue;
        }
        if (el.type === "line" || el.type === "arrow") {
            for (const [px, py] of el.points) {
                if (px < minX) minX = px;
                if (py < minY) minY = py;
                if (px > maxX) maxX = px;
                if (py > maxY) maxY = py;
            }
            continue;
        }
        if (el.type === "rect" || el.type === "ellipse" || el.type === "diamond" || el.type === "image") {
            const e = el as Extract<CanvasElement, { width: number; height: number }>;
            w = e.width; h = e.height;
        } else if (el.type === "text") {
            w = (el as TextElement).maxWidth ?? 200;
            h = (el as TextElement).fontSize * 1.4;
        }
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
    }

    return {
        x: minX - padding,
        y: minY - padding,
        width:  maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
    };
}

// ─── SVG 문자열 생성 ──────────────────────────────────────────────────────────

/**
 * CanvasDocument → SVG 문자열
 *
 * @param doc     내보낼 문서
 * @param bounds  내보내기 영역 (생략 시 computeExportBounds로 자동 계산)
 */
export function exportToSVGString(doc: CanvasDocument, bounds?: ExportBounds): string {
    const b = bounds ?? computeExportBounds(doc);
    const sorted = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
    const body = sorted.map(elementToSVG).filter(Boolean).join("\n  ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${b.width}" height="${b.height}"
     viewBox="${b.x} ${b.y} ${b.width} ${b.height}">
  <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="white" />
  ${body}
</svg>`;
}

// ─── PNG 내보내기 ─────────────────────────────────────────────────────────────

/**
 * CanvasDocument → PNG data URL
 *
 * @param doc    내보낼 문서
 * @param scale  해상도 배율 (기본 2 = @2x)
 * @param bounds 내보내기 영역 (생략 시 자동)
 */
export async function exportToPNG(
    doc: CanvasDocument,
    scale = 2,
    bounds?: ExportBounds,
): Promise<string> {
    const b   = bounds ?? computeExportBounds(doc);
    const svg = exportToSVGString(doc, b);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url  = URL.createObjectURL(blob);

    return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width  = Math.ceil(b.width  * scale);
            canvas.height = Math.ceil(b.height * scale);
            const ctx = canvas.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); reject(new Error("2D ctx unavailable")); return; }
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
    });
}

// ─── 다운로드 헬퍼 ────────────────────────────────────────────────────────────

export function downloadDataURL(dataUrl: string, filename: string): void {
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = filename;
    a.click();
}

export function downloadSVG(doc: CanvasDocument, filename = "canvas.svg", bounds?: ExportBounds): void {
    const svg  = exportToSVGString(doc, bounds);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
