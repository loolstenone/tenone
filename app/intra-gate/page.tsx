import type { Metadata } from "next";
import { getIntraViewer } from "@/lib/intra-server-gate";
import { IntraLoginScreen } from "@/components/intra/IntraLoginScreen";

/**
 * 인트라 게이트 — middleware 1b가 비직원의 모든 인트라 요청을 여기로 rewrite한다 (주소창은 원래 주소 유지).
 * app/intra/ 밖에 둔 이유: 인트라 레이아웃(메뉴·목차·헤더)의 HTML·JS가 비직원에게 아예 내려가지 않게 (기업 보안).
 * ⚠️ 이 라우트에서 인트라 메뉴·사이드바 관련 모듈을 import하지 않는다.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ten:One™ Intra", robots: { index: false, follow: false } };

export default async function IntraGatePage() {
    const viewer = await getIntraViewer();
    return <IntraLoginScreen noAccess={viewer === "signed-in"} />;
}
