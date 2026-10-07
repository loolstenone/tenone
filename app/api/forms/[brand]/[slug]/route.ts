/**
 * 공개 신청 폼 — 조회·제출·수정 (유니버스 공통, sql/forms-module.sql)
 *   GET   /api/forms/{brand}/{slug}   폼 정의 + 지금 제출 가능 여부 + (로그인 시) 내 응답
 *   POST  /api/forms/{brand}/{slug}   제출 { answers, files[], captchaToken, agreed, responseId? }
 * 응답 쓰기는 이 API(service_role)만 — 설정(로그인·기간·정원·1인 1회·수정 허용)을 서버에서 강제한다.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApiUser } from "@/lib/api-guard";
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from "@/lib/turnstile-server";
import { CONTACT_ATTACHMENT_BUCKET, attachmentExt, validateAttachments, type ContactAttachmentMeta } from "@/lib/contact-attachments";
import {
    consentItems, consentVersion, formAvailability, formNeedsLogin, pickFormAnswers,
    responseEmail, validateFormAnswers, FORM_FILE_MAX,
} from "@/lib/forms";
import type { FormAnswers, FormAttachment, FormDef } from "@/types/forms";

type Params = { params: Promise<{ brand: string; slug: string }> };

const PUBLIC_COLS = "id, brand_id, slug, program, title, description, status, opens_at, closes_at, questions, settings, privacy, created_at, updated_at";

async function loadForm(brand: string, slug: string): Promise<FormDef | null> {
    const { data } = await createAdminClient().from("forms").select(PUBLIC_COLS).eq("brand_id", brand).eq("slug", slug).maybeSingle();
    return (data as FormDef | null) ?? null;
}

async function countResponses(formId: string): Promise<number> {
    const { count } = await createAdminClient().from("form_responses").select("id", { count: "exact", head: true })
        .eq("form_id", formId).neq("status", "cancelled");
    return count ?? 0;
}

/** 응답자에게 내려줄 폼 — 알림 이메일 등 내부 설정은 뺀다 */
function publicForm(form: FormDef) {
    const { notify_emails: _omit, ...settings } = form.settings ?? {};
    void _omit;
    return { ...form, settings };
}

