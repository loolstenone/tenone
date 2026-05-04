// 핸들 등록·검증·조회 API
// POST /api/myverse/handle  — 본인 핸들 등록·변경
// GET  /api/myverse/handle?check=xxx — 사용 가능 여부 확인 (anon 가능)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

/** GET ?check=handlename — 사용 가능 여부 (anon 가능) */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const handle = url.searchParams.get("check")?.toLowerCase().trim();
    if (!handle) return NextResponse.json({ error: "missing_check" }, { status: 400 });
    if (!HANDLE_RE.test(handle)) {
        return NextResponse.json({ available: false, reason: "invalid_format" });
    }

    const admin = createAdminClient();

    // 예약어 체크
    const { data: reserved } = await admin
        .from("myverse_reserved_handles")
        .select("handle, reason")
        .eq("handle", handle)
        .maybeSingle();
    if (reserved) {
        return NextResponse.json({ available: false, reason: "reserved", note: reserved.reason });
    }

    // 사용 중 체크
    const { data: existing } = await admin
        .from("members")
        .select("id")
        .eq("handle", handle)
        .maybeSingle();
    if (existing) {
        return NextResponse.json({ available: false, reason: "taken" });
    }

    return NextResponse.json({ available: true });
}

/** POST {handle} — 본인 핸들 등록·변경 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const handle = String(body.handle ?? "").toLowerCase().trim();
    if (!HANDLE_RE.test(handle)) {
        return NextResponse.json({ error: "invalid_format", hint: "영문 소문자·숫자·언더스코어 3~20자" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 예약어 차단
    const { data: reserved } = await admin
        .from("myverse_reserved_handles")
        .select("handle")
        .eq("handle", handle)
        .maybeSingle();
    if (reserved) {
        return NextResponse.json({ error: "reserved" }, { status: 409 });
    }

    // 다른 사용자가 점유 중?
    const { data: takenBy } = await admin
        .from("members")
        .select("id")
        .eq("handle", handle)
        .maybeSingle();
    if (takenBy && takenBy.id !== memberId) {
        return NextResponse.json({ error: "taken" }, { status: 409 });
    }

    // 본인에게 할당
    const { data, error } = await admin
        .from("members")
        .update({ handle })
        .eq("id", memberId)
        .select("id, handle")
        .single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, handle: data.handle });
}
