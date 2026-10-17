"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/features/planners/pad/ProductCard";
import type { PlannersFile } from "@/lib/planners/library-shared";

const STEP = 12;

/**
 * 분류 화면 목록 — 처음 12개만 그리고, 끝에 가까워지면 12개씩 더 그린다 (소셜 피드처럼)
 * 사진은 카드마다 loading="lazy"라 보일 때 받는다. 목록 자체도 나눠 그려 첫 화면을 가볍게
 */
export function ProgressiveProductGrid({ files, reviewCounts }: { files: PlannersFile[]; reviewCounts: Record<string, number> }) {
    const [shown, setShown] = useState(STEP);
    const sentinel = useRef<HTMLDivElement>(null);

    // 분류·정렬이 바뀌면 처음부터
    const key = files.map((f) => f.id).join(",");
    useEffect(() => { setShown(STEP); }, [key]);

    useEffect(() => {
        const el = sentinel.current;
        if (!el || shown >= files.length) return;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) setShown((n) => Math.min(n + STEP, files.length));
        }, { rootMargin: "800px 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, [shown, files.length]);

    return (
        <>
            <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-12 md:gap-y-24 lg:grid-cols-3">
                {files.slice(0, shown).map((f, i) => <ProductCard key={f.id} file={f} priority={i < 6} reviewCount={reviewCounts[f.id] ?? 0} />)}
            </div>
            {shown < files.length && (
                <div ref={sentinel} className="flex justify-center pt-16">
                    <button type="button" onClick={() => setShown((n) => Math.min(n + STEP, files.length))} className="text-sm text-neutral-500 hover:text-neutral-900">
                        더 보기 ({shown} / {files.length})
                    </button>
                </div>
            )}
        </>
    );
}
