// BODY 통계 API
import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { getBodyStats } from "@/lib/myverse/body/stats";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const days = parseInt(new URL(req.url).searchParams.get("days") ?? "90", 10);
    const stats = await getBodyStats(memberId, days);
    return NextResponse.json({ stats });
}
