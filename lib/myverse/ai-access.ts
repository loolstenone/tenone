// 인공지능 기능 이용 권한 SSOT — 플래너'스 AI(=MyVerse 플래너 화면)의 AI 기능은 유료 회원 전용 (2026-10-14 사용자 결정)
//
// 통과: 유료 구독 활성(myverse_users.subscription_status + 만료일 — lib/myverse/subscription.ts) · 직원(member_roles) · 서버 내부 호출(ADMIN_API_KEY/CRON_SECRET)
// 그 외 로그인 회원 → 402 ai_paid_only (화면은 이 코드로 '유료 회원 전용' 안내)
// ❌ 무료 일일 한도 같은 예외를 라우트마다 따로 두지 않는다 — 크레딧은 운영사가 필요할 때 충전하므로, 쓰는 사람을 여기서 한정한다
// 사용 기록은 myverse_ai_usage(kind)로 남겨 충전 시점을 판단한다 (logAiUsage)
//
// ⚠️ 유료 판매(결제)를 시작하려면 통신판매업 신고·전자상거래법 표시·약관·청약철회 안내가 먼저 (CLAUDE.md §0.1·§1.9.4) — 그 전엔 직원이 인트라에서 수동 활성화만

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApiUser, isInternalRequest, isStaffMember } from "@/lib/api-guard";
import { isMyverseSubscriberActive } from "@/lib/myverse/subscription";

export type AiAccess = { kind: "internal" } | { kind: "member"; memberId: string; staff: boolean };

export const AI_PAID_ONLY = "ai_paid_only";

/** 회원이 AI를 쓸 수 있는가 (화면 표시용으로도 쓴다) */
export async function hasAiAccess(memberId: string): Promise<boolean> {
    const admin = createAdminClient();
    if (await isStaffMember(admin, memberId)) return true;
    const { data } = await admin
        .from("myverse_users")
        .select("subscription_status, subscription_expires_at")
        .eq("member_id", memberId)
        .maybeSingle();
    return isMyverseSubscriberActive(data);
}

/** AI 라우트 첫 줄에서 호출 — NextResponse면 그대로 return */
export async function requireAiAccess(request: Request): Promise<AiAccess | NextResponse> {
    const req = request as NextRequest; // 라우트 핸들러는 런타임에 NextRequest를 받는다
    if (isInternalRequest(req)) return { kind: "internal" };
    const u = await getApiUser(req);
    if (!u) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!u.memberId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const admin = createAdminClient();
    const staff = await isStaffMember(admin, u.memberId);
    if (!staff) {
        const { data } = await admin
            .from("myverse_users")
            .select("subscription_status, subscription_expires_at")
            .eq("member_id", u.memberId)
            .maybeSingle();
        if (!isMyverseSubscriberActive(data)) {
            return NextResponse.json(
                { error: AI_PAID_ONLY, message: "인공지능 기능은 유료 회원 전용입니다." },
                { status: 402 },
            );
        }
    }
    return { kind: "member", memberId: u.memberId, staff };
}

/** requireAiAccess 결과가 거절 응답인가 */
export function isAiDenied(x: AiAccess | NextResponse): x is NextResponse {
    return x instanceof NextResponse;
}

/** AI 호출 1건 기록 (실패해도 본 기능은 계속) */
export async function logAiUsage(access: AiAccess, kind: string): Promise<void> {
    if (access.kind !== "member") return;
    try {
        await createAdminClient().from("myverse_ai_usage").insert({ member_id: access.memberId, kind, used_at: new Date().toISOString() });
    } catch (e) {
        console.error("[ai-usage] 기록 실패", kind, e);
    }
}
