"use client";

// 콘텐츠 카드 우상단에 부착하는 작은 Share2 아이콘 버튼
// 클릭 시 ShareSheet 모달 열림.

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareSheet } from "./ShareSheet";

interface Props {
    table: string;
    id: string;
    title?: string;
    text?: string;
    imageUrl?: string;
    visibility: "private" | "friends" | "public";
    handle: string | null;
    size?: "sm" | "md";
}

export function ShareButton({ table, id, title, text, imageUrl, visibility, handle, size = "sm" }: Props) {
    const [open, setOpen] = useState(false);
    const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-1 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
                title="외부 공유"
            >
                <Share2 className={iconSize} />
            </button>
            <ShareSheet
                open={open}
                onClose={() => setOpen(false)}
                table={table}
                id={id}
                title={title}
                text={text}
                imageUrl={imageUrl}
                initialVisibility={visibility}
                handle={handle}
            />
        </>
    );
}
