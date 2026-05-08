// Google Photos 동기화 — 최근 사진 목록을 가져와 myverse_daily_moments 에 insert
// POST /api/myverse/integrations/google-photos/sync
//
// 단순 v1: 최근 50개. 중복 검사: media_url(baseUrl 변동 가능)이 아니라 google_id를 별도 추적해야 안전.
// 현 단계는 import_meta처럼 caption에 [G:{mediaItemId}] 마커를 넣어 중복 방지.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface PhotosItem {
    id: string;
    baseUrl: string;
    mimeType: string;
    mediaMetadata?: {
        creationTime?: string;
        width?: string;
        height?: string;
        photo?: { cameraMake?: string };
        video?: { fps?: number; status?: string };
    };
    filename?: string;
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data: tok } = await admin
        .from("myverse_oauth_tokens")
        .select("*")
        .eq("member_id", memberId)
        .eq("provider", "google_photos")
        .maybeSingle();

    if (!tok) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    // 토큰 만료 체크
    let accessToken: string = tok.access_token;
    if (tok.expires_at && new Date(tok.expires_at) <= new Date()) {
        if (!tok.refresh_token) return NextResponse.json({ error: "expired_no_refresh" }, { status: 401 });
        const refreshed = await refreshAccessToken(tok.refresh_token);
        if (!refreshed) return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
        accessToken = refreshed.access_token;
        await admin.from("myverse_oauth_tokens").update({
            access_token: accessToken,
            expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        }).eq("id", tok.id);
    }

    // 최근 50개 조회
    const photosRes = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=50", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!photosRes.ok) {
        const txt = await photosRes.text();
        console.error("[google-photos sync] list error:", txt);
        return NextResponse.json({ error: "photos_api_failed", message: txt.slice(0, 200) }, { status: 500 });
    }

    const photosData = await photosRes.json() as { mediaItems?: PhotosItem[] };
    const items = photosData.mediaItems ?? [];

    // 기존 import 마커 — content_axis에 g:<mediaItemId> 저장으로 중복 방지
    const markers = items.map(i => `g:${i.id}`);
    const { data: existing } = await admin
        .from("myverse_daily_moments")
        .select("content_axis")
        .eq("member_id", memberId)
        .in("content_axis", markers);
    const existingSet = new Set((existing ?? []).map(e => e.content_axis as string));

    let imported = 0, skipped = 0;
    for (const item of items) {
        const marker = `g:${item.id}`;
        if (existingSet.has(marker)) { skipped++; continue; }

        const isVideo = item.mimeType?.startsWith("video/") ?? false;
        const created = item.mediaMetadata?.creationTime ?? null;
        const date = (created ?? new Date().toISOString()).slice(0, 10);

        const { error } = await admin.from("myverse_daily_moments").insert({
            member_id: memberId,
            date,
            media_type: isVideo ? "video" : "image",
            media_url: `${item.baseUrl}=d`,         // download URL (full size)
            thumbnail_url: `${item.baseUrl}=w400-h400`,
            caption: null,
            happened_at: created,
            width: item.mediaMetadata?.width ? parseInt(item.mediaMetadata.width, 10) : null,
            height: item.mediaMetadata?.height ? parseInt(item.mediaMetadata.height, 10) : null,
            capture_mode: "imported",
            visibility: "private",  // 외부에서 가져온 사진은 항상 비공개로 시작
            content_axis: marker,
        });

        if (!error) imported++;
        else console.warn("[google-photos sync] insert error:", error.message);
    }

    await admin.from("myverse_oauth_tokens").update({
        last_sync_at: new Date().toISOString(),
        last_sync_count: imported,
    }).eq("id", tok.id);

    return NextResponse.json({ imported, skipped, total: items.length });
}
