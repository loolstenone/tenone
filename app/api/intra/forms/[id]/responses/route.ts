/**
 * 인트라 신청 폼 응답 — 직원 전용
 *   GET   /api/intra/forms/{id}/responses              응답 목록 (응답자 = members 이름·이메일 조회, 복사 저장 없음)
 *   GET   /api/intra/forms/{id}/responses?format=csv   엑셀용 CSV (BOM)
 *   PATCH /api/intra/forms/{id}/responses              { responseId, status?, staff_note? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatAnswer } from "@/lib/forms";
import type { FormAttachment, FormQuestion } from "@/types/forms";

type Params = { params: Promise<{ id: string }> };
const STATUS_LABEL: Record<string, string> = { pending: "대기", accepted: "확정", rejected: "반려", cancelled: "취소" };

const csvCell = (v: string) => /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export async function GET(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const admin = createAdminClient();

    const { data: form } = await admin.from("forms").select("id, title, slug, questions").eq("id", id).maybeSingle();
    if (!form) return NextResponse.json({ error: "폼을 찾을 수 없습니다." }, { status: 404 });
    const { data: rows, error } = await admin.from("form_responses")
        .select("id, member_id, respondent_email, answers, attachments, status, staff_note, created_at, updated_at")
        .eq("form_id", id).order("created_at", { ascending: false }).limit(2000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 로그인 응답자 표시 = members (데이터 계약 1조 — 계정 정보는 복사하지 않고 읽어서 붙인다)
    const memberIds = [...new Set((rows ?? []).map(r => r.member_id).filter(Boolean))] as string[];
    const people = new Map<string, { name: string | null; email: string | null }>();
    if (memberIds.length) {
        const { data: ms } = await admin.from("members").select("id, name, email").in("id", memberIds);
        for (const m of ms ?? []) people.set(m.id, { name: m.name, email: m.email });
    }
    const responses = (rows ?? []).map(r => ({ ...r, member: r.member_id ? people.get(r.member_id) ?? null : null }));

    if (req.nextUrl.searchParams.get("format") === "csv") {
        const questions = (form.questions as FormQuestion[]).filter(q => q.type !== "section");
        const header = ["제출 시각", "상태", "회원", ...questions.map(q => q.label), "메모"];
        const lines = responses.map(r => [
            new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
            STATUS_LABEL[r.status] ?? r.status,
            r.member ? `${r.member.name ?? ""} <${r.member.email ?? ""}>` : "비회원",
            ...questions.map(q => q.type === "file"
                ? ((r.attachments ?? []) as FormAttachment[]).filter(a => a.questionId === q.id).map(a => a.name).join(", ")
                : formatAnswer((r.answers as Record<string, unknown>)?.[q.id])),
            r.staff_note ?? "",
        ].map(v => csvCell(String(v))).join(","));
        const csv = "﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n");
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${form.title}-응답.csv`)}`,
                "Cache-Control": "private, no-store",
            },
        });
    }
    return NextResponse.json({ responses });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) {
        if (!STATUS_LABEL[body.status]) return NextResponse.json({ error: "상태 값이 잘못되었습니다." }, { status: 400 });
        patch.status = body.status;
    }
    if (body.staff_note !== undefined) patch.staff_note = String(body.staff_note ?? "").slice(0, 2000) || null;
    const { error } = await createAdminClient().from("form_responses").update(patch).eq("id", body.responseId).eq("form_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
