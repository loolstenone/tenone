"use client";

import { useEffect, useState } from "react";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

const RICH =
    "text-[16px] leading-[1.9] text-neutral-700 break-keep " +
    "[&_p]:my-3 [&_strong]:font-semibold [&_strong]:text-black [&_b]:text-black " +
    "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-black " +
    "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-black " +
    "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 " +
    "[&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full " +
    "[&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto " +
    "[&_a]:text-black [&_a]:underline [&_a]:decoration-[#00d255] [&_a]:underline-offset-4";

/** 이전 글 본문 (HTML) — 브라우저에서 정화 후 렌더 (YouTube embed만 허용). 일반 텍스트는 줄바꿈 유지 */
export function RooKPostBody({ content }: { content: string }) {
    const isHtml = content.trimStart().startsWith("<");
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
        if (isHtml) setHtml(sanitizeRichHtml(content));
    }, [content, isHtml]);

    if (!isHtml) return <div className="whitespace-pre-wrap text-[16px] leading-[1.9] text-neutral-700 break-keep">{content}</div>;
    if (html === null) return <div className="min-h-[30vh]" aria-busy="true" />;
    return <div className={RICH} dangerouslySetInnerHTML={{ __html: html }} />;
}
