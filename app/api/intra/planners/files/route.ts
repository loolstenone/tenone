/**
 * 플래너스 PAD 상품 관리 (직원) — 인트라 /intra/ums/planners/pad (아임웹 쇼핑 › 상품 화면 기준, 2026-10-14)
 *   GET    ?id=                       → 상품 1건 (비공개 포함)
 *   GET    [?kind=planner|template]   → 목록 (비공개 포함)
 *   POST   { action:'prepare', target:'file'|'media', file:{name,size,type} } → 서명 업로드 URL (브라우저가 Storage에 직접 올림)
 *            file  = 비공개 버킷 planners-files (내려받는 파일) · media = 공개 버킷 planners-media (상품 사진)
 *   POST   { action:'create', category, title, description?, year?, images?, detail_images?, file:{path,name,size,type}, is_published }
 *   PATCH  { id, title?, category?, description?, year?, sort_order?, is_published?, images?, detail_images?, file? }
 *            file을 주면 내려받는 파일 교체(옛 파일 삭제) · images를 주면 첫 장이 썸네일
 *   DELETE ?id=   → 행 + 내려받는 파일 삭제 (상품 사진은 다른 상품과 겹칠 수 있어 남김)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANNER_CATEGORIES, PAD_CATEGORIES } from "@/lib/planners/library-shared";

export const runtime = "nodejs";

const FILE_BUCKET = "planners-files";
const MEDIA_BUCKET = "planners-media";
const LIMITS = {
    file: { bytes: 60 * 1024 * 1024, ext: ["pdf", "zip", "docx", "pptx", "png"] },
    media: { bytes: 10 * 1024 * 1024, ext: ["png", "jpg", "jpeg", "gif", "webp"] },
} as const;
const COLUMNS = "id, kind, category, title, description, year, file_path, file_name, file_size, mime_type, thumbnail_url, images, detail_images, sort_order, is_published, download_count, legacy_badak_no, created_at, updated_at";

const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
const kindOf = (category: string) => ((PLANNER_CATEGORIES as readonly string[]).includes(category) ? "planner" : "template");
const isUrlList = (v: unknown): v is string[] => Array.isArray(v) && v.every((u) => typeof u === "string" && /^https:\/\//.test(u));

export async function GET(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const admin = createAdminClient();
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
        const { data, error } = await admin.from("planners_files").select(COLUMNS).eq("id", id).maybeSingle();
        if (error) return bad(error.message, 500);
        if (!data) return bad("상품을 찾을 수 없습니다.", 404);
        return NextResponse.json({ file: data });
    }
    let q = admin.from("planners_files").select(COLUMNS);
    const kind = req.nextUrl.searchParams.get("kind");
    if (kind === "planner" || kind === "template") q = q.eq("kind", kind);
    const { data, error } = await q.order("sort_order", { ascending: false });
    if (error) return bad(error.message, 500);
    return NextResponse.json({ files: data ?? [] });
}

export async function POST(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();

    if (body.action === "prepare") {
        const target: "file" | "media" = body.target === "media" ? "media" : "file";
        const limit = LIMITS[target];
        const ext = String(body.file?.name ?? "").split(".").pop()?.toLowerCase() ?? "";
        if (!(limit.ext as readonly string[]).includes(ext)) return bad(`올릴 수 있는 형식: ${limit.ext.join(", ")}`);
        if (Number(body.file?.size) > limit.bytes) return bad(`파일은 ${limit.bytes / 1024 / 1024}MB까지 올릴 수 있습니다.`);
        const bucket = target === "media" ? MEDIA_BUCKET : FILE_BUCKET;
        const path = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
        if (error || !data) return bad(error?.message ?? "업로드를 준비하지 못했습니다.", 500);
        const publicUrl = target === "media" ? admin.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl : null;
        return NextResponse.json({ bucket, path, token: data.token, publicUrl });
    }

    if (body.action === "create") {
        const title = String(body.title ?? "").trim();
        const category = String(body.category ?? "").trim();
        const path = String(body.file?.path ?? "");
        if (!title || !(PAD_CATEGORIES as readonly string[]).includes(category) || !path.startsWith("uploads/")) return bad("분류·이름·파일을 확인하세요.");
        const images = isUrlList(body.images) ? body.images : [];
        const detail = isUrlList(body.detail_images) ? body.detail_images : [];
        const { data: maxRow } = await admin.from("planners_files").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
        const { data, error } = await admin.from("planners_files").insert({
            kind: kindOf(category), category, title,
            description: body.description ? String(body.description) : null,
            year: body.year ? Number(body.year) : null,
            file_path: path,
            file_name: String(body.file.name ?? path),
            file_size: Number(body.file.size ?? 0),
            mime_type: body.file.type ? String(body.file.type) : null,
            images, detail_images: detail, thumbnail_url: images[0] ?? null,
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
    const admin = createAdminClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.title === "string") {
        if (!body.title.trim()) return bad("이름을 넣어 주세요.");
        patch.title = body.title.trim();
    }
    if (typeof body.category === "string") {
        if (!(PAD_CATEGORIES as readonly string[]).includes(body.category)) return bad("분류를 확인하세요.");
        patch.category = body.category;
        patch.kind = kindOf(body.category);
    }
    if ("description" in body) patch.description = body.description ? String(body.description) : null;
    if ("year" in body) patch.year = body.year ? Number(body.year) : null;
    if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;
    if (typeof body.is_published === "boolean") patch.is_published = body.is_published;
    if ("images" in body) {
        if (!isUrlList(body.images)) return bad("사진 목록이 올바르지 않습니다.");
        patch.images = body.images;
        patch.thumbnail_url = body.images[0] ?? null;
    }
    if ("detail_images" in body) {
        if (!isUrlList(body.detail_images)) return bad("상세 이미지 목록이 올바르지 않습니다.");
        patch.detail_images = body.detail_images;
    }

    let oldFilePath: string | null = null;
    if (body.file) {
        const path = String(body.file.path ?? "");
        if (!path.startsWith("uploads/")) return bad("파일을 확인하세요.");
        const { data: cur } = await admin.from("planners_files").select("file_path").eq("id", body.id).maybeSingle();
        oldFilePath = cur?.file_path ?? null;
        Object.assign(patch, { file_path: path, file_name: String(body.file.name ?? path), file_size: Number(body.file.size ?? 0), mime_type: body.file.type ? String(body.file.type) : null });
    }

    const { error } = await admin.from("planners_files").update(patch).eq("id", body.id);
    if (error) return bad(error.message, 500);
    if (oldFilePath && oldFilePath !== patch.file_path) {
        const { error: rmErr } = await admin.storage.from(FILE_BUCKET).remove([oldFilePath]);
        if (rmErr) console.error("[planners-files] 옛 파일 삭제 실패", oldFilePath, rmErr.message);
    }
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id가 필요합니다.");
    const admin = createAdminClient();
    const { data: row } = await admin.from("planners_files").select("file_path").eq("id", id).maybeSingle();
    if (!row) return bad("상품을 찾을 수 없습니다.", 404);
    const { error } = await admin.from("planners_files").delete().eq("id", id);
    if (error) return bad(error.message, 500);
    const { error: rmErr } = await admin.storage.from(FILE_BUCKET).remove([row.file_path]);
    if (rmErr) console.error("[planners-files] Storage 삭제 실패", row.file_path, rmErr.message);
    return NextResponse.json({ ok: true });
}
