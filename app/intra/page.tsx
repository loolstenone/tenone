"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntraRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace('/intra/myverse'); }, [router]);
    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
        </div>
    );
}
