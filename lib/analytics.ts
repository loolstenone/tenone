// 유니버스 공통 GTM 이벤트 트래킹 헬퍼.
// - GTM 컨테이너가 dataLayer 를 listen 하므로 push 만 하면 됨
// - SSR 안전 (window 체크)
// - 비활성 환경 (env 미설정·intra 페이지) 에선 silent no-op
//
// 사용 예:
//   trackEvent("template_insert", { template_key: "swot", template_label: "SWOT", surface: "daily" });
//   trackEvent("briefing_generate", { kind: "morning", duration_ms: 1234 });
//   trackEvent("pwa_install_prompt", { outcome: "accepted" });
//
// 이벤트명 컨벤션: snake_case · domain_action · params 는 평면 객체.

export interface AnalyticsParams {
    [key: string]: string | number | boolean | null | undefined;
}

// dataLayer 는 components/Analytics.tsx 에서 이미 declare 됨 — 중복 선언하지 않는다.

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
    if (typeof window === "undefined") return;
    if (!window.dataLayer) return;
    // intra 는 Analytics 에서 dataLayer 자체를 만들지 않으므로 자연 차단됨
    const payload: Record<string, unknown> = { event: name };
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined) continue;
        payload[k] = v;
    }
    window.dataLayer.push(payload);
}

/** Planners 브랜드 컨텍스트가 보장된 헬퍼 — brand_id 자동 부착 */
export function trackPlannersEvent(name: string, params: AnalyticsParams = {}): void {
    trackEvent(name, { brand_id: "planners", ...params });
}

// 사전 정의 이벤트 — 타입 안전 + 자동 완성
export const Track = {
    /** 템플릿을 노트에 삽입 */
    templateInsert: (p: { template_key: string; template_label: string; surface: "daily" | "project" }) =>
        trackPlannersEvent("template_insert", p),

    /** AI 브리핑 생성 (아침/저녁) */
    briefingGenerate: (p: { kind: "morning" | "evening" | string; duration_ms?: number; success: boolean }) =>
        trackPlannersEvent("briefing_generate", p),

    /** PWA 설치 다이얼로그 결과 */
    pwaInstallPrompt: (p: { outcome: "accepted" | "dismissed" | "unavailable" }) =>
        trackPlannersEvent("pwa_install_prompt", p),

    /** 누적 미완료 이월 실행 */
    carryOverPending: (p: { count: number; days: number }) =>
        trackPlannersEvent("carry_over_pending", p),

    /** 프로젝트 신규 생성 */
    projectCreate: (p: { has_title: boolean }) =>
        trackPlannersEvent("project_create", p),

    /** Daily 태스크 생성 */
    taskCreate: (p: { has_time: boolean }) =>
        trackPlannersEvent("task_create", p),

    /** 외부 연동 연결 */
    integrationConnect: (p: { provider: "google" | "todoist" | string; success: boolean }) =>
        trackPlannersEvent("integration_connect", p),

    /** Copy-to-AI 사용 */
    copyToAi: (p: { target: "claude" | "chatgpt" | "gemini" | string; surface: string }) =>
        trackPlannersEvent("copy_to_ai", p),

    /** 일반 결제 이벤트 (실 사업 시작 시 활성) */
    purchaseSuccess: (p: { plan: string; amount: number }) =>
        trackPlannersEvent("purchase_success", p),
};
