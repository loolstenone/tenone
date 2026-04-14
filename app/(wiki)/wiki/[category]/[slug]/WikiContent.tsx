"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { resolveWikiLinks } from "@/lib/wiki/markdown";

export function WikiContent({ content, slugMap }: { content: string; slugMap: Record<string, string> }) {
    const resolved = resolveWikiLinks(content, slugMap);

    return (
        <article className="prose prose-sm prose-neutral max-w-none
            prose-headings:font-bold prose-headings:text-neutral-800
            prose-h2:text-sm prose-h2:mt-6 prose-h2:mb-3
            prose-h3:text-xs prose-h3:mt-4 prose-h3:mb-2
            prose-p:text-xs prose-p:text-neutral-600 prose-p:leading-relaxed
            prose-li:text-xs prose-li:text-neutral-600
            prose-a:text-neutral-900 prose-a:underline prose-a:underline-offset-2
            prose-table:text-xs
            prose-code:text-[11px] prose-code:bg-neutral-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-neutral-300 prose-blockquote:text-neutral-500
        ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children }) => {
                        if (href?.startsWith('/')) {
                            return <Link href={href} className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600">{children}</Link>;
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                    },
                }}
            >
                {resolved}
            </ReactMarkdown>
        </article>
    );
}
