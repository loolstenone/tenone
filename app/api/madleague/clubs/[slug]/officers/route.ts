/**
 * 동아리 운영진 — 회장·부회장·총무 등 최대 5명, 임기(연간·학기)
 *   GET /api/madleague/clubs/{slug}/officers[?q=검색어]   운영진 · 이력 · 지정 후보 (운영진·직원만)
 *   PUT /api/madleague/clubs/{slug}/officers               { term, term_unit?, officers:[{member_id, position}] } — 새 명단 저장(이전 임기 자동 종료)
 *
 * 지정 권한: 직원(처음 지정) · 해당 동아리 회장·부회장 (이후) — lib/madleague-roles.ts canManageClubOfficers
 * 후보: 회장단은 이 동아리 현역·운영진만, 직원은 전체 회원 검색(?q=)
 * 이름·이메일은 members에서 읽어 보여줄 뿐 복사하지 않는다 (데이터 계약 1조)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    canManageClubOfficers, getClubOfficers, getMadAccess, nextTermLabel, officerClubIds,
    saveClubOfficers, termLabel, type TermUnit,
} from "@/lib/madleague-roles";

export const runtime = "nodejs";
type Params = { params: Promise<{ slug: string }> };

async function context(slug: string) {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
    const admin = createAdminClient();
    const { data: me } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (!me) return { error: NextResponse.json({ error: "회원 정보가 없습니다." }, { status: 403 }) };
    const { data: club } = await admin.from("mad_clubs").select("id, slug, name, term_unit").eq("slug", slug).maybeSingle();
    if (!club) return { error: NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 }) };
    const access = await getMadAccess(me.id);
    return { admin, me, club, access };
}

/** 이 동아리 현역·운영진 회원 id */
async function clubMemberIds(admin: ReturnType<typeof createAdminClient>, clubId: string): Promise<string[]> {
    const { data } = await admin.from("member_capability_roles").select("member_id")
        .eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"])
        .eq("context->>club_id", clubId).is("valid_until", null);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

export async function GET(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { admin, club, access } = c;
    const canView = access.isStaff || officerClubIds(access).includes(club.id);
    if (!canView) return NextResponse.json({ error: "이 동아리 운영진만 볼 수 있습니다." }, { status: 403 });
    const canManage = canManageClubOfficers(access, club.id);

    const [officers, history] = await Promise.all([getClubOfficers(club.id), getClubOfficers(club.id, { history: true })]);

    // 후보: 회장단 = 이 동아리 현역·운영진 / 직원 = 검색어로 전체 회원
    let candidateIds: string[] = canManage ? await clubMemberIds(admin, club.id) : [];
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (access.isStaff && q && q.length >= 2) {
        const safe = q.replace(/[%,()]/g, "");
        const { data } = await admin.from("members").select("id").or(`name.ilike.%${safe}%,email.ilike.%${safe}%`).limit(10);
        candidateIds = [...new Set([...candidateIds, ...(data ?? []).map((r: { id: string }) => r.id)])];
    }

    const ids = [...new Set([...officers, ...history].map(o => o.member_id).concat(candidateIds))];
    const { data: people } = ids.length
        ? await admin.from("members").select("id, name, email").in("id", ids)
        : { data: [] as { id: string; name: string | null; email: string | null }[] };
    const person = new Map((people ?? []).map(p => [p.id, p]));
    // 이메일은 직원에게만 (회장단에게는 이름만)
    const label = (id: string) => ({ member_id: id, name: person.get(id)?.name ?? "(이름 없음)", email: access.isStaff ? person.get(id)?.email ?? null : null });

    const unit = (club.term_unit ?? "year") as TermUnit;
    return NextResponse.json({
        club: { id: club.id, name: club.name, term_unit: unit },
        canManage,
        isStaff: access.isStaff,
        terms: { current: termLabel(unit), next: nextTermLabel(unit) },
        officers: officers.map(o => ({ ...label(o.member_id), position: o.position, term: o.term })),
        history: history.map(o => ({ ...label(o.member_id), position: o.position, term: o.term, valid_until: o.valid_until })),
        candidates: candidateIds.map(label),
    });
}

export async function PUT(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { admin, me, club, access } = c;
    if (!canManageClubOfficers(access, club.id)) {
        return NextResponse.json({ error: "운영진 지정은 이 동아리 회장·부회장 또는 MADLeague 운영진만 할 수 있습니다." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const officers = Array.isArray(body.officers) ? body.officers : [];
    const unit: TermUnit = body.term_unit === "semester" ? "semester" : body.term_unit === "year" ? "year" : (club.term_unit ?? "year");
    const term = String(body.term ?? termLabel(unit));
    if (unit === "year" ? !/^\d{4}$/.test(term) : !/^\d{4}-[12]$/.test(term)) {
        return NextResponse.json({ error: unit === "year" ? "연간 임기는 2026처럼 적습니다." : "학기 임기는 2026-1처럼 적습니다." }, { status: 400 });
    }

    // 회장단은 이 동아리 현역·운영진 중에서만 지정 (직원은 제한 없음 — 처음 지정)
    if (!access.isStaff) {
        const allowed = new Set(await clubMemberIds(admin, club.id));
        if (officers.some((o: { member_id?: string }) => !allowed.has(String(o.member_id)))) {
            return NextResponse.json({ error: "이 동아리 현역·운영진만 지정할 수 있습니다." }, { status: 400 });
        }
    }

    if (unit !== club.term_unit) await admin.from("mad_clubs").update({ term_unit: unit }).eq("id", club.id);
    const result = await saveClubOfficers(club.id, term, officers, me.id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
}
