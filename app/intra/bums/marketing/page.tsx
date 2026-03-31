"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 마케팅 관리 → SmarComm Marketing으로 통합 */
export default function BumsMarketingRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/intra/marketing/campaigns");
    }, [router]);
    return null;
}
