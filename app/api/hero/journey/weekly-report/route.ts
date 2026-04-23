/**
 * POST /api/hero/journey/weekly-report
 *
 * 전체 HeRo 활성 회원에게 주간 리포트 이메일 발송.
 * 인증: ADMIN_API_KEY 헤더 필요.
 *
 * 활성 회원 기준: 최근 30일 내 hero_daily_checkins · hero_goals · hero_matches 중 하나라도 있는 members
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import {
    renderHeroWeeklyReportHtml,
    heroWeeklySubject,
    type HeroWeeklyReportProps,
} from "@/lib/email/hero-weekly-report";
import { buildFromHeader, DEFAULT_SENDERS } from "@/lib/email/senders";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sb = createAdminClient();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // 최근 30일 내 활동한 회원 ID 수집
        const [checkinIds, goalIds, matchIds] = await Promise.all([
            sb.from("hero_daily_checkins")
                .select("member_id")
                .gte("checkin_date", thirtyDaysAgo.slice(0, 10)),
            sb.from("hero_goals")
                .select("member_id")
                .gte("created_at", thirtyDaysAgo),
            sb.from("hero_matches")
                .select("profile_member_id")
                .gte("created_at", thirtyDaysAgo),
        ]);

        const activeIds = Array.from(new Set([
            ...(checkinIds.data ?? []).map((r) => r.member_id),
            ...(goalIds.data ?? []).map((r) => r.member_id),
            ...(matchIds.data ?? []).map((r) => r.profile_member_id),
        ].filter(Boolean)));

        if (activeIds.length === 0) {
            return NextResponse.json({ sent: 0, skipped: 0, message: "활성 회원 없음" });
        }

        // 회원 이메일·이름 조회
        const { data: members, error: memberErr } = await sb
            .from("members")
            .select("id, email, name")
            .in("id", activeIds);

        if (memberErr) throw new Error(memberErr.message);

        let sent = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const member of members ?? []) {
            if (!member.email) { skipped++; continue; }

            try {
                // 병렬로 주간 통계 수집
                const [
                    streakRes,
                    checkinCountRes,
                    ucRes,
                    matchCountRes,
                    goalCountRes,
                    stageRes,
                ] = await Promise.all([
                    sb.rpc("hero_streak", { _member_id: member.id }),
                    sb.from("hero_daily_checkins")
                        .select("id", { count: "exact", head: true })
                        .eq("member_id", member.id)
                        .gte("checkin_date", sevenDaysAgo.slice(0, 10)),
                    sb.from("uc_transactions")
                        .select("amount")
                        .eq("member_id", member.id)
                        .eq("brand_id", "hero")
                        .eq("transaction_type", "earn")
                        .gte("created_at", sevenDaysAgo),
                    sb.from("hero_matches")
                        .select("id", { count: "exact", head: true })
                        .eq("profile_member_id", member.id)
                        .gte("created_at", sevenDaysAgo),
                    sb.from("hero_goals")
                        .select("id", { count: "exact", head: true })
                        .eq("member_id", member.id)
                        .eq("status", "active"),
                    sb.rpc("hero_journey_stage", { _member_id: member.id }).single(),
                ]);

                const streak = (streakRes.data as number) ?? 0;
                const weeklyCheckins = checkinCountRes.count ?? 0;
                const weeklyUC = (ucRes.data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);
                const newMatches = matchCountRes.count ?? 0;
                const activeGoals = goalCountRes.count ?? 0;

                // HIT 미완료 감지
                const stage = stageRes.data as { has_hit_a: boolean; has_hit_b: boolean } | null;
                let missingHIT: HeroWeeklyReportProps["missingHIT"] = null;
                if (stage) {
                    if (!stage.has_hit_a && !stage.has_hit_b) missingHIT = "both";
                    else if (!stage.has_hit_a) missingHIT = "a";
                    else if (!stage.has_hit_b) missingHIT = "b";
                }

                const props: HeroWeeklyReportProps = {
                    name: member.name ?? "헤로",
                    streak,
                    weeklyCheckins,
                    weeklyUC,
                    newMatches,
                    activeGoals,
                    missingHIT,
                    journeyUrl: "https://hero.ne.kr/hero/journey",
                };

                const subject = heroWeeklySubject(props.name, streak, newMatches);
                const html = renderHeroWeeklyReportHtml(props);

                await resend.emails.send({
                    from: buildFromHeader(DEFAULT_SENDERS.news, "HeRo"),
                    to: member.email,
                    subject,
                    html,
                });

                sent++;
            } catch (e) {
                errors.push(`${member.email}: ${e instanceof Error ? e.message : String(e)}`);
                skipped++;
            }
        }

        return NextResponse.json({
            sent,
            skipped,
            total: members?.length ?? 0,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        console.error("[hero/weekly-report]", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
