// GDPR 데이터 export — 사용자 전체 데이터 JSON 다운로드
// GET /api/myverse/data-export
//
// 응답: application/json (다운로드). 모든 사용자 데이터를 한 번에.
// 미디어 파일(이미지/영상)은 url만 포함 — 사용자가 별도 다운로드.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// (table, columns[]) — 첫 번째 매치하는 컬럼으로 조회. 없으면 다음 후보 시도.
const TABLES_BY_MEMBER: { table: string; cols: string[] }[] = [
    { table: "myverse_users", cols: ["member_id", "user_id"] },
    { table: "myverse_identities", cols: ["member_id"] },
    { table: "myverse_consent_log", cols: ["member_id"] },
    // 9 영역 / 캡처
    { table: "myverse_daily", cols: ["member_id"] },
    { table: "myverse_weekly", cols: ["member_id"] },
    { table: "myverse_monthly", cols: ["member_id"] },
    { table: "myverse_yearly", cols: ["member_id"] },
    { table: "myverse_daily_moments", cols: ["member_id"] },
    { table: "myverse_daily_routines", cols: ["member_id"] },
    { table: "myverse_daily_places", cols: ["member_id"] },
    { table: "myverse_daily_health", cols: ["member_id"] },
    { table: "myverse_calendar_entries", cols: ["member_id"] },
    { table: "myverse_external_events", cols: ["member_id"] },
    { table: "myverse_contacts", cols: ["member_id"] },
    // 프로젝트 (자체) — 멤버 직접 소유
    // ※ myverse_covers·myverse_templates는 전 사용자가 공유하는 카탈로그라 export 대상 아님
    { table: "myverse_projects", cols: ["member_id"] },
    { table: "myverse_works", cols: ["member_id"] },
    { table: "myverse_work_tasks", cols: ["member_id"] },
    { table: "myverse_canvases", cols: ["member_id"] },
    // 커뮤니티 / 소셜 (내가 작성한 것)
    { table: "myverse_community_posts", cols: ["member_id"] },
    { table: "myverse_community_comments", cols: ["member_id"] },
    { table: "myverse_community_likes", cols: ["member_id"] },
    { table: "myverse_moment_reactions", cols: ["member_id"] },
    { table: "myverse_moment_comments", cols: ["member_id"] },
    { table: "myverse_moment_reports", cols: ["reporter_id"] },
    // AI / 코치
    { table: "myverse_ai_briefings", cols: ["member_id"] },
    { table: "myverse_ai_usage", cols: ["member_id"] },
    { table: "myverse_coach_insights", cols: ["member_id"] },
    { table: "myverse_weekly_reports", cols: ["member_id"] },
    { table: "myverse_classification_jobs", cols: ["member_id"] },
    { table: "myverse_imports", cols: ["member_id"] },
    { table: "myverse_time_capsules", cols: ["member_id"] },
    // 알림 / 차단 / 팔로우
    { table: "myverse_notifications", cols: ["recipient_id"] },
    { table: "myverse_user_blocks", cols: ["blocker_id"] },
    // 결제 / 구독
    { table: "myverse_subscriptions", cols: ["member_id"] },
    { table: "myverse_payments", cols: ["member_id"] },
    // 통합 / 푸시
    { table: "myverse_integrations", cols: ["member_id"] },
    { table: "myverse_health_connections", cols: ["member_id"] },
    { table: "myverse_oauth_tokens", cols: ["member_id"] },
    { table: "myverse_push_subscriptions", cols: ["member_id"] },
    // 피드백
    { table: "myverse_feedback", cols: ["member_id", "user_id", "submitter_id"] },
];

// 프로젝트 ID 기반으로만 묶이는 종속 테이블 — projects 먼저 로드 후 project_id로 조회
const PROJECT_CHILD_TABLES = [
    "myverse_project_milestones",
    "myverse_project_notes",
    "myverse_project_vriefs",
    "myverse_project_gprs",
];

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 핵심 프로필 — members
    const { data: profile } = await admin
        .from("members")
        .select("id, email, name, handle, phone, company, bio, avatar_url, affiliations, created_at")
        .eq("id", memberId)
        .maybeSingle();

    // 팔로우는 양방향
    const [followingRes, followersRes] = await Promise.all([
        admin.from("myverse_follows").select("*").eq("follower_id", memberId),
        admin.from("myverse_follows").select("*").eq("following_id", memberId),
    ]);

    // DM — 내가 참여 중인 스레드 + 그 안의 메시지
    const { data: threads } = await admin
        .from("myverse_dm_threads").select("*")
        .or(`member_a.eq.${memberId},member_b.eq.${memberId}`);
    const threadIds = (threads ?? []).map(t => t.id as string);
    const { data: dmMessages } = threadIds.length > 0
        ? await admin.from("myverse_dm_messages").select("*").in("thread_id", threadIds)
        : { data: [] };

    // 모든 등록된 테이블 병렬 수집 — 컬럼 후보를 순회하며 시도
    const collected: Record<string, unknown> = {};
    const errors: string[] = [];

    await Promise.all(TABLES_BY_MEMBER.map(async ({ table, cols }) => {
        for (const col of cols) {
            try {
                const { data, error } = await admin.from(table).select("*").eq(col, memberId);
                if (!error) {
                    collected[table] = data ?? [];
                    return;
                }
                // 컬럼 없음 에러면 다음 후보로
                if (!error.message.includes("does not exist")) {
                    errors.push(`${table} (${col}): ${error.message}`);
                    collected[table] = null;
                    return;
                }
            } catch (e) {
                errors.push(`${table} (${col}): ${(e as Error).message}`);
                collected[table] = null;
                return;
            }
        }
        errors.push(`${table}: no matching column among [${cols.join(", ")}]`);
        collected[table] = null;
    }));

    // 프로젝트 종속 — projects 결과에서 id 추출 후 in() 조회
    const projects = (collected["myverse_projects"] ?? []) as Array<{ id: string }>;
    const projectIds = projects.map(p => p.id);
    if (projectIds.length > 0) {
        await Promise.all(PROJECT_CHILD_TABLES.map(async table => {
            try {
                const { data, error } = await admin.from(table).select("*").in("project_id", projectIds);
                if (error) {
                    errors.push(`${table} (project_id): ${error.message}`);
                    collected[table] = null;
                } else {
                    collected[table] = data ?? [];
                }
            } catch (e) {
                errors.push(`${table} (project_id): ${(e as Error).message}`);
                collected[table] = null;
            }
        }));
    } else {
        for (const t of PROJECT_CHILD_TABLES) collected[t] = [];
    }

    const exportObj = {
        export_meta: {
            generated_at: new Date().toISOString(),
            member_id: memberId,
            schema_version: 1,
            note: "Myverse 사용자 데이터 export. 미디어 파일은 url만 포함되며 별도로 다운로드해야 합니다.",
            collection_errors: errors.length > 0 ? errors : undefined,
        },
        profile,
        follows: {
            following: followingRes.data ?? [],
            followers: followersRes.data ?? [],
        },
        dm: {
            threads: threads ?? [],
            messages: dmMessages ?? [],
        },
        ...collected,
    };

    const filename = `myverse-export-${new Date().toISOString().slice(0, 10)}.json`;
    const body = JSON.stringify(exportObj, null, 2);

    return new NextResponse(body, {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
}
