"use client";

// 9영역 페이지에서 traces 타임라인으로 돌아가는 표준 CTA
// 사용: <DomainBackLink domain="body" />

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { DomainKey } from "@/lib/myverse/domains";

export function DomainBackLink({ domain, className }: { domain: DomainKey; className?: string }) {
    return (
        <Link
            href={`/myverse/app/traces?domain=${domain}`}
            className={
                className ??
                "inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
            }
        >
            <ArrowLeft className="h-3 w-3" />
            흔적 타임라인
        </Link>
    );
}
