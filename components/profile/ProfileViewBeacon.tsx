"use client";

import { useEffect } from "react";

/** 공개 프로필 방문 1회 집계 — 화면에는 아무것도 그리지 않는다 (/api/profile/view) */
export function ProfileViewBeacon({ handle, scope = "universe" }: { handle: string; scope?: string }) {
    useEffect(() => {
        fetch("/api/profile/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle, scope }),
            keepalive: true,
        }).catch(() => { /* 집계 실패는 화면에 영향 없음 */ });
    }, [handle, scope]);
    return null;
}
