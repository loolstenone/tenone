/**
 * 인트라 신청 폼 1개 — 직원 전용
 *   GET    /api/intra/forms/{id}   폼 전체
 *   PATCH  /api/intra/forms/{id}   수정 (제목·설명·상태·기간·질문·설정·개인정보)
 *   DELETE /api/intra/forms/{id}   삭제 — 응답이 있으면 거부 (마감 처리 권장)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHOICE_TYPES, FORM_FILE_MAX, FORM_QUESTION_TYPES, normalizeFormSlug } from "@/lib/forms";
import type { FormQuestion } from "@/types/forms";

type Params = { params: Promise<{ id: string }> };
const VALID_TYPES = new Set(FORM_QUESTION_TYPES.map(t => t.type));

/** 질문 정의 정리 — 허용 필드만, 선택지 공백 제거 */
function cleanQuestions(raw: unknown): FormQuestion[] | string {
    if (!Array.isArray(raw)) return "질문 형식이 잘못되었습니다.";
    const ids = new Set<string>();
    const out: FormQuestion[] = [];
    for (const q of raw as Record<string, unknown>[]) {
        const id = String(q.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
        const type = String(q.type ?? "") as FormQuestion["type"];
        const label = String(q.label ?? "").trim();
        if (!id || ids.has(id)) return "질문 id가 비었거나 겹칩니다.";
        if (!VALID_TYPES.has(type)) return `알 수 없는 질문 유형: ${type}`;
        if (!label) return "질문 제목이 빈 항목이 있습니다.";
        ids.add(id);
        const item: FormQuestion = { id, type, label };
        if (q.help) item.help = String(q.help).trim();
        if (q.required && type !== "section") item.required = true;
        if (CHOICE_TYPES.includes(type)) {
            const options = (Array.isArray(q.options) ? q.options : []).map(o => String(o).trim()).filter(Boolean);
            if (options.length === 0) return `"${label}" 선택지를 하나 이상 넣어 주세요.`;
            item.options = [...new Set(options)];
            if (q.allowOther && type !== "select") item.allowOther = true;
        }
        if (type === "file") item.maxFiles = Math.min(Math.max(Number(q.maxFiles) || 1, 1), FORM_FILE_MAX);
        out.push(item);
    }
    return out;
}

export async function GET(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const { data, error } = await createAdminClient().from("forms").select("*").eq("id", id).maybeSingle();
    if (error || !data) return NextResponse.json({ error: "폼을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ form: data });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) {
        const t = String(body.title).trim();
        if (!t) return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
        patch.title = t;
    }
    if (body.description !== undefined) patch.description = String(body.description ?? "").trim() || null;
    if (body.program !== undefined) patch.program = String(body.program ?? "").trim() || null;
    if (body.slug !== undefined) {
        const s = normalizeFormSlug(String(body.slug));
        if (!s) return NextResponse.json({ error: "주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다." }, { status: 400 });
        patch.slug = s;
    }
    if (body.status !== undefined) {
        if (!["draft", "open", "closed"].includes(body.status)) return NextResponse.json({ error: "상태 값이 잘못되었습니다." }, { status: 400 });
        patch.status = body.status;
    }
    for (const k of ["opens_at", "closes_at"] as const) {
        if (body[k] !== undefined) patch[k] = body[k] ? new Date(body[k]).toISOString() : null;
    }
    if (body.questions !== undefined) {
        const q = cleanQuestions(body.questions);
        if (typeof q === "string") return NextResponse.json({ error: q }, { status: 400 });
        patch.questions = q;
    }
    if (body.settings !== undefined) {
        const s = body.settings ?? {};
        const max = Number(s.max_responses);
        patch.settings = {
            require_login: !!s.require_login,
            allow_edit: !!s.allow_edit,
            one_per_user: !!s.one_per_user,
            max_responses: Number.isInteger(max) && max > 0 ? max : null,
            confirmation: String(s.confirmation ?? "").trim() || null,
        };
    }
    if (body.privacy !== undefined) {
        patch.privacy = { purpose: String(body.privacy?.purpose ?? "").trim(), retention: String(body.privacy?.retention ?? "").trim() };
    }

    const admin = createAdminClient();
    // 열기 전 필수 확인: 질문·수집 목적·보관 기간 (개인정보보호법 제15조 고지 항목)
    if (patch.status === "open") {
        const { data: cur } = await admin.from("forms").select("questions, privacy").eq("id", id).maybeSingle();
        const questions = (patch.questions ?? cur?.questions ?? []) as FormQuestion[];
        const privacy = (patch.privacy ?? cur?.privacy ?? {}) as { purpose?: string; retention?: string };
        if (!questions.some(q => q.type !== "section")) return NextResponse.json({ error: "질문을 하나 이상 넣어야 열 수 있습니다." }, { status: 400 });
        if (!privacy.purpose || !privacy.retention) return NextResponse.json({ error: "개인정보 수집 목적과 보관 기간을 넣어야 열 수 있습니다." }, { status: 400 });
    }

    const { error } = await admin.from("forms").update(patch).eq("id", id);
    if (error) {
        const dup = error.code === "23505";
        return NextResponse.json({ error: dup ? "같은 주소(slug)의 폼이 이미 있습니다." : error.message }, { status: dup ? 409 : 500 });
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const admin = createAdminClient();
    const { count } = await admin.from("form_responses").select("id", { count: "exact", head: true }).eq("form_id", id);
    if ((count ?? 0) > 0) return NextResponse.json({ error: "응답이 있는 폼은 삭제할 수 없습니다. '마감'으로 바꿔 주세요." }, { status: 409 });
    const { error } = await admin.from("forms").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
