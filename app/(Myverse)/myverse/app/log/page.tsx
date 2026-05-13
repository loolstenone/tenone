// /myverse/app/log — 구 URL 호환 리다이렉트 → /myverse/app/capture
import { ClientRedirect } from "@/components/ClientRedirect";

export default function LogRedirectPage() {
    return <ClientRedirect to="/myverse/app/capture" />;
}
