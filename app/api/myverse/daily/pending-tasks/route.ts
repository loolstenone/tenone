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

    // 날짜별 todo 태스크 (이미 오늘에 있는 것은 제외)
    const groups: Array<{ date: string; tasks: Task[] }> = [];
    for (const row of data ?? []) {
        const todos = ((row.tasks as Task[]) || []).filter(
            (t) => (t.status === "todo" || t.status === "hold") && t.text.trim() && !todayTexts.has(t.text.trim())
        );
        if (todos.length > 0) {
            groups.push({ date: row.date as string, tasks: todos });
        }
    }

    return NextResponse.json({ groups });
}
