// /myverse/app — 진입 시 오늘 페이지로 자동 이동
import { ClientRedirect } from "@/components/ClientRedirect";

export default function Page() {
    return <ClientRedirect to="/myverse/app/daily" />;
}
