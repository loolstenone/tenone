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
    const [collapsed, setCollapsed] = useState(false);

    // 마운트 시 localStorage 동기화 (SSR 안전 — 초기값은 항상 false)
    useEffect(() => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === "true") setCollapsed(true);
        } catch { /* private mode */ }
    }, []);

    const toggle = () => {
        setCollapsed(prev => {
            const next = !prev;
            try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
            return next;
        });
    };

    return <Ctx.Provider value={{ collapsed, toggle }}>{children}</Ctx.Provider>;
}

export const useSidebarCollapse = () => useContext(Ctx);
