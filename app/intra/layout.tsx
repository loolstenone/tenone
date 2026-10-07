import { getIntraViewer } from "@/lib/intra-server-gate";
import { IntraShell } from "@/components/intra/IntraShell";
import { IntraLoginScreen } from "@/components/intra/IntraLoginScreen";

/**
 * 인트라 레이아웃 (Server Component) — 직원에게만 껍데기(메뉴·목차·헤더)를 그린다.
 * 1차: middleware 1b가 비직원 요청을 app/intra-gate(로그인 화면만)로 rewrite → 이 레이아웃은 직원 요청에서만 실행된다.
 *      (같은 라우트에서 조건부 렌더만 하면 메뉴 JS 번들이 비직원에게도 내려간다 — 그래서 라우트를 분리)
 * 2차: 여기서도 서버에서 다시 확인 (middleware 우회·설정 실수 대비).
 * 직원 정의 = lib/api-guard.ts isStaffMember (member_roles) — 이메일·account_type·클라이언트 캐시로 판단하지 않는다.
 */
export const dynamic = "force-dynamic";

export default async function IntraLayout({ children }: { children: React.ReactNode }) {
    const viewer = await getIntraViewer();
    if (viewer !== "staff") return <IntraLoginScreen noAccess={viewer === "signed-in"} />;
    return <IntraShell>{children}</IntraShell>;
}
