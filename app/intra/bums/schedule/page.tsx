"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 전체 일정 → Townity 전체 일정으로 통합 */
export default function BumsScheduleRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/intra/comm/calendar");
    }, [router]);
    return null;
}
