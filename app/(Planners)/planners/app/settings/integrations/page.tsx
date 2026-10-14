import { ClientRedirect } from "@/components/ClientRedirect";

// 외부 연결은 설정 › 연동 탭 하나로 (내 AI 연결 + 캘린더·메일·Todoist·Notion·Slack·iCal). 따로 있던 이 화면은 탭에 없어 찾을 수 없었다 (2026-10-14)
export default function PlannersIntegrationsRedirect() {
    return <ClientRedirect to="/planners/app/settings/tech" />;
}
