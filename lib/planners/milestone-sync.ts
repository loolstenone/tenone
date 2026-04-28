// 프로젝트 마일스톤 ↔ planners_daily.tasks 양방향 동기화
// 마일스톤은 due_date를 가진 "업무"로 해석되어 해당 날짜의 일정에 자동 포함된다.
// task.id 규약: `ms_{milestone_id}` — 충돌 없는 고유 키

import type { SupabaseClient } from "@supabase/supabase-js";

export const MILESTONE_TASK_ID_PREFIX = "ms_";

export interface MilestoneRow {
    id: string;
    title: string;
    due_date: string | null;
    done_at: string | null;
}

interface DailyRow {
    id: string;
    tasks: unknown;
}

interface DailyTask {
    id: string;
    text: string;
    status: string;
    project_id?: string | null;
    source?: string;
    priority?: string | null;
    time?: string | null;
}

function isTaskArray(v: unknown): v is DailyTask[] {
    return Array.isArray(v);
}

async function fetchDaily(
    admin: SupabaseClient,
    memberId: string,
    date: string,
): Promise<DailyRow | null> {
    const { data } = await admin
        .from("planners_daily")
        .select("id, tasks")
        .eq("member_id", memberId)
        .eq("date", date)
        .maybeSingle();
    return (data as DailyRow | null) ?? null;
}

/** 마일스톤 → daily task 1건 upsert. 이전 due_date에서는 제거. */
export async function syncMilestoneToTasks(
    admin: SupabaseClient,
    memberId: string,
    projectId: string,
    milestone: MilestoneRow,
    prevDueDate?: string | null,
): Promise<void> {
    // 1) 이전 날짜에서 제거 (날짜가 바뀐 경우)
    if (prevDueDate && prevDueDate !== milestone.due_date) {
        await removeMilestoneTask(admin, memberId, milestone.id, prevDueDate);
    }

    // 2) due_date 없으면 task로 표시할 자리 없음 — 종료
    if (!milestone.due_date) return;

    const taskId = `${MILESTONE_TASK_ID_PREFIX}${milestone.id}`;
    const status = milestone.done_at ? "done" : "todo";
    const newTask: DailyTask = {
        id: taskId,
        text: milestone.title,
        status,
        project_id: projectId,
        source: "milestone",
        priority: null,
        time: null,
    };

    const row = await fetchDaily(admin, memberId, milestone.due_date);
    const existing = isTaskArray(row?.tasks) ? row!.tasks : [];
    const filtered = existing.filter((t) => t?.id !== taskId);
    const next = [...filtered, newTask];

    if (row) {
        await admin.from("planners_daily").update({ tasks: next }).eq("id", row.id);
    } else {
        await admin.from("planners_daily").insert({
            member_id: memberId,
            date: milestone.due_date,
            tasks: next,
        });
    }
}

/** 특정 날짜에서 마일스톤 task 제거 */
export async function removeMilestoneTask(
    admin: SupabaseClient,
    memberId: string,
    milestoneId: string,
    date: string,
): Promise<void> {
    if (!date) return;
    const taskId = `${MILESTONE_TASK_ID_PREFIX}${milestoneId}`;
    const row = await fetchDaily(admin, memberId, date);
    if (!row) return;
    const existing = isTaskArray(row.tasks) ? row.tasks : [];
    const next = existing.filter((t) => t?.id !== taskId);
    if (next.length !== existing.length) {
        await admin.from("planners_daily").update({ tasks: next }).eq("id", row.id);
    }
}
