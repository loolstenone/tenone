// 코치 — 무끼 통합 (세션 124). /ask?mode=coach 로 redirect.
import { ClientRedirect } from "@/components/ClientRedirect";

export const dynamic = "force-dynamic";

export default function CoachRedirectPage() {
    return <ClientRedirect to="/myverse/app/ask?mode=coach" />;
}
