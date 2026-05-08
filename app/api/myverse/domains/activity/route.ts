// 9영역 도메인별 최근 7일 활동 카운트 — 사이드바 자동 배지용
// GET /api/myverse/domains/activity
//
// 응답: { counts: { body: 3, work: 12, study: 0, ... } }
// 흔적 + 일과(category 매핑) 합산.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import type { DomainKey } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 일과 category → 도메인 매핑 (도메인 컬럼 없는 일과를 9영역에 매핑)
const ROUTINE_CATEGORY_TO_DOMAIN: Record<string, DomainKey> = {
    work:     "work",
    exercise: "body",
    meal:     "body",
    study:    "study",
    leisure:  "daily",
    rest:     "daily",
    social:   "relation",
    health:   "body",
    transport:"move",
    faith:    "daily",
    general:  "daily",
};

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10);
    const admin = createAdminClient();

    const [momentsRes, routinesRes, placesRes, eventsRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("domain")
            .eq("member_id", memberId)
            .gte("date", since),
        admin.from("myverse_daily_routines")
            .select("category")
            .eq("member_id", memberId)
            .gte("date", since),
        admin.from("myverse_daily_places")
            .select("category")
            .eq("member_id", memberId)
            .gte("date", since),
        admin.from("myverse_calendar_entries")
            .select("id")
            .eq("member_id", memberId)
            .gte("starts_at", new Date(Date.now() - 7 * 86400 * 1000).toISOString())
            .limit(200),
    ]);

    const counts: Partial<Record<DomainKey, number>> = {};

    for (const m of momentsRes.data ?? []) {
        const d = m.domain as DomainKey | null;
        if (d) counts[d] = (counts[d] ?? 0) + 1;
    }
    for (const r of routinesRes.data ?? []) {
        const cat = (r.category as string | null) ?? "general";
        const d = ROUTINE_CATEGORY_TO_DOMAIN[cat] ?? "daily";
        counts[d] = (counts[d] ?? 0) + 1;
    }
    for (const p of placesRes.data ?? []) {
        const cat = (p.category as string | null) ?? "general";
        const d = ROUTINE_CATEGORY_TO_DOMAIN[cat] ?? "move";
        counts[d] = (counts[d] ?? 0) + 1;
    }
    counts.schedule = (counts.schedule ?? 0) + ((eventsRes.data ?? []).length);

    return NextResponse.json({ counts, since });
}
