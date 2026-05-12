// Personal OS — Company 엔티티 CRUD
// 사용자의 협업 회사·고객사 관리. contacts는 company_id로 참조.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const includeArchived = url.searchParams.get("archived") === "1";

    const admin = createAdminClient();
    let query = admin
        .from("myverse_companies")
        .select("id, name, domain, industry, logo_url, notes, color, is_archived, created_at, updated_at")
        .eq("member_id", memberId);
    if (!includeArchived) query = query.eq("is_archived", false);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error } = await query.order("name", { ascending: true }).limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // contacts 카운트 (회사별 인원수)
    const { data: counts } = await admin
        .from("myverse_contacts")
        .select("company_id")
        .eq("member_id", memberId)
        .not("company_id", "is", null);
    const countMap = new Map<string, number>();
    for (const r of (counts ?? []) as Array<{ company_id: string }>) {
        countMap.set(r.company_id, (countMap.get(r.company_id) ?? 0) + 1);
    }
    const enriched = (data ?? []).map((c: { id: string }) => ({
        ...c,
        contact_count: countMap.get(c.id) ?? 0,
    }));

    return NextResponse.json({ companies: enriched });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const name: string = (body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

    const admin = createAdminClient();
    // 동일 이름 있으면 그 row 반환 (find-or-create)
    const { data: existing } = await admin
        .from("myverse_companies")
        .select("*")
        .eq("member_id", memberId)
        .eq("name", name)
        .maybeSingle();
    if (existing) return NextResponse.json({ company: existing, created: false });

    const { data, error } = await admin
        .from("myverse_companies")
        .insert({
            member_id: memberId,
            name,
            domain: body.domain ?? null,
            industry: body.industry ?? null,
            logo_url: body.logo_url ?? null,
            notes: body.notes ?? null,
            color: body.color ?? null,
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ company: data, created: true }, { status: 201 });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_companies")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ company: data });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const admin = createAdminClient();
    // contacts.company_id는 ON DELETE SET NULL — 자동으로 분리됨
    const { error } = await admin
        .from("myverse_companies")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
