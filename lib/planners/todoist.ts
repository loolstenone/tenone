// Todoist 연동 — 개인 API 토큰 방식 (OAuth 대신 사용자가 직접 토큰 붙여넣기)
// https://developer.todoist.com/rest/v2/

import { createAdminClient } from "@/lib/supabase/admin";

const TODOIST_API = "https://api.todoist.com/rest/v2";

interface TodoistTask {
    id: string;
    content: string;
    description: string;
    project_id: string;
    is_completed: boolean;
    due?: { date: string; datetime?: string; string: string; timezone?: string };
    priority: number;
    url: string;
}

export async function verifyToken(token: string): Promise<{ ok: boolean; user?: { email: string; full_name: string } }> {
    const res = await fetch(`${TODOIST_API}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false };
    return { ok: true };
}

export async function fetchTodoistTasks(token: string, filter?: string): Promise<TodoistTask[]> {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    const res = await fetch(`${TODOIST_API}/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
}

/**
 * 오늘의 Todoist 태스크를 오늘 Daily 태스크로 import
 */
export async function importTodayTasks(memberId: string): Promise<{ imported: number; error?: string }> {
    const admin = createAdminClient();

    const { data: integ } = await admin
        .from("planners_integrations")
        .select("access_token")
        .eq("member_id", memberId)
        .eq("provider", "todoist")
        .eq("status", "active")
        .maybeSingle();

    if (!integ?.access_token) return { imported: 0, error: "not_connected" };

    const tasks = await fetchTodoistTasks(integ.access_token, "today");
    const today = new Date().toISOString().slice(0, 10);

    // 오늘 Daily 로드
    const { data: dailyRow } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", today)
        .maybeSingle();

    const existing = (dailyRow?.tasks as Array<{ text: string }> | undefined) || [];
    const existingTexts = new Set(existing.map((t) => t.text.trim()));

    const newTasks = tasks
        .filter((t) => !t.is_completed && !existingTexts.has(t.content.trim()))
        .map((t) => ({
            id: `todoist_${t.id}`,
            text: t.content,
            status: "todo" as const,
            priority: t.priority >= 3 ? "high" : t.priority === 2 ? "normal" : "low",
            external_ref: { provider: "todoist", url: t.url },
        }));

    if (newTasks.length === 0) return { imported: 0 };

    const merged = [...existing, ...newTasks];
    await admin.from("planners_daily").upsert({
        member_id: memberId,
        date: today,
        tasks: merged,
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,date" });

    await admin
        .from("planners_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "todoist");

    return { imported: newTasks.length };
}
