import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export const revalidate = 3600;

export async function GET() {
    const supabase = createClient();

    const { data: links } = await supabase
        .from("wiki_links")
        .select("from_slug, to_slug, link_type");

    return NextResponse.json({
        links: (links || []).map((l: { from_slug: string; to_slug: string; link_type: string }) => ({
            source: l.from_slug,
            target: l.to_slug,
            type: l.link_type,
        })),
    });
}
