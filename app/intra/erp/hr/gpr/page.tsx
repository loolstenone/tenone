import { redirect } from "next/navigation";

/** GPR 중복 → ERP > GPR (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/erp/gpr");
}
