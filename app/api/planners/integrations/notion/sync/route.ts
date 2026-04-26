import { NextResponse } from "next/server";
import { importNotionTasks } from "@/lib/planners/notion";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 30;

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const result = await importNotionTasks(memberId);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ imported: result.imported });
}
