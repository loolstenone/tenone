"use client";

import { usePathname } from "next/navigation";
import { PlannersHeader } from "@/features/myverse/planner/PlannersHeader";
import { PlannersFooter } from "@/features/myverse/planner/PlannersFooter";

export function PlannersChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const isAppShell =
        pathname.startsWith("/myverse/app") ||
        pathname.startsWith("/myverse/onboarding") ||
        pathname.startsWith("/myverse/purchase") ||
        pathname.startsWith("/myverse/canvas"); // embed 전용 라우트 — header/footer 없이 렌더

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
