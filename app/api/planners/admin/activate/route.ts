// 관리자 전용: PDF 구매자 / 수동 / 베타 테스터 구독 활성화
// super_admin 또는 manager(brand:planners) 권한 필요

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin(): Promise<{ ok: true; memberId: string } | { ok: false; error: string }> {
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
    if (!user) return { ok: false, error: "unauthenticated" };

    const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("email", user.email!)
        .maybeSingle();
    if (!member) return { ok: false, error: "member_not_found" };

    const { data: roles } = await supabase
        .from("member_roles")
        .select("role, context, is_active")
        .eq("user_id", member.id)
        .eq("is_active", true);

    const isAdmin = (roles ?? []).some(
        (r: { role: string; context: string | null }) =>
            r.role === "super_admin" ||
            (r.role === "manager" && (r.context === "brand:planners" || r.context === "global"))
    );
    if (!isAdmin) return { ok: false, error: "forbidden" };

    return { ok: true, memberId: member.id };
}

export async function POST(req: Request) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.error === "forbidden" ? 403 : 401 });

    const body = await req.json();
    const { target_email, source, years } = body;

    if (!target_email || !["pdf_buyer", "manual", "beta"].includes(source)) {
        return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: target } = await admin
        .from("members")
        .select("id")
        .eq("email", target_email)
        .maybeSingle();
    if (!target) return NextResponse.json({ error: "target_not_found" }, { status: 404 });

    if (source === "pdf_buyer") {
        await admin.rpc("planners_activate_pdf_buyer", { _member_id: target.id });
    } else {
        await admin.rpc("planners_activate_subscription", {
            _member_id: target.id,
            _years: years || 1,
            _source: source,
        });
    }

    return NextResponse.json({ ok: true, target_email, source });
}
