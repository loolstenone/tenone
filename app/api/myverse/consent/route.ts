// 자동 캡처 동의 토글 API
// GET  /api/myverse/consent — 현재 토글 상태 조회
// PATCH /api/myverse/consent — 단일 토글 변경 + 감사 로그

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const KEYS = [
    "gallery_scan",
    "gps_background",
    "calendar_sync",
    "healthkit",
    "google_fit",
    "samsung_health",
    "email_receipts",
    "stt_recording",
    "ocr_auto",
    "vision_classify",
] as const;

type ConsentKey = typeof KEYS[number];

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("planners_users")
        .select("auto_capture_consent")
        .eq("member_id", memberId)
        .maybeSingle();

    const defaults = Object.fromEntries(KEYS.map(k => [k, false]));
    const consent = { ...defaults, ...((data?.auto_capture_consent as Record<string, boolean> | null) ?? {}) };
    return NextResponse.json({ consent });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const key = String(body.key ?? "") as ConsentKey;
    const granted = Boolean(body.granted);

    if (!KEYS.includes(key)) {
        return NextResponse.json({ error: "invalid_key" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 현재 row 가져와서 JSONB 머지
    const { data: row } = await admin
        .from("planners_users")
        .select("auto_capture_consent")
        .eq("member_id", memberId)
        .maybeSingle();

    const current = (row?.auto_capture_consent as Record<string, boolean> | null) ?? {};
    const next = { ...current, [key]: granted };

    const { error } = await admin
        .from("planners_users")
        .upsert(
            { member_id: memberId, auto_capture_consent: next, updated_at: new Date().toISOString() },
            { onConflict: "member_id" }
        );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 감사 로그
    await admin.from("myverse_consent_log").insert({
        member_id: memberId,
        consent_key: key,
        granted,
        user_agent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ ok: true, consent: next });
}
