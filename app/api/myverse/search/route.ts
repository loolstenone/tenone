// 풀텍스트 검색 — content_axis 컬럼을 가로지르는 검색
// GET /api/myverse/search?q=...&domain=&days=
//
// content_axis는 OCR·STT·캡션·메모를 합친 검색 인덱스.
// 4개 capture 테이블을 동시에 ILIKE 매칭하고 시간순으로 통합 반환.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import { isValidDomain } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const domain = url.searchParams.get("domain");
    const days = parseInt(url.searchParams.get("days") ?? "180", 10);

    if (!q) return NextResponse.json({ items: [], total: 0 });
    if (q.length < 2) return NextResponse.json({ error: "query_too_short" }, { status: 400 });
    if (domain && !isValidDomain(domain)) return NextResponse.json({ error: "invalid_domain" }, { status: 400 });

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    // PostgreSQL ILIKE 패턴 (특수문자 이스케이프)
    const pattern = `%${q.replace(/[%_]/g, ch => `\\${ch}`)}%`;

    const admin = createAdminClient();

    function withDomain<T>(builder: T): T {
        if (domain) {
            return (builder as unknown as { eq: (k: string, v: string) => T }).eq("domain", domain);
        }
        return builder;
    }

    const [moments, routines, places, calendar] = await Promise.all([
        withDomain(
            admin
                .from("myverse_daily_moments")
                .select("id, date, happened_at, caption, media_url, media_type, content_axis, domain, visibility")
                .eq("member_id", memberId)
                .gte("date", sinceStr)
                .ilike("content_axis", pattern)
        ).order("happened_at", { ascending: false, nullsFirst: false }).limit(30),
        withDomain(
            admin
                .from("myverse_daily_routines")
                .select("id, date, start_time, activity, note, content_axis, domain, visibility")
                .eq("member_id", memberId)
                .gte("date", sinceStr)
                .ilike("content_axis", pattern)
        ).order("date", { ascending: false }).limit(30),
        withDomain(
            admin
                .from("myverse_daily_places")
                .select("id, date, visited_at, place_name, address, content_axis, domain, visibility")
                .eq("member_id", memberId)
                .gte("date", sinceStr)
                .ilike("content_axis", pattern)
        ).order("date", { ascending: false }).limit(30),
        withDomain(
            admin
                .from("myverse_calendar_entries")
                .select("id, date, title, start_time, content_axis, domain, visibility")
                .eq("member_id", memberId)
                .gte("date", sinceStr)
                .ilike("content_axis", pattern)
        ).order("date", { ascending: false }).limit(30),
    ]);

    type Hit = { type: string; id: string; date: string; sortKey: string; snippet: string; [k: string]: unknown };
    const hits: Hit[] = [];

    function makeSnippet(text: string | null): string {
        if (!text) return "";
        const lc = text.toLowerCase();
        const idx = lc.indexOf(q.toLowerCase());
        if (idx < 0) return text.slice(0, 80);
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + q.length + 50);
        return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }

    (moments.data ?? []).forEach(m => hits.push({
        type: "moment",
        ...m,
        sortKey: (m.happened_at as string | null) ?? `${m.date}T00:00:00`,
        snippet: makeSnippet((m.content_axis as string | null) ?? (m.caption as string | null)),
    }));
    (routines.data ?? []).forEach(r => hits.push({
        type: "routine",
        ...r,
        sortKey: `${r.date}T${r.start_time ?? "00:00"}`,
        snippet: makeSnippet((r.content_axis as string | null) ?? (r.activity as string | null)),
    }));
    (places.data ?? []).forEach(p => hits.push({
        type: "place",
        ...p,
        sortKey: `${p.date}T${p.visited_at ?? "00:00"}`,
        snippet: makeSnippet((p.content_axis as string | null) ?? (p.place_name as string | null)),
    }));
    (calendar.data ?? []).forEach(c => hits.push({
        type: "calendar",
        ...c,
        sortKey: `${c.date}T${c.start_time ?? "00:00"}`,
        snippet: makeSnippet((c.content_axis as string | null) ?? (c.title as string | null)),
    }));

    hits.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    return NextResponse.json({
        items: hits.slice(0, 50),
        total: hits.length,
        query: q,
        domain: domain ?? null,
    });
}
