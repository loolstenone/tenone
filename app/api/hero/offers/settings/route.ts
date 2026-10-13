/**
 * 인재 — 제안 받기 설정
 * GET  /api/hero/offers/settings  → 본인 설정
 * POST /api/hero/offers/settings  → 저장. 켤 때는 consent=true 필수 (개인정보보호법 제15조 — 동의 시각·버전 기록)
 *   share_traits(선택)를 켤 때는 traitsConsent=true 필수 — 개인 HIT 결과는 본인만, 기업엔 묶음 통계만 (2026-10-13 원칙)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/api-guard";
import { normalizeSettings, SETTINGS_CONSENT_VERSION, TRAITS_CONSENT_VERSION } from "@/lib/hero/offers";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const sb = createAdminClient();
    const [{ data }, { count: resumeCount }, { count: hitCount }] = await Promise.all([
        sb.from("hero_offer_settings").select("*").eq("member_id", auth.memberId).maybeSingle(),
        sb.from("resumes").select("id", { count: "exact", head: true }).eq("member_id", auth.memberId),
        sb.from("hit_a_results").select("id", { count: "exact", head: true }).eq("member_id", auth.memberId),
    ]);
    return NextResponse.json({
        settings: data ? normalizeSettings(data) : null,
        hasResume: (resumeCount ?? 0) > 0,
        hasHitA: (hitCount ?? 0) > 0,
    });
}

export async function POST(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const s = normalizeSettings(body);
    const consent = body?.consent === true;

    if (s.is_open) {
        if (s.job_functions.length === 0) return NextResponse.json({ error: "희망 직무를 하나 이상 골라 주세요." }, { status: 400 });
        if (!s.career_level) return NextResponse.json({ error: "경력 구간을 골라 주세요." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data: prev } = await sb.from("hero_offer_settings").select("consented_at, consent_version, traits_consent_version")
        .eq("member_id", auth.memberId).maybeSingle();
    const alreadyConsented = !!prev?.consented_at && prev.consent_version === SETTINGS_CONSENT_VERSION;
    if (s.is_open && !consent && !alreadyConsented) {
        return NextResponse.json({ error: "제안 받기를 켜려면 개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
    }

    const traitsAlready = prev?.traits_consent_version === TRAITS_CONSENT_VERSION;
    if (s.share_traits && body?.traitsConsent !== true && !traitsAlready) {
        return NextResponse.json({ error: "성향 통계에 포함하려면 동의해 주세요." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error } = await sb.from("hero_offer_settings").upsert({
        member_id: auth.memberId,
        is_open: s.is_open,
        job_functions: s.job_functions,
        industries: s.industries,
        career_level: s.career_level || null,
        work_mode: s.work_mode || null,
        locations: s.locations,
        share_traits: s.share_traits,
        ...(s.share_traits && !traitsAlready ? { traits_consented_at: now, traits_consent_version: TRAITS_CONSENT_VERSION } : {}),
        ...(!s.share_traits ? { traits_consented_at: null, traits_consent_version: null } : {}),
        ...(s.is_open && !alreadyConsented ? { consented_at: now, consent_version: SETTINGS_CONSENT_VERSION } : {}),
        updated_at: now,
    }, { onConflict: "member_id" });
    if (error) {
        console.error("[hero/offers/settings]", error.message);
        return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
