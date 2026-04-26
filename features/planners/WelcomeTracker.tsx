"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackPlanners } from "@/lib/planners/analytics";

export function WelcomeTracker() {
    const params = useSearchParams();
    useEffect(() => {
        if (params.get("welcome") === "1") {
            trackPlanners("planners_subscription_started");
        }
    }, [params]);
    return null;
}
