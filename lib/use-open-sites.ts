"use client";

// 열린 사이트로만 길을 낸다 (2026-10-17 사용자 — 유니버스는 하나씩 연다, CLAUDE.md §0.1 오픈 순서)
// SSOT = DB ums_sites.is_open. 인트라에서 사이트를 열면 링크도 저절로 나타난다
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { detectSiteId } from "@/lib/site-context";

type SiteRow = { slug: string; is_open: boolean | null; tier: string | null };

let cache: Map<string, SiteRow> | null = null;
let inflight: Promise<Map<string, SiteRow>> | null = null;

async function loadSites(): Promise<Map<string, SiteRow>> {
    if (cache) return cache;
    inflight ??= (async () => {
        const { data, error } = await createClient().from("ums_sites").select("slug, is_open, tier");
        if (error) { inflight = null; throw error; }
        cache = new Map(((data ?? []) as SiteRow[]).map(r => [r.slug, r]));
        return cache;
    })();
    return inflight;
}

function useSites(): Map<string, SiteRow> | null {
    const [sites, setSites] = useState(cache);
    useEffect(() => {
        if (cache) return;
        loadSites().then(setSites).catch(e => console.error("[use-open-sites]", e));
    }, []);
    return sites;
}

/** 사이트 ID → ums_sites.slug (0gamja만 다르다) */
const toSlug = (siteId: string) => (siteId === "ogamja" ? "0gamja" : siteId);

/** 모든 도메인이 함께 쓰는 경로 — 어느 사이트 소속도 아니라 늘 보인다 */
const SHARED = ["/terms", "/privacy", "/profile", "/login", "/signup"];

/**
 * 다른 브랜드로 가는 링크를 보여도 되는지 — 외부 주소·공통 경로·지금 사이트는 늘 true,
 * 다른 브랜드 경로(/hero 등)는 그 사이트가 열려 있을 때만. 열린 목록을 받기 전엔 숨긴다 (닫힌 곳이 잠깐 비치지 않게)
 */
export function useOpenLinkFilter(): (href: string) => boolean {
    const sites = useSites();
    const [current, setCurrent] = useState<string | null>(null);

    useEffect(() => {
        setCurrent(toSlug(detectSiteId(window.location.hostname, window.location.pathname)));
    }, []);

    return (href: string) => {
        let host = "localhost";
        let path = href.split(/[?#]/)[0];
        if (/^https?:\/\//.test(href)) {
            // 브랜드 공식 주소(https://www.badak.biz 등)만 판별, 그 밖의 외부 주소(유튜브 등)는 그대로
            const url = new URL(href);
            host = url.hostname;
            path = url.pathname;
            const site = detectSiteId(host, path);
            if (site === "tenone" && host !== "tenone.biz" && host !== "www.tenone.biz") return true;
        } else if (!href.startsWith("/")) {
            return true;
        }
        if (SHARED.some(p => path === p || path.startsWith(`${p}/`))) return true;
        const target = toSlug(detectSiteId(host, path));
        if (target === current) return true;
        return sites?.get(target)?.is_open === true;
    };
}

export type BrandStatus = "open" | "building" | "idea";

/**
 * 브랜드 소개(About › Brands)용 상태 — 운영 중(is_open) · 만드는 중(집중 브랜드인데 아직 닫힘) · 구상(그 외·사이트 없음)
 * 목록을 받기 전엔 null (상태 표시를 비워 둔다)
 */
export function useBrandStatus(): (href: string | undefined) => BrandStatus | null {
    const sites = useSites();
    return (href) => {
        if (!sites) return null;
        if (!href || !href.startsWith("/")) return "idea";
        const row = sites.get(toSlug(detectSiteId("localhost", href.split(/[?#]/)[0])));
        if (!row) return "idea";
        if (row.is_open) return "open";
        return row.tier === "core" || row.tier === "focus" ? "building" : "idea";
    };
}
