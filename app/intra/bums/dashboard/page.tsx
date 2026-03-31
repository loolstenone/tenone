"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BumsDashboardRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/intra/universe");
    }, [router]);
    return null;
}
