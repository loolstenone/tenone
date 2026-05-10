import { Suspense } from "react";
import { AskMyverseView, type MukkiMode } from "@/features/myverse/app/AskMyverseView";

export const dynamic = "force-dynamic";

export default async function AskPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
    const params = await searchParams;
    const mode: MukkiMode = params.mode === "diary" ? "diary" : params.mode === "coach" ? "coach" : "ask";
    return (
        <Suspense>
            <AskMyverseView initialMode={mode} />
        </Suspense>
    );
}
