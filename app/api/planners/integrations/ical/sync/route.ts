import { NextResponse } from "next/server";
import { syncIcalEvents } from "@/lib/planners/ical";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 30;

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const result = await syncIcalEvents(memberId);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ synced: result.synced });
}
