// 레거시 — IndexView는 /today canonical home으로 통합됨 (세션 119 IA)
// 외부 링크 호환을 위해 redirect 유지.

import { ClientRedirect } from "@/components/ClientRedirect";

export default function IndexPage() {
    return <ClientRedirect to="/myverse/app/daily" />;
}
