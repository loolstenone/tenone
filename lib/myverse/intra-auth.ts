// 인트라 staff 권한 체크 — member_roles SSOT + tenone.biz 도메인 fallback
//
// CLAUDE.md 1.6: member_roles(role, is_active)가 SSOT.
// 단, 마스터 계정(lools@tenone.biz)이나 직원이 member_roles row 없이 운영되는 경우를 위해
// @tenone.biz 도메인 이메일도 staff로 인정.

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const STAFF_ROLES = new Set(["staff", "manager", "admin", "super_admin", "superadmin"]);

export async function requireIntraStaff(): Promise<{ ok: true; memberId: string } | { ok: false; status: number }> {
    try {
        const sb = await createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { ok: false, status: 401 };

        const admin = createAdminClient();
        const { data: member } = await admin
            .from("members")
            .select("id, email, roles")
            .eq("auth_id", user.id)
            .maybeSingle();

        if (!member) return { ok: false, status: 403 };

        // 1) tenone.biz 이메일
        if (typeof member.email === "string" && member.email.endsWith("@tenone.biz")) {
            return { ok: true, memberId: member.id as string };
        }
        // 2) 레거시 members.roles 배열
        const legacyRoles = (member.roles ?? []) as string[];
        if (legacyRoles.some(r => STAFF_ROLES.has(r))) {
            return { ok: true, memberId: member.id as string };
        }
        // 3) member_roles 테이블 (SSOT) — 별도 쿼리
        const { data: rolesRows } = await admin
            .from("member_roles")
            .select("role, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true);
        if ((rolesRows ?? []).some(r => STAFF_ROLES.has(r.role as string))) {
            return { ok: true, memberId: member.id as string };
        }
        return { ok: false, status: 403 };
    } catch {
        return { ok: false, status: 401 };
    }
}
