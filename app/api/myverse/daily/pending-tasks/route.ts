// 과거 N일 미완료(todo) + 보류(hold) 태스크 목록 반환 (선택적 이월을 위한 preview API)
// GET /api/myverse/daily/pending-tasks?date=YYYY-MM-DD&days=60

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

interface Task {
    id: string;
    text: string;
    status: string;
    priority?: string | null;
    time?: string | null;
    source_date?: string | null;
    parent_id?: string | null;
    duration_days?: number | null;
    type?: string | null;
    project_id?: string | null;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const today = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const lookbackDays = Math.min(Math.max(Number(url.searchParams.get("days")) || 60, 1), 180);

    const startDate = new Date(today + "T00:00:00Z");
    startDate.setUTCDate(startDate.getUTCDate() - lookbackDays);
    const startStr = startDate.toISOString().slice(0, 10);

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", startStr)
        .lt("date", today)
        .order("date", { ascending: false });

    if (error) return NextResponse.json({ error: "db_read_failed" }, { status: 500 });

    // 오늘 기존 tasks 텍스트 (중복 제외용)
    const { data: todayRow } = await admin
        .from("myverse_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", today)
        .maybeSingle();

    const todayTexts = new Set(
        ((todayRow?.tasks as Task[]) || []).map((t) => t.text.trim())
    );

    // 날짜별 미완 메인 태스크 + 그 메인의 모든 서브태스크(완료 포함) 동반 호출
    const groups: Array<{ date: string; tasks: Task[] }> = [];
    for (const row of data ?? []) {
        const all = (row.tasks as Task[]) || [];
        // 미완(todo/hold) 메인 (parent_id 없음) 만 추림
        const pendingParents = all.filter(
            (t) =>
                !t.parent_id &&
                (t.status === "todo" || t.status === "hold") &&
                t.text.trim() &&
                !todayTexts.has(t.text.trim())
        );
        if (pendingParents.length === 0) continue;

        // parent_id 기준 서브 그룹핑 (상태 무관)
        const subsByParent = new Map<string, Task[]>();
        for (const t of all) {
            if (t.parent_id) {
                const arr = subsByParent.get(t.parent_id) ?? [];
                arr.push(t);
                subsByParent.set(t.parent_id, arr);
            }
        }

        // 메인 + 서브 순서로 평탄화 (UI에서 parent_id로 트리 렌더 가능)
        const ordered: Task[] = [];
        for (const p of pendingParents) {
            ordered.push(p);
            const subs = subsByParent.get(p.id) ?? [];
            ordered.push(...subs);
        }

        groups.push({ date: row.date as string, tasks: ordered });
    }

    return NextResponse.json({ groups });
}
