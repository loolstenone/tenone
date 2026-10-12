import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getHitSession } from '@/lib/supabase/hit';
import { HIT_A_CORE_MODULES, HIT_A_UF_MODULE } from '@/lib/hit/a-modules';

/**
 * GET /api/hit/a/questions?s={sessionToken}
 * HIT A 문항 (likert7, question_index 오름차순)
 *   - 공통 4모듈: personality_type + behavior_type + character_core + aptitude_core
 *   - 회원 세션만 UF 기저요인(base) 추가 (2026-10-12 — 비회원 결과는 링크로 열려 가정·경제 응답을 두지 않는다)
 */
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('s');
    const session = token ? await getHitSession(token) : null;
    const modules: string[] = session?.member_id ? [HIT_A_UF_MODULE, ...HIT_A_CORE_MODULES] : [...HIT_A_CORE_MODULES];

    const sb = createAdminClient();
    const { data, error } = await sb
        .from('hit_questions')
        .select('id, module, question_index, question_text, sub_domain, reverse_scored, scoring_key')
        .eq('test_type', 'A')
        .in('module', modules)
        .order('module')
        .order('question_index');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data ?? [] });
}
