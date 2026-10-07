/**
 * 인트라 신청 폼 관리 — 직원 전용
 *   GET  /api/intra/forms?brand=madleague   폼 목록 + 응답 수(전체·대기)
 *   POST /api/intra/forms                    새 폼 { brand, title, slug?, program?, copyFrom? } (copyFrom = 기존 폼 질문·설정 복제)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeFormSlug } from "@/lib/forms";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const brand = req.nextUrl.searchParams.get("brand");
    if (!brand) return NextResponse.json({ error: "brand가 필요합니다." }, { status: 400 });

    const admin = createAdminClient();
    const { data: forms, error } = await admin.from("forms")
        .select("id, slug, program, title, status, opens_at, closes_at, settings, updated_at, created_at")
        .eq("brand_id", brand).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 응답 수 — 폼별 head count (행을 불러와 세지 않는다, §1.9.5)
    const withCounts = await Promise.all((forms ?? []).map(async f => {
        const [total, pending] = await Promise.all([
            admin.from("form_responses").select("id", { count: "exact", head: true }).eq("form_id", f.id).neq("status", "cancelled"),
            admin.from("form_responses").select("id", { count: "exact", head: true }).eq("form_id", f.id).eq("status", "pending"),
        ]);
        return { ...f, response_count: total.count ?? 0, pending_count: pending.count ?? 0 };
    }));
    return NextResponse.json({ forms: withCounts });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const brand = String(body.brand ?? "");
    const title = String(body.title ?? "").trim();
    if (!brand || !title) return NextResponse.json({ error: "브랜드와 제목이 필요합니다." }, { status: 400 });

    const admin = createAdminClient();
    let base: Record<string, unknown> = { questions: [], settings: {}, privacy: { retention: "행사 종료 후 1년" } };
    if (body.copyFrom) {
        const { data: src } = await admin.from("forms").select("brand_id, program, description, questions, settings, privacy").eq("id", body.copyFrom).maybeSingle();
        if (src && src.brand_id === brand) base = { program: src.program, description: src.description, questions: src.questions, settings: src.settings, privacy: src.privacy };
    }
    // slug: 지정값 또는 제목 기반 + 중복이면 숫자 붙임
    let slug = normalizeFormSlug(String(body.slug ?? "")) || `form-${Date.now().toString(36)}`;
    for (let i = 2; ; i++) {
        const { count } = await admin.from("forms").select("id", { count: "exact", head: true }).eq("brand_id", brand).eq("slug", slug);
        if (!count) break;
        slug = `${normalizeFormSlug(String(body.slug ?? "")) || "form"}-${i}`;
    }
    const createdBy = auth.kind === "user" ? auth.memberId : null;
    const { data, error } = await admin.from("forms").insert({
        ...base, brand_id: brand, slug, title, status: "draft",
        program: body.program ?? base.program ?? null, created_by: createdBy,
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id, slug });
}
