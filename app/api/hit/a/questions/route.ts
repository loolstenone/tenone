import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/hit/a/questions
 * HIT A 전체 문항 반환 (personality_type + behavior_type + character_core + aptitude_core)
 * 모두 likert7 (7점 척도), question_index 오름차순
 */
export async function GET() {
    const sb = createAdminClient();

    const { data, error } = await sb
        .from('hit_questions')
        .select('id, module, question_index, question_text, sub_domain, reverse_scored, scoring_key')
        .eq('test_type', 'A')
        .in('module', ['personality_type', 'behavior_type', 'character_core', 'aptitude_core'])
        .order('module')
        .order('question_index');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data ?? [] });
}
