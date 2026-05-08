// 타임 캡슐 — 미래의 나에게 보내는 잠긴 메시지
// GET /api/myverse/capsules — 내 캡슐 전체 (status 자동 계산)
// POST /api/myverse/capsules — 새 캡슐 생성

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

function statusOf(open_at: string, opened_at: string | null): "pending" | "ready" | "opened" {
    if (opened_at) return "opened";
    const today = new Date().toISOString().slice(0, 10);
    return open_at <= today ? "ready" : "pending";
}

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_time_capsules")
        .select("id, created_at, open_at, opened_at, title, image_urls, note_after_open")
        .eq("member_id", memberId)
        .order("open_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const enriched = (data ?? []).map(c => ({
        ...c,
        status: statusOf(c.open_at as string, c.opened_at as string | null),
    }));

    return NextResponse.json({ capsules: enriched });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim().slice(0, 200);
    const message = String(body?.message || "").trim().slice(0, 5000);
    const open_at = String(body?.open_at || "").trim();
    const image_urls: string[] = Array.isArray(body?.image_urls) ? body.image_urls.slice(0, 10).map(String) : [];

    if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 });
    if (!message) return NextResponse.json({ error: "missing_message" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(open_at)) return NextResponse.json({ error: "invalid_open_at" }, { status: 400 });

    const today = new Date().toISOString().slice(0, 10);
    if (open_at <= today) return NextResponse.json({ error: "open_at_must_be_future" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_time_capsules")
        .insert({
            member_id: memberId,
            title,
            message,
            open_at,
            image_urls,
        })
        .select("id, created_at, open_at, title")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ capsule: data });
}
