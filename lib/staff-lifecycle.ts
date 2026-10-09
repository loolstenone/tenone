/**
 * 직원 입사 · 첫 로그인 · 퇴사 (서버 전용, 2026-10-10)
 *   입사: 계정 초대(비밀번호는 본인이 설정) + 직원 정보 + 권한 묶음 → 상태 invited
 *   첫 로그인: 인사 처리 안내 확인 + 보안 서약 → 상태 active (app/intra/layout.tsx가 그 전까지 StaffWelcome만 보여준다)
 *   퇴사: member_roles 전부 회수(일반 회원만 남김) → 상태 offboarded · 퇴사일 기록. 인트라는 middleware가 요청마다 member_roles를 보므로 즉시 차단
 *   입사·퇴사 처리는 인사(hr) 직무 또는 마스터만
 */
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { presetOf } from "@/lib/staff-presets";

type Admin = ReturnType<typeof createAdminClient>;

/** 인사(hr) 직무 또는 super_admin — 입사·퇴사 처리 권한 */
export async function canManageStaff(memberId: string | null): Promise<boolean> {
    if (!memberId) return false;
    const { data } = await createAdminClient().from("member_roles").select("role, context")
        .eq("member_id", memberId).eq("is_active", true)
        .or("and(role.eq.super_admin,context.eq.universe),and(role.eq.hr,context.eq.duty)");
    return (data ?? []).length > 0;
}

export interface InviteInput {
    email: string; name: string; employeeId?: string; department?: string; position?: string;
    employmentType?: string; hireDate?: string; preset: string; brands?: string[];
}

async function grantRoles(admin: Admin, memberId: string, grants: { role: string; context: string }[], by: string | null) {
    const { data: existing } = await admin.from("member_roles").select("role, context").eq("member_id", memberId).eq("is_active", true);
    const have = new Set((existing ?? []).map(r => `${r.role}:${r.context}`));
    const rows = grants.filter(g => !have.has(`${g.role}:${g.context}`))
        .map(g => ({ member_id: memberId, role: g.role, context: g.context, is_active: true, granted_by: by }));
    if (rows.length) {
        const { error } = await admin.from("member_roles").insert(rows);
        if (error) throw new Error(`권한 부여 실패: ${error.message}`);
    }
}

