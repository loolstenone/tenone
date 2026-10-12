import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/api-guard';
import { HIT_A_CORE_MODULES, HIT_A_UF_MODULE } from '@/lib/hit/a-modules';

/**
 * GET /api/hit/a/questions
 * HIT A 전체 문항 (likert7, question_index 오름차순)
 *   UF 기저요인(base) + personality_type + behavior_type + character_core + aptitude_core
 * HIT 검사는 회원 전용 (2026-10-12) — 로그인 필수
 */
export async function GET(req: NextRequest) {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const sb = createAdminClient();
    const { data, error } = await sb
        .from('hit_questions')
        .select('id, module, question_index, question_text, sub_domain, reverse_scored, scoring_key')
        .eq('test_type', 'A')
        .in('module', [HIT_A_UF_MODULE, ...HIT_A_CORE_MODULES])
        .order('module')
        .order('question_index');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data ?? [] });
}
