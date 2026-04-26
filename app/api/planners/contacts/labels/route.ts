import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

// 라벨 관리 API
//   POST   /api/planners/contacts/labels  — 일괄 적용/제거 { ids, add?, remove? }
//   PUT    /api/planners/contacts/labels  — 라벨 이름 변경 { from, to }
//   DELETE /api/planners/contacts/labels?name=xxx — 모든 연락처에서 라벨 제거

// 일괄 적용/제거 — selection action bar용
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { ids, add, remove } = body as { ids: string[]; add?: string[]; remove?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "ids_required" }, { status: 400 });

    const admin = createAdminClient();
    // 현재 라벨 조회 → 클라이언트에서 병합 후 update (atomic이지만 row 단위)
    const { data: rows, error: selErr } = await admin
        .from("planners_contacts")
        .select("id, labels")
        .in("id", ids)
        .eq("member_id", memberId);
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    let updated = 0;
    const CHUNK = 50;
    const tasks = (rows || []).map(r => {
        const cur = (r.labels as string[] | null) || [];
        const next = new Set(cur);
        if (Array.isArray(add)) for (const a of add) if (a.trim()) next.add(a.trim());
        if (Array.isArray(remove)) for (const x of remove) next.delete(x);
        const arr = [...next];
        return { id: r.id as string, arr };
    }).filter(({ id, arr }) => {
        const cur = (rows!.find(r => r.id === id)!.labels as string[] | null) || [];
        // 변경 있을 때만 update
        return arr.length !== cur.length || arr.some(l => !cur.includes(l));
    });
    for (let i = 0; i < tasks.length; i += CHUNK) {
        const slice = tasks.slice(i, i + CHUNK);
        const results = await Promise.all(
            slice.map(({ id, arr }) =>
                admin.from("planners_contacts").update({ labels: arr, updated_at: new Date().toISOString() }).eq("id", id).eq("member_id", memberId)
            )
        );
        updated += results.filter(r => !r.error).length;
    }
    return NextResponse.json({ updated });
}

// 라벨 이름 변경 — 모든 연락처에서 from → to
export async function PUT(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { from, to } = body as { from: string; to: string };
    if (!from?.trim() || !to?.trim()) return NextResponse.json({ error: "from_to_required" }, { status: 400 });
    const fromT = from.trim();
    const toT = to.trim();
    if (fromT === toT) return NextResponse.json({ updated: 0 });

    const admin = createAdminClient();
    // 페이지네이션으로 전체 가져와서 클라이언트에서 변환 (PostgREST의 array_replace를 직접 못 쓰므로)
    const PAGE = 1000;
    let updated = 0;
    for (let from2 = 0; ; from2 += PAGE) {
        const { data, error } = await admin
            .from("planners_contacts")
            .select("id, labels")
            .eq("member_id", memberId)
            .contains("labels", [fromT])
            .range(from2, from2 + PAGE - 1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data || data.length === 0) break;
        const tasks = data.map(r => {
            const cur = (r.labels as string[] | null) || [];
            const next = Array.from(new Set(cur.map(l => l === fromT ? toT : l)));
            return { id: r.id, next };
        });
        const results = await Promise.all(
            tasks.map(({ id, next }) =>
                admin.from("planners_contacts").update({ labels: next, updated_at: new Date().toISOString() }).eq("id", id).eq("member_id", memberId)
            )
        );
        updated += results.filter(r => !r.error).length;
        if (data.length < PAGE) break;
    }
    return NextResponse.json({ updated });
}

// 라벨 삭제 — 모든 연락처에서 해당 라벨 제거 (연락처는 남음)
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name?.trim()) return NextResponse.json({ error: "name_required" }, { status: 400 });
    const target = name.trim();

    const admin = createAdminClient();
    const PAGE = 1000;
    let updated = 0;
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await admin
            .from("planners_contacts")
            .select("id, labels")
            .eq("member_id", memberId)
            .contains("labels", [target])
            .range(from, from + PAGE - 1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data || data.length === 0) break;
        const tasks = data.map(r => {
            const cur = (r.labels as string[] | null) || [];
            const next = cur.filter(l => l !== target);
            return { id: r.id, next };
        });
        const results = await Promise.all(
            tasks.map(({ id, next }) =>
                admin.from("planners_contacts").update({ labels: next, updated_at: new Date().toISOString() }).eq("id", id).eq("member_id", memberId)
            )
        );
        updated += results.filter(r => !r.error).length;
        if (data.length < PAGE) break;
    }
    return NextResponse.json({ updated });
}
