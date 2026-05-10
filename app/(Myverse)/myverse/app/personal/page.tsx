import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMyverseUser } from "@/lib/myverse/client";
import { IdentityView } from "@/features/myverse/planner/IdentityView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default async function IdentityPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    let mode: "weekly" | "all_in_one" = "weekly";
    if (user) {
        const { data: member } = await supabase
            .from("members")
            .select("id")
            .eq("email", user.email!)
            .maybeSingle();
        if (member) {
            const myverseUser = await getMyverseUser(member.id);
            mode = myverseUser?.mode === "all_in_one" || myverseUser?.mode === "custom"
                ? "all_in_one"
                : "weekly";
        }
    }

    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <IdentityView mode={mode} />
        </>
    );
}
