/**
 * 인트라 프로그램 회차 상세 (코어) — 직원 전용 · docs/Program_Module.md
 *   GET   /api/intra/programs/rounds/{id}   회차 · 팀(팀원 이름) · 결과 · 제출물 · 연결 폼 응답(배정 후보) · 브랜드 후보 · 클라이언트
 *   PATCH /api/intra/programs/rounds/{id}   회차 정보 수정
 *   POST  /api/intra/programs/rounds/{id}   { action } — add_team · update_team · delete_team · add_member · remove_member · set_finalist
 *                                           set_result · add_client · remove_client · publish_results{on} · logo_upload{name}
 * 결과 발표(results_published_at) 전에는 결과가 공개 화면(명예의 전당·포트폴리오 등)에 보이지 않는다 (RLS)
 * 클라이언트 = member_capability_roles (showcase, {주인 brand}, host, {type:'corporate', round_id, company})
 * 참가자 키 = members.id (데이터 계약 1조) · 한 회차 한 사람 한 번 (program_participants UNIQUE)
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { roundClientIds, roundParticipantIds } from "@/lib/programs/access";
import { programRoomPath, PROGRAM_PUBLIC_PATHS } from "@/lib/programs/paths";
import { brandCandidates, brandGroups, GROUP_LABEL } from "@/lib/programs/brands";

type Params = { params: Promise<{ id: string }> };
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];
const KINDS = ["competition", "project", "program", "course"];
const EDITABLE = ["title", "year", "kind", "mode", "channels", "client_name", "client_logo_url", "brief_title", "brief_content", "start_date", "end_date", "final_deadline", "presentation_date", "status", "form_id"] as const;

export async function GET(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const admin = createAdminClient();

    const { data: round, error } = await admin.from("program_rounds").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!round) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });
    const brand = round.brand_id as string;

    const [{ data: teams }, { data: results }, groups, { data: forms }, { data: parts }, { data: subs }, candidates, clientIds, { data: sites }] = await Promise.all([
        admin.from("program_teams").select("id, name, description, is_finalist, context").eq("round_id", id).order("created_at"),
        admin.from("program_results").select("id, team_id, rank, award_name, feedback").eq("round_id", id),
        brandGroups(brand),
        admin.from("forms").select("id, title, status").eq("brand_id", brand).order("created_at", { ascending: false }),
        admin.from("program_participants").select("team_id, member_id, role").eq("round_id", id),
        admin.from("program_submissions").select("team_id, stage, title, status, file_name, presentation_url, submitted_at, updated_at").eq("round_id", id),
        brandCandidates(brand),
        roundClientIds(id),
        admin.from("ums_sites").select("slug, name").order("name"),
    ]);

    // 배정 후보: 연결 폼의 로그인 응답자 + 브랜드 후보
    const { data: responses } = round.form_id
        ? await admin.from("form_responses").select("id, member_id, status").eq("form_id", round.form_id).neq("status", "cancelled").not("member_id", "is", null)
        : { data: [] as { id: string; member_id: string | null; status: string }[] };

    const memberIds = [...new Set([
        ...clientIds,
        ...(parts ?? []).map(p => p.member_id),
        ...(responses ?? []).map(r => r.member_id as string),
        ...candidates.map(c => c.member_id),
    ])];
    const { data: people } = memberIds.length
        ? await admin.from("members").select("id, name, email").in("id", memberIds)
        : { data: [] as { id: string; name: string | null; email: string | null }[] };
    const person = new Map((people ?? []).map(p => [p.id, p]));
    const groupName = new Map(groups.map(g => [g.id, g.name]));
    const groupOf = new Map(candidates.map(c => [c.member_id, c.group_id ? groupName.get(c.group_id) ?? null : null]));
    const label = (mid: string) => ({ member_id: mid, name: person.get(mid)?.name ?? "(이름 없음)", email: person.get(mid)?.email ?? null, club: groupOf.get(mid) ?? null });

    return NextResponse.json({
        round,
        groupLabel: GROUP_LABEL[brand] ?? null,
        groups,
        forms: forms ?? [],
        sites: sites ?? [],
        teams: (teams ?? []).map(t => ({
            id: t.id, name: t.name, description: t.description, is_finalist: t.is_finalist,
            group_id: (t.context as { club_id?: string } | null)?.club_id ?? null,
            members: (parts ?? []).filter(p => p.team_id === t.id).map(p => ({ ...label(p.member_id), role: p.role })),
            result: (results ?? []).find(r => r.team_id === t.id) ?? null,
            submissions: (subs ?? []).filter(s => s.team_id === t.id),
        })),
        applicants: (responses ?? []).map(r => ({ ...label(r.member_id as string), response_id: r.id, response_status: r.status })),
        candidates: candidates.map(c => label(c.member_id)),
        clients: clientIds.map(label),
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
    if ("kind" in patch && !KINDS.includes(String(patch.kind))) return NextResponse.json({ error: "유형 값이 올바르지 않습니다." }, { status: 400 });
    if ("mode" in patch && !["team", "individual"].includes(String(patch.mode))) return NextResponse.json({ error: "참가 방식이 올바르지 않습니다." }, { status: 400 });
    if ("channels" in patch) {
        if (!Array.isArray(patch.channels) || !patch.channels.every(c => typeof c === "string")) return NextResponse.json({ error: "창구 값이 올바르지 않습니다." }, { status: 400 });
    }
    if ("year" in patch) patch.year = Number(patch.year);
    patch.updated_at = new Date().toISOString();

    const { error } = await createAdminClient().from("program_rounds").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();
    const { data: round } = await admin.from("program_rounds").select("id, brand_id, channels, title, kind, client_name, final_deadline").eq("id", id).maybeSingle();
    if (!round) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });
    const brand = round.brand_id as string;

    // 팀은 이 회차 소속인지 항상 확인
    const teamOfRound = async (teamId: unknown) => {
        if (typeof teamId !== "string") return null;
        const { data } = await admin.from("program_teams").select("id, name, context").eq("id", teamId).eq("round_id", id).maybeSingle();
        return data;
    };
    const groupCtx = (groupId: unknown) => (typeof groupId === "string" && groupId ? { club_id: groupId } : {});

    switch (body.action) {
        case "add_team": {
            const name = String(body.name ?? "").trim();
            if (!name) return NextResponse.json({ error: "팀 이름이 필요합니다." }, { status: 400 });
            const { error } = await admin.from("program_teams").insert({ brand_id: brand, round_id: id, name, context: groupCtx(body.group_id) });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "update_team": {
            const team = await teamOfRound(body.team_id);
            if (!team) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const name = String(body.name ?? "").trim();
            if (!name) return NextResponse.json({ error: "팀 이름이 필요합니다." }, { status: 400 });
            const context = { ...((team.context as object) ?? {}), ...groupCtx(body.group_id) };
            if (!body.group_id) delete (context as { club_id?: string }).club_id;
            const { error } = await admin.from("program_teams").update({ name, context, updated_at: new Date().toISOString() }).eq("id", team.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "delete_team": {
            if (!(await teamOfRound(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const { error } = await admin.from("program_teams").delete().eq("id", body.team_id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "add_member": {
            if (!(await teamOfRound(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            if (typeof body.member_id !== "string") return NextResponse.json({ error: "회원을 선택하세요." }, { status: 400 });
            const role = body.role === "leader" ? "leader" : "member";
            // 한 회차에 한 사람 한 번 — DB UNIQUE(round_id, member_id)
            const { error } = await admin.from("program_participants").insert({ brand_id: brand, round_id: id, team_id: body.team_id, member_id: body.member_id, role, joined_via: "staff" });
            if (error) {
                if (error.code === "23505") return NextResponse.json({ error: "이미 이 회차의 다른 팀에 배정된 회원입니다." }, { status: 409 });
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            break;
        }
        case "remove_member": {
            if (!(await teamOfRound(body.team_id))) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const { error } = await admin.from("program_participants").delete().eq("round_id", id).eq("team_id", body.team_id).eq("member_id", body.member_id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "set_finalist": {
            const team = await teamOfRound(body.team_id);
            if (!team) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const on = body.is_finalist === true;
            const { error } = await admin.from("program_teams").update({ is_finalist: on, updated_at: new Date().toISOString() }).eq("id", team.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            if (on) {
                await notify(await roundParticipantIds(id, team.id), {
                    brandId: brand, type: "program_finalist",
                    title: `${round.title} · ${team.name} 본선 진출`,
                    message: round.final_deadline ? `본선 제출 마감 ${round.final_deadline}` : "회차 방에서 본선 제출물을 올려 주세요.",
                    link: programRoomPath(round, "submit"),
                });
            }
            break;
        }
        case "add_client": {
            const email = String(body.email ?? "").trim().toLowerCase();
            if (!email) return NextResponse.json({ error: "클라이언트 담당자 이메일을 적어 주세요." }, { status: 400 });
            const { data: m } = await admin.from("members").select("id").ilike("email", email).limit(1).maybeSingle();
            if (!m) return NextResponse.json({ error: "이 이메일로 가입한 Ten:One ID가 없습니다. 담당자가 먼저 가입해야 합니다." }, { status: 404 });
            if ((await roundClientIds(id)).includes(m.id)) return NextResponse.json({ error: "이미 연결된 클라이언트입니다." }, { status: 409 });
            const { error } = await admin.from("member_capability_roles").insert({
                member_id: m.id, brand_id: brand, capability_key: "showcase", role: "host",
                context: { type: "corporate", round_id: id, company: round.client_name ?? null },
            });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            await notify([m.id], { brandId: brand, type: "program_client", title: `${round.title} 클라이언트로 초대되었습니다`, message: "공지·Q&A·제출물을 확인하고 의견을 남길 수 있습니다.", link: programRoomPath(round) });
            break;
        }
        case "remove_client": {
            // 이력 보존 — 역할을 지우지 않고 종료일만 (§1.6.1)
            const { error } = await admin.from("member_capability_roles").update({ valid_until: new Date().toISOString() })
                .eq("member_id", String(body.member_id ?? "")).eq("capability_key", "showcase").eq("role", "host")
                .eq("context->>round_id", id).is("valid_until", null);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        case "publish_results": {
            const on = body.on === true;
            if (on) {
                const { count } = await admin.from("program_results").select("id", { count: "exact", head: true }).eq("round_id", id);
                if (!count) return NextResponse.json({ error: "발표할 결과가 없습니다. 팀별 순위·상을 먼저 저장하세요." }, { status: 400 });
            }
            const { error } = await admin.from("program_rounds")
                .update({ results_published_at: on ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            for (const site of new Set([brand, ...(round.channels ?? [])])) for (const p of PROGRAM_PUBLIC_PATHS[site] ?? []) revalidatePath(p);
            if (on) {
                const [people, clients] = await Promise.all([roundParticipantIds(id), roundClientIds(id)]);
                const hall = brand === "madleague" && round.kind === "competition";
                await notify([...people, ...clients], {
                    brandId: brand, type: "program_results",
                    title: `${round.title} 결과 발표`,
                    message: hall ? "명예의 전당과 내 포트폴리오에 반영되었습니다." : "내 활동 이력에 반영되었습니다.",
                    link: hall ? "/madleague/programs/competition" : programRoomPath(round),
                });
            }
            break;
        }
        case "logo_upload": {
            // 클라이언트 로고 — 공개 버킷 board-assets (공개 화면 노출용). 브라우저가 서명 URL로 직접 올린 뒤 PATCH client_logo_url
            const ext = String(body.name ?? "").split(".").pop()?.toLowerCase() ?? "";
            if (!["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return NextResponse.json({ error: "로고는 png·jpg·webp·svg만 올릴 수 있습니다." }, { status: 400 });
            const path = `programs/${brand}/${id}/logo-${Date.now()}.${ext}`;
            const { data, error } = await admin.storage.from("board-assets").createSignedUploadUrl(path);
            if (error || !data) return NextResponse.json({ error: "업로드 준비에 실패했습니다." }, { status: 500 });
            const publicUrl = admin.storage.from("board-assets").getPublicUrl(path).data.publicUrl;
            return NextResponse.json({ path: data.path, token: data.token, bucket: "board-assets", publicUrl });
        }
        case "set_result": {
            const team = await teamOfRound(body.team_id);
            if (!team) return NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 });
            const rank = body.rank === null || body.rank === "" ? null : Number(body.rank);
            if (rank !== null && (!Number.isInteger(rank) || rank < 1 || rank > 99)) return NextResponse.json({ error: "순위는 1 이상의 숫자입니다." }, { status: 400 });
            const award_name = String(body.award_name ?? "").trim() || null;
            const feedback = String(body.feedback ?? "").trim() || null;
            const { data: existing } = await admin.from("program_results").select("id").eq("round_id", id).eq("team_id", team.id).maybeSingle();
            if (rank === null && !award_name && !feedback) {
                if (existing) await admin.from("program_results").delete().eq("id", existing.id);
                break;
            }
            // 결과 = 발표 기록 스냅샷 (팀 이름·소속). 경쟁 PT에는 MAD Crown을 쓰지 않는다 — 순위만
            const row = { brand_id: brand, round_id: id, team_id: team.id, team_name: team.name, context: team.context ?? {}, rank, award_name, feedback, updated_at: new Date().toISOString() };
            const { error } = existing
                ? await admin.from("program_results").update(row).eq("id", existing.id)
                : await admin.from("program_results").insert(row);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            break;
        }
        default:
            return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
}
