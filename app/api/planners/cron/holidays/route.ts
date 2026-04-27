// 공공데이터포털 한국 공휴일·절기 prefetch — 매년 1월 1일 + 수동 호출 가능
// 인증: Authorization: Bearer ${CRON_SECRET}
// 입력: ?year=2027 (없으면 다음 해)
// 결과: planners_calendar_entries 에 KR 공휴일·절기 upsert (is_system=true)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchKoreanHolidays, fetchKoreanSolarTerms } from "@/lib/planners/public-holidays";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // 인증 — Vercel cron 또는 수동 호출
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET || "no-secret"}`;
    if (auth !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear() + 1;

    if (!Number.isFinite(year) || year < 2024 || year > 2050) {
        return NextResponse.json({ error: "invalid_year" }, { status: 400 });
    }

    const admin = createAdminClient();

    try {
        const [holidays, terms] = await Promise.all([
            fetchKoreanHolidays(year).catch((e) => { console.error("holidays fetch err", e); return []; }),
            fetchKoreanSolarTerms(year).catch((e) => { console.error("terms fetch err", e); return []; }),
        ]);

        // 기존 해당 연도 KR 시스템 엔트리 정리 후 재시드 (idempotent)
        await admin
            .from("planners_calendar_entries")
            .delete()
            .eq("is_system", true)
            .eq("country", "KR")
            .gte("start_date", `${year}-01-01`)
            .lte("start_date", `${year}-12-31`);

        const rows: Array<{ kind: string; title: string; start_date: string; recurrence: string; is_system: boolean; country: string; color: string }> = [];

        for (const h of holidays) {
            rows.push({
                kind: "public_holiday",
                title: h.name,
                start_date: h.date,
                recurrence: "none",
                is_system: true,
                country: "KR",
                color: "#DC2626",
            });
        }
        for (const t of terms) {
            rows.push({
                kind: "solar_term",
                title: t.name,
                start_date: t.date,
                recurrence: "none",
                is_system: true,
                country: "KR",
                color: "#94A3B8",
            });
        }

        if (rows.length === 0) {
            return NextResponse.json({ ok: true, year, inserted: 0, message: "no data — check API key" });
        }

        const { error } = await admin.from("planners_calendar_entries").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({
            ok: true,
            year,
            inserted: rows.length,
            holidays: holidays.length,
            solar_terms: terms.length,
        });
    } catch (e) {
        console.error("cron holidays err", e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
