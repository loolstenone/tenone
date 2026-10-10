/**
 * 동아리 소개 페이지 편집 — mad_clubs.profile (+ 한 줄 소개 description · 창립 연도 established_year)
 *   GET /api/madleague/clubs/{slug}/profile   편집용 현재 값 (운영진·직원)
 *   PUT /api/madleague/clubs/{slug}/profile   { description, established_year, profile } — 서버 검증 후 저장
 *
 * 권한: 직원 · 해당 동아리 운영진 전원 · (옛) 회장 — lib/madleague-roles.ts canEditClubProfile
 * 동아리명·지역·로고·대표색은 직원만 (인트라) — 여기서 바꾸지 않는다
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditClubProfile, getMadAccess } from "@/lib/madleague-roles";
import { sanitizeClubProfile } from "@/lib/madleague-club-profile";

export const runtime = "nodejs";
type Params = { params: Promise<{ slug: string }> };

async function context(slug: string) {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
    const admin = createAdminClient();
    const { data: me } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (!me) return { error: NextResponse.json({ error: "회원 정보가 없습니다." }, { status: 403 }) };
    const { data: club } = await admin.from("mad_clubs")
        .select("id, slug, name, president_member_id, description, established_year, profile, profile_updated_at")
        .eq("slug", slug).maybeSingle();
    if (!club) return { error: NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 }) };
    const access = await getMadAccess(me.id);
    if (!canEditClubProfile(access, me.id, club)) {
        return { error: NextResponse.json({ error: "이 동아리 운영진만 고칠 수 있습니다." }, { status: 403 }) };
    }
    return { admin, me, club };
}

export async function GET(_req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { club } = c;
    return NextResponse.json({
        description: club.description ?? "",
        established_year: club.established_year ?? null,
        profile: club.profile ?? {},
        updated_at: club.profile_updated_at,
    });
}

export async function PUT(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await context(slug);
    if ("error" in c) return c.error;
    const { admin, me, club } = c;

    const body = await req.json().catch(() => null) as { description?: unknown; established_year?: unknown; profile?: unknown } | null;
    if (!body) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

    const { profile, errors } = sanitizeClubProfile(body.profile);
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 200) || null : null;
    let established: number | null = null;
    if (body.established_year !== null && body.established_year !== undefined && body.established_year !== "") {
        const y = Number(body.established_year);
        if (!Number.isInteger(y) || y < 1950 || y > new Date().getFullYear()) errors.push("창립 연도를 확인해 주세요");
        else established = y;
    }
    if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

    const { error } = await admin.from("mad_clubs").update({
        description,
        established_year: established,
        profile,
        profile_updated_at: new Date().toISOString(),
        profile_updated_by: me.id,
    }).eq("id", club.id);
    if (error) {
        console.error("[club profile] update failed", error);
        return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
    }

    revalidatePath(`/madleague/clubs/${club.slug}`);
    return NextResponse.json({ ok: true, profile });
}
