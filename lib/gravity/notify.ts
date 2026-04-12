/**
 * Brand Gravity 에이전트 메신저 알림 유틸리티
 *
 * 2중 알림:
 * 1. agent_messages 테이블 (기존 — Agent Hub 로그)
 * 2. Messenger Service Hook (신규 — 통합 메신저 Action Card)
 */

import type { ActionButton } from "@/types/messenger";

interface NotifyOptions {
    message: string;
    priority?: "high" | "normal" | "low";
    metadata?: Record<string, unknown>;
}

interface MessengerNotifyOptions {
    event: string;
    title: string;
    body: string;
    actions?: ActionButton[];
    metadata?: Record<string, unknown>;
    priority?: "low" | "normal" | "high" | "urgent";
    correlationId?: string;
}

// ── 기본 알림 (agent_messages) ──

export async function notifyGravity(options: NotifyOptions): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn("[gravity/notify] 환경 변수 누락, 알림 스킵");
        return;
    }

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/agent_messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceRoleKey}`,
                "apikey": serviceRoleKey,
                "Prefer": "return=minimal",
            },
            body: JSON.stringify({
                from_agent: "gravity",
                to_agent: "user",
                message_type: "notification",
                risk_level: options.priority === "high" ? "yellow" : "green",
                payload: {
                    text: options.message,
                    priority: options.priority || "normal",
                    ...options.metadata,
                },
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("[gravity/notify] agent_messages INSERT 실패:", res.status, text);
        }
    } catch (e) {
        console.error("[gravity/notify] agent_messages 오류:", e);
    }
}

// ── 메신저 Service Hook 알림 (Action Card) ──

async function notifyMessenger(options: MessengerNotifyOptions): Promise<void> {
    const adminKey = process.env.ADMIN_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!adminKey) {
        console.warn("[gravity/notify] ADMIN_API_KEY 누락, 메신저 알림 스킵");
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
                service: "gravity",
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
            const text = await res.text();
            console.error("[gravity/notify] 메신저 Hook 실패:", res.status, text);
        }
    } catch (e) {
        console.error("[gravity/notify] 메신저 Hook 오류:", e);
    }
}

// ── 2중 알림: agent_messages + 메신저 ──

async function notifyBoth(
    agentOpts: NotifyOptions,
    messengerOpts: MessengerNotifyOptions
): Promise<void> {
    await Promise.all([
        notifyGravity(agentOpts),
        notifyMessenger(messengerOpts),
    ]);
}

// ── 편의 함수들 ──

export function notifyPrescanComplete(
    brandName: string,
    marketType: string,
    mentionRate: number,
    productId?: string
) {
    return notifyBoth(
        {
            message: `📊 ${brandName} 사전 진단 완료. 시장 유형: ${marketType}. AI 언급률 ${mentionRate}%.`,
            priority: "high",
            metadata: { event: "prescan_complete", brand_name: brandName, market_type: marketType },
        },
        {
            event: "scan_complete",
            title: `${brandName} 사전 진단 완료`,
            body: `시장 유형: ${marketType}\nAI 언급률: ${mentionRate}%`,
            priority: "high",
            metadata: { brand_name: brandName, market_type: marketType, mention_rate: mentionRate, product_id: productId },
            actions: productId ? [
                { id: "act_prescan_detail", label: "상세 보기", type: "navigate", url: `/intra/gravity/${productId}`, style: "primary" },
                { id: "act_prescan_fullscan", label: "전체 스캔 시작", type: "callback", callback_url: `/api/gravity/scan/run`, callback_payload: { product_id: productId }, style: "secondary" },
                { id: "act_prescan_dismiss", label: "확인", type: "dismiss" },
            ] : [
                { id: "act_prescan_dismiss", label: "확인", type: "dismiss" },
            ],
        }
    );
}

export function notifyPipelineStep(
    brandName: string,
    step: string,
    stepNum: number,
    totalSteps: number,
    ok: boolean,
    correlationId?: string
) {
    const icon = ok ? "✅" : "❌";
    // 파이프라인 스텝은 메신저에는 텍스트만 (Action Card 불필요)
    return notifyBoth(
        {
            message: `⏳ [${stepNum}/${totalSteps}] ${brandName} — ${step} ${icon}`,
            priority: "normal",
            metadata: { event: "pipeline_step", brand_name: brandName, step, ok },
        },
        {
            event: "scan_complete",
            title: `${brandName} 분석 진행 중`,
            body: `[${stepNum}/${totalSteps}] ${step} ${icon}`,
            priority: "normal",
            correlationId,
            metadata: { brand_name: brandName, step, step_num: stepNum, total_steps: totalSteps, ok },
        }
    );
}

export function notifyAnalysisComplete(
    brandName: string,
    gravityScore: number,
    reportUrl?: string,
    productId?: string
) {
    const grade = gravityScore >= 60 ? "A" : gravityScore >= 30 ? "B" : gravityScore >= 10 ? "C" : "D";
    const link = reportUrl ? ` [리포트 보기](${reportUrl})` : "";

    return notifyBoth(
        {
            message: `✅ ${brandName} 분석 완료. Gravity Score: ${gravityScore}/100 (${grade}등급).${link}`,
            priority: "high",
            metadata: { event: "analysis_complete", brand_name: brandName, gravity_score: gravityScore, grade },
        },
        {
            event: "scan_complete",
            title: `${brandName} Gravity 분석 완료`,
            body: `Gravity Score: ${gravityScore}/100 (${grade}등급)`,
            priority: "high",
            metadata: { brand_name: brandName, gravity_score: gravityScore, grade, product_id: productId },
            actions: [
                { id: "act_analysis_report", label: "리포트 보기", type: "navigate", url: reportUrl || `/intra/gravity/${productId}/report`, style: "primary" },
                { id: "act_analysis_brief", label: "콘텐츠 브리프 생성", type: "delegate", delegate_to: "1001", style: "secondary" },
                { id: "act_analysis_dismiss", label: "확인", type: "dismiss" },
            ],
        }
    );
}

export function notifyNewApplication(companyName: string, productName: string) {
    return notifyBoth(
        {
            message: `🔔 새 BG 신청: ${companyName} — ${productName}`,
            priority: "high",
            metadata: { event: "new_application", company_name: companyName, product_name: productName },
        },
        {
            event: "scan_complete",
            title: `새 Brand Gravity 신청`,
            body: `${companyName} — ${productName}`,
            priority: "urgent",
            metadata: { company_name: companyName, product_name: productName },
            actions: [
                { id: "act_apply_clients", label: "클라이언트 관리", type: "navigate", url: "/intra/gravity/clients", style: "primary" },
                { id: "act_apply_dismiss", label: "확인", type: "dismiss" },
            ],
        }
    );
}

export function notifyBriefReady(
    brandName: string,
    briefTitle: string,
    briefId?: string,
    productId?: string,
    correlationId?: string
) {
    return notifyBoth(
        {
            message: `📝 ${brandName} 콘텐츠 브리프 초안 생성: ${briefTitle}`,
            priority: "high",
            metadata: { event: "brief_ready", brand_name: brandName, brief_title: briefTitle },
        },
        {
            event: "brief_ready",
            title: `${brandName} 콘텐츠 브리프 초안`,
            body: briefTitle,
            priority: "high",
            correlationId,
            metadata: { brand_name: brandName, brief_id: briefId, product_id: productId },
            actions: [
                { id: "act_brief_approve", label: "승인", type: "callback", callback_url: `/api/gravity/voice/approve`, callback_payload: { brief_id: briefId, product_id: productId }, style: "primary" },
                { id: "act_brief_edit", label: "수정 요청", type: "delegate", delegate_to: "1001", style: "secondary" },
                { id: "act_brief_discard", label: "폐기", type: "dismiss", style: "danger" },
            ],
        }
    );
}

export function notifyBriefApproved(
    brandName: string,
    briefTitle: string,
    channel?: string,
    productId?: string
) {
    return notifyBoth(
        {
            message: `✅ ${brandName} 브리프 승인 완료: ${briefTitle}${channel ? ` → ${channel} 발행 예정` : ''}`,
            priority: "normal",
            metadata: { event: "brief_approved", brand_name: brandName, brief_title: briefTitle, channel },
        },
        {
            event: "brief_approved",
            title: `${brandName} 브리프 승인 완료`,
            body: `${briefTitle}${channel ? `\n발행 채널: ${channel}` : ''}`,
            priority: "normal",
            metadata: { brand_name: brandName, product_id: productId, channel },
            actions: productId ? [
                { id: "act_approved_view", label: "브리프 보기", type: "navigate", url: `/intra/gravity/${productId}`, style: "primary" },
                { id: "act_approved_dismiss", label: "확인", type: "dismiss" },
            ] : [
                { id: "act_approved_dismiss", label: "확인", type: "dismiss" },
            ],
        }
    );
}

export function notifyScoreChange(
    brandName: string,
    oldScore: number,
    newScore: number,
    productId?: string
) {
    const diff = newScore - oldScore;
    const arrow = diff > 0 ? "📈" : "📉";
    const isSignificant = diff >= 10 || diff <= -10;

    return notifyBoth(
        {
            message: `${arrow} ${brandName} Gravity Score ${oldScore}→${newScore} (${diff > 0 ? "+" : ""}${diff}).`,
            priority: isSignificant ? "high" : "normal",
            metadata: { event: "score_change", brand_name: brandName, old_score: oldScore, new_score: newScore },
        },
        {
            event: "competitor_alert",
            title: `${brandName} 점수 변동`,
            body: `${oldScore} → ${newScore} (${diff > 0 ? "+" : ""}${diff})`,
            priority: isSignificant ? "high" : "normal",
            metadata: { brand_name: brandName, old_score: oldScore, new_score: newScore, diff, product_id: productId },
            actions: productId ? [
                { id: "act_score_detail", label: "상세 보기", type: "navigate", url: `/intra/gravity/${productId}`, style: "primary" },
                { id: "act_score_rescan", label: "재스캔", type: "callback", callback_url: `/api/gravity/scan/run`, callback_payload: { product_id: productId }, style: "secondary" },
            ] : [],
        }
    );
}
