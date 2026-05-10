// 레거시 — /myverse/app/today → /myverse/app/daily 이전 (세션 124)
// "오늘"과 "일간"은 일간으로 통합. 기존 링크/PWA 캐시 호환용 redirect.

import { ClientRedirect } from "@/components/ClientRedirect";

export default function TodayRedirect() {
    return <ClientRedirect to="/myverse/app/daily" />;
}
