import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { WIKI_STATIC_PAGES } from "@/types/wiki";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const url = new URL(request.url);
    const full = url.pathname.includes("full") || url.searchParams.get("full") === "1";

    const { data: pages } = await supabase
        .from("wiki_pages")
        .select("slug, title, category, content, summary, updated_at")
        .order("category")
        .order("title");

    const allPages = pages || [];
    const lastUpdated = allPages.length > 0
        ? new Date(Math.max(...allPages.map((p: { updated_at: string }) => new Date(p.updated_at).getTime()))).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

    let output = `# Ten:One™ Universe Wiki
# Last updated: ${lastUpdated}
# Total pages: ${allPages.length + WIKI_STATIC_PAGES.length}
# URL: https://wiki.tenone.biz

## About
Ten:One™ Universe는 26개 브랜드, 6개 AI 에이전트, 1인 운영의
마케팅·교육·기술 생태계입니다.
이 위키는 AI(Claude)가 주 1회 컴파일합니다.

## Static Pages (운영·교육)
`;

    for (const sp of WIKI_STATIC_PAGES) {
        output += `- /${sp.slug} — ${sp.title}: ${sp.description}\n`;
    }

    output += `\n## Index\n`;

    for (const page of allPages) {
        output += `- /${page.slug} — ${page.title}`;
        if (page.summary) output += `: ${page.summary}`;
        output += `\n`;
    }

    if (full) {
        output += `\n## Full Content\n`;
        output += `각 페이지 전문이 이어집니다.\n\n`;

        for (const page of allPages) {
            output += `---\n`;
            output += `# ${page.title}\n`;
            output += `slug: ${page.slug}\n`;
            output += `category: ${page.category}\n\n`;
            output += page.content;
            output += `\n\n`;
        }
    }

    return new NextResponse(output, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
