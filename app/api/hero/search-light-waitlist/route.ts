import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { email, company } = await req.json();
        const sb = await createClient();

        await sb.from("hero_search_light_waitlist").upsert(
            { email, company, brand_id: "hero" },
            { onConflict: "email" }
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
