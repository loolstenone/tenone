/**
 * 써치 라이트(기업) — 인재상 조건 → 인원 + 인재 풀 리포트 (자동, 익명 묶음 통계)
 * POST /api/hero/talent-pool  { companyId, criteria, traits? }
 * 모집단 = '제안 받기'를 켜고 동의한 인재 중 조건에 맞는 사람 (hero_offer_candidates)
 * ⛔ 개인 HIT 결과는 본인만 (2026-10-13 원칙) — 성향은 '원하는 성향의 사람이 어느 정도 있나'만,
 *    그것도 성향 통계에 따로 동의(share_traits)한 사람만 센다. 성향 분포 전체·개인 값은 내보내지 않는다
 * ❌ 성향으로 제안 대상을 거르지 않는다 (응한 사람의 성향이 드러난다)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { COUNT_FLOOR, countLabel, LOCATIONS, normalizeCriteria, WORK_MODES } from "@/lib/hero/offers";
import { candidateIds, companyAccess } from "@/lib/hero/offers-server";
import { GROUP_FLOOR, hasTraitWish, latestHitA, normalizeTraitWish, suppress, traitEstimate } from "@/lib/hero/group-stats";

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
    const traits = normalizeTraitWish(body?.traits);
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

    const settings: { member_id: string; career_level: string | null; work_mode: string | null; locations: string[]; industries: string[]; share_traits: boolean }[] = [];
    for (let i = 0; i < ids.length; i += 200) {
        const { data } = await sb.from("hero_offer_settings")
            .select("member_id, career_level, work_mode, locations, industries, share_traits").in("member_id", ids.slice(i, i + 200));
        settings.push(...((data ?? []) as typeof settings));
    }

    // 성향: 성향 통계에 동의한 사람의 결과만, 원하는 성향을 고른 경우에만
    let traitResult: ReturnType<typeof traitEstimate> | null = null;
    if (hasTraitWish(traits)) {
        const sharers = settings.filter(s => s.share_traits).map(s => s.member_id);
        traitResult = traitEstimate(await latestHitA(sb, sharers), traits);
    }

    return NextResponse.json({
        ...base,
        report: {
            careers: tally(settings.map(s => s.career_level ?? "미입력"), v => v, n),
            workModes: tally(settings.map(s => s.work_mode ?? "any"), v => WORK_MODES.find(w => w.v === v)?.l ?? v, n),
            locations: tally(settings.flatMap(s => (s.locations.length ? s.locations : ["any"])), v => LOCATIONS.find(l => l.v === v)?.l ?? v, n),
            industries: tally(settings.flatMap(s => s.industries), v => v, n).filter(x => !x.hidden).slice(0, 6),
            traits: traitResult,
        },
    });
}
