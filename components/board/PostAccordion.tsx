"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Post } from "@/types/board";

interface PostAccordionProps {
    post: Post;
    accentColor?: string;
}

export default function PostAccordion({ post, accentColor = "#171717" }: PostAccordionProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b" style={{ borderColor: "var(--tn-border)" }}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                style={{ backgroundColor: open ? "var(--tn-bg-alt)" : "transparent" }}
            >
                <span className="text-sm font-bold shrink-0" style={{ color: accentColor }}>Q</span>
                <span className="text-sm font-medium tn-text flex-1">{post.title}</span>
                <ChevronDown className={`h-4 w-4 tn-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-5 pb-5 pl-10">
                    {post.content ? (
                        <div
                            className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed"
                            style={{ color: "var(--tn-text-sub)" }}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    ) : (
                        <p className="text-sm" style={{ color: "var(--tn-text-muted)" }}>
                            {post.excerpt || "답변이 아직 등록되지 않았습니다."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
