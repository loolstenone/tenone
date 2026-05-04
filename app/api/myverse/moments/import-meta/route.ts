// Instagram / Facebook GDPR 백업 ZIP → myverse_daily_moments 일괄 임포트
//
// Instagram 백업 구조 (2024+):
//   your_instagram_activity/media/posts_1.json    [ {media:[{uri, creation_timestamp, title?}], creation_timestamp?, title?} ]
//   your_instagram_activity/media/stories.json    { ig_stories: [{uri, creation_timestamp, title?}] }
//   media/posts/YYYYMM/xxx.jpg                    실제 미디어 파일
//
// Facebook 백업 구조:
//   your_facebook_activity/posts/your_posts_*.json [ {timestamp, attachments:[{data:[{media:{uri, creation_timestamp, description?}}]}], data:[{post}]} ]
//   posts/album/*.json                             앨범
//
// 처리: ZIP 파싱 → JSON 메타 추출 → 각 미디어를 Storage에 업로드 → DB INSERT (날짜·캡션·위치 등 메타 보존)

import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_ZIP_BYTES = 200 * 1024 * 1024; // 200MB
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "mp4", "webm", "mov"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov"]);
const TYPE_MAP: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", webp: "image/webp", gif: "image/gif", heic: "image/heic",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};

// 메타 표준화 — 두 플랫폼의 다양한 형태를 하나로 흡수
type MetaItem = {
    uri: string;            // ZIP 내부 경로
    timestamp: number;      // Unix seconds
    caption?: string;
    location?: string;
    source: "instagram" | "facebook";
};

function decodeMojibake(s: string | undefined): string | undefined {
    // Meta 한국어 export는 UTF-8을 latin1으로 wrapping해 보내는 경우가 많음 — 복원 시도
    if (!s) return undefined;
    try {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
        return new TextDecoder("utf-8").decode(bytes);
    } catch {
        return s;
    }
}

function ymd(unixSec: number): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(unixSec * 1000));
}

// Instagram posts_1.json 파싱
function parseInstagramPosts(json: unknown): MetaItem[] {
    const arr = Array.isArray(json) ? json : [];
    const out: MetaItem[] = [];
    for (const post of arr) {
        if (!post || typeof post !== "object") continue;
        const p = post as Record<string, unknown>;
        const postCaption = decodeMojibake(typeof p.title === "string" ? p.title : undefined);
        const postTs = typeof p.creation_timestamp === "number" ? p.creation_timestamp : undefined;
        const media = Array.isArray(p.media) ? p.media : [];
        for (const m of media) {
            if (!m || typeof m !== "object") continue;
            const mm = m as Record<string, unknown>;
            const uri = typeof mm.uri === "string" ? mm.uri : null;
            const ts = typeof mm.creation_timestamp === "number" ? mm.creation_timestamp : postTs;
            if (!uri || !ts) continue;
            const cap = decodeMojibake(typeof mm.title === "string" ? mm.title : undefined) ?? postCaption;
            const exif = (mm.media_metadata as Record<string, unknown> | undefined)?.photo_metadata
                       ?? (mm.media_metadata as Record<string, unknown> | undefined)?.video_metadata;
            const exifObj = exif as Record<string, unknown> | undefined;
            const loc = exifObj && typeof exifObj.exif_data === "object"
                ? undefined
                : undefined;
            out.push({ uri, timestamp: ts, caption: cap, location: loc, source: "instagram" });
        }
    }
    return out;
}

// Instagram stories.json 파싱
function parseInstagramStories(json: unknown): MetaItem[] {
    const obj = json as Record<string, unknown> | null;
    const arr = obj && Array.isArray(obj.ig_stories) ? obj.ig_stories : [];
    const out: MetaItem[] = [];
    for (const s of arr) {
        if (!s || typeof s !== "object") continue;
        const ss = s as Record<string, unknown>;
        const uri = typeof ss.uri === "string" ? ss.uri : null;
        const ts = typeof ss.creation_timestamp === "number" ? ss.creation_timestamp : null;
        if (!uri || !ts) continue;
        out.push({
            uri, timestamp: ts,
            caption: decodeMojibake(typeof ss.title === "string" ? ss.title : undefined),
            source: "instagram",
        });
    }
    return out;
}

