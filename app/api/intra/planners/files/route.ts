/**
 * Planner's 자료실 관리 (직원) — 인트라 /intra/ums/planners/{planner,templates}
 *   GET    ?kind=planner|template              → 전체 목록 (비공개 포함)
 *   POST   { action:'prepare', file:{name,size,type} } → 서명 업로드 URL (브라우저가 Storage에 직접 올림)
 *   POST   { action:'create', kind, category, title, description?, year?, file:{path,name,size,type}, is_published }
 *   PATCH  { id, title?, category?, description?, year?, sort_order?, is_published? }
 *   DELETE ?id=   → 행 + Storage 파일 삭제
 * 버킷 planners-files (비공개) · sql/planners-files-2026-10.sql
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "planners-files";
const MAX_BYTES = 60 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "zip", "docx", "pptx", "png"];
const KINDS = ["planner", "template"];
const EDITABLE = ["title", "category", "description", "year", "sort_order", "is_published"] as const;

const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function GET(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const kind = req.nextUrl.searchParams.get("kind");
    if (!kind || !KINDS.includes(kind)) return bad("kind를 지정하세요.");
    const { data, error } = await createAdminClient().from("planners_files")
        .select("id, kind, category, title, description, year, file_name, file_size, sort_order, is_published, download_count, legacy_badak_no, updated_at")
        .eq("kind", kind).order("category").order("sort_order", { ascending: false });
    if (error) return bad(error.message, 500);
    return NextResponse.json({ files: data ?? [] });
}

export async function POST(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();

    if (body.action === "prepare") {
        const name = String(body.file?.name ?? "");
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXT.includes(ext)) return bad(`올릴 수 있는 형식: ${ALLOWED_EXT.join(", ")}`);
        if (Number(body.file?.size) > MAX_BYTES) return bad("파일은 60MB까지 올릴 수 있습니다.");
        const path = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data) return bad(error?.message ?? "업로드를 준비하지 못했습니다.", 500);
        return NextResponse.json({ path, token: data.token, signedUrl: data.signedUrl });
    }

    if (body.action === "create") {
        const kind = String(body.kind ?? "");
        const title = String(body.title ?? "").trim();
        const category = String(body.category ?? "").trim();
        const path = String(body.file?.path ?? "");
        if (!KINDS.includes(kind) || !title || !category || !path.startsWith("uploads/")) return bad("종류·분류·제목·파일을 확인하세요.");
        const { data: maxRow } = await admin.from("planners_files").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
        const { data, error } = await admin.from("planners_files").insert({
            kind, category, title,
            description: body.description ? String(body.description) : null,
            year: body.year ? Number(body.year) : null,
            file_path: path,
            file_name: String(body.file.name ?? path),
            file_size: Number(body.file.size ?? 0),
            mime_type: body.file.type ? String(body.file.type) : null,
            sort_order: (maxRow?.sort_order ?? 0) + 1,
            is_published: body.is_published === true,
        }).select("id").single();
        if (error) return bad(error.message, 500);
        return NextResponse.json({ id: data.id });
    }

    return bad("알 수 없는 요청입니다.");
}

export async function PATCH(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    if (typeof body.id !== "string") return bad("id가 필요합니다.");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of EDITABLE) if (k in body) patch[k] = body[k];
    const { error } = await createAdminClient().from("planners_files").update(patch).eq("id", body.id);
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id가 필요합니다.");
    const admin = createAdminClient();
    const { data: row } = await admin.from("planners_files").select("file_path").eq("id", id).maybeSingle();
    if (!row) return bad("자료를 찾을 수 없습니다.", 404);
    const { error } = await admin.from("planners_files").delete().eq("id", id);
    if (error) return bad(error.message, 500);
    const { error: rmErr } = await admin.storage.from(BUCKET).remove([row.file_path]);
    if (rmErr) console.error("[planners-files] Storage 삭제 실패", row.file_path, rmErr.message);
    return NextResponse.json({ ok: true });
}
