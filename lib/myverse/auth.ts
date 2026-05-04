import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getMemberId(): Promise<string | null> {
    const result = await getMemberIdAndEmail();
    return result?.memberId ?? null;
}

export async function getMemberIdAndEmail(): Promise<{ memberId: string; email: string } | null> {
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
    if (!user?.email) return null;
    const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
    if (!member) return null;
    return { memberId: member.id, email: user.email };
}
