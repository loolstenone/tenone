// 비슷한 순간 — 한 흔적의 임베딩으로 의미 유사한 다른 흔적 찾기
// GET /api/myverse/moments/[id]/similar?limit=12
//
// 1. 대상 흔적의 embedding 컬럼이 있으면 바로 사용
// 2. 없으면 momentEmbeddingText → embed() 후 RPC 호출
// 3. 결과에서 자기 자신 제외, similarity DESC

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import { embed, momentEmbeddingText } from "@/lib/myverse/embeddings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "12", 10) || 12, 1), 30);

    const admin = createAdminClient();

    // 대상 흔적 로드 (소유 검증 포함)
    const { data: target, error } = await admin
        .from("myverse_daily_moments")
        .select("id, member_id, caption, sub_tags, location, with_whom, activity, domain, embedding")
        .eq("id", id)
        .maybeSingle();

    if (error || !target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (target.member_id !== memberId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // embedding 확보
    let queryEmbedding: number[] | null = (target.embedding as number[] | null) ?? null;
    if (!queryEmbedding) {
        const text = momentEmbeddingText(target);
        if (!text.trim()) return NextResponse.json({ items: [], reason: "no_text" });
        queryEmbedding = await embed(text);
        if (!queryEmbedding) return NextResponse.json({ items: [], reason: "embed_failed" });
    }

    // RPC — +1 (자기 자신 제외)
    const { data: rows, error: rpcErr } = await admin.rpc("myverse_search_moments_semantic", {
        p_member_id: memberId,
        p_query_embedding: queryEmbedding,
        p_match_count: limit + 1,
    });

    if (rpcErr) {
        console.error("[similar] rpc error:", rpcErr.message);
        return NextResponse.json({ error: "rpc_failed", message: rpcErr.message }, { status: 500 });
    }

    const items = ((rows ?? []) as Array<{ id: string;[k: string]: unknown }>)
        .filter(r => r.id !== id)
        .slice(0, limit);

    return NextResponse.json({ items });
}
