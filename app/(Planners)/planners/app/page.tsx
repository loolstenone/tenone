// /planners/app — 플래너'스 AI 첫 화면 = 오늘
import { ClientRedirect } from "@/components/ClientRedirect";

export default function Page() {
    return <ClientRedirect to="/planners/app/daily" />;
}
