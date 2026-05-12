// 자유 캔버스 컬렉션 — 목록 조회 + 신규 생성
// origin 컨텍스트: 일간 노트 / 프로젝트 노트 / 독립(standalone) 여부 반환

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMember() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

type CanvasOrigin =
    | { type: "daily"; date: string }
    | { type: "project"; projectId: string; projectTitle: string }
    | { type: "standalone" };

export async function GET() {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // ── 캔버스 목록 ──────────────────────────────────────────────────────
    // data.mindmap 존재 여부로 kind 판별 (페이로드 부담 줄이려 data 자체는 클라이언트로 보내지 않음)
    const { data: canvases, error } = await admin
        .from("myverse_canvases")
        .select("id, title, thumbnail_url, is_archived, created_at, updated_at, data")
        .eq("member_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // ── origin 매핑 (canvasId → origin) ─────────────────────────────────
    const originMap: Record<string, CanvasOrigin> = {};
    const canvasMarkerRe = /<!--\s*(?:myverse|planners):canvas=([a-zA-Z0-9_-]+)\s*-->/;

    // 1) 프로젝트 노트 참조 확인
    try {
        // 먼저 이 유저의 프로젝트 ID 목록 조회
        const { data: projects } = await admin
            .from("myverse_projects")
            .select("id, title")
            .eq("member_id", user.id);

        if (projects && projects.length > 0) {
            const projectIds = projects.map((p: { id: string }) => p.id);
            const projectTitleMap: Record<string, string> = {};
            projects.forEach((p: { id: string; title: string }) => { projectTitleMap[p.id] = p.title; });

            const { data: pnRefs } = await admin
                .from("myverse_project_notes")
                .select("content, project_id")
                .in("project_id", projectIds)
                .or("content.ilike.%myverse:canvas=%,content.ilike.%planners:canvas=%");

            for (const ref of pnRefs ?? []) {
                const m = (ref.content as string | null)?.match(canvasMarkerRe);
                if (m && !originMap[m[1]]) {
                    originMap[m[1]] = {
                        type: "project",
                        projectId: ref.project_id as string,
                        projectTitle: projectTitleMap[ref.project_id as string] ?? "프로젝트",
                    };
                }
            }
        }
    } catch { /* origin 실패해도 목록은 반환 */ }

    // 2) 일간 노트 참조 확인 (myverse_daily.notes JSONB 배열)
    try {
        const { data: dailyRows } = await admin
            .from("myverse_daily")
            .select("date, notes")
            .eq("member_id", user.id)
            .not("notes", "is", null)
            .ilike("notes::text", "%\"type\":\"canvas\"%");

        for (const row of dailyRows ?? []) {
            const notes = row.notes as Array<{ type: string; canvas_id?: string }> | null;
            if (!Array.isArray(notes)) continue;
            for (const note of notes) {
                if (note.type === "canvas" && note.canvas_id && !originMap[note.canvas_id]) {
                    originMap[note.canvas_id] = { type: "daily", date: row.date as string };
                }
            }
        }
    } catch { /* origin 실패해도 목록은 반환 */ }

    // ── 결합 ──────────────────────────────────────────────────────────────
    const result = (canvases ?? []).map((c: { id: string; title: string; thumbnail_url: string | null; is_archived: boolean; created_at: string; updated_at: string; data?: { mindmap?: unknown; ppcanvas?: unknown } | null }) => {
        const { data: _data, ...rest } = c;
        const kind: "mindmap" | "canvas" = _data && typeof _data === "object" && _data.mindmap ? "mindmap" : "canvas";
        return {
            ...rest,
            kind,
            origin: originMap[c.id] ?? { type: "standalone" } as CanvasOrigin,
        };
    });

    return NextResponse.json({ canvases: result });
}

export async function POST(req: Request) {
    const user = await getMember();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title: string = (body?.title ?? "").trim() || "제목 없음";
    const initData = body?.data && typeof body.data === "object" ? body.data : {};

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_canvases")
        .insert({ member_id: user.id, title, data: initData })
        .select("id, title, created_at, updated_at")
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ canvas: data });
}
