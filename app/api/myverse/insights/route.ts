// 인사이트 — 교차 분석·패턴 발견 데이터 합성
// GET /api/myverse/insights?period=year|quarter|month
//
// 응답: 도메인 분포 / 자주 만난 사람 / 자주 간 장소 / 요일 패턴 / 월간 활동량 / 운동·수면 트렌드

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

interface MomentRow {
    date: string;
    domain: string | null;
    sub_tags: string[] | null;
    with_whom: string | null;
    location: string | null;
    happened_at: string | null;
    media_type: string;
    nutrition: { total?: { calories?: number } } | null;
    exercise: { calories_burned?: number; duration_min?: number } | null;
    study: { duration_min?: number } | null;
}

interface PlaceRow {
    date: string;
    place_name: string;
    category: string | null;
    duration_min: number | null;
}

function todayKST(): string {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

const PERIOD_DAYS: Record<string, number> = {
    week: 7,
    month: 31,
    quarter: 92,
    year: 365,
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const period = new URL(req.url).searchParams.get("period") || "year";
    const days = PERIOD_DAYS[period] ?? 365;
    const from = daysAgo(days);
    const to = todayKST();

    const admin = createAdminClient();

    const [momentsRes, placesRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("date, domain, sub_tags, with_whom, location, happened_at, media_type, nutrition, exercise, study")
            .eq("member_id", memberId)
            .gte("date", from)
            .lte("date", to),
        admin.from("myverse_daily_places")
            .select("date, place_name, category, duration_min")
            .eq("member_id", memberId)
            .gte("date", from)
            .lte("date", to),
    ]);

    const moments = (momentsRes.data ?? []) as MomentRow[];
    const places = (placesRes.data ?? []) as PlaceRow[];

    // 도메인 분포
    const domainCnt: Record<string, number> = {};
    for (const m of moments) {
        const d = m.domain ?? "daily";
        domainCnt[d] = (domainCnt[d] ?? 0) + 1;
    }

    // 자주 만난 사람 top 8
    const personCnt = new Map<string, number>();
    for (const m of moments) {
        if (m.with_whom) personCnt.set(m.with_whom, (personCnt.get(m.with_whom) ?? 0) + 1);
    }
    const topPeople = Array.from(personCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // 자주 간 장소 (moments + places 합산) top 10
    const placeCnt = new Map<string, number>();
    for (const m of moments) {
        if (m.location) placeCnt.set(m.location, (placeCnt.get(m.location) ?? 0) + 1);
    }
    for (const p of places) {
        if (p.place_name) placeCnt.set(p.place_name, (placeCnt.get(p.place_name) ?? 0) + 1);
    }
    const topPlaces = Array.from(placeCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // 요일 패턴
    const weekdayCnt = new Array(7).fill(0);
    for (const m of moments) {
        const wd = new Date(m.date + "T00:00:00").getDay();
        weekdayCnt[wd] += 1;
    }
    const weekdayPattern = weekdayCnt.map((cnt, i) => ({ day: WEEKDAY_LABELS[i], count: cnt }));

    // 월간 활동량
    const monthCnt = new Map<string, number>();
    for (const m of moments) {
        const ym = m.date.slice(0, 7);
        monthCnt.set(ym, (monthCnt.get(ym) ?? 0) + 1);
    }
    const monthlyActivity = Array.from(monthCnt.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));

    // 시간대 패턴 (happened_at 시간대별)
    const hourCnt = new Array(24).fill(0);
    for (const m of moments) {
        if (m.happened_at) {
            const h = new Date(m.happened_at).getHours();
            hourCnt[h] += 1;
        }
    }

    // 건강 합계
    let totalCalIntake = 0, totalCalBurn = 0, totalExerciseMin = 0, totalStudyMin = 0;
    for (const m of moments) {
        totalCalIntake += m.nutrition?.total?.calories ?? 0;
        totalCalBurn += m.exercise?.calories_burned ?? 0;
        totalExerciseMin += m.exercise?.duration_min ?? 0;
        totalStudyMin += m.study?.duration_min ?? 0;
    }

    // 미디어 타입 분포
    const mediaCnt = { image: 0, video: 0 };
    for (const m of moments) {
        if (m.media_type === "image") mediaCnt.image += 1;
        else if (m.media_type === "video") mediaCnt.video += 1;
    }

    // 핫 태그 top 12
    const tagCnt = new Map<string, number>();
    for (const m of moments) {
        if (m.sub_tags) {
            for (const t of m.sub_tags) {
                tagCnt.set(t, (tagCnt.get(t) ?? 0) + 1);
            }
        }
    }
    const topTags = Array.from(tagCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);

    return NextResponse.json({
        period,
        from,
        to,
        totals: {
            moments: moments.length,
            photos: mediaCnt.image,
            videos: mediaCnt.video,
            recorded_days: new Set(moments.map(m => m.date)).size,
            unique_people: personCnt.size,
            unique_places: placeCnt.size,
            cal_intake: totalCalIntake,
            cal_burn: totalCalBurn,
            exercise_min: totalExerciseMin,
            study_min: totalStudyMin,
        },
        domain_distribution: domainCnt,
        top_people: topPeople,
        top_places: topPlaces,
        weekday_pattern: weekdayPattern,
        monthly_activity: monthlyActivity,
        hour_pattern: hourCnt,
        top_tags: topTags,
    });
}
