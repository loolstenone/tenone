// Apple Health export.xml 임포트 — iOS 건강앱 → 내보내기 → ZIP의 export.xml
// POST /api/myverse/health/apple/import (multipart, file=export.xml or zip)
//
// 파싱:
//   <Record type="HKQuantityTypeIdentifierStepCount" startDate=... endDate=... value=... />
//   <Record type="HKWorkout" workoutActivityType=... startDate=... endDate=... totalEnergyBurned=... totalDistance=... />
//   <Record type="HKCategoryTypeIdentifierSleepAnalysis" startDate=... endDate=... value="HKCategoryValueSleepAnalysisAsleep..." />
//
// 결과:
//   - 운동 → myverse_daily_routines (domain=body, body_subtype=workout, body_data)
//   - 수면 → myverse_daily_routines (domain=body, body_subtype=sleep)
//   - 걸음 수는 일별 합계로 → 추후 확장
//
// XML이 100MB+ 까지 크니 stream 처리 필요. MVP는 100MB 한도 + sax-style 파싱.

import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_BYTES = 200 * 1024 * 1024;

const WORKOUT_TYPE_MAP: Record<string, string> = {
    HKWorkoutActivityTypeRunning: "running",
    HKWorkoutActivityTypeWalking: "walking",
    HKWorkoutActivityTypeCycling: "cycling",
    HKWorkoutActivityTypeYoga: "yoga",
    HKWorkoutActivityTypeFunctionalStrengthTraining: "strength",
    HKWorkoutActivityTypeTraditionalStrengthTraining: "strength",
    HKWorkoutActivityTypeHiking: "hiking",
    HKWorkoutActivityTypeSwimming: "swimming",
    HKWorkoutActivityTypeDance: "dance",
};

interface ParsedRecord {
    kind: "workout" | "sleep";
    date: string;
    start_time: string | null;
    end_time: string | null;
    body_data: Record<string, unknown>;
    activity_label: string;
}

function attr(s: string, name: string): string | null {
    const m = s.match(new RegExp(`${name}="([^"]*)"`));
    return m ? m[1] : null;
}

function parseDate(iso: string | null): { date: string; time: string } | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    return { date, time };
}

