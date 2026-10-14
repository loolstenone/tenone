import { ClientRedirect } from "@/components/ClientRedirect";

// AI 브리핑은 오늘 화면의 '오늘의 Top 3 · 저녁 회고'(features/planners/app/DayCoach.tsx)와 겹쳐 뺐다 (2026-10-14 사용자 결정)
// 옛 링크·북마크는 오늘로
export default function PlannersAiBriefingRedirect() {
    return <ClientRedirect to="/planners/app/daily" />;
}
