"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackPlanners } from "@/lib/myverse/analytics";

export function WelcomeTracker() {
    const params = useSearchParams();
    useEffect(() => {
        if (params.get("welcome") === "1") {
            trackPlanners("myverse_subscription_started");
        }
    }, [params]);
    return null;
}
