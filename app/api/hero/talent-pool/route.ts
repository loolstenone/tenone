/**
 * 써치 라이트(기업) — 인재상 조건 → 인원 + 인재 풀 리포트 (자동, 익명 묶음 통계)
 * POST /api/hero/talent-pool  { companyId, criteria }
 * 모집단 = '제안 받기'를 켜고 동의(제안 알림·익명 통계)한 인재 중 조건에 맞는 사람 (hero_offer_candidates)
 * ❌ 개인 단위 값 없음 · 전체 5명 미만이면 리포트 없음 · 칸 단위 5명 미만은 숨김
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { COUNT_FLOOR, countLabel, LOCATIONS, normalizeCriteria, WORK_MODES } from "@/lib/hero/offers";
import { candidateIds, companyAccess } from "@/lib/hero/offers-server";
import { discShares, GROUP_FLOOR, interestShares, latestHitA, suppress, workBalance } from "@/lib/hero/group-stats";

function tally(values: string[], labelOf: (v: string) => string, total: number) {
    const m = new Map<string, number>();
    for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
    return suppress([...m.entries()]
        .map(([v, count]) => ({ label: labelOf(v), count, pct: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count));
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const companyId = typeof body?.companyId === "string" ? body.companyId : "";
    const sb = createAdminClient();
    if (!(await companyAccess(sb, auth.memberId, companyId, auth.isStaff))) {
        return NextResponse.json({ error: "기업 회원만 볼 수 있습니다." }, { status: 403 });
    }
    const criteria = normalizeCriteria(body?.criteria);
    if (criteria.job_functions.length === 0) return NextResponse.json({ count: null, label: "직무를 골라 주세요", report: null });

    let ids: string[];
    try {
        ids = await candidateIds(criteria, companyId, sb);
    } catch {
        return NextResponse.json({ error: "인원을 세지 못했습니다." }, { status: 500 });
    }
    const n = ids.length;
    const base = { count: n >= COUNT_FLOOR ? n : null, label: countLabel(n), enough: n > 0 };
    if (n < GROUP_FLOOR) return NextResponse.json({ ...base, report: null });

    const settings: { career_level: string | null; work_mode: string | null; locations: string[]; industries: string[] }[] = [];
    for (let i = 0; i < ids.length; i += 200) {
        const { data } = await sb.from("hero_offer_settings").select("career_level, work_mode, locations, industries").in("member_id", ids.slice(i, i + 200));
        settings.push(...((data ?? []) as typeof settings));
    }
    const hit = await latestHitA(sb, ids);
    const tested = hit.length >= GROUP_FLOOR;

    return NextResponse.json({
        ...base,
        report: {
            careers: tally(settings.map(s => s.career_level ?? "미입력"), v => v, n),
            workModes: tally(settings.map(s => s.work_mode ?? "any"), v => WORK_MODES.find(w => w.v === v)?.l ?? v, n),
            locations: tally(settings.flatMap(s => (s.locations.length ? s.locations : ["any"])), v => LOCATIONS.find(l => l.v === v)?.l ?? v, n),
            industries: tally(settings.flatMap(s => s.industries), v => v, n).filter(x => !x.hidden).slice(0, 6),
            hitRate: Math.round((hit.length / n) * 100),
            roles: tested ? suppress(discShares(hit)) : null,
            axes: tested ? workBalance(hit) : null,
            interests: tested ? suppress(interestShares(hit)).filter(x => x.pct > 0 || x.hidden) : null,
        },
    });
}
