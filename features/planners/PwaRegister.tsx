"use client";

import { useEffect } from "react";

export function PwaRegister() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        if (process.env.NODE_ENV !== "production") return;

        const reg = navigator.serviceWorker.register("/planners-sw.js", {
            scope: "/planners/",
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
