/**
 * 유니버스 공통 사이트 내 알림 — 서버 전용 (service_role)
 * 사용자는 /api/notifications 로 본인 알림만 읽고 읽음 처리한다. 쓰기는 이 헬퍼로만.
 * 알림 = 서비스 안내(공지·제출·답변). 광고성 내용 금지 (정보통신망법 제50조)
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface NotifyInput {
    brandId: string;
    type: string;
    title: string;
    message?: string | null;
    link?: string | null;
}

export async function notify(memberIds: (string | null | undefined)[], n: NotifyInput): Promise<void> {
    const ids = [...new Set(memberIds.filter((x): x is string => !!x))];
    if (!ids.length) return;
    const { error } = await createAdminClient().from("notifications").insert(ids.map(member_id => ({
        tenant_id: "tenone",
        brand_id: n.brandId,
        member_id,
        type: n.type.slice(0, 50),
        title: n.title.slice(0, 200),
        message: n.message ?? null,
        link: n.link ?? null,
        is_read: false,
    })));
    if (error) console.error("[notify]", n.type, error.message);
}

/** 브랜드 운영 담당 — member_roles(role={brand}, context=brand) + super_admin@universe (활성·미만료) → members.id */
export async function brandManagerIds(brandSlug: string): Promise<string[]> {
    const { data } = await createAdminClient().from("member_roles").select("member_id")
        .eq("is_active", true)
        .or(`and(role.eq.${brandSlug},context.eq.brand),and(role.eq.super_admin,context.eq.universe)`)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}
