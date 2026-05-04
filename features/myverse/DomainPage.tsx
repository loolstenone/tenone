"use client";

// 9 영역 페이지 공통 쉘 — 헤더(영역명·설명) + DomainFeed
// /myverse/app/{body|work|study|...}/page.tsx 에서 재사용

import { useEffect, useState } from "react";
import { DomainFeed } from "./DomainFeed";
import { DOMAINS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";
import { createClient } from "@/lib/supabase/client";

export function DomainPage({ domain }: { domain: DomainKey }) {
    const meta = DOMAINS[domain];
    const [handle, setHandle] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) return;
            const { data } = await supabase
                .from("members")
                .select("handle")
                .eq("email", user.email)
                .maybeSingle();
            setHandle((data?.handle as string | null) ?? null);
        })();
    }, []);

    return (
        <div>
            <header className="px-6 pt-6 pb-3 border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.color_hex }}
                    />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: meta.color_hex }}>
                        {meta.label_en}
                    </span>
                </div>
                <h1 className="text-2xl font-serif text-neutral-900">{meta.label_ko}</h1>
                <p className="text-xs text-neutral-500 mt-1">{meta.description}</p>
            </header>
            <DomainFeed domain={domain} handle={handle} />
        </div>
    );
}
