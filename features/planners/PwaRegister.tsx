"use client";

import { useEffect } from "react";
import { usePwaInstall } from "@/lib/myverse/use-pwa-install";

export function PwaRegister() {
    // beforeinstallprompt 글로벌 캡처를 가장 빨리 초기화 — 사용자가 어떤 페이지에 진입하든 install 가능 상태 추적
    usePwaInstall();

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        if (process.env.NODE_ENV !== "production") return;

        const reg = navigator.serviceWorker.register("/planners-sw.js", {
            scope: "/myverse/",
        });
        reg.catch((err) => console.warn("SW register failed", err));
    }, []);

    return (
        <>
            <link rel="manifest" href="/planners-manifest.json" />
            <meta name="theme-color" content="#0F766E" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="PP AI" />
        </>
    );
}
