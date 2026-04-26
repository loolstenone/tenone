import { NextResponse } from "next/server";
import { syncEvents } from "@/lib/planners/google-calendar";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 60;

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // 과거 7일 ~ 향후 90일
    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 86400000).toISOString();
    const timeMax = new Date(now.getTime() + 90 * 86400000).toISOString();

    try {
        const result = await syncEvents(memberId, timeMin, timeMax);
        if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
        return NextResponse.json({ synced: result.synced });
    } catch (e) {
        console.error("[google/sync]", e);
        return NextResponse.json({ error: "sync_failed" }, { status: 500 });
    }
}
