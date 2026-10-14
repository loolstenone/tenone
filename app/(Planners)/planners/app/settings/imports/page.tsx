import { ClientRedirect } from "@/components/ClientRedirect";

// MyVerse 개인 OS 설정(차단 사용자·SNS 기록 가져오기)이라 Planner's에는 없다 (2026-10-14) — 설정으로
export default function PlannersSettingsRedirect() {
    return <ClientRedirect to="/planners/app/settings" />;
}
