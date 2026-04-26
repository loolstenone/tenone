// Daily 누적 이월: 과거 N일 동안 누적된 미완료(todo) 태스크를 오늘로 모두 가져온다.
// - 범위: 기본 60일 (요청 body.days 로 조정 가능, 최대 180)
// - 각 과거 날짜의 status='todo' 태스크를 → 오늘에 추가하고
//   해당 과거 row 의 그 태스크는 status='carried' 로 변경
// - 'carried' 는 "이미 다음날로 옮긴 시도가 있었음" 을 의미하므로 다시 끌어오지 않는다
//   (실제 미완 사본은 그 다음 어딘가의 todo 로 살아있어 자연스럽게 누적됨)
// - 오늘 이미 같은 텍스트의 태스크가 있으면 중복 제외
// - 이월된 태스크는 source_date 메타로 어디서 왔는지 기록

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

interface Task {
    id: string;
    text: string;
    status: string;
    parent_id?: string | null;
    priority?: string | null;
    time?: string | null;
    source_date?: string | null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const today = (body.date as string) || new Date().toISOString().slice(0, 10);
    const lookbackDays = Math.min(Math.max(Number(body.days) || 60, 1), 180);

    // 범위 시작일: today - lookbackDays
    const startDate = new Date(today + "T00:00:00Z");
    startDate.setUTCDate(startDate.getUTCDate() - lookbackDays);
    const startStr = startDate.toISOString().slice(0, 10);

    const admin = createAdminClient();

    // 1. 과거 N일 Daily row 일괄 로드 (오늘 제외)
    const { data: pastRows, error: loadErr } = await admin
        .from("planners_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", startStr)
        .lt("date", today)
        .order("date", { ascending: true });

    if (loadErr) {
        console.error("[carry-over] load past", loadErr);
        return NextResponse.json({ status: "error", error: "db_read_failed" }, { status: 500 });
    }

    // 2. 오늘 Daily 로드
    const { data: tRow } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", today)
        .maybeSingle();

    const existingToday = ((tRow?.tasks as Task[]) || []);
    const existingTexts = new Set(existingToday.map((t) => t.text.trim()));

    // 3. 각 과거 row 에서 status='todo' 만 수집 (carried 는 후속 날짜에 사본 존재)
    type SourceUpdate = { date: string; tasks: Task[]; touched: boolean };
    const sources: SourceUpdate[] = (pastRows ?? []).map((row) => ({
        date: row.date as string,
        tasks: [...(((row.tasks as Task[]) || []))],
        touched: false,
    }));

    const hasAny = sources.some((s) => s.tasks.some((t) => t.status === "todo"));
    if (!hasAny) {
        return NextResponse.json({ status: "empty", carried: 0, scanned_days: pastRows?.length ?? 0 });
    }

    // 4. 가까운 과거 우선 dedupe (가장 최근의 미완을 우선 채택)
    const seen = new Set<string>(existingTexts);
    const newTasks: Task[] = [];

    for (let i = sources.length - 1; i >= 0; i--) {
        const src = sources[i];
        for (let j = 0; j < src.tasks.length; j++) {
            const t = src.tasks[j];
            if (t.status !== "todo") continue;
            const key = t.text.trim();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            newTasks.push({
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                text: t.text,
                status: "todo",
                parent_id: null,
                priority: t.priority ?? null,
                time: null,
                source_date: src.date,
            });
            // 원본 row 의 해당 태스크는 carried 로 마크
            src.tasks[j] = { ...t, status: "carried" };
            src.touched = true;
        }
    }

    if (newTasks.length === 0) {
        return NextResponse.json({ status: "already_present", carried: 0, scanned_days: sources.length });
    }

    // 가장 오래된 source 부터 보이도록 reverse (위에서 최신부터 push 됐음)
    newTasks.reverse();

    const mergedToday = [...existingToday, ...newTasks];

    // 5. DB 일괄 upsert / update
    const writes: PromiseLike<unknown>[] = [
        admin.from("planners_daily").upsert(
            { member_id: memberId, date: today, tasks: mergedToday, updated_at: new Date().toISOString() },
            { onConflict: "member_id,date" }
        ).then((r) => r),
    ];
    for (const src of sources) {
        if (!src.touched) continue;
        writes.push(
            admin.from("planners_daily")
                .update({ tasks: src.tasks, updated_at: new Date().toISOString() })
                .eq("member_id", memberId).eq("date", src.date)
                .then((r) => r)
        );
    }

    try {
        await Promise.all(writes);
    } catch (e) {
        console.error("[carry-over] write", e);
        return NextResponse.json({ status: "error", error: "db_write_failed" }, { status: 500 });
    }

    return NextResponse.json({
        status: "done",
        carried: newTasks.length,
        from_days: sources.filter((s) => s.touched).map((s) => s.date),
        scanned_days: sources.length,
        to: today,
    });
}
