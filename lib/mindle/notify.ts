/**
 * Mindle 메신저 알림 유틸리티
 * 트렌드 발견, 콘텐츠 완성, 뉴스레터 발행 등의 이벤트를 메신저로 전달
 */
import type { ActionButton } from "@/types/messenger";

interface MessengerNotifyOptions {
    event: string;
    title: string;
    body: string;
    actions?: ActionButton[];
    metadata?: Record<string, unknown>;
    priority?: "low" | "normal" | "high" | "urgent";
    correlationId?: string;
}

async function notifyMessenger(options: MessengerNotifyOptions): Promise<void> {
    const adminKey = process.env.ADMIN_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!adminKey) {
        console.warn("[mindle/notify] ADMIN_API_KEY 누락, 알림 스킵");
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/api/messenger/service-hook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminKey}`,
            },
            body: JSON.stringify({
                service: "mindle",
                event: options.event,
                title: options.title,
                body: options.body,
                actions: options.actions || [],
                priority: options.priority || "normal",
                correlation_id: options.correlationId,
                metadata: options.metadata,
            }),
        });

        if (!res.ok) {
            console.error("[mindle/notify] Hook 실패:", res.status);
        }
    } catch (e) {
        console.error("[mindle/notify] 오류:", e);
    }
}

export function notifyTrendFound(
    trendCount: number,
    topKeywords: string[],
    correlationId?: string
) {
    return notifyMessenger({
        event: "trend_found",
        title: `새 트렌드 ${trendCount}건 발견`,
        body: `키워드: ${topKeywords.slice(0, 5).join(", ")}`,
        priority: "normal",
        correlationId,
        metadata: { trend_count: trendCount, top_keywords: topKeywords },
        actions: [
            { id: "act_trend_view", label: "확인", type: "navigate", url: "/intra/gravity/briefs", style: "primary" },
            { id: "act_trend_brief", label: "브리프 생성", type: "delegate", delegate_to: "1001", style: "secondary" },
            { id: "act_trend_dismiss", label: "무시", type: "dismiss" },
        ],
    });
}

export function notifyContentReady(
    contentTitle: string,
    channel: string,
    contentId?: string,
    correlationId?: string
) {
    return notifyMessenger({
        event: "content_ready",
        title: `콘텐츠 초안 완성`,
        body: `${contentTitle}\n채널: ${channel}`,
        priority: "high",
        correlationId,
        metadata: { content_title: contentTitle, channel, content_id: contentId },
        actions: [
            { id: "act_content_approve", label: "승인", type: "callback", callback_url: "/api/mindle/content/approve", callback_payload: { content_id: contentId }, style: "primary" },
            { id: "act_content_edit", label: "수정 요청", type: "delegate", delegate_to: "1001", style: "secondary" },
            { id: "act_content_discard", label: "폐기", type: "dismiss", style: "danger" },
        ],
    });
}

export function notifyNewsletterPublished(
    newsletterTitle: string,
    recipientCount: number,
    newsletterUrl?: string
) {
    return notifyMessenger({
        event: "newsletter_published",
        title: `뉴스레터 발행 완료`,
        body: `${newsletterTitle}\n수신자: ${recipientCount}명`,
        priority: "normal",
        metadata: { newsletter_title: newsletterTitle, recipient_count: recipientCount },
        actions: newsletterUrl ? [
            { id: "act_nl_view", label: "확인", type: "navigate", url: newsletterUrl, style: "primary" },
            { id: "act_nl_stats", label: "성과 보기", type: "navigate", url: "/intra/marketing/analytics", style: "secondary" },
        ] : [
            { id: "act_nl_dismiss", label: "확인", type: "dismiss" },
        ],
    });
}
