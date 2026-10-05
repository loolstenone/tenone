import { redirect } from "next/navigation";

/** 연락처 중복 → Marketing > 캠페인 · CRM > 연락처 (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/marketing/crm/people");
}
