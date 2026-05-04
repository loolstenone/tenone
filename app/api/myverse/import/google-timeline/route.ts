// Google Takeout 위치 이력 임포트
// POST /api/myverse/import/google-timeline (multipart, file=ZIP or JSON)
//
// 입력:
//   - "Location History (Timeline).zip" 또는
//   - "Records.json" 단일 또는
//   - "{year}_MONTH.json" Semantic Location History
//
// 파싱:
//   - placeVisit → planners_daily_places (place_name, lat/lng, duration_min)
//   - activitySegment → planners_daily_routines (이동, domain=move)
//
// dedup: (member_id, date, visited_at, place_name) / (date, start_time, activity)

import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_BYTES = 500 * 1024 * 1024; // 500MB — Records.json은 매우 큼

interface PlaceVisit {
    location?: {
        latitudeE7?: number;
        longitudeE7?: number;
        name?: string;
        address?: string;
    };
    duration?: { startTimestamp?: string; endTimestamp?: string };
}

interface ActivitySegment {
    startLocation?: { latitudeE7?: number; longitudeE7?: number };
    endLocation?: { latitudeE7?: number; longitudeE7?: number };
    duration?: { startTimestamp?: string; endTimestamp?: string };
    activityType?: string;
    distance?: number; // meters
}

interface SemanticEntry {
    placeVisit?: PlaceVisit;
    activitySegment?: ActivitySegment;
}

interface SemanticFile {
    timelineObjects?: SemanticEntry[];
}

const ACTIVITY_LABEL: Record<string, string> = {
    WALKING: "도보",
    RUNNING: "달리기",
    CYCLING: "자전거",
    IN_PASSENGER_VEHICLE: "차량 이동",
    IN_BUS: "버스",
    IN_SUBWAY: "지하철",
    IN_TRAIN: "기차",
    FLYING: "비행기",
    MOTORCYCLING: "오토바이",
    STILL: "정지",
    UNKNOWN_ACTIVITY_TYPE: "이동",
};

function tsToParts(ts?: string): { date: string; time: string } | null {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return {
        date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d),
        time: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d),
    };
}

function durationMin(s?: string, e?: string): number | null {
    if (!s || !e) return null;
    const ds = new Date(s).getTime();
    const de = new Date(e).getTime();
    if (isNaN(ds) || isNaN(de) || de <= ds) return null;
    return Math.round((de - ds) / 60000);
}

