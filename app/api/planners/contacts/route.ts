import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    // Supabase PostgREST 기본 db-max-rows=1000 → 페이지네이션 필요.
    // 보유량을 모르므로 빈 페이지가 나올 때까지 1000개씩 직렬 fetch (한도 없음).
    const PAGE = 1000;
    const all: unknown[] = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await admin
            .from("planners_contacts")
            .select("*")
            .eq("member_id", memberId)
            .order("is_favorite", { ascending: false })
            .order("name", { ascending: true })
            .range(from, from + PAGE - 1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < PAGE) break; // 마지막 페이지
    }
    return NextResponse.json({ contacts: all });
}

// POST 단일 또는 bulk:
//  단일: { name, phone, ... }
//  bulk: { contacts: [{ name, ... }, ...] } — 최대 1000개씩, 한 번에 INSERT
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminClient();

    // ─── Bulk insert 분기 ───
    // body: { contacts: [...], skip_duplicates?: boolean, merge_labels?: boolean }
    //   skip_duplicates=true (기본) → phone(숫자만)/email 일치하면 새로 추가하지 않음.
    //   merge_labels=true (옵션) → 일치하는 기존 연락처에 labels(및 비어있던 organization/title 등)
    //                              을 추가 병합 update (라벨 동기화 모드).
    if (Array.isArray(body.contacts)) {
        const list = body.contacts as Array<Record<string, unknown>>;
        if (list.length === 0) return NextResponse.json({ inserted: 0, skipped: 0, merged: 0 });
        if (list.length > 1000) return NextResponse.json({ error: "too_many_at_once" }, { status: 400 });

        const skipDup = body.skip_duplicates !== false; // 기본 true
        const mergeLabels = !!body.merge_labels;

        // 기존 연락처 인덱싱 (phone/email → row)
        type Row = { id: string; phone: string | null; email: string | null; labels: string[] | null;
                     organization: string | null; title: string | null; address: string | null;
                     birthday: string | null; note: string | null; group_name: string | null };
        const phoneMap = new Map<string, Row>();
        const emailMap = new Map<string, Row>();
        if (skipDup || mergeLabels) {
            for (let from = 0; ; from += 1000) {
                const { data, error } = await admin
                    .from("planners_contacts")
                    .select("id, phone, email, labels, organization, title, address, birthday, note, group_name")
                    .eq("member_id", memberId)
                    .range(from, from + 999);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                if (!data || data.length === 0) break;
                for (const row of data as Row[]) {
                    if (row.phone) phoneMap.set(String(row.phone).replace(/[^0-9]/g, ""), row);
                    if (row.email) emailMap.set(String(row.email).toLowerCase().trim(), row);
                }
                if (data.length < 1000) break;
            }
        }

        const seenPhones = new Set<string>();
        const seenEmails = new Set<string>();
        let skipped = 0;
        const rowsToInsert: Record<string, unknown>[] = [];
        const rowsToUpdate: Array<{ id: string; patch: Record<string, unknown> }> = [];

        for (const c of list) {
            if (!(typeof c.name === "string" && (c.name as string).trim())) { skipped++; continue; }
            const phoneKey = c.phone ? String(c.phone).replace(/[^0-9]/g, "") : "";
            const emailKey = c.email ? String(c.email).toLowerCase().trim() : "";

            // 외부 중복 — 기존 매칭 row 조회
            const existing = (phoneKey && phoneMap.get(phoneKey)) || (emailKey && emailMap.get(emailKey)) || null;
            if (skipDup && existing) {
                if (mergeLabels) {
                    // 라벨/빈 필드 병합
                    const incomingLabels = Array.isArray(c.labels) ? (c.labels as string[]) : [];
                    const existingLabels = existing.labels || [];
                    const mergedLabels = Array.from(new Set([...existingLabels, ...incomingLabels]));
                    const patch: Record<string, unknown> = {};
                    if (incomingLabels.length > 0 && mergedLabels.length !== existingLabels.length) {
                        patch.labels = mergedLabels;
                    }
                    // 비어있던 필드만 채움 (덮어쓰기 X)
                    if (!existing.organization && c.organization) patch.organization = c.organization;
                    if (!existing.title && c.title) patch.title = c.title;
                    if (!existing.address && c.address) patch.address = c.address;
                    if (!existing.birthday && c.birthday) patch.birthday = c.birthday;
                    if (!existing.note && c.note) patch.note = c.note;
                    if (!existing.group_name && c.group_name) patch.group_name = c.group_name;
                    if (Object.keys(patch).length > 0) {
                        rowsToUpdate.push({ id: existing.id, patch });
                    }
                }
                skipped++;
                continue;
            }
            // 내부 중복 (같은 batch)
            if (phoneKey && seenPhones.has(phoneKey)) { skipped++; continue; }
            if (emailKey && seenEmails.has(emailKey)) { skipped++; continue; }
            if (phoneKey) seenPhones.add(phoneKey);
            if (emailKey) seenEmails.add(emailKey);

            rowsToInsert.push({
                member_id: memberId,
                name: (c.name as string).trim(),
                phone: c.phone ?? null,
                email: c.email ?? null,
                group_name: c.group_name ?? null,
                relationship: c.relationship ?? null,
                note: c.note ?? null,
                birthday: c.birthday ?? null,
                organization: c.organization ?? null,
                title: c.title ?? null,
                address: c.address ?? null,
                is_favorite: !!c.is_favorite,
                labels: Array.isArray(c.labels) ? c.labels : [],
            });
        }

        // INSERT
        let inserted = 0;
        if (rowsToInsert.length > 0) {
            const { data, error } = await admin.from("planners_contacts").insert(rowsToInsert).select("id");
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            inserted = data?.length ?? 0;
        }
        // UPDATE (병합)
        let merged = 0;
        if (rowsToUpdate.length > 0) {
            // 병렬 update (50개씩 묶어서)
            const CHUNK = 50;
            for (let i = 0; i < rowsToUpdate.length; i += CHUNK) {
                const slice = rowsToUpdate.slice(i, i + CHUNK);
                const results = await Promise.all(
                    slice.map(({ id, patch }) =>
                        admin.from("planners_contacts").update(patch).eq("id", id).eq("member_id", memberId)
                    )
                );
                merged += results.filter(r => !r.error).length;
            }
        }
        return NextResponse.json({ inserted, skipped, merged }, { status: 201 });
    }

    // ─── 단일 insert ───
    const { name, phone, email, group_name, relationship, note, birthday,
            organization, title, address, is_favorite, last_contacted_at, labels } = body;
    if (!name?.trim()) return NextResponse.json({ error: "name_required" }, { status: 400 });

    const { data, error } = await admin
        .from("planners_contacts")
        .insert({
            member_id: memberId, name: name.trim(),
            phone, email, group_name, relationship, note, birthday,
            organization, title, address,
            is_favorite: !!is_favorite,
            last_contacted_at,
            labels: Array.isArray(labels) ? labels : [],
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contact: data }, { status: 201 });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    // labels는 배열로만 전달되어야
    if (patch.labels !== undefined && !Array.isArray(patch.labels)) {
        delete patch.labels;
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_contacts")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contact: data });
}

// DELETE — 단일 ?id=... 또는 bulk (body: { ids: [...] })
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
        const { error } = await admin.from("planners_contacts").delete().eq("id", id).eq("member_id", memberId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, deleted: 1 });
    }

    // bulk
    try {
        const body = await req.json();
        const ids: unknown = body.ids;
        if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "ids_required" }, { status: 400 });
        const { error, count } = await admin
            .from("planners_contacts")
            .delete({ count: "exact" })
            .in("id", ids as string[])
            .eq("member_id", memberId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, deleted: count ?? 0 });
    } catch {
        return NextResponse.json({ error: "id_required" }, { status: 400 });
    }
}
