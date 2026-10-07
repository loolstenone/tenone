/**
 * 프로그램 회차 Q&A (코어) — 공개(회차 참가자 전체) · 비밀(질문한 팀 · 직원 · 클라이언트)
 *   GET  /api/programs/rounds/{id}/qna
 *   POST /api/programs/rounds/{id}/qna  { action }
 *        ask    { title, body?, is_private }  — 참가자 (팀 참가면 그 팀으로)
 *        answer { question_id, body }          — 직원 · 클라이언트
 *        delete { question_id }                — 질문한 사람(답변 전) · 직원
 * 질문자는 팀 이름으로만 표시 (직원에게만 이름). 클라이언트에게 참가자 이름 비노출
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoundAccess, roundClientIds, roundParticipantIds } from "@/lib/programs/access";
import { programRoomPath } from "@/lib/programs/paths";
import { notify, brandManagerIds } from "@/lib/notify";

type Params = { params: Promise<{ id: string }> };
const deny = () => NextResponse.json({ error: "이 회차 참여자만 볼 수 있습니다." }, { status: 403 });

interface QRow { id: string; team_id: string | null; asker_member_id: string | null; title: string; body: string | null; is_private: boolean; status: string; created_at: string }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    const admin = createAdminClient();

    let q = admin.from("program_questions").select("id, team_id, asker_member_id, title, body, is_private, status, created_at")
        .eq("round_id", id).order("created_at", { ascending: false });
    // 참가자: 공개 + 우리 팀(개인 참가는 내) 비밀 질문만
    if (a.role === "team") q = q.or(a.teamId ? `is_private.eq.false,team_id.eq.${a.teamId}` : `is_private.eq.false,asker_member_id.eq.${a.memberId}`);
    const { data: qs, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = (qs ?? []) as QRow[];

    const qIds = rows.map(r => r.id);
    const teamIds = [...new Set(rows.map(r => r.team_id).filter((x): x is string => !!x))];
    const [{ data: answers }, { data: teams }, { data: askers }] = await Promise.all([
        qIds.length ? admin.from("program_answers").select("id, question_id, author_role, body, created_at").in("question_id", qIds).order("created_at")
            : Promise.resolve({ data: [] as { id: string; question_id: string; author_role: string; body: string; created_at: string }[] }),
        teamIds.length ? admin.from("program_teams").select("id, name").in("id", teamIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
        a.role === "staff" && rows.length
            ? admin.from("members").select("id, name").in("id", rows.map(r => r.asker_member_id).filter((x): x is string => !!x))
            : Promise.resolve({ data: [] as { id: string; name: string | null }[] }),
    ]);
    const teamName = new Map((teams ?? []).map(t => [t.id, t.name]));
    const askerName = new Map((askers ?? []).map(m => [m.id, m.name]));

    return NextResponse.json({
        role: a.role,
        canAsk: a.role === "team" || !!a.teamId,
        canAnswer: a.role === "staff" || a.role === "client",
        questions: rows.map(r => ({
            id: r.id, title: r.title, body: r.body, is_private: r.is_private, status: r.status, created_at: r.created_at,
            team: r.team_id ? teamName.get(r.team_id) ?? "팀" : "참가자",
            asker: a.role === "staff" ? askerName.get(r.asker_member_id ?? "") ?? null : null,
            mine: r.asker_member_id === a.memberId,
            answers: (answers ?? []).filter(x => x.question_id === r.id)
                .map(x => ({ id: x.id, role: x.author_role, body: x.body, created_at: x.created_at })),
        })),
    });
}

export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    const admin = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const room = programRoomPath(a.round, "qna");

    switch (body.action) {
        case "ask": {
            if (a.role !== "team" && !a.teamId) return NextResponse.json({ error: "이 회차 참가자만 질문할 수 있습니다." }, { status: 403 });
            const title = String(body.title ?? "").trim().slice(0, 200);
            if (!title) return NextResponse.json({ error: "질문 제목을 적어 주세요." }, { status: 400 });
            const text = String(body.body ?? "").trim().slice(0, 5000) || null;
            const isPrivate = body.is_private === true;
            const { error } = await admin.from("program_questions").insert({
                brand_id: a.round.brand_id, round_id: id, team_id: a.teamId, asker_member_id: a.memberId, title, body: text, is_private: isPrivate,
            });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            const [managers, clients] = await Promise.all([brandManagerIds(a.round.brand_id), roundClientIds(id)]);
            await notify([...managers, ...clients].filter(m => m !== a.memberId), {
                brandId: a.round.brand_id, type: "program_question",
                title: `[${isPrivate ? "비밀 Q&A" : "Q&A"}] ${a.round.title} · ${title}`, link: room,
            });
            return NextResponse.json({ ok: true });
        }

        case "answer": {
            if (a.role !== "staff" && a.role !== "client") return NextResponse.json({ error: "운영진·클라이언트만 답변할 수 있습니다." }, { status: 403 });
            const text = String(body.body ?? "").trim().slice(0, 5000);
            if (!text) return NextResponse.json({ error: "답변을 적어 주세요." }, { status: 400 });
            const { data: q } = await admin.from("program_questions").select("id, team_id, asker_member_id, title")
                .eq("id", String(body.question_id ?? "")).eq("round_id", id).maybeSingle();
            if (!q) return NextResponse.json({ error: "질문을 찾을 수 없습니다." }, { status: 404 });
            const { error } = await admin.from("program_answers").insert({ brand_id: a.round.brand_id, question_id: q.id, author_member_id: a.memberId, author_role: a.role, body: text });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            await admin.from("program_questions").update({ status: "answered", updated_at: new Date().toISOString() }).eq("id", q.id);
            const askers = q.team_id ? await roundParticipantIds(id, q.team_id) : [q.asker_member_id];
            await notify(askers.filter(m => m !== a.memberId), {
                brandId: a.round.brand_id, type: "program_answer",
                title: `[답변] ${a.round.title} · ${q.title}`, message: text.slice(0, 120), link: room,
            });
            return NextResponse.json({ ok: true });
        }

        case "delete": {
            const { data: q } = await admin.from("program_questions").select("id, asker_member_id, status")
                .eq("id", String(body.question_id ?? "")).eq("round_id", id).maybeSingle();
            if (!q) return NextResponse.json({ error: "질문을 찾을 수 없습니다." }, { status: 404 });
            const own = q.asker_member_id === a.memberId && q.status === "open";
            if (a.role !== "staff" && !own) return NextResponse.json({ error: "답변 전의 내 질문만 지울 수 있습니다." }, { status: 403 });
            const { error } = await admin.from("program_questions").delete().eq("id", q.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        default:
            return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
    }
}
