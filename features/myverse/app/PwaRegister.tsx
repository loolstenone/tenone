"use client";

import { useEffect } from "react";
import { usePwaInstall } from "@/lib/myverse/use-pwa-install";

export function PwaRegister() {
    usePwaInstall();

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        if (process.env.NODE_ENV !== "production") return;

        const reg = navigator.serviceWorker.register("/myverse-sw.js", {
            scope: "/myverse/",
        });
        reg.catch((err) => console.warn("SW register failed", err));
    }, []);

    return (
        <>
            <link rel="manifest" href="/myverse-manifest.json" />
            <meta name="theme-color" content="#6366F1" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Myverse" />
        </>
    );
}
