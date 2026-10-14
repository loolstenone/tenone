import { redirect } from "next/navigation";

// 알림은 상단 종(유니버스 공통 알림)에서 본다 — MyVerse 소셜 알림 화면은 Planner's에 없음 (2026-10-15 QA)
export default function NotificationsPage() {
    redirect("/planners/app/daily");
}
