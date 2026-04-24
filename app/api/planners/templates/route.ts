import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Templates는 공개 읽기(RLS USING true) — anon 클라이언트로 충분
function publicClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const supabase = publicClient();
    let q = supabase.from("planners_templates").select("*").order("category").order("label");
    if (category) q = q.eq("category", category);
    const { data } = await q;

    return NextResponse.json({ templates: data ?? [] });
}
