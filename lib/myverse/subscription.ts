// Myverse 구독 만료 검증 SSOT
//
// DB의 subscription_status가 'active'여도 subscription_expires_at이 지나면 만료.
// chat/cron/layout/intra/UI 모든 위치에서 이 헬퍼 하나만 호출한다.

export interface MyverseSubscriptionFields {
    subscription_status?: string | null;
    subscription_expires_at?: string | null;
}

export function isMyverseSubscriberActive(u: MyverseSubscriptionFields | null | undefined, now: Date = new Date()): boolean {
    if (!u) return false;
    if (u.subscription_status !== "active") return false;
    if (!u.subscription_expires_at) return true;
    return new Date(u.subscription_expires_at).getTime() > now.getTime();
}

export function effectiveSubscriptionStatus(u: MyverseSubscriptionFields | null | undefined, now: Date = new Date()): string {
    if (!u || !u.subscription_status) return "free";
    if (u.subscription_status === "active" && u.subscription_expires_at && new Date(u.subscription_expires_at).getTime() <= now.getTime()) {
        return "expired";
    }
    return u.subscription_status;
}
