import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    // 인증 확인
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
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // intra 권한 확인 (member_roles 기반)
    const admin = createAdminClient();
    const { data: roles } = await admin
        .from("member_roles")
        .select("role, is_active")
        .eq("member_id", (
            await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle()
        ).data?.id ?? "");

    const PRIVILEGED = new Set(["super_admin", "staff", "manager"]);
    const isPrivileged = roles?.some(r => r.is_active && PRIVILEGED.has(r.role));
    if (!isPrivileged) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { siteId, isOpen } = await req.json();
    if (!siteId || typeof isOpen !== "boolean") {
        return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }

    // admin 클라이언트로 업데이트 (RLS 우회)
    const { error } = await admin
        .from("ums_sites")
        .update({ is_open: isOpen, updated_at: new Date().toISOString() })
        .eq("slug", siteId);

    if (error) {
        console.error("[sites/toggle]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
