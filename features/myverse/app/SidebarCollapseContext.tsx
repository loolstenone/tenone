"use client";

// 사이드바 접힘 상태 SSOT — localStorage 영속화
// 토글 시 AppSideNav 폭 + MainContent 좌측 여백이 함께 반응한다.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SidebarCollapseCtx {
    collapsed: boolean;
    toggle: () => void;
}

const Ctx = createContext<SidebarCollapseCtx>({ collapsed: false, toggle: () => {} });

const STORAGE_KEY = "myverse_sidebar_collapsed";

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
    // SSR 첫 렌더 = false. 클라이언트 첫 렌더 = layout.tsx의 인라인 스크립트가 이미 추가한
    // `myverse-sidebar-collapsed` HTML 클래스에서 동기적으로 읽어 일치시킨다.
    // → 사이드바 접힌 상태로 첫 페인트 → 라벨 큰 글씨 깜빡임 제거.
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof document === "undefined") return false;
        return document.documentElement.classList.contains("myverse-sidebar-collapsed");
    });

    const toggle = () => {
        setCollapsed(prev => {
            const next = !prev;
            try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
            // <html> 클래스도 즉시 동기화 (다음 페이지 진입 깜빡임 방지)
            if (typeof document !== "undefined") {
                document.documentElement.classList.toggle("myverse-sidebar-collapsed", next);
            }
            return next;
        });
    };

    // SSR/client 초기값이 다를 수 있어 hydration 직후 한 번 더 동기화
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) === "true";
            if (stored !== collapsed) setCollapsed(stored);
            document.documentElement.classList.toggle("myverse-sidebar-collapsed", stored);
        } catch { /* private mode */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Ctx.Provider value={{ collapsed, toggle }}>{children}</Ctx.Provider>;
}

export const useSidebarCollapse = () => useContext(Ctx);