// Facebook your_posts_*.json 파싱
function parseFacebookPosts(json: unknown): MetaItem[] {
    const arr = Array.isArray(json) ? json : [];
    const out: MetaItem[] = [];
    for (const post of arr) {
        if (!post || typeof post !== "object") continue;
        const p = post as Record<string, unknown>;
        const postTs = typeof p.timestamp === "number" ? p.timestamp : undefined;
        // 게시물 캡션
        let postCaption: string | undefined;
        if (Array.isArray(p.data)) {
            for (const d of p.data) {
                if (d && typeof d === "object" && typeof (d as Record<string, unknown>).post === "string") {
                    postCaption = decodeMojibake((d as Record<string, unknown>).post as string);
                    break;
                }
            }
        }
        const attachments = Array.isArray(p.attachments) ? p.attachments : [];
        for (const att of attachments) {
            if (!att || typeof att !== "object") continue;
            const data = (att as Record<string, unknown>).data;
            if (!Array.isArray(data)) continue;
            for (const d of data) {
                if (!d || typeof d !== "object") continue;
                const media = (d as Record<string, unknown>).media as Record<string, unknown> | undefined;
                if (!media || typeof media !== "object") continue;
                const uri = typeof media.uri === "string" ? media.uri : null;
                const ts = typeof media.creation_timestamp === "number" ? media.creation_timestamp
                         : typeof media.timestamp === "number" ? media.timestamp : postTs;
                if (!uri || !ts) continue;
                const cap = decodeMojibake(typeof media.description === "string" ? media.description : undefined) ?? postCaption;
                out.push({ uri, timestamp: ts, caption: cap, source: "facebook" });
            }
        }
    }
    return out;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let form: FormData;
    try { form = await req.formData(); }
    catch { return NextResponse.json({ error: "invalid_form" }, { status: 400 }); }

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > MAX_ZIP_BYTES) return NextResponse.json({ error: "too_large", size: file.size }, { status: 400 });

    let zip: JSZip;
    try {
        zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
        return NextResponse.json({ error: "invalid_zip" }, { status: 400 });
    }

    // 1) JSON 메타 파일 탐색 (Instagram + Facebook)
    const items: MetaItem[] = [];
    const jsonEntries = Object.values(zip.files).filter(f => !f.dir && f.name.toLowerCase().endsWith(".json"));
    for (const entry of jsonEntries) {
        const lower = entry.name.toLowerCase();
        if (!lower.includes("post") && !lower.includes("stor")) continue;
        try {
            const text = await entry.async("string");
            const json = JSON.parse(text);
            if (lower.includes("instagram") || lower.includes("ig_") || (lower.includes("/media/") && lower.includes("post"))) {
                items.push(...parseInstagramPosts(json));
                items.push(...parseInstagramStories(json));
            } else if (lower.includes("your_posts") || lower.includes("facebook") || lower.includes("/posts/")) {
                items.push(...parseFacebookPosts(json));
                // Instagram이 같은 경로 패턴일 수도 있어 둘 다 시도
                items.push(...parseInstagramPosts(json));
                items.push(...parseInstagramStories(json));
            } else {
                // 알 수 없는 구조 — 양쪽 다 시도
                items.push(...parseInstagramPosts(json));
                items.push(...parseInstagramStories(json));
                items.push(...parseFacebookPosts(json));
            }
        } catch { /* invalid json — skip */ }
    }

    if (items.length === 0) {
        return NextResponse.json({ error: "no_items_found", hint: "Instagram/Facebook 백업 ZIP을 압축 해제하지 말고 그대로 업로드해주세요" }, { status: 400 });
    }

    // 2) 중복 방지를 위해 기존 row의 (date + caption 또는 file_size) 키 미리 로드
    const admin = createAdminClient();

    // 3) 각 아이템을 Storage 업로드 + DB INSERT
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of items) {
        try {
            const ext = item.uri.split(".").pop()?.toLowerCase() ?? "";
            if (!ALLOWED_EXT.has(ext)) { skipped++; continue; }
            const fileEntry = zip.file(item.uri);
            if (!fileEntry) { skipped++; continue; }

            const date = ymd(item.timestamp);
            const happenedAt = new Date(item.timestamp * 1000).toISOString();

            // 같은 (member_id, date, file_size)로 이미 임포트된 것 체크
            const buffer = Buffer.from(await fileEntry.async("uint8array"));
            const { data: existing } = await admin
                .from("myverse_daily_moments")
                .select("id")
                .eq("member_id", memberId)
                .eq("date", date)
                .eq("file_size", buffer.byteLength)
                .eq("happened_at", happenedAt)
                .maybeSingle();
            if (existing) { skipped++; continue; }

            const path = `${memberId}/${date}/meta_${item.timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await admin.storage
                .from("planners-moments")
                .upload(path, buffer, { contentType: TYPE_MAP[ext] ?? "application/octet-stream", upsert: false });
            if (upErr) { errors.push(`${item.uri}: ${upErr.message}`); continue; }

            const { data: pub } = admin.storage.from("planners-moments").getPublicUrl(path);
            const mediaType = VIDEO_EXT.has(ext) ? "video" : "image";

            const { error: dbErr } = await admin.from("myverse_daily_moments").insert({
                member_id: memberId,
                date,
                media_type: mediaType,
                media_url: pub.publicUrl,
                caption: item.caption?.slice(0, 500) ?? null,
                happened_at: happenedAt,
                location: item.location?.slice(0, 200) ?? null,
                file_size: buffer.byteLength,
            });
            if (dbErr) { errors.push(`${item.uri}: ${dbErr.message}`); continue; }
            imported++;
        } catch (e) {
            errors.push(`${item.uri}: ${(e as Error).message}`);
        }
    }

    return NextResponse.json({
        ok: true,
        imported,
        skipped,
        total: items.length,
        errors: errors.slice(0, 10),
    });
}
