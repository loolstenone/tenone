/**
 * Brand Gravity 에이전트 메신저 알림 유틸리티
 *
 * agent_messages 테이블에 INSERT하여 그래비티 에이전트가
 * 인트라 메신저를 통해 텐원에게 알림을 보낸다.
 */

interface NotifyOptions {
    message: string;
    priority?: "high" | "normal" | "low";
    metadata?: Record<string, unknown>;
}

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
            console.error("[gravity/notify] INSERT 실패:", res.status, text);
        }
    } catch (e) {
        console.error("[gravity/notify] 오류:", e);
    }
}

// 편의 함수들
export function notifyPrescanComplete(brandName: string, marketType: string, mentionRate: number) {
    return notifyGravity({
        message: `📊 ${brandName} 사전 진단 완료. 시장 유형: ${marketType}. AI 언급률 ${mentionRate}%.`,
        priority: "high",
        metadata: { event: "prescan_complete", brand_name: brandName, market_type: marketType },
    });
}

export function notifyPipelineStep(brandName: string, step: string, stepNum: number, totalSteps: number, ok: boolean) {
    const icon = ok ? "✅" : "❌";
    return notifyGravity({
        message: `⏳ [${stepNum}/${totalSteps}] ${brandName} — ${step} ${icon}`,
        priority: "normal",
        metadata: { event: "pipeline_step", brand_name: brandName, step, ok },
    });
}

export function notifyAnalysisComplete(brandName: string, gravityScore: number, reportUrl?: string) {
    const grade = gravityScore >= 60 ? "A" : gravityScore >= 30 ? "B" : gravityScore >= 10 ? "C" : "D";
    const link = reportUrl ? ` [리포트 보기](${reportUrl})` : "";
    return notifyGravity({
        message: `✅ ${brandName} 분석 완료. Gravity Score: ${gravityScore}/100 (${grade}등급).${link}`,
        priority: "high",
        metadata: { event: "analysis_complete", brand_name: brandName, gravity_score: gravityScore, grade },
    });
}

export function notifyNewApplication(companyName: string, productName: string) {
    return notifyGravity({
        message: `🔔 새 BG 신청: ${companyName} — ${productName}`,
        priority: "high",
        metadata: { event: "new_application", company_name: companyName, product_name: productName },
    });
}

export function notifyScoreChange(brandName: string, oldScore: number, newScore: number) {
    const diff = newScore - oldScore;
    const arrow = diff > 0 ? "📈" : "📉";
    return notifyGravity({
        message: `${arrow} ${brandName} Gravity Score ${oldScore}→${newScore} (${diff > 0 ? "+" : ""}${diff}).`,
        priority: diff >= 10 || diff <= -10 ? "high" : "normal",
        metadata: { event: "score_change", brand_name: brandName, old_score: oldScore, new_score: newScore },
    });
}
