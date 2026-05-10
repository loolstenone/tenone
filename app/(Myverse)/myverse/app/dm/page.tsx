"use client";

// DM — 1:1 메시지 페이지
// /myverse/app/dm                      목록만
// /myverse/app/dm?to=<member_id>       해당 사용자와 스레드 생성/오픈
// /myverse/app/dm?thread=<thread_id>   특정 스레드 오픈

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DMView } from "@/features/myverse/app/DMView";

function DMPageInner() {
    const sp = useSearchParams();
    const to = sp.get("to") ?? undefined;
    const thread = sp.get("thread") ?? undefined;
    return <DMView initialMemberId={to} initialThreadId={thread} />;
}

export default function DMPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-neutral-400">불러오는 중…</div>}>
            <DMPageInner />
        </Suspense>
    );
}
