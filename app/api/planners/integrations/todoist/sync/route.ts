import { NextResponse } from "next/server";
import { importTodayTasks } from "@/lib/planners/todoist";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 30;

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    try {
        const result = await importTodayTasks(memberId);
        if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
        return NextResponse.json({ imported: result.imported });
    } catch (e) {
        console.error("[todoist/sync]", e);
        return NextResponse.json({ error: "sync_failed" }, { status: 500 });
    }
}
