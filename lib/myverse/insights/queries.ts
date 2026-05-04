// 교차 인사이트 질의 — 사용자 데이터로 5가지 핵심 질문에 답하는 데이터 fetcher
//
// 5 핵심 질문 (BMC v3 명시):
//   Q1. "내가 가장 생산적인 시기는?" — work routines + body(운동) 빈도 상관
//   Q2. "이 사람과 만난 후 일·생활은?" — relation/people_axis 다음 24h
//   Q3. "이 장소에서 집중 시간은?" — places + work routines 누적
//   Q4. "야식 잦은 주 다음 주 운동은?" — body 카테고리 시퀀스 분석
//   Q5. "지금까지 가장 깊이 일한 사람 TOP 5" — relation 횟수·시간 누적

import { createAdminClient } from "@/lib/supabase/admin";

interface AggregateContext {
    member_id: string;
    days: number;
}

/** 9 영역별 일/주/월 통계 — Haiku에게 전달할 구조화된 컨텍스트 */
export async function fetchDomainStats(ctx: AggregateContext) {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - ctx.days);
    const sinceStr = since.toISOString().slice(0, 10);

    // 4 capture 테이블에서 도메인별 카운트·시간
    const [moments, routines, places, calendar] = await Promise.all([
        admin
            .from("planners_daily_moments")
            .select("domain, date")
            .eq("member_id", ctx.member_id)
            .gte("date", sinceStr),
        admin
            .from("planners_daily_routines")
            .select("domain, date, start_time, end_time, category, activity")
            .eq("member_id", ctx.member_id)
            .gte("date", sinceStr),
        admin
            .from("planners_daily_places")
            .select("domain, date, place_name, duration_min")
            .eq("member_id", ctx.member_id)
            .gte("date", sinceStr),
        admin
            .from("planners_calendar_entries")
            .select("domain, date, kind, title")
            .eq("member_id", ctx.member_id)
            .gte("date", sinceStr),
    ]);

    type Stats = Record<string, { count: number; total_minutes: number; days_active: Set<string> }>;
    const byDomain: Stats = {};

    function bump(domain: string | null, date: string, minutes = 0) {
        const k = domain ?? "daily";
        byDomain[k] ??= { count: 0, total_minutes: 0, days_active: new Set() };
        byDomain[k].count += 1;
        byDomain[k].total_minutes += minutes;
        byDomain[k].days_active.add(date);
    }

    (moments.data ?? []).forEach(m => bump(m.domain, m.date));
    (routines.data ?? []).forEach(r => {
        let mins = 0;
        if (r.start_time && r.end_time) {
            const [sh, sm] = r.start_time.split(":").map(Number);
            const [eh, em] = r.end_time.split(":").map(Number);
            mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
        }
        bump(r.domain, r.date, mins);
    });
    (places.data ?? []).forEach(p => bump(p.domain, p.date, p.duration_min ?? 0));
    (calendar.data ?? []).forEach(c => bump(c.domain, c.date));

    // Set → 개수로
    return Object.fromEntries(
        Object.entries(byDomain).map(([k, v]) => [k, {
            count: v.count,
            total_minutes: v.total_minutes,
            days_active: v.days_active.size,
        }])
    );
}

/** 가장 자주 만난 사람 TOP N — Q5 */
export async function fetchTopPeople(ctx: AggregateContext, limit = 10) {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - ctx.days);
    const sinceStr = since.toISOString().slice(0, 10);

    // people_axis UUID[] 컬럼을 unnest해서 카운트
    // capture 테이블 4개 합산
    const counts: Record<string, { count: number; last_seen: string }> = {};

    for (const table of ["planners_daily_moments", "planners_daily_routines", "planners_daily_places", "planners_calendar_entries"]) {
        const { data } = await admin
            .from(table)
            .select("people_axis, date")
            .eq("member_id", ctx.member_id)
            .gte("date", sinceStr);
        for (const row of data ?? []) {
            const people = (row.people_axis as string[] | null) ?? [];
            for (const pid of people) {
                counts[pid] ??= { count: 0, last_seen: row.date };
                counts[pid].count += 1;
                if (row.date > counts[pid].last_seen) counts[pid].last_seen = row.date;
            }
        }
    }

    const top = Object.entries(counts)
        .map(([id, v]) => ({ contact_id: id, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    if (top.length === 0) return [];

    // contacts 정보 fetch
    const { data: contacts } = await admin
        .from("planners_contacts")
        .select("id, name, company")
        .in("id", top.map(t => t.contact_id));

    const map = new Map((contacts ?? []).map(c => [c.id, c]));
    return top.map(t => ({
        ...t,
        name: map.get(t.contact_id)?.name ?? "(이름 없음)",
        company: map.get(t.contact_id)?.company ?? null,
    }));
}

/** 자주 가는 장소 TOP N — Q3 단서 */
export async function fetchTopPlaces(ctx: AggregateContext, limit = 10) {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - ctx.days);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data } = await admin
        .from("planners_daily_places")
        .select("place_name, domain, duration_min, date")
        .eq("member_id", ctx.member_id)
        .gte("date", sinceStr);

    const counts: Record<string, { name: string; domain: string; count: number; total_min: number; last_visit: string }> = {};
    for (const r of data ?? []) {
        const k = r.place_name;
        counts[k] ??= { name: r.place_name, domain: r.domain ?? "daily", count: 0, total_min: 0, last_visit: r.date };
        counts[k].count += 1;
        counts[k].total_min += r.duration_min ?? 0;
        if (r.date > counts[k].last_visit) counts[k].last_visit = r.date;
    }

    return Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/** 주별 영역 분포 — 시계열 (Q1/Q4 핵심) */
export async function fetchWeeklyTrend(ctx: AggregateContext) {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - ctx.days);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data } = await admin
        .from("planners_daily_routines")
        .select("date, domain, start_time, end_time")
        .eq("member_id", ctx.member_id)
        .gte("date", sinceStr);

    const byWeek: Record<string, Record<string, number>> = {};
    for (const r of data ?? []) {
        // ISO week
        const d = new Date(r.date + "T00:00:00");
        const yr = d.getFullYear();
        const onejan = new Date(yr, 0, 1);
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        const key = `${yr}-W${String(week).padStart(2, "0")}`;
        byWeek[key] ??= {};
        const dom = r.domain ?? "daily";
        let mins = 0;
        if (r.start_time && r.end_time) {
            const [sh, sm] = r.start_time.split(":").map(Number);
            const [eh, em] = r.end_time.split(":").map(Number);
            mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
        }
        byWeek[key][dom] = (byWeek[key][dom] ?? 0) + mins;
    }

    return Object.entries(byWeek)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, domains]) => ({ week, domains }));
}
