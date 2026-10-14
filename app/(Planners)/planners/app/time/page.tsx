import { ClientRedirect } from "@/components/ClientRedirect";

// 시간 기록(MyVerse '시간 인텔리전스' — 운동·이동·여행 등 9 도메인 개인 기록)은 Planner's 플래너 기능이 아니라서 뺐다 (2026-10-14)
// 옛 링크·북마크는 오늘 화면으로 (server redirect 대신 ClientRedirect — 앱 레이아웃과 같은 이유)
export default function PlannersTimeRedirect() {
    return <ClientRedirect to="/planners/app/daily" />;
}
