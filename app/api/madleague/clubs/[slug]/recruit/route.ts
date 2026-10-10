/**
 * 동아리 부원 모집 지원서 응답 — 그 동아리 운영진 · 직원만 (공동 모집, 2026-10-10)
 *   GET   /api/madleague/clubs/{slug}/recruit[?form=id]   이 동아리 모집 폼 목록 + 선택 폼 응답
 *   PATCH /api/madleague/clubs/{slug}/recruit             { responseId, status?, staff_note? } — 합격(accepted)·불합격(rejected)·메모
 *
 * 폼 = forms.program `club-recruit:{slug}` (lib/madleague-recruit.ts). 다른 동아리 폼·응답은 절대 돌려주지 않는다
 * 응답자 이름·이메일은 members에서 읽어 붙일 뿐 복사하지 않는다 (데이터 계약 1조)
 * 폼 만들기·질문 수정·열기는 인트라(직원) — 운영진은 응답 확인·상태만
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditClubProfile, getMadAccess } from "@/lib/madleague-roles";
import { clubRecruitProgram } from "@/lib/madleague-recruit";
import { formAvailability } from "@/lib/forms";
import type { FormDef } from "@/types/forms";

export const runtime = "nodejs";
type Params = { params: Promise<{ slug: string }> };

async function context(slug: string) {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
    const admin = createAdminClient();
    const { data: me } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (!me) return { error: NextResponse.json({ error: "회원 정보가 없습니다." }, { status: 403 }) };
    const { data: club } = await admin.from("mad_clubs").select("id, slug, president_member_id").eq("slug", slug).maybeSingle();
    if (!club) return { error: NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 }) };
    const access = await getMadAccess(me.id);
    if (!canEditClubProfile(access, me.id, club)) {
        return { error: NextResponse.json({ error: "이 동아리 운영진만 볼 수 있습니다." }, { status: 403 }) };
    }
    return { admin, club };
}

export async function GET(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { admin, club } = c;

    const { data: forms } = await admin.from("forms")
        .select("id, slug, title, status, opens_at, closes_at, settings, questions")
        .eq("brand_id", "madleague").eq("program", clubRecruitProgram(club.slug))
        .order("created_at", { ascending: false });
    const list = (forms ?? []) as Array<Pick<FormDef, "id" | "slug" | "title" | "status" | "opens_at" | "closes_at" | "settings" | "questions">>;
    if (!list.length) return NextResponse.json({ forms: [], form: null, responses: [] });

    const wanted = req.nextUrl.searchParams.get("form");
    const form = list.find(f => f.id === wanted) ?? list[0];

    const { data: rows } = await admin.from("form_responses")
        .select("id, member_id, respondent_email, answers, status, staff_note, created_at")
        .eq("form_id", form.id).neq("status", "cancelled")
        .order("created_at", { ascending: false }).limit(1000);
    const memberIds = [...new Set((rows ?? []).map(r => r.member_id).filter(Boolean))] as string[];
    const people = new Map<string, { name: string | null; email: string | null }>();
    if (memberIds.length) {
        const { data: ms } = await admin.from("members").select("id, name, email").in("id", memberIds);
        for (const m of ms ?? []) people.set(m.id, { name: m.name, email: m.email });
    }

    return NextResponse.json({
        forms: list.map(f => ({ id: f.id, slug: f.slug, title: f.title, availability: formAvailability(f) })),
        form: { id: form.id, slug: form.slug, title: form.title, questions: form.questions, availability: formAvailability(form) },
        responses: (rows ?? []).map(r => {
            const p = r.member_id ? people.get(r.member_id) : null;
            return {
                id: r.id, status: r.status, staff_note: r.staff_note, created_at: r.created_at, answers: r.answers,
                name: p?.name ?? null, email: p?.email ?? r.respondent_email ?? null,
            };
        }),
    });
}

const STATUSES = ["pending", "accepted", "rejected"];

export async function PATCH(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { admin, club } = c;

    const body = await req.json().catch(() => ({})) as { responseId?: string; status?: string; staff_note?: string };
    if (!body.responseId) return NextResponse.json({ error: "응답을 지정해 주세요." }, { status: 400 });

    // 이 동아리 모집 폼의 응답인지 확인
    const { data: resp } = await admin.from("form_responses").select("id, form_id").eq("id", body.responseId).maybeSingle();
    if (!resp) return NextResponse.json({ error: "응답을 찾을 수 없습니다." }, { status: 404 });
    const { data: form } = await admin.from("forms").select("program").eq("id", resp.form_id).maybeSingle();
    if (form?.program !== clubRecruitProgram(club.slug)) return NextResponse.json({ error: "이 동아리 지원서가 아닙니다." }, { status: 403 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) {
        if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "잘못된 상태입니다." }, { status: 400 });
        patch.status = body.status;
    }
    if (body.staff_note !== undefined) patch.staff_note = String(body.staff_note).slice(0, 1000) || null;

    const { error } = await admin.from("form_responses").update(patch).eq("id", resp.id);
    if (error) {
        console.error("[club recruit] update failed", error);
        return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