export async function GET(req: NextRequest, { params }: Params) {
    const { brand, slug } = await params;
    const form = await loadForm(brand, slug);
    const viewer = await getApiUser(req);
    // 초안은 직원 미리보기만
    if (!form || (form.status === "draft" && !viewer?.isStaff)) {
        return NextResponse.json({ error: "신청서를 찾을 수 없습니다." }, { status: 404 });
    }
    const availability = formAvailability(form, form.settings?.max_responses ? await countResponses(form.id) : 0);

    let myResponse = null;
    if (viewer?.memberId) {
        const { data } = await createAdminClient().from("form_responses")
            .select("id, answers, attachments, status, created_at, updated_at")
            .eq("form_id", form.id).eq("member_id", viewer.memberId).neq("status", "cancelled")
            .order("created_at", { ascending: false }).limit(1).maybeSingle();
        myResponse = data;
    }
    return NextResponse.json({ form: publicForm(form), availability, signedIn: !!viewer, myResponse });
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { brand, slug } = await params;
        const body = await req.json().catch(() => ({}));

        if (!(await verifyTurnstile(body.captchaToken, req))) {
            return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
        }
        const form = await loadForm(brand, slug);
        if (!form) return NextResponse.json({ error: "신청서를 찾을 수 없습니다." }, { status: 404 });

        const availability = formAvailability(form, form.settings?.max_responses ? await countResponses(form.id) : 0);
        if (availability !== "open") {
            return NextResponse.json({ error: availability === "full" ? "정원이 마감되었습니다." : "지금은 신청을 받지 않습니다." }, { status: 409 });
        }

        const viewer = await getApiUser(req);
        if (formNeedsLogin(form) && !viewer?.memberId) {
            return NextResponse.json({ error: "로그인 후 신청할 수 있습니다." }, { status: 401 });
        }
        if (body.agreed !== true) {
            return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
        }

        const admin = createAdminClient();
        const settings = form.settings ?? {};
        const editId: string | null = typeof body.responseId === "string" ? body.responseId : null;

        // 수정: 본인 응답 + 수정 허용 폼만
        let existing: { id: string; attachments: FormAttachment[] } | null = null;
        if (editId) {
            if (!settings.allow_edit || !viewer?.memberId) return NextResponse.json({ error: "수정할 수 없는 신청서입니다." }, { status: 403 });
            const { data } = await admin.from("form_responses").select("id, attachments, member_id, form_id, status")
                .eq("id", editId).maybeSingle();
            if (!data || data.member_id !== viewer.memberId || data.form_id !== form.id || data.status === "cancelled") {
                return NextResponse.json({ error: "수정할 수 없는 신청서입니다." }, { status: 403 });
            }
            existing = { id: data.id, attachments: (data.attachments ?? []) as FormAttachment[] };
        } else if (settings.one_per_user && viewer?.memberId) {
            const { count } = await admin.from("form_responses").select("id", { count: "exact", head: true })
                .eq("form_id", form.id).eq("member_id", viewer.memberId).neq("status", "cancelled");
            if ((count ?? 0) > 0) return NextResponse.json({ error: "이미 신청하셨습니다." }, { status: 409 });
        }

        // 파일: 메타만 받고 서명 업로드 URL 발급 (contact-attachments 비공개 버킷, forms/ 경로)
        const fileQuestions = new Set(form.questions.filter(q => q.type === "file").map(q => q.id));
        const files: (ContactAttachmentMeta & { questionId: string })[] = Array.isArray(body.files)
            ? body.files.map((f: Record<string, unknown>) => ({
                questionId: String(f?.questionId ?? ""), name: String(f?.name ?? ""), size: Number(f?.size ?? 0), type: String(f?.type ?? ""),
            })).filter((f: { questionId: string }) => fileQuestions.has(f.questionId))
            : [];
        for (const qid of fileQuestions) {
            const invalid = validateAttachments(files.filter(f => f.questionId === qid).slice(0, FORM_FILE_MAX + 1));
            if (invalid) return NextResponse.json({ error: invalid, field: qid }, { status: 400 });
        }
        // 수정 시 새 파일을 안 올린 질문은 기존 파일 유지
        const kept = (existing?.attachments ?? []).filter(a => !files.some(f => f.questionId === a.questionId));
        const fileCounts: Record<string, number> = {};
        for (const f of [...kept, ...files]) fileCounts[f.questionId] = (fileCounts[f.questionId] ?? 0) + 1;

        const answers = pickFormAnswers(form.questions, (body.answers ?? {}) as FormAnswers);
        const errors = validateFormAnswers(form.questions, answers, fileCounts);
        if (Object.keys(errors).length) return NextResponse.json({ error: "입력을 확인해 주세요.", errors }, { status: 400 });

        const id = existing?.id ?? randomUUID();
        const stamp = Date.now();
        const newAttachments: FormAttachment[] = files.map((f, i) => ({
            questionId: f.questionId, name: f.name, size: f.size, type: f.type,
            path: `forms/${form.id}/${id}/${f.questionId}-${stamp}-${i + 1}.${attachmentExt(f.name)}`,
        }));
        const consent = {
            version: consentVersion(form),
            agreed_at: new Date().toISOString(),
            purpose: form.privacy?.purpose ?? "",
            items: consentItems(form.questions),
            retention: form.privacy?.retention ?? "",
        };
        const row = {
            answers,
            attachments: [...kept, ...newAttachments],
            consent,
            // 회원이 아닌 사람만 이메일로 식별 (데이터 계약 1조)
            respondent_email: viewer?.memberId ? null : responseEmail(form.questions, answers),
        };

        if (existing) {
            const { error } = await admin.from("form_responses").update(row).eq("id", id);
            if (error) throw error;
            // 교체된 옛 파일 삭제
            const removed = existing.attachments.filter(a => !kept.includes(a)).map(a => a.path);
            if (removed.length) await admin.storage.from(CONTACT_ATTACHMENT_BUCKET).remove(removed);
        } else {
            const { error } = await admin.from("form_responses").insert({
                id, form_id: form.id, brand_id: form.brand_id, member_id: viewer?.memberId ?? null, ...row,
            });
            if (error) throw error;
        }

        const uploads = [];
        for (const a of newAttachments) {
            const { data, error } = await admin.storage.from(CONTACT_ATTACHMENT_BUCKET).createSignedUploadUrl(a.path);
            if (error || !data) throw error ?? new Error("signed upload url");
            uploads.push({ path: a.path, token: data.token });
        }
        return NextResponse.json({ success: true, id, uploads, confirmation: settings.confirmation ?? "신청이 접수되었습니다." });
    } catch (error) {
        console.error("[forms] submit error:", error);
        return NextResponse.json({ error: "제출에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }
}