function durationMin(start: string | null, end: string | null): number | null {
    if (!start || !end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    return Math.round((e - s) / 60000);
}

/** XML 텍스트에서 Workout·SleepAnalysis Record들을 추출 */
function parseAppleHealth(xml: string): ParsedRecord[] {
    const records: ParsedRecord[] = [];

    // Workout (활동) — <Workout workoutActivityType=... startDate=... endDate=... totalEnergyBurned=... totalDistance=... />
    const workoutRe = /<Workout([^/>]+)\/?>/g;
    let m: RegExpExecArray | null;
    while ((m = workoutRe.exec(xml)) !== null) {
        const inner = m[1];
        const activityType = attr(inner, "workoutActivityType") ?? "";
        const start = attr(inner, "startDate");
        const end = attr(inner, "endDate");
        const totalEnergy = parseFloat(attr(inner, "totalEnergyBurned") ?? "");
        const totalDistance = parseFloat(attr(inner, "totalDistance") ?? "");
        const distanceUnit = attr(inner, "totalDistanceUnit");

        const startParsed = parseDate(start);
        const endParsed = parseDate(end);
        if (!startParsed) continue;

        const type = WORKOUT_TYPE_MAP[activityType] ?? activityType.replace("HKWorkoutActivityType", "").toLowerCase();
        const body_data: Record<string, unknown> = { type };
        if (!isNaN(totalEnergy)) body_data.calories_burned = Math.round(totalEnergy);
        if (!isNaN(totalDistance) && distanceUnit) {
            const km = distanceUnit === "km" ? totalDistance
                : distanceUnit === "mi" ? totalDistance * 1.60934
                : null;
            if (km) body_data.distance_km = Math.round(km * 100) / 100;
        }
        const dm = durationMin(start, end);
        if (dm) body_data.duration_min = dm;

        records.push({
            kind: "workout",
            date: startParsed.date,
            start_time: startParsed.time,
            end_time: endParsed?.time ?? null,
            body_data,
            activity_label: type,
        });
    }

    // Sleep — <Record type="HKCategoryTypeIdentifierSleepAnalysis" value="..." startDate=... endDate=...
    const sleepRe = /<Record([^/>]+type="HKCategoryTypeIdentifierSleepAnalysis"[^/>]+)\/?>/g;
    while ((m = sleepRe.exec(xml)) !== null) {
        const inner = m[1];
        const value = attr(inner, "value") ?? "";
        // Asleep, Asleep(Core/Deep/REM) 만 사용 — InBed 제외 (중복 방지)
        if (!value.includes("Asleep")) continue;
        const start = attr(inner, "startDate");
        const end = attr(inner, "endDate");
        const dm = durationMin(start, end);
        if (!dm) continue;
        const startParsed = parseDate(start);
        const endParsed = parseDate(end);
        if (!startParsed) continue;
        records.push({
            kind: "sleep",
            date: startParsed.date,
            start_time: startParsed.time,
            end_time: endParsed?.time ?? null,
            body_data: { duration_min: dm, source: "healthkit", phase: value.replace("HKCategoryValueSleepAnalysis", "") },
            activity_label: "수면",
        });
    }

    return records;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let form: FormData;
    try { form = await req.formData(); }
    catch { return NextResponse.json({ error: "invalid_form" }, { status: 400 }); }

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", limit_mb: 200 }, { status: 400 });

    let xml: string;
    try {
        if (file.name.endsWith(".zip")) {
            const zip = await JSZip.loadAsync(await file.arrayBuffer());
            const xmlEntry = zip.file(/export\.xml$/)?.[0] ?? Object.values(zip.files).find(f => f.name.endsWith("export.xml"));
            if (!xmlEntry) return NextResponse.json({ error: "no_export_xml_in_zip" }, { status: 400 });
            xml = await xmlEntry.async("string");
        } else {
            xml = await file.text();
        }
    } catch (e) {
        return NextResponse.json({ error: "parse_failed", detail: (e as Error).message }, { status: 400 });
    }

    const records = parseAppleHealth(xml);
    if (records.length === 0) {
        return NextResponse.json({ error: "no_records_found", hint: "Apple Health export.xml 형식이 맞는지 확인" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 임포트 로그 시작
    const { data: importRow } = await admin
        .from("myverse_imports")
        .insert({ member_id: memberId, source: "healthkit", started_at: new Date().toISOString() })
        .select()
        .single();

    let inserted = 0;
    let skipped = 0;
    const failures: string[] = [];

    for (const rec of records) {
        try {
            // dedup: (member_id, date, start_time, body_subtype)
            const { data: existing } = await admin
                .from("myverse_daily_routines")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", rec.date)
                .eq("start_time", rec.start_time)
                .eq("body_subtype", rec.kind)
                .maybeSingle();
            if (existing) { skipped++; continue; }

            const { error } = await admin.from("myverse_daily_routines").insert({
                member_id: memberId,
                date: rec.date,
                start_time: rec.start_time,
                end_time: rec.end_time,
                activity: rec.activity_label,
                category: rec.kind === "workout" ? "exercise" : "rest",
                domain: "body",
                body_subtype: rec.kind,
                body_data: rec.body_data,
                capture_mode: "imported",
                visibility: "private",
                content_axis: rec.activity_label,
                time_axis: { date: rec.date, start: rec.start_time, end: rec.end_time },
            });
            if (error) { failures.push(error.message); continue; }
            inserted++;
        } catch (e) {
            failures.push((e as Error).message);
        }
    }

    // 임포트 로그 마무리
    if (importRow) {
        await admin
            .from("myverse_imports")
            .update({
                items_imported: inserted,
                items_skipped: skipped,
                items_failed: failures.length,
                completed_at: new Date().toISOString(),
                summary: { workouts: records.filter(r => r.kind === "workout").length, sleeps: records.filter(r => r.kind === "sleep").length },
            })
            .eq("id", importRow.id);
    }

    return NextResponse.json({
        ok: true,
        inserted,
        skipped,
        total: records.length,
        failures: failures.slice(0, 10),
    });
}
