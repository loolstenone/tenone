// Apple Health Export ZIP/XML → 일별 집계 → myverse_daily_health upsert
//
// 사용자가 iOS 건강 앱에서 "건강 데이터 모두 내보내기" → export.zip → 업로드
// ZIP 또는 export.xml 직접 받음. 파일 크기 100MB 제한 — 큰 파일은 사용자가 별도 도구로 잘라서.
//
// 파싱: ZIP일 경우 jszip으로 export.xml 추출. XML은 정규식 기반 lightweight scan.
//   <Record type="..." startDate="..." endDate="..." value="..." unit="..." />
//   <Workout workoutActivityType="..." startDate="..." duration="..." totalEnergyBurned="..." />

import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_BYTES = 100 * 1024 * 1024;

interface DayAgg {
    steps: number;
    distance_km: number;
    active_kcal: number;
    flights: number;
    exercise_min: number;
    sleep_min: number;
    in_bed_min: number;
    hr_sum: number;
    hr_count: number;
    rhr_sum: number;
    rhr_count: number;
    weight_kg: number | null;
    body_fat_pct: number | null;
}

function emptyAgg(): DayAgg {
    return {
        steps: 0, distance_km: 0, active_kcal: 0, flights: 0, exercise_min: 0,
        sleep_min: 0, in_bed_min: 0,
        hr_sum: 0, hr_count: 0, rhr_sum: 0, rhr_count: 0,
        weight_kg: null, body_fat_pct: null,
    };
}

function parseDate(str: string): string | null {
    // Apple Health: "2025-05-09 08:23:14 +0900"
    const m = str.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
}

function diffMinutes(start: string, end: string): number {
    const s = new Date(start.replace(" ", "T").replace(/ ([+-]\d{4})$/, ""));
    const e = new Date(end.replace(" ", "T").replace(/ ([+-]\d{4})$/, ""));
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    return Math.max(0, (e.getTime() - s.getTime()) / 60000);
}

