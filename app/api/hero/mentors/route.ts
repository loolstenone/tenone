import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("hero_mentors")
        .select("id, name, field, career, match_score, tags, photo")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error || !data?.length) {
        return NextResponse.json({ mentors: [] });
    }

    return NextResponse.json({
        mentors: data.map((m) => ({
            id: m.id,
            name: m.name,
            field: m.field,
            career: m.career,
            matchScore: m.match_score,
            tags: m.tags ?? [],
            photo: m.photo ?? m.name.charAt(0),
        })),
    });
}
