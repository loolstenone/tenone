import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
    if (!(await requireIntra())) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, slug, domain, service_name, plan, max_members, modules } = body;

    if (!name || !slug || !service_name || !plan) {
        return NextResponse.json({ error: "name, slug, service_name, plan are required" }, { status: 400 });
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
        return NextResponse.json({ error: "slug must be lowercase alphanumeric with hyphens only" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
        .from("wio_tenants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
    if (existing) {
        return NextResponse.json({ error: "slug already in use" }, { status: 409 });
    }

    const planLimits: Record<string, number> = {
        free: 5,
        starter: 20,
        pro: 100,
        business: 500,
        enterprise: 9999,
    };

    const { data: tenant, error } = await admin
        .from("wio_tenants")
        .insert({
            name,
            slug,
            domain: domain || null,
            service_name,
            plan,
            max_members: max_members ?? planLimits[plan] ?? 20,
            modules: modules ?? [],
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tenant }, { status: 201 });
}
