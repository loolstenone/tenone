import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSeoSettings, seoOverview } from "@/lib/site-seo";

export const dynamic = "force-dynamic";

/**
 * 인트라 › 사이트 설정 › 검색 노출 (2026-10-16)
 * GET ?site=madleague → 설정(robots_extra·sitemap_exclude·llms_txt·json_ld) + 현황(공식 주소·사이트맵 주소 수·막힌 이유)
 * PUT { site, robots_extra, sitemap_exclude, llms_txt, json_ld } → ums_sites 저장. robots.txt·sitemap.xml은 1시간 안에 반영
 */
const SITE_RE = /^[a-z0-9_-]{2,40}$/;

/** 입력 오류 — 화면에 그대로 보여준다 */
class InputError extends Error {}

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const site = req.nextUrl.searchParams.get("site") ?? "";
    if (!SITE_RE.test(site)) return NextResponse.json({ error: "사이트를 지정하세요." }, { status: 400 });
    try {
        const settings = await getSiteSeoSettings(site);
        return NextResponse.json({ settings, overview: await seoOverview(site, settings) });
    } catch (e) {
        console.error("[intra/sites/seo GET]", e);
        return NextResponse.json({ error: "검색 노출 설정을 불러오지 못했습니다." }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const site = typeof body?.site === "string" ? body.site : "";
    if (!SITE_RE.test(site)) return NextResponse.json({ error: "사이트를 지정하세요." }, { status: 400 });

    const text = (v: unknown, max: number) => {
        if (v == null) return null;
        if (typeof v !== "string") throw new InputError("형식이 올바르지 않습니다.");
        if (v.length > max) throw new InputError(`${max.toLocaleString()}자 이내로 입력하세요.`);
        return v.trim() || null;
    };
    try {
        const robots_extra = text(body?.robots_extra, 5000);
        if (robots_extra && /^\s*sitemap\s*:/im.test(robots_extra)) throw new InputError("Sitemap 줄은 자동으로 들어갑니다. 빼고 저장하세요.");
        const llms_txt = text(body?.llms_txt, 50000);
        const json_ld = text(body?.json_ld, 20000);
        if (json_ld) {
            let parsed: unknown;
            try { parsed = JSON.parse(json_ld); } catch { throw new InputError("구조화 데이터(JSON-LD)가 올바른 JSON이 아닙니다."); }
            if (!parsed || typeof parsed !== "object") throw new InputError("구조화 데이터는 JSON 객체(또는 배열)여야 합니다.");
        }
        const rawExclude = Array.isArray(body?.sitemap_exclude) ? body.sitemap_exclude : [];
        const sitemap_exclude = [...new Set(rawExclude
            .filter((p): p is string => typeof p === "string")
            .map(p => p.trim().split(/[?#]/)[0].replace(/\/+$/, ""))
            .filter(Boolean))];
        if (sitemap_exclude.some(p => !/^\/[\w\-./%@]*$/.test(p))) throw new InputError("사이트맵 제외 경로는 /로 시작하는 경로만 적습니다 (예: /madleague/pt).");
        if (sitemap_exclude.length > 100) throw new InputError("제외 경로는 100개까지입니다.");

        const { data, error } = await createAdminClient().from("ums_sites")
            .update({ robots_extra, sitemap_exclude, llms_txt, json_ld }).eq("slug", site).select("slug");
        if (error) throw error;
        if (!data?.length) return NextResponse.json({ error: "사이트를 찾을 수 없습니다." }, { status: 404 });
        const settings = await getSiteSeoSettings(site);
        return NextResponse.json({ settings, overview: await seoOverview(site, settings) });
    } catch (e) {
        if (e instanceof InputError) return NextResponse.json({ error: e.message }, { status: 400 });
        console.error("[intra/sites/seo PUT]", e);
        return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
    }
}
