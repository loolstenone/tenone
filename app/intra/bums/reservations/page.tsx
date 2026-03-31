"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 예약 관리 → Universe 예약/이벤트로 통합 */
export default function BumsReservationsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/intra/universe/bookings");
    }, [router]);
    return null;
}