function aggregateXML(xml: string): Map<string, DayAgg> {
    const days = new Map<string, DayAgg>();
    const get = (date: string) => {
        if (!days.has(date)) days.set(date, emptyAgg());
        return days.get(date)!;
    };

    // <Record ... />
    const recordRe = /<Record\s+([^>]*?)\/?>/g;
    const attrRe = /(\w+)="([^"]*)"/g;

    let match;
    while ((match = recordRe.exec(xml)) !== null) {
        const attrs: Record<string, string> = {};
        let am;
        while ((am = attrRe.exec(match[1])) !== null) attrs[am[1]] = am[2];
        attrRe.lastIndex = 0;

        const type = attrs.type ?? "";
        const startDate = attrs.startDate ?? "";
        const endDate = attrs.endDate ?? startDate;
        const date = parseDate(startDate);
        if (!date) continue;
        const value = parseFloat(attrs.value ?? "0");
        const a = get(date);

        if (type === "HKQuantityTypeIdentifierStepCount") a.steps += Math.round(value);
        else if (type === "HKQuantityTypeIdentifierDistanceWalkingRunning") a.distance_km += value;
        else if (type === "HKQuantityTypeIdentifierActiveEnergyBurned") a.active_kcal += value;
        else if (type === "HKQuantityTypeIdentifierFlightsClimbed") a.flights += Math.round(value);
        else if (type === "HKQuantityTypeIdentifierAppleExerciseTime") a.exercise_min += value;
        else if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
            const min = diffMinutes(startDate, endDate);
            const v = attrs.value ?? "";
            if (v.includes("Asleep")) a.sleep_min += min;
            if (v.includes("InBed")) a.in_bed_min += min;
        }
        else if (type === "HKQuantityTypeIdentifierHeartRate") { a.hr_sum += value; a.hr_count += 1; }
        else if (type === "HKQuantityTypeIdentifierRestingHeartRate") { a.rhr_sum += value; a.rhr_count += 1; }
        else if (type === "HKQuantityTypeIdentifierBodyMass") { a.weight_kg = value; }
        else if (type === "HKQuantityTypeIdentifierBodyFatPercentage") { a.body_fat_pct = value * 100; }
    }

    // <Workout ... />
    const workoutRe = /<Workout\s+([^>]*?)\/?>/g;
    while ((match = workoutRe.exec(xml)) !== null) {
        const attrs: Record<string, string> = {};
        let am;
        while ((am = attrRe.exec(match[1])) !== null) attrs[am[1]] = am[2];
        attrRe.lastIndex = 0;

        const startDate = attrs.startDate ?? "";
        const date = parseDate(startDate);
        if (!date) continue;
        const a = get(date);
        const dur = parseFloat(attrs.duration ?? "0");
        const kcal = parseFloat(attrs.totalEnergyBurned ?? "0");
        const km = parseFloat(attrs.totalDistance ?? "0");
        if (dur) a.exercise_min += dur;
        if (kcal) a.active_kcal += kcal;
        if (km) a.distance_km += km;
    }

    return days;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let form: FormData;
    try { form = await req.formData(); } catch { return NextResponse.json({ error: "invalid_form" }, { status: 400 }); }

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", limit_mb: 100 }, { status: 400 });

    let xml = "";
    if (file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip") {
        try {
            const zip = await JSZip.loadAsync(await file.arrayBuffer());
            // 가장 큰 export.xml 찾기 (apple_health_export 폴더 내부)
            let target: JSZip.JSZipObject | null = null;
            zip.forEach((path, entry) => {
                if (path.endsWith("export.xml") && !entry.dir) target = entry;
            });
            if (!target) return NextResponse.json({ error: "export_xml_not_found" }, { status: 400 });
            xml = await (target as JSZip.JSZipObject).async("string");
        } catch (e) {
            return NextResponse.json({ error: "zip_parse_failed", message: (e as Error).message }, { status: 400 });
        }
    } else if (file.name.toLowerCase().endsWith(".xml") || file.type === "text/xml" || file.type === "application/xml") {
        xml = await file.text();
    } else {
        return NextResponse.json({ error: "unsupported_format", hint: "ZIP 또는 XML 파일을 업로드하세요" }, { status: 400 });
    }

    const days = aggregateXML(xml);
    if (days.size === 0) {
        return NextResponse.json({ imported: 0, message: "건강 데이터를 찾지 못했어요" });
    }

    const admin = createAdminClient();
    const rows = Array.from(days.entries()).map(([date, a]) => ({
        member_id: memberId,
        date,
        source: "apple_health",
        steps: a.steps || null,
        distance_km: a.distance_km > 0 ? Number(a.distance_km.toFixed(3)) : null,
        active_kcal: a.active_kcal > 0 ? Number(a.active_kcal.toFixed(2)) : null,
        flights_climbed: a.flights || null,
        exercise_min: a.exercise_min > 0 ? Math.round(a.exercise_min) : null,
        sleep_min: a.sleep_min > 0 ? Math.round(a.sleep_min) : null,
        sleep_in_bed_min: a.in_bed_min > 0 ? Math.round(a.in_bed_min) : null,
        heart_rate_avg: a.hr_count > 0 ? Math.round(a.hr_sum / a.hr_count) : null,
        heart_rate_resting: a.rhr_count > 0 ? Math.round(a.rhr_sum / a.rhr_count) : null,
        weight_kg: a.weight_kg,
        body_fat_pct: a.body_fat_pct,
    }));

    // 청크로 upsert
    let imported = 0;
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        const { error } = await admin.from("myverse_daily_health").upsert(slice, { onConflict: "member_id,date,source" });
        if (error) {
            console.error("[apple-health] upsert error:", error.message);
            continue;
        }
        imported += slice.length;
    }

    return NextResponse.json({ imported, total_days: days.size });
}
