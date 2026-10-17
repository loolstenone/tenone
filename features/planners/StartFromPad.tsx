"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PAD_FROM_STORAGE, type PadFromKey } from "@/lib/planners/pad-landing";
import { heroPrimaryBtn } from "@/features/planners/PageHero";

/** PAD 들어오는 길 '시작하기' - 어느 페이지에서 왔는지 남겨 두고 앱으로 (로그인·처음 설정을 거쳐도 BrainDump가 읽는다) */
export function StartFromPad({ fromKey, href }: { fromKey: PadFromKey; href: string }) {
    const router = useRouter();
    const start = () => {
        try { sessionStorage.setItem(PAD_FROM_STORAGE, fromKey); } catch { /* 저장 못 해도 화면은 열린다 */ }
        router.push(href);
    };
    return (
        <button type="button" onClick={start} className={`${heroPrimaryBtn} gap-2`}>
            이 페이지로 시작하기 <ArrowRight className="h-4 w-4" />
        </button>
    );
}
