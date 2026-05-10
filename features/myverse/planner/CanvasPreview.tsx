"use client";

// 캔버스 미리보기 — 툴바·인터랙션 없이 콘텐츠만.
// 썸네일이 있으면 이미지, 없으면 SVG 요소 직접 렌더 (단순 path/rect/ellipse만).

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

interface CanvasDoc {
    elements?: Array<{
        type?: string;
        kind?: string;
        d?: string;
        points?: Array<[number, number]>;
        x?: number; y?: number; width?: number; height?: number;
        cx?: number; cy?: number; rx?: number; ry?: number;
        color?: string; stroke?: string; fill?: string;
        strokeWidth?: number;
    }>;
    width?: number;
    height?: number;
}

interface Props {
    canvasId: string;
}

export function CanvasPreview({ canvasId }: Props) {
    const [thumb, setThumb] = useState<string | null>(null);
    const [doc, setDoc] = useState<CanvasDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch(`/api/myverse/canvases/${canvasId}`, { cache: "no-store" });
                if (!r.ok) { if (!cancelled) setLoading(false); return; }
                const { canvas } = await r.json();
                if (cancelled) return;
                setThumb(canvas?.thumbnail_url ?? null);
                if (canvas?.data) {
                    try {
                        setDoc(typeof canvas.data === "string" ? JSON.parse(canvas.data) : canvas.data);
                    } catch { /* ignore */ }
                }
            } catch { /* ignore */ }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [canvasId]);

    if (loading) {
        return <div className="h-full w-full bg-neutral-50" />;
    }

    if (thumb) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={thumb} alt="" className="w-full h-full object-contain bg-neutral-50" />;
    }

    if (doc?.elements && doc.elements.length > 0) {
        // 모든 요소를 감싸는 viewBox 추정 (없으면 1000x600 기본)
        const w = doc.width ?? 1000;
        const h = doc.height ?? 600;
        return (
            <svg
                viewBox={`0 0 ${w} ${h}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full bg-neutral-50"
                xmlns="http://www.w3.org/2000/svg"
            >
                {doc.elements.map((el, i) => {
                    const stroke = el.color ?? el.stroke ?? "#1e1e1e";
                    const sw = el.strokeWidth ?? 2;
                    const fill = el.fill ?? "none";
                    if (el.d) return <path key={i} d={el.d} stroke={stroke} strokeWidth={sw} fill={fill} strokeLinecap="round" strokeLinejoin="round" />;
                    if (el.points && el.points.length > 0) {
                        return <polyline key={i} points={el.points.map(p => p.join(",")).join(" ")} stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
                    }
                    if (el.kind === "rect" || el.type === "rect") {
                        return <rect key={i} x={el.x ?? 0} y={el.y ?? 0} width={el.width ?? 0} height={el.height ?? 0} stroke={stroke} strokeWidth={sw} fill={fill} />;
                    }
                    if (el.kind === "ellipse" || el.type === "ellipse") {
                        return <ellipse key={i} cx={el.cx ?? 0} cy={el.cy ?? 0} rx={el.rx ?? 0} ry={el.ry ?? 0} stroke={stroke} strokeWidth={sw} fill={fill} />;
                    }
                    return null;
                })}
            </svg>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-xs text-neutral-400 gap-1">
            <ImageIcon className="h-6 w-6 text-neutral-300" />
            자유 캔버스 — 클릭해서 그리기
        </div>
    );
}
