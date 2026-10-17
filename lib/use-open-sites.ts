"use client";

// 열린 사이트로만 길을 낸다 (2026-10-17 사용자 — 유니버스는 하나씩 연다, CLAUDE.md §0.1 오픈 순서)
// SSOT = DB ums_sites.is_open. 인트라에서 사이트를 열면 링크도 저절로 나타난다
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { detectSiteId } from "@/lib/site-context";

let cache: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

async function loadOpenSites(): Promise<Set<string>> {
    if (cache) return cache;
    inflight ??= (async () => {
        const { data, error } = await createClient().from("ums_sites").select("slug").eq("is_open", true);
        if (error) { inflight = null; throw error; }
        cache = new Set(((data ?? []) as { slug: string }[]).map(r => r.slug));
        return cache;
    })();
    return inflight;
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
    const [open, setOpen] = useState(cache);
    const [current, setCurrent] = useState<string | null>(null);

    useEffect(() => {
        setCurrent(toSlug(detectSiteId(window.location.hostname, window.location.pathname)));
        if (cache) return;
        loadOpenSites().then(setOpen).catch(e => console.error("[use-open-sites]", e));
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
        return open?.has(target) ?? false;
    };
}
