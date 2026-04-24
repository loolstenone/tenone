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
        .from("planners_payments")
        .select(`
            id, member_id, order_id, amount, status, source, paid_at, created_at,
            members!inner(email)
        `)
        .order("created_at", { ascending: false })
        .limit(500);

    const payments = (data ?? []).map((row: { id: string; member_id: string; order_id: string; amount: number; status: string; source: string; paid_at: string | null; created_at: string; members: { email: string } | { email: string }[] }) => {
        const m = Array.isArray(row.members) ? row.members[0] : row.members;
        return {
            id: row.id,
            member_id: row.member_id,
            email: m?.email ?? "",
            order_id: row.order_id,
            amount: row.amount,
            status: row.status,
            source: row.source,
            paid_at: row.paid_at,
            created_at: row.created_at,
        };
    });

    return NextResponse.json({ payments });
}
