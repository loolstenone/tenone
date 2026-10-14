import { redirect } from "next/navigation";

// 2026-10-14 — 플래너스 PAD › 상품(/intra/ums/planners/pad)으로 합침
export default function Page() {
    redirect("/intra/ums/planners/pad");
}
