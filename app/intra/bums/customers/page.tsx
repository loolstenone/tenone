"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 고객 관리 → Universe 통합 회원으로 통합 */
export default function BumsCustomersRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/intra/universe/members");
    }, [router]);
    return null;
}
