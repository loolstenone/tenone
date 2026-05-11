"use client";

// 메인 컨텐츠 래퍼 — 사이드바 접힘 상태에 따라 좌측 여백 동적 변경
// 펼침: md:ml-52 (208px) / 접힘: md:ml-14 (56px)

import { useSidebarCollapse } from "./SidebarCollapseContext";

export function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebarCollapse();
    return (
        <main
            className={`flex-1 [overflow-x:clip] min-w-0 pb-14 md:pb-0 md:mr-10 transition-[margin-left] duration-200 ${
                collapsed ? "md:ml-14" : "md:ml-52"
            }`}
        >
            {children}
        </main>
    );
}
