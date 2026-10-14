import { permanentRedirect } from "next/navigation";

// 2026-10-14 몰 개편 — 플래너는 플래너'스 PAD로 합침
export default function Page() {
    permanentRedirect(`/planners/pad?c=${encodeURIComponent("연간 플래너")}`);
}
