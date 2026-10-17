import { permanentRedirect } from "next/navigation";

// About 안의 탭으로 합침 (2026-10-17) - Universe = 세계관 철학 · Brands = 세계관 안의 브랜드 · History = 실행해 온 이야기
export default function Page() {
    permanentRedirect("/about?tab=universe");
}
