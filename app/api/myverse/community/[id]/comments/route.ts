import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const content = (body.content as string | undefined)?.trim();
    if (!content) return NextResponse.json({ error: "empty_content" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_community_comments")
        .insert({ post_id: id, member_id: memberId, content: content.slice(0, 2000) })
        .select()
        .single();
    if (error || !data) return NextResponse.json({ error: error?.message || "insert_failed" }, { status: 500 });
    return NextResponse.json({ comment: data });
}
