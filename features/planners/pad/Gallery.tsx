"use client";

import { useState } from "react";

/** 상품 사진 갤러리 — 큰 사진 + 썸네일 (바닥상회 상품 사진, 외부 CDN이라 img 그대로) */
export function Gallery({ images, title }: { images: string[]; title: string }) {
    const [current, setCurrent] = useState(0);
    if (images.length === 0) return <div className="aspect-square border border-neutral-200 bg-neutral-50" />;
    return (
        <div>
            <div className="aspect-square overflow-hidden border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[current]} alt={title} className="h-full w-full object-contain p-4" />
            </div>
            {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                    {images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => setCurrent(i)}
                            aria-label={`사진 ${i + 1}`}
                            className={`aspect-square overflow-hidden border bg-neutral-50 ${i === current ? "border-[#0F766E]" : "border-neutral-200 hover:border-neutral-400"}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-contain p-1" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
