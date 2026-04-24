// Notion 연동 — Integration Token 방식 (사용자가 직접 발급)
// https://developers.notion.com/reference

import { createAdminClient } from "@/lib/supabase/admin";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function headers(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    };
}

interface NotionUser {
    object: string;
    name?: string;
    person?: { email?: string };
    bot?: { owner?: { user?: { person?: { email?: string } } } };
}

export async function verifyToken(token: string): Promise<{ ok: boolean; name?: string; email?: string }> {
    const res = await fetch(`${NOTION_API}/users/me`, { headers: headers(token) });
    if (!res.ok) return { ok: false };
    const u: NotionUser = await res.json();
    const email =
        u.person?.email ??
        u.bot?.owner?.user?.person?.email ??
        undefined;
    return { ok: true, name: u.name, email };
}

interface NotionPage {
    id: string;
    archived: boolean;
    url: string;
    properties: Record<string, {
        type: string;
        title?: Array<{ plain_text: string }>;
        checkbox?: boolean;
        date?: { start: string } | null;
        rich_text?: Array<{ plain_text: string }>;
    }>;
}

/**
 * 연결된 모든 데이터베이스에서 미완료 태스크를 가져와 오늘 Daily에 import
 */
export async function importNotionTasks(memberId: string): Promise<{ imported: number; error?: string }> {
    const admin = createAdminClient();

    const { data: integ } = await admin
        .from("planners_integrations")
        .select("access_token")
        .eq("member_id", memberId)
        .eq("provider", "notion")
        .eq("status", "active")
        .maybeSingle();

    if (!integ?.access_token) return { imported: 0, error: "not_connected" };
    const token = integ.access_token;

    // 접근 가능한 데이터베이스 검색
    const searchRes = await fetch(`${NOTION_API}/search`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ filter: { value: "database", property: "object" }, page_size: 10 }),
    });
    if (!searchRes.ok) return { imported: 0, error: `search_failed_${searchRes.status}` };

    const searchData = await searchRes.json();
    const databases: Array<{ id: string }> = searchData.results || [];
    if (databases.length === 0) return { imported: 0, error: "no_databases" };

    const today = new Date().toISOString().slice(0, 10);
    const allTasks: Array<{ id: string; text: string; url: string }> = [];

    for (const db of databases.slice(0, 3)) {
        const queryRes = await fetch(`${NOTION_API}/databases/${db.id}/query`, {
            method: "POST",
            headers: headers(token),
            body: JSON.stringify({
                filter: { property: "checkbox", checkbox: { equals: false } },
                page_size: 20,
            }),
        });
        if (!queryRes.ok) continue;
        const queryData = await queryRes.json();
        const pages: NotionPage[] = queryData.results || [];

        for (const page of pages) {
            if (page.archived) continue;
            const titleProp = Object.values(page.properties).find((p) => p.type === "title");
            const title = titleProp?.title?.map((t) => t.plain_text).join("") || "(제목 없음)";
            allTasks.push({ id: page.id, text: title, url: page.url });
        }
    }

    if (allTasks.length === 0) return { imported: 0 };

    const { data: dailyRow } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", today)
        .maybeSingle();

    const existing = (dailyRow?.tasks as Array<{ text: string }> | undefined) || [];
    const existingTexts = new Set(existing.map((t) => t.text.trim()));

    const newTasks = allTasks
        .filter((t) => !existingTexts.has(t.text.trim()))
        .map((t) => ({
            id: `notion_${t.id}`,
            text: t.text,
            status: "todo" as const,
            priority: "normal" as const,
            external_ref: { provider: "notion", url: t.url },
        }));

    if (newTasks.length === 0) return { imported: 0 };

    await admin.from("planners_daily").upsert({
        member_id: memberId,
        date: today,
        tasks: [...existing, ...newTasks],
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,date" });

    await admin
        .from("planners_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "notion");

    return { imported: newTasks.length };
}
