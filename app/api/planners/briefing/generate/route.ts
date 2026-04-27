import { NextResponse } from "next/server";
import { generateBriefing, inferBriefingType, type BriefingType } from "@/lib/planners/briefing";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 60;

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const rawType = body.type as BriefingType | "auto" | undefined;
    const type: BriefingType = rawType && rawType !== "auto" ? rawType : inferBriefingType();
    const date = (body.date as string) || new Date().toISOString().slice(0, 10);

    if (type !== "morning" && type !== "midday" && type !== "evening") {
        return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    try {
        const result = await generateBriefing(memberId, date, type);
        if (!result) return NextResponse.json({ error: "generation_failed" }, { status: 500 });
        return NextResponse.json({ content: result.content, id: result.briefingId, type });
    } catch (e) {
        console.error("briefing generation error", e);
        return NextResponse.json({ error: "generation_failed", message: (e as Error).message }, { status: 500 });
    }
}
