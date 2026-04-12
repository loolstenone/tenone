/**
 * SmarComm 메신저 알림 유틸리티
 * 캠페인 결과, 리드 스코어링, A/B 테스트 결과 등을 메신저로 전달
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
        console.warn("[smarcomm/notify] ADMIN_API_KEY 누락, 알림 스킵");
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
                service: "smarcomm",
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
            console.error("[smarcomm/notify] Hook 실패:", res.status);
        }
    } catch (e) {
        console.error("[smarcomm/notify] 오류:", e);
    }
}

export function notifyCampaignResult(
    campaignName: string,
    metrics: { impressions?: number; clicks?: number; ctr?: number; conversions?: number },
    campaignId?: string
) {
    const ctr = metrics.ctr ? `${(metrics.ctr * 100).toFixed(1)}%` : "N/A";
    return notifyMessenger({
        event: "campaign_result",
        title: `캠페인 성과 보고`,
        body: `${campaignName}\n노출: ${metrics.impressions?.toLocaleString() || "-"} | 클릭: ${metrics.clicks?.toLocaleString() || "-"} | CTR: ${ctr}`,
        priority: "normal",
        metadata: { campaign_name: campaignName, ...metrics, campaign_id: campaignId },
        actions: [
            { id: "act_camp_detail", label: "상세 보기", type: "navigate", url: `/intra/marketing/analytics`, style: "primary" },
            { id: "act_camp_followup", label: "후속 캠페인", type: "delegate", delegate_to: "1001", style: "secondary" },
            { id: "act_camp_dismiss", label: "확인", type: "dismiss" },
        ],
    });
}

export function notifyLeadScored(
    leadCount: number,
    highScoreCount: number
) {
    return notifyMessenger({
        event: "lead_scored",
        title: `리드 스코어링 완료`,
        body: `총 ${leadCount}건 분석\n높은 점수(A등급): ${highScoreCount}건`,
        priority: highScoreCount > 0 ? "high" : "normal",
        metadata: { lead_count: leadCount, high_score_count: highScoreCount },
        actions: [
            { id: "act_lead_list", label: "리드 목록", type: "navigate", url: "/intra/marketing/leads", style: "primary" },
            { id: "act_lead_assign", label: "자동 할당", type: "callback", callback_url: "/api/smarcomm/leads/auto-assign", style: "secondary" },
            { id: "act_lead_dismiss", label: "확인", type: "dismiss" },
        ],
    });
}

export function notifyABTestDone(
    testName: string,
    variantA: { name: string; metric: number },
    variantB: { name: string; metric: number },
    testId?: string
) {
    const winner = variantA.metric >= variantB.metric ? variantA : variantB;
    return notifyMessenger({
        event: "ab_test_done",
        title: `A/B 테스트 결과`,
        body: `${testName}\n${variantA.name}: ${variantA.metric.toFixed(1)}% | ${variantB.name}: ${variantB.metric.toFixed(1)}%\n승자: ${winner.name}`,
        priority: "high",
        metadata: { test_name: testName, variant_a: variantA, variant_b: variantB, test_id: testId },
        actions: [
            { id: "act_ab_a", label: `${variantA.name} 채택`, type: "callback", callback_url: "/api/smarcomm/ab-test/adopt", callback_payload: { test_id: testId, variant: "A" }, style: variantA.metric >= variantB.metric ? "primary" : "secondary" },
            { id: "act_ab_b", label: `${variantB.name} 채택`, type: "callback", callback_url: "/api/smarcomm/ab-test/adopt", callback_payload: { test_id: testId, variant: "B" }, style: variantB.metric > variantA.metric ? "primary" : "secondary" },
            { id: "act_ab_retest", label: "재테스트", type: "dismiss", style: "danger" },
        ],
    });
}
