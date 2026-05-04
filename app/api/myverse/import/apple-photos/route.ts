// Apple Photos 내보내기 ZIP 임포트
// POST /api/myverse/import/apple-photos (multipart, file=ZIP)
//
// 입력 형식 (사진 앱 → 내보내기 → "사용하지 않은 원본 내보내기" + 메타데이터 포함):
//   - .HEIC / .JPG / .MP4 등 미디어 파일들
//   - 일부는 _0.aae 사이드카 파일 동반 (편집 정보, 무시)
//   - metadata는 EXIF 안에 있음
//
// 처리:
//   1. ZIP 풀고 미디어 파일별 EXIF 추출 (서버 사이드 — exifr Node 모드)
//   2. Storage 업로드 + planners_daily_moments INSERT
//   3. 분류 엔진 v1로 9 영역 자동 라우팅
//   4. dedup: (member, date, file_size, happened_at)

import { NextResponse } from "next/server";
import JSZip from "jszip";
import exifr from "exifr";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import { classify } from "@/lib/myverse/classification/rules";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_BYTES = 500 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "heic", "webp", "gif", "mp4", "mov", "m4v"]);
const VIDEO_EXT = new Set(["mp4", "mov", "m4v"]);
const TYPE_MAP: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", webp: "image/webp", gif: "image/gif", heic: "image/heic",
    mp4: "video/mp4", mov: "video/quicktime", m4v: "video/x-m4v",
};

function ymd(d: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
}

function hourToPeriod(h: number): string {
    if (h < 6) return "dawn";
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    if (h < 22) return "evening";
    return "night";
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

    let zip: JSZip;
    try {
        zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
        return NextResponse.json({ error: "invalid_zip" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 사용자 거점 fetch (분류 엔진 입력)
    const { data: planner } = await admin
        .from("planners_users")
        .select("activity_bases")
        .eq("member_id", memberId)
        .maybeSingle();
    const bases = (planner?.activity_bases as Array<{ id: string; name: string; type: string; lat?: number; lng?: number }> | null) ?? [];
    const typedBases = bases
        .filter(b => ["home", "office", "study", "gym", "cafe", "other"].includes(b.type))
        .map(b => ({
            id: b.id, name: b.name,
            type: b.type as "home" | "office" | "study" | "gym" | "cafe" | "other",
            lat: b.lat ?? null, lng: b.lng ?? null,
        }));

    // 임포트 로그 시작
    const { data: importRow } = await admin
        .from("myverse_imports")
        .insert({ member_id: memberId, source: "apple_photos", started_at: new Date().toISOString() })
        .select()
        .single();

    const mediaEntries = Object.values(zip.files).filter(f => {
        if (f.dir) return false;
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        return ALLOWED_EXT.has(ext);
    });

    if (mediaEntries.length === 0) {
        return NextResponse.json({ error: "no_media_found" }, { status: 400 });
    }

    let inserted = 0;
    let skipped = 0;
    const failures: string[] = [];
    const domainCounts: Record<string, number> = {};

    for (const entry of mediaEntries) {
        try {
            const ext = entry.name.split(".").pop()!.toLowerCase();
            const buffer = Buffer.from(await entry.async("uint8array"));

            // EXIF 추출 (이미지만)
            let happenedAt: string | null = null;
            let lat: number | null = null;
            let lng: number | null = null;

            if (!VIDEO_EXT.has(ext)) {
                try {
                    const data = await exifr.parse(buffer, { tiff: true, exif: true, gps: true });
                    if (data) {
                        const dt = data.DateTimeOriginal ?? data.CreateDate;
                        if (dt instanceof Date) happenedAt = dt.toISOString();
                        if (typeof data.latitude === "number" && typeof data.longitude === "number") {
                            lat = data.latitude;
                            lng = data.longitude;
                        }
                    }
                } catch { /* silent */ }
            }

            // EXIF 시간 없으면 ZIP entry의 date 사용 (수정일)
            const happened = happenedAt ? new Date(happenedAt) : entry.date;
            const date = ymd(happened);
            const happenedISO = happened.toISOString();
            const periodHour = new Date(new Date(happened.getTime()).toLocaleString("en-US", { timeZone: "Asia/Seoul" })).getHours();

            // dedup
            const { data: existing } = await admin
                .from("planners_daily_moments")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", date)
                .eq("file_size", buffer.byteLength)
                .eq("happened_at", happenedISO)
                .maybeSingle();
            if (existing) { skipped++; continue; }

            // 분류
            const cls = classify({
                time_axis: {
                    at: happenedISO,
                    date,
                    period: hourToPeriod(periodHour) as "dawn" | "morning" | "afternoon" | "evening" | "night",
                },
                geo_axis: lat != null && lng != null ? { lat, lng } : null,
                bases: typedBases,
            });

            // Storage 업로드
            const path = `${memberId}/${date}/applephotos_${happened.getTime()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await admin.storage
                .from("planners-moments")
                .upload(path, buffer, { contentType: TYPE_MAP[ext] ?? "application/octet-stream", upsert: false });
            if (upErr) { failures.push(`${entry.name}: ${upErr.message}`); continue; }

            const { data: pub } = admin.storage.from("planners-moments").getPublicUrl(path);
            const mediaType = VIDEO_EXT.has(ext) ? "video" : "image";

            const { error: dbErr } = await admin.from("planners_daily_moments").insert({
                member_id: memberId,
                date,
                media_type: mediaType,
                media_url: pub.publicUrl,
                happened_at: happenedISO,
                file_size: buffer.byteLength,
                domain: cls.domain,
                sub_tags: cls.sub_tags,
                capture_mode: "imported",
                visibility: "private",
                classification_version: 1,
                time_axis: { at: happenedISO, date, period: hourToPeriod(periodHour) },
                geo_axis: lat != null && lng != null ? { lat, lng } : null,
                context_axis: { classify_reason: cls.reason, confidence: cls.confidence, source: "apple_photos" },
            });
            if (dbErr) { failures.push(`${entry.name}: ${dbErr.message}`); continue; }
            inserted++;
            domainCounts[cls.domain] = (domainCounts[cls.domain] ?? 0) + 1;
        } catch (e) {
            failures.push(`${entry.name}: ${(e as Error).message}`);
        }
    }

    if (importRow) {
        await admin
            .from("myverse_imports")
            .update({
                items_imported: inserted,
                items_skipped: skipped,
                items_failed: failures.length,
                completed_at: new Date().toISOString(),
                summary: { domain_distribution: domainCounts, total_media: mediaEntries.length },
            })
            .eq("id", importRow.id);
    }

    return NextResponse.json({
        ok: true,
        inserted,
        skipped,
        total: mediaEntries.length,
        domain_distribution: domainCounts,
        failures: failures.slice(0, 10),
    });
}
