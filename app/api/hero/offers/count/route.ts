/**
 * 기업 — 인재상 조건에 맞는 인원 (익명 숫자만)
 * POST /api/hero/offers/count  { companyId, criteria }
 * 5명 미만은 정확한 수를 주지 않는다 (조건을 좁혀 특정인을 알아내는 것 방지)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { COUNT_FLOOR, countLabel, normalizeCriteria } from "@/lib/hero/offers";
import { candidateIds, companyAccess } from "@/lib/hero/offers-server";

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const companyId = typeof body?.companyId === "string" ? body.companyId : "";
    const sb = createAdminClient();
    if (!(await companyAccess(sb, auth.memberId, companyId, auth.isStaff))) {
        return NextResponse.json({ error: "기업 담당자만 볼 수 있습니다." }, { status: 403 });
    }
    const criteria = normalizeCriteria(body?.criteria);
    if (criteria.job_functions.length === 0) return NextResponse.json({ count: null, label: "직무를 골라 주세요" });
    try {
        const n = (await candidateIds(criteria, companyId, sb)).length;
        return NextResponse.json({ count: n >= COUNT_FLOOR ? n : null, label: countLabel(n), enough: n > 0 });
    } catch {
        return NextResponse.json({ error: "인원을 세지 못했습니다." }, { status: 500 });
    }
}
