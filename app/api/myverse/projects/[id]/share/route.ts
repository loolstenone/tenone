// 프로젝트 공개 링크 토큰 생성·철회
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import crypto from "crypto";

function makeToken() {
    return crypto.randomBytes(18).toString("base64url");
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data: project } = await admin
        .from("myverse_projects")
        .select("id, public_token, visibility")
        .eq("id", projectId)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    let token = project.public_token;
    if (!token) {
        // unique 보장 — 충돌 시 재시도
        for (let i = 0; i < 5; i++) {
            const candidate = makeToken();
            const { data: dup } = await admin
                .from("myverse_projects")
                .select("id")
                .eq("public_token", candidate)
                .maybeSingle();
            if (!dup) { token = candidate; break; }
        }
        if (!token) return NextResponse.json({ error: "token_collision" }, { status: 500 });
    }

    await admin
        .from("myverse_projects")
        .update({ public_token: token, visibility: "public_link" })
        .eq("id", projectId);

    return NextResponse.json({ token, visibility: "public_link" });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    await admin
        .from("myverse_projects")
        .update({ public_token: null, visibility: "private" })
        .eq("id", projectId)
        .eq("member_id", memberId);

    return NextResponse.json({ ok: true });
}
