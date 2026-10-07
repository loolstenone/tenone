/**
 * 회차 제출물 · 코멘트
 *   GET  /api/madleague/rounds/{id}/works
 *        직원·클라이언트: 팀(이름·본선 진출) × 최종 제출물(예선·본선) + 코멘트 전체 — 팀원 이름 비노출
 *        팀원: 우리 팀 제출물에 달린 '팀에게 공개' 코멘트만
 *   POST /api/madleague/rounds/{id}/works  { submission_id, body, visible_to_team }  — 직원·클라이언트
 *        팀에게 공개 → 팀원 알림 · 클라이언트가 쓰면 운영 담당 알림
 * 파일 내려받기는 /api/madleague/pt/submission (서명 URL 5분)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoundAccess, roundTeamMemberIds } from "@/lib/madleague-round-access";
import { notify, brandManagerIds } from "@/lib/notify";

type Params = { params: Promise<{ id: string }> };
const deny = () => NextResponse.json({ error: "이 회차 참여자만 볼 수 있습니다." }, { status: 403 });

interface Sub { id: string; team_id: string; stage: string; title: string; description: string | null; presentation_url: string | null; file_name: string | null; status: string; submitted_at: string | null }
interface Cmt { id: string; submission_id: string; author_role: string; body: string; visible_to_team: boolean; created_at: string }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    const admin = createAdminClient();
    const reviewer = a.role === "staff" || a.role === "client";

    const { data: teams } = await admin.from("mad_competition_teams").select("id, name, is_finalist")
        .eq("competition_id", id).order("created_at");
    const visibleTeams = reviewer ? (teams ?? []) : (teams ?? []).filter(t => t.id === a.teamId);
    const teamIds = visibleTeams.map(t => t.id);
    if (!teamIds.length) return NextResponse.json({ reviewer, teams: [] });

    let sq = admin.from("mad_submissions").select("id, team_id, stage, title, description, presentation_url, file_name, status, submitted_at").in("team_id", teamIds);
    if (reviewer) sq = sq.eq("status", "submitted"); // 직원·클라이언트 = 최종 제출한 것만
    const { data: subs } = await sq;
    const subIds = (subs ?? []).map(s => s.id);
    let cq = admin.from("mad_submission_comments").select("id, submission_id, author_role, body, visible_to_team, created_at").order("created_at");
    if (!reviewer) cq = cq.eq("visible_to_team", true);
    const { data: comments } = subIds.length ? await cq.in("submission_id", subIds) : { data: [] as Cmt[] };

    return NextResponse.json({
        reviewer,
        teams: visibleTeams.map(t => ({
            id: t.id, name: t.name, is_finalist: t.is_finalist,
            submissions: ((subs ?? []) as Sub[]).filter(s => s.team_id === t.id)
                .sort((x, y) => (x.stage === "final" ? -1 : 1) - (y.stage === "final" ? -1 : 1))
                .map(s => ({ ...s, comments: ((comments ?? []) as Cmt[]).filter(c => c.submission_id === s.id) })),
        })),
    });
}

export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    if (a.role !== "staff" && a.role !== "client") return NextResponse.json({ error: "운영진·클라이언트만 코멘트할 수 있습니다." }, { status: 403 });
    const admin = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const text = String(body.body ?? "").trim().slice(0, 5000);
    if (!text) return NextResponse.json({ error: "코멘트를 적어 주세요." }, { status: 400 });

    const { data: sub } = await admin.from("mad_submissions").select("id, team_id, stage, title, status")
        .eq("id", String(body.submission_id ?? "")).eq("competition_id", id).maybeSingle();
    if (!sub || (a.role === "client" && sub.status !== "submitted")) return NextResponse.json({ error: "제출물을 찾을 수 없습니다." }, { status: 404 });

    const visible = body.visible_to_team !== false;
    const { error } = await admin.from("mad_submission_comments").insert({
        submission_id: sub.id, author_member_id: a.memberId, author_role: a.role, body: text, visible_to_team: visible,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const stage = sub.stage === "final" ? "본선" : "예선";
    await Promise.all([
        visible ? notify(await roundTeamMemberIds(id, sub.team_id), {
            brandId: "madleague", type: "mad_submission_comment",
            title: `[${a.role === "client" ? "클라이언트" : "운영진"} 코멘트] ${a.comp.title} · ${stage} 제출물`, message: text.slice(0, 120),
            link: `/madleague/pt/${id}?tab=submit`,
        }) : Promise.resolve(),
        a.role === "client" ? notify((await brandManagerIds("madleague")).filter(m => m !== a.memberId), {
            brandId: "madleague", type: "mad_submission_comment",
            title: `[클라이언트 코멘트] ${a.comp.title} · ${sub.title}`, message: text.slice(0, 120),
            link: `/madleague/pt/${id}?tab=works`,
        }) : Promise.resolve(),
    ]);
    return NextResponse.json({ ok: true });
}
