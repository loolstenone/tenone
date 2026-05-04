// Planner's Planner AI — 알림 발송 (이메일 + Web Push)

import { Resend } from "resend";
import { buildFromHeader, DEFAULT_SENDERS } from "@/lib/email/senders";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type BriefingType = "morning" | "midday" | "evening";

const TYPE_LABEL: Record<BriefingType, string> = {
    morning: "아침 브리핑",
    midday: "중간 점검",
    evening: "저녁 정리",
};
const TYPE_COLOR: Record<BriefingType, string> = {
    morning: "#F59E0B",
    midday: "#10B981",
    evening: "#6366F1",
};

/**
 * 브리핑 이메일 발송
 */
export async function sendBriefingEmail(params: {
    memberId: string;
    email: string;
    name?: string | null;
    type: BriefingType;
    content: string;
    date: string;
}): Promise<boolean> {
    if (!resend) return false;

    const { email, name, type, content, date } = params;
    const subject = `[PP AI] 오늘의 ${TYPE_LABEL[type]} · ${date}`;

    const html = renderBriefingHtml({ name, type, content, date });

    try {
        await resend.emails.send({
            from: buildFromHeader(DEFAULT_SENDERS.noreply, "Planner's Planner AI"),
            to: email,
            subject,
            html,
            replyTo: "lools@tenone.biz",
        });
        return true;
    } catch (e) {
        console.error("briefing email failed", e);
        return false;
    }
}

function renderBriefingHtml({ name, type, content, date }: { name?: string | null; type: BriefingType; content: string; date: string }): string {
    const heading = `오늘의 ${TYPE_LABEL[type]}`;
    const color = TYPE_COLOR[type];
    const greeting = name ? `${name}님,` : "";

    const htmlContent = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />");

    return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8" /><title>${heading}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;background:#FAFAF7;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 24px;">
  <tr><td>
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${color};margin:0 0 8px;">
      Planner's Planner AI · ${date}
    </p>
    <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.3;color:#111827;margin:0 0 8px;">
      ${heading}
    </h1>
    ${greeting ? `<p style="font-size:13px;color:#6B7280;margin:0 0 24px;">${greeting}</p>` : ""}
    <div style="background:white;border:1px solid #E5E7EB;border-radius:12px;padding:24px;color:#1F2937;font-size:14px;line-height:1.8;">
      ${htmlContent}
    </div>
    <p style="margin-top:24px;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.6;">
      <a href="https://planners.tenone.biz/myverse/app" style="color:#0F766E;text-decoration:none;">앱에서 보기</a>
      &nbsp;·&nbsp;
      <a href="https://planners.tenone.biz/myverse/app/settings" style="color:#6B7280;text-decoration:none;">알림 설정</a>
    </p>
    <p style="margin-top:16px;font-size:10px;color:#D1D5DB;text-align:center;font-style:italic;">
      생각한대로 살지 않으면, 사는대로 생각하게 된다.
    </p>
  </td></tr>
</table>
</body></html>`;
}

/**
 * 브리핑 발송 — 설정에 따라 이메일/푸시 자동 분기
 */
export async function dispatchBriefingNotifications(params: {
    memberId: string;
    briefingDate: string;
    type: BriefingType;
    content: string;
}): Promise<{ email: boolean; push: number }> {
    const { memberId, briefingDate, type, content } = params;
    const admin = createAdminClient();

    const { data: user } = await admin
        .from("myverse_users")
        .select("notify_email_briefing, notify_push_briefing, members!inner(email, name)")
        .eq("member_id", memberId)
        .maybeSingle();

    const result = { email: false, push: 0 };
    if (!user) return result;

    const memberRec = Array.isArray(user.members) ? user.members[0] : user.members;
    const email = (memberRec as { email?: string; name?: string | null })?.email;
    const name = (memberRec as { email?: string; name?: string | null })?.name ?? null;

    if (user.notify_email_briefing && email) {
        result.email = await sendBriefingEmail({
            memberId, email, name, type, content, date: briefingDate,
        });
    }

    if (user.notify_push_briefing) {
        result.push = await sendPushBriefing({ memberId, type, content });
    }

    return result;
}

/**
 * Web Push 발송 (VAPID 키 설정 시)
 */
export async function sendPushBriefing(params: {
    memberId: string;
    type: BriefingType;
    content: string;
}): Promise<number> {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:lools@tenone.biz";

    if (!vapidPublic || !vapidPrivate) return 0;

    const admin = createAdminClient();
    const { data: subs } = await admin
        .from("myverse_push_subscriptions")
        .select("*")
        .eq("member_id", params.memberId);

    if (!subs || subs.length === 0) return 0;

    // webpush 모듈은 런타임에만 require (빌드 의존성 없음)
    let webpush;
    try {
        webpush = (await import("web-push")).default;
    } catch {
        return 0;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const title = TYPE_LABEL[params.type];
    const body = params.content.slice(0, 140);

    let success = 0;
    await Promise.all(
        (subs as Array<{ id: string; endpoint: string; p256dh: string; auth: string }>).map(async (s) => {
            try {
                await webpush.sendNotification(
                    { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                    JSON.stringify({
                        title: `[PP AI] ${title}`,
                        body,
                        url: "/myverse/app/ai-briefing",
                    })
                );
                success++;
                admin.from("myverse_push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", s.id);
            } catch (e) {
                const err = e as { statusCode?: number };
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await admin.from("myverse_push_subscriptions").delete().eq("id", s.id);
                }
            }
        })
    );

    return success;
}
