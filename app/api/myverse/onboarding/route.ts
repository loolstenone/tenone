import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/api-guard";

/**
 * 플래너'스 AI 첫 설정 저장 (MyVerse 앱과 공용 API)
 * 회원 확인은 공통 함수(requireMember)로만 — 2026-10-15 QA:
 *   전엔 회원 정보가 없으면 여기서 직접 만들었다(가입 동의 없이 회원 생성 · origin_site 'myverse.kr')
 *   그리고 이메일이 같은 기존 회원 행의 auth_id를 이 계정으로 바꿔 묶었다(다른 계정에 묶인 행까지 — 데이터 계약 1조 위반)
 *   가입은 ConsentGate(§1.2.0), 브랜드 동의는 BrandJoinGate가 맡는다. members.affiliations도 쓰지 않는다(§1.9.2 — member_brand_joins)
 */
export async function POST(req: NextRequest) {
    const u = await requireMember(req);
    if (u instanceof NextResponse) return u;
    const member = { id: u.memberId };
    const admin = createAdminClient();

    const body = await req.json().catch(() => ({}));
    const {
        mode,
        user_role,
        ai_morning_time,
        ai_evening_time,
        ai_tone,
        vision_statement,
        mission_statement,
    } = body;

    // 1. myverse_users upsert
    const { error: upsertErr } = await admin
        .from('myverse_users')
        .upsert(
            {
                member_id: member.id,
                mode,
                user_role: user_role ?? null,
                ai_morning_time,
                ai_evening_time,
                ai_tone,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'member_id' }
        );
    if (upsertErr) {
        console.error('onboarding myverse_users upsert error', upsertErr);
        return NextResponse.json({ error: 'upsert_failed' }, { status: 500 });
    }

    // 2. myverse_identities upsert (vision/mission만)
    if (vision_statement || mission_statement) {
        const { error: idErr } = await admin
            .from('myverse_identities')
            .upsert(
                {
                    member_id: member.id,
                    vision_statement: vision_statement || null,
                    mission_statement: mission_statement || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'member_id' }
            );
        if (idErr) console.error('onboarding myverse_identities upsert error', idErr);
    }

    return NextResponse.json({ ok: true });
}