export async function inviteStaff(input: InviteInput, by: string | null, origin: string): Promise<{ memberId: string; existingAccount: boolean }> {
    const admin = createAdminClient();
    const preset = presetOf(input.preset);
    if (!preset) throw new Error("권한 묶음을 선택하세요");
    const email = input.email.trim().toLowerCase();

    // 1) 계정 — 이미 Ten:One ID가 있으면 그 계정에 직원 권한만 더한다 (계정은 하나, 헌법 원칙 1)
    let { data: member } = await admin.from("members").select("id, auth_id, name").eq("email", email).maybeSingle();
    let link = `${origin}/intra`;
    const existingAccount = !!member?.auth_id;
    if (!existingAccount) {
        const { data: gen, error } = await admin.auth.admin.generateLink({ type: "invite", email, options: { data: { name: input.name } } });
        if (error || !gen?.user) throw new Error(`초대 링크 생성 실패: ${error?.message ?? "unknown"}`);
        link = `${origin}/auth/confirm?token_hash=${gen.properties.hashed_token}&type=invite&next=/intra`;
        if (member) {
            await admin.from("members").update({ auth_id: gen.user.id }).eq("id", member.id);
        } else {
            const { data: created, error: mErr } = await admin.from("members")
                .insert({ auth_id: gen.user.id, email, name: input.name, account_type: "staff", origin_site: "tenone.biz" })
                .select("id, auth_id, name").single();
            if (mErr || !created) throw new Error(`회원 생성 실패: ${mErr?.message}`);
            member = created;
        }
    }
    const memberId = member!.id as string;

    // 2) 직원 정보 (인사 항목) + 상태
    const { error: pErr } = await admin.from("tenone_staff_profiles").upsert({
        member_id: memberId,
        employee_id: input.employeeId || null, department: input.department || null, position: input.position || null,
        employment_type: input.employmentType || null, hire_date: input.hireDate || null,
        preset: preset.key, status: existingAccount ? "onboarding" : "invited", invited_at: new Date().toISOString(),
        left_at: null, tenant_id: "tenone",
    }, { onConflict: "member_id" });
    if (pErr) throw new Error(`직원 정보 저장 실패: ${pErr.message}`);

    // 3) 권한 묶음 + 담당 브랜드
    await grantRoles(admin, memberId, [
        ...preset.roles,
        ...(input.brands ?? []).map(b => ({ role: b, context: "brand" })),
    ], by);
    await admin.from("members").update({ account_type: "staff" }).eq("id", memberId); // 레거시 화면 호환 (권한 근거 아님)

    // 4) 안내 메일 — 비밀번호는 링크를 연 본인이 정한다 (임시 비밀번호 전달 없음)
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.NEWSLETTER_FROM_EMAIL || "noreply@tenone.biz";
    const { error: mailErr } = await resend.emails.send({
        from: `Ten:One™ <${from}>`,
        to: email,
        subject: "[Ten:One™] 인트라 계정이 준비되었습니다",
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;color:#171717">
<p style="font-size:16px;font-weight:600">${escapeHtml(input.name)}님, 함께하게 되어 반갑습니다.</p>
<p style="font-size:14px;line-height:1.6">Ten:One™ 인트라 계정이 준비되었습니다. 아래 버튼을 눌러 ${existingAccount ? "로그인한 뒤" : "비밀번호를 정하고"} 첫 안내(인사 정보 처리 안내 · 보안 서약)를 확인해 주세요.</p>
<p style="margin:24px 0"><a href="${link}" style="background:#171717;color:#fff;padding:12px 20px;text-decoration:none;font-size:14px">인트라 시작하기</a></p>
<p style="font-size:12px;color:#737373">${existingAccount ? "기존 Ten:One ID로 로그인하면 직원 메뉴가 열립니다." : "링크는 24시간 동안 한 번만 쓸 수 있습니다. 만료되면 인사 담당에게 재발송을 요청하세요."}</p>
</div>`,
    });
    if (mailErr) throw new Error(`메일 발송 실패: ${mailErr.message} — 직원 정보와 권한은 저장됨, 재발송 필요`);
    return { memberId, existingAccount };
}

/** 첫 로그인 확인 — 본인만 (호출부에서 세션 memberId로 호출) */
export async function completeOnboarding(memberId: string, consent: { hr_notice_version: string; pledge_version: string }) {
    const admin = createAdminClient();
    const { data: p } = await admin.from("tenone_staff_profiles").select("status").eq("member_id", memberId).maybeSingle();
    if (!p || !["invited", "onboarding"].includes(p.status)) throw new Error("확인할 입사 절차가 없습니다");
    const { error } = await admin.from("tenone_staff_profiles").update({
        status: "active",
        hr_consent: { ...consent, agreed_at: new Date().toISOString() },
    }).eq("member_id", memberId);
    if (error) throw new Error(error.message);
}

/** 퇴사 — 일반 회원(member@universe)만 남기고 모든 권한 회수 */
export async function offboardStaff(memberId: string, leftAt: string, by: string | null) {
    const admin = createAdminClient();
    const { data: roles } = await admin.from("member_roles").select("id, role, context").eq("member_id", memberId).eq("is_active", true);
    if ((roles ?? []).some(r => r.role === "super_admin" && r.context === "universe")) throw new Error("마스터 계정은 퇴사 처리할 수 없습니다");
    if (memberId === by) throw new Error("본인은 퇴사 처리할 수 없습니다");

    const revoke = (roles ?? []).filter(r => !(r.role === "member" && r.context === "universe")).map(r => r.id);
    if (revoke.length) {
        const { error } = await admin.from("member_roles").update({ is_active: false, expires_at: new Date().toISOString() }).in("id", revoke);
        if (error) throw new Error(`권한 회수 실패: ${error.message}`);
    }
    if (!(roles ?? []).some(r => r.role === "member" && r.context === "universe")) {
        await admin.from("member_roles").insert({ member_id: memberId, role: "member", context: "universe", is_active: true, granted_by: by });
    }
    await admin.from("tenone_staff_profiles").update({ status: "offboarded", left_at: leftAt }).eq("member_id", memberId);
    await admin.from("members").update({ account_type: "member" }).eq("id", memberId);
    return { revoked: revoke.length };
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
