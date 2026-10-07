"use client";

// 인트라 사이드바용 사이트 Tier 맵 — SSOT = DB ums_sites.tier (헌법 §0.1)
// 브랜드가 집중/보관 중 어느 섹션에 보일지 정한다 (lib/intra-nav.ts regroupBrandSections)
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

let cache: Record<string, string | null> | null = null;
let inflight: Promise<Record<string, string | null>> | null = null;

async function loadTiers(): Promise<Record<string, string | null>> {
    if (cache) return cache;
    inflight ??= (async () => {
        const { data, error } = await createClient().from("ums_sites").select("slug, tier");
        if (error) { inflight = null; throw error; }
        cache = Object.fromEntries(((data ?? []) as { slug: string; tier: string | null }[]).map(r => [r.slug, r.tier]));
        return cache;
    })();
    return inflight;
}

/** 로딩 전·실패 시 null → 호출부는 정적 메뉴(코드 기본 배치)를 그대로 쓴다 */
export function useSiteTiers(): Record<string, string | null> | null {
    const [tiers, setTiers] = useState(cache);
    useEffect(() => {
        if (cache) return;
        loadTiers().then(setTiers).catch(e => console.error("[use-site-tiers]", e));
    }, []);
    return tiers;
}
