import { redirect } from "next/navigation";

/** 뉴스레터 관리 중복 → Universe > 뉴스레터 (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/ums/newsletter/issues");
}
