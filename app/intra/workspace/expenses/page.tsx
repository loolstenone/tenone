import { redirect } from "next/navigation";
/** 개인 기록은 My로 (2026-10-10 Workspace/My 체계) */
export default function Page() { redirect("/intra/my/expenses"); }
