import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sessionMemberId } from "@/lib/programs/access";
import { hasProgramConsent, recordProgramConsent } from "@/lib/programs/consent";
import { programRoomPath } from "@/lib/programs/paths";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

/** 초대 코드 → 팀·회차 (모집 예정·진행 중 팀 회차만) */
async function lookup(code: unknown) {
    if (typeof code !== "string" || !/^[A-Za-z0-9]{6,20}$/.test(code)) return null;
    const admin = createAdminClient();
    const { data: team } = await admin.from("program_teams").select("id, name, round_id").eq("invite_code", code).maybeSingle();
    if (!team) return null;
    const { data: round } = await admin.from("program_rounds").select("id, brand_id, channels, title, kind, mode, status").eq("id", team.round_id).single();
    if (!round) return null;
    const { data: site } = await admin.from("ums_sites").select("name").eq("slug", round.brand_id).maybeSingle();
    return { team, round, brandName: (site as { name: string } | null)?.name ?? round.brand_id };
}

// GET ?code= — 초대 미리보기 (로그인 불필요: 회차·팀 이름만)
export async function GET(req: NextRequest) {
    const hit = await lookup(req.nextUrl.searchParams.get("code"));
    if (!hit) return NextResponse.json({ error: "만료되었거나 잘못된 초대 링크입니다." }, { status: 404 });
    const { team, round, brandName } = hit;
    const open = round.mode === "team" && (round.status === "upcoming" || round.status === "ongoing");
    const memberId = await sessionMemberId();
    let state: "login" | "joined" | "other_team" | "ready" = "login";
    let consent = false;
    if (memberId) {
        const { data: cur } = await createAdminClient().from("program_participants").select("team_id").eq("round_id", round.id).eq("member_id", memberId).maybeSingle();
        state = !cur ? "ready" : cur.team_id === team.id ? "joined" : "other_team";
        consent = await hasProgramConsent(memberId, round.brand_id);
    }
    return NextResponse.json({
        round: { title: round.title, kind: round.kind, brand_id: round.brand_id, brand_name: brandName },
        team: { name: team.name }, open, state, consent, room: programRoomPath(round),
    });
}

// POST { code, consent } — 팀 합류 (주인 브랜드 참가 동의 함께 기록)
export async function POST(req: NextRequest) {
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const hit = await lookup(body.code);
    if (!hit) return NextResponse.json({ error: "만료되었거나 잘못된 초대 링크입니다." }, { status: 404 });
    const { team, round } = hit;
    if (round.mode !== "team" || !(round.status === "upcoming" || round.status === "ongoing")) {
        return NextResponse.json({ error: "팀 모집이 끝난 회차입니다." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data: cur } = await admin.from("program_participants").select("team_id").eq("round_id", round.id).eq("member_id", memberId).maybeSingle();
    if (cur?.team_id === team.id) return NextResponse.json({ ok: true, room: programRoomPath(round) });
    if (cur) return NextResponse.json({ error: "이 회차에 이미 다른 팀으로 참가 중입니다. 팀을 옮기려면 운영진에게 요청하세요." }, { status: 409 });
    if (!(await hasProgramConsent(memberId, round.brand_id))) {
        if (body.consent !== true) return NextResponse.json({ error: "참가 동의가 필요합니다." }, { status: 400 });
        const { error } = await recordProgramConsent(memberId, round.brand_id);
        if (error) return NextResponse.json({ error }, { status: 500 });
    }

    const { error } = await admin.from("program_participants").insert({
        brand_id: round.brand_id, round_id: round.id, team_id: team.id, member_id: memberId, role: "member", joined_via: "invite",
    });
    if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "이 회차에 이미 다른 팀으로 참가 중입니다. 팀을 옮기려면 운영진에게 요청하세요." }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data: leaders } = await admin.from("program_participants").select("member_id").eq("team_id", team.id).eq("role", "leader");
    const { data: me } = await admin.from("members").select("name").eq("id", memberId).maybeSingle();
    await notify((leaders ?? []).map((l: { member_id: string }) => l.member_id), {
        brandId: round.brand_id, type: "program_team",
        title: `${team.name} 팀에 새 팀원이 합류했습니다`, message: `${me?.name ?? "새 팀원"} · 초대 링크`, link: programRoomPath(round),
    });
    return NextResponse.json({ ok: true, room: programRoomPath(round) });
}
