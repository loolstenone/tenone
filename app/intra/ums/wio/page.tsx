import { redirect } from "next/navigation";

/** WIO → 테넌트 (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/ums/wio/tenants");
}
