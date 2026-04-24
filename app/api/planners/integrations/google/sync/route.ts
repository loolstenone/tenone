import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { syncEvents } from "@/lib/planners/google-calendar";

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
    const { data: member } = await supabase.from("members").select("id").eq("email", user.email!).maybeSingle();
    return member?.id ?? null;
}

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // 과거 7일 ~ 향후 90일
    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 86400000).toISOString();
    const timeMax = new Date(now.getTime() + 90 * 86400000).toISOString();

    const result = await syncEvents(memberId, timeMin, timeMax);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ synced: result.synced });
}
