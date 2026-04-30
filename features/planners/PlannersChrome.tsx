"use client";

import { usePathname } from "next/navigation";
import { PlannersHeader } from "@/features/planners/PlannersHeader";
import { PlannersFooter } from "@/features/planners/PlannersFooter";

export function PlannersChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const isAppShell =
        pathname.startsWith("/planners/app") ||
        pathname.startsWith("/planners/onboarding") ||
        pathname.startsWith("/planners/purchase") ||
        pathname.startsWith("/planners/canvas"); // embed 전용 라우트 — header/footer 없이 렌더

    if (isAppShell) {
        return <>{children}</>;
    }

    return (
        <>
            <PlannersHeader />
            <main className="flex-1 pt-14">{children}</main>
            <PlannersFooter />
        </>
    );
}
