// Vercel Cron: 매 시간 실행. 각 유저의 설정 시간이 도달하면 브리핑 자동 생성.
// vercel.json에 "schedule": "0 * * * *" 설정 + "crons": [...] 추가 필요.
// 인증: CRON_SECRET 환경변수를 Authorization 헤더로 확인.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBriefing } from "@/lib/myverse/briefing";
import { isMyverseSubscriberActive } from "@/lib/myverse/subscription";

export const maxDuration = 300;

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization") || "";
    const expected = process.env.CRON_SECRET;
    if (!expected || authHeader !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const currentHH = String(now.getUTCHours()).padStart(2, "0");
    const currentHHMM = `${currentHH}:00`;

    // KST 기준 시간 변환 (UTC+9)
    const kstHour = (now.getUTCHours() + 9) % 24;
    const kstHHMM = `${String(kstHour).padStart(2, "0")}:00`;

    // 오늘 날짜 (KST)
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kstNow.toISOString().slice(0, 10);

    // 모닝 트리거 대상 — 시간 필터는 SQL, 만료 검증은 SSOT 헬퍼 (PostgREST .or() 두 번 chain 모호성 회피)
    const { data: morningUsersRaw } = await admin
        .from("myverse_users")
        .select("member_id, ai_morning_time, mode, subscription_status, subscription_expires_at")
        .eq("subscription_status", "active")
        .or(`ai_morning_time.eq.${kstHHMM},ai_morning_time.eq.${currentHHMM}`);
    const morningUsers = (morningUsersRaw ?? []).filter((u) => isMyverseSubscriberActive(u, now));

    // 이브닝 트리거 대상
    const { data: eveningUsersRaw } = await admin
        .from("myverse_users")
        .select("member_id, ai_evening_time, mode, subscription_status, subscription_expires_at")
        .eq("subscription_status", "active")
        .or(`ai_evening_time.eq.${kstHHMM},ai_evening_time.eq.${currentHHMM}`);
    const eveningUsers = (eveningUsersRaw ?? []).filter((u) => isMyverseSubscriberActive(u, now));

    const results = { morning: 0, evening: 0, errors: 0 };

    for (const u of (morningUsers ?? [])) {
        try {
            await generateBriefing(u.member_id, today, "morning");
            results.morning++;
        } catch (e) {
            console.error("morning briefing failed", u.member_id, e);
            results.errors++;
        }
    }

    for (const u of (eveningUsers ?? [])) {
        try {
            await generateBriefing(u.member_id, today, "evening");
            results.evening++;
        } catch (e) {
            console.error("evening briefing failed", u.member_id, e);
            results.errors++;
        }
    }

    return NextResponse.json({ ok: true, ...results, hh: kstHHMM });
}
