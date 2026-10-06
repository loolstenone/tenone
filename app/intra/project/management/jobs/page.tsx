import { redirect } from "next/navigation";

/** Job 관리 중복 → ERP > 프로젝트 > Job 관리 (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/project/jobs");
}
