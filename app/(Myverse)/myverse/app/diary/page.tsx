// 일기 — 무끼 통합 (세션 124). /ask?mode=diary 로 redirect.
import { ClientRedirect } from "@/components/ClientRedirect";

export const dynamic = "force-dynamic";

export default function DiaryRedirectPage() {
    return <ClientRedirect to="/myverse/app/ask?mode=diary" />;
}