function parseSemantic(json: SemanticFile): { places: Array<Record<string, unknown>>; segments: Array<Record<string, unknown>> } {
    const places: Array<Record<string, unknown>> = [];
    const segments: Array<Record<string, unknown>> = [];
    for (const obj of json.timelineObjects ?? []) {
        if (obj.placeVisit) {
            const pv = obj.placeVisit;
            const start = tsToParts(pv.duration?.startTimestamp);
            if (!start) continue;
            const lat = pv.location?.latitudeE7 ? pv.location.latitudeE7 / 1e7 : null;
            const lng = pv.location?.longitudeE7 ? pv.location.longitudeE7 / 1e7 : null;
            places.push({
                date: start.date,
                visited_at: start.time,
                place_name: pv.location?.name ?? pv.location?.address?.split(",")[0] ?? "(이름없음)",
                address: pv.location?.address ?? null,
                duration_min: durationMin(pv.duration?.startTimestamp, pv.duration?.endTimestamp),
                lat, lng,
            });
        } else if (obj.activitySegment) {
            const as = obj.activitySegment;
            const start = tsToParts(as.duration?.startTimestamp);
            const end = tsToParts(as.duration?.endTimestamp);
            if (!start) continue;
            const label = ACTIVITY_LABEL[as.activityType ?? ""] ?? "이동";
            segments.push({
                date: start.date,
                start_time: start.time,
                end_time: end?.time ?? null,
                activity: label,
                distance_km: as.distance ? as.distance / 1000 : null,
                duration_min: durationMin(as.duration?.startTimestamp, as.duration?.endTimestamp),
            });
        }
    }
    return { places, segments };
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let form: FormData;
    try { form = await req.formData(); }
    catch { return NextResponse.json({ error: "invalid_form" }, { status: 400 }); }

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", limit_mb: 500 }, { status: 400 });

    // Semantic JSON 파일들 수집
    const semanticFiles: SemanticFile[] = [];

    try {
        if (file.name.toLowerCase().endsWith(".zip")) {
            const zip = await JSZip.loadAsync(await file.arrayBuffer());
            for (const entry of Object.values(zip.files)) {
                if (entry.dir) continue;
                if (!entry.name.toLowerCase().endsWith(".json")) continue;
                // Semantic Location History 패턴
                if (!entry.name.includes("Semantic") && !entry.name.match(/\d{4}_[A-Z]+\.json/i)) continue;
                try {
                    const text = await entry.async("string");
                    const parsed = JSON.parse(text);
                    if (parsed.timelineObjects) semanticFiles.push(parsed);
                } catch { /* skip invalid */ }
            }
        } else if (file.name.toLowerCase().endsWith(".json")) {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (parsed.timelineObjects) semanticFiles.push(parsed);
        }
    } catch (e) {
        return NextResponse.json({ error: "parse_failed", detail: (e as Error).message }, { status: 400 });
    }

    if (semanticFiles.length === 0) {
        return NextResponse.json({
            error: "no_semantic_data",
            hint: "Google Takeout > 위치 기록 > Semantic Location History 폴더의 ZIP 또는 JSON을 업로드해주세요. (Records.json은 너무 커서 Semantic만 지원)",
        }, { status: 400 });
    }

    // 모든 파일 합쳐서 파싱
    const allPlaces: Array<Record<string, unknown>> = [];
    const allSegments: Array<Record<string, unknown>> = [];
    for (const sf of semanticFiles) {
        const { places, segments } = parseSemantic(sf);
        allPlaces.push(...places);
        allSegments.push(...segments);
    }

    const admin = createAdminClient();

    const { data: importRow } = await admin
        .from("myverse_imports")
        .insert({ member_id: memberId, source: "google_timeline", started_at: new Date().toISOString() })
        .select()
        .single();

    let placesIns = 0, placesSkip = 0;
    let segIns = 0, segSkip = 0;

    // places
    for (const p of allPlaces) {
        try {
            const { data: existing } = await admin
                .from("planners_daily_places")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", p.date)
                .eq("visited_at", p.visited_at)
                .eq("place_name", p.place_name)
                .maybeSingle();
            if (existing) { placesSkip++; continue; }

            await admin.from("planners_daily_places").insert({
                member_id: memberId,
                date: p.date,
                visited_at: p.visited_at,
                place_name: p.place_name,
                address: p.address,
                duration_min: p.duration_min,
                category: "general",
                domain: "daily",
                capture_mode: "imported",
                visibility: "private",
                geo_axis: { lat: p.lat, lng: p.lng },
                content_axis: `${p.place_name} ${p.address ?? ""}`,
            });
            placesIns++;
        } catch { /* silent */ }
    }

    // routines (이동)
    for (const s of allSegments) {
        try {
            const { data: existing } = await admin
                .from("planners_daily_routines")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", s.date)
                .eq("start_time", s.start_time)
                .eq("activity", s.activity)
                .maybeSingle();
            if (existing) { segSkip++; continue; }

            await admin.from("planners_daily_routines").insert({
                member_id: memberId,
                date: s.date,
                start_time: s.start_time,
                end_time: s.end_time,
                activity: s.activity,
                category: "transport",
                domain: "move",
                capture_mode: "imported",
                visibility: "private",
                content_axis: typeof s.activity === "string" ? s.activity : "이동",
                body_data: s.distance_km ? { distance_km: s.distance_km } : null,
            });
            segIns++;
        } catch { /* silent */ }
    }

    if (importRow) {
        await admin
            .from("myverse_imports")
            .update({
                items_imported: placesIns + segIns,
                items_skipped: placesSkip + segSkip,
                completed_at: new Date().toISOString(),
                summary: { places_inserted: placesIns, places_skipped: placesSkip, segments_inserted: segIns, segments_skipped: segSkip, files_parsed: semanticFiles.length },
            })
            .eq("id", importRow.id);
    }

    return NextResponse.json({
        ok: true,
        files_parsed: semanticFiles.length,
        places: { inserted: placesIns, skipped: placesSkip },
        segments: { inserted: segIns, skipped: segSkip },
        total_inserted: placesIns + segIns,
    });
}
