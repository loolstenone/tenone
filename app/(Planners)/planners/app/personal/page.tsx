import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPlannerUser } from "@/lib/planners/client";
import { IdentityView } from "@/features/planners/IdentityView";

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
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    let mode: "weekly" | "all_in_one" = "weekly";
    if (user) {
        const { data: member } = await supabase
            .from('members')
            .select('id')
            .eq('email', user.email!)
            .maybeSingle();
        if (member) {
            const plannerUser = await getPlannerUser(member.id);
            // custom 모드는 IdentityView 입장에서 all_in_one 기능셋과 동일
            mode = plannerUser?.mode === "all_in_one" || plannerUser?.mode === "custom"
                ? "all_in_one"
                : "weekly";
        }
    }

    return <IdentityView mode={mode} />;
}
