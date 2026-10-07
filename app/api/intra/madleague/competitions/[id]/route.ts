/**
 * 인트라 경쟁 PT 회차 상세 — 직원 전용
 *   GET   /api/intra/madleague/competitions/{id}   회차 · 팀(팀원 이름) · 결과 · 연결 폼 응답(배정 후보) · 매드리거 후보
 *   PATCH /api/intra/madleague/competitions/{id}   회차 정보 수정
 *   POST  /api/intra/madleague/competitions/{id}   { action } — add_team · update_team · delete_team · add_member · remove_member · set_result
 *
 * 팀원 키 = members.id (데이터 계약 1조). 이름·이메일은 members에서 읽어 보여줄 뿐 복사하지 않는다.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };
const TENANT = "tenone";
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];
const EDITABLE = ["title", "year", "client_name", "brief_title", "brief_content", "start_date", "end_date", "presentation_date", "status", "form_id"] as const;

export async function GET(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const admin = createAdminClient();

    const { data: comp, error } = await admin.from("mad_competitions").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!comp) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });

    const [{ data: teams }, { data: results }, { data: clubs }, { data: forms }] = await Promise.all([
        admin.from("mad_competition_teams").select("id, name, club_id, description").eq("competition_id", id).order("created_at"),
        admin.from("mad_competition_results").select("id, team_id, rank, award_name, feedback").eq("competition_id", id),
        admin.from("mad_clubs").select("id, name").order("name"),
        admin.from("forms").select("id, title, status").eq("brand_id", "madleague").order("created_at", { ascending: false }),
    ]);
    const teamIds = (teams ?? []).map(t => t.id);
    const { data: links } = teamIds.length
        ? await admin.from("mad_team_members").select("team_id, member_id, role").in("team_id", teamIds)
        : { data: [] as { team_id: string; member_id: string; role: string }[] };
    // 팀 제출물 (파일은 /api/madleague/pt/submission 서명 URL로 내려받기)
    const { data: subs } = teamIds.length
        ? await admin.from("mad_submissions").select("team_id, title, status, file_name, presentation_url, submitted_at, updated_at").in("team_id", teamIds)
        : { data: [] as { team_id: string; title: string; status: string; file_name: string | null; presentation_url: string | null; submitted_at: string | null; updated_at: string }[] };

    // 배정 후보: 연결 폼의 로그인 응답자 + 현역·임원 매드리거
    const { data: responses } = comp.form_id
        ? await admin.from("form_responses").select("id, member_id, status, created_at").eq("form_id", comp.form_id).neq("status", "cancelled").not("member_id", "is", null)
        : { data: [] as { id: string; member_id: string | null; status: string; created_at: string }[] };
    const { data: capRows } = await admin.from("member_capability_roles").select("member_id, role, context")
        .eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"]).is("valid_until", null);

    const memberIds = [...new Set([
        ...(links ?? []).map(l => l.member_id),
        ...(responses ?? []).map(r => r.member_id as string),
        ...(capRows ?? []).map(r => r.member_id as string),
    ])];
    const { data: people } = memberIds.length
        ? await admin.from("members").select("id, name, email").in("id", memberIds)
        : { data: [] as { id: string; name: string | null; email: string | null }[] };
    const person = new Map((people ?? []).map(p => [p.id, p]));
    const clubName = new Map((clubs ?? []).map(c => [c.id, c.name]));
    const clubOf = new Map((capRows ?? []).map(r => [r.member_id as string, clubName.get((r.context as { club_id?: string } | null)?.club_id ?? "") ?? null]));
    const label = (mid: string) => ({ member_id: mid, name: person.get(mid)?.name ?? "(이름 없음)", email: person.get(mid)?.email ?? null, club: clubOf.get(mid) ?? null });

    return NextResponse.json({
        competition: comp,
        clubs: clubs ?? [],
        forms: forms ?? [],
        teams: (teams ?? []).map(t => ({
            ...t,
            members: (links ?? []).filter(l => l.team_id === t.id).map(l => ({ ...label(l.member_id), role: l.role })),
            result: (results ?? []).find(r => r.team_id === t.id) ?? null,
            submission: (subs ?? []).find(s => s.team_id === t.id) ?? null,
        })),
        applicants: (responses ?? []).map(r => ({ ...label(r.member_id as string), response_id: r.id, response_status: r.status })),
        madleaguers: [...new Set((capRows ?? []).map(r => r.member_id as string))].map(label),
    });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    for (const k of EDITABLE) {
        if (!(k in body)) continue;
        const v = body[k];
        patch[k] = typeof v === "string" ? (v.trim() || null) : v;
    }
    if ("title" in patch && !patch.title) return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
    if ("status" in patch && !STATUSES.includes(String(patch.status))) return NextResponse.json({ error: "상태 값이 올바르지 않습니다." }, { status: 400 });
    if ("year" in patch) patch.year = Number(patch.year);
    patch.updated_at = new Date().toISOString();

    const { error } = await createAdminClient().from("mad_competitions").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();

    // 팀은 이 회차 소속인지 항상 확인
    const teamOfComp = async (teamId: unknown) => {
        if (typeof teamId !== "string") return null;
        const { data } = await admin.from("mad_competition_teams").select("id, name, club_id").eq("id", teamId).eq("competition_id", id).maybeSingle();
        return data;
    };

    switch (body.action) {
        case "add_team": {
            const name = String(body.name ?? "").trim();
            if (!name) return NextResponse.json({ error: "팀 이름이 필요합니다." }, { status: 400 });
            const { error } = await admin.from("mad_competition_teams").insert({ tenant_id: TENANT, competition_id: id, name, club_id: body.club_id || null });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "update_team": {
            if (!(await teamOfComp(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const name = String(body.name ?? "").trim();
            if (!name) return NextResponse.json({ error: "팀 이름이 필요합니다." }, { status: 400 });
            const { error } = await admin.from("mad_competition_teams").update({ name, club_id: body.club_id || null, updated_at: new Date().toISOString() }).eq("id", body.team_id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "delete_team": {
            if (!(await teamOfComp(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const { error } = await admin.from("mad_competition_teams").delete().eq("id", body.team_id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "add_member": {
            if (!(await teamOfComp(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            if (typeof body.member_id !== "string") return NextResponse.json({ error: "회원을 선택하세요." }, { status: 400 });
            const role = body.role === "leader" ? "leader" : "member";
            // 한 회차에 한 팀만 — 다른 팀 소속이면 거절
            const { data: compTeams } = await admin.from("mad_competition_teams").select("id").eq("competition_id", id);
            const { data: already } = await admin.from("mad_team_members").select("team_id")
                .eq("member_id", body.member_id).in("team_id", (compTeams ?? []).map(t => t.id));
            if ((already ?? []).length) return NextResponse.json({ error: "이미 이 회차의 다른 팀에 배정된 회원입니다." }, { status: 409 });
            const { error } = await admin.from("mad_team_members").insert({ tenant_id: TENANT, team_id: body.team_id, member_id: body.member_id, role });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "remove_member": {
            if (!(await teamOfComp(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const { error } = await admin.from("mad_team_members").delete().eq("team_id", body.team_id).eq("member_id", body.member_id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "set_result": {
            const team = await teamOfComp(body.team_id);
            if (!team) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const rank = body.rank === null || body.rank === "" ? null : Number(body.rank);
            if (rank !== null && (!Number.isInteger(rank) || rank < 1 || rank > 99)) return NextResponse.json({ error: "순위는 1 이상의 숫자입니다." }, { status: 400 });
            const award_name = String(body.award_name ?? "").trim() || null;
            const feedback = String(body.feedback ?? "").trim() || null;
            const { data: existing } = await admin.from("mad_competition_results").select("id").eq("competition_id", id).eq("team_id", team.id).maybeSingle();
            if (rank === null && !award_name && !feedback) {
                if (existing) await admin.from("mad_competition_results").delete().eq("id", existing.id);
                break;
            }
            // 경쟁 PT에는 MAD Crown을 쓰지 않는다 → is_crown 항상 false
            const row = { tenant_id: TENANT, competition_id: id, team_id: team.id, team_name: team.name, club_id: team.club_id, rank, award_name, feedback, is_crown: false };
            const { error } = existing
                ? await admin.from("mad_competition_results").update(row).eq("id", existing.id)
                : await admin.from("mad_competition_results").insert(row);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        default:
            return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
}
