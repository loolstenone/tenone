import { permanentRedirect } from "next/navigation";

// 2026-10-14 몰 개편 — 템플릿은 플래너'스 PAD로 합침
export default function Page() {
    permanentRedirect("/planners/pad");
}
