"use client";

import { usePathname } from "next/navigation";
import { MyverseHeader } from "@/features/myverse/app/MyverseHeader";
import { MyverseFooter } from "@/features/myverse/app/MyverseFooter";

export function MyverseChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const isAppShell =
        pathname.startsWith("/myverse/app") ||
        pathname.startsWith("/myverse/purchase") ||
        pathname.startsWith("/myverse/canvas"); // embed 전용 라우트 — header/footer 없이 렌더

    if (isAppShell) {
        return <>{children}</>;
    }

    return (
        <>
            <MyverseHeader />
            <main className="flex-1 pt-14">{children}</main>
            <MyverseFooter />
        </>
    );
}
