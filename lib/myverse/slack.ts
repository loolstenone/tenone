// Slack 연동 — Incoming Webhook URL 방식
// https://api.slack.com/messaging/webhooks

import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyWebhook(webhookUrl: string): Promise<{ ok: boolean }> {
    if (!webhookUrl.startsWith("https://hooks.slack.com/")) return { ok: false };
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "✅ Planner's AI Slack 연결 완료!" }),
    });
    return { ok: res.ok };
}

/**
 * 최신 브리핑(또는 직접 전달한 메시지)을 Slack으로 전송
 */
export async function sendToSlack(memberId: string, text: string): Promise<{ ok: boolean; error?: string }> {
    const admin = createAdminClient();

    const { data: integ } = await admin
        .from("myverse_integrations")
        .select("access_token")
        .eq("member_id", memberId)
        .eq("provider", "slack")
        .eq("status", "active")
        .maybeSingle();

    if (!integ?.access_token) return { ok: false, error: "not_connected" };

    const res = await fetch(integ.access_token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            blocks: [
                {
                    type: "section",
                    text: { type: "mrkdwn", text: text.slice(0, 2900) },
                },
                {
                    type: "context",
                    elements: [{ type: "mrkdwn", text: "🗓️ *Planner's AI* 브리핑" }],
                },
            ],
        }),
    });

    if (!res.ok) return { ok: false, error: `http_${res.status}` };

    await admin
        .from("myverse_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "slack");

    return { ok: true };
}

/**
 * 브리핑 생성 후 Slack으로 자동 전송 (없으면 무시)
 */
export async function dispatchBriefingToSlack(memberId: string, content: string): Promise<void> {
    await sendToSlack(memberId, content).catch(() => {});
}
