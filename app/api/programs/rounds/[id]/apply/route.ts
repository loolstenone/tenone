import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sessionMemberId } from "@/lib/programs/access";
import { hasProgramConsent, recordProgramConsent } from "@/lib/programs/consent";
import { brandManagerIds, notify } from "@/lib/notify";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

async function loadRound(id: string) {
    if (!isUuid(id)) return null;
    const admin = createAdminClient();
    const { data: round } = await admin.from("program_rounds")
        .select("id, brand_id, channels, title, kind, mode, status, applications_open").eq("id", id).maybeSingle();
    if (!round) return null;
    const { data: site } = await admin.from("ums_sites").select("name").eq("slug", round.brand_id).maybeSingle();
    return { ...round, brand_name: (site as { name: string } | null)?.name ?? round.brand_id };
}
const isOpen = (r: { applications_open: boolean; status: string }) => r.applications_open && (r.status === "upcoming" || r.status === "ongoing");

// GET — 신청 상태 (로그인 전에도 회차 기본 정보는 응답)
export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const round = await loadRound(id);
    if (!round) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });
    const base = { round: { title: round.title, kind: round.kind, brand_id: round.brand_id, brand_name: round.brand_name }, open: isOpen(round) };
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ ...base, state: "login", consent: false });
    const admin = createAdminClient();
    const [{ data: part }, { data: app }, consent] = await Promise.all([
        admin.from("program_participants").select("id").eq("round_id", id).eq("member_id", memberId).maybeSingle(),
        admin.from("program_applications").select("status").eq("round_id", id).eq("member_id", memberId).maybeSingle(),
        hasProgramConsent(memberId, round.brand_id),
    ]);
    const state = part ? "participant" : (app?.status && app.status !== "withdrawn" ? app.status : "none");
    return NextResponse.json({ ...base, state, consent });
}

// POST { motivation, portfolio_url?, consent, channel } — 참가 신청
export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const round = await loadRound(id);
    if (!round) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });
    if (!isOpen(round)) return NextResponse.json({ error: "신청을 받지 않는 회차입니다." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const motivation = String(body.motivation ?? "").trim().slice(0, 1000);
    if (motivation.length < 10) return NextResponse.json({ error: "지원 동기를 10자 이상 적어 주세요." }, { status: 400 });
    const urlRaw = String(body.portfolio_url ?? "").trim();
    if (urlRaw && !/^https:\/\/\S+$/i.test(urlRaw)) return NextResponse.json({ error: "포트폴리오 링크는 https:// 주소여야 합니다." }, { status: 400 });
    const channel = typeof body.channel === "string" && (round.channels ?? []).includes(body.channel) ? body.channel : round.brand_id;

    const admin = createAdminClient();
    const [{ data: part }, { data: prev }] = await Promise.all([
        admin.from("program_participants").select("id").eq("round_id", id).eq("member_id", memberId).maybeSingle(),
        admin.from("program_applications").select("id, status").eq("round_id", id).eq("member_id", memberId).maybeSingle(),
    ]);
    if (part) return NextResponse.json({ error: "이미 이 회차 참가자입니다." }, { status: 409 });
    if (prev && prev.status !== "withdrawn") return NextResponse.json({ error: prev.status === "declined" ? "이번 회차는 선발되지 않았습니다." : "이미 신청했습니다." }, { status: 409 });

    if (!(await hasProgramConsent(memberId, round.brand_id))) {
        if (body.consent !== true) return NextResponse.json({ error: "참가 동의가 필요합니다." }, { status: 400 });
        const { error } = await recordProgramConsent(memberId, round.brand_id);
        if (error) return NextResponse.json({ error }, { status: 500 });
    }
    const row = { motivation, portfolio_url: urlRaw || null, channel, status: "pending", decided_at: null, decided_by: null, updated_at: new Date().toISOString() };
    const { error } = prev
        ? await admin.from("program_applications").update(row).eq("id", prev.id)
        : await admin.from("program_applications").insert({ brand_id: round.brand_id, round_id: id, member_id: memberId, ...row });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await notify(await brandManagerIds(round.brand_id), {
        brandId: round.brand_id, type: "program_application",
        title: `[신청] ${round.title}`, message: channel !== round.brand_id ? `창구: ${channel}` : null,
        link: `/intra/ums/programs/${id}`,
    });
    return NextResponse.json({ ok: true });
}

// DELETE — 심사 전 신청 취소
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (!isUuid(id)) return NextResponse.json({ error: "회차를 찾을 수 없습니다." }, { status: 404 });
    const { error } = await createAdminClient().from("program_applications")
        .update({ status: "withdrawn", updated_at: new Date().toISOString() })
        .eq("round_id", id).eq("member_id", memberId).eq("status", "pending");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
