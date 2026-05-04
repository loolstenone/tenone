// 한 장면 업로드 — 서버에서 admin 클라이언트로 Storage 처리
// Storage RLS 우회 (admin = service_role) + 본인 폴더 강제

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic",
    "video/mp4", "video/webm", "video/quicktime",
]);
const MAX_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json({ error: "invalid_form" }, { status: 400 });
    }

    const file = form.get("file");
    const date = String(form.get("date") || "");
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return NextResponse.json({ error: "missing_date" }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "invalid_type", type: file.type }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", size: file.size }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
    const path = `${memberId}/${date}/${Date.now()}.${ext}`;

    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
        .from("planners-moments")
        .upload(path, buffer, { contentType: file.type, upsert: false });
    if (upErr) {
        console.error("moment upload err", upErr);
        return NextResponse.json({ error: "upload_failed", message: upErr.message }, { status: 500 });
    }

    const { data: pub } = admin.storage.from("planners-moments").getPublicUrl(path);

    return NextResponse.json({
        url: pub.publicUrl,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        file_size: file.size,
        path,
    });
}
