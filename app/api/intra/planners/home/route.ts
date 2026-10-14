/**
 * Planner's 첫 화면 관리 (직원) — 배너(아임웹 키비주얼) · 진열대(아임웹 쇼핑 기획전)
 *   GET    ?type=banners|showcases           → 전체 (비공개·기간 밖 포함, 순서대로)
 *   POST   { type, ...fields }               → 추가
 *   PATCH  { type, id, ...fields }           → 고치기 (순서 바꾸기 = sort_order)
 *   DELETE ?type=&id=
 * 사진 업로드는 /api/intra/planners/files (prepare target=media) 를 그대로 쓴다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Kind = "banners" | "showcases";
const TABLE: Record<Kind, string> = { banners: "planners_banners", showcases: "planners_showcases" };
const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
const kindOf = (v: unknown): Kind | null => (v === "banners" || v === "showcases" ? v : null);

const isLink = (v: unknown) => v == null || v === "" || (typeof v === "string" && (/^\/[^/]/.test(v) || /^https:\/\//.test(v)));
const isDate = (v: unknown) => v == null || v === "" || (typeof v === "string" && !Number.isNaN(Date.parse(v)));
const str = (v: unknown, max = 500) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** 요청 본문 → 저장할 칸 (모르는 칸은 버린다) */
function fields(kind: Kind, b: Record<string, unknown>): Record<string, unknown> | string {
    const out: Record<string, unknown> = {};
    if ("title" in b) { const t = str(b.title, 120); if (!t) return "제목을 넣어 주세요."; out.title = t; }
    if ("is_published" in b) out.is_published = b.is_published === true;
    if ("sort_order" in b && typeof b.sort_order === "number") out.sort_order = b.sort_order;
    for (const k of ["starts_at", "ends_at"] as const) {
        if (k in b) { if (!isDate(b[k])) return "날짜를 확인하세요."; out[k] = b[k] || null; }
    }
    if (kind === "banners") {
        if ("subtitle" in b) out.subtitle = str(b.subtitle, 300);
        if ("button_label" in b) out.button_label = str(b.button_label, 30);
        if ("image_url" in b) { if (b.image_url && !/^https:\/\//.test(String(b.image_url))) return "사진 주소를 확인하세요."; out.image_url = str(b.image_url, 1000); }
        if ("link_url" in b) { if (!isLink(b.link_url)) return "링크는 /로 시작하는 사이트 주소나 https:// 주소여야 합니다."; out.link_url = str(b.link_url, 1000); }
    } else {
        if ("description" in b) out.description = str(b.description, 300);
        if ("file_ids" in b) {
            if (!Array.isArray(b.file_ids) || !b.file_ids.every((x) => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x))) return "상품 목록을 확인하세요.";
            out.file_ids = [...new Set(b.file_ids as string[])].slice(0, 24);
        }
    }
    return out;
}

export async function GET(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const kind = kindOf(req.nextUrl.searchParams.get("type"));
    if (!kind) return bad("type을 지정하세요.");
    const { data, error } = await createAdminClient().from(TABLE[kind]).select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) return bad(error.message, 500);
    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    const kind = kindOf(body.type);
    if (!kind) return bad("type을 지정하세요.");
    const f = fields(kind, body);
    if (typeof f === "string") return bad(f);
    if (!f.title) return bad("제목을 넣어 주세요.");
    const admin = createAdminClient();
    const { data: last } = await admin.from(TABLE[kind]).select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await admin.from(TABLE[kind]).insert({ ...f, sort_order: (last?.sort_order ?? 0) + 10 }).select("*").single();
    if (error) return bad(error.message, 500);
    return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    const kind = kindOf(body.type);
    if (!kind || typeof body.id !== "string") return bad("type·id가 필요합니다.");
    const f = fields(kind, body);
    if (typeof f === "string") return bad(f);
    const { error } = await createAdminClient().from(TABLE[kind]).update({ ...f, updated_at: new Date().toISOString() }).eq("id", body.id);
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const kind = kindOf(req.nextUrl.searchParams.get("type"));
    const id = req.nextUrl.searchParams.get("id");
    if (!kind || !id) return bad("type·id가 필요합니다.");
    const { error } = await createAdminClient().from(TABLE[kind]).delete().eq("id", id);
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true });
}
