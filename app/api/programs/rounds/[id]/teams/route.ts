import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTeamScope, canRunTeam, canEditTeam, newInviteCode, type TeamScope } from "@/lib/programs/teams";
import { brandGroups, groupCandidates, GROUP_LABEL } from "@/lib/programs/brands";
import { hasProgramConsent } from "@/lib/programs/consent";
import { programRoomPath, programJoinPath } from "@/lib/programs/paths";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
interface TeamRow { id: string; name: string; description: string | null; invite_code: string | null; is_finalist: boolean; context: { club_id?: string } | null }

const deny = (msg = "권한이 없습니다.", status = 403) => NextResponse.json({ error: msg }, { status });
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

/** 운영 범위 그룹 (staff = 브랜드 전체) */
async function scopeGroups(s: TeamScope) {
    const all = await brandGroups(s.round.brand_id);
    return s.isStaff ? all : all.filter(g => s.groupIds.includes(g.id));
}

// GET — 팀 구성 보드: 운영(staff·운영진)은 범위 팀 + 미배정 후보, 팀원은 자기 팀만
export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const s = await getTeamScope(id);
    if (!s) return deny("로그인이 필요합니다.", 401);
    const runner = s.isStaff || s.groupIds.length > 0;
    if (!runner && !s.myTeamId) return deny("이 회차 팀원·운영진만 볼 수 있습니다.");

    const admin = createAdminClient();
    const groups = runner ? await scopeGroups(s) : [];
    const { data: allTeams } = await admin.from("program_teams")
        .select("id, name, description, invite_code, is_finalist, context").eq("round_id", id).order("created_at");
    const teams = ((allTeams ?? []) as TeamRow[]).filter(t => canRunTeam(s, t) || t.id === s.myTeamId);
    const teamIds = teams.map(t => t.id);

    const { data: parts } = await admin.from("program_participants").select("team_id, member_id, role").eq("round_id", id);
    const inRound = new Map(((parts ?? []) as { team_id: string | null; member_id: string; role: string }[]).map(p => [p.member_id, p]));
    const candidates = runner ? await groupCandidates(s.round.brand_id, groups.map(g => g.id), s.round.year) : [];
    // 미배정 = 그 해 활동 회원 중 아직 참가 안 한 사람 + (직원) 선발됐지만 팀이 없는 참가자
    const loose = s.isStaff ? [...inRound.values()].filter(p => !p.team_id).map(p => ({ member_id: p.member_id, group_id: null as string | null })) : [];
    const unassigned = [...loose, ...candidates.filter(c => !inRound.has(c.member_id))];

    const memberIds = [...new Set([
        ...((parts ?? []) as { team_id: string | null; member_id: string }[]).filter(p => p.team_id && teamIds.includes(p.team_id)).map(p => p.member_id),
        ...unassigned.map(c => c.member_id),
    ])];
    const { data: people } = memberIds.length
        ? await admin.from("members").select("id, name").in("id", memberIds)
        : { data: [] as { id: string; name: string | null }[] };
    const nameOf = new Map((people ?? []).map(p => [p.id, p.name ?? "이름 없음"]));

    return NextResponse.json({
        round: { id: s.round.id, title: s.round.title, status: s.round.status, mode: s.round.mode, year: s.round.year, brand_id: s.round.brand_id },
        me: { isStaff: s.isStaff, runner, myTeamId: s.myTeamId, myRole: s.myRole, open: s.open,
            consent: s.isStaff || runner ? true : await hasProgramConsent(s.memberId, s.round.brand_id) },
        groupLabel: GROUP_LABEL[s.round.brand_id] ?? "그룹",
        groups,
        teams: teams.map(t => {
            const editable = canEditTeam(s, t);
            return {
                id: t.id, name: t.name, description: t.description, is_finalist: t.is_finalist,
                group_id: t.context?.club_id ?? null,
                canRun: canRunTeam(s, t), canEdit: editable,
                invite_path: editable && t.invite_code ? programJoinPath(s.round, t.invite_code) : null,
                members: ((parts ?? []) as { team_id: string | null; member_id: string; role: string }[])
                    .filter(p => p.team_id === t.id)
                    .sort((a, b) => (a.role === "leader" ? -1 : 1) - (b.role === "leader" ? -1 : 1))
                    .map(p => ({ member_id: p.member_id, name: nameOf.get(p.member_id) ?? "이름 없음", role: p.role })),
            };
        }),
        unassigned: unassigned.map(c => ({ member_id: c.member_id, group_id: c.group_id, name: nameOf.get(c.member_id) ?? "이름 없음" })),
    });
}

