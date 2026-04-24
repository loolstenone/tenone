import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateBriefing, type BriefingType } from "@/lib/planners/briefing";

export const maxDuration = 60;

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('email', user.email!)
        .maybeSingle();
    return member?.id ?? null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const type = body.type as BriefingType;
    const date = (body.date as string) || new Date().toISOString().slice(0, 10);

    if (type !== "morning" && type !== "evening") {
        return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    try {
        const result = await generateBriefing(memberId, date, type);
        if (!result) return NextResponse.json({ error: "generation_failed" }, { status: 500 });
        return NextResponse.json({ content: result.content, id: result.briefingId });
    } catch (e) {
        console.error("briefing generation error", e);
        return NextResponse.json({ error: "generation_failed", message: (e as Error).message }, { status: 500 });
    }
}
