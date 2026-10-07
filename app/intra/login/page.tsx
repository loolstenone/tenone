import { redirect } from "next/navigation";

/** 직원이 /intra/login으로 들어오면 대시보드로 (비직원은 middleware가 app/intra-gate로 보낸다) */
export default function IntraLoginRedirect() {
    redirect("/intra");
}
