// 인트라 staff 권한 체크 — 직원 판단은 lib/api-guard.ts isStaffMember (member_roles SSOT, 데이터 계약 2조)

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isStaffMember } from "@/lib/api-guard";

export async function requireIntraStaff(): Promise<{ ok: true; memberId: string } | { ok: false; status: number }> {
    try {
        const sb = await createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { ok: false, status: 401 };

        const admin = createAdminClient();
        const { data: member } = await admin
            .from("members")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();

        if (!member) return { ok: false, status: 403 };
        if (await isStaffMember(admin, member.id as string)) {
            return { ok: true, memberId: member.id as string };
        }
        return { ok: false, status: 403 };
    } catch {
        return { ok: false, status: 401 };
    }
}