// POST — create_team · rename · assign(이동·해제) · set_leader · invite(발급·재발급·끄기) · delete_team
export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const s = await getTeamScope(id);
    if (!s) return deny("로그인이 필요합니다.", 401);
    if (s.round.mode !== "team") return deny("팀 참가 회차가 아닙니다.", 400);
    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const teamOf = async (teamId: unknown) => {
        if (!isUuid(teamId)) return null;
        const { data } = await admin.from("program_teams").select("id, name, description, invite_code, is_finalist, context").eq("id", teamId).eq("round_id", id).maybeSingle();
        return data as TeamRow | null;
    };
    const room = programRoomPath(s.round);

    switch (body.action) {
        case "create_team": {
            const groupId = String(body.group_id ?? "");
            if (!s.isStaff && !(s.open && s.groupIds.includes(groupId))) return deny();
            const name = String(body.name ?? "").trim().slice(0, 60);
            if (!name) return deny("팀 이름을 적어 주세요.", 400);
            const { data, error } = await admin.from("program_teams")
                .insert({ brand_id: s.round.brand_id, round_id: id, name, context: groupId ? { club_id: groupId } : {} }).select("id").single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true, id: data.id });
        }

        case "rename": {
            const team = await teamOf(body.team_id);
            if (!team) return deny("팀을 찾을 수 없습니다.", 404);
            if (!canEditTeam(s, team)) return deny("팀장·운영진만 고칠 수 있습니다.");
            const name = String(body.name ?? "").trim().slice(0, 60);
            if (!name) return deny("팀 이름을 적어 주세요.", 400);
            const description = String(body.description ?? "").trim().slice(0, 300) || null;
            const { error } = await admin.from("program_teams").update({ name, description, updated_at: now }).eq("id", team.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        case "assign": {
            // team_id = null → 배정 해제 / 그 외 → 그 팀으로 (이동 포함)
            if (!isUuid(body.member_id)) return deny("회원을 선택하세요.", 400);
            const memberId = body.member_id;
            const { data: cur } = await admin.from("program_participants").select("id, team_id, role, joined_via").eq("round_id", id).eq("member_id", memberId).maybeSingle();
            const curTeam = cur?.team_id ? await teamOf(cur.team_id) : null;
            if (cur && curTeam && !canRunTeam(s, curTeam)) return deny("다른 팀에 이미 소속된 회원입니다.", 409);

            if (body.team_id === null) {
                if (!cur) return NextResponse.json({ ok: true });
                if (!curTeam && !s.isStaff) return deny();
                // 신청으로 선발된 참가자는 참가 자격을 남기고 팀만 뺀다
                const { error } = cur.joined_via === "apply"
                    ? await admin.from("program_participants").update({ team_id: null, role: "member" }).eq("id", cur.id)
                    : await admin.from("program_participants").delete().eq("id", cur.id);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ ok: true });
            }

            const team = await teamOf(body.team_id);
            if (!team) return deny("팀을 찾을 수 없습니다.", 404);
            if (!canRunTeam(s, team)) return deny();
            if (!cur && !s.isStaff) {
                // 운영진은 자기 그룹의 그 해 활동 회원만 넣는다 (그 외는 초대 링크로)
                const cands = await groupCandidates(s.round.brand_id, [team.context?.club_id ?? ""], s.round.year);
                if (!cands.some(c => c.member_id === memberId)) return deny("이 동아리 활동 회원만 배정할 수 있습니다. 그 외 인원은 초대 링크를 보내 주세요.");
            }
            if (cur?.team_id === team.id) return NextResponse.json({ ok: true });
            const { error } = cur
                ? await admin.from("program_participants").update({ team_id: team.id, role: "member" }).eq("id", cur.id)
                : await admin.from("program_participants").insert({
                    brand_id: s.round.brand_id, round_id: id, team_id: team.id, member_id: memberId,
                    role: "member", joined_via: s.isStaff ? "staff" : "officer",
                });
            if (error) return NextResponse.json({ error: error.code === "23505" ? "이 회차에 이미 참가 중인 회원입니다." : error.message }, { status: error.code === "23505" ? 409 : 500 });
            await notify([memberId], { brandId: s.round.brand_id, type: "program_team", title: `${s.round.title} · ${team.name} 팀에 배정되었습니다`, message: "회차 방에서 공지·Q&A를 확인하고 제출을 준비하세요.", link: room });
            return NextResponse.json({ ok: true });
        }

        case "set_leader": {
            const team = await teamOf(body.team_id);
            if (!team) return deny("팀을 찾을 수 없습니다.", 404);
            if (!canRunTeam(s, team)) return deny();
            if (!isUuid(body.member_id)) return deny("회원을 선택하세요.", 400);
            const { data: target } = await admin.from("program_participants").select("id").eq("team_id", team.id).eq("member_id", body.member_id).maybeSingle();
            if (!target) return deny("이 팀 팀원이 아닙니다.", 400);
            await admin.from("program_participants").update({ role: "member" }).eq("team_id", team.id).eq("role", "leader");
            const { error } = await admin.from("program_participants").update({ role: "leader" }).eq("id", target.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            await notify([body.member_id], { brandId: s.round.brand_id, type: "program_team", title: `${team.name} 팀장으로 지정되었습니다`, message: "팀 관리에서 팀 이름을 정하고 초대 링크를 보낼 수 있습니다.", link: room });
            return NextResponse.json({ ok: true });
        }

        case "invite": {
            // on=true → 발급(이미 있으면 새로 발급) / on=false → 링크 끄기
            const team = await teamOf(body.team_id);
            if (!team) return deny("팀을 찾을 수 없습니다.", 404);
            if (!canEditTeam(s, team)) return deny("팀장·운영진만 초대 링크를 만들 수 있습니다.");
            const code = body.on === false ? null : newInviteCode();
            const { error } = await admin.from("program_teams").update({ invite_code: code, updated_at: now }).eq("id", team.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true, invite_path: code ? programJoinPath(s.round, code) : null });
        }

        case "delete_team": {
            const team = await teamOf(body.team_id);
            if (!team) return deny("팀을 찾을 수 없습니다.", 404);
            if (!canRunTeam(s, team)) return deny();
            const [{ count: members }, { count: subs }] = await Promise.all([
                admin.from("program_participants").select("id", { count: "exact", head: true }).eq("team_id", team.id),
                admin.from("program_submissions").select("id", { count: "exact", head: true }).eq("team_id", team.id),
            ]);
            if (members || subs) return deny("팀원이나 제출물이 있는 팀은 지울 수 없습니다. 팀원을 먼저 빼 주세요.", 400);
            const { error } = await admin.from("program_teams").delete().eq("id", team.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        default:
            return deny("알 수 없는 작업입니다.", 400);
    }
}
