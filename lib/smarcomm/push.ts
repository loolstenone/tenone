// SmarComm — Web Push 발송 (VAPID)

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 특정 멤버의 모든 구독에 푸시 발송
 * @returns 성공 발송 수
 */
export async function sendPushToMember(params: {
    memberId: string;
    title: string;
    body: string;
    url?: string;
}): Promise<number> {
    return sendPushToSubscribers({ memberIds: [params.memberId], ...params });
}

/**
 * 여러 멤버(세그먼트)에 푸시 브로드캐스트
 * @returns 성공 발송 수
 */
export async function sendPushToSubscribers(params: {
    memberIds: string[];
    title: string;
    body: string;
    url?: string;
}): Promise<number> {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:lools@tenone.biz";

    if (!vapidPublic || !vapidPrivate) return 0;
    if (!params.memberIds.length) return 0;

    const admin = createAdminClient();
    const { data: subs } = await admin
        .from("smarcomm_push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .in("member_id", params.memberIds);

    if (!subs || subs.length === 0) return 0;

    let webpush;
    try {
        webpush = (await import("web-push")).default;
    } catch {
        return 0;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const payload = JSON.stringify({
        title: params.title,
        body: params.body.slice(0, 200),
        url: params.url || "/smarcomm/dashboard",
    });

    let success = 0;
    await Promise.all(
        (subs as Array<{ id: string; endpoint: string; p256dh: string; auth: string }>).map(async (s) => {
            try {
                await webpush.sendNotification(
                    { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                    payload
                );
                success++;
                admin
                    .from("smarcomm_push_subscriptions")
                    .update({ last_used_at: new Date().toISOString() })
                    .eq("id", s.id);
            } catch (e) {
                const err = e as { statusCode?: number };
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await admin.from("smarcomm_push_subscriptions").delete().eq("id", s.id);
                }
            }
        })
    );

    return success;
}

/**
 * 구독 수 조회 (발송 전 미리보기용)
 */
export async function countPushSubscribers(memberIds: string[]): Promise<number> {
    if (!memberIds.length) return 0;
    const admin = createAdminClient();
    const { count } = await admin
        .from("smarcomm_push_subscriptions")
        .select("id", { count: "exact", head: true })
        .in("member_id", memberIds);
    return count ?? 0;
}
