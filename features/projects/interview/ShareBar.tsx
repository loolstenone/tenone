"use client";

/** 결과 공유 — 공유하기(모바일 공유 시트) · 링크 복사. 공유 링크는 항상 공식 주소 */
import { useState } from "react";
import { SITE } from "@/lib/projects/interview";

export function ShareBar({ code, title }: { code: string; title: string }) {
    const [copied, setCopied] = useState(false);
    const url = `${SITE.url}/r/${code}`;
    const text = `${title} — AI 면접관에게 떨어졌습니다. 당신도 미리 떨어져 보세요.`;

    async function copy() {
        try {
            await navigator.clipboard.writeText(`${text}\n${url}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt("링크를 복사해 주세요", url);
        }
    }

    async function share() {
        if (navigator.share) {
            try { await navigator.share({ title, text, url }); return; } catch { /* 취소 */ return; }
        }
        await copy();
    }

    return (
        <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={share} className="py-3.5 rounded-lg border border-neutral-600 font-bold hover:bg-white/5 transition-colors">
                결과 공유하기
            </button>
            <button type="button" onClick={copy} className="py-3.5 rounded-lg border border-neutral-600 font-bold hover:bg-white/5 transition-colors">
                {copied ? "복사했습니다" : "링크 복사"}
            </button>
        </div>
    );
}
