/**
 * Agent Profile CRUD API (Universe 편집 허브)
 * GET    /api/intra/agents           전체 목록
 * PATCH  /api/intra/agents           { id, ...fields } 부분 수정
 * DELETE /api/intra/agents?id=...    삭제
 *
 * RLS: service_role 사용 (Intra 내부 API). 호출 보호는 세션 미들웨어에 위임.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

const EDITABLE_FIELDS = new Set([
    "display_name", "layer", "agent_type", "model_id", "system_prompt",
    "temperature", "max_tokens", "knowledge_refs", "tools", "risk_level",
    "can_invoke", "is_active", "version", "brand_id", "runtime",
    "local_endpoint", "fallback_agent",
]);

export async function GET() {
    const sb = adminClient();
    const { data, error } = await sb.from("agent_profiles").select("*").order("layer").order("name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, ...raw } = body;
    if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

    // 화이트리스트로 필터
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (EDITABLE_FIELDS.has(k)) updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "수정할 필드 없음" }, { status: 400 });
    }
    updates.updated_at = new Date().toISOString();

    const sb = adminClient();
    const { data, error } = await sb.from("agent_profiles").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

    // 안전장치: critical risk는 삭제 금지 (별도 수동 처리)
    const sb = adminClient();
    const { data: agent } = await sb.from("agent_profiles").select("risk_level, is_active").eq("id", id).single();
    if (agent?.risk_level === "critical") {
        return NextResponse.json({ error: "Critical 에이전트는 삭제 불가. 먼저 risk_level 완화 후 재시도." }, { status: 403 });
    }
    if (agent?.is_active) {
        return NextResponse.json({ error: "활성 에이전트는 삭제 불가. 먼저 비활성화(is_active=false) 후 삭제." }, { status: 403 });
    }

    const { error } = await sb.from("agent_profiles").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
