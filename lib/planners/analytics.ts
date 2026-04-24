declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

export function trackPlanners(event: string, params: Record<string, unknown> = {}) {
    if (typeof window === "undefined") return;
    if (!window.dataLayer) return;
    window.dataLayer.push({
        event,
        brand_id: "planners",
        ...params,
    });
}
