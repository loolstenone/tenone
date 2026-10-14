/**
 * Planner's 자료실 내려받기 — 로그인 회원에게 5분짜리 서명 URL
 *   GET /api/planners-library/{id}/download → { url }
 *
 * - 파일은 비공개 버킷 planners-files (sql/planners-files-2026-10.sql) · 공개 표시된 자료만
 * - 누가 받았는지는 저장하지 않고 다운로드 수만 +1 (개인정보 최소 수집)
 * - 경로가 /api/planners/* 가 아닌 이유: middleware가 /api/planners/* 를 /api/myverse/* 로 재작성한다
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "planners-files";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

    const admin = createAdminClient();
    const { data: file } = await admin.from("planners_files")
        .select("id, file_path, file_name, is_published")
        .eq("id", id).maybeSingle();
    if (!file || !file.is_published) return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });

    const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(file.file_path, 300, { download: file.file_name });
    if (error || !data?.signedUrl) {
        console.error("[planners-library] 서명 URL 실패", id, error?.message);
        return NextResponse.json({ error: "파일을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }

    const { error: countErr } = await admin.rpc("planners_file_downloaded", { p_id: file.id });
    if (countErr) console.error("[planners-library] 다운로드 수 기록 실패", id, countErr.message);

    return NextResponse.json({ url: data.signedUrl });
}
