"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ url, name }: { url: string; name: string }) {
    const [copied, setCopied] = useState(false);

    async function handleClick() {
        const fullUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
        try {
            if (navigator.share) {
                await navigator.share({ title: `${name} · Myverse`, url: fullUrl });
                return;
            }
        } catch {
            /* user cancelled or share unsupported */
        }
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard blocked */
        }
    }

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 hover:border-neutral-400 text-neutral-700 rounded-full transition-colors"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    복사됨
                </>
            ) : (
                <>
                    <Share2 className="h-3.5 w-3.5" />
                    공유
                </>
            )}
        </button>
    );
}
