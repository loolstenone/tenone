import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { WIKI_CATEGORIES, WIKI_STATIC_PAGES, type WikiSearchItem } from "@/types/wiki";

export const revalidate = 3600;

export async function GET() {
    const supabase = createClient();

    const { data: pages } = await supabase
        .from("wiki_pages")
        .select("slug, title, category, tags, summary")
        .order("title");

    const items: WikiSearchItem[] = [];

    // DB 페이지
    for (const p of pages || []) {
        const cat = WIKI_CATEGORIES[p.category as keyof typeof WIKI_CATEGORIES];
        items.push({
            slug: p.slug,
            title: p.title,
            category: cat?.label || p.category,
            tags: p.tags || [],
            summary: p.summary || "",
        });
    }

    // 정적 페이지
    for (const sp of WIKI_STATIC_PAGES) {
        items.push({
            slug: sp.slug,
            title: sp.title,
            category: sp.category,
            tags: [],
            summary: sp.description,
            isStatic: true,
        });
    }

    return NextResponse.json({ items });
}
