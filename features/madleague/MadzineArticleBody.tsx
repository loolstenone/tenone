"use client";

import { useEffect, useState } from "react";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

/** 검정 바탕 에디토리얼 본문 — MadzineUI의 세리프 변수(--font-mz-serif) 사용 */
const RICH =
    "text-[17px] leading-[1.95] text-neutral-300 break-keep " +
    "[&_p]:my-5 [&>p:first-of-type]:text-lg [&>p:first-of-type]:text-neutral-100 " +
    "[&_strong]:font-semibold [&_strong]:text-white [&_b]:text-white [&_em]:italic " +
    "[&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:text-white [&_h2]:font-[family-name:var(--font-mz-serif)] " +
    "[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:text-white [&_h3]:font-[family-name:var(--font-mz-serif)] " +
    "[&_blockquote]:my-10 [&_blockquote]:border-l-2 [&_blockquote]:border-[#EC1D25] [&_blockquote]:pl-6 [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:text-white [&_blockquote]:font-[family-name:var(--font-mz-serif)] " +
    "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_li]:marker:text-[#EC1D25] " +
    "[&_img]:my-10 [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full " +
    "[&_iframe]:my-10 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto " +
    "[&_table]:my-8 [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-white/15 [&_td]:p-3 " +
    "[&_a]:text-white [&_a]:underline [&_a]:decoration-[#EC1D25] [&_a]:underline-offset-4";

/**
 * MADzine 본문. HTML(기존 madleague.net 이전분)은 브라우저에서 정화 후 렌더,
 * 일반 텍스트(에디터 작성분)는 줄바꿈 유지. 서버 렌더 때 HTML 정화가 불가(lib/sanitize-html.ts 참고)해 마운트 후 표시.
 */
export function MadzineArticleBody({ content }: { content: string }) {
    const isHtml = content.trimStart().startsWith("<");
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
        if (isHtml) setHtml(sanitizeRichHtml(content));
    }, [content, isHtml]);

    if (!isHtml) {
        return <div className="whitespace-pre-wrap text-[17px] leading-[1.95] text-neutral-300 break-keep">{content}</div>;
    }
    if (html === null) return <div className="min-h-[40vh]" aria-busy="true" />;
    return <div className={RICH} dangerouslySetInnerHTML={{ __html: html }} />;
}
