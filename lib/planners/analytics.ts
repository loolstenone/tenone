// 레거시 호환 — 신규 코드는 `@/lib/analytics` 의 `Track` / `trackPlannersEvent` 사용 권장.
import { trackPlannersEvent } from "@/lib/analytics";

export function trackPlanners(event: string, params: Record<string, string | number | boolean | null | undefined> = {}) {
    trackPlannersEvent(event, params);
}
