/**
 * GET  /api/hero/journey/checklist?stage=c|d|e|f|gap  — 항목 + 체크 상태 (본인)
 * POST /api/hero/journey/checklist  { stage, itemKey, checked }  — 토글 (본인)
 *
 * 검사에서 분리한 상태형 준비 항목 (lib/hero/journey-checklists.ts). 완료율은 생애주기 검사 결과의 준비도로 쓴다.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/api-guard";
import { JOURNEY_CHECKLISTS, isChecklistStage } from "@/lib/hero/journey-checklists";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const stage = req.nextUrl.searchParams.get("stage") ?? "";
    if (!isChecklistStage(stage)) return NextResponse.json({ error: "stage must be c|d|e|f|gap" }, { status: 400 });

    const sb = createAdminClient();
    const { data, error } = await sb
        .from("hero_journey_checklist_items")
        .select("item_key, checked_at")
        .eq("member_id", auth.memberId)
        .eq("stage", stage);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const checked = new Map((data ?? []).map((r: { item_key: string; checked_at: string | null }) => [r.item_key, r.checked_at]));
    const items = JOURNEY_CHECKLISTS[stage].map(i => ({ ...i, checkedAt: checked.get(i.key) ?? null }));
    const done = items.filter(i => i.checkedAt).length;
    return NextResponse.json({ stage, items, total: items.length, done, percent: items.length ? Math.round((done / items.length) * 100) : 0 });
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = (await req.json().catch(() => ({}))) as { stage?: string; itemKey?: string; checked?: boolean };
    const stage = body.stage ?? "";
    if (!isChecklistStage(stage)) return NextResponse.json({ error: "stage must be c|d|e|f|gap" }, { status: 400 });
    const item = JOURNEY_CHECKLISTS[stage].find(i => i.key === body.itemKey);
    if (!item) return NextResponse.json({ error: "unknown itemKey" }, { status: 400 });

    const sb = createAdminClient();
    const { error } = await sb
        .from("hero_journey_checklist_items")
        .upsert({
            member_id: auth.memberId,
            stage,
            item_key: item.key,
            checked_at: body.checked ? new Date().toISOString() : null,
        }, { onConflict: "member_id,stage,item_key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
