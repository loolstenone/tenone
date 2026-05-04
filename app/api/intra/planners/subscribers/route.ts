import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireIntra(): Promise<boolean> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: member } = await supabase.from("members").select("id").eq("email", user.email!).maybeSingle();
    if (!member) return false;
    const { data: roles } = await supabase
        .from("member_roles")
        .select("role")
        .eq("user_id", member.id)
        .eq("is_active", true);
    return (roles ?? []).some((r: { role: string }) => ["staff", "manager", "super_admin"].includes(r.role));
}

export async function GET() {
    if (!(await requireIntra())) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_users")
        .select(`
            member_id,
            mode,
            subscription_status,
            subscription_expires_at,
            is_pdf_buyer,
            created_at,
            members!inner(email, name)
        `)
        .order("created_at", { ascending: false })
        .limit(500);

    const subscribers = (data ?? []).map((row: { member_id: string; mode: string; subscription_status: string; subscription_expires_at: string | null; is_pdf_buyer: boolean; created_at: string; members: { email: string; name: string | null } | { email: string; name: string | null }[] }) => {
        const m = Array.isArray(row.members) ? row.members[0] : row.members;
        return {
            member_id: row.member_id,
            email: m?.email ?? "",
            name: m?.name ?? null,
            mode: row.mode,
            subscription_status: row.subscription_status,
            subscription_expires_at: row.subscription_expires_at,
            is_pdf_buyer: row.is_pdf_buyer,
            created_at: row.created_at,
        };
    });

    return NextResponse.json({ subscribers });
}
