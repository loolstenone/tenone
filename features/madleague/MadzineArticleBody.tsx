"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const YOUTUBE_EMBED = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;

/** 기사 HTML 정화 — 기본 DOMPurify + YouTube embed iframe만 허용 (그 외 iframe·script·style 속성 제거) */
function sanitizeArticleHtml(html: string): string {
    DOMPurify.addHook("uponSanitizeElement", (node, data) => {
        if (data.tagName === "iframe") {
            const src = (node as Element).getAttribute("src") ?? "";
            if (!YOUTUBE_EMBED.test(src)) node.parentNode?.removeChild(node);
        }
    });
    const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allowfullscreen", "frameborder"],
        FORBID_ATTR: ["style"],
    });
    DOMPurify.removeHook("uponSanitizeElement");
    return clean;
}

const RICH =
    "leading-relaxed text-neutral-800 text-base " +
    "[&_p]:my-3 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-1 " +
    "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full " +
    "[&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto " +
    "[&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-neutral-200 [&_td]:p-2 [&_a]:underline";

/**
 * MADzine 본문. HTML(기존 madleague.net 이전분)은 브라우저에서 정화 후 렌더,
 * 일반 텍스트(에디터 작성분)는 줄바꿈 유지. 서버 렌더 때 HTML 정화가 불가(lib/sanitize-html.ts 참고)해 마운트 후 표시.
 */
export function MadzineArticleBody({ content }: { content: string }) {
    const isHtml = content.trimStart().startsWith("<");
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
        if (isHtml) setHtml(sanitizeArticleHtml(content));
    }, [content, isHtml]);

    if (!isHtml) {
        return <div className="whitespace-pre-wrap leading-relaxed text-neutral-800 text-base">{content}</div>;
    }
    if (html === null) return <div className="min-h-[40vh]" aria-busy="true" />;
    return <div className={RICH} dangerouslySetInnerHTML={{ __html: html }} />;
}
