"use client";

// 플래너'스 AI 본문 틀 — 사이드 메뉴 숨김 기준 1024px (2026-10-14 "패드 세로에서 메뉴·본문 깨짐")
//   1024px 미만(패드 세로·작은 노트북): 사이드 메뉴·오른쪽 월 막대 숨김 → 왼쪽 위 ☰로 메뉴 열기 (PlannersAppTopBar)
//   1024px 이상: 사이드 메뉴(접기 가능 208px ↔ 56px) + 월 막대 40px
// MyVerse 공용 MainContent(768px 기준)는 그대로 두고 Planner's만 이 틀을 쓴다
import { useSidebarCollapse } from "@/features/myverse/app/SidebarCollapseContext";

export function PlannersMain({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebarCollapse();
    return (
        <main className={`min-w-0 flex-1 [overflow-x:clip] transition-[margin-left] duration-200 lg:mr-10 ${collapsed ? "lg:ml-14" : "lg:ml-52"}`}>
            {children}
        </main>
    );
}
