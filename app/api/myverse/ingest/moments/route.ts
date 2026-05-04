// 배치 모먼트 인제스트 — Quick Capture·갤러리 스캔에서 호출
// POST /api/myverse/ingest/moments
//
// 동작:
//   1. 사용자 거점 + 캘린더 컨텍스트 fetch
//   2. 각 item 의 5축 메타 + 컨텐츠로 룰 기반 분류
//   3. 미디어가 있으면 Storage 업로드, 없으면 메타만 INSERT
//   4. dedup: (member_id, date, file_size, happened_at)
//
// 입력 예:
//   {
//     items: [
//       {
//         media_url?: "https://...",         // 이미 업로드된 경우 (예: import-meta)
//         media_type: "image" | "video",
//         file_size?: number,
//         caption?: string,
//         time_axis: { at, date, period, day_of_week },
//         geo_axis?: { lat, lng },
//         capture_mode: "active" | "auto" | "imported"
//       }
//     ]
//   }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import { classify } from "@/lib/myverse/classification/rules";
import type { TimeAxis, GeoAxis } from "@/lib/myverse/domains";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface IngestItem {
    media_url?: string;
    media_type: "image" | "video";
    file_size?: number | null;
    caption?: string | null;
    time_axis: TimeAxis;
    geo_axis?: GeoAxis | null;
    capture_mode?: "active" | "auto" | "imported";
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? (body.items as IngestItem[]) : [];
    if (items.length === 0) return NextResponse.json({ error: "no_items" }, { status: 400 });
    if (items.length > 200) return NextResponse.json({ error: "too_many", limit: 200 }, { status: 400 });

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
            id: b.id,
            name: b.name,
            type: b.type as "home" | "office" | "study" | "gym" | "cafe" | "other",
            lat: b.lat ?? null,
            lng: b.lng ?? null,
        }));

    let inserted = 0;
    let skipped = 0;
    const failures: string[] = [];

    for (const item of items) {
        try {
            const date = item.time_axis?.date;
            const happenedAt = item.time_axis?.at ?? null;
            if (!date || !item.media_url) {
                skipped++;
                continue;
            }

            // dedup 체크
            const { data: existing } = await admin
                .from("planners_daily_moments")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", date)
                .eq("happened_at", happenedAt)
                .eq("file_size", item.file_size ?? 0)
                .maybeSingle();
            if (existing) { skipped++; continue; }

            // 분류
            const cls = classify({
                time_axis: item.time_axis,
                geo_axis: item.geo_axis ?? null,
                content_axis: item.caption ?? null,
                bases: typedBases,
            });

            const { error } = await admin.from("planners_daily_moments").insert({
                member_id: memberId,
                date,
                media_type: item.media_type,
                media_url: item.media_url,
                caption: item.caption?.slice(0, 500) ?? null,
                happened_at: happenedAt,
                file_size: item.file_size ?? null,
                domain: cls.domain,
                sub_tags: cls.sub_tags,
                capture_mode: item.capture_mode ?? "auto",
                visibility: "private",
                classification_version: 1,
                time_axis: item.time_axis,
                geo_axis: item.geo_axis ?? null,
                content_axis: item.caption ?? null,
                context_axis: { classify_reason: cls.reason, confidence: cls.confidence },
            });
            if (error) { failures.push(error.message); continue; }
            inserted++;
        } catch (e) {
            failures.push((e as Error).message);
        }
    }

    return NextResponse.json({
        ok: true,
        inserted,
        skipped,
        total: items.length,
        failures: failures.slice(0, 10),
    });
}
