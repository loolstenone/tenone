// 임베딩 일괄 생성 — embedding NULL 인 흔적 N개 처리
// POST /api/myverse/embeddings/generate?limit=20  (본인 한정)
//
// OPENAI_API_KEY 없으면 ok:false 와 함께 안내.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import { embed, momentEmbeddingText, EMBED_MODEL_NAME } from "@/lib/myverse/embeddings";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
            ok: false,
            reason: "missing_openai_key",
            hint: ".env.local 에 OPENAI_API_KEY 를 추가하세요",
        }, { status: 400 });
    }

    const url = new URL(req.url);
    const limit = Math.min(50, parseInt(url.searchParams.get("limit") ?? "20", 10));

    const admin = createAdminClient();
    const { data: rows } = await admin
        .from("myverse_daily_moments")
        .select("id, caption, sub_tags, location, with_whom, activity, domain")
        .eq("member_id", memberId)
        .is("embedding", null)
        .limit(limit);

    if (!rows || rows.length === 0) {
        return NextResponse.json({ ok: true, processed: 0, message: "임베딩이 비어 있는 흔적이 없습니다" });
    }

    let processed = 0, failed = 0;
    for (const r of rows) {
        const text = momentEmbeddingText(r);
        if (!text) continue;
        const vec = await embed(text);
        if (!vec) { failed++; continue; }
        const { error } = await admin.from("myverse_daily_moments")
            .update({
                embedding: vec as unknown as string,  // pg-vector serializer
                embedding_model: EMBED_MODEL_NAME,
                embedding_at: new Date().toISOString(),
            })
            .eq("id", r.id);
        if (error) { failed++; console.warn("[embeddings] update error:", error.message); }
        else processed++;
    }

    return NextResponse.json({ ok: true, processed, failed, remaining_estimate: rows.length - processed });
}
