"use client";

import { useAuth } from "@/lib/auth-context";
import { StarfieldPortal } from "./StarfieldPortal";

export function StarfieldWrapper() {
    const { isAuthenticated } = useAuth();
    return <StarfieldPortal isAuthenticated={isAuthenticated} />;
}
