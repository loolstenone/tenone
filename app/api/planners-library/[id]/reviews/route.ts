/**
 * 플래너'스 PAD 후기 쓰기 — 로그인 회원 (상품 1개당 1개, 다시 쓰면 고침)
 *   POST   /api/planners-library/{id}/reviews  { rating:1~5, body }
 *   DELETE /api/planners-library/{id}/reviews  → 내 후기 삭제
 * 저장 = member_id만 (이름은 읽을 때 가려서 만든다 — lib/planners/reviews.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify, brandManagerIds } from "@/lib/notify";

export const runtime = "nodejs";

const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

async function publishedFile(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { data } = await createAdminClient().from("planners_files").select("id, title").eq("id", id).eq("is_published", true).maybeSingle();
    return data;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireMember(req);
    if (user instanceof NextResponse) return bad("로그인이 필요합니다.", 401);
    const { id } = await params;
    const file = await publishedFile(id);
    if (!file) return bad("상품을 찾을 수 없습니다.", 404);

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating);
    const text = String(body.body ?? "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return bad("별점을 골라 주세요.");
    if (text.length < 2) return bad("후기를 두 글자 이상 써 주세요.");
    if (text.length > 2000) return bad("후기는 2,000자까지 쓸 수 있습니다.");

    const admin = createAdminClient();
    const { data: existing } = await admin.from("planners_reviews").select("id").eq("file_id", id).eq("member_id", user.memberId).maybeSingle();
    const now = new Date().toISOString();
    const { error } = existing
        ? await admin.from("planners_reviews").update({ rating, body: text, updated_at: now }).eq("id", existing.id)
        : await admin.from("planners_reviews").insert({ file_id: id, source: "site", member_id: user.memberId, rating, body: text });
    if (error) {
        console.error("[planners-reviews] 저장 실패", error.message);
        return bad("후기를 저장하지 못했습니다.", 500);
    }
    // 새 후기만 알림 (고친 후기는 알리지 않음) — Planner's 담당·마스터 (아임웹 '새 구매평 알림' 자리)
    if (!existing) {
        await notify(await brandManagerIds("planners"), {
            brandId: "planners",
            type: "planners_review",
            title: `새 후기 ★${rating} · ${file.title}`,
            message: text.slice(0, 80),
            link: "/intra/ums/planners/reviews",
        }).catch((e) => console.error("[planners-reviews] 알림 실패", e));
    }
    return NextResponse.json({ ok: true, updated: !!existing });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireMember(req);
    if (user instanceof NextResponse) return bad("로그인이 필요합니다.", 401);
    const { id } = await params;
    const { error } = await createAdminClient().from("planners_reviews").delete().eq("file_id", id).eq("member_id", user.memberId);
    if (error) return bad("삭제하지 못했습니다.", 500);
    return NextResponse.json({ ok: true });
}
